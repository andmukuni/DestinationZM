import ClientAccount from '#models/client_account'
import {
  CLIENT_ACCOUNT_ROLE_LABELS,
  CLIENT_ACCOUNT_ROLES,
  type ClientAccountRole,
} from '#types/client_account'

export default class PortalOrganizationUserService {
  /** Organization owner and portal administrators can manage team members. */
  static canManageUsers(role: ClientAccountRole) {
    return role === 'owner' || role === 'admin'
  }

  static assignableRoles(actorRole: ClientAccountRole): ClientAccountRole[] {
    if (actorRole === 'owner') {
      return [...CLIENT_ACCOUNT_ROLES]
    }
    if (actorRole === 'admin') {
      return ['member']
    }
    return []
  }

  static canManageTarget(actor: ClientAccount, target: ClientAccount) {
    if (actor.customerId !== target.customerId) {
      return false
    }
    if (actor.id === target.id && this.canManageUsers(actor.role)) {
      return true
    }
    if (actor.role === 'owner') {
      return true
    }
    if (actor.role === 'admin') {
      return target.role === 'member'
    }
    return false
  }

  static canAssignRole(actorRole: ClientAccountRole, role: ClientAccountRole) {
    return this.assignableRoles(actorRole).includes(role)
  }

  static async listForOrganization(customerId: number) {
    return ClientAccount.query().where('customer_id', customerId).orderBy('full_name', 'asc')
  }

  static async findInOrganization(customerId: number, accountId: number) {
    return ClientAccount.query().where('customer_id', customerId).where('id', accountId).first()
  }

  static async activeOwnerCount(customerId: number) {
    const result = await ClientAccount.query()
      .where('customer_id', customerId)
      .where('role', 'owner')
      .where('is_active', true)
      .count('* as total')

    return Number(result[0]?.$extras.total ?? 0)
  }

  static async assertCanChangeRole(
    actor: ClientAccount,
    target: ClientAccount,
    nextRole: ClientAccountRole
  ) {
    if (!this.canManageTarget(actor, target)) {
      throw new Error('You cannot manage this user.')
    }
    if (!this.canAssignRole(actor.role, nextRole)) {
      throw new Error('You cannot assign that role.')
    }
    if (target.role === 'owner' && nextRole !== 'owner') {
      const owners = await this.activeOwnerCount(actor.customerId)
      if (owners <= 1) {
        throw new Error('Your organization must have at least one active owner.')
      }
    }
  }

  static async assertCanToggleActive(actor: ClientAccount, target: ClientAccount, isActive: boolean) {
    if (!this.canManageTarget(actor, target)) {
      throw new Error('You cannot manage this user.')
    }
    if (actor.id === target.id) {
      throw new Error('You cannot deactivate your own account.')
    }
    if (!isActive && target.role === 'owner') {
      const owners = await this.activeOwnerCount(actor.customerId)
      if (owners <= 1) {
        throw new Error('Your organization must have at least one active owner.')
      }
    }
  }

  static canChangePassword(actor: ClientAccount, target: ClientAccount) {
    if (actor.id === target.id) {
      return actor.role === 'owner' || actor.role === 'admin'
    }

    return this.canManageTarget(actor, target)
  }

  static assertCanChangePassword(actor: ClientAccount, target: ClientAccount) {
    if (!this.canChangePassword(actor, target)) {
      if (actor.id === target.id) {
        throw new Error('You cannot change your password here.')
      }
      throw new Error('You cannot manage this user.')
    }
  }

  static roleLabel(role: ClientAccountRole) {
    return CLIENT_ACCOUNT_ROLE_LABELS[role]
  }
}
