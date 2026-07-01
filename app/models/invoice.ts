import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Booking from '#models/booking'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Document from '#models/document'
import Receipt from '#models/receipt'
import PaymentRecord from '#models/payment_record'

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'void'

export default class Invoice extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare invoiceNumber: string

  @column()
  declare bookingId: number | null

  @column()
  declare recoveryReportItemId: number | null

  @column()
  declare customerId: number

  @column()
  declare branchId: number

  @column()
  declare status: InvoiceStatus

  @column()
  declare subtotal: number

  @column()
  declare taxAmount: number

  @column()
  declare totalAmount: number

  @column()
  declare amountPaid: number

  @column()
  declare currency: string

  @column.date()
  declare issueDate: DateTime

  @column.date()
  declare dueDate: DateTime

  @column()
  declare notes: string | null

  @column()
  declare documentId: number | null

  @column()
  declare quickbooksInvoiceId: string | null

  @column()
  declare quickbooksSyncStatus: 'pending' | 'synced' | 'failed' | 'skipped' | null

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

  @hasMany(() => Receipt)
  declare receipts: HasMany<typeof Receipt>

  @hasMany(() => PaymentRecord)
  declare paymentRecords: HasMany<typeof PaymentRecord>
}
