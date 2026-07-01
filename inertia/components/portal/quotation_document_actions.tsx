import { Form } from '@adonisjs/inertia/react'
import { DownloadIcon, EyeIcon, CheckCircleIcon, PlusIcon, PrinterIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
  dropdownMenuItemClassName,
} from '~/components/ui/dropdown_menu'
import { Spinner } from '~/components/ui/spinner'

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
            onSubmit={(event) => {
              if (!window.confirm(`Send quotation ${reference} to the client?`)) {
                event.preventDefault()
              }
            }}
          >
            {({ processing }) => (
              <button
                type="submit"
                role="menuitem"
                disabled={processing}
                aria-busy={processing || undefined}
                className={dropdownMenuItemClassName('primary')}
              >
                {processing ? (
                  <Spinner size="sm" tone="dark" />
                ) : (
                  <CheckCircleIcon className="h-4 w-4" />
                )}
                Send to client
              </button>
            )}
          </Form>
        </>
      ) : null}
    </DropdownMenu>
  )
}
