import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export type SystemSettingGroup = 'general' | 'other' | 'security'

export default class SystemSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare group: SystemSettingGroup

  @column()
  declare key: string

  @column()
  declare value: string | null

  @column()
  declare isSecret: boolean

  @column()
  declare updatedByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'updatedByUserId' })
  declare updatedBy: BelongsTo<typeof User>
}
