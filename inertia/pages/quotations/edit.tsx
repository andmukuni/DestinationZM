import { useMemo, useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, PlusIcon, TrashIcon, XMarkIcon } from '~/components/icons'
import type { EnquiryDocumentLineItem } from '~/components/portal/enquiry_document'
import { Button } from '~/components/ui/button'
import { Card, CardBody, CardHeader } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Table, TBody, TD, TH, THead, TR } from '~/components/ui/table'
import {
  brandButtonPrimaryClass,
  brandSurfaceAccentClass,
  brandSurfaceAccentTextClass,
} from '~/lib/brand_theme'
import { formatCurrency } from '~/lib/format'

type QuotationLineItem = EnquiryDocumentLineItem

type EditDraft = {
  quotationId: number
  reference: string
  customerId: number
  customerName: string
  bookingId: number | null
  bookingReference: string | null
  branchId: number
  branchName: string
  currency: string
  notes: string | null
  validUntil: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  lineItems: QuotationLineItem[]
  status: string
}

type QuotationsEditProps = {
  editDraft: EditDraft
}

function emptyLineItem(): QuotationLineItem {
  return {
    quantity: 1,
    title: '',
    description: '',
    amount: 0,
  }
}

function sumLineItems(items: QuotationLineItem[]) {
  return items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

export default function QuotationsEdit({ editDraft }: QuotationsEditProps) {
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(
    editDraft.lineItems.length ? editDraft.lineItems : [emptyLineItem()]
  )
  const [taxAmount, setTaxAmount] = useState(editDraft.taxAmount)

  const subtotal = useMemo(() => sumLineItems(lineItems), [lineItems])
  const totalAmount = useMemo(() => subtotal + Number(taxAmount || 0), [subtotal, taxAmount])

  function updateLineItem(index: number, patch: Partial<QuotationLineItem>) {
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          route="quotations.show"
          routeParams={{ id: editDraft.quotationId }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon />
          Back to quotation
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Edit quotation</h1>
        <p className="mt-1 text-sm text-slate-600">
          Update line items and totals for {editDraft.reference}.{' '}
          {editDraft.status === 'sent'
            ? 'Changes are visible to the client before they approve.'
            : 'Save as draft before sending to the client.'}
        </p>
      </div>

      <Card>
        <CardHeader title="Quotation details" />
        <CardBody>
          <Form
            route="quotations.update"
            routeParams={{ id: editDraft.quotationId }}
            className="space-y-6"
          >
            {({ errors }) => (
              <>
                <input type="hidden" name="customerId" value={editDraft.customerId} />
                <input type="hidden" name="branchId" value={editDraft.branchId} />
                {editDraft.bookingId ? (
                  <input type="hidden" name="bookingId" value={editDraft.bookingId} />
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Customer" value={editDraft.customerName} readOnly disabled />
                  <Input label="Quotation" value={editDraft.reference} readOnly disabled />
                  <Input label="Office" value={editDraft.branchName} readOnly disabled />
                </div>

                {editDraft.bookingReference ? (
                  <Input label="Enquiry" value={editDraft.bookingReference} readOnly disabled />
                ) : null}

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Line items</h2>
                      <p className="text-sm text-slate-600">
                        Edit services, quantities, descriptions, and amounts.
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
                          <TH className="w-12" />
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
                  <Input label="Subtotal" name="subtotal" type="number" value={subtotal} readOnly />
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
                    value={totalAmount}
                    readOnly
                  />
                  <Input
                    label="Currency"
                    name="currency"
                    defaultValue={editDraft.currency}
                    maxLength={3}
                    error={errors.currency}
                  />
                </div>

                <Input
                  label="Valid until"
                  name="validUntil"
                  type="date"
                  defaultValue={editDraft.validUntil}
                  error={errors.validUntil}
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={4}
                    defaultValue={editDraft.notes ?? ''}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                  {errors.notes ? <p className="mt-1 text-sm text-red-600">{errors.notes}</p> : null}
                </div>

                <div
                  className={`rounded-lg px-4 py-3 text-sm ${brandSurfaceAccentClass} ${brandSurfaceAccentTextClass}`}
                >
                  Current total: {formatCurrency(totalAmount, editDraft.currency)}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className={`gap-2 ${brandButtonPrimaryClass}`}>
                    Save quotation
                  </Button>
                  <Link
                    route="quotations.show"
                    routeParams={{ id: editDraft.quotationId }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <XMarkIcon />
                    Cancel
                  </Link>
                </div>
              </>
            )}
          </Form>
        </CardBody>
      </Card>
    </div>
  )
}
