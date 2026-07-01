import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { beforeSave, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import { requiresBranch } from '#types/user_roles'
import type { UserRole } from '#types/user_roles'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @beforeSave()
  static enforceBranchForScopedRoles(user: User) {
    if (requiresBranch(user.role as UserRole) && !user.branchId) {
      throw new Error('Office is required for this role')
    }
  }

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
