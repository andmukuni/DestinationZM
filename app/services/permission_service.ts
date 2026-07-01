import RolePermission from '#models/role_permission'
import User from '#models/user'
import RolePermissionCacheService from '#services/role_permission_cache_service'
import type { UserRole } from '#types/user_roles'
import { USER_ROLES } from '#types/user_roles'
import {
  DEFAULT_ROLE_PERMISSIONS,
  MANAGEABLE_ROLES,
  PERMISSION_SLUGS,
  type PermissionSlug,
} from '#types/permissions'

export default class PermissionService {
  private static cache: Map<UserRole, Set<PermissionSlug>> | null = null

  private static emptyRoleRecord(): Record<UserRole, PermissionSlug[]> {
    return Object.fromEntries(USER_ROLES.map((role) => [role, []])) as unknown as Record<
      UserRole,
      PermissionSlug[]
    >
  }

  private static loadFromRecord(record: Record<UserRole, PermissionSlug[]>) {
    const cache = new Map<UserRole, Set<PermissionSlug>>()
    for (const role of USER_ROLES) {
      const stored = record[role] ?? []
      const permissions =
        stored.length > 0 ? stored : [...(DEFAULT_ROLE_PERMISSIONS[role] ?? [])]
      cache.set(role, new Set(permissions))
    }
    this.cache = cache
  }

  private static loadDefaultCache() {
    this.loadFromRecord({ ...DEFAULT_ROLE_PERMISSIONS })
  }

  private static recordFromCache(): Record<UserRole, PermissionSlug[]> {
    const record = this.emptyRoleRecord()
    for (const role of USER_ROLES) {
      record[role] = this.permissionsForRole(role)
    }
    return record
  }

  private static isMissingTableError(error: unknown) {
    return (
      error instanceof Error &&
      (error.message.includes("doesn't exist") || (error as { code?: string }).code === 'ER_NO_SUCH_TABLE')
    )
  }

  static async bootstrap() {
    if (this.cache) {
      return
    }

    const cached = await RolePermissionCacheService.getAll()
    if (cached) {
      this.loadFromRecord(cached)
      return
    }

    try {
      const [{ $extras }] = await RolePermission.query().count('* as total')
      if (Number($extras.total) === 0) {
        await this.seedDefaults()
        return
      }

      await this.refreshCache()
    } catch (error) {
      if (this.isMissingTableError(error)) {
        this.loadDefaultCache()
        await RolePermissionCacheService.setAll(this.recordFromCache())
        return
      }
      throw error
    }
  }

  static async refreshCache() {
    const rows = await RolePermission.query()
    const record = this.emptyRoleRecord()
    record.admin = [...PERMISSION_SLUGS]

    for (const role of MANAGEABLE_ROLES) {
      const stored = rows.filter((row) => row.role === role).map((row) => row.permission)
      record[role] = stored.length > 0 ? stored : [...DEFAULT_ROLE_PERMISSIONS[role]]
    }

    this.loadFromRecord(record)
    await RolePermissionCacheService.setAll(record)
  }

  static invalidateCache() {
    this.cache = null
  }

  static can(user: User, permission: PermissionSlug) {
    if (user.role === 'admin') {
      return true
    }

    const role = user.role as UserRole
    const permissions = this.cache?.get(role) ?? new Set(DEFAULT_ROLE_PERMISSIONS[role] ?? [])
    return permissions.has(permission)
  }

  static permissionsForRole(role: UserRole): PermissionSlug[] {
    if (role === 'admin') {
      return [...PERMISSION_SLUGS]
    }

    const permissions = this.cache?.get(role)
    if (permissions) {
      return [...permissions]
    }

    return [...(DEFAULT_ROLE_PERMISSIONS[role] ?? [])]
  }

  static permissionsForUser(user: User): PermissionSlug[] {
    return this.permissionsForRole(user.role as UserRole)
  }

  static async allRolePermissions(): Promise<Record<UserRole, PermissionSlug[]>> {
    await this.bootstrap()
    return this.recordFromCache()
  }

  static async seedDefaults(force = false) {
    const existing = await RolePermission.query().first()
    if (existing && !force) {
      await this.refreshCache()
      return
    }

    if (force) {
      await RolePermission.query().delete()
    }

    const rows = MANAGEABLE_ROLES.flatMap((role) =>
      DEFAULT_ROLE_PERMISSIONS[role].map((permission) => ({ role, permission }))
    )

    if (!existing || force) {
      await RolePermission.createMany(rows)
    }

    this.cache = null
    await this.refreshCache()
  }

  static async updateRolePermissions(role: UserRole, permissions: PermissionSlug[]) {
    if (role === 'admin') {
      throw new Error('Administrator permissions cannot be changed')
    }

    const validPermissions = permissions.filter((permission) =>
      PERMISSION_SLUGS.includes(permission)
    )

    await RolePermission.query().where('role', role).delete()

    if (validPermissions.length > 0) {
      await RolePermission.createMany(
        validPermissions.map((permission) => ({ role, permission }))
      )
    }

    this.invalidateCache()
    await RolePermissionCacheService.bumpVersion()
    await this.refreshCache()
  }
}
