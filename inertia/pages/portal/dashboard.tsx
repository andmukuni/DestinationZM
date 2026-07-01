import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { type Data } from '@generated/data'
import { hasPortalPrivilege } from '~/lib/portal_privileges'
import {
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  PlaneIcon,
  TicketsIcon,
  WalletIcon,
  ArrearsIcon,
} from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody } from '~/components/ui/card'
import { KpiCard } from '~/components/ui/kpi_card'
import { PageHeader } from '~/components/ui/page_header'
import { portalLinkClassSm, portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { kpiGridClass } from '~/lib/kpi_grid'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { TableActions } from '~/components/ui/table_icon_button'
import { stopRowClickProps } from '~/lib/table_row'
import { formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type PortalDashboardProps = {
  pageTitle?: string
  pageDescription?: string
  stats: {
    activeBookings: number
    pendingActions: number
    outstandingBalance: string
    upcomingTrips: number
    quotationsToReview: number
    reportsToConfirm: number
    invoicesToPay: number
    overdueInvoices: number
    completedTrips: number
    totalPaid: string
  }
  bookings: Array<{
    id: number
    reference: string
    destination: string
    departDate: string
    returnDate: string
    status: string
    statusLabel: string
    amount: string
  }>
  upcomingTrips: Array<{
    id: number
    reference: string
    destination: string
    departDate: string
    pax: number | null
    statusLabel: string
  }>
  recentInvoices: Array<{
    id: number
    invoiceNumber: string
    status: string
    balance: string
    dueDate: string
    bookingReference: string | null
    canPay: boolean
  }>
}

export default function PortalDashboard({
  pageTitle,
  pageDescription,
  stats,
  bookings,
  upcomingTrips,
  recentInvoices,
}: PortalDashboardProps) {
  const { portalClient } = usePage<Data.SharedProps>().props
  const organizationName = pageDescription ?? portalClient?.organization.name
  const canCreateBooking = hasPortalPrivilege(portalClient?.privileges, 'create_booking')
  const canViewInvoices = hasPortalPrivilege(portalClient?.privileges, 'view_invoices')
  const canViewQuotations = hasPortalPrivilege(portalClient?.privileges, 'view_quotations')

  const kpis = [
    {
      key: 'active-bookings',
      label: 'Active bookings',
      value: stats.activeBookings,
      icon: PlaneIcon,
      variant: 'accent' as const,
      href: '/portal/bookings',
    },
    {
      key: 'pending-actions',
      label: 'Pending actions',
      value: stats.pendingActions,
      subValue: 'Needs attention',
      icon: TicketsIcon,
      contextTone: 'warning' as const,
    },
    {
      key: 'outstanding-balance',
      label: 'Outstanding balance',
      value: stats.outstandingBalance,
      subValue: stats.invoicesToPay > 0 ? `${stats.invoicesToPay} due` : 'All paid up',
      icon: WalletIcon,
      href: canViewInvoices ? '/portal/invoices' : undefined,
    },
    {
      key: 'upcoming-trips',
      label: 'Upcoming trips',
      value: stats.upcomingTrips,
      subValue: 'Next 30 days',
      icon: CalendarIcon,
    },
    {
      key: 'quotations',
      label: 'Quotations to review',
      value: stats.quotationsToReview,
      icon: TicketsIcon,
      href: canViewQuotations ? '/portal/quotations?status=pending' : undefined,
    },
    {
      key: 'reports',
      label: 'Reports to confirm',
      value: stats.reportsToConfirm,
      icon: CheckCircleIcon,
    },
    {
      key: 'invoices',
      label: 'Invoices to pay',
      value: stats.invoicesToPay,
      subValue: stats.overdueInvoices > 0 ? `${stats.overdueInvoices} overdue` : undefined,
      contextTone: stats.overdueInvoices > 0 ? ('danger' as const) : ('default' as const),
      icon: ArrearsIcon,
      href: canViewInvoices ? '/portal/invoices' : undefined,
    },
    {
      key: 'total-paid',
      label: 'Total paid',
      value: stats.totalPaid,
      subValue: `${stats.completedTrips} completed`,
      icon: WalletIcon,
      variant: 'accent' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle ?? 'Dashboard'}
        description={
          organizationName ? `Travel overview for ${organizationName}.` : 'Your travel overview.'
        }
      />

      <div className={`grid gap-4 ${kpiGridClass(kpis.length)}`}>
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            subValue={kpi.subValue}
            icon={kpi.icon}
            variant={'variant' in kpi ? kpi.variant : 'dark'}
            contextTone={'contextTone' in kpi ? kpi.contextTone : 'default'}
            href={kpi.href}
          />
        ))}
      </div>

      <Card>
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Recent bookings</h2>
          <p className="mt-0.5 text-sm text-slate-600">Your latest enquiries and reservations</p>
        </div>
        {bookings.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">You have no bookings yet.</p>
            {canCreateBooking ? (
              <Link
                route="portal.bookings.create"
                className={`mt-3 inline-block ${portalLinkClassSm}`}
              >
                Submit your first enquiry
              </Link>
            ) : null}
          </CardBody>
        ) : (
          <CardBody className="p-0">
            <Table scrollContainer={false}>
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Destination</TH>
                  <TH>Travel dates</TH>
                  <TH>Status</TH>
                  <TH>Amount</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {bookings.map((booking) => (
                  <TR key={booking.id} href={`/portal/bookings/${booking.id}`}>
                    <TD className="font-medium text-slate-900">{booking.reference}</TD>
                    <TD>{booking.destination}</TD>
                    <TD className="text-slate-600">
                      {booking.departDate}
                      {booking.returnDate !== '—' ? ` – ${booking.returnDate}` : ''}
                    </TD>
                    <TD>
                      <Badge tone={statusTone(booking.status)}>{booking.statusLabel}</Badge>
                    </TD>
                    <TD className="font-medium text-slate-900">{booking.amount}</TD>
                    <TD {...stopRowClickProps}>
                      <TableActions>
                        <Link
                          route="portal.bookings.show"
                          routeParams={{ id: booking.id }}
                          className={portalTableIconPrimaryClass}
                          title="View booking"
                          aria-label="View booking"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </TableActions>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Upcoming departures</h2>
            <p className="mt-0.5 text-sm text-slate-600">Trips leaving soon</p>
          </div>
          {upcomingTrips.length === 0 ? (
            <CardBody>
              <p className="text-sm text-slate-500">No upcoming trips scheduled.</p>
            </CardBody>
          ) : (
            <CardBody className="divide-y divide-slate-100 p-0">
              {upcomingTrips.map((trip) => (
                <Link
                  key={trip.id}
                  route="portal.bookings.show"
                  routeParams={{ id: trip.id }}
                  className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{trip.destination}</p>
                    <p className="text-sm text-slate-500">{trip.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{trip.departDate}</p>
                    <p className="text-sm text-slate-500">
                      {trip.pax ?? '—'} traveller{trip.pax === 1 ? '' : 's'} · {trip.statusLabel}
                    </p>
                  </div>
                </Link>
              ))}
            </CardBody>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent invoices</h2>
              <p className="mt-0.5 text-sm text-slate-600">Latest billing and balances</p>
            </div>
            <Link route="portal.invoices" className={portalLinkClassSm}>
              View all
            </Link>
          </div>
          {recentInvoices.length === 0 ? (
            <CardBody>
              <p className="text-sm text-slate-500">No invoices yet.</p>
            </CardBody>
          ) : (
            <CardBody className="divide-y divide-slate-100 p-0">
              {recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  route="portal.invoices.show"
                  routeParams={{ id: invoice.id }}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-500">
                      {invoice.bookingReference ?? '—'} · Due {invoice.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{invoice.balance}</p>
                    <Badge tone={statusTone(invoice.status)}>{formatStatusLabel(invoice.status)}</Badge>
                  </div>
                </Link>
              ))}
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  )
}
