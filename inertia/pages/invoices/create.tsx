import { useMemo, useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon, TrashIcon, XMarkIcon } from '~/components/icons'
import type { EnquiryDocumentLineItem } from '~/components/portal/enquiry_document'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, TH, THead, TR } from '~/components/ui/table'
import { brandSurfaceAccentClass, brandSurfaceAccentTextClass } from '~/lib/brand_theme'
import { formatCurrency } from '~/lib/format'

type InvoiceLineItem = EnquiryDocumentLineItem

type QuotationDraft = {
  quotationId: number
  quotationReference: string
  customerId: number
  customerName: string
  bookingId: number
  bookingReference: string
  branchId: number
  branchName: string
  currency: string
  notes: string | null
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  lineItems: InvoiceLineItem[]
}

type InvoicesCreateProps = {
  branches: Array<{ id: number; name: string }>
  customers: Array<{ id: number; fullName: string }>
  bookings: Array<{ id: number; reference: string }>
  defaultBranchId: number | null
  quotationDraft?: QuotationDraft | null
}

function emptyLineItem(): InvoiceLineItem {
  return {
    quantity: 1,
    title: '',
    description: '',
    amount: 0,
  }
}

function sumLineItems(items: InvoiceLineItem[]) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

export default function InvoicesCreate({
  branches,
  customers,
  bookings,
  defaultBranchId,
  quotationDraft = null,
}: InvoicesCreateProps) {
  const lockedBranch = defaultBranchId && branches.length === 1 ? branches[0] : null
  const fromQuotation = quotationDraft !== null

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    quotationDraft?.lineItems.length ? quotationDraft.lineItems : [emptyLineItem()]
  )
  const [taxAmount, setTaxAmount] = useState(quotationDraft?.taxAmount ?? 0)

  const subtotal = useMemo(() => sumLineItems(lineItems), [lineItems])
  const totalAmount = useMemo(() => subtotal + Number(taxAmount || 0), [subtotal, taxAmount])

  function updateLineItem(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    )
  }

  function addLineItem() {
    setLineItems((current) => [...current, emptyLineItem()])
  }

  function removeLineItem(index: number) {
    setLineItems((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)))
  }

  return (
    <div className={`mx-auto space-y-6 ${fromQuotation ? 'max-w-5xl' : 'max-w-2xl'}`}>
      <div>
        {fromQuotation ? (
          <Link
            href={`/quotations/${quotationDraft!.quotationId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon />
            Back to quotation
          </Link>
        ) : (
          <Link
            route="invoices"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon />
            Back to invoices
          </Link>
        )}
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          {fromQuotation ? 'Create invoice from quotation' : 'Create invoice'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {fromQuotation
            ? `Review and edit line items copied from ${quotationDraft!.quotationReference} before saving the draft invoice.`
            : 'Create a draft invoice for a customer.'}
        </p>
      </div>

      <Card>
        <CardHeader title={fromQuotation ? 'Invoice draft' : 'Invoice details'} />
        <CardBody>
          {branches.length === 0 || customers.length === 0 ? (
            <p className="text-sm text-slate-600">
              {branches.length === 0 ? 'No offices available.' : 'No customers available.'}
            </p>
          ) : (
            <Form route="invoices.store" className="space-y-6">
              {({ errors }) => (
                <>
                  {fromQuotation ? (
                    <>
                      <input type="hidden" name="customerId" value={quotationDraft!.customerId} />
                      <input type="hidden" name="branchId" value={quotationDraft!.branchId} />
                      <input type="hidden" name="bookingId" value={quotationDraft!.bookingId} />
                      <input type="hidden" name="quotationId" value={quotationDraft!.quotationId} />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Input label="Customer" value={quotationDraft!.customerName} readOnly disabled />
                        <Input label="Quotation" value={quotationDraft!.quotationReference} readOnly disabled />
                        <Input label="Enquiry" value={quotationDraft!.bookingReference} readOnly disabled />
                        <Input label="Office" value={quotationDraft!.branchName} readOnly disabled />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-semibold text-slate-900">Line items</h2>
                            <p className="text-sm text-slate-600">
                              Edit services, quantities, descriptions, and amounts before saving.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-1.5"
                            onClick={addLineItem}
                          >
                            <PlusIcon className="h-4 w-4" />
                            Add line
                          </Button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <Table scrollContainer={false} className="min-w-[920px]">
                            <THead>
                              <TR>
                                <TH className="w-20">Qty</TH>
                                <TH>Service</TH>
                                <TH>Description</TH>
                                <TH className="w-36 text-right">Amount</TH>
                                <TH className="w-12">&nbsp;</TH>
                              </TR>
                            </THead>
                            <TBody>
                              {lineItems.map((item, index) => (
                                <TR key={index}>
                                  <TD>
                                    <input
                                      name={`lineItems[${index}][quantity]`}
                                      type="number"
                                      min={1}
                                      value={item.quantity}
                                      onChange={(event) =>
                                        updateLineItem(index, {
                                          quantity: Number(event.target.value) || 1,
                                        })
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm"
                                    />
                                  </TD>
                                  <TD>
                                    <input
                                      name={`lineItems[${index}][title]`}
                                      value={item.title}
                                      onChange={(event) =>
                                        updateLineItem(index, { title: event.target.value })
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-300 px-2 text-sm"
                                      placeholder="Service title"
                                    />
                                  </TD>
                                  <TD>
                                    <textarea
                                      name={`lineItems[${index}][description]`}
                                      value={item.description}
                                      onChange={(event) =>
                                        updateLineItem(index, { description: event.target.value })
                                      }
                                      rows={3}
                                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                      placeholder="Details copied from quotation"
                                    />
                                  </TD>
                                  <TD>
                                    <input
                                      name={`lineItems[${index}][amount]`}
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={item.amount}
                                      onChange={(event) =>
                                        updateLineItem(index, {
                                          amount: Number(event.target.value) || 0,
                                        })
                                      }
                                      className="h-9 w-full rounded-lg border border-slate-300 px-2 text-right text-sm"
                                    />
                                  </TD>
                                  <TD className="text-right">
                                    <button
                                      type="button"
                                      onClick={() => removeLineItem(index)}
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-700"
                                      title="Remove line"
                                      aria-label="Remove line"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </TD>
                                </TR>
                              ))}
                            </TBody>
                          </Table>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Input
                          label="Subtotal"
                          name="subtotal"
                          type="number"
                          min={0}
                          step="0.01"
                          value={subtotal}
                          readOnly
                        />
                        <Input
                          label="Tax amount"
                          name="taxAmount"
                          type="number"
                          min={0}
                          step="0.01"
                          value={taxAmount}
                          onChange={(event) => setTaxAmount(Number(event.target.value) || 0)}
                          error={errors.taxAmount}
                        />
                        <Input
                          label="Total amount"
                          name="totalAmount"
                          type="number"
                          min={0}
                          step="0.01"
                          value={totalAmount}
                          readOnly
                        />
                        <Input
                          label="Currency"
                          name="currency"
                          defaultValue={quotationDraft!.currency}
                          maxLength={3}
                          error={errors.currency}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Issue date"
                          name="issueDate"
                          type="date"
                          defaultValue={quotationDraft!.issueDate}
                          error={errors.issueDate}
                        />
                        <Input
                          label="Due date"
                          name="dueDate"
                          type="date"
                          defaultValue={quotationDraft!.dueDate}
                          error={errors.dueDate}
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                          name="notes"
                          rows={4}
                          defaultValue={quotationDraft!.notes ?? ''}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                        {errors.notes ? <p className="mt-1 text-sm text-red-600">{errors.notes}</p> : null}
                      </div>

                      <div className={`rounded-lg px-4 py-3 text-sm ${brandSurfaceAccentClass} ${brandSurfaceAccentTextClass}`}>
                        Copied from quotation: {formatCurrency(subtotal, quotationDraft!.currency)}. Adjust line
                        amounts above before saving the draft invoice.
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Customer</label>
                        <select
                          name="customerId"
                          required
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Select customer</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.fullName}
                            </option>
                          ))}
                        </select>
                        {errors.customerId ? (
                          <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                        ) : null}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Enquiry (optional)
                        </label>
                        <select
                          name="bookingId"
                          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">No linked enquiry</option>
                          {bookings.map((booking) => (
                            <option key={booking.id} value={booking.id}>
                              {booking.reference}
                            </option>
                          ))}
                        </select>
                        {errors.bookingId ? (
                          <p className="mt-1 text-sm text-red-600">{errors.bookingId}</p>
                        ) : null}
                      </div>
                      {lockedBranch ? (
                        <>
                          <input type="hidden" name="branchId" value={lockedBranch.id} />
                          <Input label="Office" name="branchName" value={lockedBranch.name} readOnly disabled />
                        </>
                      ) : (
                        <div>
                          <label className="mb-1 block text-sm font-medium text-slate-700">Office</label>
                          <select
                            name="branchId"
                            defaultValue={defaultBranchId ?? ''}
                            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                          >
                            <option value="">Select office</option>
                            {branches.map((branch) => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name}
                              </option>
                            ))}
                          </select>
                          {errors.branchId ? (
                            <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>
                          ) : null}
                        </div>
                      )}
                      <Input
                        label="Subtotal"
                        name="subtotal"
                        type="number"
                        min={0}
                        step="0.01"
                        error={errors.subtotal}
                      />
                      <Input
                        label="Tax amount"
                        name="taxAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        error={errors.taxAmount}
                      />
                      <Input
                        label="Total amount"
                        name="totalAmount"
                        type="number"
                        min={0}
                        step="0.01"
                        error={errors.totalAmount}
                      />
                      <Input label="Currency" name="currency" value="ZMW" maxLength={3} error={errors.currency} />
                      <Input label="Issue date" name="issueDate" type="date" error={errors.issueDate} />
                      <Input label="Due date" name="dueDate" type="date" error={errors.dueDate} />
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                          name="notes"
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                        {errors.notes ? <p className="mt-1 text-sm text-red-600">{errors.notes}</p> : null}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="gap-2">
                      <PlusIcon />
                      {fromQuotation ? 'Save draft invoice' : 'Create invoice'}
                    </Button>
                    <Link
                      href={fromQuotation ? `/quotations/${quotationDraft!.quotationId}` : '/invoices'}
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
