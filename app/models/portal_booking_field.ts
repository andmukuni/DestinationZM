import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PortalBookingType from '#models/portal_booking_type'
import type {
  PortalBookingFieldMapsTo,
  PortalBookingFieldType,
} from '#types/portal_booking_type'

export default class PortalBookingField extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare portalBookingTypeId: number

  @column()
  declare fieldKey: string

  @column()
  declare label: string

  @column()
  declare fieldType: PortalBookingFieldType

  @column()
  declare placeholder: string | null

  @column()
  declare required: boolean

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string[] | string | null) => {
      if (value === null || value === undefined) return null
      if (Array.isArray(value)) return value
      return JSON.parse(value) as string[]
    },
  })
  declare options: string[] | null

  @column()
  declare sortOrder: number

  @column()
  declare mapsTo: PortalBookingFieldMapsTo

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => PortalBookingType)
  declare bookingType: BelongsTo<typeof PortalBookingType>
}
