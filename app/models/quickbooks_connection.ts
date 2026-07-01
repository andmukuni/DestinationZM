import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type QuickbooksEnvironment = 'sandbox' | 'production'

export default class QuickbooksConnection extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare realmId: string

  @column()
  declare companyName: string | null

  @column()
  declare accessTokenEncrypted: string

  @column()
  declare refreshTokenEncrypted: string

  @column.dateTime()
  declare accessTokenExpiresAt: DateTime

  @column()
  declare environment: QuickbooksEnvironment

  @column()
  declare connectedByUserId: number | null

  @column()
  declare defaultIncomeAccountId: string | null

  @column()
  declare defaultServiceItemId: string | null

  @column()
  declare defaultServiceItemName: string | null

  @column()
  declare syncEnabled: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'connectedByUserId' })
  declare connectedBy: BelongsTo<typeof User>
}
