import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ReportRun from '#models/report_run'

export type ReportTemplateSource = 'system' | 'excel'

export default class ReportTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare source: ReportTemplateSource

  @column()
  declare description: string | null

  @column()
  declare filePath: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => ReportRun, { foreignKey: 'templateId' })
  declare runs: HasMany<typeof ReportRun>
}
