import { Form } from '@adonisjs/inertia/react'
import { DownloadIcon, EyeIcon, PlusIcon, PrinterIcon, TrashIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown_menu'
import { ConfirmDropdownSubmit } from '~/components/ui/confirm_dropdown_submit'

type EnquiryDocumentActionsProps = {
  enquiryId: number
  reference: string
  downloadUrl: string
  audience?: 'portal' | 'admin'
  canCancel?: boolean
  canCreateQuotation?: boolean
  createQuotationHref?: string
  quotation: {
    id: number
    reference: string
    canView: boolean
  } | null
}

function quotationHref(audience: 'portal' | 'admin', quotationId: number) {
  return audience === 'admin' ? `/quotations/${quotationId}` : `/portal/quotations/${quotationId}`
}

export default function EnquiryDocumentActions({
  enquiryId,
  reference,
  downloadUrl,
  audience = 'portal',
  canCancel = false,
  canCreateQuotation = false,
  createQuotationHref,
  quotation,
}: EnquiryDocumentActionsProps) {
  return (
    <DropdownMenu label="Actions">
      <DropdownMenuItem icon={<PrinterIcon />} onClick={() => window.print()}>
        Print enquiry
      </DropdownMenuItem>
      <DropdownMenuLink href={downloadUrl} icon={<DownloadIcon />}>
        Download enquiry
      </DropdownMenuLink>
      {quotation?.canView ? (
        <DropdownMenuLink
          href={quotationHref(audience, quotation.id)}
          icon={<EyeIcon />}
        >
          View quotation ({quotation.reference})
        </DropdownMenuLink>
      ) : null}
      {canCreateQuotation && createQuotationHref ? (
        <DropdownMenuLink href={createQuotationHref} icon={<PlusIcon />} tone="primary">
          Create quotation
        </DropdownMenuLink>
      ) : null}
      {canCancel ? (
        <>
          <DropdownMenuSeparator />
          <Form
            route="portal.enquiries.cancel"
            routeParams={{ id: enquiryId }}
            className="block"
            onClick={(event) => event.stopPropagation()}
          >
            <ConfirmDropdownSubmit
              title="Cancel enquiry?"
              description={`Cancel enquiry ${reference}? DestinationZM will stop preparing your quotation.`}
              confirmLabel="Cancel enquiry"
              confirmVariant="danger"
              tone="danger"
              icon={<TrashIcon className="h-4 w-4" />}
            >
              Cancel enquiry
            </ConfirmDropdownSubmit>
          </Form>
        </>
      ) : null}
    </DropdownMenu>
  )
}
