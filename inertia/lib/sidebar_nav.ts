export type SidebarNavIcon =
  | 'dashboard'
  | 'bookings'
  | 'packages'
  | 'destinations'
  | 'customers'
  | 'offices'
  | 'agents'
  | 'users'
  | 'reports'
  | 'roles'
  | 'documents'
  | 'quotations'
  | 'suppliers'
  | 'invoices'
  | 'receipts'
  | 'payments'
  | 'recovery'
  | 'recovery_reports'
  | 'enquiries'
  | 'workflow_cycles'
  | 'quickbooks'

export type SidebarNavRoute =
  | 'dashboard'
  | 'bookings'
  | 'packages'
  | 'destinations'
  | 'customers'
  | 'offices'
  | 'agents'
  | 'users'
  | 'reports'
  | 'roles'
  | 'documents'
  | 'quotations'
  | 'suppliers'
  | 'invoices'
  | 'receipts'
  | 'payments'
  | 'recovery'
  | 'recovery_reports'
  | 'enquiries'
  | 'workflow_cycles.index'

export type UserRole =
  | 'admin'
  | 'finance'
  | 'reservations'
  | 'operations'
  | 'recovery'
  | 'management'
  | 'executive'

export type SidebarNavItem = {
  label: string
  route?: SidebarNavRoute
  href: string
  icon: SidebarNavIcon
  badge?: number
}

export type SidebarNavGroup = {
  id: string
  label: string
  icon: SidebarNavIcon
  items: SidebarNavItem[]
}

export type SidebarNavigation = {
  topLevel: SidebarNavItem[]
  groups: SidebarNavGroup[]
}

type SidebarNavDefinitionItem = SidebarNavItem & {
  permission: string
}

const SIDEBAR_DEFINITION = {
  topLevel: [
    {
      label: 'Dashboard',
      route: 'dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      permission: 'dashboard.view',
    },
    {
      label: 'Enquiries',
      route: 'enquiries',
      href: '/enquiries',
      icon: 'enquiries',
      permission: 'bookings.view',
    },
    {
      label: 'Quotations',
      route: 'quotations',
      href: '/quotations',
      icon: 'quotations',
      permission: 'quotations.view',
    },
    {
      label: 'Invoices',
      route: 'invoices',
      href: '/invoices',
      icon: 'invoices',
      permission: 'invoices.view',
    },
    {
      label: 'Payments',
      route: 'payments',
      href: '/payments',
      icon: 'payments',
      permission: 'payments.view',
    },
    {
      label: 'Customers',
      route: 'customers',
      href: '/customers',
      icon: 'customers',
      permission: 'customers.view',
    },
  ],
  groups: [
    {
      id: 'recovery',
      label: 'Recovery',
      icon: 'recovery',
      items: [
        {
          label: 'Recovery report',
          route: 'recovery_reports',
          href: '/recovery-reports',
          icon: 'recovery',
          permission: 'recovery_reports.view',
        },
      ],
    },
    {
      id: 'quickbooks',
      label: 'QuickBooks',
      icon: 'quickbooks',
      items: [
        {
          label: 'Chart of accounts',
          href: '/quickbooks/accounts',
          icon: 'quickbooks',
          permission: 'invoices.view',
        },
        {
          label: 'Products & services',
          href: '/quickbooks/items',
          icon: 'quickbooks',
          permission: 'invoices.view',
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'reports',
      items: [
        {
          label: 'Reports',
          route: 'reports',
          href: '/reports',
          icon: 'reports',
          permission: 'reports.view',
        },
      ],
    },
    {
      id: 'organisation',
      label: 'Administration',
      icon: 'offices',
      items: [
        {
          label: 'Offices',
          route: 'offices',
          href: '/offices',
          icon: 'offices',
          permission: 'offices.view',
        },
        {
          label: 'Travel agents',
          route: 'agents',
          href: '/agents',
          icon: 'agents',
          permission: 'agents.view',
        },
        { label: 'Users', route: 'users', href: '/users', icon: 'users', permission: 'users.view' },
        {
          label: 'Roles & permissions',
          route: 'roles',
          href: '/roles',
          icon: 'roles',
          permission: 'roles.manage',
        },
        {
          label: 'Portal enquiry forms',
          href: '/portal-booking-types',
          icon: 'bookings',
          permission: 'bookings.manage',
        },
      ],
    },
  ],
} satisfies {
  topLevel: SidebarNavDefinitionItem[]
  groups: Array<{
    id: string
    label: string
    icon: SidebarNavIcon
    items: SidebarNavDefinitionItem[]
  }>
}

function toNavItem(item: SidebarNavDefinitionItem): SidebarNavItem {
  return {
    label: item.label,
    route: item.route,
    href: item.href,
    icon: item.icon,
  }
}

export function buildSidebarNavigationFromPermissions(permissions: string[]): SidebarNavigation {
  const permissionSet = new Set(permissions)

  const topLevel = SIDEBAR_DEFINITION.topLevel
    .filter((item) => permissionSet.has(item.permission))
    .map(toNavItem)

  const groups = SIDEBAR_DEFINITION.groups
    .map((group) => ({
      id: group.id,
      label: group.label,
      icon: group.icon,
      items: group.items.filter((item) => permissionSet.has(item.permission)).map(toNavItem),
    }))
    .filter((group) => group.items.length > 0)

  return { topLevel, groups }
}

export function resolveSidebarNavigation(
  permissions: string[] | null | undefined,
  _userRole: string | null | undefined
): SidebarNavigation {
  if (permissions && permissions.length > 0) {
    const fromPermissions = buildSidebarNavigationFromPermissions(permissions)
    if (fromPermissions.topLevel.length > 0 || fromPermissions.groups.length > 0) {
      return fromPermissions
    }
  }

  return { topLevel: [], groups: [] }
}
