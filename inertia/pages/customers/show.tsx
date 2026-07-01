import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type CustomersShowProps = {
  customer: {
    id: number
    fullName: string
    email: string | null
    phone: string | null
    company: string | null
    notes: string | null
    branch: string
    branchId: number | null
    createdAt: string
    bookings: Array<{
      id: number
      reference: string
      destination: string
      departDate: string
      status: string
    }>
  }
}

export default function CustomersShow({ customer }: CustomersShowProps) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          route="customers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to customers
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{customer.fullName}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {customer.branch} · Created {customer.createdAt}
        </p>
      </div>

      <Card>
        <CardHeader title="Contact details" />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Company</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.company ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Office</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.branch}</dd>
            </div>
            {customer.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                <dd className="mt-1 text-sm text-slate-700">{customer.notes}</dd>
              </div>
            ) : null}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Enquiries"
          description={`${customer.bookings.length} enquir${customer.bookings.length === 1 ? 'y' : 'ies'}`}
        />
        {customer.bookings.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">No enquiries for this customer yet.</p>
          </CardBody>
        ) : (
          <CardBody className="p-0">
            <Table scrollContainer={false}>
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Destination</TH>
                  <TH>Depart date</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {customer.bookings.map((booking) => (
                  <TR key={booking.id} href={`/bookings/${booking.id}`}>
                    <TD className="font-medium text-slate-900">{booking.reference}</TD>
                    <TD>{booking.destination}</TD>
                    <TD className="text-slate-600">{booking.departDate}</TD>
                    <TD>
                      <Badge tone={statusTone(booking.status)}>
                        {formatStatusLabel(booking.status)}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardBody>
        )}
      </Card>
    </div>
  )
}
