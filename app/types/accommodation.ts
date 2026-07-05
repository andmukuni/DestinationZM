export const ACCOMMODATION_KINDS = ['hotel', 'lodge', 'apartment'] as const

export type AccommodationKind = (typeof ACCOMMODATION_KINDS)[number]

export const ACCOMMODATION_KIND_LABELS: Record<AccommodationKind, string> = {
  hotel: 'Hotel',
  lodge: 'Lodge',
  apartment: 'Apartment',
}
