import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class SmtpSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare host: string | null

  @column()
  declare port: number

  @column()
  declare secure: boolean

  @column()
  declare username: string | null

  @column()
  declare passwordEncrypted: string | null

  @column()
  declare fromAddress: string | null

  @column()
  declare fromName: string | null

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
