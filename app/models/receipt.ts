import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Document from '#models/document'
import Invoice from '#models/invoice'
import User from '#models/user'
import PaymentRecord from '#models/payment_record'

export default class Receipt extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare receiptNumber: string

  @column()
  declare invoiceId: number

  @column()
  declare customerId: number

  @column()
  declare branchId: number

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare paymentMethod: string

  @column()
  declare paymentReference: string | null

  @column.date()
  declare receivedDate: DateTime

  @column()
  declare notes: string | null

  @column()
  declare documentId: number | null

  @column()
  declare recordedById: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Invoice)
  declare invoice: BelongsTo<typeof Invoice>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => Document)
  declare document: BelongsTo<typeof Document>

  @belongsTo(() => User, { foreignKey: 'recordedById' })
  declare recordedBy: BelongsTo<typeof User>

  @hasMany(() => PaymentRecord)
  declare paymentRecords: HasMany<typeof PaymentRecord>
}
