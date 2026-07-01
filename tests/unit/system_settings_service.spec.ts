import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import SystemSetting from '#models/system_setting'
import SystemSettingsService from '#services/settings/system_settings_service'

test.group('SystemSettingsService portal flags', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('isMaintenanceMode reads from database', async ({ assert }) => {
    assert.isFalse(await SystemSettingsService.isMaintenanceMode())

    await SystemSetting.create({
      group: 'other',
      key: 'maintenance_mode',
      value: 'true',
      isSecret: false,
    })

    assert.isTrue(await SystemSettingsService.isMaintenanceMode())
  })

  test('isPortalRegistrationAllowed reads from database', async ({ assert }) => {
    assert.isFalse(await SystemSettingsService.isPortalRegistrationAllowed())

    await SystemSetting.create({
      group: 'other',
      key: 'allow_portal_registration',
      value: 'true',
      isSecret: false,
    })

    assert.isTrue(await SystemSettingsService.isPortalRegistrationAllowed())
  })
})
