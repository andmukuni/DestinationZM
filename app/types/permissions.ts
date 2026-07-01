import type { UserRole } from '#types/user_roles'
import { MANAGEABLE_ROLES } from '#types/user_roles'

export const PERMISSION_SLUGS = [
  'dashboard.view',
  'bookings.view',
  'bookings.manage',
  'packages.view',
  'destinations.view',
  'customers.view',
  'customers.manage',
  'offices.view',
  'offices.create',
  'agents.view',
  'agents.create',
  'users.view',
  'users.create',
  'reports.view',
  'reports.export',
  'reports.templates.manage',
  'roles.manage',
  'documents.view',
  'documents.upload',
  'documents.manage',
  'quotations.view',
  'quotations.manage',
  'quotations.approve',
  'suppliers.view',
  'suppliers.manage',
  'invoices.view',
  'invoices.manage',
  'receipts.view',
  'receipts.manage',
  'payments.view',
  'payments.manage',
  'recovery_reports.view',
  'recovery_reports.manage',
  'portal.manage',
] as const

export type PermissionSlug = (typeof PERMISSION_SLUGS)[number]

export type PermissionDefinition = {
  slug: PermissionSlug
  label: string
  description: string
}

export type PermissionGroup = {
  id: string
  label: string
  permissions: PermissionDefinition[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'core',
    label: 'Core access',
    permissions: [
      {
        slug: 'dashboard.view',
        label: 'View dashboard',
        description: 'Access the main dashboard and KPIs',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    permissions: [
      {
        slug: 'bookings.view',
        label: 'View enquiries',
        description: 'Browse tour and travel enquiries',
      },
      {
        slug: 'bookings.manage',
        label: 'Manage enquiries',
        description: 'Create and update enquiries',
      },
      {
        slug: 'packages.view',
        label: 'View packages',
        description: 'Browse tour packages and itineraries',
      },
      {
        slug: 'destinations.view',
        label: 'View destinations',
        description: 'Browse destinations and travel routes',
      },
      {
        slug: 'customers.view',
        label: 'View customers',
        description: 'Browse customer profiles and history',
      },
      {
        slug: 'customers.manage',
        label: 'Manage customers',
        description: 'Create and update customer records',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    permissions: [
      {
        slug: 'documents.view',
        label: 'View documents',
        description: 'Browse uploaded documents and attachments',
      },
      {
        slug: 'documents.upload',
        label: 'Upload documents',
        description: 'Upload quotations, confirmations, and supporting files',
      },
      {
        slug: 'documents.manage',
        label: 'Manage documents',
        description: 'Edit and remove document records',
      },
    ],
  },
  {
    id: 'quotations',
    label: 'Quotations',
    permissions: [
      {
        slug: 'quotations.view',
        label: 'View quotations',
        description: 'Browse sales quotations',
      },
      {
        slug: 'quotations.manage',
        label: 'Manage quotations',
        description: 'Create and update quotations',
      },
      {
        slug: 'quotations.approve',
        label: 'Approve quotations',
        description: 'Approve quotations for enquiry confirmation',
      },
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers',
    permissions: [
      {
        slug: 'suppliers.view',
        label: 'View suppliers',
        description: 'Browse supplier registry',
      },
      {
        slug: 'suppliers.manage',
        label: 'Manage suppliers',
        description: 'Create and update suppliers',
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    permissions: [
      {
        slug: 'invoices.view',
        label: 'View invoices',
        description: 'Browse customer invoices',
      },
      {
        slug: 'invoices.manage',
        label: 'Manage invoices',
        description: 'Create and update invoices',
      },
      {
        slug: 'receipts.view',
        label: 'View receipts',
        description: 'Browse payment receipts',
      },
      {
        slug: 'receipts.manage',
        label: 'Manage receipts',
        description: 'Record and update receipts',
      },
      {
        slug: 'payments.view',
        label: 'View payments',
        description: 'Browse payment records',
      },
      {
        slug: 'payments.manage',
        label: 'Manage payments',
        description: 'Record and update payments',
      },
    ],
  },
  {
    id: 'recovery_reports',
    label: 'Recovery reports',
    permissions: [
      {
        slug: 'recovery_reports.view',
        label: 'View recovery reports',
        description: 'View client sign-off recovery reports',
      },
      {
        slug: 'recovery_reports.manage',
        label: 'Manage recovery reports',
        description: 'Create and edit recovery reports',
      },
      {
        slug: 'portal.manage',
        label: 'Manage client portal',
        description: 'View and manage client portal submissions',
      },
    ],
  },
  {
    id: 'organisation',
    label: 'Organisation',
    permissions: [
      {
        slug: 'offices.view',
        label: 'View offices',
        description: 'Browse office locations',
      },
      {
        slug: 'offices.create',
        label: 'Create offices',
        description: 'Add new office locations',
      },
      {
        slug: 'agents.view',
        label: 'View travel agents',
        description: 'Browse travel agent profiles',
      },
      {
        slug: 'agents.create',
        label: 'Create travel agents',
        description: 'Add new travel agent accounts',
      },
      {
        slug: 'users.view',
        label: 'View users',
        description: 'Browse system users',
      },
      {
        slug: 'users.create',
        label: 'Create users',
        description: 'Add new users and assign roles',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    permissions: [
      {
        slug: 'reports.view',
        label: 'View reports',
        description: 'Access reporting dashboards',
      },
      {
        slug: 'reports.export',
        label: 'Export reports',
        description: 'Download report exports',
      },
      {
        slug: 'reports.templates.manage',
        label: 'Manage report templates',
        description: 'Upload and configure Excel report templates',
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    permissions: [
      {
        slug: 'roles.manage',
        label: 'Manage roles & permissions',
        description: 'Configure what each role can access',
      },
    ],
  },
]

const reservationsPerms: PermissionSlug[] = [
  'dashboard.view',
  'bookings.view',
  'bookings.manage',
  'packages.view',
  'destinations.view',
  'customers.view',
  'customers.manage',
  'documents.view',
  'documents.upload',
  'quotations.view',
  'quotations.manage',
  'quotations.approve',
  'recovery_reports.view',
  'recovery_reports.manage',
  'portal.manage',
]

const operationsPerms: PermissionSlug[] = [
  'dashboard.view',
  'bookings.view',
  'packages.view',
  'destinations.view',
  'customers.view',
  'suppliers.view',
  'suppliers.manage',
  'documents.view',
  'documents.upload',
]

const financePerms: PermissionSlug[] = [
  'dashboard.view',
  'invoices.view',
  'invoices.manage',
  'receipts.view',
  'receipts.manage',
  'payments.view',
  'payments.manage',
  'documents.view',
  'documents.upload',
  'reports.view',
  'reports.export',
  'reports.templates.manage',
  'recovery_reports.view',
  'recovery_reports.manage',
]

const recoveryPerms: PermissionSlug[] = [
  'dashboard.view',
  'invoices.view',
  'payments.view',
  'payments.manage',
  'recovery_reports.view',
  'recovery_reports.manage',
  'documents.view',
  'documents.upload',
]

const managementPerms: PermissionSlug[] = [
  'dashboard.view',
  'bookings.view',
  'customers.view',
  'suppliers.view',
  'invoices.view',
  'receipts.view',
  'payments.view',
  'recovery_reports.view',
  'documents.view',
  'reports.view',
  'reports.export',
  'users.view',
]

const executivePerms: PermissionSlug[] = [
  'dashboard.view',
  'bookings.view',
  'reports.view',
  'reports.export',
]

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionSlug[]> = {
  admin: [...PERMISSION_SLUGS],
  finance: financePerms,
  reservations: reservationsPerms,
  operations: operationsPerms,
  recovery: recoveryPerms,
  management: managementPerms,
  executive: executivePerms,
}

export { MANAGEABLE_ROLES }
