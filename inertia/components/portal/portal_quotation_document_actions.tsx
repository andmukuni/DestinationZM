import { Form } from '@adonisjs/inertia/react'
import { CheckCircleIcon, DownloadIcon, EyeIcon, PrinterIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown_menu'
import { ConfirmDropdownSubmit } from '~/components/ui/confirm_dropdown_submit'

type PortalQuotationDocumentActionsProps = {
  quotationId: number
  reference: string
  downloadUrl: string
  canApprove: boolean
  enquiry: {
    id: number
    reference: string
  } | null
}

export default function PortalQuotationDocumentActions({
  quotationId,
  reference,
  downloadUrl,
  canApprove,
  enquiry,
}: PortalQuotationDocumentActionsProps) {
  return (
    <DropdownMenu label="Actions">
      <DropdownMenuItem icon={<PrinterIcon />} onClick={() => window.print()}>
        Print quotation
      </DropdownMenuItem>
      <DropdownMenuLink href={downloadUrl} icon={<DownloadIcon />}>
        Download quotation
      </DropdownMenuLink>
      {enquiry ? (
        <DropdownMenuLink href={`/portal/enquiries/${enquiry.id}`} icon={<EyeIcon />}>
          View enquiry ({enquiry.reference})
        </DropdownMenuLink>
      ) : null}
      {canApprove ? (
        <>
          <DropdownMenuSeparator />
          <Form
            route="portal.quotations.approve"
            routeParams={{ id: quotationId }}
            className="block"
            onClick={(event) => event.stopPropagation()}
          >
            <ConfirmDropdownSubmit
              title="Approve quotation?"
              description={`Approve quotation ${reference}? Our team will confirm your enquiry and prepare your invoice.`}
              confirmLabel="Approve quotation"
              icon={<CheckCircleIcon className="h-4 w-4" />}
            >
              Approve quotation
            </ConfirmDropdownSubmit>
          </Form>
        </>
      ) : null}
    </DropdownMenu>
  )
}
