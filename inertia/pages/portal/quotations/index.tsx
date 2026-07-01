import { Link } from '@adonisjs/inertia/react'
import { CheckCircleIcon, EyeIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Table, TBody, TD, TH, THead, TR } from '~/components/ui/table'
import { portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { TableActions, tableIconButtonClass } from '~/components/ui/table_icon_button'
import { useRouterLoading } from '~/hooks/use_router_loading'
import { formatCurrency } from '~/lib/format'
import { stopRowClickProps } from '~/lib/table_row'

type QuotationRow = {
  id: number
  reference: string
  status: string
  statusLabel: string
  statusTone: 'warning' | 'info' | 'success' | 'danger' | 'default'
  totalAmount: number
  currency: string
  validUntil: string | null
  createdAt: string
  bookingReference: string | null
  enquiryReference: string | null
  needsApproval: boolean
}

type PortalQuotationStatusFilter = 'all' | 'pending' | 'approved'

type PortalQuotationsIndexProps = {
  pageTitle?: string
  pageDescription?: string
  canApprove: boolean
  filters: {
    status: PortalQuotationStatusFilter
  }
  quotations: QuotationRow[]
}

const STATUS_TABS: Array<{ id: PortalQuotationStatusFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Awaiting approval' },
  { id: 'approved', label: 'Approved' },
]

function buildQuotationsUrl(status: PortalQuotationStatusFilter) {
  if (status === 'all') {
    return '/portal/quotations'
  }
  return `/portal/quotations?status=${status}`
}

export default function PortalQuotationsIndex({
  canApprove,
  filters,
  quotations,
}: PortalQuotationsIndexProps) {
  const { loading, get } = useRouterLoading()
  const pendingCount = quotations.filter((row) => row.needsApproval).length

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600">
          Quotations sent by DestinationZM for your review and approval.
        </p>
        {canApprove && filters.status === 'pending' && pendingCount > 0 ? (
          <p className="mt-1 text-sm font-medium text-amber-800">
            {pendingCount} quotation{pendingCount === 1 ? '' : 's'} awaiting your approval.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={loading}
            onClick={() => get(buildQuotationsUrl(tab.id))}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition',
              filters.status === tab.id
                ? 'bg-orange-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title="Quotations" />
        {quotations.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">
              {filters.status === 'pending'
                ? 'No quotations are waiting for your approval.'
                : filters.status === 'approved'
                  ? 'No approved quotations yet.'
                  : 'You have no quotations yet.'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Quotations appear here after our team prepares and sends them from your enquiry.
            </p>
          </CardBody>
        ) : (
          <CardBody className="p-0">
            <Table scrollContainer={false}>
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Enquiry</TH>
                  <TH>Issued</TH>
                  <TH>Valid until</TH>
                  <TH>Status</TH>
                  <TH>Total</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {quotations.map((quotation) => (
                  <TR key={quotation.id} href={`/portal/quotations/${quotation.id}`}>
                    <TD className="font-medium text-slate-900">{quotation.reference}</TD>
                    <TD className="text-slate-600">{quotation.enquiryReference ?? '—'}</TD>
                    <TD className="text-slate-600">{quotation.createdAt}</TD>
                    <TD className="text-slate-600">{quotation.validUntil ?? '—'}</TD>
                    <TD>
                      <Badge tone={quotation.statusTone}>{quotation.statusLabel}</Badge>
                    </TD>
                    <TD className="font-medium text-slate-900">
                      {formatCurrency(quotation.totalAmount, quotation.currency)}
                    </TD>
                    <TD {...stopRowClickProps}>
                      <TableActions className="justify-start">
                        <Link
                          route="portal.quotations.show"
                          routeParams={{ id: quotation.id }}
                          className={portalTableIconPrimaryClass}
                          title="View quotation"
                          aria-label="View quotation"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        {canApprove && quotation.needsApproval ? (
                          <Link
                            route="portal.quotations.show"
                            routeParams={{ id: quotation.id }}
                            className={tableIconButtonClass('secondary')}
                            title="Approve quotation"
                            aria-label="Approve quotation"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </TableActions>
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
