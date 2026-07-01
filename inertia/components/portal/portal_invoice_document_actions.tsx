import { Link } from '@adonisjs/inertia/react'
import { DownloadIcon, EyeIcon, PrinterIcon, WalletIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
  dropdownMenuItemClassName,
} from '~/components/ui/dropdown_menu'

type PortalInvoiceDocumentActionsProps = {
  downloadUrl: string
  canPay: boolean
  payHref: string
  quotation: {
    id: number
  } | null
  booking: {
    id: number
  } | null
}

export default function PortalInvoiceDocumentActions({
  downloadUrl,
  canPay,
  payHref,
  quotation,
  booking,
}: PortalInvoiceDocumentActionsProps) {
  return (
    <DropdownMenu label="Actions">
      <DropdownMenuItem icon={<PrinterIcon />} onClick={() => window.print()}>
        Print invoice
      </DropdownMenuItem>
      <DropdownMenuLink href={downloadUrl} icon={<DownloadIcon />}>
        Download invoice
      </DropdownMenuLink>
      {quotation ? (
        <DropdownMenuLink href={`/portal/quotations/${quotation.id}`} icon={<EyeIcon />}>
          View quotation
        </DropdownMenuLink>
      ) : null}
      {booking ? (
        <DropdownMenuLink href={`/portal/bookings/${booking.id}`} icon={<EyeIcon />}>
          View booking
        </DropdownMenuLink>
      ) : null}
      {canPay ? (
        <>
          <DropdownMenuSeparator />
          <Link href={payHref} role="menuitem" className={dropdownMenuItemClassName('primary')}>
            <WalletIcon className="h-4 w-4" />
            Pay invoice
          </Link>
        </>
      ) : null}
    </DropdownMenu>
  )
}
