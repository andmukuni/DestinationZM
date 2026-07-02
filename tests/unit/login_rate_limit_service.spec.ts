import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import SystemSetting from '#models/system_setting'
import LoginRateLimitService from '#services/auth/login_rate_limit_service'

test.group('LoginRateLimitService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('locks after configured failed attempts', async ({ assert }) => {
    await SystemSetting.create({
      group: 'security',
      key: 'login_max_attempts',
      value: '2',
      isSecret: false,
    })
    await SystemSetting.create({
      group: 'security',
      key: 'login_window_minutes',
      value: '15',
      isSecret: false,
    })

    const route = 'staff_login'
    const ip = '127.0.0.1'
    const email = 'test@example.com'

    assert.isFalse(await LoginRateLimitService.isLocked(route, ip, email))
    await LoginRateLimitService.recordFailure(route, ip, email)
    assert.isFalse(await LoginRateLimitService.isLocked(route, ip, email))
    await LoginRateLimitService.recordFailure(route, ip, email)
    assert.isTrue(await LoginRateLimitService.isLocked(route, ip, email))

    await LoginRateLimitService.clear(route, ip, email)
    assert.isFalse(await LoginRateLimitService.isLocked(route, ip, email))
  })
})
