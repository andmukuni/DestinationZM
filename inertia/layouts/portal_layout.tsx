import { Fragment, type ReactElement, useEffect, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { type Data } from '@generated/data'
import { FlashListener } from '~/components/flash_listener'
import { NavigationProgress } from '~/components/navigation_progress'
import { PortalUserMenu } from '~/components/portal_user_menu'
import { SidebarNavIcon } from '~/components/sidebar_nav_icon'
import {
  AppLogoIcon,
  ArrearsIcon,
  ImportIcon,
  BookingsIcon,
  DashboardIcon,
  MenuIcon,
  PlusIcon,
  TicketsIcon,
  WalletIcon,
  UsersIcon,
  XMarkIcon,
} from '~/components/icons'
import {
  brandNavActiveClass,
  brandNavBadgeClass,
  brandNavInactiveClass,
  brandNavLinkBaseClass,
} from '~/lib/brand_theme'
import { isPortalNavActive, PORTAL_NAV_ITEMS, portalPageMeta, type PortalNavItem } from '~/lib/portal_nav'
import { canShowPortalNavItem, hasPortalPrivilege } from '~/lib/portal_privileges'

type PageLayoutProps = {
  pageTitle?: string
  pageDescription?: string
}

const navIcons = {
  dashboard: DashboardIcon,
  bookings: BookingsIcon,
  enquiries: TicketsIcon,
  quotations: ImportIcon,
  invoices: WalletIcon,
  users: UsersIcon,
  recovery: ArrearsIcon,
} as const

function navLinkClass(active: boolean) {
  return [
    brandNavLinkBaseClass,
    'px-2.5 py-2',
    active ? brandNavActiveClass : brandNavInactiveClass,
  ].join(' ')
}

function PortalNavLink({
  item,
  url,
  badge,
  onNavigate,
}: {
  item: PortalNavItem
  url: string
  badge?: number
  onNavigate?: () => void
}) {
  const Icon = navIcons[item.icon]
  const active = isPortalNavActive(item, url)

  return (
    <Link href={item.href} className={navLinkClass(active)} onClick={onNavigate}>
      <SidebarNavIcon icon={Icon} active={active} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge && badge > 0 ? (
        <span className={brandNavBadgeClass}>
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

function SidebarBrand({ organizationName }: { organizationName?: string }) {
  return (
    <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-3.5">
      <Link route="portal.dashboard" className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white">
          <AppLogoIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold leading-tight tracking-tight text-slate-900">
            {organizationName ?? 'DestinationZM'}
          </span>
          <span className="block text-[11px] text-slate-500">Client portal</span>
        </span>
      </Link>
    </div>
  )
}

function SidebarNewEnquiry({
  url,
  onNavigate,
}: {
  url: string
  onNavigate?: () => void
}) {
  const active =
    url === '/portal/bookings/create' || url.startsWith('/portal/bookings/create?')

  return (
    <Link
      route="portal.bookings.create"
      onClick={onNavigate}
      className={[
        'flex w-full shrink-0 items-center justify-center gap-2 border-b border-slate-200 px-4 py-3.5 text-sm font-semibold transition',
        active
          ? 'bg-orange-700 text-white'
          : 'bg-orange-600 text-white hover:bg-orange-700',
      ].join(' ')}
    >
      <PlusIcon className="h-4 w-4 shrink-0" />
      New Enquiry
    </Link>
  )
}

function SidebarNav({
  url,
  onNavigate,
  privileges,
  pendingEnquiriesCount = 0,
  pendingQuotationsCount = 0,
  pendingInvoicesCount = 0,
}: {
  url: string
  onNavigate?: () => void
  privileges?: string[]
  pendingEnquiriesCount?: number
  pendingQuotationsCount?: number
  pendingInvoicesCount?: number
}) {
  const items = PORTAL_NAV_ITEMS.filter((item) => canShowPortalNavItem(item.id, privileges))

  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
      <div className="space-y-1">
        {items.map((item, index) => {
          const showDividerAfterDashboard =
            item.id === 'dashboard' && index < items.length - 1

          return (
            <Fragment key={item.id}>
              <PortalNavLink
                item={item}
                url={url}
                onNavigate={onNavigate}
                badge={
                  item.id === 'enquiries'
                    ? pendingEnquiriesCount
                    : item.id === 'quotations'
                      ? pendingQuotationsCount
                      : item.id === 'invoices'
                        ? pendingInvoicesCount
                        : undefined
                }
              />
              {showDividerAfterDashboard ? (
                <div className="-mx-3 my-2 border-b border-slate-200" role="separator" />
              ) : null}
            </Fragment>
          )
        })}
      </div>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <p className="px-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">Need help?</p>
        <p className="mt-1 px-2.5 text-xs leading-relaxed text-slate-500">
          Contact your travel agent for changes to confirmed enquiries.
        </p>
      </div>
    </nav>
  )
}

function SidebarPanel({
  url,
  className,
  onNavigate,
  organizationName,
  privileges,
  pendingEnquiriesCount,
  pendingQuotationsCount,
  pendingInvoicesCount,
}: {
  url: string
  className?: string
  onNavigate?: () => void
  organizationName?: string
  privileges?: string[]
  pendingEnquiriesCount?: number
  pendingQuotationsCount?: number
  pendingInvoicesCount?: number
}) {
  const canCreateBooking = hasPortalPrivilege(privileges, 'create_booking')

  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white ${className ?? ''}`}>
      <SidebarBrand organizationName={organizationName} />
      {canCreateBooking ? <SidebarNewEnquiry url={url} onNavigate={onNavigate} /> : null}
      <SidebarNav
        url={url}
        onNavigate={onNavigate}
        privileges={privileges}
        pendingEnquiriesCount={pendingEnquiriesCount}
        pendingQuotationsCount={pendingQuotationsCount}
        pendingInvoicesCount={pendingInvoicesCount}
      />
    </aside>
  )
}

export default function PortalLayout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, props } = usePage<Data.SharedProps & PageLayoutProps>()
  const portalClient = props.portalClient
  const defaults = portalPageMeta(url)
  const pageTitle = props.pageTitle ?? defaults.title
  const pageDescription = props.pageDescription ?? defaults.description
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [url])

  useEffect(() => {
    if (!mobileNavOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileNavOpen])

  const organizationName = portalClient?.organization.name
  const privileges = portalClient?.privileges
  const pendingEnquiriesCount = portalClient?.pendingEnquiriesCount ?? 0
  const pendingQuotationsCount = portalClient?.pendingQuotationsCount ?? 0
  const pendingInvoicesCount = portalClient?.pendingInvoicesCount ?? 0

  return (
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full">
        <div className="sticky top-0 hidden h-dvh shrink-0 md:flex">
          <SidebarPanel
            url={url}
            organizationName={organizationName}
            privileges={privileges}
            pendingEnquiriesCount={pendingEnquiriesCount}
            pendingQuotationsCount={pendingQuotationsCount}
            pendingInvoicesCount={pendingInvoicesCount}
          />
        </div>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative h-full w-64 max-w-[85vw]">
              <SidebarPanel
                url={url}
                className="h-dvh"
                organizationName={organizationName}
                privileges={privileges}
                pendingEnquiriesCount={pendingEnquiriesCount}
                pendingQuotationsCount={pendingQuotationsCount}
                pendingInvoicesCount={pendingInvoicesCount}
                onNavigate={() => setMobileNavOpen(false)}
              />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileNavOpen(false)}
                className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-20 shrink-0">
            <NavigationProgress />
            <header className="relative flex h-16 items-center bg-white">
              <div className="flex w-full items-center justify-between gap-3 px-4 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    aria-label="Open navigation"
                    aria-expanded={mobileNavOpen}
                    onClick={() => setMobileNavOpen(true)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 md:hidden"
                  >
                    <MenuIcon className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{pageTitle}</p>
                    <p className="truncate text-xs text-slate-500">{pageDescription}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {portalClient ? <PortalUserMenu client={portalClient} /> : null}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-orange-500" aria-hidden />
            </header>
          </div>
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
      <FlashListener />
    </div>
  )
}
