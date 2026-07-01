import { DateTime } from 'luxon'
import Booking from '#models/booking'
import Quotation from '#models/quotation'
import AuditService from '#services/audit_service'
import DocumentService from '#services/document_service'
import NotificationMailService from '#services/notification_mail_service'
import NotificationService from '#services/notification_service'
import PortalBookingTypeService from '#services/portal_booking_type_service'
import type { QuotationStatus } from '#types/booking_status'
import type { QuotationLineItem, QuotationLineItemsData } from '#types/quotation_line_item'

type CreateQuotationInput = {
  customerId: number
  branchId: number
  createdById?: number | null
  bookingId?: number | null
  subtotal?: number
  taxAmount?: number
  totalAmount?: number
  currency?: string
  validUntil?: DateTime | null
  notes?: string | null
  lineItems?: QuotationLineItem[]
  userId?: number | null
  ipAddress?: string | null
}

type UpdateQuotationInput = Partial<
  Pick<
    CreateQuotationInput,
    'subtotal' | 'taxAmount' | 'totalAmount' | 'currency' | 'validUntil' | 'notes' | 'bookingId'
  >
>

export type QuotationDraftFromEnquiry = {
  customerId: number
  customerName: string
  bookingId: number
  bookingReference: string
  branchId: number
  branchName: string
  currency: string
  notes: string | null
  validUntil: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  lineItems: QuotationLineItem[]
}

export default class QuotationService {
  private static async nextReference(branchId: number) {
    const prefix = `QT-${DateTime.now().toFormat('yyyyMMdd')}`
    const latest = await Quotation.query()
      .where('branch_id', branchId)
      .where('reference', 'like', `${prefix}-%`)
      .orderBy('id', 'desc')
      .first()

    const sequence = latest ? Number(latest.reference.split('-').pop()) + 1 : 1
    return `${prefix}-${String(sequence).padStart(4, '0')}`
  }

  static list(branchId?: number) {
    const query = Quotation.query()
      .preload('customer')
      .preload('booking')
      .preload('document')
      .orderBy('created_at', 'desc')

    if (branchId) {
      query.where('branch_id', branchId)
    }

    return query
  }

  static find(id: number) {
    return Quotation.query()
      .where('id', id)
      .preload('customer')
      .preload('booking')
      .preload('branch')
      .preload('document')
      .firstOrFail()
  }

  static async create(input: CreateQuotationInput) {
    const lineItemsData: QuotationLineItemsData | null = input.lineItems?.length
      ? { version: 1, items: input.lineItems }
      : null

    const quotation = await Quotation.create({
      reference: await this.nextReference(input.branchId),
      customerId: input.customerId,
      branchId: input.branchId,
      createdById: input.createdById ?? null,
      bookingId: input.bookingId ?? null,
      status: 'draft',
      subtotal: input.subtotal ?? 0,
      taxAmount: input.taxAmount ?? 0,
      totalAmount: input.totalAmount ?? 0,
      currency: input.currency ?? 'ZMW',
      validUntil: input.validUntil ?? null,
      notes: input.notes ?? null,
      lineItems: lineItemsData,
      documentId: null,
      approvedAt: null,
    })

    await AuditService.log({
      action: 'quotation.created',
      entityType: 'quotation',
      entityId: quotation.id,
      userId: input.userId ?? input.createdById ?? null,
      ipAddress: input.ipAddress ?? null,
      metadata: { reference: quotation.reference },
    })

    return quotation
  }

  static async update(quotation: Quotation, input: UpdateQuotationInput) {
    quotation.merge(input)
    await quotation.save()
    return quotation
  }

  static async buildDraftFromEnquiry(booking: Booking): Promise<QuotationDraftFromEnquiry> {
    await booking.load('customer')
    await booking.load('branch')

    const document = await PortalBookingTypeService.enquiryDocumentForBooking(
      {
        reference: booking.reference,
        status: booking.status,
        statusLabel: booking.status,
        totalAmount: Number(booking.totalAmount ?? 0),
        currency: booking.currency,
        createdAt: booking.createdAt,
        portalBookingTypeId: booking.portalBookingTypeId,
        enquiryData: booking.enquiryData,
        destination: booking.destination,
        productType: booking.productType,
        departDate: booking.departDate,
        returnDate: booking.returnDate,
        notes: booking.notes,
        pax: booking.pax,
      },
      {
        company: booking.customer?.company ?? null,
        name: booking.customer?.fullName ?? '—',
        contactName: booking.customer?.fullName ?? null,
        email: booking.customer?.email ?? null,
        phone: booking.customer?.phone ?? null,
      },
      booking.branch
    )

    const lineItems: QuotationLineItem[] = document.lineItems.map((item) => ({
      quantity: item.quantity,
      title: item.title,
      description: item.description,
      amount: item.amount,
    }))

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)

    return {
      customerId: booking.customerId,
      customerName: booking.customer?.fullName ?? '—',
      bookingId: booking.id,
      bookingReference: booking.reference,
      branchId: booking.branchId,
      branchName: booking.branch?.name ?? '—',
      currency: booking.currency,
      notes: booking.notes,
      validUntil: DateTime.now().plus({ days: 14 }).toISODate() ?? '',
      subtotal,
      taxAmount: 0,
      totalAmount: subtotal,
      lineItems,
    }
  }

  static async createFromEnquiryDraft(
    booking: Booking,
    input: {
      createdById?: number | null
      userId?: number | null
      ipAddress?: string | null
      subtotal: number
      taxAmount: number
      totalAmount: number
      currency: string
      validUntil?: DateTime | null
      notes?: string | null
      lineItems: QuotationLineItem[]
    }
  ) {
    await booking.load('customer')

    const quotation = await this.create({
      customerId: booking.customerId,
      branchId: booking.branchId,
      bookingId: booking.id,
      createdById: input.createdById ?? null,
      subtotal: input.subtotal,
      taxAmount: input.taxAmount,
      totalAmount: input.totalAmount,
      currency: input.currency,
      validUntil: input.validUntil ?? null,
      notes: input.notes ?? null,
      lineItems: input.lineItems,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
    })

    if (booking.status === 'enquiry_submitted') {
      booking.status = 'quotation_preparing'
      await booking.save()
    }

    return quotation
  }

  static async createFromBooking(
    booking: Booking,
    options?: { createdById?: number | null; userId?: number | null; ipAddress?: string | null }
  ) {
    await booking.load('customer')
    const draft = await this.buildDraftFromEnquiry(booking)

    const quotation = await this.create({
      customerId: booking.customerId,
      branchId: booking.branchId,
      bookingId: booking.id,
      createdById: options?.createdById ?? null,
      subtotal: draft.subtotal,
      taxAmount: draft.taxAmount,
      totalAmount: draft.totalAmount,
      currency: draft.currency,
      validUntil: DateTime.fromISO(draft.validUntil),
      notes: draft.notes,
      lineItems: draft.lineItems,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
    })

    booking.status = 'quotation_preparing'
    await booking.save()

    return quotation
  }

  static async send(
    quotation: Quotation,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    await quotation.load('booking', (q) => q.preload('customer'))
    await quotation.load('customer')

    quotation.merge({ status: 'sent' as QuotationStatus })
    await quotation.save()

    if (quotation.booking) {
      quotation.booking.status = 'quotation_sent'
      await quotation.booking.save()
    }

    const docText = [
      'DestinationZM — Quotation',
      `Reference: ${quotation.reference}`,
      `Total: ${quotation.currency} ${quotation.totalAmount}`,
      quotation.notes ?? '',
    ].join('\n')

    const document = await DocumentService.store({
      documentType: 'quotation',
      title: `Quotation — ${quotation.reference}`,
      fileName: `${quotation.reference}.txt`,
      contents: Buffer.from(docText, 'utf-8'),
      mimeType: 'text/plain',
      referenceType: 'quotation',
      referenceId: quotation.id,
      uploadedById: options?.userId ?? null,
      branchId: quotation.branchId,
    })

    quotation.documentId = document.id
    await quotation.save()

    const email = quotation.customer?.email ?? quotation.booking?.customer?.email
    if (email) {
      await NotificationMailService.quotationSentToClient({
        customerEmail: email,
        customerName: quotation.customer?.fullName ?? 'Client',
        quotationReference: quotation.reference,
        bookingReference: quotation.booking?.reference ?? '—',
        totalAmount: quotation.totalAmount,
        currency: quotation.currency,
      })
    }

    await AuditService.log({
      action: 'quotation.sent',
      entityType: 'quotation',
      entityId: quotation.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
    })

    return quotation
  }

  static async clientApprove(
    quotation: Quotation,
    options?: { clientAccountId?: number | null; ipAddress?: string | null }
  ) {
    await quotation.load('booking', (q) => q.preload('customer'))
    await quotation.load('customer')

    quotation.merge({
      status: 'client_approved',
      approvedAt: DateTime.now(),
    })
    await quotation.save()

    if (quotation.booking) {
      quotation.booking.status = 'quotation_approved'
      await quotation.booking.save()
    }

    await NotificationService.notifyRoles(['admin', 'reservations'], {
      type: 'quotation.client_approved',
      title: 'Client approved quotation',
      body: `${quotation.customer?.fullName ?? 'Client'} approved ${quotation.reference}`,
      entityType: 'quotation',
      entityId: quotation.id,
    })

    const adminUser = await import('#models/user').then((m) =>
      m.default.query().where('role', 'admin').first()
    )
    if (adminUser?.email) {
      await NotificationMailService.quotationApprovedByClient({
        staffEmail: adminUser.email,
        customerName: quotation.customer?.fullName ?? 'Client',
        quotationReference: quotation.reference,
        bookingReference: quotation.booking?.reference ?? '—',
      })
    }

    await AuditService.log({
      action: 'quotation.client_approved',
      entityType: 'quotation',
      entityId: quotation.id,
      metadata: { clientAccountId: options?.clientAccountId ?? null },
    })

    return quotation
  }

  static async approve(
    quotation: Quotation,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    quotation.merge({
      status: 'approved',
      approvedAt: DateTime.now(),
    })
    await quotation.save()

    await AuditService.log({
      action: 'quotation.approved',
      entityType: 'quotation',
      entityId: quotation.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
      metadata: { reference: quotation.reference },
    })

    return quotation
  }

  static async linkToBooking(
    quotation: Quotation,
    bookingId: number,
    options?: { userId?: number | null; ipAddress?: string | null }
  ) {
    quotation.bookingId = bookingId
    await quotation.save()

    await AuditService.log({
      action: 'quotation.linked_to_booking',
      entityType: 'quotation',
      entityId: quotation.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
      metadata: { bookingId, reference: quotation.reference },
    })

    return quotation
  }
}
