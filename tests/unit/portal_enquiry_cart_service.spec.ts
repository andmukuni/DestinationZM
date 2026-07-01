import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import type { HttpContext } from '@adonisjs/core/http'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import PortalEnquiryCartService from '#services/portal_enquiry_cart_service'

type SessionStore = HttpContext['session']

function createMemorySession(): SessionStore {
  const store = new Map<string, unknown>()
  return {
    get(key: string) {
      return store.get(key)
    },
    put(key: string, value: unknown) {
      store.set(key, value)
    },
    forget(key: string) {
      store.delete(key)
    },
  } as SessionStore
}

test.group('PortalEnquiryCartService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('stores and removes cart items in session', async ({ assert }) => {
    const session = createMemorySession()
    const definition = await PortalBookingTypeService.findActiveBySlug('flight')
    assert.exists(definition)

    const mapped = PortalBookingTypeService.mapToBookingInput(definition!, {
      trip_type: 'Round-trip',
      origin: 'Lusaka',
      destination: 'Johannesburg',
      depart_date: '2026-08-01',
      passengers: '2',
      travel_class: 'Economy',
    })

    PortalEnquiryCartService.addFromSubmission(session, definition!, mapped, 5000)
    assert.equal(PortalEnquiryCartService.list(session).length, 1)

    const itemId = PortalEnquiryCartService.list(session)[0]!.id
    const updated = PortalEnquiryCartService.updateBudget(session, itemId, 7200)
    assert.isTrue(updated)
    assert.equal(PortalEnquiryCartService.list(session)[0]!.estimatedBudget, 7200)

    PortalEnquiryCartService.remove(session, itemId)
    assert.equal(PortalEnquiryCartService.list(session).length, 0)
  })

  test('serializes traveler names for the portal cart table', async ({ assert }) => {
    const session = createMemorySession()
    const definition = await PortalBookingTypeService.findActiveBySlug('flight')
    assert.exists(definition)

    const mapped = PortalBookingTypeService.mapToBookingInput(definition!, {
      trip_type: 'Round-trip',
      origin: 'Lusaka',
      destination: 'Livingstone',
      depart_date: '2026-07-02',
      return_date: '2026-07-04',
      passengers: '2',
      travel_class: 'Economy',
      traveler_names: 'Jane Banda, John Banda',
    })

    PortalEnquiryCartService.addFromSubmission(session, definition!, mapped, 0)

    const serialized = PortalEnquiryCartService.serializeForPortal(PortalEnquiryCartService.list(session))
    assert.equal(serialized[0]?.travelerNames, 'Jane Banda, John Banda')
  })
})
