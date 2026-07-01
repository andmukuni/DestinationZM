import { type ReactElement, useEffect, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { type Data } from '@generated/data'
import { FlashListener } from '~/components/flash_listener'
import { NavigationProgress } from '~/components/navigation_progress'
import { NotificationBell } from '~/components/notification_bell'
import { SidebarNavIcon } from '~/components/sidebar_nav_icon'
import { UserMenu } from '~/components/user_menu'
import {
  brandAccentBarClass,
  brandLogoClass,
  brandNavActiveClass,
  brandNavBadgeClass,
  brandNavInactiveClass,
  brandNavLinkBaseClass,
} from '~/lib/brand_theme'
import { resolveSidebarNavigation } from '~/lib/sidebar_nav'
import {
  AgentsIcon,
  AppLogoIcon,
  ArrearsIcon,
  BookingsIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CustomersIcon,
  DashboardIcon,
  DestinationsIcon,
  DownloadIcon,
  ImportIcon,
  MenuIcon,
  OfficesIcon,
  PackagesIcon,
  ReportsIcon,
  RolesIcon,
  SettingsIcon,
  TicketsIcon,
  UsersIcon,
  UserGroupIcon,
  WalletIcon,
  XMarkIcon,
} from '~/components/icons'

type PageLayoutProps = {
  pageTitle?: string
  pageDescription?: string
}

type NavItem = NonNullable<Data.SharedProps['sidebarNav']>['topLevel'][number]
type NavGroup = NonNullable<Data.SharedProps['sidebarNav']>['groups'][number]

const navIcons = {
  dashboard: DashboardIcon,
  bookings: BookingsIcon,
  packages: PackagesIcon,
  destinations: DestinationsIcon,
  customers: CustomersIcon,
  offices: OfficesIcon,
  agents: AgentsIcon,
  users: UsersIcon,
  reports: ReportsIcon,
  roles: RolesIcon,
  documents: DownloadIcon,
  quotations: TicketsIcon,
  suppliers: AgentsIcon,
  invoices: WalletIcon,
  receipts: CheckCircleIcon,
  payments: ImportIcon,
  recovery: ArrearsIcon,
  inquiries: UserGroupIcon,
  enquiries: TicketsIcon,
  workflow_cycles: CheckCircleIcon,
} as const

function isActive(url: string, href: string) {
  return url === href || url.startsWith(`${href}?`) || url.startsWith(`${href}/`)
}

function groupHasActive(items: NavItem[], url: string) {
  return items.some((item) => isActive(url, item.href))
}

function navLinkClass(active: boolean, nested = false) {
  return [
    brandNavLinkBaseClass,
    nested ? 'py-1.5 pl-2.5 pr-2.5' : 'px-2.5 py-2',
    active ? brandNavActiveClass : brandNavInactiveClass,
  ].join(' ')
}

function NavItemLink({
  item,
  active,
  nested = false,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  nested?: boolean
  onNavigate?: () => void
}) {
  const Icon = navIcons[item.icon as keyof typeof navIcons] ?? DashboardIcon
  const className = navLinkClass(active, nested)

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {!nested ? <SidebarNavIcon icon={Icon} active={active} /> : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className={brandNavBadgeClass}>
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}

function NavGroupSection({
  group,
  url,
  expanded,
  onToggle,
  onNavigate,
}: {
  group: NavGroup
  url: string
  expanded: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  const items = group.items
  if (items.length === 0) {
    return null
  }

  const GroupIcon = navIcons[group.icon as keyof typeof navIcons] ?? DashboardIcon
  const hasActiveChild = groupHasActive(items, url)
  const singleItem = items.length === 1 ? items[0]! : null

  if (singleItem) {
    const active = isActive(url, singleItem.href)
    return (
      <div>
        <NavItemLink item={singleItem} active={active} onNavigate={onNavigate} />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`${brandNavLinkBaseClass} w-full px-2.5 py-2 text-left ${
          hasActiveChild && !expanded ? brandNavActiveClass : brandNavInactiveClass
        }`}
      >
        <SidebarNavIcon icon={GroupIcon} active={hasActiveChild && !expanded} />
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        {expanded ? (
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>
      {expanded ? (
        <div className="ml-[11px] mt-0.5 space-y-0.5 border-l border-slate-200 pl-2.5">
          {items.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              active={isActive(url, item.href)}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SidebarBrand() {
  return (
    <div className="relative flex h-16 shrink-0 items-center border-b border-slate-200 px-3.5">
      <Link route="dashboard" className="flex min-w-0 items-center gap-2.5">
        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${brandLogoClass}`}>
          <AppLogoIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold leading-tight tracking-tight text-slate-900">
            DestinationZM
          </span>
          <span className="block text-[11px] text-slate-500">Travel Agency</span>
        </span>
      </Link>
      <div className={`pointer-events-none absolute inset-x-0 bottom-0 h-1 ${brandAccentBarClass}`} aria-hidden />
    </div>
  )
}

function SidebarNav({
  url,
  sidebarNav,
  onNavigate,
}: {
  url: string
  sidebarNav: NonNullable<Data.SharedProps['sidebarNav']>
  onNavigate?: () => void
}) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of sidebarNav.groups) {
      initial[group.id] = true
    }
    return initial
  })

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current }
      for (const group of sidebarNav.groups) {
        if (groupHasActive(group.items, url)) {
          next[group.id] = true
        }
      }
      return next
    })
  }, [url, sidebarNav.groups])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }))
  }

  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
      <div className="flex-1 space-y-1">
        {sidebarNav.topLevel.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            active={isActive(url, item.href)}
            onNavigate={onNavigate}
          />
        ))}

        <div className="my-3 border-t border-slate-200" aria-hidden />

        {sidebarNav.groups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            url={url}
            expanded={expandedGroups[group.id] ?? true}
            onToggle={() => toggleGroup(group.id)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      <div className="mt-4 border-t border-slate-200 pt-3">
        {(() => {
          const active = url === '/settings' || url.startsWith('/settings/')
          return (
            <Link route="settings" className={navLinkClass(active)} onClick={onNavigate}>
              <SidebarNavIcon icon={SettingsIcon} active={active} />
              <span>Settings</span>
            </Link>
          )
        })()}
      </div>
    </nav>
  )
}

function SidebarPanel({
  url,
  sidebarNav,
  className,
  onNavigate,
}: {
  url: string
  sidebarNav: NonNullable<Data.SharedProps['sidebarNav']>
  className?: string
  onNavigate?: () => void
}) {
  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white ${className ?? ''}`}>
      <SidebarBrand />
      <SidebarNav url={url} sidebarNav={sidebarNav} onNavigate={onNavigate} />
    </aside>
  )
}

export default function AppLayout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, props } = usePage<Data.SharedProps & PageLayoutProps>()
  const user = props.user
  const sidebarNav = user
    ? (props.sidebarNav ?? { topLevel: [], groups: [] })
    : resolveSidebarNavigation(props.permissions, user?.role)
  const notifications = props.notifications ?? { unreadCount: 0, recent: [] }
  const pageTitle = props.pageTitle ?? 'DestinationZM'
  const pageDescription = props.pageDescription ?? 'Tour & travel management'
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

  return (
    <div className="h-dvh overflow-hidden bg-slate-100 text-slate-900">
      <div className="flex h-full">
        <div className="sticky top-0 hidden h-dvh shrink-0 md:flex">
          <SidebarPanel url={url} sidebarNav={sidebarNav} />
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
                sidebarNav={sidebarNav}
                className="h-dvh"
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
            <header className="flex h-16 items-center border-b border-slate-200 bg-white">
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
                  {user ? (
                    <>
                      <NotificationBell notifications={notifications} />
                      <UserMenu user={user} />
                    </>
                  ) : null}
                </div>
              </div>
            </header>
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
      <FlashListener />
    </div>
  )
}
