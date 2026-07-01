import { DateTime } from 'luxon'
import PortalBookingField from '#models/portal_booking_field'
import PortalBookingType from '#models/portal_booking_type'
import type {
  PortalBookingFieldDefinition,
  PortalBookingTypeDefinition,
} from '#types/portal_booking_type'
import {
  enquiryItemCount,
  isStructuredEnquiryData,
  type BookingEnquiryData,
  type EnquiryCartItemPayload,
  type LegacyEnquiryData,
} from '#types/portal_enquiry_data'

export type PortalEnquiryValidationError = {
  field: string
  message: string
}

export type MappedPortalEnquiry = {
  destination: string
  departDate: DateTime
  returnDate: DateTime | null
  pax: number
  productType: string
  notes: string | null
  enquiryData: Record<string, string | number | null>
  portalBookingTypeId: number
}

function serializeField(field: PortalBookingField): PortalBookingFieldDefinition {
  return {
    id: field.id,
    fieldKey: field.fieldKey,
    label: field.label,
    fieldType: field.fieldType,
    placeholder: field.placeholder,
    required: field.required,
    options: field.options,
    sortOrder: field.sortOrder,
    mapsTo: field.mapsTo,
  }
}

function serializeType(type: PortalBookingType, fields: PortalBookingField[]): PortalBookingTypeDefinition {
  return {
    id: type.id,
    slug: type.slug,
    name: type.name,
    description: type.description,
    tabLabel: type.tabLabel,
    iconKey: type.iconKey,
    sortOrder: type.sortOrder,
    fields: fields.sort((a, b) => a.sortOrder - b.sortOrder).map(serializeField),
  }
}

function normalizeFieldValue(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null
  const value = String(raw).trim()
  return value === '' ? null : value
}

function normalizeCheckboxValue(raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === false) return null
  const value = String(raw).trim().toLowerCase()
  if (value === '' || value === 'false' || value === '0' || value === 'off') return null
  return 'Yes'
}

export default class PortalBookingTypeService {
  static async listActiveForPortal(): Promise<PortalBookingTypeDefinition[]> {
    const types = await PortalBookingType.query()
      .where('is_active', true)
      .orderBy('sort_order', 'asc')
      .preload('fields', (query) => query.orderBy('sort_order', 'asc'))

    return types.map((type) => serializeType(type, type.fields))
  }

  static async listAllForAdmin() {
    const types = await PortalBookingType.query()
      .orderBy('sort_order', 'asc')
      .withCount('fields')

    return types.map((type) => ({
      id: type.id,
      slug: type.slug,
      name: type.name,
      description: type.description,
      sortOrder: type.sortOrder,
      isActive: type.isActive,
      fieldCount: Number(type.$extras.fields_count),
    }))
  }

  static async findActiveById(id: number) {
    const type = await PortalBookingType.query()
      .where('id', id)
      .where('is_active', true)
      .preload('fields', (query) => query.orderBy('sort_order', 'asc'))
      .first()

    return type ? serializeType(type, type.fields) : null
  }

  static async findActiveBySlug(slug: string) {
    const type = await PortalBookingType.query()
      .where('slug', slug)
      .where('is_active', true)
      .preload('fields', (query) => query.orderBy('sort_order', 'asc'))
      .first()

    return type ? serializeType(type, type.fields) : null
  }

  static async findForAdmin(id: number) {
    const type = await PortalBookingType.query()
      .where('id', id)
      .preload('fields', (query) => query.orderBy('sort_order', 'asc'))
      .firstOrFail()

    return {
      id: type.id,
      slug: type.slug,
      name: type.name,
      description: type.description,
      sortOrder: type.sortOrder,
      isActive: type.isActive,
      fields: type.fields.map((field) => ({
        id: field.id,
        fieldKey: field.fieldKey,
        label: field.label,
        fieldType: field.fieldType,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options,
        sortOrder: field.sortOrder,
        mapsTo: field.mapsTo,
      })),
    }
  }

  static validateSubmission(
    type: PortalBookingTypeDefinition,
    rawFields: Record<string, unknown>
  ): PortalEnquiryValidationError[] {
    const errors: PortalEnquiryValidationError[] = []

    for (const field of type.fields) {
      const raw = rawFields[field.fieldKey]
      const value = field.fieldType === 'checkbox' ? normalizeCheckboxValue(raw) : normalizeFieldValue(raw)
      const errorField = `fields.${field.fieldKey}`

      if (field.required && !value) {
        errors.push({ field: errorField, message: `${field.label} is required` })
        continue
      }

      if (!value) continue

      if (field.fieldType === 'number') {
        const parsed = Number(value)
        if (Number.isNaN(parsed)) {
          errors.push({ field: errorField, message: `${field.label} must be a number` })
        } else if (parsed < 0) {
          errors.push({ field: errorField, message: `${field.label} must be zero or greater` })
        }
      }

      if (field.fieldType === 'date') {
        const parsed = DateTime.fromISO(value)
        if (!parsed.isValid) {
          errors.push({ field: errorField, message: `${field.label} must be a valid date` })
        }
      }

      if (field.fieldType === 'time') {
        if (!/^\d{2}:\d{2}$/.test(value)) {
          errors.push({ field: errorField, message: `${field.label} must be a valid time` })
        }
      }

      if ((field.fieldType === 'select' || field.fieldType === 'radio') && field.options?.length) {
        if (!field.options.includes(value)) {
          errors.push({ field: errorField, message: `${field.label} has an invalid option` })
        }
      }
    }

    return errors
  }

  static mapToBookingInput(
    type: PortalBookingTypeDefinition,
    rawFields: Record<string, unknown>
  ): MappedPortalEnquiry {
    const enquiryData: Record<string, string | number | null> = {}
    const noteLines: string[] = []
    let destination = type.name
    let departDate = DateTime.now().plus({ days: 7 })
    let returnDate: DateTime | null = null
    let pax = 1
    let productType = type.slug

    for (const field of type.fields) {
      const raw = rawFields[field.fieldKey]
      const normalized =
        field.fieldType === 'checkbox' ? normalizeCheckboxValue(raw) : normalizeFieldValue(raw)

      if (normalized === null) {
        enquiryData[field.fieldKey] = null
        continue
      }

      if (field.fieldType === 'number') {
        enquiryData[field.fieldKey] = Number(normalized)
      } else {
        enquiryData[field.fieldKey] = normalized
      }

      switch (field.mapsTo) {
        case 'destination':
          destination = normalized
          break
        case 'depart_date': {
          const parsed = DateTime.fromISO(normalized)
          if (parsed.isValid) {
            departDate = parsed
          }
          break
        }
        case 'return_date': {
          const parsed = DateTime.fromISO(normalized)
          if (parsed.isValid) {
            returnDate = parsed
          }
          break
        }
        case 'pax':
          pax = Number(normalized)
          break
        case 'product_type':
          productType = normalized
          break
        case 'notes_line':
          noteLines.push(`${field.label}: ${normalized}`)
          break
        default:
          break
      }
    }

    noteLines.unshift(`Enquiry type: ${type.name}`)

    return {
      destination,
      departDate,
      returnDate,
      pax: Number.isFinite(pax) && pax > 0 ? pax : 1,
      productType,
      notes: noteLines.length ? noteLines.join('\n') : null,
      enquiryData,
      portalBookingTypeId: type.id,
    }
  }

  static formatEnquiryForDisplay(
    typeName: string | null,
    fields: PortalBookingFieldDefinition[],
    enquiryData: Record<string, string | number | null> | null
  ) {
    if (!enquiryData || !fields.length) {
      return []
    }

    const fieldByKey = Object.fromEntries(fields.map((field) => [field.fieldKey, field]))

    return Object.entries(enquiryData)
      .filter(([, value]) => value !== null && value !== '')
      .map(([key, value]) => ({
        label: fieldByKey[key]?.label ?? key,
        value: String(value),
      }))
  }

  static async enquiryDetailsForBooking(booking: {
    portalBookingTypeId: number | null
    enquiryData: BookingEnquiryData
  }) {
    const data = booking.enquiryData

    if (isStructuredEnquiryData(data)) {
      const rows = data.items.flatMap((item) =>
        item.summaryLines.map((line) => ({
          label: `${item.typeName} — ${line.label}`,
          value: line.value,
        }))
      )
      const typeName =
        data.items.length === 1 ? data.items[0]!.typeName : `${data.items.length} services`
      return { typeName, rows }
    }

    if (!booking.portalBookingTypeId) {
      return null
    }

    const type = await PortalBookingType.query()
      .where('id', booking.portalBookingTypeId)
      .preload('fields', (query) => query.orderBy('sort_order', 'asc'))
      .first()

    if (!type) {
      return null
    }

    const fields = type.fields.map((field) => serializeField(field))

    return {
      typeName: type.name,
      rows: this.formatEnquiryForDisplay(type.name, fields, booking.enquiryData as LegacyEnquiryData),
    }
  }

  static formatProductTypeLabel(productType: string | null) {
    if (!productType) return 'Service'

    const labels: Record<string, string> = {
      accommodation: 'Hotels',
      flight: 'Flights',
      car_hire: 'Cars',
      ancillaries: 'Ancillaries',
      'Multi-service': 'Multi-service',
    }

    if (labels[productType]) {
      return labels[productType]
    }

    return productType
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  static enquiryItemCountForBooking(booking: {
    portalBookingTypeId: number | null
    enquiryData: BookingEnquiryData
  }) {
    return enquiryItemCount(booking.enquiryData, booking.portalBookingTypeId)
  }

  static servicesLabelForBooking(booking: {
    portalBookingTypeId: number | null
    enquiryData: BookingEnquiryData
    productType: string | null
  }) {
    const count = this.enquiryItemCountForBooking(booking)
    if (count > 1) {
      return `${count} services`
    }
    if (isStructuredEnquiryData(booking.enquiryData)) {
      return booking.enquiryData.items[0]?.typeName ?? this.formatProductTypeLabel(booking.productType)
    }
    return this.formatProductTypeLabel(booking.productType)
  }

  private static formatDocumentDate(iso: string) {
    const parsed = DateTime.fromISO(iso)
    return parsed.isValid ? parsed.toFormat('dd LLL yyyy') : iso
  }

  private static summaryLinesForItem(
    item: EnquiryCartItemPayload,
    fieldDefinitions: PortalBookingFieldDefinition[]
  ) {
    if (item.summaryLines.length) {
      return item.summaryLines
    }

    if (!item.fields || !Object.keys(item.fields).length) {
      return []
    }

    const fieldByKey = Object.fromEntries(fieldDefinitions.map((field) => [field.fieldKey, field]))

    return Object.entries(item.fields)
      .filter(([, value]) => value !== null && value !== '')
      .map(([key, value]) => ({
        label:
          fieldByKey[key]?.label ??
          key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
        value: String(value),
      }))
  }

  private static buildLineItemDescription(
    item: EnquiryCartItemPayload,
    fieldDefinitions: PortalBookingFieldDefinition[]
  ) {
    const detailLines = this.summaryLinesForItem(item, fieldDefinitions)
    const parts: string[] = []

    if (item.departDate) {
      const depart = this.formatDocumentDate(item.departDate)
      const returnDate = item.returnDate ? this.formatDocumentDate(item.returnDate) : null
      if (returnDate && returnDate !== depart) {
        parts.push(`Travel dates: ${depart} – ${returnDate}`)
      } else {
        parts.push(`Travel date: ${depart}`)
      }
    }

    parts.push(...detailLines.map((line) => `${line.label}: ${line.value}`))

    if (item.notes) {
      parts.push(`Notes: ${item.notes}`)
    }

    return parts.join('\n') || this.formatProductTypeLabel(item.productType)
  }

  private static buildLineItemFromCartPayload(
    item: EnquiryCartItemPayload,
    typeFieldsByTypeId: Map<number, PortalBookingFieldDefinition[]>
  ) {
    const fieldDefinitions = typeFieldsByTypeId.get(item.bookingTypeId) ?? []

    return {
      quantity: item.pax,
      title: `${item.typeName} — ${item.destination}`,
      description: this.buildLineItemDescription(item, fieldDefinitions),
      amount: item.estimatedBudget,
    }
  }

  static async enquiryDocumentForBooking(
    booking: {
      reference: string
      status: string
      statusLabel: string
      totalAmount: number
      currency: string
      createdAt: DateTime
      portalBookingTypeId: number | null
      enquiryData: BookingEnquiryData
      destination: string
      productType: string | null
      departDate?: DateTime
      returnDate?: DateTime | null
      notes?: string | null
      pax?: number
    },
    client: {
      company: string | null
      name: string
      contactName: string | null
      email: string | null
      phone: string | null
    },
    branch: { name: string } | null
  ) {
    let lineItems: Array<{
      quantity: number
      title: string
      description: string
      amount: number
    }> = []

    if (isStructuredEnquiryData(booking.enquiryData)) {
      const typeIds = [
        ...new Set(
          booking.enquiryData.items
            .map((item) => item.bookingTypeId)
            .filter((id): id is number => Number.isFinite(id) && id > 0)
        ),
      ]

      const types =
        typeIds.length > 0
          ? await PortalBookingType.query()
              .whereIn('id', typeIds)
              .preload('fields', (query) => query.orderBy('sort_order', 'asc'))
          : []

      const typeFieldsByTypeId = new Map(
        types.map((type) => [type.id, type.fields.map((field) => serializeField(field))])
      )

      lineItems = booking.enquiryData.items.map((item) =>
        this.buildLineItemFromCartPayload(item, typeFieldsByTypeId)
      )
    } else if (booking.portalBookingTypeId && booking.enquiryData) {
      const type = await PortalBookingType.query()
        .where('id', booking.portalBookingTypeId)
        .preload('fields', (query) => query.orderBy('sort_order', 'asc'))
        .first()

      const fields = type?.fields.map((field) => serializeField(field)) ?? []
      const rows = this.formatEnquiryForDisplay(
        type?.name ?? booking.productType,
        fields,
        booking.enquiryData as LegacyEnquiryData
      )

      lineItems = [
        {
          quantity: booking.pax ?? 1,
          title: `${type?.name ?? booking.productType ?? 'Service'} — ${booking.destination}`,
          description: [
            booking.departDate
              ? booking.returnDate &&
                booking.returnDate.toISODate() !== booking.departDate.toISODate()
                ? `Travel dates: ${booking.departDate.toFormat('dd LLL yyyy')} – ${booking.returnDate.toFormat('dd LLL yyyy')}`
                : `Travel date: ${booking.departDate.toFormat('dd LLL yyyy')}`
              : null,
            ...rows.map((row) => `${row.label}: ${row.value}`),
            booking.notes ? `Notes: ${booking.notes}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
          amount: Number(booking.totalAmount ?? 0),
        },
      ]
    }

    const totalEstimated = lineItems.reduce((sum, item) => sum + item.amount, 0)

    return {
      reference: booking.reference,
      submittedDate: booking.createdAt.toFormat('dd LLL yyyy'),
      statusLabel: booking.statusLabel,
      client: {
        company: client.company ?? client.name,
        contactName: client.contactName,
        email: client.email,
        phone: client.phone,
      },
      lineItems,
      totalEstimated,
      currency: booking.currency,
      itemCount: lineItems.length,
      footer: {
        companyName: 'DestinationZM',
        branchName: branch?.name ?? null,
        contactLine: 'info@destinationzm.com · +260 211 000 000',
      },
    }
  }
}
