import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { DzPaymentStatus, RecoveryItemStatus } from '#types/recovery_reporting'
import Booking from '#models/booking'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Document from '#models/document'
import RecoveryReport from '#models/recovery_report'
import RecoveryReportAuditLog from '#models/recovery_report_audit_log'
import Supplier from '#models/supplier'
import User from '#models/user'

export default class RecoveryReportItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare recoveryReportId: number | null

  @column()
  declare recoveryReference: string

  @column()
  declare bookingId: number

  @column()
  declare customerId: number

  @column()
  declare branchId: number

  @column()
  declare productType: string

  @column()
  declare currency: string

  @column()
  declare price: number

  @column()
  declare pnr: string | null

  @column()
  declare travelerName: string

  @column.date()
  declare travelStart: DateTime | null

  @column.date()
  declare travelEnd: DateTime | null

  @column()
  declare itineraryService: string | null

  @column()
  declare invoiceReceiptNumber: string | null

  @column()
  declare supplierId: number | null

  @column()
  declare supplierName: string | null

  @column()
  declare supplierInvoiceDocumentId: number | null

  @column()
  declare tripName: string | null

  @column()
  declare tripReason: string | null

  @column()
  declare costCenter: string | null

  @column.date()
  declare dateRequested: DateTime | null

  @column()
  declare approvedBy: string | null

  @column()
  declare generalLedgerAccount: string | null

  @column()
  declare dzPaymentStatus: DzPaymentStatus

  @column.date()
  declare dzPaymentDate: DateTime | null

  @column()
  declare dzPaymentReference: string | null

  @column()
  declare amountPaidByDz: number

  @column()
  declare recoveryStatus: RecoveryItemStatus

  @column.dateTime()
  declare sentToClientAt: DateTime | null

  @column.dateTime()
  declare clientReviewedAt: DateTime | null

  @column.dateTime()
  declare clientApprovedAt: DateTime | null

  @column.dateTime()
  declare recoveredAt: DateTime | null

  @column()
  declare clientQuery: string | null

  @column()
  declare rejectionReason: string | null

  @column()
  declare createdById: number | null

  @column()
  declare updatedById: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => RecoveryReport)
  declare recoveryReport: BelongsTo<typeof RecoveryReport>

  @belongsTo(() => Booking)
  declare booking: BelongsTo<typeof Booking>

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => Document, { foreignKey: 'supplierInvoiceDocumentId' })
  declare supplierInvoiceDocument: BelongsTo<typeof Document>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'updatedById' })
  declare updatedBy: BelongsTo<typeof User>

  @hasMany(() => RecoveryReportAuditLog)
  declare auditLogs: HasMany<typeof RecoveryReportAuditLog>
}
