export const RECOVERY_ITEM_STATUSES = [
  'DRAFT',
  'PENDING_INVOICE',
  'READY_FOR_CLIENT',
  'SENT_TO_CLIENT',
  'UNDER_CLIENT_REVIEW',
  'APPROVED_BY_CLIENT',
  'QUERY_RAISED',
  'REJECTED',
  'RECOVERED',
  'VOID',
] as const

export type RecoveryItemStatus = (typeof RECOVERY_ITEM_STATUSES)[number]

export const RECOVERY_ITEM_STATUS_LABELS: Record<RecoveryItemStatus, string> = {
  DRAFT: 'Draft',
  PENDING_INVOICE: 'Pending supplier receipt',
  READY_FOR_CLIENT: 'Ready for client',
  SENT_TO_CLIENT: 'Sent to client',
  UNDER_CLIENT_REVIEW: 'Under client review',
  APPROVED_BY_CLIENT: 'Approved by client',
  QUERY_RAISED: 'Query raised',
  REJECTED: 'Rejected',
  RECOVERED: 'Recovered',
  VOID: 'Void',
}

export const RECOVERY_BATCH_TYPES = ['REAL_TIME', 'WEEKLY_SUMMARY', 'MANUAL_EXPORT'] as const
export type RecoveryBatchType = (typeof RECOVERY_BATCH_TYPES)[number]

export const RECOVERY_BATCH_STATUSES = [
  'DRAFT',
  'SENT',
  'APPROVED',
  'PARTIALLY_RECOVERED',
  'RECOVERED',
  'CANCELLED',
] as const
export type RecoveryBatchStatus = (typeof RECOVERY_BATCH_STATUSES)[number]

export const DZ_PAYMENT_STATUSES = ['NOT_PAID', 'PAID', 'PARTIAL'] as const
export type DzPaymentStatus = (typeof DZ_PAYMENT_STATUSES)[number]

export const RECOVERY_EXCEL_COLUMNS = [
  'Product Type',
  'Currency',
  'Price',
  'PNR',
  'Traveler Name',
  'Travel Start',
  'Travel End',
  'Itinerary / Service',
  'Invoice / Receipt#',
  'Trip Name',
  'Trip Reason',
  'Cost Center',
  'Date Requested',
  'Approved by',
  'General Ledger Account',
] as const

export const RECOVERY_LINE_MATCH_COLUMNS = ['Enquiry item', 'Invoice item'] as const

export const RECOVERY_TABLE_COLUMN_KEY_MAP: Record<string, keyof RecoveryTravelItemRow> = {
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

export const RECOVERY_INDEX_TABLE_COLUMNS = [
  ...RECOVERY_LINE_MATCH_COLUMNS,
  ...RECOVERY_EXCEL_COLUMNS,
] as const

export type RecoveryTravelItemRow = {
  id: number
  enquiryItemLabel: string
  invoiceItemLabel: string
  recoveryItemId: number
  recoveryReference: string
  recoveryStatus: RecoveryItemStatus
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

export const CLIENT_ACTIONABLE_STATUSES: RecoveryItemStatus[] = [
  'SENT_TO_CLIENT',
  'UNDER_CLIENT_REVIEW',
  'QUERY_RAISED',
]
