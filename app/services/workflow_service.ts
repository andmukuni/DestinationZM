import Booking from '#models/booking'
import Document from '#models/document'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import type { BookingStatus } from '#types/booking_status'
import { BOOKING_STATUS_LABELS } from '#types/booking_status'
import { RECOVERY_ITEM_STATUS_LABELS } from '#types/recovery_reporting'

export type WorkflowStepId =
  | 'enquiry'
  | 'quotation'
  | 'client_quotation'
  | 'booking_confirmed'
  | 'supplier_payment'
  | 'client_invoice'
  | 'recovery_report'
  | 'client_recovery'
  | 'recovered'
  | 'client_payment'
  | 'back_office'

export type WorkflowStep = {
  id: WorkflowStepId
  label: string
  actor: 'client' | 'admin' | 'system'
  status: 'pending' | 'active' | 'complete' | 'blocked'
  bookingStatus?: BookingStatus
  detail?: string
  href?: string
  action?: string
}

export default class WorkflowService {
  static readonly PORTAL_STEP_IDS: WorkflowStepId[] = [
    'enquiry',
    'client_quotation',
    'client_recovery',
    'client_payment',
  ]

  static async hasSupplierPayment(booking: Booking) {
    if (booking.dzPaymentStatus !== 'PAID') {
      return false
    }

    if (booking.invoiceReceiptNumber?.trim()) {
      return true
    }

    const supplierDocument = await Document.query()
      .where('reference_type', 'booking')
      .where('reference_id', booking.id)
      .where('document_type', 'supplier_document')
      .where('status', 'active')
      .first()

    return Boolean(supplierDocument)
  }

  static async stepsForBooking(
    booking: Booking,
    options: { audience?: 'admin' | 'portal' } = {}
  ): Promise<WorkflowStep[]> {
    const audience = options.audience ?? 'admin'
    await booking.load('customer')
    const quotation = await Quotation.query()
      .where('booking_id', booking.id)
      .orderBy('id', 'desc')
      .first()
    const recoveryItem = await RecoveryReportItem.findBy('booking_id', booking.id)
    const invoice = await Invoice.query()
      .where('booking_id', booking.id)
      .orderBy('id', 'desc')
      .first()

    const status = booking.status as BookingStatus
    const supplierPaid = await this.hasSupplierPayment(booking)
    const clientInvoiceIssued = Boolean(invoice && invoice.status !== 'draft')

    const stepStatus = (completeWhen: boolean, activeWhen: boolean): WorkflowStep['status'] => {
      if (completeWhen) return 'complete'
      if (activeWhen) return 'active'
      return 'pending'
    }

    const recoveryComplete = recoveryItem
      ? ['APPROVED_BY_CLIENT', 'RECOVERED'].includes(recoveryItem.recoveryStatus)
      : false
    const recoverySent = recoveryItem
      ? !['DRAFT', 'PENDING_INVOICE', 'READY_FOR_CLIENT', 'VOID'].includes(recoveryItem.recoveryStatus)
      : false

    const quotationApproved = ['quotation_approved', 'confirmed', 'invoiced', 'paid', 'closed'].includes(
      status
    )

    const steps: WorkflowStep[] = [
      {
        id: 'enquiry',
        label: 'Client enquiry',
        actor: 'client',
        status: stepStatus(true, status === 'enquiry_submitted'),
        bookingStatus: status,
        detail: BOOKING_STATUS_LABELS[status] ?? status,
      },
      {
        id: 'quotation',
        label: 'Admin quotation',
        actor: 'admin',
        status: stepStatus(
          ['quotation_sent', 'quotation_approved', 'confirmed', 'invoiced', 'paid', 'closed'].includes(status),
          ['quotation_preparing', 'enquiry_submitted'].includes(status)
        ),
        detail: quotation ? `${quotation.reference} (${quotation.status})` : 'No quotation yet',
        href: quotation ? `/quotations/${quotation.id}` : undefined,
        action: !quotation && ['enquiry_submitted', 'quotation_preparing'].includes(status)
          ? 'Create quotation'
          : quotation?.status === 'draft'
            ? 'Send quotation'
            : undefined,
      },
      {
        id: 'client_quotation',
        label: 'Client confirms quotation',
        actor: 'client',
        status: stepStatus(quotationApproved, quotation?.status === 'sent'),
        detail:
          quotation?.status === 'client_approved'
            ? 'Client approved'
            : (quotation?.status ?? 'Awaiting client approval'),
        href: quotation ? `/quotations/${quotation.id}` : undefined,
      },
      {
        id: 'booking_confirmed',
        label: 'Admin confirms enquiry',
        actor: 'admin',
        status: stepStatus(
          ['confirmed', 'invoiced', 'paid', 'closed'].includes(status),
          status === 'quotation_approved'
        ),
        detail: booking.confirmedAt
          ? `Confirmed ${booking.confirmedAt.toFormat('dd LLL yyyy')}`
          : 'Capture travel details after client approval',
        action: status === 'quotation_approved' ? 'Confirm enquiry' : undefined,
      },
      {
        id: 'supplier_payment',
        label: 'Admin pays supplier',
        actor: 'admin',
        status: stepStatus(
          supplierPaid,
          ['confirmed', 'invoiced', 'paid', 'closed'].includes(status) && !supplierPaid
        ),
        detail: supplierPaid
          ? `Paid ${booking.currency} ${Number(booking.amountPaidByDz ?? booking.totalAmount).toLocaleString('en-ZM')} to supplier`
          : 'Upload supplier invoice and record DZ payment',
        action: ['confirmed', 'invoiced', 'paid', 'closed'].includes(status) && !supplierPaid
          ? 'Record supplier payment'
          : undefined,
      },
      {
        id: 'client_invoice',
        label: 'Admin invoice to client',
        actor: 'admin',
        status: stepStatus(
          clientInvoiceIssued,
          supplierPaid && !clientInvoiceIssued
        ),
        detail: invoice
          ? `${invoice.invoiceNumber} (${invoice.status})`
          : 'Create and issue invoice to client',
        href: invoice ? `/invoices/${invoice.id}` : undefined,
        action: supplierPaid && !invoice
          ? 'Create client invoice'
          : invoice?.status === 'draft'
            ? 'Issue invoice'
            : undefined,
      },
      {
        id: 'recovery_report',
        label: 'Recovery report populated',
        actor: 'system',
        status: stepStatus(Boolean(recoveryItem), clientInvoiceIssued && !recoveryItem),
        detail: recoveryItem
          ? `${recoveryItem.recoveryReference} — quotation ${quotation?.reference ?? '—'} + client invoice ${invoice?.invoiceNumber ?? '—'}`
          : 'Auto-created when client invoice is issued',
        href: recoveryItem ? `/recovery-reports/items/${recoveryItem.id}` : undefined,
      },
      {
        id: 'client_recovery',
        label: 'Client recovery review',
        actor: 'client',
        status: stepStatus(recoveryComplete, recoverySent && !recoveryComplete),
        detail: recoveryItem
          ? RECOVERY_ITEM_STATUS_LABELS[recoveryItem.recoveryStatus]
          : 'Awaiting recovery report',
        href: recoveryItem
          ? audience === 'portal'
            ? `/portal/recovery-reports/${recoveryItem.id}`
            : `/recovery-reports/items/${recoveryItem.id}`
          : undefined,
      },
      {
        id: 'recovered',
        label: 'Recovered from client',
        actor: 'admin',
        status: stepStatus(
          recoveryItem?.recoveryStatus === 'RECOVERED',
          recoveryItem?.recoveryStatus === 'APPROVED_BY_CLIENT'
        ),
        detail:
          recoveryItem?.recoveryStatus === 'RECOVERED'
            ? 'Client reimbursed DestinationZM'
            : 'Awaiting client reimbursement',
      },
      {
        id: 'client_payment',
        label: 'Client pays invoice',
        actor: 'client',
        status: stepStatus(
          ['paid', 'closed'].includes(status),
          clientInvoiceIssued && !['paid', 'closed'].includes(status)
        ),
        detail: invoice?.status === 'paid' ? 'Paid in full' : (invoice?.status ?? 'Awaiting payment'),
        href: invoice ? `/invoices/${invoice.id}` : undefined,
      },
      {
        id: 'back_office',
        label: 'Back-office closed',
        actor: 'admin',
        status: stepStatus(status === 'closed', status === 'paid'),
        detail: 'Suppliers, documents, reports',
      },
    ]

    if (audience === 'portal') {
      return steps.filter((step) => this.PORTAL_STEP_IDS.includes(step.id))
    }

    return steps
  }

  static canCreateQuotation(status: BookingStatus) {
    return ['enquiry_submitted', 'quotation_preparing'].includes(status)
  }

  static readonly APPROVED_QUOTATION_STATUSES = ['client_approved', 'approved'] as const

  static isQuotationApproved(status: string) {
    return (this.APPROVED_QUOTATION_STATUSES as readonly string[]).includes(status)
  }

  static async canCreateInvoiceFromQuotation(quotation: Quotation) {
    if (!this.isQuotationApproved(quotation.status)) {
      return false
    }
    if (!quotation.bookingId) {
      return false
    }

    const existing = await Invoice.query().where('booking_id', quotation.bookingId).first()
    return !existing
  }

  static canSendQuotation(status: BookingStatus) {
    return ['quotation_preparing', 'enquiry_submitted'].includes(status)
  }

  static canConfirmBooking(status: BookingStatus) {
    return status === 'quotation_approved'
  }

  static canRecordSupplierPayment(status: BookingStatus) {
    return ['confirmed', 'invoiced', 'paid', 'closed'].includes(status)
  }

  static async canCreateInvoiceForBooking(bookingId: number) {
    const booking = await Booking.findOrFail(bookingId)
    if (!['confirmed', 'invoiced', 'paid', 'closed'].includes(booking.status)) {
      return false
    }

    return this.hasSupplierPayment(booking)
  }

  static canClientPay(invoiceStatus: string) {
    return ['issued', 'partially_paid', 'overdue'].includes(invoiceStatus)
  }
}
