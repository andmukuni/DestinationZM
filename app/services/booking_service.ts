import { DateTime } from 'luxon'
import AuditLog from '#models/audit_log'
import Booking from '#models/booking'
import PortalBookingType from '#models/portal_booking_type'
import AuditService from '#services/audit_service'
import DocumentService from '#services/document_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import type { PortalEnquiryCartItem } from '#services/portal_enquiry_cart_service'
import type { BookingStatus } from '#types/booking_status'
import {
  isStructuredEnquiryData,
  type EnquiryCartItemPayload,
  type LegacyEnquiryData,
  type StructuredEnquiryData,
  resolveTravelerNamesFromEnquiryItems,
} from '#types/portal_enquiry_data'

type CreateBookingInput = {
  customerId: number
  branchId: number
  assignedUserId?: number | null
  destination: string
  departDate: DateTime
  returnDate?: DateTime | null
  pax?: number
  totalAmount?: number
  currency?: string
  notes?: string | null
  productType?: string | null
  portalBookingTypeId?: number | null
  enquiryData?: StructuredEnquiryData | Record<string, string | number | null> | null
  travelerName?: string | null
  userId?: number | null
  ipAddress?: string | null
}

export default class BookingService {
  private static auditMetadata(metadata: Record<string, unknown> | string | null) {
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata) as Record<string, unknown>
      } catch {
        return {}
      }
    }
    return metadata ?? {}
  }

  private static async nextReference(branchId: number) {
    const prefix = `DZM-${DateTime.now().toFormat('yyyyMMdd')}`
    const latest = await Booking.query()
      .where('branch_id', branchId)
      .where('reference', 'like', `${prefix}-%`)
      .orderBy('id', 'desc')
      .first()

    const sequence = latest ? Number(latest.reference.split('-').pop()) + 1 : 1
    return `${prefix}-${String(sequence).padStart(4, '0')}`
  }

  static async createEnquiry(input: CreateBookingInput) {
    const booking = await Booking.create({
      reference: await this.nextReference(input.branchId),
      customerId: input.customerId,
      branchId: input.branchId,
      assignedUserId: input.assignedUserId ?? null,
      destination: input.destination,
      departDate: input.departDate,
      returnDate: input.returnDate ?? null,
      pax: input.pax ?? 1,
      status: 'enquiry_submitted',
      totalAmount: input.totalAmount ?? 0,
      currency: input.currency ?? 'ZMW',
      notes: input.notes ?? null,
      productType: input.productType ?? null,
      portalBookingTypeId: input.portalBookingTypeId ?? null,
      enquiryData: input.enquiryData ?? null,
      travelerName: input.travelerName ?? null,
      confirmedAt: null,
    })

    await AuditService.log({
      action: 'booking.enquiry_submitted',
      entityType: 'booking',
      entityId: booking.id,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      metadata: { reference: booking.reference },
    })

    return booking
  }

  private static cartItemToPayload(item: PortalEnquiryCartItem): EnquiryCartItemPayload {
    return {
      bookingTypeId: item.bookingTypeId,
      typeName: item.typeName,
      tabLabel: item.tabLabel,
      slug: item.slug,
      destination: item.destination,
      departDate: item.departDate,
      returnDate: item.returnDate,
      pax: item.pax,
      productType: item.productType,
      notes: item.notes,
      estimatedBudget: item.estimatedBudget,
      summaryLines: item.summaryLines,
      fields: item.enquiryData,
    }
  }

  private static async legacyItemFromBooking(booking: Booking): Promise<EnquiryCartItemPayload> {
    let typeName = PortalBookingTypeService.formatProductTypeLabel(booking.productType)
    let tabLabel = typeName
    let slug = booking.productType ?? 'service'

    if (booking.portalBookingTypeId) {
      const type = await PortalBookingType.find(booking.portalBookingTypeId)
      if (type) {
        typeName = type.name
        tabLabel = type.tabLabel ?? type.name
        slug = type.slug
      }
    }

    return {
      bookingTypeId: booking.portalBookingTypeId ?? 0,
      typeName,
      tabLabel,
      slug,
      destination: booking.destination,
      departDate: booking.departDate.toISODate() ?? '',
      returnDate: booking.returnDate?.toISODate() ?? null,
      pax: booking.pax,
      productType: booking.productType ?? slug,
      notes: booking.notes,
      estimatedBudget: Number(booking.totalAmount ?? 0),
      summaryLines: [],
      fields: (booking.enquiryData as LegacyEnquiryData | null) ?? {},
    }
  }

  private static async existingItemsFromBooking(booking: Booking): Promise<EnquiryCartItemPayload[]> {
    if (isStructuredEnquiryData(booking.enquiryData)) {
      return booking.enquiryData.items
    }
    return [await this.legacyItemFromBooking(booking)]
  }

  private static aggregateEnquiryItems(items: EnquiryCartItemPayload[]) {
    const destinations = [...new Set(items.map((item) => item.destination))]
    const destination = destinations.length === 1 ? destinations[0]! : 'Multiple destinations'

    const departDates = items
      .map((item) => DateTime.fromISO(item.departDate))
      .filter((date) => date.isValid)
    const departDate =
      departDates.sort((a, b) => a.toMillis() - b.toMillis())[0] ?? DateTime.now().plus({ days: 7 })

    const returnDates = items
      .filter((item) => item.returnDate)
      .map((item) => DateTime.fromISO(item.returnDate!))
      .filter((date) => date.isValid)
    const returnDate = returnDates.length
      ? returnDates.sort((a, b) => b.toMillis() - a.toMillis())[0]!
      : null

    const pax = Math.max(...items.map((item) => item.pax))
    const totalAmount = items.reduce((sum, item) => sum + item.estimatedBudget, 0)
    const productType = items.length > 1 ? 'Multi-service' : items[0]!.productType
    const portalBookingTypeId = items.length === 1 ? items[0]!.bookingTypeId : null
    const notes =
      items
        .map((item) => item.notes)
        .filter(Boolean)
        .join('\n\n') || null

    const enquiryData: StructuredEnquiryData = {
      version: 1,
      items,
    }

    const travelerName = resolveTravelerNamesFromEnquiryItems(items) || null

    return {
      destination,
      departDate,
      returnDate,
      pax,
      totalAmount,
      productType,
      portalBookingTypeId,
      notes,
      enquiryData,
      travelerName,
    }
  }

  private static async findOpenEnquiriesForCustomer(customerId: number) {
    return Booking.query()
      .where('customer_id', customerId)
      .where('status', 'enquiry_submitted')
      .whereDoesntHave('quotations', () => {})
      .orderBy('created_at', 'asc')
  }

  private static async mergeOpenEnquiries(
    openEnquiries: Booking[],
    newItems: EnquiryCartItemPayload[],
    options?: { userId?: number | null; ipAddress?: string | null; currency?: string }
  ) {
    const primary = openEnquiries[0]!
    const existingItems = (
      await Promise.all(openEnquiries.map((booking) => this.existingItemsFromBooking(booking)))
    ).flat()
    const mergedItems = [...existingItems, ...newItems]
    const aggregated = this.aggregateEnquiryItems(mergedItems)

    primary.merge({
      ...aggregated,
      currency: options?.currency ?? primary.currency,
      portalBookingTypeId: aggregated.portalBookingTypeId,
      travelerName: aggregated.travelerName,
    })
    await primary.save()

    for (const duplicate of openEnquiries.slice(1)) {
      duplicate.merge({ status: 'cancelled' as BookingStatus })
      await duplicate.save()
      await AuditService.log({
        action: 'booking.enquiry_merged',
        entityType: 'booking',
        entityId: duplicate.id,
        userId: options?.userId ?? null,
        ipAddress: options?.ipAddress ?? null,
        metadata: {
          reference: duplicate.reference,
          mergedInto: primary.reference,
        },
      })
    }

    await AuditService.log({
      action: 'booking.enquiry_updated',
      entityType: 'booking',
      entityId: primary.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
      metadata: {
        reference: primary.reference,
        itemCount: mergedItems.length,
      },
    })

    return primary
  }

  static async consolidateOpenEnquiries(
    customerId: number,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    const openEnquiries = await this.findOpenEnquiriesForCustomer(customerId)
    if (openEnquiries.length <= 1) {
      return openEnquiries[0] ?? null
    }

    return this.mergeOpenEnquiries(openEnquiries, [], options)
  }

  private static enquiryItemKey(item: EnquiryCartItemPayload) {
    return JSON.stringify({
      bookingTypeId: item.bookingTypeId,
      typeName: item.typeName,
      destination: item.destination,
      departDate: item.departDate,
      returnDate: item.returnDate,
      pax: item.pax,
      productType: item.productType,
    })
  }

  private static removeMatchingEnquiryItems(
    source: EnquiryCartItemPayload[],
    toRemove: EnquiryCartItemPayload[]
  ) {
    const remaining = [...source]
    for (const item of toRemove) {
      const key = this.enquiryItemKey(item)
      const index = remaining.findIndex((candidate) => this.enquiryItemKey(candidate) === key)
      if (index >= 0) {
        remaining.splice(index, 1)
      }
    }
    return remaining
  }

  private static async applyEnquiryAggregation(booking: Booking, items: EnquiryCartItemPayload[]) {
    const aggregated = this.aggregateEnquiryItems(items)
    booking.merge({
      ...aggregated,
      portalBookingTypeId: aggregated.portalBookingTypeId,
    })
    await booking.save()
  }

  static async restoreConsolidatedEnquiries(
    customerId: number,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    const customerBookings = await Booking.query().where('customer_id', customerId)
    const bookingIds = customerBookings.map((booking) => booking.id)
    if (!bookingIds.length) {
      return []
    }

    const mergeLogs = await AuditLog.query()
      .where('action', 'booking.enquiry_merged')
      .whereIn('entity_id', bookingIds)

    if (!mergeLogs.length) {
      return []
    }

    const mergedIntoByBookingId = new Map<number, string>()
    for (const log of mergeLogs) {
      if (!log.entityId) {
        continue
      }
      const mergedInto = String(this.auditMetadata(log.metadata).mergedInto ?? '')
      if (mergedInto) {
        mergedIntoByBookingId.set(log.entityId, mergedInto)
      }
    }

    const restored: Booking[] = []
    const primaryRefs = [...new Set(mergedIntoByBookingId.values())]

    for (const primaryRef of primaryRefs) {
      const primary = customerBookings.find((booking) => booking.reference === primaryRef)
      if (!primary || primary.status !== 'enquiry_submitted') {
        continue
      }

      const duplicateIds = [...mergedIntoByBookingId.entries()]
        .filter(([, mergedInto]) => mergedInto === primaryRef)
        .map(([entityId]) => entityId)

      const duplicates = await Booking.query()
        .whereIn('id', duplicateIds)
        .where('status', 'cancelled')

      if (!duplicates.length) {
        continue
      }

      let primaryItems = isStructuredEnquiryData(primary.enquiryData)
        ? [...primary.enquiryData.items]
        : []

      for (const duplicate of duplicates) {
        const duplicateItems = await this.existingItemsFromBooking(duplicate)
        primaryItems = this.removeMatchingEnquiryItems(primaryItems, duplicateItems)

        duplicate.merge({ status: 'enquiry_submitted' })
        await duplicate.save()
        await this.applyEnquiryAggregation(duplicate, duplicateItems)

        await AuditService.log({
          action: 'booking.enquiry_restored',
          entityType: 'booking',
          entityId: duplicate.id,
          userId: options?.userId ?? null,
          ipAddress: options?.ipAddress ?? null,
          metadata: {
            reference: duplicate.reference,
            restoredFrom: primaryRef,
          },
        })

        restored.push(duplicate)
      }

      if (primaryItems.length === 0) {
        primary.merge({ status: 'cancelled' })
        await primary.save()
      } else {
        await this.applyEnquiryAggregation(primary, primaryItems)
        restored.push(primary)
      }
    }

    return restored
  }

  static async createEnquiryFromCart(
    cartItems: PortalEnquiryCartItem[],
    input: {
      customerId: number
      branchId: number
      currency?: string
      userId?: number | null
      ipAddress?: string | null
    }
  ) {
    if (!cartItems.length) {
      throw new Error('Cannot create enquiry from an empty cart.')
    }

    const newItems = cartItems.map((item) => this.cartItemToPayload(item))
    const aggregated = this.aggregateEnquiryItems(newItems)

    return this.createEnquiry({
      customerId: input.customerId,
      branchId: input.branchId,
      destination: aggregated.destination,
      departDate: aggregated.departDate,
      returnDate: aggregated.returnDate,
      pax: aggregated.pax,
      totalAmount: aggregated.totalAmount,
      currency: input.currency ?? 'ZMW',
      notes: aggregated.notes,
      productType: aggregated.productType,
      portalBookingTypeId: aggregated.portalBookingTypeId,
      enquiryData: aggregated.enquiryData,
      travelerName: aggregated.travelerName,
      userId: input.userId,
      ipAddress: input.ipAddress,
    })
  }

  static async create(input: CreateBookingInput) {
    const booking = await Booking.create({
      reference: await this.nextReference(input.branchId),
      customerId: input.customerId,
      branchId: input.branchId,
      assignedUserId: input.assignedUserId ?? null,
      destination: input.destination,
      departDate: input.departDate,
      returnDate: input.returnDate ?? null,
      pax: input.pax ?? 1,
      status: 'draft',
      totalAmount: input.totalAmount ?? 0,
      currency: input.currency ?? 'ZMW',
      notes: input.notes ?? null,
      confirmedAt: null,
    })

    await AuditService.log({
      action: 'booking.created',
      entityType: 'booking',
      entityId: booking.id,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      metadata: { reference: booking.reference },
    })

    return booking
  }

  static async cancelEnquiry(
    booking: Booking,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    if (!['enquiry_submitted', 'quotation_preparing'].includes(booking.status)) {
      throw new Error('This enquiry can no longer be cancelled.')
    }

    booking.merge({ status: 'cancelled' })
    await booking.save()

    await AuditService.log({
      action: 'booking.enquiry_cancelled',
      entityType: 'booking',
      entityId: booking.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
      metadata: { reference: booking.reference },
    })

    return booking
  }

  static async confirm(
    booking: Booking,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    await booking.load('customer')

    const nextStatus: BookingStatus = 'confirmed'
    booking.merge({
      status: nextStatus,
      confirmedAt: DateTime.now(),
    })
    await booking.save()

    const confirmationText = [
      'DestinationZM — Enquiry Confirmation',
      `Reference: ${booking.reference}`,
      `Customer: ${booking.customer?.fullName ?? 'N/A'}`,
      `Destination: ${booking.destination}`,
      `Depart: ${booking.departDate.toFormat('dd LLL yyyy')}`,
      `Pax: ${booking.pax}`,
      `Total: ${booking.currency} ${booking.totalAmount}`,
      `Confirmed: ${DateTime.now().toFormat('dd LLL yyyy HH:mm')}`,
    ].join('\n')

    await DocumentService.store({
      documentType: 'booking_confirmation',
      title: `Confirmation — ${booking.reference}`,
      fileName: `${booking.reference}-confirmation.txt`,
      contents: Buffer.from(confirmationText, 'utf-8'),
      mimeType: 'text/plain',
      referenceType: 'booking',
      referenceId: booking.id,
      uploadedById: options?.userId ?? null,
      branchId: booking.branchId,
    })

    await AuditService.log({
      action: 'booking.confirmed',
      entityType: 'booking',
      entityId: booking.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
      metadata: { reference: booking.reference },
    })

    return booking
  }
}
