import Quotation from '#models/quotation'
import QuotationDocumentHtmlService from '#services/quotation_document_html_service'
import QuotationDocumentService from '#services/quotation_document_service'
import QuotationService from '#services/quotation_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import { portalQuotationStatusLabel } from '#types/booking_status'
import type { HttpContext } from '@adonisjs/core/http'

const PORTAL_QUOTATION_STATUSES = [
  'sent',
  'client_approved',
  'client_rejected',
  'approved',
  'rejected',
  'expired',
  'superseded',
] as const

function quotationStatusTone(status: string): 'warning' | 'info' | 'success' | 'danger' | 'default' {
  switch (status) {
    case 'client_approved':
    case 'approved':
      return 'success'
    case 'sent':
      return 'warning'
    case 'client_rejected':
    case 'rejected':
    case 'expired':
      return 'danger'
    default:
      return 'default'
  }
}

export default class PortalQuotationsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_quotations')) {
      return response.forbidden()
    }

    const filter = String(request.qs().status ?? 'all')
    const query = Quotation.query()
      .where('customer_id', account.customerId)
      .whereIn('status', [...PORTAL_QUOTATION_STATUSES])
      .preload('booking')
      .orderBy('created_at', 'desc')

    if (filter === 'pending') {
      query.where('status', 'sent')
    } else if (filter === 'approved') {
      query.whereIn('status', ['client_approved', 'approved'])
    }

    const quotations = await query

    return inertia.render('portal/quotations/index', {
      pageTitle: 'Quotations',
      pageDescription: 'Review quotations sent by DestinationZM',
      canApprove: PortalPrivilegeService.has(account, 'approve_quotations'),
      filters: { status: filter === 'pending' || filter === 'approved' ? filter : 'all' },
      quotations: quotations.map((quotation) => ({
        id: quotation.id,
        reference: quotation.reference,
        status: quotation.status,
        statusLabel: portalQuotationStatusLabel(quotation.status),
        statusTone: quotationStatusTone(quotation.status),
        totalAmount: quotation.totalAmount,
        currency: quotation.currency,
        validUntil: quotation.validUntil?.toFormat('dd LLL yyyy') ?? null,
        createdAt: quotation.createdAt.toFormat('dd LLL yyyy'),
        bookingReference: quotation.booking?.reference ?? null,
        enquiryReference: quotation.booking?.reference ?? null,
        needsApproval: quotation.status === 'sent',
      })),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_quotations')) {
      return response.forbidden()
    }

    const quotation = await Quotation.query()
      .where('id', params.id)
      .where('customer_id', account.customerId)
      .whereIn('status', [...PORTAL_QUOTATION_STATUSES])
      .preload('booking')
      .preload('customer')
      .preload('branch')
      .first()

    if (!quotation) {
      return response.notFound()
    }

    const document = QuotationDocumentService.buildForQuotation(quotation, { audience: 'portal' })
    const canApprove =
      quotation.status === 'sent' && PortalPrivilegeService.has(account, 'approve_quotations')

    return inertia.render('portal/quotations/show', {
      pageTitle: quotation.reference,
      pageDescription: 'Review and approve your quotation',
      quotationId: quotation.id,
      document,
      statusTone: quotationStatusTone(quotation.status),
      canApprove,
      bookingId: quotation.bookingId,
    })
  }

  async download({ auth, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_quotations')) {
      return response.forbidden()
    }

    const quotation = await Quotation.query()
      .where('id', params.id)
      .where('customer_id', account.customerId)
      .whereIn('status', [...PORTAL_QUOTATION_STATUSES])
      .preload('booking')
      .preload('customer')
      .preload('branch')
      .first()

    if (!quotation) {
      return response.notFound()
    }

    const document = QuotationDocumentService.buildForQuotation(quotation, { audience: 'portal' })
    const html = QuotationDocumentHtmlService.render(document)
    const fileName = `${quotation.reference}.html`

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(html)
  }

  async approve({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'approve_quotations')) {
      return response.forbidden()
    }

    const quotation = await Quotation.query()
      .where('id', params.id)
      .where('customer_id', account.customerId)
      .firstOrFail()

    if (quotation.status !== 'sent') {
      session.flash('error', 'This quotation cannot be approved.')
      return response.redirect().back()
    }

    await QuotationService.clientApprove(quotation, {
      clientAccountId: account.id,
      ipAddress: request.ip(),
    })

    session.flash('success', 'Quotation approved. Our team will confirm your enquiry and prepare your invoice.')
    return response.redirect().toRoute('portal.quotations.show', { id: quotation.id })
  }
}
