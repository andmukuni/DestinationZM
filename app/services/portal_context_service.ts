import ClientAccount from '#models/client_account'
import Customer from '#models/customer'
import PortalPrivilegeService from '#services/portal_privilege_service'
import type { ClientAccountRole } from '#types/client_account'
import { CLIENT_ACCOUNT_ROLE_LABELS } from '#types/client_account'

export type PortalOrganizationContext = {
  id: number
  name: string
  company: string | null
  branchId: number | null
}

export type PortalUserContext = {
  id: number
  fullName: string
  email: string
  role: ClientAccountRole
  roleLabel: string
  initials: string
}

export type PortalSessionContext = {
  organization: PortalOrganizationContext
  user: PortalUserContext
  /** CRM customer id — all bookings/invoices are scoped to this organization record */
  organizationCustomerId: number
}

function initialsFromName(name: string) {
  const [first, last] = name.split(' ')
  if (first && last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default class PortalContextService {
  /**
   * Each portal login belongs to a user account under a client organization.
   * The organization is linked via `customer_id` on client_accounts (CRM customer record).
   */
  static organizationName(customer: Customer) {
    return customer.company?.trim() || customer.fullName
  }

  static async fromAccount(account: ClientAccount): Promise<PortalSessionContext> {
    await account.load('customer')
    const customer = account.customer

    const fullName = account.fullName?.trim() || customer.fullName

    return {
      organizationCustomerId: account.customerId,
      organization: {
        id: customer.id,
        name: this.organizationName(customer),
        company: customer.company,
        branchId: customer.branchId,
      },
      user: {
        id: account.id,
        fullName,
        email: account.email,
        role: account.role,
        roleLabel: CLIENT_ACCOUNT_ROLE_LABELS[account.role],
        initials: initialsFromName(fullName),
      },
    }
  }

  static canManageUsers(role: ClientAccountRole) {
    return role === 'owner' || role === 'admin'
  }

  static toSharedProps(context: PortalSessionContext, account: ClientAccount) {
    const privileges = PortalPrivilegeService.resolvePrivileges(account)

    return {
      organization: {
        id: context.organization.id,
        name: context.organization.name,
        company: context.organization.company,
      },
      user: {
        name: context.user.fullName,
        email: context.user.email,
        role: context.user.role,
        roleLabel: context.user.roleLabel,
        initials: context.user.initials,
      },
      privileges,
      canManageUsers: this.canManageUsers(context.user.role),
    }
  }
}
