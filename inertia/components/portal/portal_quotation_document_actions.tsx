import { DownloadIcon, EyeIcon, PrinterIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
} from '~/components/ui/dropdown_menu'

type PortalQuotationDocumentActionsProps = {
  quotationId: number
  reference: string
  downloadUrl: string
  enquiry: {
    id: number
    reference: string
  } | null
}

export default function PortalQuotationDocumentActions({
  downloadUrl,
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
    </DropdownMenu>
  )
}
