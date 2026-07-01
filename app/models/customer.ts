import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import Booking from '#models/booking'

export default class Customer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string | null

  @column()
  declare phone: string | null

  @column()
  declare company: string | null

  @column()
  declare notes: string | null

  @column()
  declare branchId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @hasMany(() => Booking)
  declare bookings: HasMany<typeof Booking>
}
