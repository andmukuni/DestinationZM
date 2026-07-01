import { Link } from '@adonisjs/inertia/react'
import { EyeIcon, PlusIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody } from '~/components/ui/card'
import { Table, TBody, TD, TH, THead, TR } from '~/components/ui/table'
import { TableActions, tableIconButtonClass } from '~/components/ui/table_icon_button'
import { brandButtonPrimaryClass } from '~/lib/brand_theme'
import { stopRowClickProps } from '~/lib/table_row'
import { statusTone } from '~/lib/status_tone'
import { formatCurrency } from '~/lib/format'

type EnquiryRow = {
  id: number
  reference: string
  customer: { id: number | null; name: string; email: string | null }
  branch: string
  destination: string
  departDate: string
  returnDate: string | null
  travelDates: string
  pax: number
  productType: string
  amount: number
  currency: string
  status: string
  statusLabel: string
  createdAt: string
  assignedAgent: string | null
  itemCount: number
  servicesLabel: string
}

type EnquiriesIndexProps = {
  pageTitle?: string
  pageDescription?: string
  canCreateQuotation: boolean
  enquiries: EnquiryRow[]
}

export default function EnquiriesIndex({ canCreateQuotation, enquiries }: EnquiriesIndexProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
            New enquiries submitted from the client portal that still need a quotation. Create one to move
            them forward.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden">
        {enquiries.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">No enquiries under review right now.</p>
            <p className="mt-1 text-xs text-slate-500">
              When a client submits an enquiry from their portal it will appear here.
            </p>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <Table scrollContainer={false} className="w-full min-w-[1080px]">
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Client</TH>
                  <TH>Destination</TH>
                  <TH>Travel dates</TH>
                  <TH>Pax</TH>
                  <TH>Status</TH>
                  <TH>Amount</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {enquiries.map((enquiry) => (
                  <TR key={enquiry.id} href={`/enquiries/${enquiry.id}`}>
                    <TD className="font-medium text-slate-900">
                      <div>{enquiry.reference}</div>
                      <div className="text-xs text-slate-500">Submitted {enquiry.createdAt}</div>
                    </TD>
                    <TD>
                      <div className="font-medium text-slate-900">{enquiry.customer.name}</div>
                      {enquiry.customer.email ? (
                        <div className="text-xs text-slate-500">{enquiry.customer.email}</div>
                      ) : null}
                    </TD>
                    <TD>
                      <div>{enquiry.destination}</div>
                      <div className="text-xs text-slate-500">
                        {enquiry.servicesLabel} · {enquiry.branch}
                      </div>
                    </TD>
                    <TD className="text-slate-700">{enquiry.travelDates}</TD>
                    <TD className="text-slate-700">{enquiry.pax}</TD>
                    <TD>
                      <Badge tone={statusTone(enquiry.status)}>{enquiry.statusLabel}</Badge>
                    </TD>
                    <TD className="font-medium text-slate-900">
                      {enquiry.amount > 0 ? formatCurrency(enquiry.amount, enquiry.currency) : '—'}
                    </TD>
                    <TD className="text-right" {...stopRowClickProps}>
                      <TableActions>
                        {canCreateQuotation ? (
                          <Link
                            href={`/quotations/create?bookingId=${enquiry.id}`}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-white ${brandButtonPrimaryClass}`}
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                            Create quotation
                          </Link>
                        ) : null}
                        <Link
                          href={`/enquiries/${enquiry.id}`}
                          className={tableIconButtonClass('secondary')}
                          title="View enquiry"
                          aria-label="View enquiry"
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
