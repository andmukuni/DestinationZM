export const PORTAL_BOOKING_FIELD_TYPES = [
  'text',
  'number',
  'date',
  'textarea',
  'select',
  'checkbox',
  'time',
  'radio',
] as const
export type PortalBookingFieldType = (typeof PORTAL_BOOKING_FIELD_TYPES)[number]

export const PORTAL_BOOKING_FIELD_MAPS = [
  'destination',
  'depart_date',
  'return_date',
  'pax',
  'product_type',
  'notes_line',
  'custom',
] as const
export type PortalBookingFieldMapsTo = (typeof PORTAL_BOOKING_FIELD_MAPS)[number]

export type PortalBookingFieldDefinition = {
  id: number
  fieldKey: string
  label: string
  fieldType: PortalBookingFieldType
  placeholder: string | null
  required: boolean
  options: string[] | null
  sortOrder: number
  mapsTo: PortalBookingFieldMapsTo
}

export type PortalBookingTypeDefinition = {
  id: number
  slug: string
  name: string
  description: string | null
  tabLabel: string | null
  iconKey: string | null
  sortOrder: number
  fields: PortalBookingFieldDefinition[]
}
