import { BaseSeeder } from '@adonisjs/lucid/seeders'
import PortalBookingField from '#models/portal_booking_field'
import PortalBookingType from '#models/portal_booking_type'
import type { PortalBookingFieldMapsTo, PortalBookingFieldType } from '#types/portal_booking_type'

type FieldSeed = {
  fieldKey: string
  label: string
  fieldType: PortalBookingFieldType
  placeholder?: string
  required?: boolean
  options?: string[]
  sortOrder: number
  mapsTo: PortalBookingFieldMapsTo
}

type TypeSeed = {
  slug: string
  name: string
  tabLabel: string
  iconKey: string
  description: string
  sortOrder: number
  fields: FieldSeed[]
}

const TYPE_DEFINITIONS: TypeSeed[] = [
  {
    slug: 'accommodation',
    name: 'Hotels',
    tabLabel: 'Hotels',
    iconKey: 'hotel',
    description: 'Hotels, lodges, and serviced apartments',
    sortOrder: 1,
    fields: [
      {
        fieldKey: 'location',
        label: 'Location',
        fieldType: 'text',
        placeholder: 'City or region',
        required: true,
        sortOrder: 1,
        mapsTo: 'destination',
      },
      {
        fieldKey: 'accommodation_name',
        label: 'Accommodation',
        fieldType: 'text',
        placeholder: 'Hotel, lodge, or apartment',
        required: false,
        sortOrder: 2,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'star_rating',
        label: 'Star rating',
        fieldType: 'select',
        options: ['Any', '5 star', '4 star', '3 star', '2 star', '1 star'],
        required: false,
        sortOrder: 3,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'check_in',
        label: 'Check-in',
        fieldType: 'date',
        required: true,
        sortOrder: 4,
        mapsTo: 'depart_date',
      },
      {
        fieldKey: 'check_out',
        label: 'Check-out',
        fieldType: 'date',
        required: true,
        sortOrder: 5,
        mapsTo: 'return_date',
      },
      {
        fieldKey: 'rooms',
        label: 'Rooms',
        fieldType: 'number',
        required: true,
        sortOrder: 6,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'adults',
        label: 'Adults',
        fieldType: 'number',
        required: true,
        sortOrder: 7,
        mapsTo: 'pax',
      },
      {
        fieldKey: 'children',
        label: 'Children',
        fieldType: 'number',
        sortOrder: 8,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'notes',
        label: 'Additional notes',
        fieldType: 'textarea',
        placeholder: 'Meal plan, accessibility, late check-in…',
        sortOrder: 9,
        mapsTo: 'notes_line',
      },
    ],
  },
  {
    slug: 'flight',
    name: 'Flights',
    tabLabel: 'Flights',
    iconKey: 'plane',
    description: 'Domestic and international flight enquiries',
    sortOrder: 2,
    fields: [
      {
        fieldKey: 'trip_type',
        label: 'Trip type',
        fieldType: 'radio',
        options: ['Round-trip', 'One-way', 'Multi-city'],
        required: true,
        sortOrder: 1,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'nonstop',
        label: 'Nonstop',
        fieldType: 'checkbox',
        sortOrder: 2,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'origin',
        label: 'Leaving from',
        fieldType: 'text',
        placeholder: 'City or airport',
        required: true,
        sortOrder: 3,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'destination',
        label: 'Going to',
        fieldType: 'text',
        placeholder: 'City or airport',
        required: true,
        sortOrder: 4,
        mapsTo: 'destination',
      },
      {
        fieldKey: 'depart_date',
        label: 'Departure date',
        fieldType: 'date',
        required: true,
        sortOrder: 5,
        mapsTo: 'depart_date',
      },
      {
        fieldKey: 'return_date',
        label: 'Return date',
        fieldType: 'date',
        sortOrder: 6,
        mapsTo: 'return_date',
      },
      {
        fieldKey: 'passengers',
        label: 'Passengers',
        fieldType: 'number',
        required: true,
        sortOrder: 7,
        mapsTo: 'pax',
      },
      {
        fieldKey: 'travel_class',
        label: 'Class',
        fieldType: 'select',
        options: ['Economy', 'Premium economy', 'Business', 'First'],
        sortOrder: 8,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'traveler_names',
        label: 'Traveler names',
        fieldType: 'text',
        placeholder: 'Full name of each traveler',
        sortOrder: 9,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'notes',
        label: 'Additional notes',
        fieldType: 'textarea',
        placeholder: 'Preferred airline, baggage, special requests…',
        sortOrder: 10,
        mapsTo: 'notes_line',
      },
    ],
  },
  {
    slug: 'car_hire',
    name: 'Cars',
    tabLabel: 'Cars',
    iconKey: 'car',
    description: 'Vehicle rental and airport transfers',
    sortOrder: 3,
    fields: [
      {
        fieldKey: 'service_type',
        label: 'Service type',
        fieldType: 'radio',
        options: ['Car Rentals', 'Airport Transfers'],
        required: true,
        sortOrder: 1,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'different_dropoff',
        label: 'Drop off at a different location',
        fieldType: 'checkbox',
        sortOrder: 2,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'pickup_location',
        label: 'Pick-up location',
        fieldType: 'text',
        placeholder: 'Airport, city, station, region, district…',
        required: true,
        sortOrder: 3,
        mapsTo: 'destination',
      },
      {
        fieldKey: 'dropoff_location',
        label: 'Drop-off location',
        fieldType: 'text',
        placeholder: 'Same as pick-up if blank',
        sortOrder: 4,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'pickup_date',
        label: 'Pick-up date',
        fieldType: 'date',
        required: true,
        sortOrder: 5,
        mapsTo: 'depart_date',
      },
      {
        fieldKey: 'pickup_time',
        label: 'Pick-up time',
        fieldType: 'time',
        sortOrder: 6,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'return_date',
        label: 'Drop-off date',
        fieldType: 'date',
        sortOrder: 7,
        mapsTo: 'return_date',
      },
      {
        fieldKey: 'return_time',
        label: 'Drop-off time',
        fieldType: 'time',
        sortOrder: 8,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'license_country',
        label: "Driver's license country/region",
        fieldType: 'select',
        options: ['Zambia', 'South Africa', 'Zimbabwe', 'Botswana', 'Other'],
        sortOrder: 9,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'driver_age',
        label: 'Age',
        fieldType: 'select',
        options: ['18-29', '30-60', '61+'],
        sortOrder: 10,
        mapsTo: 'notes_line',
      },
      {
        fieldKey: 'notes',
        label: 'Additional notes',
        fieldType: 'textarea',
        sortOrder: 11,
        mapsTo: 'notes_line',
      },
    ],
  },
  {
    slug: 'ancillaries',
    name: 'Ancillaries',
    tabLabel: 'Ancillaries',
    iconKey: 'attraction',
    description: 'Attractions, transfers, insurance, and other add-on services',
    sortOrder: 4,
    fields: [
      {
        fieldKey: 'service_type',
        label: 'Service type',
        fieldType: 'select',
        options: [
          'Attractions & Tours',
          'Airport Transfers',
          'Travel Insurance',
          'Visa Assistance',
          'Lounge Access',
          'Excess Baggage',
          'Other',
        ],
        required: true,
        sortOrder: 1,
        mapsTo: 'product_type',
      },
      {
        fieldKey: 'search_query',
        label: 'Where / what',
        fieldType: 'text',
        placeholder: 'Destination, supplier, or service detail',
        required: true,
        sortOrder: 2,
        mapsTo: 'destination',
      },
      {
        fieldKey: 'visit_date',
        label: 'Preferred date',
        fieldType: 'date',
        sortOrder: 3,
        mapsTo: 'depart_date',
      },
      {
        fieldKey: 'passengers',
        label: 'Travellers',
        fieldType: 'number',
        sortOrder: 4,
        mapsTo: 'pax',
      },
      {
        fieldKey: 'notes',
        label: 'Additional notes',
        fieldType: 'textarea',
        placeholder: 'Pickup location, policy preferences, special requests…',
        sortOrder: 5,
        mapsTo: 'notes_line',
      },
    ],
  },
]

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const definedSlugs = new Set(TYPE_DEFINITIONS.map((definition) => definition.slug))

    const removedTypes = await PortalBookingType.query().whereNotIn(
      'slug',
      Array.from(definedSlugs)
    )
    for (const type of removedTypes) {
      type.isActive = false
      await type.save()
    }

    for (const definition of TYPE_DEFINITIONS) {
      let bookingType = await PortalBookingType.findBy('slug', definition.slug)
      if (!bookingType) {
        bookingType = await PortalBookingType.create({
          slug: definition.slug,
          name: definition.name,
          tabLabel: definition.tabLabel,
          iconKey: definition.iconKey,
          description: definition.description,
          sortOrder: definition.sortOrder,
          isActive: true,
        })
      } else {
        bookingType.merge({
          name: definition.name,
          tabLabel: definition.tabLabel,
          iconKey: definition.iconKey,
          description: definition.description,
          sortOrder: definition.sortOrder,
          isActive: true,
        })
        await bookingType.save()
      }

      const definedKeys = new Set(definition.fields.map((field) => field.fieldKey))

      const stale = await PortalBookingField.query()
        .where('portal_booking_type_id', bookingType.id)
        .whereNotIn('field_key', Array.from(definedKeys))
      for (const field of stale) {
        await field.delete()
      }

      for (const field of definition.fields) {
        const existing = await PortalBookingField.query()
          .where('portal_booking_type_id', bookingType.id)
          .where('field_key', field.fieldKey)
          .first()

        if (existing) {
          existing.merge({
            label: field.label,
            fieldType: field.fieldType,
            placeholder: field.placeholder ?? null,
            required: field.required ?? false,
            options: field.options ?? null,
            sortOrder: field.sortOrder,
            mapsTo: field.mapsTo,
          })
          await existing.save()
        } else {
          await PortalBookingField.create({
            portalBookingTypeId: bookingType.id,
            fieldKey: field.fieldKey,
            label: field.label,
            fieldType: field.fieldType,
            placeholder: field.placeholder ?? null,
            required: field.required ?? false,
            options: field.options ?? null,
            sortOrder: field.sortOrder,
            mapsTo: field.mapsTo,
          })
        }
      }
    }
  }
}
