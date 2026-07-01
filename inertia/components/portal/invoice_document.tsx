import { Badge } from '~/components/ui/badge'
import EnquiryServiceSummaries, {
  LineItemDescription,
  type EnquiryServiceSummary,
} from '~/components/portal/enquiry_service_summaries'
import { formatCurrency } from '~/lib/format'

export type InvoiceDocumentLineItem = {
  quantity: number
  title: string
  description: string
  amount: number
}

export type InvoiceDocumentData = {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  statusLabel: string
  bookingReference: string | null
  quotationReference: string | null
  client: {
    company: string
    contactName: string | null
    email: string | null
    phone: string | null
  }
  lineItems: InvoiceDocumentLineItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  currency: string
  itemCount: number
  notes: string | null
  enquirySummaries: EnquiryServiceSummary[]
  footer: {
    companyName: string
    branchName: string | null
    contactLine: string
  }
}

type InvoiceDocumentProps = {
  document: InvoiceDocumentData
  statusTone?: 'warning' | 'info' | 'success' | 'danger' | 'default'
  id?: string
}

export default function InvoiceDocument({
  document,
  statusTone = 'warning',
  id,
}: InvoiceDocumentProps) {
  return (
    <div
      id={id}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 px-8 py-8">
        <div>
          <div className="text-lg font-bold tracking-wide text-slate-800">
            {document.footer.companyName}
          </div>
          {document.footer.branchName ? (
            <div className="mt-1 text-sm text-slate-500">{document.footer.branchName}</div>
          ) : null}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-tight text-slate-700">INVOICE</h2>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-end gap-3">
              <dt className="font-semibold text-slate-700">Invoice No:</dt>
              <dd className="text-slate-900">{document.invoiceNumber}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt className="font-semibold text-slate-700">Issue date:</dt>
              <dd className="text-slate-900">{document.issueDate}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt className="font-semibold text-slate-700">Due date:</dt>
              <dd className="text-slate-900">{document.dueDate}</dd>
            </div>
            {document.bookingReference ? (
              <div className="flex justify-end gap-3">
                <dt className="font-semibold text-slate-700">Enquiry:</dt>
                <dd className="text-slate-900">{document.bookingReference}</dd>
              </div>
            ) : null}
            {document.quotationReference ? (
              <div className="flex justify-end gap-3">
                <dt className="font-semibold text-slate-700">Quotation:</dt>
                <dd className="text-slate-900">{document.quotationReference}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-3">
              <dt className="font-semibold text-slate-700">Status:</dt>
              <dd>
                <Badge tone={statusTone}>{document.statusLabel}</Badge>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-b border-slate-200 px-8 py-6">
        <p className="text-sm font-semibold text-slate-700">{document.client.company}</p>
        {document.client.contactName ? (
          <p className="mt-1 text-sm text-slate-600">Attn: {document.client.contactName}</p>
        ) : null}
        {document.client.email ? (
          <p className="mt-1 text-sm text-slate-600">{document.client.email}</p>
        ) : null}
        {document.client.phone ? (
          <p className="text-sm text-slate-600">{document.client.phone}</p>
        ) : null}
      </div>

      <div className="px-8 py-6">
        <table className="w-full border-collapse border border-slate-400 text-sm">
          <thead>
            <tr className="bg-slate-600 text-left text-white">
              <th className="w-16 border border-slate-500 px-4 py-2.5 text-center font-semibold">
                Qty
              </th>
              <th className="w-48 border border-slate-500 px-4 py-2.5 font-semibold">Item</th>
              <th className="border border-slate-500 px-4 py-2.5 font-semibold">Description</th>
              <th className="w-36 border border-slate-500 px-4 py-2.5 text-right font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {document.lineItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-slate-200 px-4 py-6 text-center text-slate-500">
                  No line items on this invoice.
                </td>
              </tr>
            ) : (
              document.lineItems.map((item, index) => (
                <tr key={`${item.title}-${index}`} className="align-top">
                  <td className="border border-slate-200 px-4 py-3 text-center text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="border border-slate-200 px-4 py-3">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                  </td>
                  <td className="border border-slate-200 px-4 py-3 text-slate-700">
                    {item.description ? (
                      <LineItemDescription description={item.description} />
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="border border-slate-200 px-4 py-3 text-right font-medium text-slate-900">
                    {item.amount > 0 ? formatCurrency(item.amount, document.currency) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50">
              <td
                colSpan={3}
                className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700"
              >
                Subtotal
              </td>
              <td className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-900">
                {formatCurrency(document.subtotal, document.currency)}
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td
                colSpan={3}
                className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700"
              >
                Tax
              </td>
              <td className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-900">
                {formatCurrency(document.taxAmount, document.currency)}
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td
                colSpan={3}
                className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-700"
              >
                Total ({document.itemCount} {document.itemCount === 1 ? 'service' : 'services'})
              </td>
              <td className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-900">
                {formatCurrency(document.totalAmount, document.currency)}
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td
                colSpan={3}
                className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700"
              >
                Amount paid
              </td>
              <td className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-900">
                {formatCurrency(document.amountPaid, document.currency)}
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td
                colSpan={3}
                className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-700"
              >
                Balance due
              </td>
              <td className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-900">
                {formatCurrency(document.balanceDue, document.currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {document.enquirySummaries.length > 0 ? (
        <div className="border-t border-slate-200 px-8 py-5">
          <p className="text-sm font-semibold text-slate-700">Enquiry details</p>
          <div className="mt-3">
            <EnquiryServiceSummaries summaries={document.enquirySummaries} />
          </div>
        </div>
      ) : document.notes ? (
        <div className="border-t border-slate-200 px-8 py-5">
          <p className="text-sm font-semibold text-slate-700">Notes</p>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{document.notes}</p>
        </div>
      ) : null}

      <div className="border-t border-slate-200 px-8 py-5 text-center text-sm text-slate-600">
        {document.footer.contactLine}
      </div>
    </div>
  )
}
