import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import QuotationDocument, { type QuotationDocumentData } from '~/components/portal/quotation_document'
import PortalQuotationDocumentActions from '~/components/portal/portal_quotation_document_actions'

type PortalQuotationsShowProps = {
  pageTitle?: string
  pageDescription?: string
  quotationId: number
  document: QuotationDocumentData
  statusTone: 'warning' | 'info' | 'success' | 'danger' | 'default'
  canApprove: boolean
  bookingId: number | null
}

export default function PortalQuotationsShow({
  quotationId,
  document,
  statusTone,
  canApprove,
  bookingId,
}: PortalQuotationsShowProps) {
  const downloadUrl = `/portal/quotations/${quotationId}/download`
  const enquiry =
    bookingId && document.enquiryReference
      ? { id: bookingId, reference: document.enquiryReference }
      : null

  return (
    <div className="space-y-6">
      <Link
        route="portal.quotations.index"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 print:hidden"
      >
        <ArrowLeftIcon />
        Back to quotations
      </Link>

      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex justify-start print:hidden">
          <PortalQuotationDocumentActions
            quotationId={quotationId}
            reference={document.reference}
            downloadUrl={downloadUrl}
            canApprove={canApprove}
            enquiry={enquiry}
          />
        </div>

        <QuotationDocument id="quotation-document" document={document} statusTone={statusTone} />
      </div>
    </div>
  )
}
