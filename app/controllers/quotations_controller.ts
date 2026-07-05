import Branch from '#models/branch'
import Customer from '#models/customer'
import Booking from '#models/booking'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import AuthorizationService from '#services/authorization_service'
import QuotationDocumentHtmlService from '#services/quotation_document_html_service'
import QuotationDocumentService from '#services/quotation_document_service'
import QuotationService from '#services/quotation_service'
import WorkflowService from '#services/workflow_service'
import { quotationStatusLabel } from '#types/booking_status'
import type { HttpContext } from '@adonisjs/core/http'
import { quotationStoreValidator, quotationUpdateValidator } from '#validators/quotation_validator'

function canManageQuotations(user: Parameters<typeof AuthorizationService.can>[0]) {
  return AuthorizationService.can(user, 'quotations.manage')
}

function canViewQuotations(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    canManageQuotations(user) ||
    AuthorizationService.can(user, 'quotations.view') ||
    AuthorizationService.can(user, 'quotations.approve')
  )
}

function quotationStatusTone(status: string): 'warning' | 'info' | 'success' | 'danger' | 'default' {
  switch (status) {
    case 'client_approved':
    case 'approved':
      return 'success'
    case 'sent':
      return 'info'
    case 'client_rejected':
    case 'rejected':
    case 'expired':
      return 'danger'
    default:
      return 'warning'
  }
}

function enquiryHrefForBooking(booking: { id: number; status: string }) {
  if (['enquiry_submitted', 'quotation_preparing'].includes(booking.status)) {
    return `/enquiries/${booking.id}`
  }
  return `/bookings/${booking.id}`
}

export default class QuotationsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewQuotations(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const pendingOnly = request.qs().pending === '1'
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = QuotationService.list(branchId ?? undefined)

    if (search) {
      query.whereILike('reference', `%${search}%`)
    }

    if (pendingOnly) {
      query.whereIn('status', ['draft', 'sent'])
    }

    const quotations = await query

    const branches = userBranchId
      ? []
      : await Branch.query().orderBy('name', 'asc').select('id', 'name')

    return inertia.render('quotations/index', {
      filters: { search, branchId: branchId ?? null, pending: pendingOnly },
      branches: branches.map((b) => ({ id: b.id, name: b.name })),
      quotations: quotations.map((q) => ({
        id: q.id,
        reference: q.reference,
        customer: q.customer?.fullName ?? 'Unknown',
        bookingReference: q.booking?.reference ?? null,
        status: q.status,
        statusLabel: quotationStatusLabel(q.status),
        totalAmount: q.totalAmount,
        currency: q.currency,
        validUntil: q.validUntil?.toFormat('dd LLL yyyy') ?? null,
        createdAt: q.createdAt.toFormat('dd LLL yyyy'),
      })),
    })
  }

  async create({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManageQuotations(user)) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const bookingId = request.qs().bookingId ? Number(request.qs().bookingId) : null
    let enquiryDraft = null

    if (bookingId) {
      const bookingQuery = Booking.query()
        .where('id', bookingId)
        .whereIn('status', ['enquiry_submitted', 'quotation_preparing'])
        .preload('customer')
        .preload('branch')

      if (branchId) {
        bookingQuery.where('branch_id', branchId)
      }

      const booking = await bookingQuery.first()

      if (!booking || !WorkflowService.canCreateQuotation(booking.status as never)) {
        return response.notFound()
      }

      enquiryDraft = await QuotationService.buildDraftFromEnquiry(booking)
    }

    const branches = await Branch.query().orderBy('name', 'asc')
    const scopedBranches = branchId ? branches.filter((b) => b.id === branchId) : branches

    const customerQuery = Customer.query().orderBy('full_name', 'asc')
    if (branchId) {
      customerQuery.where('branch_id', branchId)
    }
    const customers = await customerQuery

    const bookingQuery = Booking.query().orderBy('created_at', 'desc')
    if (branchId) {
      bookingQuery.where('branch_id', branchId)
    }
    const bookings = await bookingQuery

    return inertia.render('quotations/create', {
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      customers: customers.map((c) => ({ id: c.id, fullName: c.fullName })),
      bookings: bookings.map((b) => ({ id: b.id, reference: b.reference })),
      defaultBranchId: branchId,
      enquiryDraft,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManageQuotations(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(quotationStoreValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null
    const lineItems =
      payload.lineItems?.map((item) => ({
        quantity: item.quantity,
        title: item.title,
        description: item.description ?? '',
        amount: item.amount,
      })) ?? undefined

    if (!branchId) {
      session.flash('error', 'Office is required')
      return response.redirect().back()
    }

    if (payload.bookingId && lineItems?.length) {
      const booking = await Booking.find(payload.bookingId)
      if (!booking) {
        session.flash('error', 'Linked enquiry not found.')
        return response.redirect().back()
      }
      if (userBranchId && booking.branchId !== userBranchId) {
        return response.forbidden()
      }
      if (!WorkflowService.canCreateQuotation(booking.status as never)) {
        session.flash('error', 'Cannot create quotation for this enquiry status.')
        return response.redirect().back()
      }

      const quotation = await QuotationService.createFromEnquiryDraft(booking, {
        createdById: user.id,
        userId: user.id,
        ipAddress: request.ip(),
        subtotal: payload.subtotal ?? 0,
        taxAmount: payload.taxAmount ?? 0,
        totalAmount: payload.totalAmount ?? 0,
        currency: payload.currency ?? 'ZMW',
        validUntil: payload.validUntil ?? null,
        notes: payload.notes ?? null,
        lineItems,
      })

      session.flash('success', 'Draft quotation created from enquiry.')
      return response.redirect().toRoute('quotations.show', { id: quotation.id })
    }

    const quotation = await QuotationService.create({
      customerId: payload.customerId,
      branchId,
      createdById: user.id,
      bookingId: payload.bookingId ?? null,
      subtotal: payload.subtotal,
      taxAmount: payload.taxAmount,
      totalAmount: payload.totalAmount,
      currency: payload.currency,
      validUntil: payload.validUntil ?? null,
      notes: payload.notes ?? null,
      lineItems,
      userId: user.id,
      ipAddress: request.ip(),
    })

    session.flash('success', 'Quotation created successfully')
    return response.redirect().toRoute('quotations.show', { id: quotation.id })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewQuotations(user)) {
      return response.forbidden()
    }

    const quotation = await QuotationService.find(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && quotation.branchId !== userBranchId) {
      return response.forbidden()
    }

    const document = QuotationDocumentService.buildForQuotation(quotation)
    const canSend =
      AuthorizationService.can(user, 'quotations.manage') && quotation.status === 'draft'
    const canEdit =
      AuthorizationService.can(user, 'quotations.manage') &&
      QuotationService.isEditable(quotation.status)

    const existingInvoice = quotation.bookingId
      ? await Invoice.query().where('booking_id', quotation.bookingId).first()
      : null

    const canCreateInvoice =
      AuthorizationService.can(user, 'invoices.manage') &&
      (await WorkflowService.canCreateInvoiceFromQuotation(quotation))

    const canViewInvoices =
      AuthorizationService.can(user, 'invoices.view') ||
      AuthorizationService.can(user, 'invoices.manage')

    return inertia.render('quotations/show', {
      pageTitle: quotation.reference,
      pageDescription: 'Quotation details',
      quotationId: quotation.id,
      document,
      statusTone: quotationStatusTone(quotation.status),
      canSend,
      canEdit,
      canCreateInvoice,
      createInvoiceHref: `/invoices/create?quotationId=${quotation.id}`,
      enquiry: quotation.booking
        ? {
            id: quotation.booking.id,
            reference: quotation.booking.reference,
            href: enquiryHrefForBooking({
              id: quotation.booking.id,
              status: quotation.booking.status,
            }),
          }
        : null,
      invoice: existingInvoice
        ? {
            id: existingInvoice.id,
            invoiceNumber: existingInvoice.invoiceNumber,
            canView: canViewInvoices,
          }
        : null,
    })
  }

  async edit({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManageQuotations(user)) {
      return response.forbidden()
    }

    const quotation = await QuotationService.find(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && quotation.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!QuotationService.isEditable(quotation.status)) {
      return response.redirect().toRoute('quotations.show', { id: quotation.id })
    }

    return inertia.render('quotations/edit', {
      pageTitle: `Edit ${quotation.reference}`,
      pageDescription: 'Update quotation line items and totals',
      editDraft: QuotationService.buildEditDraft(quotation),
    })
  }

  async update({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canManageQuotations(user)) {
      return response.forbidden()
    }

    const quotation = await Quotation.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && quotation.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!QuotationService.isEditable(quotation.status)) {
      session.flash('error', 'This quotation can no longer be edited.')
      return response.redirect().toRoute('quotations.show', { id: quotation.id })
    }

    const payload = await request.validateUsing(quotationUpdateValidator)
    const lineItems =
      payload.lineItems?.map((item) => ({
        quantity: item.quantity,
        title: item.title,
        description: item.description ?? '',
        amount: item.amount,
      })) ?? undefined

    await QuotationService.update(
      quotation,
      {
        subtotal: payload.subtotal ?? 0,
        taxAmount: payload.taxAmount ?? 0,
        totalAmount: payload.totalAmount ?? 0,
        currency: payload.currency?.toUpperCase() ?? quotation.currency,
        validUntil: payload.validUntil ?? null,
        notes: payload.notes ?? null,
        lineItems,
      },
      { userId: user.id, ipAddress: request.ip() }
    )

    session.flash('success', 'Quotation updated.')
    return response.redirect().toRoute('quotations.show', { id: quotation.id })
  }

  async download({ auth, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewQuotations(user)) {
      return response.forbidden()
    }

    const quotation = await QuotationService.find(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && quotation.branchId !== userBranchId) {
      return response.forbidden()
    }

    const document = QuotationDocumentService.buildForQuotation(quotation)
    const html = QuotationDocumentHtmlService.render(document)
    const fileName = `${quotation.reference}.html`

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(html)
  }

  async storeFromBooking({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'quotations.manage')) {
      return response.forbidden()
    }

    const booking = await Booking.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && booking.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!WorkflowService.canCreateQuotation(booking.status as never)) {
      session.flash('error', 'Cannot create quotation for this enquiry status.')
      return response.redirect().back()
    }

    const quotation = await QuotationService.createFromBooking(booking, {
      createdById: user.id,
      userId: user.id,
      ipAddress: request.ip(),
    })

    session.flash('success', 'Draft quotation created from enquiry.')
    return response.redirect().toRoute('quotations.show', { id: quotation.id })
  }

  async send({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'quotations.manage')) {
      return response.forbidden()
    }

    const quotation = await Quotation.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && quotation.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (quotation.status !== 'draft') {
      session.flash('error', 'Only draft quotations can be sent.')
      return response.redirect().back()
    }

    await QuotationService.send(quotation, { userId: user.id, ipAddress: request.ip() })

    session.flash('success', 'Quotation sent to client.')
    return response.redirect().toRoute('quotations.show', { id: quotation.id })
  }

  async approve({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'quotations.approve')) {
      return response.forbidden()
    }

    const quotation = await Quotation.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && quotation.branchId !== userBranchId) {
      return response.forbidden()
    }

    await QuotationService.approve(quotation, { userId: user.id, ipAddress: request.ip() })

    session.flash('success', 'Quotation approved successfully')
    return response.redirect().toRoute('quotations.show', { id: quotation.id })
  }
}
