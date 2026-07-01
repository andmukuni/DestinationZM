import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { ROLE_LABELS, type UserRole } from '#types/user_roles'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    const role = this.resource.role as UserRole
    return {
      ...this.pick(this.resource, [
        'id',
        'fullName',
        'email',
        'createdAt',
        'updatedAt',
        'initials',
        'branchId',
        'role',
      ]),
      roleLabel: ROLE_LABELS[role] ?? role,
      branchName: this.resource.branch?.name ?? null,
    }
  }
}
