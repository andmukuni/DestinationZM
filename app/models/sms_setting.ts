import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type SmsProvider = 'twilio' | 'africas_talking' | 'custom'

export default class SmsSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare provider: SmsProvider

  @column()
  declare accountSid: string | null

  @column()
  declare authTokenEncrypted: string | null

  @column()
  declare fromNumber: string | null

  @column()
  declare enabled: boolean

  @column()
  declare updatedByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'updatedByUserId' })
  declare updatedBy: BelongsTo<typeof User>
}
