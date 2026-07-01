import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Booking from '#models/booking'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Document from '#models/document'
import User from '#models/user'
import type { QuotationStatus } from '#types/booking_status'
import type { QuotationLineItemsData } from '#types/quotation_line_item'

export type { QuotationStatus }

export default class Quotation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reference: string

  @column()
  declare bookingId: number | null

  @column()
  declare customerId: number

  @column()
  declare branchId: number

  @column()
  declare createdById: number | null

  @column()
  declare status: QuotationStatus

  @column()
  declare subtotal: number

  @column()
  declare taxAmount: number

  @column()
  declare totalAmount: number

  @column()
  declare currency: string

  @column.date()
  declare validUntil: DateTime | null

  @column()
  declare notes: string | null

  @column({
    prepare: (value: QuotationLineItemsData | null) => (value ? JSON.stringify(value) : null),
    consume: (value: QuotationLineItemsData | string | null) => {
      if (value === null || value === undefined) {
        return null
      }
      if (typeof value === 'object') {
        return value
      }
      return JSON.parse(value) as QuotationLineItemsData
    },
  })
  declare lineItems: QuotationLineItemsData | null

  @column()
  declare documentId: number | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Booking)
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => Document)
  declare document: BelongsTo<typeof Document>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>
}
