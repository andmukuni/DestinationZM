import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { AccommodationKind } from '#types/accommodation'

export default class Accommodation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare kind: AccommodationKind

  @column()
  declare city: string

  @column()
  declare region: string | null

  @column()
  declare country: string

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string[] | string | null) => {
      if (value === null || value === undefined) {
        return null
      }
      if (Array.isArray(value)) {
        return value
      }
      return JSON.parse(value) as string[]
    },
  })
  declare keywords: string[] | null

  @column()
  declare active: boolean

  @column()
  declare starRating: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
