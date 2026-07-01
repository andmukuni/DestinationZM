import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { BookingStatus } from '#types/booking_status'
import Branch from '#models/branch'
import Customer from '#models/customer'
import User from '#models/user'
import BookingItem from '#models/booking_item'
import Quotation from '#models/quotation'
import Invoice from '#models/invoice'
import RecoveryReportItem from '#models/recovery_report_item'
import Supplier from '#models/supplier'
import PortalBookingType from '#models/portal_booking_type'
import type { BookingEnquiryData } from '#types/portal_enquiry_data'
import type { DzPaymentStatus } from '#types/recovery_reporting'

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reference: string

  @column()
  declare customerId: number

  @column()
  declare branchId: number

  @column()
  declare assignedUserId: number | null

  @column()
  declare destination: string

  @column.date()
  declare departDate: DateTime

  @column.date()
  declare returnDate: DateTime | null

  @column()
  declare pax: number

  @column()
  declare status: BookingStatus

  @column()
  declare totalAmount: number

  @column()
  declare currency: string

  @column()
  declare notes: string | null

  @column()
  declare productType: string | null

  @column()
  declare pnr: string | null

  @column()
  declare travelerName: string | null

  @column()
  declare itineraryService: string | null

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
  declare supplierId: number | null

  @column()
  declare invoiceReceiptNumber: string | null

  @column()
  declare dzPaymentStatus: DzPaymentStatus

  @column.date()
  declare dzPaymentDate: DateTime | null

  @column()
  declare dzPaymentReference: string | null

  @column()
  declare amountPaidByDz: number

  @column.dateTime()
  declare confirmedAt: DateTime | null

  @column()
  declare portalBookingTypeId: number | null

  @column({
    prepare: (value: BookingEnquiryData) => (value ? JSON.stringify(value) : null),
    consume: (value: BookingEnquiryData | string | null) => {
      if (value === null || value === undefined) return null
      if (typeof value === 'object') return value
      return JSON.parse(value) as BookingEnquiryData
    },
  })
  declare enquiryData: BookingEnquiryData

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => User, { foreignKey: 'assignedUserId' })
  declare assignedUser: BelongsTo<typeof User>

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => PortalBookingType)
  declare portalBookingType: BelongsTo<typeof PortalBookingType>

  @hasMany(() => BookingItem)
  declare items: HasMany<typeof BookingItem>

  @hasMany(() => Quotation)
  declare quotations: HasMany<typeof Quotation>

  @hasMany(() => Invoice)
  declare invoices: HasMany<typeof Invoice>

  @hasMany(() => RecoveryReportItem)
  declare recoveryReportItems: HasMany<typeof RecoveryReportItem>
}
