import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Booking from '#models/booking'
import Customer from '#models/customer'
import BookingService from '#services/booking_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import type { PortalEnquiryCartItem } from '#services/portal_enquiry_cart_service'
import { isStructuredEnquiryData } from '#types/portal_enquiry_data'

function buildCartItem(overrides: Partial<PortalEnquiryCartItem> = {}): PortalEnquiryCartItem {
  return {
    id: 'test-item-1',
    bookingTypeId: 1,
    typeName: 'Flights',
    tabLabel: 'Flights',
    slug: 'flight',
    destination: 'Johannesburg',
    departDate: '2026-08-01',
    returnDate: '2026-08-05',
    pax: 2,
    productType: 'flight',
    notes: 'Window seat preferred',
    enquiryData: { origin: 'Lusaka', destination: 'Johannesburg' },
    estimatedBudget: 5000,
    summaryLines: [
      { label: 'Origin', value: 'Lusaka' },
      { label: 'Destination', value: 'Johannesburg' },
    ],
    ...overrides,
  }
}

test.group('BookingService.createEnquiryFromCart', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates one booking from a single cart item', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CART-1' }))

    const customer = await Customer.create({
      fullName: 'Cart Test Client',
      email: `cart-test-1-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const booking = await BookingService.createEnquiryFromCart([buildCartItem()], {
      customerId: customer.id,
      branchId: branch.id,
      currency: 'ZMW',
    })

    assert.equal(booking.destination, 'Johannesburg')
    assert.equal(booking.pax, 2)
    assert.equal(Number(booking.totalAmount), 5000)
    assert.equal(booking.productType, 'flight')
    assert.isTrue(isStructuredEnquiryData(booking.enquiryData))
    if (isStructuredEnquiryData(booking.enquiryData)) {
      assert.equal(booking.enquiryData.items.length, 1)
      assert.equal(booking.enquiryData.items[0]?.typeName, 'Flights')
    }
  })

  test('creates one booking aggregating multiple cart items', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CART-2' }))

    const customer = await Customer.create({
      fullName: 'Cart Test Client',
      email: `cart-test-2-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const items = [
      buildCartItem({
        id: 'item-1',
        destination: 'Lusaka',
        departDate: '2026-09-01',
        returnDate: '2026-09-03',
        pax: 2,
        estimatedBudget: 3000,
        typeName: 'Hotels',
        tabLabel: 'Hotels',
        slug: 'accommodation',
      }),
      buildCartItem({
        id: 'item-2',
        destination: 'Johannesburg',
        departDate: '2026-08-15',
        returnDate: '2026-08-20',
        pax: 4,
        estimatedBudget: 7000,
      }),
    ]

    const booking = await BookingService.createEnquiryFromCart(items, {
      customerId: customer.id,
      branchId: branch.id,
    })

    assert.equal(booking.destination, 'Multiple destinations')
    assert.equal(booking.pax, 4)
    assert.equal(Number(booking.totalAmount), 10000)
    assert.equal(booking.productType, 'Multi-service')
    assert.isNull(booking.portalBookingTypeId)
    assert.equal(booking.departDate.toISODate(), '2026-08-15')
    assert.equal(booking.returnDate?.toISODate(), '2026-09-03')
    assert.isTrue(isStructuredEnquiryData(booking.enquiryData))
    if (isStructuredEnquiryData(booking.enquiryData)) {
      assert.equal(booking.enquiryData.items.length, 2)
    }
  })

  test('creates a separate enquiry when an open enquiry already exists', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CART-3' }))

    const customer = await Customer.create({
      fullName: 'Separate Enquiry Test Client',
      email: `cart-test-3-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const first = await BookingService.createEnquiryFromCart([buildCartItem({ destination: 'Lusaka' })], {
      customerId: customer.id,
      branchId: branch.id,
    })

    const second = await BookingService.createEnquiryFromCart(
      [buildCartItem({ id: 'item-2', destination: 'Ndola', typeName: 'Hotels', slug: 'accommodation' })],
      {
        customerId: customer.id,
        branchId: branch.id,
      }
    )

    assert.notEqual(first.id, second.id)
    assert.equal(first.status, 'enquiry_submitted')
    assert.equal(second.status, 'enquiry_submitted')
    assert.isTrue(isStructuredEnquiryData(first.enquiryData))
    assert.isTrue(isStructuredEnquiryData(second.enquiryData))
    if (isStructuredEnquiryData(first.enquiryData) && isStructuredEnquiryData(second.enquiryData)) {
      assert.equal(first.enquiryData.items.length, 1)
      assert.equal(second.enquiryData.items.length, 1)
      assert.equal(first.enquiryData.items[0]?.destination, 'Lusaka')
      assert.equal(second.enquiryData.items[0]?.destination, 'Ndola')
    }

    const openEnquiries = await Booking.query()
      .where('customer_id', customer.id)
      .where('status', 'enquiry_submitted')

    assert.equal(openEnquiries.length, 2)
  })

  test('portal enquiry list query returns all open enquiries without consolidation', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CART-5' }))

    const customer = await Customer.create({
      fullName: 'Portal List Test Client',
      email: `cart-test-5-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    await BookingService.createEnquiryFromCart([buildCartItem({ destination: 'Lusaka' })], {
      customerId: customer.id,
      branchId: branch.id,
    })

    await BookingService.createEnquiryFromCart(
      [buildCartItem({ id: 'item-2', destination: 'Ndola', typeName: 'Hotels', slug: 'accommodation' })],
      {
        customerId: customer.id,
        branchId: branch.id,
      }
    )

    const listed = await Booking.query()
      .where('customer_id', customer.id)
      .whereIn('status', ['enquiry_submitted', 'quotation_preparing', 'quotation_sent', 'quotation_approved'])

    assert.equal(listed.length, 2)
  })

  test('consolidates multiple open enquiries without new cart items', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CART-4' }))

    const customer = await Customer.create({
      fullName: 'Consolidate Test Client',
      email: `cart-test-4-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    await BookingService.createEnquiry({
      customerId: customer.id,
      branchId: branch.id,
      destination: 'Lusaka',
      departDate: DateTime.fromISO('2026-08-01'),
      pax: 2,
      productType: 'accommodation',
    })

    await BookingService.createEnquiry({
      customerId: customer.id,
      branchId: branch.id,
      destination: 'Ndola',
      departDate: DateTime.fromISO('2026-08-05'),
      pax: 1,
      productType: 'flight',
    })

    const consolidated = await BookingService.consolidateOpenEnquiries(customer.id)
    assert.exists(consolidated)
    assert.equal(consolidated!.destination, 'Multiple destinations')
    assert.isTrue(isStructuredEnquiryData(consolidated!.enquiryData))
    if (isStructuredEnquiryData(consolidated!.enquiryData)) {
      assert.equal(consolidated!.enquiryData.items.length, 2)
    }

    const remaining = await Booking.query()
      .where('customer_id', customer.id)
      .where('status', 'enquiry_submitted')

    assert.equal(remaining.length, 1)
  })
})

test.group('BookingService.cancelEnquiry', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('cancels a pending enquiry', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CANCEL-1' }))

    const customer = await Customer.create({
      fullName: 'Cancel Test Client',
      email: `cancel-test-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const booking = await BookingService.createEnquiryFromCart([buildCartItem()], {
      customerId: customer.id,
      branchId: branch.id,
    })

    await BookingService.cancelEnquiry(booking)

    await booking.refresh()
    assert.equal(booking.status, 'cancelled')
  })

  test('rejects cancellation once a quotation has been sent', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({ name: 'Test HQ', code: 'TST-CANCEL-2' }))

    const customer = await Customer.create({
      fullName: 'Cancel Guard Test Client',
      email: `cancel-guard-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const booking = await BookingService.createEnquiryFromCart([buildCartItem()], {
      customerId: customer.id,
      branchId: branch.id,
    })

    booking.merge({ status: 'quotation_sent' })
    await booking.save()

    await assert.rejects(() => BookingService.cancelEnquiry(booking), /can no longer be cancelled/)
  })
})

test.group('PortalBookingTypeService.enquiryDocumentForBooking', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('builds document line items from structured enquiry data', async ({ assert }) => {
    const document = await PortalBookingTypeService.enquiryDocumentForBooking(
      {
        reference: 'DZM-20260629-0001',
        status: 'enquiry_submitted',
        statusLabel: 'Pending',
        totalAmount: 8000,
        currency: 'ZMW',
        createdAt: DateTime.fromISO('2026-06-29'),
        portalBookingTypeId: null,
        enquiryData: {
          version: 1,
          items: [
            {
              bookingTypeId: 1,
              typeName: 'Hotels',
              tabLabel: 'Hotels',
              slug: 'accommodation',
              destination: 'Livingstone',
              departDate: '2026-07-01',
              returnDate: '2026-07-03',
              pax: 2,
              productType: 'hotel',
              notes: null,
              estimatedBudget: 3000,
              summaryLines: [{ label: 'Location', value: 'Livingstone' }],
              fields: { location: 'Livingstone' },
            },
            {
              bookingTypeId: 2,
              typeName: 'Flights',
              tabLabel: 'Flights',
              slug: 'flight',
              destination: 'Johannesburg',
              departDate: '2026-07-01',
              returnDate: null,
              pax: 2,
              productType: 'flight',
              notes: null,
              estimatedBudget: 5000,
              summaryLines: [{ label: 'Origin', value: 'Lusaka' }],
              fields: { origin: 'Lusaka' },
            },
          ],
        },
        destination: 'Multiple destinations',
        productType: 'Multi-service',
      },
      {
        company: 'Acme Corp',
        name: 'Acme Corp',
        contactName: 'Jane Doe',
        email: 'jane@acme.com',
        phone: '+260 97 000 0000',
      },
      { name: 'Lusaka HQ' }
    )

    assert.equal(document.reference, 'DZM-20260629-0001')
    assert.equal(document.lineItems.length, 2)
    assert.equal(document.totalEstimated, 8000)
    assert.equal(document.itemCount, 2)
    assert.include(document.lineItems[0]!.title, 'Hotels')
    assert.include(document.lineItems[0]!.description, 'Travel dates:')
    assert.include(document.lineItems[0]!.description, 'Location: Livingstone')
    assert.equal(document.client.company, 'Acme Corp')
  })

  test('builds document from legacy flat enquiry data', async ({ assert }) => {
    const flightType = await PortalBookingTypeService.findActiveBySlug('flight')
    assert.exists(flightType)

    const document = await PortalBookingTypeService.enquiryDocumentForBooking(
      {
        reference: 'DZM-20260629-0002',
        status: 'enquiry_submitted',
        statusLabel: 'Enquiry submitted',
        totalAmount: 4500,
        currency: 'ZMW',
        createdAt: DateTime.fromISO('2026-06-29'),
        portalBookingTypeId: flightType!.id,
        enquiryData: {
          origin: 'Lusaka',
          destination: 'Johannesburg',
          depart_date: '2026-08-01',
        },
        destination: 'Johannesburg',
        productType: 'flight',
      },
      {
        company: null,
        name: 'Legacy Client',
        contactName: 'Legacy Client',
        email: 'legacy@example.com',
        phone: null,
      },
      null
    )

    assert.equal(document.lineItems.length, 1)
    assert.include(document.lineItems[0]!.title, 'Johannesburg')
    assert.equal(document.totalEstimated, 4500)
  })
})
