import ClientAccount from '#models/client_account'
import type { ClientAccountRole } from '#types/client_account'
import {
  CONFIRMED_BOOKING_STATUSES,
  DEFAULT_PRIVILEGES_BY_ROLE,
  PORTAL_PRIVILEGE_GROUPS,
  PORTAL_PRIVILEGE_META,
  PORTAL_PRIVILEGE_PRESETS,
  PORTAL_PRIVILEGES,
  type PortalPrivilege,
} from '#types/portal_privileges'

export type PortalPrivilegeGroupPayload = {
  id: string
  label: string
  description: string
  privileges: Array<{
    key: PortalPrivilege
    label: string
    description: string
    enabled: boolean
  }>
}

export default class PortalPrivilegeService {
  static all(): PortalPrivilege[] {
    return [...PORTAL_PRIVILEGES]
  }

  static isOwner(account: ClientAccount) {
    return account.role === 'owner'
  }

  static resolvePrivileges(account: ClientAccount): PortalPrivilege[] {
    if (this.isOwner(account)) {
      return this.all()
    }

    if (account.privileges?.length) {
      return this.normalize(account.privileges)
    }

    return DEFAULT_PRIVILEGES_BY_ROLE[account.role] ?? []
  }

  static normalize(input: string[] | null | undefined): PortalPrivilege[] {
    if (!input?.length) {
      return []
    }

    const allowed = new Set<string>(PORTAL_PRIVILEGES)
    return [...new Set(input.filter((item): item is PortalPrivilege => allowed.has(item)))]
  }

  static has(account: ClientAccount, privilege: PortalPrivilege) {
    return this.resolvePrivileges(account).includes(privilege)
  }

  static hasAny(account: ClientAccount, privileges: PortalPrivilege[]) {
    const resolved = new Set(this.resolvePrivileges(account))
    return privileges.some((privilege) => resolved.has(privilege))
  }

  static canViewEnquiries(account: ClientAccount) {
    return this.hasAny(account, ['view_bookings', 'create_booking'])
  }

  static canViewBooking(account: ClientAccount, status: string) {
    if (this.has(account, 'view_bookings')) {
      return true
    }
    if (this.has(account, 'view_confirmed_bookings')) {
      return (CONFIRMED_BOOKING_STATUSES as readonly string[]).includes(status)
    }
    return false
  }

  static defaultForRole(role: ClientAccountRole): PortalPrivilege[] {
    return DEFAULT_PRIVILEGES_BY_ROLE[role] ?? []
  }

  static assignablePrivileges(_actor: ClientAccount): PortalPrivilege[] {
    return PORTAL_PRIVILEGES.filter((privilege) => privilege !== 'manage_users')
  }

  static assertPrivilege(account: ClientAccount, privilege: PortalPrivilege) {
    if (!this.has(account, privilege)) {
      throw new Error('You do not have permission to perform this action.')
    }
  }

  static groupsForAccount(account: ClientAccount): PortalPrivilegeGroupPayload[] {
    const enabled = new Set(this.resolvePrivileges(account))

    return PORTAL_PRIVILEGE_GROUPS.map((group) => ({
      id: group.id,
      label: group.label,
      description: group.description,
      privileges: group.privileges.map((key) => ({
        key,
        label: PORTAL_PRIVILEGE_META[key].label,
        description: PORTAL_PRIVILEGE_META[key].description,
        enabled: enabled.has(key),
      })),
    }))
  }

  static presetsForUi() {
    return Object.entries(PORTAL_PRIVILEGE_PRESETS).map(([id, preset]) => ({
      id,
      label: preset.label,
      description: preset.description,
      privileges: preset.privileges,
    }))
  }

  static privilegeSummary(account: ClientAccount) {
    const resolved = this.resolvePrivileges(account)
    return {
      total: resolved.length,
      max: this.all().length,
      labels: resolved.slice(0, 4).map((key) => PORTAL_PRIVILEGE_META[key].label),
    }
  }

  static sanitizeAssignment(
    actor: ClientAccount,
    target: ClientAccount,
    input: string[] | null | undefined
  ): PortalPrivilege[] {
    if (this.isOwner(target)) {
      return this.all()
    }

    const normalized = this.normalize(input ?? [])
    const assignable = new Set(this.assignablePrivileges(actor))

    return normalized.filter((privilege) => assignable.has(privilege))
  }
}
