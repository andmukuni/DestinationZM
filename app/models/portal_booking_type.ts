import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PortalBookingField from '#models/portal_booking_field'
import Booking from '#models/booking'

export default class PortalBookingType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare tabLabel: string | null

  @column()
  declare iconKey: string | null

  @column()
  declare sortOrder: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => PortalBookingField)
  declare fields: HasMany<typeof PortalBookingField>

  @hasMany(() => Booking)
  declare bookings: HasMany<typeof Booking>
}
