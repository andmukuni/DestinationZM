import { Form } from '@adonisjs/inertia/react'
import { CheckCircleIcon, DownloadIcon, EyeIcon, PrinterIcon, WalletIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
  dropdownMenuItemClassName,
} from '~/components/ui/dropdown_menu'
import { Spinner } from '~/components/ui/spinner'

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
          View booking
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
              onSubmit={(event) => {
                if (!window.confirm(`Issue invoice ${invoiceNumber} to the client?`)) {
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
                  Issue invoice
                </button>
              )}
            </Form>
          ) : null}
          {canMarkPaid ? (
            <Form
              route="invoices.mark_paid"
              routeParams={{ id: invoiceId }}
              className="block"
              onClick={(event) => event.stopPropagation()}
              onSubmit={(event) => {
                if (
                  !window.confirm(
                    `Mark invoice ${invoiceNumber} as paid (${formatCurrency(balanceDue, currency)})?`
                  )
                ) {
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
                    <WalletIcon className="h-4 w-4" />
                  )}
                  Mark as paid
                </button>
              )}
            </Form>
          ) : null}
        </>
      ) : null}
    </DropdownMenu>
  )
}
