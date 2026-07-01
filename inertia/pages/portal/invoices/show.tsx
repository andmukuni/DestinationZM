import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import InvoiceDocument, { type InvoiceDocumentData } from '~/components/portal/invoice_document'
import PortalInvoiceDocumentActions from '~/components/portal/portal_invoice_document_actions'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { ConfirmSubmitButton } from '~/components/ui/confirm_submit_button'
import { formatCurrency } from '~/lib/format'

type PortalInvoicesShowProps = {
  pageTitle?: string
  pageDescription?: string
  invoiceId: number
  document: InvoiceDocumentData
  statusTone: 'warning' | 'info' | 'success' | 'danger' | 'default'
  canPay: boolean
  balance: number
  currency: string
  booking: {
    id: number
  } | null
  quotation: {
    id: number
  } | null
}

const fieldClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100'

export default function PortalInvoicesShow({
  invoiceId,
  document,
  statusTone,
  canPay,
  balance,
  currency,
  booking,
  quotation,
}: PortalInvoicesShowProps) {
  const downloadUrl = `/portal/invoices/${invoiceId}/download`

  return (
    <div className="space-y-6">
      <Link
        route="portal.invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 print:hidden"
      >
        <ArrowLeftIcon />
        Back to invoices
      </Link>

      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex justify-start print:hidden">
          <PortalInvoiceDocumentActions
            downloadUrl={downloadUrl}
            canPay={canPay}
            payHref="#pay-invoice"
            quotation={quotation}
            booking={booking}
          />
        </div>

        <InvoiceDocument id="invoice-document" document={document} statusTone={statusTone} />
      </div>

      {canPay ? (
        <div id="pay-invoice" className="mx-auto max-w-4xl print:hidden">
          <Card>
            <CardHeader title="Submit payment" />
            <CardBody>
              <Form route="portal.invoices.pay" routeParams={{ id: invoiceId }} className="space-y-4">
                {({ errors }) => (
                  <>
                    <input type="hidden" name="amount" value={balance} />
                    <div className="space-y-1.5">
                      <label htmlFor="paymentMethod" className="text-sm font-medium text-slate-600">
                        Payment method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className={fieldClass}
                        defaultValue="bank_transfer"
                      >
                        <option value="bank_transfer">Bank transfer</option>
                        <option value="mobile_money">Mobile money</option>
                        <option value="card">Card</option>
                      </select>
                      {errors.paymentMethod ? (
                        <p className="text-sm text-red-600">{errors.paymentMethod}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="paymentReference" className="text-sm font-medium text-slate-600">
                        Payment reference (optional)
                      </label>
                      <input
                        id="paymentReference"
                        name="paymentReference"
                        type="text"
                        className={fieldClass}
                      />
                    </div>
                    <ConfirmSubmitButton
                      className="bg-orange-600 hover:bg-orange-700"
                      title="Pay invoice?"
                      description={`Submit payment of ${formatCurrency(balance, currency)} for this invoice?`}
                      confirmLabel="Pay invoice"
                    >
                      Pay {formatCurrency(balance, currency)}
                    </ConfirmSubmitButton>
                  </>
                )}
              </Form>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
