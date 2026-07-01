import { Badge } from '~/components/ui/badge'
import { formatCurrency } from '~/lib/format'

export type EnquiryDocumentLineItem = {
  quantity: number
  title: string
  description: string
  amount: number
}

export type EnquiryDocumentData = {
  reference: string
  submittedDate: string
  statusLabel: string
  client: {
    company: string
    contactName: string | null
    email: string | null
    phone: string | null
  }
  lineItems: EnquiryDocumentLineItem[]
  totalEstimated: number
  currency: string
  itemCount: number
  footer: {
    companyName: string
    branchName: string | null
    contactLine: string
  }
}

type EnquiryDocumentProps = {
  document: EnquiryDocumentData
  statusTone?: 'warning' | 'info' | 'success' | 'neutral'
  id?: string
}

export default function EnquiryDocument({ document, statusTone = 'warning', id }: EnquiryDocumentProps) {
  return (
    <div id={id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
        {/* Header */}
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
            <h2 className="text-3xl font-bold tracking-tight text-slate-700">ENQUIRY</h2>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-end gap-3">
                <dt className="font-semibold text-slate-700">Enquiry No:</dt>
                <dd className="text-slate-900">{document.reference}</dd>
              </div>
              <div className="flex justify-end gap-3">
                <dt className="font-semibold text-slate-700">Date:</dt>
                <dd className="text-slate-900">{document.submittedDate}</dd>
              </div>
              <div className="flex items-center justify-end gap-3">
                <dt className="font-semibold text-slate-700">Status:</dt>
                <dd>
                  <Badge tone={statusTone}>{document.statusLabel}</Badge>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Recipient */}
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

        {/* Line items table */}
        <div className="px-8 py-6">
          <table className="w-full border-collapse border border-slate-400 text-sm">
            <thead>
              <tr className="bg-slate-600 text-left text-white">
                <th className="border border-slate-500 px-4 py-2.5 font-semibold w-16 text-center">
                  Qty
                </th>
                <th className="border border-slate-500 px-4 py-2.5 font-semibold w-48">Item</th>
                <th className="border border-slate-500 px-4 py-2.5 font-semibold">Description</th>
                <th className="border border-slate-500 px-4 py-2.5 font-semibold w-36 text-right">
                  Est. amount
                </th>
              </tr>
            </thead>
            <tbody>
              {document.lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="border border-slate-200 px-4 py-6 text-center text-slate-500">
                    No service details recorded for this enquiry.
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
                        <p className="whitespace-pre-line text-xs leading-relaxed">{item.description}</p>
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
            {document.lineItems.length > 0 ? (
              <tfoot>
                <tr className="bg-slate-50">
                  <td
                    colSpan={3}
                    className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700"
                  >
                    Estimated total ({document.itemCount}{' '}
                    {document.itemCount === 1 ? 'service' : 'services'})
                  </td>
                  <td className="border border-slate-200 px-4 py-3 text-right font-bold text-slate-900">
                    {document.totalEstimated > 0
                      ? formatCurrency(document.totalEstimated, document.currency)
                      : '—'}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-5 text-center text-sm text-slate-600">
          {document.footer.contactLine}
        </div>
    </div>
  )
}
