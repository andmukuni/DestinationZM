import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import type { QuickbooksEnvironment } from '#config/quickbooks'

export default class QuickbooksAppSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: string | null

  @column()
  declare clientSecretEncrypted: string | null

  @column()
  declare redirectUri: string | null

  @column()
  declare environment: QuickbooksEnvironment

  @column()
  declare scopes: string

  @column()
  declare updatedByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'updatedByUserId' })
  declare updatedBy: BelongsTo<typeof User>
}
