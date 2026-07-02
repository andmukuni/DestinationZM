import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import NotificationService from '#services/notification_service'
import PortalContextService from '#services/portal_context_service'
import PortalDashboardService from '#services/portal_dashboard_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import PermissionService from '#services/permission_service'
import SidebarNavigationService, {
  buildSidebarNavigationFromPermissions,
} from '#services/sidebar_navigation_service'
import { canAccessSettingsSection } from '#services/settings/settings_access'
import type { PermissionSlug } from '#types/permissions'
import UserTransformer from '#transformers/user_transformer'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'

function entityUrl(entityType: string, entityId: number): string | null {
  switch (entityType) {
    case 'quotation':
      return `/quotations/${entityId}`
    case 'recovery_report':
      return `/bookings`
    case 'recovery_report_item':
      return `/recovery-reports/items/${entityId}`
    case 'booking':
      return `/bookings/${entityId}`
    case 'invoice':
      return `/invoices/${entityId}`
    default:
      return null
  }
}

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  async share(ctx: HttpContext) {
    const { session, auth } = ctx as Partial<HttpContext>

    const error = session?.flashMessages.get('error') as string
    const success = session?.flashMessages.get('success') as string

    let user
    let portalClient:
      | {
          organization: { id: number; name: string; company: string | null }
          user: {
            name: string
            email: string
            role: string
            roleLabel: string
            initials: string
          }
          canManageUsers: boolean
          privileges: string[]
          pendingEnquiriesCount: number
          pendingQuotationsCount: number
          pendingInvoicesCount: number
        }
      | null = null
    let permissions: PermissionSlug[] = []
    let canAccessPortalSettings = false
    let sidebarNav = { topLevel: [], groups: [] } as Awaited<
      ReturnType<typeof SidebarNavigationService.getNavigation>
    >
    let notifications: {
      unreadCount: number
      recent: Array<{
        id: number
        title: string
        body: string | null
        createdAtLabel: string
        isUnread: boolean
        actionUrl: string | null
      }>
    } = { unreadCount: 0, recent: [] }

    if (auth) {
      const webUser = auth.use('web').user
      if (webUser) {
        await webUser.load('branch')
        user = UserTransformer.transform(webUser)
        await PermissionService.bootstrap()
        permissions = PermissionService.permissionsForUser(webUser)
        canAccessPortalSettings = canAccessSettingsSection(webUser, 'portal')
        sidebarNav = await SidebarNavigationService.getNavigation(webUser)
        if (sidebarNav.topLevel.length === 0 && sidebarNav.groups.length === 0) {
          const badges = await SidebarNavigationService.badgeCounts(webUser)
          sidebarNav = buildSidebarNavigationFromPermissions(permissions, badges)
        }

        const recent = await NotificationService.forUser(webUser.id, 10)
        const unreadCount = await NotificationService.unreadCount(webUser.id)
        notifications = {
          unreadCount,
          recent: recent.map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body ?? '',
            createdAtLabel: n.createdAt.toRelative() ?? n.createdAt.toFormat('dd LLL yyyy'),
            isUnread: !n.readAt,
            actionUrl:
              n.entityType && n.entityId ? entityUrl(n.entityType, n.entityId) ?? '' : '',
          })),
        }
      }
    }

    if (auth && (await auth.use('client').check())) {
      const account = auth.use('client').user!
      const context = await PortalContextService.fromAccount(account)
      const shared = PortalContextService.toSharedProps(context, account)
      const pendingEnquiriesCount = PortalPrivilegeService.canViewEnquiries(account)
        ? await PortalDashboardService.pendingEnquiriesCount(context.organizationCustomerId)
        : 0
      const pendingQuotationsCount = PortalPrivilegeService.has(account, 'view_quotations')
        ? await PortalDashboardService.pendingQuotationsCount(context.organizationCustomerId)
        : 0
      const pendingInvoicesCount = PortalPrivilegeService.has(account, 'view_invoices')
        ? await PortalDashboardService.pendingInvoicesCount(context.organizationCustomerId)
        : 0

      portalClient = {
        ...shared,
        pendingEnquiriesCount,
        pendingQuotationsCount,
        pendingInvoicesCount,
      }
    }

    return {
      errors: ctx.inertia.always(this.getValidationErrors(ctx)),
      flash: ctx.inertia.always({
        error: error ?? '',
        success: success ?? '',
      }),
      user: ctx.inertia.always(user ?? undefined),
      portalClient: ctx.inertia.always(portalClient ?? undefined),
      permissions: ctx.inertia.always(permissions),
      canAccessPortalSettings: ctx.inertia.always(canAccessPortalSettings),
      sidebarNav: ctx.inertia.always(sidebarNav),
      notifications: ctx.inertia.always(notifications),
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)

    const output = await next()
    this.dispose(ctx)

    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = InferSharedProps<InertiaMiddleware>
  export interface SharedProps extends MiddlewareSharedProps {}
}
