import { useMemo, useState } from 'react'
import { Form, Link } from '@adonisjs/inertia/react'
import { ArrowLeftIcon, CheckCircleIcon } from '~/components/icons'
import QuotationDocument, { type QuotationDocumentData } from '~/components/portal/quotation_document'
import PortalQuotationDocumentActions from '~/components/portal/portal_quotation_document_actions'
import { Button } from '~/components/ui/button'
import { Card, CardBody } from '~/components/ui/card'
import { formatCurrency } from '~/lib/format'
import { brandButtonPrimaryClass } from '~/lib/brand_theme'

type PortalQuotationsShowProps = {
  pageTitle?: string
  pageDescription?: string
  quotationId: number
  document: QuotationDocumentData
  statusTone: 'warning' | 'info' | 'success' | 'danger' | 'default'
  canApprove: boolean
  lineItemCount: number
  bookingId: number | null
}

export default function PortalQuotationsShow({
  quotationId,
  document,
  statusTone,
  canApprove,
  lineItemCount,
  bookingId,
}: PortalQuotationsShowProps) {
  const downloadUrl = `/portal/quotations/${quotationId}/download`
  const enquiry =
    bookingId && document.enquiryReference
      ? { id: bookingId, reference: document.enquiryReference }
      : null

  const initialSelected = useMemo(
    () => document.lineItems.map((_, index) => index),
    [document.lineItems]
  )
  const [selectedIndices, setSelectedIndices] = useState<number[]>(initialSelected)

  const selectedSubtotal = useMemo(
    () =>
      document.lineItems.reduce(
        (sum, item, index) => (selectedIndices.includes(index) ? sum + item.amount : sum),
        0
      ),
    [document.lineItems, selectedIndices]
  )

  function toggleLineItem(index: number) {
    setSelectedIndices((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index].sort()
    )
  }

  const canSubmitApproval = lineItemCount === 0 || selectedIndices.length > 0

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
          <PortalQuotationDocumentActions downloadUrl={downloadUrl} enquiry={enquiry} />
        </div>

        <QuotationDocument
          id="quotation-document"
          document={document}
          statusTone={statusTone}
          lineItemSelection={
            canApprove && lineItemCount > 0
              ? {
                  selectedIndices,
                  onToggle: toggleLineItem,
                }
              : undefined
          }
        />

        {canApprove ? (
          <Card className="print:hidden">
            <CardBody className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Approve selected services</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Tick the line items you want to proceed with, then approve. Unticked services will
                  not be included in your approved quotation total.
                </p>
              </div>

              {lineItemCount > 0 ? (
                <p className="text-sm text-slate-700">
                  Selected total:{' '}
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(selectedSubtotal, document.currency)}
                  </span>{' '}
                  ({selectedIndices.length} of {lineItemCount}{' '}
                  {lineItemCount === 1 ? 'service' : 'services'})
                </p>
              ) : null}

              <Form route="portal.quotations.approve" routeParams={{ id: quotationId }}>
                {selectedIndices.map((index) => (
                  <input
                    key={index}
                    type="hidden"
                    name="approvedItemIndices[]"
                    value={index}
                  />
                ))}
                <Button
                  type="submit"
                  disabled={!canSubmitApproval}
                  className={`gap-2 ${brandButtonPrimaryClass}`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Approve selected quotation
                </Button>
              </Form>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
