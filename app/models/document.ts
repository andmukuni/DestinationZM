import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DocumentType } from '#types/document_types'
import Branch from '#models/branch'
import User from '#models/user'

export type DocumentStatus = 'active' | 'archived'

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare documentType: DocumentType

  @column()
  declare title: string

  @column()
  declare filePath: string

  @column()
  declare mimeType: string | null

  @column()
  declare fileSize: number | null

  @column()
  declare referenceType: string | null

  @column()
  declare referenceId: number | null

  @column()
  declare uploadedById: number | null

  @column()
  declare branchId: number | null

  @column()
  declare status: DocumentStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => User, { foreignKey: 'uploadedById' })
  declare uploadedBy: BelongsTo<typeof User>
}
