import type { PortalBookingFieldDefinition } from '#types/portal_booking_type'

export function getField(fields: PortalBookingFieldDefinition[], key: string) {
  return fields.find((field) => field.fieldKey === key)
}

export function fieldName(key: string) {
  return `fields[${key}]`
}

export function defaultDateOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function formatTripDate(iso: string) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function nightsBetween(start: string, end: string) {
  if (!start || !end) return null
  const startDate = new Date(`${start}T12:00:00`)
  const endDate = new Date(`${end}T12:00:00`)
  const nights = Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000)
  return nights > 0 ? nights : null
}

export function formatNightsLabel(nights: number | null) {
  if (!nights) return null
  return nights === 1 ? '1 night' : `${nights} nights`
}

export type TripFormProps = {
  fields: PortalBookingFieldDefinition[]
  errors?: Record<string, string>
  minDate?: string
  searchLabel?: string
}

export function fieldError(errors: Record<string, string> | undefined, key: string) {
  return errors?.[`fields.${key}`]
}
