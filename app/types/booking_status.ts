export const BOOKING_STATUSES = [
  'enquiry_submitted',
  'quotation_preparing',
  'quotation_sent',
  'quotation_approved',
  'confirmed',
  'recovery_preparing',
  'recovery_sent',
  'recovery_confirmed',
  'invoiced',
  'paid',
  'closed',
  'cancelled',
  // legacy aliases kept for migration compatibility
  'draft',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  enquiry_submitted: 'Enquiry submitted',
  quotation_preparing: 'Quotation preparing',
  quotation_sent: 'Quotation sent',
  quotation_approved: 'Quotation approved',
  confirmed: 'Confirmed',
  recovery_preparing: 'Recovery report preparing',
  recovery_sent: 'Recovery report sent',
  recovery_confirmed: 'Recovery report confirmed',
  invoiced: 'Invoiced',
  paid: 'Paid',
  closed: 'Closed',
  cancelled: 'Cancelled',
  draft: 'Draft',
}

export const QUOTATION_STATUSES = [
  'draft',
  'sent',
  'client_approved',
  'client_rejected',
  'expired',
  'superseded',
  // legacy
  'approved',
  'rejected',
] as const

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number]

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  sent: 'Pending for approval',
  client_approved: 'Client approved',
  client_rejected: 'Client rejected',
  expired: 'Expired',
  superseded: 'Superseded',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function quotationStatusLabel(status: string) {
  return QUOTATION_STATUS_LABELS[status as QuotationStatus] ?? status
}

/** Client-portal wording (second person / client perspective). */
export const PORTAL_QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft: 'Draft',
  sent: 'Awaiting your approval',
  client_approved: 'Approved',
  client_rejected: 'Declined',
  expired: 'Expired',
  superseded: 'Superseded',
  approved: 'Approved',
  rejected: 'Declined',
}

export function portalQuotationStatusLabel(status: string) {
  return PORTAL_QUOTATION_STATUS_LABELS[status as QuotationStatus] ?? status
}

export const RECOVERY_REPORT_STATUSES = [
  'draft',
  'sent',
  'client_confirmed',
  'client_rejected',
  'superseded',
] as const

export type RecoveryReportStatus = (typeof RECOVERY_REPORT_STATUSES)[number]

export const RECOVERY_REPORT_STATUS_LABELS: Record<RecoveryReportStatus, string> = {
  draft: 'Draft',
  sent: 'Sent to client',
  client_confirmed: 'Client confirmed',
  client_rejected: 'Client rejected',
  superseded: 'Superseded',
}
