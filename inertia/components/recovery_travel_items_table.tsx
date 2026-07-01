import { useState } from 'react'
import { EyeIcon } from '~/components/icons'
import { Modal } from '~/components/ui/modal'
import { TableIconButton } from '~/components/ui/table_icon_button'
import { Table, TBody, TD, THead, TH, TR } from '~/components/ui/table'
import { brandHighlightRowClass } from '~/lib/brand_theme'
import { stopRowClick } from '~/lib/table_row'

export type RecoveryTravelItemRow = {
  id: number
  enquiryItemLabel: string
  invoiceItemLabel: string
  recoveryItemId: number
  recoveryReference: string
  recoveryStatus: string
  productType: string
  currency: string
  price: number
  pnr: string
  travelerName: string
  travelStart: string
  travelEnd: string
  itineraryService: string
  invoiceReceiptNumber: string
  tripName: string
  tripReason: string
  costCenter: string
  dateRequested: string
  approvedBy: string
  generalLedgerAccount: string
}

type RecoveryTravelItemsTableProps = {
  columns: string[]
  rows: RecoveryTravelItemRow[]
  totalPrice: number
  currentItemId?: number
  rowHref?: (row: RecoveryTravelItemRow) => string | undefined
}

const COLUMN_KEY_MAP: Record<string, keyof RecoveryTravelItemRow> = {
  'Enquiry item': 'enquiryItemLabel',
  'Invoice item': 'invoiceItemLabel',
  'Product Type': 'productType',
  Currency: 'currency',
  Price: 'price',
  PNR: 'pnr',
  'Traveler Name': 'travelerName',
  'Travel Start': 'travelStart',
  'Travel End': 'travelEnd',
  'Itinerary / Service': 'itineraryService',
  'Invoice / Receipt#': 'invoiceReceiptNumber',
  'Trip Name': 'tripName',
  'Trip Reason': 'tripReason',
  'Cost Center': 'costCenter',
  'Date Requested': 'dateRequested',
  'Approved by': 'approvedBy',
  'General Ledger Account': 'generalLedgerAccount',
}

function formatTablePrice(value: number) {
  return value.toLocaleString('en-ZM', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatCell(key: keyof RecoveryTravelItemRow, value: string | number) {
  if (key === 'price') {
    return formatTablePrice(Number(value))
  }
  return String(value ?? '')
}

function cellClassName(key: keyof RecoveryTravelItemRow) {
  if (key === 'price') {
    return 'border border-slate-300 px-2 py-1.5 text-right tabular-nums text-slate-900'
  }

  if (key === 'itineraryService') {
    return 'border border-slate-300 px-2 py-1.5 text-center text-slate-900'
  }

  return 'whitespace-nowrap border border-slate-300 px-2 py-1.5 text-slate-900'
}

function ItineraryDetailModal({
  row,
  open,
  onClose,
}: {
  row: RecoveryTravelItemRow | null
  open: boolean
  onClose: () => void
}) {
  if (!row) {
    return null
  }

  const detailLines = row.itineraryService.split('\n').map((line) => line.trim()).filter(Boolean)
  const title = row.enquiryItemLabel || row.productType || 'Itinerary / Service'

  const meta = [
    { label: 'PNR', value: row.pnr },
    { label: 'Traveler', value: row.travelerName },
    { label: 'Travel start', value: row.travelStart },
    { label: 'Travel end', value: row.travelEnd },
    { label: 'Invoice / receipt', value: row.invoiceReceiptNumber },
    { label: 'Trip name', value: row.tripName },
    { label: 'Trip reason', value: row.tripReason },
    { label: 'Cost center', value: row.costCenter },
    { label: 'Date requested', value: row.dateRequested },
    { label: 'Approved by', value: row.approvedBy },
    { label: 'GL account', value: row.generalLedgerAccount },
  ].filter((entry) => entry.value)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={[row.invoiceItemLabel, row.productType].filter(Boolean).join(' · ')}
      size="lg"
    >
      <div className="space-y-4">
        {detailLines.length ? (
          <div className="space-y-3">
            {detailLines.map((line) =>
              line.includes(' · ') ? (
                <div key={line} className="flex flex-wrap gap-1.5">
                  {line.split(' · ').map((part) => (
                    <span
                      key={`${line}-${part}`}
                      className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-700"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              ) : (
                <p key={line} className="text-sm font-medium text-slate-900">
                  {line}
                </p>
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No itinerary details recorded for this line.</p>
        )}

        {meta.length ? (
          <dl className="grid gap-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2">
            {meta.map((entry) => (
              <div key={entry.label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{entry.label}</dt>
                <dd className="mt-0.5 text-slate-800">{entry.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </Modal>
  )
}

function renderCellContent(
  key: keyof RecoveryTravelItemRow,
  row: RecoveryTravelItemRow,
  onViewItinerary: (row: RecoveryTravelItemRow) => void
) {
  if (key === 'itineraryService') {
    if (!row.itineraryService.trim()) {
      return <span className="text-slate-400">—</span>
    }

    return (
      <TableIconButton
        label="View itinerary / service details"
        onClick={(event) => {
          stopRowClick(event)
          onViewItinerary(row)
        }}
      >
        <EyeIcon className="h-4 w-4" />
      </TableIconButton>
    )
  }

  return formatCell(key, row[key])
}

export default function RecoveryTravelItemsTable({
  columns,
  rows,
  totalPrice,
  currentItemId,
  rowHref,
}: RecoveryTravelItemsTableProps) {
  const [itineraryRow, setItineraryRow] = useState<RecoveryTravelItemRow | null>(null)
  const priceColumnIndex = Math.max(columns.findIndex((column) => column === 'Price'), 0)

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
      <Table scrollContainer={false} className="min-w-[1200px] border-collapse text-xs">
        <TBody>
          <TR className="bg-white hover:bg-white">
            {columns.map((column, index) => (
              <TD
                key={`total-${column}`}
                className={`border border-slate-300 px-2 py-1.5 ${index === priceColumnIndex ? 'text-right font-semibold tabular-nums text-slate-900' : ''}`}
              >
                {index === priceColumnIndex ? formatTablePrice(totalPrice) : ''}
              </TD>
            ))}
          </TR>
        </TBody>
        <THead className="bg-slate-100">
          <TR className="hover:bg-slate-100">
            {columns.map((column) => (
              <TH
                key={column}
                className="whitespace-nowrap border border-slate-300 bg-slate-100 px-2 py-2 text-left text-[11px] font-semibold normal-case tracking-normal text-slate-800"
              >
                {column}
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => {
            const href = rowHref?.(row)
            const isCurrent = currentItemId !== undefined && currentItemId === row.recoveryItemId
            const rowClass = isCurrent ? `${brandHighlightRowClass} hover:bg-orange-50` : 'hover:bg-slate-50/80'

            return (
              <TR key={row.id} className={rowClass} href={href && !isCurrent ? href : undefined}>
                {columns.map((column) => {
                  const key = COLUMN_KEY_MAP[column]
                  if (!key) {
                    return null
                  }

                  return (
                    <TD key={`${row.id}-${column}`} className={cellClassName(key)}>
                      {renderCellContent(key, row, setItineraryRow)}
                    </TD>
                  )
                })}
              </TR>
            )
          })}
        </TBody>
      </Table>
      </div>

      <ItineraryDetailModal
        row={itineraryRow}
        open={itineraryRow !== null}
        onClose={() => setItineraryRow(null)}
      />
    </>
  )
}
