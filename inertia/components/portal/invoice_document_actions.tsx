import { Form } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { CheckCircleIcon, DownloadIcon, EyeIcon, PrinterIcon, WalletIcon } from '~/components/icons'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown_menu'
import { Button } from '~/components/ui/button'
import { ConfirmDropdownSubmit } from '~/components/ui/confirm_dropdown_submit'
import { Modal } from '~/components/ui/modal'

import { formatCurrency } from '~/lib/format'

export type DepositAccountOption = {
  quickbooksId: string
  name: string
  accountType: string | null
}

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
  depositAccounts?: DepositAccountOption[]
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
  depositAccounts = [],
}: InvoiceDocumentActionsProps) {
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const useDepositDialog = depositAccounts.length > 0

  return (
    <>
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
            {canMarkPaid && useDepositDialog ? (
              <DropdownMenuItem
                icon={<WalletIcon className="h-4 w-4" />}
                onClick={() => setMarkPaidOpen(true)}
              >
                Mark as paid
              </DropdownMenuItem>
            ) : null}
            {canMarkPaid && !useDepositDialog ? (
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

      {useDepositDialog ? (
        <Modal
          open={markPaidOpen}
          onClose={() => setMarkPaidOpen(false)}
          title="Mark invoice as paid?"
          description={`Record payment of ${formatCurrency(balanceDue, currency)} for invoice ${invoiceNumber}.`}
        >
          <Form route="invoices.mark_paid" routeParams={{ id: invoiceId }} className="space-y-4">
            {({ processing }) => (
              <>
                <div>
                  <label
                    htmlFor="depositAccountId"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Deposit to (QuickBooks account)
                  </label>
                  <select
                    id="depositAccountId"
                    name="depositAccountId"
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                    defaultValue=""
                  >
                    <option value="">QuickBooks default (Undeposited Funds)</option>
                    {depositAccounts.map((account) => (
                      <option key={account.quickbooksId} value={account.quickbooksId}>
                        {account.name}
                        {account.accountType ? ` · ${account.accountType}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">
                    The payment will be posted to this account in QuickBooks and applied against the
                    customer&apos;s balance.
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMarkPaidOpen(false)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={processing}>
                    Mark as paid
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Modal>
      ) : null}
    </>
  )
}
