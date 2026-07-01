import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Customer from '#models/customer'
import type { ClientAccountRole } from '#types/client_account'
import type { PortalPrivilege } from '#types/portal_privileges'

export default class ClientAccount extends compose(
  BaseModel,
  withAuthFinder(hash)
) {
  @column({ isPrimary: true })
  declare id: number

  /** CRM customer record representing the client organization */
  @column()
  declare customerId: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare role: ClientAccountRole

  @column({
    prepare: (value: PortalPrivilege[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: PortalPrivilege[] | string | null) => {
      if (value === null || value === undefined) {
        return null
      }
      if (Array.isArray(value)) {
        return value
      }
      return JSON.parse(value) as PortalPrivilege[]
    },
  })
  declare privileges: PortalPrivilege[] | null

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Customer)
  declare customer: BelongsTo<typeof Customer>

  get initials() {
    const name = this.fullName ?? this.customer?.fullName ?? this.email
    const [first, last] = name.split(' ')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
