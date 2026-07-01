import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type PortalRegistrationRequestStatus = 'pending' | 'approved' | 'rejected'

export default class PortalRegistrationRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare company: string | null

  @column()
  declare phone: string | null

  @column()
  declare message: string | null

  @column()
  declare status: PortalRegistrationRequestStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
