import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type QuickbooksSyncEntityType = 'customer' | 'invoice' | 'payment'
export type QuickbooksSyncStatus = 'pending' | 'synced' | 'failed' | 'skipped'

export default class QuickbooksSyncRecord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare entityType: QuickbooksSyncEntityType

  @column()
  declare localId: number

  @column()
  declare quickbooksId: string | null

  @column()
  declare realmId: string

  @column()
  declare syncStatus: QuickbooksSyncStatus

  @column()
  declare lastError: string | null

  @column()
  declare lastIntuitTid: string | null

  @column()
  declare attemptCount: number

  @column.dateTime()
  declare syncedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
