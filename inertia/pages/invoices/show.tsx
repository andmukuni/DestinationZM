import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import InvoiceDocument, { type InvoiceDocumentData } from '~/components/portal/invoice_document'
import InvoiceDocumentActions from '~/components/portal/invoice_document_actions'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { formatCurrency, formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type InvoicesShowProps = {
  pageTitle?: string
  pageDescription?: string
  invoiceId: number
  document: InvoiceDocumentData
  statusTone: 'warning' | 'info' | 'success' | 'danger' | 'default'
  canIssue: boolean
  canMarkPaid: boolean
  canManage: boolean
  balanceDue: number
  booking: {
    id: number
    reference: string
  } | null
  quotation: {
    id: number
    reference: string
  } | null
  receipts: Array<{
    id: number
    receiptNumber: string
    amount: number
    receivedDate: string
  }>
  payments: Array<{
    id: number
    reference: string
    amount: number
    status: string
  }>
  currency: string
  quickbooks: {
    connected: boolean
    status: string | null
    quickbooksInvoiceId: string | null
    lastError: string | null
    syncedAt: string | null
  }
}

function quickbooksTone(status: string | null): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'synced') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'failed') return 'danger'
  return 'default'
}

function quickbooksLabel(status: string | null, connected: boolean) {
  if (!connected) return 'Not connected'
  if (!status) return 'Not synced'
  if (status === 'synced') return 'Synced'
  if (status === 'pending') return 'Pending'
  if (status === 'failed') return 'Failed'
  return status
}

export default function InvoicesShow({
  invoiceId,
  document,
  statusTone: documentStatusTone,
  canIssue,
  canMarkPaid,
  canManage,
  balanceDue,
  booking,
  quotation,
  receipts,
  payments,
  currency,
  quickbooks,
}: InvoicesShowProps) {
  const downloadUrl = `/invoices/${invoiceId}/download`
  const hasPaymentHistory = receipts.length > 0 || payments.length > 0

  return (
    <div className="space-y-6">
      <Link
        route="invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 print:hidden"
      >
        <ArrowLeftIcon />
        Back to invoices
      </Link>

      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex justify-start print:hidden">
          <InvoiceDocumentActions
            invoiceId={invoiceId}
            invoiceNumber={document.invoiceNumber}
            downloadUrl={downloadUrl}
            canIssue={canIssue}
            canMarkPaid={canMarkPaid}
            balanceDue={balanceDue}
            currency={currency}
            booking={booking}
            quotation={quotation}
          />
        </div>

        <InvoiceDocument
          id="invoice-document"
          document={document}
          statusTone={documentStatusTone}
        />

        <Card className="print:hidden">
          <CardHeader title="QuickBooks sync" />
          <CardBody className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={quickbooksTone(quickbooks.status)}>
                {quickbooksLabel(quickbooks.status, quickbooks.connected)}
              </Badge>
              {quickbooks.quickbooksInvoiceId ? (
                <span className="text-sm text-slate-600">
                  QBO invoice ID: {quickbooks.quickbooksInvoiceId}
                </span>
              ) : null}
            </div>
            {quickbooks.syncedAt ? (
              <p className="text-sm text-slate-600">
                Last synced: {new Date(quickbooks.syncedAt).toLocaleString()}
              </p>
            ) : null}
            {quickbooks.lastError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {quickbooks.lastError}
              </p>
            ) : null}
            {canManage && quickbooks.connected && quickbooks.status === 'failed' ? (
              <Form route="invoices.quickbooks.retry" routeParams={{ id: invoiceId }}>
                <Button type="submit" variant="secondary">
                  Retry QuickBooks sync
                </Button>
              </Form>
            ) : null}
          </CardBody>
        </Card>
      </div>

      {hasPaymentHistory ? (
        <div className="mx-auto max-w-4xl space-y-6 print:hidden">
          {receipts.length > 0 ? (
            <Card>
              <CardHeader title="Receipts" description={`${receipts.length} receipt(s)`} />
              <CardBody className="p-0">
                <Table scrollContainer={false}>
                  <THead>
                    <TR>
                      <TH>Receipt number</TH>
                      <TH>Amount</TH>
                      <TH>Received date</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {receipts.map((receipt) => (
                      <TR key={receipt.id}>
                        <TD className="font-medium text-slate-900">{receipt.receiptNumber}</TD>
                        <TD>{formatCurrency(receipt.amount, currency)}</TD>
                        <TD className="text-slate-600">{receipt.receivedDate}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardBody>
            </Card>
          ) : null}

          {payments.length > 0 ? (
            <Card>
              <CardHeader title="Payments" description={`${payments.length} payment(s)`} />
              <CardBody className="p-0">
                <Table scrollContainer={false}>
                  <THead>
                    <TR>
                      <TH>Reference</TH>
                      <TH>Amount</TH>
                      <TH>Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {payments.map((payment) => (
                      <TR key={payment.id}>
                        <TD className="font-medium text-slate-900">{payment.reference}</TD>
                        <TD>{formatCurrency(payment.amount, currency)}</TD>
                        <TD>
                          <Badge tone={statusTone(payment.status)}>
                            {formatStatusLabel(payment.status)}
                          </Badge>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
