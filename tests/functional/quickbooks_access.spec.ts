import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('QuickBooks route access', (group) => {
  group.setup(() => testUtils.httpServer().start())

  test('guest is redirected away from quickbooks settings', async ({ client, assert }) => {
    const response = await client.get('/settings/quickbooks')
    assert.isTrue(response.status() === 302 || response.status() === 401)
  })

  test('guest cannot start quickbooks oauth connect', async ({ client, assert }) => {
    const response = await client.get('/settings/quickbooks/connect')
    assert.isTrue(response.status() === 302 || response.status() === 401)
  })
})
