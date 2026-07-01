import vine from '@vinejs/vine'
import {
  PORTAL_BOOKING_FIELD_MAPS,
  PORTAL_BOOKING_FIELD_TYPES,
} from '#types/portal_booking_type'

export const portalBookingTypeStoreValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    slug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(60)
      .regex(/^[a-z0-9_]+$/),
    description: vine.string().trim().maxLength(2000).optional(),
    sortOrder: vine.number().min(0).optional(),
    isActive: vine
      .any()
      .optional()
      .transform((value) => value === true || value === 'true' || value === '1' || value === 1),
  })
)

export const portalBookingTypeUpdateValidator = portalBookingTypeStoreValidator

export const portalBookingFieldStoreValidator = vine.compile(
  vine.object({
    fieldKey: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(60)
      .regex(/^[a-z0-9_]+$/),
    label: vine.string().trim().minLength(2).maxLength(120),
    fieldType: vine.enum(PORTAL_BOOKING_FIELD_TYPES),
    placeholder: vine.string().trim().maxLength(255).optional(),
    required: vine
      .any()
      .optional()
      .transform((value) => value === true || value === 'true' || value === '1' || value === 1),
    options: vine.string().trim().maxLength(2000).optional(),
    sortOrder: vine.number().min(0).optional(),
    mapsTo: vine.enum(PORTAL_BOOKING_FIELD_MAPS),
  })
)

export const portalBookingFieldUpdateValidator = portalBookingFieldStoreValidator
