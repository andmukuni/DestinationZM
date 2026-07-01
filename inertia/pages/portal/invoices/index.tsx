import { Link } from '@adonisjs/inertia/react'
import { EyeIcon, WalletIcon } from '~/components/icons'
import { Badge } from '~/components/ui/badge'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { portalTableIconPrimaryClass } from '~/lib/portal_theme'
import { TableActions, tableIconButtonClass } from '~/components/ui/table_icon_button'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { stopRowClickProps } from '~/lib/table_row'
import { formatCurrency, formatStatusLabel } from '~/lib/format'
import { statusTone } from '~/lib/status_tone'

type PortalInvoicesIndexProps = {
  pageTitle?: string
  pageDescription?: string
  invoices: Array<{
    id: number
    invoiceNumber: string
    status: string
    totalAmount: number
    amountPaid: number
    balance: number
    currency: string
    issueDate: string
    dueDate: string
    bookingReference: string | null
    canPay: boolean
  }>
}

export default function PortalInvoicesIndex({ invoices }: PortalInvoicesIndexProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="My invoices" />
        {invoices.length === 0 ? (
          <CardBody>
            <p className="text-sm text-slate-600">You have no invoices yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Invoices appear here after your enquiry is confirmed and issued by our team.
            </p>
          </CardBody>
        ) : (
          <CardBody className="p-0">
            <Table scrollContainer={false}>
              <THead>
                <TR>
                  <TH>Invoice</TH>
                  <TH>Enquiry</TH>
                  <TH>Issue date</TH>
                  <TH>Due date</TH>
                  <TH>Status</TH>
                  <TH>Balance</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {invoices.map((invoice) => (
                  <TR key={invoice.id} href={`/portal/invoices/${invoice.id}`}>
                    <TD className="font-medium text-slate-900">{invoice.invoiceNumber}</TD>
                    <TD className="text-slate-600">{invoice.bookingReference ?? '—'}</TD>
                    <TD className="text-slate-600">{invoice.issueDate}</TD>
                    <TD className="text-slate-600">{invoice.dueDate}</TD>
                    <TD>
                      <Badge tone={statusTone(invoice.status)}>{formatStatusLabel(invoice.status)}</Badge>
                    </TD>
                    <TD className="font-medium text-slate-900">
                      {formatCurrency(invoice.balance, invoice.currency)}
                    </TD>
                    <TD {...stopRowClickProps}>
                      <TableActions className="justify-start">
                        <Link
                          route="portal.invoices.show"
                          routeParams={{ id: invoice.id }}
                          className={portalTableIconPrimaryClass}
                          title="View invoice"
                          aria-label="View invoice"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        {invoice.canPay ? (
                          <Link
                            route="portal.invoices.show"
                            routeParams={{ id: invoice.id }}
                            className={tableIconButtonClass('secondary')}
                            title="Pay invoice"
                            aria-label="Pay invoice"
                          >
                            <WalletIcon className="h-4 w-4" />
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
