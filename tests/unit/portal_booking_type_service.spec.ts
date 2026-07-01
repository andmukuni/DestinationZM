import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import PortalBookingField from '#models/portal_booking_field'
import PortalBookingType from '#models/portal_booking_type'
import PortalBookingTypeService from '#services/portal_booking_type_service'

async function ensureFlightType() {
  let type = await PortalBookingType.findBy('slug', 'flight')
  if (type) {
    return type
  }

  type = await PortalBookingType.create({
    slug: 'flight',
    name: 'Flight booking',
    description: 'Test flight type',
    sortOrder: 1,
    isActive: true,
  })

  await PortalBookingField.createMany([
    {
      portalBookingTypeId: type.id,
      fieldKey: 'origin',
      label: 'From',
      fieldType: 'text',
      placeholder: null,
      required: true,
      options: null,
      sortOrder: 1,
      mapsTo: 'notes_line',
    },
    {
      portalBookingTypeId: type.id,
      fieldKey: 'destination',
      label: 'To',
      fieldType: 'text',
      placeholder: null,
      required: true,
      options: null,
      sortOrder: 2,
      mapsTo: 'destination',
    },
    {
      portalBookingTypeId: type.id,
      fieldKey: 'depart_date',
      label: 'Departure date',
      fieldType: 'date',
      placeholder: null,
      required: true,
      options: null,
      sortOrder: 3,
      mapsTo: 'depart_date',
    },
    {
      portalBookingTypeId: type.id,
      fieldKey: 'passengers',
      label: 'Passengers',
      fieldType: 'number',
      placeholder: null,
      required: true,
      options: null,
      sortOrder: 4,
      mapsTo: 'pax',
    },
  ])

  return type
}

test.group('PortalBookingTypeService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('lists active portal booking types with fields', async ({ assert }) => {
    await ensureFlightType()
    const types = await PortalBookingTypeService.listActiveForPortal()

    assert.isTrue(types.length >= 1)
    assert.isTrue(types.some((type) => type.slug === 'flight'))
    assert.isTrue(types.find((type) => type.slug === 'flight')!.fields.length >= 4)
  })

  test('validates and maps a flight enquiry submission', async ({ assert }) => {
    await ensureFlightType()
    const definition = await PortalBookingTypeService.findActiveBySlug('flight')
    assert.exists(definition)

    const payload = {
      trip_type: 'Round-trip',
      nonstop: 'Yes',
      origin: 'Lusaka',
      destination: 'Johannesburg',
      depart_date: '2026-08-01',
      passengers: '2',
      travel_class: 'Economy',
    }

    const errors = PortalBookingTypeService.validateSubmission(definition!, payload)
    assert.deepEqual(errors, [])

    const mapped = PortalBookingTypeService.mapToBookingInput(definition!, payload)
    assert.equal(mapped.destination, 'Johannesburg')
    assert.equal(mapped.pax, 2)
    assert.equal(mapped.productType, 'flight')
    assert.include(mapped.notes, 'Leaving from: Lusaka')
    assert.equal(mapped.enquiryData.origin, 'Lusaka')
    assert.equal(mapped.enquiryData.nonstop, 'Yes')
  })

  test('validates train time fields', async ({ assert }) => {
    const type = await PortalBookingType.findBy('slug', 'trains')
    assert.exists(type)

    const definition = await PortalBookingTypeService.findActiveBySlug('trains')
    assert.exists(definition)

    const errors = PortalBookingTypeService.validateSubmission(definition!, {
      departure_station: 'Lusaka',
      arrival_station: 'Livingstone',
      depart_date: '2026-08-01',
      depart_time: '10:00',
      passengers: '1',
    })
    assert.deepEqual(errors, [])

    const invalid = PortalBookingTypeService.validateSubmission(definition!, {
      departure_station: 'Lusaka',
      arrival_station: 'Livingstone',
      depart_date: '2026-08-01',
      depart_time: 'invalid',
      passengers: '1',
    })
    assert.isTrue(invalid.some((error) => error.field === 'fields.depart_time'))
  })
})
