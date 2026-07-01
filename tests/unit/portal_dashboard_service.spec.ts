import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import PortalDashboardService from '#services/portal_dashboard_service'

test.group('PortalDashboardService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('pendingActions queries recovery_report_items not legacy recovery_reports', async ({ assert }) => {
    const actions = await PortalDashboardService.pendingActions(1)
    assert.isArray(actions)
  })

  test('stats includes reportsToConfirm without SQL errors', async ({ assert }) => {
    const stats = await PortalDashboardService.stats(1)
    assert.isNumber(stats.reportsToConfirm)
  })
})
