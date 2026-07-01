import { Link } from '@adonisjs/inertia/react'
import { EyeIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody } from '~/components/ui/card'
import { portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { TableActions, tableIconButtonClass } from '~/components/ui/table_icon_button'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { stopRowClickProps } from '~/lib/table_row'
import { statusTone } from '~/lib/status_tone'

type PortalBookingsIndexProps = {
  pageTitle?: string
  pageDescription?: string
  canCreateBooking: boolean
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
}

export default function PortalBookingsIndex({ canCreateBooking, bookings }: PortalBookingsIndexProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            Track enquiries, quotations, and confirmed trips for your organization.
          </p>
        </div>
        {canCreateBooking ? (
          <Link route="portal.bookings.create">
            <Button>New enquiry</Button>
          </Link>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        {bookings.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">No bookings to show yet.</p>
            {canCreateBooking ? (
              <Link
                route="portal.bookings.create"
                className="mt-3 inline-block text-sm font-medium text-orange-600 hover:underline"
              >
                Submit your first enquiry
              </Link>
            ) : null}
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <Table scrollContainer={false} className="w-full min-w-[880px]">
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Destination</TH>
                  <TH>Travel dates</TH>
                  <TH>Status</TH>
                  <TH>Amount</TH>
                  <TH className="text-right">Actions</TH>
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
                    <TD className="text-right" {...stopRowClickProps}>
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
          </div>
        )}
      </Card>
    </div>
  )
}
