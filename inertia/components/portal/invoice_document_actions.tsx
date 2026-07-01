import { Form } from '@adonisjs/inertia/react'
import { CheckCircleIcon, DownloadIcon, EyeIcon, PrinterIcon, WalletIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown_menu'
import { ConfirmDropdownSubmit } from '~/components/ui/confirm_dropdown_submit'

import { formatCurrency } from '~/lib/format'

type InvoiceDocumentActionsProps = {
  invoiceId: number
  invoiceNumber: string
  downloadUrl: string
  canIssue: boolean
  canMarkPaid: boolean
  balanceDue: number
  currency: string
  booking: {
    id: number
    reference: string
  } | null
  quotation: {
    id: number
    reference: string
  } | null
}

export default function InvoiceDocumentActions({
  invoiceId,
  invoiceNumber,
  downloadUrl,
  canIssue,
  canMarkPaid,
  balanceDue,
  currency,
  booking,
  quotation,
}: InvoiceDocumentActionsProps) {
  return (
    <DropdownMenu label="Actions">
      <DropdownMenuItem icon={<PrinterIcon />} onClick={() => window.print()}>
        Print invoice
      </DropdownMenuItem>
      <DropdownMenuLink href={downloadUrl} icon={<DownloadIcon />}>
        Download invoice
      </DropdownMenuLink>
      {quotation ? (
        <DropdownMenuLink href={`/quotations/${quotation.id}`} icon={<EyeIcon />}>
          View quotation
        </DropdownMenuLink>
      ) : null}
      {booking ? (
        <DropdownMenuLink href={`/bookings/${booking.id}`} icon={<EyeIcon />}>
          View enquiry
        </DropdownMenuLink>
      ) : null}
      {canIssue || canMarkPaid ? (
        <>
          <DropdownMenuSeparator />
          {canIssue ? (
            <Form
              route="invoices.issue"
              routeParams={{ id: invoiceId }}
              className="block"
              onClick={(event) => event.stopPropagation()}
            >
              <ConfirmDropdownSubmit
                title="Issue invoice?"
                description={`Issue invoice ${invoiceNumber} to the client?`}
                confirmLabel="Issue invoice"
                icon={<CheckCircleIcon className="h-4 w-4" />}
              >
                Issue invoice
              </ConfirmDropdownSubmit>
            </Form>
          ) : null}
          {canMarkPaid ? (
            <Form
              route="invoices.mark_paid"
              routeParams={{ id: invoiceId }}
              className="block"
              onClick={(event) => event.stopPropagation()}
            >
              <ConfirmDropdownSubmit
                title="Mark invoice as paid?"
                description={`Mark invoice ${invoiceNumber} as paid (${formatCurrency(balanceDue, currency)})?`}
                confirmLabel="Mark as paid"
                icon={<WalletIcon className="h-4 w-4" />}
              >
                Mark as paid
              </ConfirmDropdownSubmit>
            </Form>
          ) : null}
        </>
      ) : null}
    </DropdownMenu>
  )
}
