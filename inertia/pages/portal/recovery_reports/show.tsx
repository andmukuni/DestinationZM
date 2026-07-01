import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import RecoveryTravelItemsTable, {
  type RecoveryTravelItemRow,
} from '~/components/recovery_travel_items_table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { statusTone } from '~/lib/status_tone'

type PortalRecoveryShowProps = {
  item: {
    id: number
    recoveryReference: string
    bookingId: number
    bookingReference: string
    productType: string
    travelerName: string
    pnr: string
    itineraryService: string
    invoiceReceiptNumber: string
    price: number
    currency: string
    costCenter: string
    approvedBy: string
    recoveryStatus: string
    recoveryStatusLabel: string
    tripName: string
    tripReason: string
    generalLedgerAccount: string
    dateRequested: string
    travelStart: string
    travelEnd: string
    clientQuery: string | null
    rejectionReason: string | null
    invoiceDocumentId: number | null
  }
  travelItemsTable: {
    displayColumns: string[]
    rows: RecoveryTravelItemRow[]
    totalPrice: number
    currentItemId: number
  }
  invoice: { id: number; invoiceNumber: string; status: string } | null
  quotation: { id: number; reference: string } | null
  auditLogs: Array<{ id: number; action: string; description: string | null; performedAt: string }>
  canApprove: boolean
  canQuery: boolean
  canReject: boolean
}

export default function PortalRecoveryReportsShow({
  item,
  travelItemsTable,
  invoice,
  quotation,
  auditLogs,
  canApprove,
  canQuery,
  canReject,
}: PortalRecoveryShowProps) {
  const actionable = ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'].includes(item.recoveryStatus)

  return (
    <div className="space-y-6">
      <Link href="/portal/recovery-reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon />Back to recovery reports
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{item.recoveryReference}</h1>
            <Badge tone={statusTone(item.recoveryStatus.toLowerCase())}>{item.recoveryStatusLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Enquiry {item.bookingReference} · {item.travelerName}
            {invoice ? (
              <>
                {' '}
                · Invoice{' '}
                <Link route="portal.invoices.show" routeParams={{ id: invoice.id }} className="font-medium text-orange-600 hover:underline">
                  {invoice.invoiceNumber}
                </Link>
              </>
            ) : null}
            {quotation ? (
              <>
                {' '}
                · Quotation{' '}
                <Link route="portal.quotations.show" routeParams={{ id: quotation.id }} className="font-medium text-orange-600 hover:underline">
                  {quotation.reference}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.invoiceDocumentId ? (
            <Link href={`/portal/recovery-reports/${item.id}/document`}>
              <Button variant="secondary">Download supplier invoice</Button>
            </Link>
          ) : null}
          <Link route="portal.bookings.show" routeParams={{ id: item.bookingId }}>
            <Button>View enquiry</Button>
          </Link>
        </div>
      </div>

      {item.clientQuery ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Query: {item.clientQuery}</p>
      ) : null}
      {item.rejectionReason ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">Rejected: {item.rejectionReason}</p>
      ) : null}

      <Card>
        <CardHeader
          title="Travel items"
          description={
            quotation
              ? `Each enquiry line matched to the corresponding invoice item from quotation ${quotation.reference}${invoice ? ` / invoice ${invoice.invoiceNumber}` : ''}.`
              : invoice
                ? `Enquiry lines matched to invoice ${invoice.invoiceNumber}.`
                : 'Enquiry line items for this recovery report.'
          }
        />
        <CardBody className="p-4 sm:p-4">
          {travelItemsTable.rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No travel items linked to this recovery report yet.
            </p>
          ) : (
            <RecoveryTravelItemsTable
              columns={travelItemsTable.displayColumns}
              rows={travelItemsTable.rows}
              totalPrice={travelItemsTable.totalPrice}
              currentItemId={travelItemsTable.currentItemId}
            />
          )}
        </CardBody>
      </Card>

      {actionable ? (
        <Card>
          <CardHeader title="Your decision" />
          <CardBody className="space-y-4">
            {canApprove ? (
              <Form action={`/portal/recovery-reports/${item.id}/approve`} method="post">
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Approve recovery item</Button>
              </Form>
            ) : null}
            {canQuery ? (
              <Form action={`/portal/recovery-reports/${item.id}/query`} method="post" className="space-y-3">
                <textarea name="query" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Describe your query…" required />
                <Button type="submit" variant="secondary">Raise query</Button>
              </Form>
            ) : null}
            {canReject ? (
              <Form action={`/portal/recovery-reports/${item.id}/reject`} method="post" className="space-y-3">
                <textarea name="reason" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Reason for rejection…" required />
                <Button type="submit" variant="danger">Reject recovery item</Button>
              </Form>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="Audit trail" />
        <CardBody>
          <ul className="space-y-2">
            {auditLogs.map((log) => (
              <li key={log.id} className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">{log.action}</span> · {log.performedAt}
                {log.description ? ` — ${log.description}` : ''}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
