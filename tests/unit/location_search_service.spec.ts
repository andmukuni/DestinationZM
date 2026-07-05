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

  test('filters accommodations by location and star rating', async ({ assert }) => {
    await Accommodation.create({
      name: 'Five Star Lusaka Hotel',
      kind: 'hotel',
      city: 'Lusaka',
      region: 'Lusaka Province',
      country: 'Zambia',
      starRating: 5,
      active: true,
    })
    await Accommodation.create({
      name: 'Budget Lusaka Hotel',
      kind: 'hotel',
      city: 'Lusaka',
      region: 'Lusaka Province',
      country: 'Zambia',
      starRating: 3,
      active: true,
    })
    await Accommodation.create({
      name: 'Livingstone Lodge',
      kind: 'lodge',
      city: 'Livingstone',
      region: 'Southern Province',
      country: 'Zambia',
      starRating: 4,
      active: true,
    })

    const service = new LocationSearchService()
    const lusakaFiveStar = await service.listAccommodationsForLocation({
      location: 'Lusaka',
      starRating: 5,
    })
    const lusakaAll = await service.listAccommodationsForLocation({
      location: 'Lusaka',
    })

    assert.equal(lusakaFiveStar.length, 1)
    assert.equal(lusakaFiveStar[0]?.name, 'Five Star Lusaka Hotel')
    assert.isTrue(lusakaAll.some((item) => item.name === 'Budget Lusaka Hotel'))
    assert.isFalse(lusakaAll.some((item) => item.name === 'Livingstone Lodge'))
  })

  test('returns accommodations before cities when both are requested', async ({ assert }) => {
    await Accommodation.create({
      name: 'Avani Victoria Falls Resort',
      kind: 'hotel',
      city: 'Livingstone',
      region: 'Southern Province',
      country: 'Zambia',
      active: true,
    })

    const service = new LocationSearchService()
    const results = await service.search('', ['city', 'hotel'], 12)

    assert.isTrue(results.length > 0)
    assert.equal(results[0]?.kind, 'hotel')
    assert.isTrue(results.some((item) => item.kind === 'city'))
  })
})
