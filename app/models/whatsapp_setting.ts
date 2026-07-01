import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type WhatsappProvider = 'meta' | 'twilio' | 'custom'

export default class WhatsappSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare provider: WhatsappProvider

  @column()
  declare apiKeyEncrypted: string | null

  @column()
  declare phoneNumberId: string | null

  @column()
  declare businessAccountId: string | null

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
