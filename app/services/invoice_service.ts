import { DateTime } from 'luxon'
import Booking from '#models/booking'
import Invoice from '#models/invoice'
import type Quotation from '#models/quotation'
import AuditService from '#services/audit_service'
import DocumentService from '#services/document_service'
import NotificationMailService from '#services/notification_mail_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import QuickbooksSyncService from '#services/quickbooks/quickbooks_sync_service'
import type { QuotationLineItem } from '#types/quotation_line_item'

type CreateFromBookingOptions = {
  dueDate?: DateTime
  taxAmount?: number
  notes?: string | null
  userId?: number | null
  ipAddress?: string | null
}

export type InvoiceDraftFromQuotation = {
  quotationId: number
  quotationReference: string
  customerId: number
  customerName: string
  bookingId: number
  bookingReference: string
  branchId: number
  branchName: string
  currency: string
  notes: string | null
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  lineItems: QuotationLineItem[]
}

export default class InvoiceService {
  private static afterInvoiceCreated(invoice: Invoice) {
    QuickbooksSyncService.enqueueInvoice(invoice.id)
  }

  private static afterPaymentApplied(invoice: Invoice) {
    if (invoice.status === 'paid') {
      QuickbooksSyncService.enqueuePayment(invoice.id)
    }
  }

  private static async nextInvoiceNumber(branchId: number) {
    const prefix = `INV-${DateTime.now().toFormat('yyyyMM')}`
    const latest = await Invoice.query()
      .where('branch_id', branchId)
      .where('invoice_number', 'like', `${prefix}-%`)
      .orderBy('id', 'desc')
      .first()

    const sequence = latest ? Number(latest.invoiceNumber.split('-').pop()) + 1 : 1
    return `${prefix}-${String(sequence).padStart(4, '0')}`
  }

  static async issue(invoice: Invoice, options?: { userId?: number | null; ipAddress?: string | null }) {
    await invoice.load('booking', (q) => q.preload('customer'))
    await invoice.load('customer')

    invoice.status = 'issued'
    await invoice.save()

    const invoiceText = [
      'DestinationZM — Tax Invoice',
      `Invoice: ${invoice.invoiceNumber}`,
      `Customer: ${invoice.customer?.fullName ?? invoice.booking?.customer?.fullName ?? 'N/A'}`,
      `Total: ${invoice.currency} ${invoice.totalAmount}`,
      `Due: ${invoice.dueDate.toFormat('dd LLL yyyy')}`,
    ].join('\n')

    const document = await DocumentService.store({
      documentType: 'invoice',
      title: `Invoice — ${invoice.invoiceNumber}`,
      fileName: `${invoice.invoiceNumber}.txt`,
      contents: Buffer.from(invoiceText, 'utf-8'),
      mimeType: 'text/plain',
      referenceType: 'invoice',
      referenceId: invoice.id,
      uploadedById: options?.userId ?? null,
      branchId: invoice.branchId,
    })

    invoice.documentId = document.id
    await invoice.save()

    if (invoice.booking) {
      invoice.booking.status = 'invoiced'
      await invoice.booking.save()
    }

    const email = invoice.customer?.email ?? invoice.booking?.customer?.email
    if (email) {
      await NotificationMailService.invoiceIssuedToClient({
        customerEmail: email,
        customerName: invoice.customer?.fullName ?? 'Client',
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        dueDate: invoice.dueDate.toFormat('dd LLL yyyy'),
      })
    }

    await AuditService.log({
      action: 'invoice.issued',
      entityType: 'invoice',
      entityId: invoice.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
    })

    await RecoveryReportingService.createOrPopulateFromIssuedInvoice(invoice, {
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
    })

    this.afterInvoiceCreated(invoice)

    return invoice
  }

  static buildDraftFromQuotation(quotation: Quotation): InvoiceDraftFromQuotation {
    const lineItems = quotation.lineItems?.items ?? []
    const issueDate = DateTime.now()
    const dueDate = issueDate.plus({ days: 30 })

    return {
      quotationId: quotation.id,
      quotationReference: quotation.reference,
      customerId: quotation.customerId,
      customerName: quotation.customer?.fullName ?? '—',
      bookingId: quotation.bookingId!,
      bookingReference: quotation.booking?.reference ?? '—',
      branchId: quotation.branchId,
      branchName: quotation.branch?.name ?? '—',
      currency: quotation.currency,
      notes: quotation.notes,
      issueDate: issueDate.toISODate() ?? '',
      dueDate: dueDate.toISODate() ?? '',
      subtotal: Number(quotation.subtotal ?? 0),
      taxAmount: Number(quotation.taxAmount ?? 0),
      totalAmount: Number(quotation.totalAmount ?? 0),
      lineItems: lineItems.map((item) => ({
        quantity: item.quantity,
        title: item.title,
        description: item.description,
        amount: item.amount,
      })),
    }
  }

  static async createFromQuotationDraft(
    quotation: Quotation,
    input: {
      subtotal: number
      taxAmount: number
      totalAmount: number
      currency: string
      issueDate: DateTime
      dueDate: DateTime
      notes?: string | null
      userId?: number | null
      ipAddress?: string | null
    }
  ) {
    const invoice = await Invoice.create({
      invoiceNumber: await this.nextInvoiceNumber(quotation.branchId),
      bookingId: quotation.bookingId,
      customerId: quotation.customerId,
      branchId: quotation.branchId,
      status: 'draft',
      subtotal: input.subtotal,
      taxAmount: input.taxAmount,
      totalAmount: input.totalAmount,
      amountPaid: 0,
      currency: input.currency,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      notes: input.notes ?? null,
      documentId: null,
    })

    await AuditService.log({
      action: 'invoice.created_from_quotation',
      entityType: 'invoice',
      entityId: invoice.id,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        quotationId: quotation.id,
        quotationReference: quotation.reference,
        bookingId: quotation.bookingId,
      },
    })

    await RecoveryReportingService.createOrPopulateFromInvoice(
      invoice,
      {
        userId: input.userId ?? null,
        ipAddress: input.ipAddress ?? null,
      },
      { quotation, autoSendToClient: false }
    )

    this.afterInvoiceCreated(invoice)

    return invoice
  }

  static async createDraftFromBooking(booking: Booking, options: CreateFromBookingOptions = {}) {
    await booking.load('customer')

    const subtotal = booking.totalAmount
    const taxAmount = options.taxAmount ?? 0
    const totalAmount = subtotal + taxAmount
    const issueDate = DateTime.now()
    const dueDate = options.dueDate ?? issueDate.plus({ days: 30 })

    const invoice = await Invoice.create({
      invoiceNumber: await this.nextInvoiceNumber(booking.branchId),
      bookingId: booking.id,
      customerId: booking.customerId,
      branchId: booking.branchId,
      status: 'draft',
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      currency: booking.currency,
      issueDate,
      dueDate,
      notes: options.notes ?? null,
      documentId: null,
    })

    await AuditService.log({
      action: 'invoice.created_from_booking',
      entityType: 'invoice',
      entityId: invoice.id,
      userId: options?.userId ?? null,
      ipAddress: options?.ipAddress ?? null,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        bookingId: booking.id,
      },
    })

    this.afterInvoiceCreated(invoice)

    return invoice
  }

  static async recordClientPayment(
    invoice: Invoice,
    amount: number,
    options?: { paymentMethod?: string; reference?: string; userId?: number | null }
  ) {
    await invoice.load('booking', (q) => q.preload('customer'))
    await invoice.load('customer')

    invoice.amountPaid = Number(invoice.amountPaid) + amount
    await this.updatePaymentStatus(invoice)

    if (invoice.status === 'paid' && invoice.booking) {
      invoice.booking.status = 'paid'
      await invoice.booking.save()
    }

    const email = invoice.customer?.email
    if (email && invoice.status === 'paid') {
      await NotificationMailService.paymentReceived({
        customerEmail: email,
        customerName: invoice.customer?.fullName ?? 'Client',
        invoiceNumber: invoice.invoiceNumber,
        amount,
        currency: invoice.currency,
      })
    }

    return invoice
  }

  static async createFromBooking(booking: Booking, options: CreateFromBookingOptions = {}) {
    await booking.load('customer')

    const subtotal = booking.totalAmount
    const taxAmount = options.taxAmount ?? 0
    const totalAmount = subtotal + taxAmount
    const issueDate = DateTime.now()
    const dueDate = options.dueDate ?? issueDate.plus({ days: 30 })

    const invoice = await Invoice.create({
      invoiceNumber: await this.nextInvoiceNumber(booking.branchId),
      bookingId: booking.id,
      customerId: booking.customerId,
      branchId: booking.branchId,
      status: 'issued',
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      currency: booking.currency,
      issueDate,
      dueDate,
      notes: options.notes ?? null,
      documentId: null,
    })

    booking.status = 'invoiced'
    await booking.save()

    await AuditService.log({
      action: 'invoice.created_from_booking',
      entityType: 'invoice',
      entityId: invoice.id,
      userId: options.userId ?? null,
      ipAddress: options.ipAddress ?? null,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        bookingId: booking.id,
      },
    })

    this.afterInvoiceCreated(invoice)

    return invoice
  }

  static async updatePaymentStatus(invoice: Invoice) {
    if (invoice.status === 'void') {
      return invoice
    }

    if (invoice.amountPaid <= 0) {
      invoice.status = invoice.dueDate < DateTime.now().startOf('day') ? 'overdue' : 'issued'
    } else if (invoice.amountPaid >= invoice.totalAmount) {
      invoice.status = 'paid'
    } else {
      invoice.status = 'partially_paid'
    }

    await invoice.save()

    this.afterPaymentApplied(invoice)

    return invoice
  }

  static async markOverdue(invoice: Invoice) {
    if (invoice.status === 'paid' || invoice.status === 'void') {
      return invoice
    }

    invoice.status = 'overdue'
    await invoice.save()
    return invoice
  }

  static async markOverdueBatch() {
    const today = DateTime.now().startOf('day')
    const overdueInvoices = await Invoice.query()
      .whereIn('status', ['issued', 'partially_paid'])
      .where('due_date', '<', today.toSQLDate()!)

    for (const invoice of overdueInvoices) {
      await this.markOverdue(invoice)
    }

    return overdueInvoices.length
  }
}
