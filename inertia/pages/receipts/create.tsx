import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { formatCurrency } from '~/lib/format'

type ReceiptsCreateProps = {
  invoices: Array<{
    id: number
    invoiceNumber: string
    customerName: string
    totalAmount: number
    amountPaid: number
    currency: string
  }>
}

export default function ReceiptsCreate({ invoices }: ReceiptsCreateProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          route="receipts"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to receipts
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Record receipt</h1>
        <p className="mt-1 text-sm text-slate-600">Record a payment receipt against an invoice.</p>
      </div>

      <Card>
        <CardHeader title="Receipt details" />
        <CardBody>
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-600">
              No outstanding invoices available. Issue an invoice first.
            </p>
          ) : (
            <Form route="receipts.store" className="space-y-4">
              {({ errors }) => (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Invoice</label>
                    <select
                      name="invoiceId"
                      required
                      className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select invoice</option>
                      {invoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoiceNumber} — {invoice.customerName} (
                          {formatCurrency(invoice.totalAmount - invoice.amountPaid, invoice.currency)} outstanding)
                        </option>
                      ))}
                    </select>
                    {errors.invoiceId ? <p className="mt-1 text-sm text-red-600">{errors.invoiceId}</p> : null}
                  </div>
                  <Input label="Amount" name="amount" type="number" min={0.01} step="0.01" required error={errors.amount} />
                  <Input label="Currency" name="currency" value="ZMW" maxLength={3} error={errors.currency} />
                  <Input label="Payment method" name="paymentMethod" required error={errors.paymentMethod} />
                  <Input label="Payment reference" name="paymentReference" error={errors.paymentReference} />
                  <Input label="Received date" name="receivedDate" type="date" error={errors.receivedDate} />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    {errors.notes ? <p className="mt-1 text-sm text-red-600">{errors.notes}</p> : null}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="gap-2">
                      <PlusIcon />
                      Record receipt
                    </Button>
                    <Link
                      route="receipts"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <XMarkIcon />
                      Cancel
                    </Link>
                  </div>
                </>
              )}
            </Form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
