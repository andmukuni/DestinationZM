import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Booking from '#models/booking'
import Supplier from '#models/supplier'

export default class BookingItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare bookingId: number

  @column()
  declare description: string

  @column()
  declare supplierId: number | null

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare lineTotal: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Booking)
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>
}
