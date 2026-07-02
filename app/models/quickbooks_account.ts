import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class QuickbooksAccount extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare quickbooksId: string

  @column()
  declare realmId: string

  @column()
  declare name: string

  @column()
  declare fullyQualifiedName: string | null

  @column()
  declare accountType: string | null

  @column()
  declare accountSubType: string | null

  @column()
  declare classification: string | null

  @column()
  declare currency: string | null

  @column()
  declare active: boolean

  @column()
  declare currentBalance: number | null

  @column.dateTime()
  declare syncedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
