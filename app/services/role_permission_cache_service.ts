import type { UserRole } from '#types/user_roles'
import type { PermissionSlug } from '#types/permissions'
import RedisCacheService from '#services/redis_cache_service'

const PERMISSIONS_VERSION_KEY = 'roles:permissions:version'
const PERMISSIONS_DATA_KEY_PREFIX = 'roles:permissions:v'

export type RolePermissionsMap = Record<UserRole, PermissionSlug[]>

export default class RolePermissionCacheService {
  private static permissionsDataKey(version: number) {
    return `${PERMISSIONS_DATA_KEY_PREFIX}${version}`
  }

  static async getVersion() {
    return RedisCacheService.getNumber(PERMISSIONS_VERSION_KEY, 1)
  }

  static async bumpVersion() {
    return RedisCacheService.incr(PERMISSIONS_VERSION_KEY)
  }

  static async getAll(): Promise<RolePermissionsMap | null> {
    const version = await this.getVersion()
    const cached = await RedisCacheService.get(this.permissionsDataKey(version))

    if (!cached) {
      return null
    }

    return JSON.parse(cached) as RolePermissionsMap
  }

  static async setAll(data: RolePermissionsMap) {
    const version = await this.getVersion()
    await RedisCacheService.set(this.permissionsDataKey(version), JSON.stringify(data))
  }
}
