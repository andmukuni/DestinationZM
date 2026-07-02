import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import MfaService from '#services/auth/mfa_service'
import { generateSync } from 'otplib'

test.group('MfaService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('enable and verify TOTP for a user', async ({ assert }) => {
    const user = await User.firstOrFail()
    const { secret } = MfaService.generateSetup(user)
    const token = generateSync({ secret })

    const enabled = await MfaService.enable(user, secret, token)
    assert.isTrue(enabled)
    assert.isTrue(user.mfaEnabled)

    const verified = await MfaService.verifyUser(user, token)
    assert.isTrue(verified)
  })
})
