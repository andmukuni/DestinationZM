import User from '#models/user'
import AuthorizationService from '#services/authorization_service'
import PermissionService from '#services/permission_service'
import { rolePermissionsUpdateValidator } from '#validators/role_permissions_validator'
import {
  MANAGEABLE_ROLES,
  ROLE_LABELS,
  isManageableRole,
  type UserRole,
} from '#types/user_roles'
import { PERMISSION_GROUPS } from '#types/permissions'
import type { HttpContext } from '@adonisjs/core/http'

export default class RolesController {
  async index({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.canManageRoles(user)) {
      return response.forbidden()
    }

    await PermissionService.bootstrap()
    const rolePermissions = await PermissionService.allRolePermissions()

    const userCounts = await User.query()
      .groupBy('role')
      .select('role')
      .count('* as total')

    const countsByRole = Object.fromEntries(
      userCounts.map((row) => [row.role, Number(row.$extras.total)])
    ) as Record<UserRole, number>

    return inertia.render('roles/index', {
      permissionGroups: PERMISSION_GROUPS,
      roles: (Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => ({
        value,
        label,
        userCount: countsByRole[value] ?? 0,
        manageable: isManageableRole(value),
      })),
      rolePermissions,
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.canManageRoles(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(rolePermissionsUpdateValidator)

    for (const role of MANAGEABLE_ROLES) {
      if (!isManageableRole(role)) {
        continue
      }

      await PermissionService.updateRolePermissions(
        role,
        payload.permissions[role as keyof typeof payload.permissions]
      )
    }

    session.flash('success', 'Role permissions updated successfully')
    return response.redirect().toRoute('roles')
  }
}
