import { Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon } from '~/components/icons'
import EnquiryDocument, { type EnquiryDocumentData } from '~/components/portal/enquiry_document'
import EnquiryDocumentActions from '~/components/portal/enquiry_document_actions'

type EnquiriesShowProps = {
  pageTitle?: string
  pageDescription?: string
  canCreateQuotation: boolean
  enquiryId: number
  document: EnquiryDocumentData
  statusTone: 'pending' | 'quoted' | 'approved'
  quotation: {
    id: number
    reference: string
    canView: boolean
  } | null
}

const toneMap = {
  pending: 'warning' as const,
  quoted: 'info' as const,
  approved: 'success' as const,
}

export default function EnquiriesShow({
  canCreateQuotation,
  enquiryId,
  document,
  statusTone,
  quotation,
}: EnquiriesShowProps) {
  const downloadUrl = `/enquiries/${enquiryId}/download`

  return (
    <div className="space-y-6">
      <Link
        route="enquiries"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 print:hidden"
      >
        <ArrowLeftIcon />
        Back to enquiries
      </Link>

      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex justify-start print:hidden">
          <EnquiryDocumentActions
            audience="admin"
            enquiryId={enquiryId}
            reference={document.reference}
            canCreateQuotation={canCreateQuotation}
            createQuotationHref={`/quotations/create?bookingId=${enquiryId}`}
            downloadUrl={downloadUrl}
            quotation={quotation}
          />
        </div>

        <EnquiryDocument
          id="enquiry-document"
          document={document}
          statusTone={toneMap[statusTone]}
        />
      </div>
    </div>
  )
}
