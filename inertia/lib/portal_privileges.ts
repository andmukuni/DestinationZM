export type PortalPrivilegeKey =
  | 'view_dashboard'
  | 'view_bookings'
  | 'view_confirmed_bookings'
  | 'create_booking'
  | 'view_quotations'
  | 'approve_quotations'
  | 'view_recovery_reports'
  | 'approve_recovery_reports'
  | 'query_recovery_reports'
  | 'reject_recovery_reports'
  | 'export_recovery_reports'
  | 'view_invoices'
  | 'pay_invoices'
  | 'view_team'
  | 'manage_users'

export const PORTAL_NAV_PRIVILEGE_REQUIREMENTS: Record<string, PortalPrivilegeKey[]> = {
  dashboard: ['view_dashboard'],
  enquiries: ['view_bookings', 'create_booking'],
  quotations: ['view_quotations'],
  bookings: ['view_bookings', 'view_confirmed_bookings'],
  recovery_reports: ['view_recovery_reports'],
  invoices: ['view_invoices'],
  users: ['view_team', 'manage_users'],
}

export function hasPortalPrivilege(privileges: string[] | undefined, privilege: PortalPrivilegeKey) {
  return privileges?.includes(privilege) ?? false
}

export function hasAnyPortalPrivilege(privileges: string[] | undefined, required: PortalPrivilegeKey[]) {
  return required.some((privilege) => hasPortalPrivilege(privileges, privilege))
}

export function canShowPortalNavItem(itemId: string, privileges: string[] | undefined) {
  const required = PORTAL_NAV_PRIVILEGE_REQUIREMENTS[itemId]
  if (!required) {
    return true
  }
  return hasAnyPortalPrivilege(privileges, required)
}
