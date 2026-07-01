import User from '#models/user'
import DashboardService from '#services/dashboard_service'
import PermissionService from '#services/permission_service'
import type { PermissionSlug } from '#types/permissions'

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
  | 'workflow_cycles.index'

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
  | 'workflow_cycles'
  | 'workflow_cycles.index'

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

type SidebarBadgeKey = 'open_enquiries' | 'pending_quotations'

type SidebarNavDefinitionItem = SidebarNavItem & {
  permission: PermissionSlug
  badgeKey?: SidebarBadgeKey
}

type SidebarNavDefinitionGroup = {
  id: string
  label: string
  icon: SidebarNavIcon
  items: SidebarNavDefinitionItem[]
}

export const SIDEBAR_DEFINITION = {
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
      badgeKey: 'open_enquiries',
    },
    {
      label: 'Quotations',
      route: 'quotations',
      href: '/quotations',
      icon: 'quotations',
      permission: 'quotations.view',
      badgeKey: 'pending_quotations',
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
        {
          label: 'Users',
          route: 'users',
          href: '/users',
          icon: 'users',
          permission: 'users.view',
        },
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
  groups: SidebarNavDefinitionGroup[]
}

function toNavItem(
  item: SidebarNavDefinitionItem,
  badges: Partial<Record<SidebarBadgeKey, number>> = {}
): SidebarNavItem {
  const badge = item.badgeKey ? badges[item.badgeKey] : undefined

  return {
    label: item.label,
    route: item.route,
    href: item.href,
    icon: item.icon,
    badge: badge && badge > 0 ? badge : undefined,
  }
}

export function buildSidebarNavigationFromPermissions(
  permissions: PermissionSlug[],
  badges: Partial<Record<SidebarBadgeKey, number>> = {}
): SidebarNavigation {
  const permissionSet = new Set(permissions)
  const can = (permission: PermissionSlug) => permissionSet.has(permission)

  const topLevel = SIDEBAR_DEFINITION.topLevel
    .filter((item) => can(item.permission))
    .map((item) => toNavItem(item, badges))

  const groups = SIDEBAR_DEFINITION.groups
    .map((group) => ({
      id: group.id,
      label: group.label,
      icon: group.icon,
      items: group.items.filter((item) => can(item.permission)).map((item) => toNavItem(item, badges)),
    }))
    .filter((group) => group.items.length > 0)

  return { topLevel, groups }
}

export default class SidebarNavigationService {
  static async badgeCounts(user: User): Promise<Partial<Record<SidebarBadgeKey, number>>> {
    const badges: Partial<Record<SidebarBadgeKey, number>> = {}

    if (PermissionService.can(user, 'bookings.view')) {
      badges.open_enquiries = await DashboardService.openEnquiriesCount(user)
    }

    if (PermissionService.can(user, 'quotations.view')) {
      badges.pending_quotations = await DashboardService.pendingQuotationsCount(user)
    }

    return badges
  }

  static buildForUser(
    user: User,
    badges: Partial<Record<SidebarBadgeKey, number>> = {}
  ): SidebarNavigation {
    const topLevel = SIDEBAR_DEFINITION.topLevel
      .filter((item) => PermissionService.can(user, item.permission))
      .map((item) => toNavItem(item, badges))

    const groups = SIDEBAR_DEFINITION.groups
      .map((group) => ({
        id: group.id,
        label: group.label,
        icon: group.icon,
        items: group.items
          .filter((item) => PermissionService.can(user, item.permission))
          .map((item) => toNavItem(item, badges)),
      }))
      .filter((group) => group.items.length > 0)

    return { topLevel, groups }
  }

  static async getNavigation(user: User): Promise<SidebarNavigation> {
    await PermissionService.bootstrap()

    const badges = await this.badgeCounts(user)
    return this.buildForUser(user, badges)
  }
}
