import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class QuickbooksItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare quickbooksId: string

  @column()
  declare realmId: string

  @column()
  declare name: string

  @column()
  declare sku: string | null

  @column()
  declare type: string | null

  @column()
  declare description: string | null

  @column()
  declare unitPrice: number | null

  @column()
  declare incomeAccountName: string | null

  @column()
  declare active: boolean

  @column.dateTime()
  declare syncedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
