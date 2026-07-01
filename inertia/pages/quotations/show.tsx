import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import QuotationDocument, { type QuotationDocumentData } from '~/components/portal/quotation_document'
import QuotationDocumentActions from '~/components/portal/quotation_document_actions'

type QuotationsShowProps = {
  pageTitle?: string
  pageDescription?: string
  quotationId: number
  document: QuotationDocumentData
  statusTone: 'warning' | 'info' | 'success' | 'danger' | 'default'
  canSend: boolean
  canCreateInvoice: boolean
  createInvoiceHref: string
  enquiry: {
    id: number
    reference: string
    href: string
  } | null
  invoice: {
    id: number
    invoiceNumber: string
    canView: boolean
  } | null
}

export default function QuotationsShow({
  quotationId,
  document,
  statusTone,
  canSend,
  canCreateInvoice,
  createInvoiceHref,
  enquiry,
  invoice,
}: QuotationsShowProps) {
  const downloadUrl = `/quotations/${quotationId}/download`

  return (
    <div className="space-y-6">
      <Link
        route="quotations"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 print:hidden"
      >
        <ArrowLeftIcon />
        Back to quotations
      </Link>

      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex justify-start print:hidden">
          <QuotationDocumentActions
            quotationId={quotationId}
            reference={document.reference}
            downloadUrl={downloadUrl}
            canSend={canSend}
            canCreateInvoice={canCreateInvoice}
            createInvoiceHref={createInvoiceHref}
            enquiry={enquiry}
            invoice={invoice}
          />
        </div>

        <QuotationDocument id="quotation-document" document={document} statusTone={statusTone} />
      </div>
    </div>
  )
}
