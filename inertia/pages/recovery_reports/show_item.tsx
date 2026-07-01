import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import RecoveryTravelItemsTable, {
  type RecoveryTravelItemRow,
} from '~/components/recovery_travel_items_table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { FileDownloadLink } from '~/components/ui/file_download_link'
import { brandLinkClass } from '~/lib/brand_theme'
import { formatCurrency } from '~/lib/format'
import { buildRecoveryExportUrl } from '~/lib/recovery_export'
import { statusTone } from '~/lib/status_tone'

type ShowItemProps = {
  item: {
    id: number
    recoveryReference: string
    recoveryStatus: string
    recoveryStatusLabel: string
    bookingReference: string
    bookingId: number
    travelerName: string
    productType: string
    supplierName: string
    pnr: string | null
    itineraryService: string
    travelStart: string
    travelEnd: string
    price: number
    currency: string
    invoiceReceiptNumber: string | null
    tripName: string
    tripReason: string
    costCenter: string
    approvedBy: string
    generalLedgerAccount: string
    dateRequested: string
    dzPaymentDate: string
    dzPaymentReference: string
    clientQuery: string | null
    rejectionReason: string | null
    dzPaymentStatus: string
    amountPaidByDz: number
    invoiceDocumentId: number | null
  }
  invoice: { id: number; invoiceNumber: string; status: string } | null
  quotation: { id: number; reference: string } | null
  travelItemsTable: {
    displayColumns: string[]
    rows: RecoveryTravelItemRow[]
    totalPrice: number
  }
  auditLogs: Array<{ id: number; action: string; oldStatus: string | null; newStatus: string | null; description: string | null; performedAt: string }>
  canManage: boolean
}

export default function RecoveryReportShowItem({
  item,
  invoice,
  quotation,
  travelItemsTable,
  auditLogs,
  canManage,
}: ShowItemProps) {
  const recoveryStatus = item.recoveryStatus
  const recoveryStatusLabel = item.recoveryStatusLabel
  const headerActions = [
    item.invoiceDocumentId ? (
      <FileDownloadLink key="invoice" href={`/documents/${item.invoiceDocumentId}/download`}>
        <Button variant="secondary" size="sm">
          Supplier invoice
        </Button>
      </FileDownloadLink>
    ) : null,
    canManage && (recoveryStatus === 'READY_FOR_CLIENT' || recoveryStatus === 'QUERY_RAISED') ? (
      <Form key="send" action={`/recovery-reports/items/${item.id}/send-to-client`} method="post">
        <Button type="submit" size="sm">
          Send to client
        </Button>
      </Form>
    ) : null,
    <FileDownloadLink
      key="export-excel"
      href={buildRecoveryExportUrl('/recovery-reports/export', { recoveryItemId: item.id })}
      className="inline-flex"
    >
      <Button variant="secondary" size="sm">
        Export Excel
      </Button>
    </FileDownloadLink>,
    <FileDownloadLink
      key="export-pdf"
      href={buildRecoveryExportUrl('/recovery-reports/export-pdf', { recoveryItemId: item.id })}
      className="inline-flex"
    >
      <Button variant="secondary" size="sm">
        Export PDF
      </Button>
    </FileDownloadLink>,
    canManage && recoveryStatus === 'APPROVED_BY_CLIENT' ? (
      <Form key="recover" action={`/recovery-reports/items/${item.id}/mark-recovered`} method="post">
        <Button type="submit" size="sm">
          Mark recovered
        </Button>
      </Form>
    ) : null,
  ].filter(Boolean)

  const metaItems = [
    { label: 'Booking', value: item.bookingReference },
    invoice ? { label: 'Invoice', value: invoice.invoiceNumber, href: `/invoices/${invoice.id}` } : null,
    quotation ? { label: 'Quotation', value: quotation.reference, href: `/quotations/${quotation.id}` } : null,
    { label: 'Traveler', value: item.travelerName },
    item.supplierName && item.supplierName !== '—'
      ? { label: 'Supplier', value: item.supplierName }
      : null,
    { label: 'Product', value: item.productType },
  ].filter((entry): entry is { label: string; value: string; href?: string } =>
    Boolean(entry && entry.value && entry.value !== '—')
  )

  return (
    <div className="space-y-5">
      <Link href="/recovery-reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeftIcon />
        Back to recovery reporting
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{item.recoveryReference}</h1>
            <Badge tone={statusTone(recoveryStatus.toLowerCase())}>{recoveryStatusLabel}</Badge>
            <span className="text-sm font-medium text-slate-700">
              {formatCurrency(travelItemsTable.totalPrice || item.price, item.currency)}
            </span>
          </div>
          {headerActions.length > 0 ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div>
          ) : null}
        </div>

        {metaItems.length > 0 ? (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            {metaItems.map((entry) => (
              <span key={entry.label} className="inline-flex min-w-0 items-baseline gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{entry.label}</span>
                {entry.href ? (
                  <Link href={entry.href} className={brandLinkClass}>
                    {entry.value}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-800">{entry.value}</span>
                )}
              </span>
            ))}
          </p>
        ) : null}
      </div>

      {item.clientQuery ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Client query: {item.clientQuery}</p>
      ) : null}
      {item.rejectionReason ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900">Rejected: {item.rejectionReason}</p>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader
          title="Travel items"
          description={`${travelItemsTable.rows.length} line item${travelItemsTable.rows.length === 1 ? '' : 's'} for FNB recovery`}
        />
        <CardBody className="p-4">
          {travelItemsTable.rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No travel items linked to this recovery report yet.
            </p>
          ) : (
            <RecoveryTravelItemsTable
              columns={travelItemsTable.displayColumns}
              rows={travelItemsTable.rows}
              totalPrice={travelItemsTable.totalPrice}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Audit trail" />
        <CardBody>
          <ul className="space-y-3">
            {auditLogs.map((log) => (
              <li key={log.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.performedAt}</p>
                </div>
                {log.description ? <p className="mt-1 text-sm text-slate-600">{log.description}</p> : null}
                {log.newStatus ? <p className="mt-1 text-xs text-slate-500">{log.oldStatus ?? '—'} → {log.newStatus}</p> : null}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
