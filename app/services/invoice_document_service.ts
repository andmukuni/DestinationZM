import type Invoice from '#models/invoice'
import type Quotation from '#models/quotation'
import {
  resolveEnquirySummaries,
  type EnquiryServiceSummary,
} from '#services/quotation_document_service'
import type { QuotationLineItem } from '#types/quotation_line_item'

export type InvoiceDocumentLineItem = QuotationLineItem

export type InvoiceDocumentData = {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  statusLabel: string
  bookingReference: string | null
  quotationReference: string | null
  client: {
    company: string
    contactName: string | null
    email: string | null
    phone: string | null
  }
  lineItems: InvoiceDocumentLineItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  currency: string
  itemCount: number
  notes: string | null
  enquirySummaries: EnquiryServiceSummary[]
  footer: {
    companyName: string
    branchName: string | null
    contactLine: string
  }
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  issued: 'Issued',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
}

const PORTAL_INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  issued: 'Payment due',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
}

function invoiceStatusLabel(status: string, audience: 'admin' | 'portal' = 'admin') {
  const labels = audience === 'portal' ? PORTAL_INVOICE_STATUS_LABELS : INVOICE_STATUS_LABELS
  return labels[status] ?? status
}

export default class InvoiceDocumentService {
  static async quotationForBooking(bookingId: number | null) {
    if (!bookingId) {
      return null
    }

    const Quotation = (await import('#models/quotation')).default

    const approved = await Quotation.query()
      .where('booking_id', bookingId)
      .whereIn('status', ['client_approved', 'approved'])
      .preload('booking')
      .orderBy('created_at', 'desc')
      .first()

    if (approved) {
      return approved
    }

    return Quotation.query()
      .where('booking_id', bookingId)
      .preload('booking')
      .orderBy('created_at', 'desc')
      .first()
  }

  static buildForInvoice(
    invoice: Invoice,
    quotation: Quotation | null,
    options?: { audience?: 'admin' | 'portal' }
  ): InvoiceDocumentData {
    const lineItems = quotation?.lineItems?.items ?? []
    const amountPaid = Number(invoice.amountPaid ?? 0)
    const totalAmount = Number(invoice.totalAmount ?? 0)
    const audience = options?.audience ?? 'admin'

    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate.toFormat('dd LLL yyyy'),
      dueDate: invoice.dueDate.toFormat('dd LLL yyyy'),
      statusLabel: invoiceStatusLabel(invoice.status, audience),
      bookingReference: invoice.booking?.reference ?? null,
      quotationReference: quotation?.reference ?? null,
      client: {
        company: invoice.customer?.company ?? invoice.customer?.fullName ?? '—',
        contactName: invoice.customer?.fullName ?? null,
        email: invoice.customer?.email ?? null,
        phone: invoice.customer?.phone ?? null,
      },
      lineItems,
      subtotal: Number(invoice.subtotal ?? 0),
      taxAmount: Number(invoice.taxAmount ?? 0),
      totalAmount,
      amountPaid,
      balanceDue: Math.max(totalAmount - amountPaid, 0),
      currency: invoice.currency,
      itemCount: lineItems.length,
      notes: invoice.notes,
      enquirySummaries: resolveEnquirySummaries({
        quotation,
        notes: invoice.notes,
      }),
      footer: {
        companyName: 'DestinationZM',
        branchName: invoice.branch?.name ?? null,
        contactLine: 'info@destinationzm.com · +260 211 000 000',
      },
    }
  }
}
