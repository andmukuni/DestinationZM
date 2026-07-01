import type { BookingStatus } from '#types/booking_status'

export type EnquiryStatusTone = 'pending' | 'quoted' | 'approved'

export function enquiryStatusBadge(status: BookingStatus): {
  label: string
  tone: EnquiryStatusTone
} {
  switch (status) {
    case 'enquiry_submitted':
    case 'quotation_preparing':
      return { label: 'Under review', tone: 'pending' }
    case 'quotation_sent':
      return { label: 'Quotation added', tone: 'quoted' }
    case 'quotation_approved':
      return { label: 'Quotation approved', tone: 'approved' }
    default:
      return { label: 'Under review', tone: 'pending' }
  }
}
