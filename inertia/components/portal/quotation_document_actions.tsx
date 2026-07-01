import { Form } from '@adonisjs/inertia/react'
import { DownloadIcon, EyeIcon, CheckCircleIcon, PlusIcon, PrinterIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown_menu'
import { ConfirmDropdownSubmit } from '~/components/ui/confirm_dropdown_submit'

type QuotationDocumentActionsProps = {
  quotationId: number
  reference: string
  downloadUrl: string
  canSend: boolean
  canCreateInvoice?: boolean
  createInvoiceHref?: string
  enquiry: {
    id: number
    reference: string
    href: string
  } | null
  invoice?: {
    id: number
    invoiceNumber: string
    canView: boolean
  } | null
}

export default function QuotationDocumentActions({
  quotationId,
  reference,
  downloadUrl,
  canSend,
  canCreateInvoice = false,
  createInvoiceHref,
  enquiry,
  invoice,
}: QuotationDocumentActionsProps) {
  return (
    <DropdownMenu label="Actions">
      <DropdownMenuItem icon={<PrinterIcon />} onClick={() => window.print()}>
        Print quotation
      </DropdownMenuItem>
      <DropdownMenuLink href={downloadUrl} icon={<DownloadIcon />}>
        Download quotation
      </DropdownMenuLink>
      {enquiry ? (
        <DropdownMenuLink href={enquiry.href} icon={<EyeIcon />}>
          View enquiry
        </DropdownMenuLink>
      ) : null}
      {invoice?.canView ? (
        <DropdownMenuLink href={`/invoices/${invoice.id}`} icon={<EyeIcon />}>
          View invoice
        </DropdownMenuLink>
      ) : null}
      {canCreateInvoice && createInvoiceHref ? (
        <DropdownMenuLink href={createInvoiceHref} icon={<PlusIcon />} tone="primary">
          Create invoice
        </DropdownMenuLink>
      ) : null}
      {canSend ? (
        <>
          <DropdownMenuSeparator />
          <Form
            route="quotations.send"
            routeParams={{ id: quotationId }}
            className="block"
            onClick={(event) => event.stopPropagation()}
          >
            <ConfirmDropdownSubmit
              title="Send quotation?"
              description={`Send quotation ${reference} to the client?`}
              confirmLabel="Send to client"
              icon={<CheckCircleIcon className="h-4 w-4" />}
            >
              Send to client
            </ConfirmDropdownSubmit>
          </Form>
        </>
      ) : null}
    </DropdownMenu>
  )
}
