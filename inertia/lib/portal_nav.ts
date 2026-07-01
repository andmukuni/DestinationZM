export type PortalNavItem = {
  id: string
  label: string
  href: string
  icon: 'dashboard' | 'bookings' | 'enquiries' | 'quotations' | 'invoices' | 'users' | 'recovery'
  match?: (url: string) => boolean
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/portal/dashboard',
    icon: 'dashboard',
    match: (url) => url === '/portal/dashboard',
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    href: '/portal/enquiries',
    icon: 'enquiries',
    match: (url) =>
      url === '/portal/enquiries' ||
      url === '/portal/bookings/create' ||
      url.startsWith('/portal/bookings/create?'),
  },
  {
    id: 'quotations',
    label: 'Quotations',
    href: '/portal/quotations',
    icon: 'quotations',
    match: (url) => url === '/portal/quotations' || /^\/portal\/quotations\/\d+/.test(url),
  },
  {
    id: 'invoices',
    label: 'Invoices',
    href: '/portal/invoices',
    icon: 'invoices',
    match: (url) => url === '/portal/invoices' || /^\/portal\/invoices\/\d+/.test(url),
  },
  {
    id: 'recovery_reports',
    label: 'Recovery reports',
    href: '/portal/recovery-reports',
    icon: 'recovery',
    match: (url) => url === '/portal/recovery-reports' || /^\/portal\/recovery-reports\/\d+/.test(url),
  },
  {
    id: 'users',
    label: 'User management',
    href: '/portal/users',
    icon: 'users',
    match: (url) =>
      url === '/portal/users' || url === '/portal/users/create' || /^\/portal\/users\/\d+\/edit/.test(url),
  },
]

export function portalPageMeta(url: string): { title: string; description: string } {
  if (url === '/portal/dashboard') {
    return { title: 'Dashboard', description: 'Your bookings, quotations, and payments' }
  }
  if (url === '/portal/bookings') {
    return { title: 'My bookings', description: 'Confirmed reservations and trip records' }
  }
  if (url === '/portal/enquiries') {
    return { title: 'Enquiries', description: 'Submitted enquiries awaiting a quotation' }
  }
  if (url === '/portal/quotations') {
    return { title: 'Quotations', description: 'Review quotations sent for your approval' }
  }
  if (url === '/portal/bookings/create') {
    return { title: 'Your enquiry', description: 'Add travel services and submit for a quotation' }
  }
  if (/^\/portal\/bookings\/\d+/.test(url)) {
    return { title: 'Booking', description: 'Track workflow progress and take action' }
  }
  if (/^\/portal\/quotations\/\d+/.test(url)) {
    return { title: 'Quotation', description: 'Review and approve your quotation' }
  }
  if (url === '/portal/recovery-reports') {
    return { title: 'Recovery reports', description: 'Review recovery items for audit and reimbursement' }
  }
  if (/^\/portal\/recovery-reports\/\d+/.test(url)) {
    return { title: 'Recovery item', description: 'Review and approve recovery details' }
  }
  if (url === '/portal/invoices') {
    return { title: 'Invoices', description: 'View balances and pay outstanding invoices' }
  }
  if (/^\/portal\/invoices\/\d+/.test(url)) {
    return { title: 'Invoice', description: 'View balance and submit payment' }
  }
  if (url === '/portal/users') {
    return { title: 'User management', description: 'People with access to your organization portal' }
  }
  if (url === '/portal/users/create') {
    return { title: 'Add user', description: 'Invite a colleague to your portal' }
  }
  if (/^\/portal\/users\/\d+\/edit/.test(url)) {
    return { title: 'Manage access', description: 'Assign portal privileges for this user' }
  }
  return { title: 'Client portal', description: 'DestinationZM customer portal' }
}

export function isPortalNavActive(item: PortalNavItem, url: string) {
  if (item.match) {
    return item.match(url)
  }
  return url === item.href || url.startsWith(`${item.href}?`)
}
