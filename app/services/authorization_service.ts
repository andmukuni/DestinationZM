import type User from '#models/user'
import type { UserRole } from '#types/user_roles'
import { BRANCH_REQUIRED_ROLES, requiresBranch } from '#types/user_roles'
import type { PermissionSlug } from '#types/permissions'
import PermissionService from '#services/permission_service'

export default class AuthorizationService {
  static isAdmin(user: User) {
    return user.role === 'admin'
  }

  static can(user: User, permission: PermissionSlug) {
    return PermissionService.can(user, permission)
  }

  static assertCan(user: User, permission: PermissionSlug) {
    if (!this.can(user, permission)) {
      throw new Error('Forbidden')
    }
  }

  static canManageUsers(user: User) {
    return (
      PermissionService.can(user, 'users.view') || PermissionService.can(user, 'users.create')
    )
  }

  static canViewReports(user: User) {
    return PermissionService.can(user, 'reports.view')
  }

  static canManageRoles(user: User) {
    return PermissionService.can(user, 'roles.manage')
  }

  static branchIdFor(user: User): number | null {
    if (user.role === 'admin' || user.role === 'finance' || user.role === 'management' || user.role === 'executive') {
      return null
    }
    return user.branchId
  }

  static requiresBranch(role: UserRole) {
    return requiresBranch(role)
  }

  static hasRequiredBranch(user: User) {
    if (!requiresBranch(user.role as UserRole)) {
      return true
    }
    return user.branchId !== null
  }

  static assertRole(user: User, roles: UserRole[]) {
    if (!roles.includes(user.role as UserRole)) {
      throw new Error('Unauthorized')
    }
  }

  static branchRequiredRoles() {
    return BRANCH_REQUIRED_ROLES
  }
}
