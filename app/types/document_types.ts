export const DOCUMENT_TYPES = [
  'quotation',
  'booking_confirmation',
  'supplier_document',
  'invoice',
  'receipt',
  'recovery_schedule',
  'recovery_report',
  'payment_record',
  'travel_supporting',
  'excel_report',
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  quotation: 'Quotation',
  booking_confirmation: 'Booking confirmation',
  supplier_document: 'Supplier document',
  invoice: 'Invoice',
  receipt: 'Receipt',
  recovery_schedule: 'Recovery schedule',
  recovery_report: 'Recovery report',
  payment_record: 'Payment record',
  travel_supporting: 'Travel supporting document',
  excel_report: 'Excel report',
}
