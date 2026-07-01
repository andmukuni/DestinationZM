import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Booking from '#models/booking'
import ClientAccount from '#models/client_account'
import Document from '#models/document'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReport from '#models/recovery_report'
import RecoveryReportAuditLog from '#models/recovery_report_audit_log'
import RecoveryReportItem from '#models/recovery_report_item'
import AuditService from '#services/audit_service'
import DocumentService from '#services/document_service'
import InvoiceDocumentService from '#services/invoice_document_service'
import RecoveryReportPdfService from '#services/recovery_report_pdf_service'
import NotificationMailService from '#services/notification_mail_service'
import NotificationService from '#services/notification_service'
import type { QuotationLineItem } from '#types/quotation_line_item'
import { isStructuredEnquiryData } from '#types/portal_enquiry_data'
import type { EnquiryCartItemPayload } from '#types/portal_enquiry_data'
import {
  CLIENT_ACTIONABLE_STATUSES,
  RECOVERY_EXCEL_COLUMNS,
  RECOVERY_INDEX_TABLE_COLUMNS,
  RECOVERY_TABLE_COLUMN_KEY_MAP,
  type RecoveryItemStatus,
  type RecoveryTravelItemRow,
} from '#types/recovery_reporting'

const RECOVERY_TABLE_COLUMN_WIDTHS = [
  18, 18, 14.18, 10.54, 11.18, 15.54, 35.73, 12.73, 11.82, 38.63, 18, 32.54, 35.18, 45.63, 17.63, 17.18,
  58.36,
] as const

export type RecoveryItemDocumentsContext = {
  invoice: { id: number; invoiceNumber: string; status: string } | null
  quotation: { id: number; reference: string } | null
  lineItems: QuotationLineItem[]
  currency: string
  subtotal: number
  taxAmount: number
  totalAmount: number
}

type ActorContext = {
  userId?: number | null
  clientAccountId?: number | null
  ipAddress?: string | null
}

export default class RecoveryReportingService {
  static async nextItemReference(branchId: number) {
    const prefix = `RRI-${DateTime.now().toFormat('yyyyMM')}`
    const latest = await RecoveryReportItem.query()
      .where('branch_id', branchId)
      .where('recovery_reference', 'like', `${prefix}-%`)
      .orderBy('id', 'desc')
      .first()
    const sequence = latest ? Number(latest.recoveryReference.split('-').pop()) + 1 : 1
    return `${prefix}-${String(sequence).padStart(4, '0')}`
  }

  static async nextBatchReference(branchId: number) {
    const prefix = `RRB-${DateTime.now().toFormat('yyyyMM')}`
    const latest = await RecoveryReport.query()
      .where('branch_id', branchId)
      .where('report_reference', 'like', `${prefix}-%`)
      .orderBy('id', 'desc')
      .first()
    const sequence = latest ? Number(latest.reportReference.split('-').pop()) + 1 : 1
    return `${prefix}-${String(sequence).padStart(4, '0')}`
  }

  static determineRecoveryStatus(booking: Booking, hasInvoiceDocument: boolean): RecoveryItemStatus {
    if (!booking.invoiceReceiptNumber || !hasInvoiceDocument) {
      return 'PENDING_INVOICE'
    }

    if (
      !booking.travelerName ||
      !booking.productType ||
      !booking.totalAmount ||
      Number(booking.totalAmount) <= 0 ||
      !booking.costCenter ||
      !booking.approvedBy ||
      !booking.generalLedgerAccount
    ) {
      return 'DRAFT'
    }

    return 'READY_FOR_CLIENT'
  }

  static mapBookingToItemPayload(booking: Booking, createdById?: number | null) {
    const itinerary =
      booking.itineraryService ??
      booking.destination ??
      null

    return {
      recoveryReference: null as string | null,
      bookingId: booking.id,
      customerId: booking.customerId,
      branchId: booking.branchId,
      productType: booking.productType ?? 'travel',
      currency: booking.currency ?? 'ZMW',
      price: Number(booking.totalAmount),
      pnr: booking.pnr,
      travelerName: booking.travelerName ?? booking.customer?.fullName ?? 'Unknown traveler',
      travelStart: booking.departDate,
      travelEnd: booking.returnDate,
      itineraryService: itinerary,
      invoiceReceiptNumber: booking.invoiceReceiptNumber,
      supplierId: booking.supplierId,
      supplierName: booking.supplier?.name ?? null,
      tripName: booking.tripName,
      tripReason: booking.tripReason,
      costCenter: booking.costCenter,
      dateRequested: booking.dateRequested ?? booking.createdAt,
      approvedBy: booking.approvedBy,
      generalLedgerAccount: booking.generalLedgerAccount,
      dzPaymentStatus: booking.dzPaymentStatus ?? 'NOT_PAID',
      dzPaymentDate: booking.dzPaymentDate,
      dzPaymentReference: booking.dzPaymentReference,
      amountPaidByDz: Number(booking.amountPaidByDz ?? 0),
      createdById: createdById ?? null,
    }
  }

  static async createOrPopulateFromInvoice(
    invoice: Invoice,
    actor: ActorContext = {},
    options: { autoSendToClient?: boolean; quotation?: Quotation | null } = {}
  ) {
    await invoice.load('booking', (q) => q.preload('customer').preload('supplier'))
    const booking = invoice.booking
    if (!booking) {
      return null
    }

    const quotation =
      options.quotation ?? (await InvoiceDocumentService.quotationForBooking(booking.id))

    const supplierDocument = await Document.query()
      .where('reference_type', 'booking')
      .where('reference_id', booking.id)
      .where('document_type', 'supplier_document')
      .where('status', 'active')
      .orderBy('id', 'desc')
      .first()

    let item = await RecoveryReportItem.findBy('booking_id', booking.id)
    const hasSupplierInvoice = Boolean(supplierDocument || booking.invoiceReceiptNumber)
    const recoveryStatus = this.determineRecoveryStatus(booking, hasSupplierInvoice)

    if (!item) {
      const reference = await this.nextItemReference(booking.branchId)
      item = await RecoveryReportItem.create({
        ...this.mapBookingToItemPayload(booking, actor.userId),
        recoveryReference: reference,
        recoveryStatus,
        price: Number(invoice.totalAmount),
        supplierInvoiceDocumentId: supplierDocument?.id ?? null,
        tripName: quotation?.reference ?? booking.tripName,
      })

      await this.logAction(item, {
        action: 'RECOVERY_ITEM_CREATED',
        oldStatus: null,
        newStatus: recoveryStatus,
        description: `Recovery report auto-populated from quotation ${quotation?.reference ?? '—'} and client invoice ${invoice.invoiceNumber}.`,
        ...actor,
      })
    } else {
      const oldStatus = item.recoveryStatus
      item.merge({
        price: Number(invoice.totalAmount),
        supplierInvoiceDocumentId: supplierDocument?.id ?? item.supplierInvoiceDocumentId,
        tripName: quotation?.reference ?? item.tripName,
        recoveryStatus: ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED', 'APPROVED_BY_CLIENT', 'RECOVERED'].includes(
          item.recoveryStatus
        )
          ? item.recoveryStatus
          : recoveryStatus,
        updatedById: actor.userId ?? null,
      })
      await item.save()

      await this.logAction(item, {
        action: 'RECOVERY_ITEM_UPDATED',
        oldStatus,
        newStatus: item.recoveryStatus,
        description: `Recovery report linked to quotation ${quotation?.reference ?? '—'} and invoice ${invoice.invoiceNumber}.`,
        ...actor,
      })
    }

    invoice.recoveryReportItemId = item.id
    await invoice.save()

    await item.refresh()
    if (options.autoSendToClient && item.recoveryStatus === 'READY_FOR_CLIENT') {
      try {
        await this.sendToClient(item, actor)
        await item.refresh()
      } catch {
        // Admin can send manually from the booking page when required fields are incomplete.
      }
    }

    return item
  }

  static async createOrPopulateFromIssuedInvoice(invoice: Invoice, actor: ActorContext = {}) {
    return this.createOrPopulateFromInvoice(invoice, actor, { autoSendToClient: true })
  }

  static async updateItemFromBooking(item: RecoveryReportItem, booking: Booking, actor: ActorContext) {
    if (['APPROVED_BY_CLIENT', 'RECOVERED', 'VOID', 'REJECTED'].includes(item.recoveryStatus)) {
      throw new Error('This recovery item can no longer be updated from the booking.')
    }

    await booking.load('supplier')
    const hasInvoiceDocument = Boolean(item.supplierInvoiceDocumentId || booking.invoiceReceiptNumber)
    const nextStatus = this.determineRecoveryStatus(booking, hasInvoiceDocument)
    const oldStatus = item.recoveryStatus

    item.merge({
      productType: booking.productType ?? item.productType,
      currency: booking.currency ?? item.currency,
      price: Number(booking.totalAmount),
      pnr: booking.pnr,
      travelerName: booking.travelerName ?? item.travelerName,
      travelStart: booking.departDate,
      travelEnd: booking.returnDate,
      itineraryService: booking.itineraryService ?? booking.destination,
      invoiceReceiptNumber: booking.invoiceReceiptNumber,
      supplierId: booking.supplierId,
      supplierName: booking.supplier?.name ?? item.supplierName,
      tripName: booking.tripName,
      tripReason: booking.tripReason,
      costCenter: booking.costCenter,
      dateRequested: booking.dateRequested ?? booking.createdAt,
      approvedBy: booking.approvedBy,
      generalLedgerAccount: booking.generalLedgerAccount,
      dzPaymentStatus: booking.dzPaymentStatus,
      dzPaymentDate: booking.dzPaymentDate,
      dzPaymentReference: booking.dzPaymentReference,
      amountPaidByDz: Number(booking.amountPaidByDz ?? 0),
      recoveryStatus: ['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'].includes(item.recoveryStatus)
        ? item.recoveryStatus
        : nextStatus,
      updatedById: actor.userId ?? null,
    })
    await item.save()

    if (oldStatus !== item.recoveryStatus) {
      await this.logAction(item, {
        action: 'RECOVERY_ITEM_UPDATED',
        oldStatus,
        newStatus: item.recoveryStatus,
        description: 'Recovery item updated from booking changes.',
        ...actor,
      })
    }

    return item
  }

  static assertReadyForClient(item: RecoveryReportItem) {
    const missing: string[] = []
    if (!item.productType) missing.push('product_type')
    if (!item.currency) missing.push('currency')
    if (!item.price || Number(item.price) <= 0) missing.push('price')
    if (!item.travelerName) missing.push('traveler_name')
    if (!item.travelStart) missing.push('travel_start')
    if (!item.itineraryService) missing.push('itinerary_service')
    if (!item.invoiceReceiptNumber) missing.push('invoice_receipt_number')
    if (!item.supplierInvoiceDocumentId && !item.invoiceReceiptNumber) {
      missing.push('supplier_invoice_file')
    }
    if (!item.costCenter) missing.push('cost_center')
    if (!item.approvedBy) missing.push('approved_by')
    if (!item.generalLedgerAccount) missing.push('general_ledger_account')

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
  }

  static async sendToClient(
    item: RecoveryReportItem,
    actor: ActorContext & { trx?: ReturnType<typeof db.transaction> extends Promise<infer T> ? T : never } = {}
  ) {
    if (item.recoveryStatus !== 'READY_FOR_CLIENT' && item.recoveryStatus !== 'QUERY_RAISED') {
      if (item.recoveryStatus === 'SENT_TO_CLIENT') {
        return item
      }
      throw new Error('Recovery item is not ready to send to the client.')
    }

    this.assertReadyForClient(item)

    const oldStatus = item.recoveryStatus
    item.merge({
      recoveryStatus: 'SENT_TO_CLIENT',
      sentToClientAt: DateTime.now(),
      updatedById: actor.userId ?? null,
    })
    await item.save()

    await item.load('customer')
    const clientAccounts = await ClientAccount.query()
      .where('customer_id', item.customerId)
      .where('is_active', true)

    for (const account of clientAccounts) {
      void NotificationMailService.recoveryItemSentToClient(item, account.email, account.fullName ?? account.email)
    }

    await NotificationService.notifyRoles(['admin', 'finance'], {
      type: 'recovery_item.sent',
      title: 'Recovery item sent to client',
      body: `${item.recoveryReference} sent to ${item.customer?.fullName ?? 'client'}`,
      entityType: 'recovery_report_item',
      entityId: item.id,
    })

    await this.logAction(item, {
      action: 'SENT_TO_CLIENT',
      oldStatus,
      newStatus: 'SENT_TO_CLIENT',
      description: 'Recovery item sent to client for audit.',
      ...actor,
    })

    return item
  }

  static async clientApprove(item: RecoveryReportItem, actor: ActorContext) {
    if (!CLIENT_ACTIONABLE_STATUSES.includes(item.recoveryStatus)) {
      throw new Error('This recovery item cannot be approved in its current status.')
    }

    const oldStatus = item.recoveryStatus
    item.merge({
      recoveryStatus: 'APPROVED_BY_CLIENT',
      clientApprovedAt: DateTime.now(),
      clientReviewedAt: DateTime.now(),
      clientQuery: null,
    })
    await item.save()

    await NotificationService.notifyRoles(['admin', 'finance'], {
      type: 'recovery_item.client_approved',
      title: 'Client approved recovery item',
      body: `${item.recoveryReference} approved by client`,
      entityType: 'recovery_report_item',
      entityId: item.id,
    })

    await this.logAction(item, {
      action: 'APPROVED_BY_CLIENT',
      oldStatus,
      newStatus: 'APPROVED_BY_CLIENT',
      description: 'Client approved the recovery item.',
      ...actor,
    })

    return item
  }

  static async clientQuery(item: RecoveryReportItem, query: string, actor: ActorContext) {
    if (!CLIENT_ACTIONABLE_STATUSES.includes(item.recoveryStatus)) {
      throw new Error('This recovery item cannot receive a query in its current status.')
    }

    const oldStatus = item.recoveryStatus
    item.merge({
      recoveryStatus: 'QUERY_RAISED',
      clientQuery: query,
      clientReviewedAt: DateTime.now(),
    })
    await item.save()

    await NotificationService.notifyRoles(['admin', 'finance'], {
      type: 'recovery_item.client_query',
      title: 'Client raised query on recovery item',
      body: `${item.recoveryReference}: ${query.slice(0, 120)}`,
      entityType: 'recovery_report_item',
      entityId: item.id,
    })

    await this.logAction(item, {
      action: 'QUERY_RAISED',
      oldStatus,
      newStatus: 'QUERY_RAISED',
      description: query,
      ...actor,
    })

    return item
  }

  static async clientReject(item: RecoveryReportItem, reason: string, actor: ActorContext) {
    if (!CLIENT_ACTIONABLE_STATUSES.includes(item.recoveryStatus)) {
      throw new Error('This recovery item cannot be rejected in its current status.')
    }

    const oldStatus = item.recoveryStatus
    item.merge({
      recoveryStatus: 'REJECTED',
      rejectionReason: reason,
      clientReviewedAt: DateTime.now(),
    })
    await item.save()

    await NotificationService.notifyRoles(['admin', 'finance'], {
      type: 'recovery_item.client_rejected',
      title: 'Client rejected recovery item',
      body: `${item.recoveryReference}: ${reason.slice(0, 120)}`,
      entityType: 'recovery_report_item',
      entityId: item.id,
    })

    await this.logAction(item, {
      action: 'REJECTED',
      oldStatus,
      newStatus: 'REJECTED',
      description: reason,
      ...actor,
    })

    return item
  }

  static async markRecovered(item: RecoveryReportItem, actor: ActorContext) {
    if (item.recoveryStatus !== 'APPROVED_BY_CLIENT') {
      throw new Error('Only client-approved recovery items can be marked as recovered.')
    }

    const oldStatus = item.recoveryStatus
    item.merge({
      recoveryStatus: 'RECOVERED',
      recoveredAt: DateTime.now(),
      updatedById: actor.userId ?? null,
    })
    await item.save()

    await this.logAction(item, {
      action: 'MARKED_RECOVERED',
      oldStatus,
      newStatus: 'RECOVERED',
      description: 'Recovery item marked as reimbursed by client.',
      ...actor,
    })

    return item
  }

  static async voidForCancelledBooking(booking: Booking, actor: ActorContext) {
    const item = await RecoveryReportItem.findBy('booking_id', booking.id)
    if (!item || ['RECOVERED', 'VOID', 'REJECTED'].includes(item.recoveryStatus)) {
      return item
    }

    const oldStatus = item.recoveryStatus
    item.merge({ recoveryStatus: 'VOID', updatedById: actor.userId ?? null })
    await item.save()

    await this.logAction(item, {
      action: 'VOIDED',
      oldStatus,
      newStatus: 'VOID',
      description: 'Recovery item voided because booking was cancelled.',
      ...actor,
    })

    return item
  }

  static async logAction(
    item: RecoveryReportItem,
    input: {
      action: string
      oldStatus: string | null
      newStatus: string | null
      description?: string | null
      userId?: number | null
      clientAccountId?: number | null
      ipAddress?: string | null
    },
    options?: { client?: TransactionClientContract }
  ) {
    await RecoveryReportAuditLog.create(
      {
        recoveryReportItemId: item.id,
        action: input.action,
        oldStatus: input.oldStatus,
        newStatus: input.newStatus,
        description: input.description ?? null,
        performedByUserId: input.userId ?? null,
        performedByClientId: input.clientAccountId ?? null,
        performedAt: DateTime.now(),
      },
      { client: options?.client }
    )

    await AuditService.log({
      action: `recovery_item.${input.action.toLowerCase()}`,
      entityType: 'recovery_report_item',
      entityId: item.id,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      metadata: {
        oldStatus: input.oldStatus,
        newStatus: input.newStatus,
        recoveryReference: item.recoveryReference,
      },
    })
  }

  static pickQuotationForBooking(bookingId: number, quotations: Quotation[]) {
    const forBooking = quotations.filter((quotation) => quotation.bookingId === bookingId)
    const approved = forBooking.find((quotation) =>
      ['client_approved', 'approved'].includes(quotation.status)
    )
    return approved ?? forBooking[0] ?? null
  }

  static async documentsContextByItemId(items: RecoveryReportItem[]) {
    const result = new Map<number, RecoveryItemDocumentsContext>()
    if (items.length === 0) {
      return result
    }

    const itemIds = items.map((item) => item.id)
    const bookingIds = [...new Set(items.map((item) => item.bookingId))]

    const invoices = await Invoice.query()
      .where((builder) => {
        builder.whereIn('recovery_report_item_id', itemIds).orWhereIn('booking_id', bookingIds)
      })
      .orderBy('id', 'desc')

    const invoiceByItemId = new Map<number, Invoice>()
    const invoiceByBookingId = new Map<number, Invoice>()
    for (const invoice of invoices) {
      if (invoice.recoveryReportItemId && !invoiceByItemId.has(invoice.recoveryReportItemId)) {
        invoiceByItemId.set(invoice.recoveryReportItemId, invoice)
      }
      if (invoice.bookingId && !invoiceByBookingId.has(invoice.bookingId)) {
        invoiceByBookingId.set(invoice.bookingId, invoice)
      }
    }

    const quotations = await Quotation.query().whereIn('booking_id', bookingIds).orderBy('created_at', 'desc')

    for (const item of items) {
      const invoice = invoiceByItemId.get(item.id) ?? invoiceByBookingId.get(item.bookingId) ?? null
      const quotation = this.pickQuotationForBooking(item.bookingId, quotations)
      const lineItems = quotation?.lineItems?.items ?? []

      result.set(item.id, {
        invoice: invoice
          ? { id: invoice.id, invoiceNumber: invoice.invoiceNumber, status: invoice.status }
          : null,
        quotation: quotation ? { id: quotation.id, reference: quotation.reference } : null,
        lineItems,
        currency: invoice?.currency ?? item.currency,
        subtotal: Number(invoice?.subtotal ?? quotation?.subtotal ?? 0),
        taxAmount: Number(invoice?.taxAmount ?? quotation?.taxAmount ?? 0),
        totalAmount: Number(invoice?.totalAmount ?? item.price),
      })
    }

    return result
  }

  static wednesdayWindow(reference = DateTime.now()) {
    const day = reference.weekday
    const end = reference.startOf('day')
    const daysSinceWednesday = (day + 7 - 3) % 7
    const periodEnd = daysSinceWednesday === 0 ? end : end.minus({ days: daysSinceWednesday })
    const periodStart = periodEnd.minus({ days: 7 })
    return { periodStart, periodEnd }
  }

  static async createWeeklyBatch(customerId: number, branchId: number, createdById?: number | null) {
    const { periodStart, periodEnd } = this.wednesdayWindow()
    const items = await RecoveryReportItem.query()
      .where('customer_id', customerId)
      .where('branch_id', branchId)
      .where('created_at', '>=', periodStart.toSQL()!)
      .where('created_at', '<', periodEnd.plus({ days: 1 }).toSQL()!)

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price), 0)
    const batch = await RecoveryReport.create({
      reportReference: await this.nextBatchReference(branchId),
      customerId,
      branchId,
      reportPeriodStart: periodStart,
      reportPeriodEnd: periodEnd,
      reportType: 'WEEKLY_SUMMARY',
      status: 'DRAFT',
      totalAmount,
      currency: items[0]?.currency ?? 'ZMW',
      createdById: createdById ?? null,
    })

    for (const item of items) {
      item.recoveryReportId = batch.id
      await item.save()
    }

    return { batch, items }
  }

  static formatDate(value: DateTime | null) {
    if (!value || value.year >= 2099) {
      return ''
    }
    return value.toFormat('yyyy-MM-dd')
  }

  static dateToExcelSerial(value: DateTime | null) {
    if (!value || value.year >= 2099) {
      return null
    }

    const epoch = DateTime.fromObject({ year: 1899, month: 12, day: 30 })
    return value.startOf('day').diff(epoch, 'days').days
  }

  static serializeItemForTable(item: RecoveryReportItem, booking?: Booking): RecoveryTravelItemRow {
    return {
      id: item.id,
      enquiryItemLabel: item.productType,
      invoiceItemLabel: item.productType,
      recoveryItemId: item.id,
      recoveryReference: item.recoveryReference,
      recoveryStatus: item.recoveryStatus,
      productType: item.productType,
      currency: item.currency,
      price: Number(item.price),
      pnr: this.generateLinePnr(item.recoveryReference, item.id, 0),
      travelerName: item.travelerName,
      travelStart: this.formatDate(item.travelStart),
      travelEnd: this.formatDate(item.travelEnd),
      itineraryService: item.itineraryService ?? booking?.destination ?? '',
      invoiceReceiptNumber: item.invoiceReceiptNumber ?? '',
      tripName: item.tripName ?? '',
      tripReason: item.tripReason ?? '',
      costCenter: item.costCenter ?? '',
      dateRequested: this.resolveDateRequested(undefined, item, booking ?? new Booking()),
      approvedBy: item.approvedBy ?? '',
      generalLedgerAccount: item.generalLedgerAccount ?? '',
    }
  }

  private static generateLinePnr(recoveryReference: string | null, recoveryItemId: number, index: number) {
    const base = recoveryReference ?? `RRI-${recoveryItemId}`
    return `${base}-${String(index + 1).padStart(3, '0')}`
  }

  private static buildItineraryDetail(
    cartItem: EnquiryCartItemPayload | undefined,
    invoiceLine: QuotationLineItem | undefined,
    booking: Booking,
    item: RecoveryReportItem
  ) {
    const parts: string[] = []

    if (cartItem) {
      const header = [cartItem.typeName, cartItem.destination].filter(Boolean).join(' — ')
      if (header) {
        parts.push(header)
      }

      const travelStart = cartItem.departDate ? this.formatDateFromIso(cartItem.departDate) : ''
      const travelEnd = cartItem.returnDate ? this.formatDateFromIso(cartItem.returnDate) : ''
      if (travelStart) {
        parts.push(
          travelEnd && travelEnd !== travelStart
            ? `Travel dates: ${travelStart} – ${travelEnd}`
            : `Travel date: ${travelStart}`
        )
      }

      if (cartItem.pax > 0) {
        parts.push(`Travellers: ${cartItem.pax}`)
      }

      if (cartItem.summaryLines.length) {
        parts.push(cartItem.summaryLines.map((line) => `${line.label}: ${line.value}`).join(' · '))
      } else if (cartItem.fields && Object.keys(cartItem.fields).length) {
        const fieldDetails = Object.entries(cartItem.fields)
          .filter(([, value]) => value !== null && value !== '')
          .map(([key, value]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
            return `${label}: ${value}`
          })
        if (fieldDetails.length) {
          parts.push(fieldDetails.join(' · '))
        }
      }

      if (cartItem.notes?.trim()) {
        parts.push(`Notes: ${cartItem.notes.trim()}`)
      }
    }

    if (invoiceLine?.description?.trim()) {
      const description = invoiceLine.description
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' · ')
      if (description && !parts.some((part) => part.includes(description))) {
        parts.push(description)
      }
    } else if (invoiceLine?.title?.trim() && !cartItem) {
      parts.push(invoiceLine.title.trim())
    }

    if (!parts.length) {
      const fallback = item.itineraryService ?? booking.destination ?? booking.itineraryService ?? ''
      if (fallback) {
        parts.push(fallback)
      }
    }

    return parts.join('\n')
  }

  private static resolveDateRequested(
    cartItem: EnquiryCartItemPayload | undefined,
    item: RecoveryReportItem,
    booking: Booking
  ) {
    const fromFields = cartItem
      ? this.enquiryFieldValue(cartItem.fields, 'date_requested', 'dateRequested')
      : ''
    if (fromFields) {
      return this.formatDateFromIso(fromFields)
    }

    if (item.dateRequested) {
      return this.formatDate(item.dateRequested)
    }

    if (booking.dateRequested) {
      return this.formatDate(booking.dateRequested)
    }

    if (booking.createdAt) {
      return this.formatDate(booking.createdAt)
    }

    if (cartItem?.departDate) {
      return this.formatDateFromIso(cartItem.departDate)
    }

    return ''
  }

  private static enquiryItemLabel(cartItem?: EnquiryCartItemPayload) {
    if (!cartItem) {
      return ''
    }
    return [cartItem.typeName, cartItem.destination].filter(Boolean).join(' — ')
  }

  private static invoiceItemLabel(line?: QuotationLineItem) {
    if (!line) {
      return ''
    }
    return line.title || line.description || ''
  }

  private static buildTravelRow(
    item: RecoveryReportItem,
    index: number,
    shared: Omit<
      RecoveryTravelItemRow,
      | 'id'
      | 'enquiryItemLabel'
      | 'invoiceItemLabel'
      | 'productType'
      | 'price'
      | 'pnr'
      | 'travelStart'
      | 'travelEnd'
      | 'itineraryService'
      | 'dateRequested'
    >,
    fields: {
      enquiryItemLabel: string
      invoiceItemLabel: string
      productType: string
      price: number
      pnr: string
      travelStart: string
      travelEnd: string
      itineraryService: string
      dateRequested: string
    }
  ): RecoveryTravelItemRow {
    return {
      id: item.id * 1000 + index,
      enquiryItemLabel: fields.enquiryItemLabel,
      invoiceItemLabel: fields.invoiceItemLabel,
      recoveryItemId: item.id,
      recoveryReference: item.recoveryReference,
      recoveryStatus: item.recoveryStatus,
      productType: fields.productType,
      price: fields.price,
      pnr: fields.pnr,
      travelStart: fields.travelStart,
      travelEnd: fields.travelEnd,
      itineraryService: fields.itineraryService,
      dateRequested: fields.dateRequested,
      ...shared,
    }
  }

  private static enquiryFieldValue(
    fields: Record<string, string | number | null>,
    ...keys: string[]
  ): string {
    for (const key of keys) {
      for (const [fieldKey, value] of Object.entries(fields)) {
        if (
          fieldKey.toLowerCase() === key.toLowerCase() &&
          value !== null &&
          value !== undefined &&
          value !== ''
        ) {
          return String(value)
        }
      }
    }
    return ''
  }

  private static formatDateFromIso(value: string | null | undefined) {
    if (!value) {
      return ''
    }
    const parsed = DateTime.fromISO(value)
    return this.formatDate(parsed.isValid ? parsed : null)
  }

  static buildTravelItemsTableForRecoveryItem(
    item: RecoveryReportItem,
    booking: Booking,
    documents: RecoveryItemDocumentsContext
  ) {
    const invoiceLineItems = documents.lineItems
    const shared = {
      currency: item.currency,
      travelerName: item.travelerName || booking.travelerName || '',
      invoiceReceiptNumber: item.invoiceReceiptNumber ?? documents.invoice?.invoiceNumber ?? '',
      tripName: item.tripName ?? '',
      tripReason: item.tripReason ?? '',
      costCenter: item.costCenter ?? '',
      approvedBy: item.approvedBy ?? '',
      generalLedgerAccount: item.generalLedgerAccount ?? '',
      recoveryItemId: item.id,
      recoveryReference: item.recoveryReference,
      recoveryStatus: item.recoveryStatus,
    }

    let rows: RecoveryTravelItemRow[]

    if (isStructuredEnquiryData(booking.enquiryData)) {
      const cartItems = booking.enquiryData.items
      const rowCount = Math.max(cartItems.length, invoiceLineItems.length, 1)

      rows = Array.from({ length: rowCount }, (_, index) => {
        const cartItem = cartItems[index]
        const invoiceLine = invoiceLineItems[index]

        return this.buildTravelRow(item, index, shared, {
          enquiryItemLabel: this.enquiryItemLabel(cartItem),
          invoiceItemLabel: this.invoiceItemLabel(invoiceLine),
          productType: cartItem?.productType ?? item.productType,
          price: Number(invoiceLine?.amount ?? cartItem?.estimatedBudget ?? 0),
          pnr: this.generateLinePnr(item.recoveryReference, item.id, index),
          travelStart: cartItem?.departDate
            ? this.formatDateFromIso(cartItem.departDate)
            : this.formatDate(item.travelStart ?? booking.departDate),
          travelEnd: cartItem?.returnDate
            ? this.formatDateFromIso(cartItem.returnDate)
            : this.formatDate(item.travelEnd ?? booking.returnDate),
          itineraryService: this.buildItineraryDetail(cartItem, invoiceLine, booking, item),
          dateRequested: this.resolveDateRequested(cartItem, item, booking),
        })
      })
    } else if (invoiceLineItems.length > 0) {
      rows = invoiceLineItems.map((line, index) =>
        this.buildTravelRow(item, index, shared, {
          enquiryItemLabel: line.title || item.productType,
          invoiceItemLabel: this.invoiceItemLabel(line),
          productType: item.productType,
          price: Number(line.amount),
          pnr: this.generateLinePnr(item.recoveryReference, item.id, index),
          travelStart: this.formatDate(item.travelStart ?? booking.departDate),
          travelEnd: this.formatDate(item.travelEnd ?? booking.returnDate),
          itineraryService: this.buildItineraryDetail(undefined, line, booking, item),
          dateRequested: this.resolveDateRequested(undefined, item, booking),
        })
      )
    } else {
      rows = [this.serializeItemForTable(item, booking)]
    }

    const totalPrice = rows.reduce((sum, row) => sum + row.price, 0)

    return {
      displayColumns: [...RECOVERY_INDEX_TABLE_COLUMNS],
      columns: [...RECOVERY_EXCEL_COLUMNS],
      rows,
      totalPrice,
    }
  }

  static travelLineItemCount(
    item: RecoveryReportItem,
    booking: Booking,
    documents: RecoveryItemDocumentsContext
  ) {
    return this.buildTravelItemsTableForRecoveryItem(item, booking, documents).rows.length
  }

  static buildTravelItemsTableForRecoveryItems(
    items: RecoveryReportItem[],
    documentsByItemId: Map<number, RecoveryItemDocumentsContext>
  ) {
    const emptyContext = (item: RecoveryReportItem): RecoveryItemDocumentsContext => ({
      invoice: null,
      quotation: null,
      lineItems: [],
      currency: item.currency,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: Number(item.price),
    })

    const rows: RecoveryTravelItemRow[] = []

    for (const item of items) {
      if (!item.booking) {
        continue
      }
      const table = this.buildTravelItemsTableForRecoveryItem(
        item,
        item.booking,
        documentsByItemId.get(item.id) ?? emptyContext(item)
      )
      rows.push(...table.rows)
    }

    return {
      displayColumns: [...RECOVERY_INDEX_TABLE_COLUMNS],
      columns: [...RECOVERY_EXCEL_COLUMNS],
      rows,
      totalPrice: rows.reduce((sum, row) => sum + row.price, 0),
    }
  }

  private static serializeTravelRowForExcelExport(row: RecoveryTravelItemRow) {
    const travelStart = row.travelStart ? DateTime.fromISO(row.travelStart) : null
    const travelEnd = row.travelEnd ? DateTime.fromISO(row.travelEnd) : null
    const dateRequested = row.dateRequested ? DateTime.fromISO(row.dateRequested) : null

    return {
      enquiryItemLabel: row.enquiryItemLabel,
      invoiceItemLabel: row.invoiceItemLabel,
      productType: row.productType,
      currency: row.currency,
      price: row.price,
      pnr: row.pnr,
      travelerName: row.travelerName,
      travelStart: this.dateToExcelSerial(travelStart?.isValid ? travelStart : null),
      travelEnd: this.dateToExcelSerial(travelEnd?.isValid ? travelEnd : null),
      itineraryService: row.itineraryService,
      invoiceReceiptNumber: row.invoiceReceiptNumber,
      tripName: row.tripName,
      tripReason: row.tripReason,
      costCenter: row.costCenter,
      dateRequested: this.dateToExcelSerial(dateRequested?.isValid ? dateRequested : null),
      approvedBy: row.approvedBy,
      generalLedgerAccount: row.generalLedgerAccount,
    }
  }

  static serializeItemForExcelExport(item: RecoveryReportItem) {
    return {
      productType: item.productType,
      currency: item.currency,
      price: Number(item.price),
      pnr: item.pnr ?? '',
      travelerName: item.travelerName,
      travelStart: this.dateToExcelSerial(item.travelStart),
      travelEnd: this.dateToExcelSerial(item.travelEnd),
      itineraryService: item.itineraryService ?? '',
      invoiceReceiptNumber: item.invoiceReceiptNumber ?? '',
      tripName: item.tripName ?? '',
      tripReason: item.tripReason ?? '',
      costCenter: item.costCenter ?? '',
      dateRequested: this.dateToExcelSerial(item.dateRequested),
      approvedBy: item.approvedBy ?? '',
      generalLedgerAccount: item.generalLedgerAccount ?? '',
    }
  }

  private static excelValueForColumn(
    serializedRow: ReturnType<typeof RecoveryReportingService.serializeTravelRowForExcelExport>,
    column: string
  ) {
    const key = RECOVERY_TABLE_COLUMN_KEY_MAP[column]
    if (!key) {
      return ''
    }

    return serializedRow[key as keyof typeof serializedRow] ?? ''
  }

  static async exportItemsToExcel(
    items: RecoveryReportItem[],
    options: { startDate?: DateTime | null; endDate?: DateTime | null } = {}
  ) {
    const { default: ExcelJS } = await import('exceljs')
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Sheet1')

    sheet.columns = RECOVERY_TABLE_COLUMN_WIDTHS.map((width) => ({ width }))

    await Promise.all(items.map((item) => item.booking ? Promise.resolve() : item.load('booking')))
    const documentsByItemId = await this.documentsContextByItemId(items)
    const travelTable = this.buildTravelItemsTableForRecoveryItems(items, documentsByItemId)
    const columns =
      travelTable.displayColumns.length > 0 ? travelTable.displayColumns : [...RECOVERY_INDEX_TABLE_COLUMNS]
    const exportRows = travelTable.rows.map((row) => this.serializeTravelRowForExcelExport(row))
    const priceColumnIndex = Math.max(columns.indexOf('Price'), 0) + 1
    const dateColumnIndexes = columns
      .map((column, index) =>
        ['Travel Start', 'Travel End', 'Date Requested'].includes(column) ? index + 1 : null
      )
      .filter((index): index is number => index !== null)

    const lastDataRow = exportRows.length > 0 ? 2 + exportRows.length : 2
    const totalRow = sheet.addRow([])
    totalRow.getCell(priceColumnIndex).value =
      exportRows.length > 0
        ? { formula: `SUM(${this.excelColumnLetter(priceColumnIndex)}3:${this.excelColumnLetter(priceColumnIndex)}${lastDataRow})` }
        : 0
    totalRow.getCell(priceColumnIndex).numFmt = '#,##0.00'

    const headerRow = sheet.addRow([...columns])
    headerRow.font = { bold: true }
    headerRow.eachCell((cell) => {
      cell.border = { bottom: { style: 'medium' } }
    })

    for (const row of exportRows) {
      const dataRow = sheet.addRow(columns.map((column) => this.excelValueForColumn(row, column)))

      dataRow.getCell(priceColumnIndex).numFmt = '#,##0.00'
      for (const columnIndex of dateColumnIndexes) {
        const cell = dataRow.getCell(columnIndex)
        if (typeof cell.value === 'number') {
          cell.numFmt = 'dd/mm/yyyy'
        }
      }
    }

    const start = options.startDate?.toFormat('yyyy-MM-dd') ?? DateTime.now().toFormat('yyyy-MM-dd')
    const end = options.endDate?.toFormat('yyyy-MM-dd') ?? start
    const fileName = `FNB_Recovery_Report_${start}_to_${end}.xlsx`
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer())

    return { buffer, fileName, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  }

  private static excelColumnLetter(columnIndex: number) {
    let letter = ''
    let index = columnIndex

    while (index > 0) {
      const remainder = (index - 1) % 26
      letter = String.fromCharCode(65 + remainder) + letter
      index = Math.floor((index - 1) / 26)
    }

    return letter
  }

  static async exportItemsToPdf(
    items: RecoveryReportItem[],
    options: { startDate?: DateTime | null; endDate?: DateTime | null } = {}
  ) {
    const { default: PDFDocument } = await import('pdfkit')

    await Promise.all(items.map((item) => (item.booking ? Promise.resolve() : item.load('booking'))))
    const documentsByItemId = await this.documentsContextByItemId(items)
    const travelTable = this.buildTravelItemsTableForRecoveryItems(items, documentsByItemId)

    const start = options.startDate?.toFormat('yyyy-MM-dd') ?? DateTime.now().toFormat('yyyy-MM-dd')
    const end = options.endDate?.toFormat('yyyy-MM-dd') ?? start
    const fileName = `FNB_Recovery_Report_${start}_to_${end}.pdf`

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0, autoFirstPage: true })
      const chunks: Buffer[] = []

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      RecoveryReportPdfService.renderTravelItemsTable(
        doc,
        travelTable.displayColumns.length ? travelTable.displayColumns : RECOVERY_INDEX_TABLE_COLUMNS,
        travelTable.rows,
        travelTable.totalPrice
      )

      doc.end()
    })

    return { buffer, fileName, mimeType: 'application/pdf' }
  }
}
