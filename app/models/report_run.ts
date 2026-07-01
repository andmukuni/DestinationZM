import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Document from '#models/document'
import ReportTemplate from '#models/report_template'
import User from '#models/user'

export type ReportRunStatus = 'pending' | 'completed' | 'failed'

export default class ReportRun extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare templateId: number

  @column()
  declare generatedById: number | null

  @column()
  declare parameters: Record<string, unknown> | null

  @column()
  declare outputDocumentId: number | null

  @column()
  declare status: ReportRunStatus

  @column()
  declare errorMessage: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => ReportTemplate, { foreignKey: 'templateId' })
  declare template: BelongsTo<typeof ReportTemplate>

  @belongsTo(() => User, { foreignKey: 'generatedById' })
  declare generatedBy: BelongsTo<typeof User>

  @belongsTo(() => Document, { foreignKey: 'outputDocumentId' })
  declare outputDocument: BelongsTo<typeof Document>
}
