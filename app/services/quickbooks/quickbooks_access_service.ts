import type User from '#models/user'
import { canManageQuickbooks } from '#services/settings/settings_access'

export default class QuickbooksAccessService {
  static assertStaffQuickbooksAccess(user: User) {
    if (!canManageQuickbooks(user)) {
      throw new Error('You do not have permission to manage QuickBooks settings.')
    }
  }
}
