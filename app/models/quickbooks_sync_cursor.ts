import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type QuickbooksCatalogEntity = 'account' | 'item'

export default class QuickbooksSyncCursor extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare realmId: string

  @column()
  declare entity: QuickbooksCatalogEntity

  @column.dateTime()
  declare lastSyncedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
