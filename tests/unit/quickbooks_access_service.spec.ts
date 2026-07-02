import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import QuickbooksAccessService from '#services/quickbooks/quickbooks_access_service'

test.group('QuickbooksAccessService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('allows admin users', async ({ assert }) => {
    const admin = await User.query().where('role', 'admin').firstOrFail()
    assert.doesNotThrow(() => QuickbooksAccessService.assertStaffQuickbooksAccess(admin))
  })

  test('rejects users without quickbooks permission', async ({ assert }) => {
    const user = await User.query().whereNot('role', 'admin').first()
    if (!user) {
      return
    }

    assert.throws(() => QuickbooksAccessService.assertStaffQuickbooksAccess(user))
  })
})
