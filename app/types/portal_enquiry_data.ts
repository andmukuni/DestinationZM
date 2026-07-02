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

export function isFlightEnquiryItem(item: {
  slug?: string
  productType?: string | null
}) {
  return item.slug === 'flight' || item.productType?.toLowerCase() === 'flight'
}

export function travelerNamesFromEnquiryFields(
  fields: Record<string, string | number | null> | undefined | null
) {
  if (!fields) {
    return ''
  }

  const raw = fields.traveler_names
  if (raw === null || raw === undefined) {
    return ''
  }

  return String(raw).trim()
}

export function travelerNameFromCartItem(cartItem?: EnquiryCartItemPayload) {
  if (!cartItem || !isFlightEnquiryItem(cartItem)) {
    return ''
  }

  return travelerNamesFromEnquiryFields(cartItem.fields)
}

export function resolveTravelerNamesFromEnquiryItems(items: EnquiryCartItemPayload[]) {
  return items
    .filter(isFlightEnquiryItem)
    .map(travelerNameFromCartItem)
    .filter(Boolean)
    .join('; ')
}

export function resolveTravelerNameFromBooking(booking: {
  travelerName?: string | null
  productType?: string | null
  portalBookingTypeId?: number | null
  enquiryData?: BookingEnquiryData
}) {
  if (isStructuredEnquiryData(booking.enquiryData)) {
    const names = resolveTravelerNamesFromEnquiryItems(booking.enquiryData.items)
    return names || null
  }

  if (isFlightEnquiryItem({ productType: booking.productType }) && booking.enquiryData) {
    const names = travelerNamesFromEnquiryFields(booking.enquiryData as LegacyEnquiryData)
    return names || null
  }

  if (booking.travelerName?.trim()) {
    return booking.travelerName.trim()
  }

  return null
}
