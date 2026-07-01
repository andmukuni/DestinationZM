import {
  CalendarIcon,
  CheckCircleIcon,
  CustomersIcon,
  MapPinIcon,
  PackagesIcon,
  PlaneIcon,
  UserGroupIcon,
  WalletIcon,
} from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody } from '~/components/ui/card'
import { KpiCard } from '~/components/ui/kpi_card'
import { PageHeader } from '~/components/ui/page_header'
import { kpiGridClass } from '~/lib/kpi_grid'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'

import type { UserRole } from '#types/user_roles'
import type { BookingStatus } from '#types/booking_status'

type DashboardProps = {
  role: UserRole
  officeName: string | null
  stats: {
    activeBookings: number
    revenueThisMonth: string
    upcomingDepartures: number
    pendingInquiries: number
    confirmedTours: number
    packagesSoldYtd: number
    newCustomersThisMonth: number
    officeName: string | null
    recoveryReportPending?: number
    recoveryPendingInvoice?: number
    recoverySentToClient?: number
    recoveryQueried?: number
    recoveryOutstanding?: string
  }
  recentBookings: Array<{
    id: number
    customer: string
    destination: string
    departDate: string
    returnDate: string
    status: BookingStatus | string
    statusLabel: string
    amount: string
    agent: string
  }>
  popularDestinations: Array<{
    name: string
    bookings: number
    revenue: string
  }>
  upcomingDepartures: Array<{
    id: number
    customer: string
    destination: string
    date: string
    pax: number
  }>
}

function statusTone(status: BookingStatus | string) {
  if (status === 'confirmed') return 'success'
  if (status === 'draft' || status === 'pending') return 'warning'
  if (status === 'cancelled') return 'danger'
  return 'default'
}

export default function Dashboard({ role, officeName, stats, recentBookings, popularDestinations, upcomingDepartures }: DashboardProps) {
  const isBranchUser = role === 'reservations' || role === 'operations' || role === 'recovery'
  const showRecoveryKpi =
    role === 'recovery' || role === 'management' || role === 'executive' || role === 'finance'
  const showRecoveryReportingKpi = role === 'finance' || role === 'management' || role === 'executive' || role === 'admin'

  const kpis = [
    {
      key: 'active-bookings',
      label: 'Active enquiries',
      value: stats.activeBookings,
      icon: PlaneIcon,
      variant: 'accent' as const,
    },
    {
      key: 'revenue',
      label: 'Revenue this month',
      value: stats.revenueThisMonth,
      icon: WalletIcon,
    },
    {
      key: 'upcoming-departures',
      label: 'Upcoming departures',
      value: stats.upcomingDepartures,
      subValue: 'Next 7 days',
      icon: CalendarIcon,
    },
    {
      key: 'pending-inquiries',
      label: 'Pending inquiries',
      value: stats.pendingInquiries,
      icon: UserGroupIcon,
    },
    ...(showRecoveryKpi
      ? [
          {
            key: 'recovery-pending',
            label: 'Recovery items pending',
            value: stats.recoveryReportPending ?? 0,
            icon: WalletIcon,
          },
        ]
      : []),
    ...(showRecoveryReportingKpi
      ? [
          {
            key: 'recovery-outstanding',
            label: 'Recovery outstanding',
            value: stats.recoveryOutstanding ?? 'ZMW 0',
            icon: WalletIcon,
          },
          {
            key: 'recovery-pending-invoice',
            label: 'Pending invoice',
            value: stats.recoveryPendingInvoice ?? 0,
            icon: UserGroupIcon,
          },
          {
            key: 'recovery-sent-queried',
            label: 'Sent / queried',
            value: `${stats.recoverySentToClient ?? 0} / ${stats.recoveryQueried ?? 0}`,
            icon: CheckCircleIcon,
          },
        ]
      : []),
    {
      key: 'confirmed-tours',
      label: 'Confirmed tours',
      value: stats.confirmedTours,
      icon: CheckCircleIcon,
    },
    {
      key: 'packages-sold',
      label: 'Packages sold (YTD)',
      value: stats.packagesSoldYtd,
      icon: PackagesIcon,
    },
    {
      key: 'new-customers',
      label: 'New customers',
      value: stats.newCustomersThisMonth,
      subValue: 'This month',
      icon: CustomersIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          isBranchUser
            ? `Your enquiries overview${officeName ? ` for ${officeName}` : ''}.`
            : officeName
              ? `Agency overview for ${officeName}.`
              : 'DestinationZM agency overview across all offices.'
        }
      />

      <div className={`grid gap-3 ${kpiGridClass(kpis.length)}`}>
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            subValue={'subValue' in kpi ? kpi.subValue : undefined}
            icon={kpi.icon}
            variant={'variant' in kpi ? kpi.variant : 'dark'}
          />
        ))}
      </div>

      <Card>
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">Recent enquiries</h2>
          <p className="mt-0.5 text-sm text-slate-600">Latest tour and travel reservations</p>
        </div>
        {recentBookings.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">No enquiries yet.</p>
        ) : (
          <CardBody className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Destination</TH>
                  <TH>Travel dates</TH>
                  <TH>Status</TH>
                  <TH>Amount</TH>
                  <TH>Agent</TH>
                </TR>
              </THead>
              <TBody>
                {recentBookings.map((row) => (
                  <TR key={row.id} href={`/bookings/${row.id}`}>
                    <TD className="font-medium text-slate-900">{row.customer}</TD>
                    <TD>{row.destination}</TD>
                    <TD className="text-slate-600">
                      {row.departDate} – {row.returnDate}
                    </TD>
                    <TD>
                      <Badge tone={statusTone(row.status)}>{row.statusLabel}</Badge>
                    </TD>
                    <TD className="font-medium text-slate-900">{row.amount}</TD>
                    <TD className="text-slate-600">{row.agent}</TD>
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
            <h2 className="text-base font-semibold text-slate-900">Popular destinations</h2>
            <p className="mt-0.5 text-sm text-slate-600">Top Zambia destinations by enquiries</p>
          </div>
          <CardBody className="divide-y divide-slate-100 p-0">
            {popularDestinations.map((destination) => (
              <div key={destination.name} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-slate-900">{destination.name}</p>
                    <p className="text-sm text-slate-500">{destination.bookings} enquiries</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-900">{destination.revenue}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-base font-semibold text-slate-900">Upcoming departures</h2>
            <p className="mt-0.5 text-sm text-slate-600">Groups leaving in the next 7 days</p>
          </div>
          <CardBody className="divide-y divide-slate-100 p-0">
            {upcomingDepartures.map((departure) => (
              <div key={departure.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">{departure.customer}</p>
                  <p className="text-sm text-slate-500">{departure.destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{departure.date}</p>
                  <p className="text-sm text-slate-500">{departure.pax} travellers</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
