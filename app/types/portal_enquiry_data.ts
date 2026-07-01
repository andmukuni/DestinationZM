export type EnquirySummaryLine = {
  label: string
  value: string
}

export type EnquiryCartItemPayload = {
  bookingTypeId: number
  typeName: string
  tabLabel: string
  slug: string
  destination: string
  departDate: string
  returnDate: string | null
  pax: number
  productType: string
  notes: string | null
  estimatedBudget: number
  summaryLines: EnquirySummaryLine[]
  fields: Record<string, string | number | null>
}

export type StructuredEnquiryData = {
  version: 1
  items: EnquiryCartItemPayload[]
}

export type LegacyEnquiryData = Record<string, string | number | null>

export type BookingEnquiryData = StructuredEnquiryData | LegacyEnquiryData | null

export function isStructuredEnquiryData(
  data: BookingEnquiryData
): data is StructuredEnquiryData {
  return (
    data !== null &&
    typeof data === 'object' &&
    'version' in data &&
    data.version === 1 &&
    Array.isArray((data as StructuredEnquiryData).items)
  )
}

export function enquiryItemCount(
  data: BookingEnquiryData,
  portalBookingTypeId: number | null
): number {
  if (isStructuredEnquiryData(data)) {
    return data.items.length
  }
  if (portalBookingTypeId && data && Object.keys(data).length > 0) {
    return 1
  }
  return 1
}
