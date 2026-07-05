import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Accommodation from '#models/accommodation'
import LocationSearchService from '#services/location_search_service'

test.group('LocationSearchService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('finds accommodations by name', async ({ assert }) => {
    await Accommodation.create({
      name: 'Test Falls Lodge',
      kind: 'lodge',
      city: 'Livingstone',
      region: 'Southern Province',
      country: 'Zambia',
      keywords: ['vic falls'],
      active: true,
    })

    const service = new LocationSearchService()
    const results = await service.search('falls lodge', ['lodge'], 10)

    assert.isTrue(results.some((item) => item.value === 'Test Falls Lodge' && item.kind === 'lodge'))
    assert.isTrue(results.some((item) => item.region?.includes('Livingstone')))
  })

  test('finds accommodations by city', async ({ assert }) => {
    await Accommodation.create({
      name: 'Copperbelt Stay Hotel',
      kind: 'hotel',
      city: 'Ndola',
      region: 'Copperbelt Province',
      country: 'Zambia',
      active: true,
    })

    const service = new LocationSearchService()
    const results = await service.search('Ndola', ['hotel', 'lodge', 'apartment'], 10)

    assert.isTrue(results.some((item) => item.value === 'Copperbelt Stay Hotel'))
  })

  test('includes static cities when requested', async ({ assert }) => {
    const service = new LocationSearchService()
    const results = await service.search('Lusaka', ['city', 'hotel'], 10)

    assert.isTrue(results.some((item) => item.kind === 'city' && item.value === 'Lusaka'))
  })
})
