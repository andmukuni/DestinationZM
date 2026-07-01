import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ClientAccount from '#models/client_account'
import RecoveryReportItem from '#models/recovery_report_item'
import User from '#models/user'

export default class RecoveryReportAuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare recoveryReportItemId: number

  @column()
  declare action: string

  @column()
  declare oldStatus: string | null

  @column()
  declare newStatus: string | null

  @column()
  declare description: string | null

  @column()
  declare performedByUserId: number | null

  @column()
  declare performedByClientId: number | null

  @column.dateTime()
  declare performedAt: DateTime

  @belongsTo(() => RecoveryReportItem)
  declare recoveryReportItem: BelongsTo<typeof RecoveryReportItem>

  @belongsTo(() => User, { foreignKey: 'performedByUserId' })
  declare performedByUser: BelongsTo<typeof User>

  @belongsTo(() => ClientAccount, { foreignKey: 'performedByClientId' })
  declare performedByClient: BelongsTo<typeof ClientAccount>
}
