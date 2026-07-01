import { DateTime } from 'luxon'
import type Quotation from '#models/quotation'
import {
  portalQuotationStatusLabel,
  quotationStatusLabel,
} from '#types/booking_status'
import { isStructuredEnquiryData } from '#types/portal_enquiry_data'

export type QuotationDocumentLineItem = {
  quantity: number
  title: string
  description: string
  amount: number
}

export type EnquiryServiceSummary = {
  typeName: string
  destination: string
  dateRange: string | null
  pax: number | null
  details: Array<{ label: string; value: string }>
}

export type QuotationDocumentData = {
  reference: string
  issueDate: string
  validUntil: string | null
  statusLabel: string
  enquiryReference: string | null
  client: {
    company: string
    contactName: string | null
    email: string | null
    phone: string | null
  }
  lineItems: QuotationDocumentLineItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
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

function formatSummaryDateRange(departDate: string, returnDate: string | null) {
  const format = (iso: string) => {
    const parsed = DateTime.fromISO(iso)
    return parsed.isValid ? parsed.toFormat('dd LLL yyyy') : iso
  }

  if (!departDate) {
    return null
  }

  if (!returnDate || returnDate === departDate) {
    return format(departDate)
  }

  return `${format(departDate)} – ${format(returnDate)}`
}

export function parseNotesToEnquirySummaries(notes: string | null): EnquiryServiceSummary[] {
  if (!notes?.trim()) {
    return []
  }

  return notes
    .split(/\n\n+/)
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      let typeName = 'Service'
      const details: Array<{ label: string; value: string }> = []

      for (const line of lines) {
        if (line.startsWith('Enquiry type:')) {
          typeName = line.slice('Enquiry type:'.length).trim()
          continue
        }

        const colon = line.indexOf(':')
        if (colon === -1) {
          continue
        }

        details.push({
          label: line.slice(0, colon).trim(),
          value: line.slice(colon + 1).trim(),
        })
      }

      return {
        typeName,
        destination: '',
        dateRange: null,
        pax: null,
        details,
      }
    })
    .filter((summary) => summary.details.length > 0 || summary.typeName !== 'Service')
}

export function buildEnquirySummariesForQuotation(quotation: Quotation): EnquiryServiceSummary[] {
  const booking = quotation.booking

  if (booking && isStructuredEnquiryData(booking.enquiryData)) {
    return booking.enquiryData.items.map((item) => ({
      typeName: item.typeName,
      destination: item.destination,
      dateRange: formatSummaryDateRange(item.departDate, item.returnDate),
      pax: item.pax,
      details: item.summaryLines.filter(
        (line) => !line.label.toLowerCase().startsWith('enquiry type')
      ),
    }))
  }

  return parseNotesToEnquirySummaries(quotation.notes)
}

export function resolveEnquirySummaries(options: {
  quotation?: Quotation | null
  notes?: string | null
}): EnquiryServiceSummary[] {
  const fromQuotation = options.quotation
    ? buildEnquirySummariesForQuotation(options.quotation)
    : []

  if (fromQuotation.length > 0) {
    return fromQuotation
  }

  return parseNotesToEnquirySummaries(options.notes ?? null)
}

export default class QuotationDocumentService {
  static buildForQuotation(
    quotation: Quotation,
    options?: { audience?: 'admin' | 'portal' }
  ): QuotationDocumentData {
    const lineItems = quotation.lineItems?.items ?? []
    const audience = options?.audience ?? 'admin'
    const statusLabel =
      audience === 'portal'
        ? portalQuotationStatusLabel(quotation.status)
        : quotationStatusLabel(quotation.status)

    return {
      reference: quotation.reference,
      issueDate: quotation.createdAt.toFormat('dd LLL yyyy'),
      validUntil: quotation.validUntil?.toFormat('dd LLL yyyy') ?? null,
      statusLabel,
      enquiryReference: quotation.booking?.reference ?? null,
      client: {
        company: quotation.customer?.company ?? quotation.customer?.fullName ?? '—',
        contactName: quotation.customer?.fullName ?? null,
        email: quotation.customer?.email ?? null,
        phone: quotation.customer?.phone ?? null,
      },
      lineItems,
      subtotal: Number(quotation.subtotal ?? 0),
      taxAmount: Number(quotation.taxAmount ?? 0),
      totalAmount: Number(quotation.totalAmount ?? 0),
      currency: quotation.currency,
      itemCount: lineItems.length,
      notes: quotation.notes,
      enquirySummaries: buildEnquirySummariesForQuotation(quotation),
      footer: {
        companyName: 'DestinationZM',
        branchName: quotation.branch?.name ?? null,
        contactLine: 'info@destinationzm.com · +260 211 000 000',
      },
    }
  }
}
