export const PORTAL_PRIVILEGES = [
  'view_dashboard',
  'view_bookings',
  'view_confirmed_bookings',
  'create_booking',
  'view_quotations',
  'approve_quotations',
  'view_recovery_reports',
  'approve_recovery_reports',
  'query_recovery_reports',
  'reject_recovery_reports',
  'export_recovery_reports',
  'view_invoices',
  'pay_invoices',
  'view_team',
  'manage_users',
] as const

export type PortalPrivilege = (typeof PORTAL_PRIVILEGES)[number]

export type PortalPrivilegeGroup = {
  id: string
  label: string
  description: string
  privileges: PortalPrivilege[]
}

export const PORTAL_PRIVILEGE_META: Record<
  PortalPrivilege,
  { label: string; description: string; group: PortalPrivilegeGroup['id'] }
> = {
  view_dashboard: {
    label: 'View dashboard',
    description: 'Access the organization overview, KPIs, and recent activity',
    group: 'overview',
  },
  view_bookings: {
    label: 'View all enquiries',
    description: 'See every enquiry and workflow stage for the organization',
    group: 'bookings',
  },
  view_confirmed_bookings: {
    label: 'View confirmed enquiries',
    description: 'See enquiries after quotation approval (confirmed trips only)',
    group: 'bookings',
  },
  create_booking: {
    label: 'Create enquiries',
    description: 'Submit new trip enquiries on behalf of the organization',
    group: 'bookings',
  },
  view_quotations: {
    label: 'View quotations',
    description: 'Open quotations sent by your travel agent',
    group: 'quotations',
  },
  approve_quotations: {
    label: 'Approve quotations',
    description: 'Approve quotations so the enquiry can proceed',
    group: 'quotations',
  },
  view_recovery_reports: {
    label: 'View recovery reports',
    description: 'Review recovery items sent for audit and reimbursement',
    group: 'recovery',
  },
  approve_recovery_reports: {
    label: 'Approve recovery items',
    description: 'Approve recovery items for reimbursement',
    group: 'recovery',
  },
  query_recovery_reports: {
    label: 'Raise recovery queries',
    description: 'Raise queries on recovery items sent for review',
    group: 'recovery',
  },
  reject_recovery_reports: {
    label: 'Reject recovery items',
    description: 'Reject recovery items that fail audit',
    group: 'recovery',
  },
  export_recovery_reports: {
    label: 'Export recovery reports',
    description: 'Export recovery report spreadsheets',
    group: 'recovery',
  },
  view_invoices: {
    label: 'View invoices',
    description: 'See issued invoices, balances, and payment history',
    group: 'invoices',
  },
  pay_invoices: {
    label: 'Pay invoices',
    description: 'Submit payments for outstanding invoices',
    group: 'invoices',
  },
  view_team: {
    label: 'View team',
    description: 'See who has access to the organization portal',
    group: 'organization',
  },
  manage_users: {
    label: 'Manage users & privileges',
    description: 'Add users and assign portal privileges (organization owners only)',
    group: 'organization',
  },
}

export const PORTAL_PRIVILEGE_GROUPS: PortalPrivilegeGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Dashboard and summary access',
    privileges: ['view_dashboard'],
  },
  {
    id: 'bookings',
    label: 'Enquiries',
    description: 'Trip enquiries and enquiry visibility',
    privileges: ['view_bookings', 'view_confirmed_bookings', 'create_booking'],
  },
  {
    id: 'quotations',
    label: 'Quotations',
    description: 'Review and approve agent quotations',
    privileges: ['view_quotations', 'approve_quotations'],
  },
  {
    id: 'recovery',
    label: 'Recovery reports',
    description: 'Pre-invoice confirmation workflow',
    privileges: ['view_recovery_reports', 'approve_recovery_reports', 'query_recovery_reports', 'reject_recovery_reports', 'export_recovery_reports'],
  },
  {
    id: 'invoices',
    label: 'Invoices & payments',
    description: 'Billing visibility and payment submission',
    privileges: ['view_invoices', 'pay_invoices'],
  },
  {
    id: 'organization',
    label: 'Organization',
    description: 'Team visibility and administration',
    privileges: ['view_team', 'manage_users'],
  },
]

/** Bookings visible when user only has confirmed-booking access */
export const CONFIRMED_BOOKING_STATUSES = [
  'quotation_approved',
  'confirmed',
  'recovery_preparing',
  'recovery_sent',
  'recovery_confirmed',
  'invoiced',
  'paid',
  'closed',
] as const

export const PORTAL_PRIVILEGE_PRESETS: Record<
  string,
  { label: string; description: string; privileges: PortalPrivilege[] }
> = {
  full_access: {
    label: 'Full access',
    description: 'Everything except user administration',
    privileges: PORTAL_PRIVILEGES.filter((p) => p !== 'manage_users'),
  },
  coordinator: {
    label: 'Enquiries coordinator',
    description: 'Enquiries, approvals, and workflow actions',
    privileges: [
      'view_dashboard',
      'view_bookings',
      'create_booking',
      'view_quotations',
      'approve_quotations',
      'view_recovery_reports',
      'approve_recovery_reports',
      'query_recovery_reports',
      'export_recovery_reports',
      'view_team',
    ],
  },
  finance: {
    label: 'Finance',
    description: 'Invoices, payments, and confirmed trips',
    privileges: [
      'view_dashboard',
      'view_confirmed_bookings',
      'view_recovery_reports',
      'approve_recovery_reports',
      'query_recovery_reports',
      'export_recovery_reports',
      'view_invoices',
      'pay_invoices',
      'view_team',
    ],
  },
  read_only: {
    label: 'Read only',
    description: 'View confirmed enquiries and invoices only',
    privileges: ['view_dashboard', 'view_confirmed_bookings', 'view_invoices', 'view_team'],
  },
}

export const DEFAULT_PRIVILEGES_BY_ROLE: Record<'owner' | 'admin' | 'member', PortalPrivilege[] | null> = {
  owner: null,
  admin: PORTAL_PRIVILEGE_PRESETS.full_access.privileges,
  member: PORTAL_PRIVILEGE_PRESETS.coordinator.privileges.filter((p) => p !== 'create_booking'),
}
