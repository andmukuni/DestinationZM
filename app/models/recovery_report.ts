import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { RecoveryBatchStatus, RecoveryBatchType } from '#types/recovery_reporting'
import Branch from '#models/branch'
import Customer from '#models/customer'
import RecoveryReportItem from '#models/recovery_report_item'
import User from '#models/user'

export default class RecoveryReport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportReference: string

  @column()
  declare customerId: number

  @column()
  declare branchId: number

  @column.date()
  declare reportPeriodStart: DateTime | null

  @column.date()
  declare reportPeriodEnd: DateTime | null

  @column()
  declare reportType: RecoveryBatchType

  @column()
  declare status: RecoveryBatchStatus

  @column()
  declare totalAmount: number

  @column()
  declare currency: string

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime()
  declare approvedAt: DateTime | null

  @column.dateTime()
  declare recoveredAt: DateTime | null

  @column()
  declare createdById: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @hasMany(() => RecoveryReportItem)
  declare items: HasMany<typeof RecoveryReportItem>
}
