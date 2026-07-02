import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Booking from '#models/booking'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import PaymentRecord from '#models/payment_record'
import Quotation from '#models/quotation'
import QuickbooksAccount from '#models/quickbooks_account'
import AuthorizationService from '#services/authorization_service'
import AuditService from '#services/audit_service'
import InvoiceDocumentHtmlService from '#services/invoice_document_html_service'
import InvoiceDocumentService from '#services/invoice_document_service'
import InvoiceService from '#services/invoice_service'
import QuickbooksSyncService from '#services/quickbooks/quickbooks_sync_service'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import WorkflowService from '#services/workflow_service'
import { invoiceStoreValidator } from '#validators/invoice_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewInvoices(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'invoices.view') ||
    AuthorizationService.can(user, 'invoices.manage')
  )
}

function invoiceStatusTone(status: string): 'warning' | 'info' | 'success' | 'danger' | 'default' {
  switch (status) {
    case 'paid':
      return 'success'
    case 'issued':
    case 'partially_paid':
      return 'info'
    case 'overdue':
    case 'void':
      return 'danger'
    case 'draft':
      return 'warning'
    default:
      return 'default'
  }
}

async function quotationForInvoice(bookingId: number | null) {
  return InvoiceDocumentService.quotationForBooking(bookingId)
}

async function nextPaymentReference(branchId: number) {
  const prefix = `PAY-${DateTime.now().toFormat('yyyyMMdd')}`
  const latest = await PaymentRecord.query()
    .where('branch_id', branchId)
    .where('reference', 'like', `${prefix}-%`)
    .orderBy('id', 'desc')
    .first()

  const sequence = latest ? Number(latest.reference.split('-').pop()) + 1 : 1
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

/** QBO only accepts Bank / Other Current Asset accounts as payment deposit targets. */
async function depositAccountOptions(realmId: string) {
  const accounts = await QuickbooksAccount.query()
    .where('realm_id', realmId)
    .where('active', true)
    .whereIn('account_type', ['Bank', 'Other Current Asset'])
    .orderBy('fully_qualified_name', 'asc')

  return accounts.map((account) => ({
    quickbooksId: account.quickbooksId,
    name: account.fullyQualifiedName ?? account.name,
    accountType: account.accountType,
  }))
}

function canMarkInvoicePaid(status: string) {
  return ['issued', 'partially_paid', 'overdue'].includes(status)
}

async function nextInvoiceNumber(branchId: number) {
  const prefix = `INV-${DateTime.now().toFormat('yyyyMM')}`
  const latest = await Invoice.query()
    .where('branch_id', branchId)
    .where('invoice_number', 'like', `${prefix}-%`)
    .orderBy('id', 'desc')
    .first()

  const sequence = latest ? Number(latest.invoiceNumber.split('-').pop()) + 1 : 1
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

export default class InvoicesController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewInvoices(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const statusFilter = request.qs().status ? String(request.qs().status) : null
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = Invoice.query()
      .preload('customer')
      .preload('branch')
      .orderBy('issue_date', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (statusFilter) {
      query.where('status', statusFilter)
    }

    if (search) {
      query.whereILike('invoice_number', `%${search}%`)
    }

    const invoices = await query
    const branches = userBranchId
      ? []
      : await Branch.query().orderBy('name', 'asc').select('id', 'name')

    const canManage = AuthorizationService.can(user, 'invoices.manage')
    const quickbooksConnected = Boolean(await QuickbooksOauthService.getActiveConnection())
    const syncSummaries = await QuickbooksSyncService.getInvoiceListSyncSummaries(invoices)

    return inertia.render('invoices/index', {
      filters: { search, status: statusFilter, branchId: branchId ?? null },
      branches: branches.map((b) => ({ id: b.id, name: b.name })),
      canManage,
      quickbooksConnected,
      invoices: invoices.map((inv) => {
        const sync = syncSummaries.get(inv.id)
        const canPost =
          canManage && QuickbooksSyncService.canPostInvoiceToQuickbooks(inv, quickbooksConnected)
        const canRetry =
          canManage && QuickbooksSyncService.canRetryInvoiceQuickbooksSync(inv, quickbooksConnected)

        return {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customer: inv.customer?.fullName ?? 'Unknown',
          status: inv.status,
          totalAmount: inv.totalAmount,
          amountPaid: inv.amountPaid,
          currency: inv.currency,
          issueDate: inv.issueDate.toFormat('dd LLL yyyy'),
          dueDate: inv.dueDate.toFormat('dd LLL yyyy'),
          branch: inv.branch?.name ?? '—',
          quickbooksStatus: sync?.quickbooksStatus ?? inv.quickbooksSyncStatus ?? null,
          quickbooksInvoiceId: sync?.quickbooksInvoiceId ?? inv.quickbooksInvoiceId ?? null,
          quickbooksPaymentStatus: sync?.quickbooksPaymentStatus ?? null,
          canPostToQuickbooks: canPost,
          canRetryQuickbooks: canRetry,
        }
      }),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewInvoices(user)) {
      return response.forbidden()
    }

    const invoice = await Invoice.query()
      .where('id', params.id)
      .preload('customer')
      .preload('branch')
      .preload('booking')
      .preload('receipts')
      .preload('paymentRecords')
      .firstOrFail()

    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && invoice.branchId !== userBranchId) {
      return response.forbidden()
    }

    const quotation = await quotationForInvoice(invoice.bookingId)
    const document = InvoiceDocumentService.buildForInvoice(invoice, quotation)
    const canManage = AuthorizationService.can(user, 'invoices.manage')
    const canIssue = canManage && invoice.status === 'draft'
    const balanceDue = Math.max(Number(invoice.totalAmount) - Number(invoice.amountPaid), 0)
    const canMarkPaid = canManage && canMarkInvoicePaid(invoice.status) && balanceDue > 0

    const connection = canMarkPaid ? await QuickbooksOauthService.getActiveConnection() : null
    const depositAccounts = connection ? await depositAccountOptions(connection.realmId) : []

    return inertia.render('invoices/show', {
      pageTitle: invoice.invoiceNumber,
      pageDescription: 'Invoice details',
      invoiceId: invoice.id,
      document,
      statusTone: invoiceStatusTone(invoice.status),
      canIssue,
      canMarkPaid,
      canManage,
      balanceDue,
      booking: invoice.booking
        ? { id: invoice.booking.id, reference: invoice.booking.reference }
        : null,
      quotation: quotation ? { id: quotation.id, reference: quotation.reference } : null,
      receipts: invoice.receipts.map((r) => ({
        id: r.id,
        receiptNumber: r.receiptNumber,
        amount: r.amount,
        receivedDate: r.receivedDate.toFormat('dd LLL yyyy'),
      })),
      payments: invoice.paymentRecords.map((p) => ({
        id: p.id,
        reference: p.reference,
        amount: p.amount,
        status: p.status,
      })),
      currency: invoice.currency,
      quickbooks: await QuickbooksSyncService.getInvoiceSyncSummary(invoice.id),
      depositAccounts,
    })
  }

  async retryQuickbooksSync({ auth, params, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    const invoice = await Invoice.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && invoice.branchId !== userBranchId) {
      return response.forbidden()
    }

    const quickbooksConnected = Boolean(await QuickbooksOauthService.getActiveConnection())
    if (!quickbooksConnected) {
      session.flash('error', 'QuickBooks is not connected.')
      return response.redirect().back()
    }

    if (invoice.status === 'draft' || invoice.status === 'void') {
      session.flash('error', 'Draft and void invoices cannot be synced to QuickBooks.')
      return response.redirect().back()
    }

    if (invoice.quickbooksSyncStatus === 'synced') {
      session.flash('error', 'This invoice is already synced to QuickBooks.')
      return response.redirect().back()
    }

    const canPost = QuickbooksSyncService.canPostInvoiceToQuickbooks(invoice, quickbooksConnected)
    const canRetry = QuickbooksSyncService.canRetryInvoiceQuickbooksSync(
      invoice,
      quickbooksConnected
    )
    if (!canPost && !canRetry && invoice.quickbooksSyncStatus !== 'pending') {
      session.flash('error', 'This invoice cannot be synced to QuickBooks right now.')
      return response.redirect().back()
    }

    try {
      await QuickbooksSyncService.retryInvoiceSync(invoice.id, { manual: true })
      await invoice.refresh()

      if (invoice.status === 'paid') {
        try {
          await QuickbooksSyncService.processPayment(invoice.id)
        } catch (paymentError) {
          const message =
            paymentError instanceof Error ? paymentError.message : 'QuickBooks payment sync failed.'
          session.flash('success', 'QuickBooks invoice sync completed, but payment sync failed.')
          session.flash('error', message)
          return response.redirect().back()
        }
      }

      session.flash('success', 'QuickBooks invoice sync completed.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'QuickBooks sync failed.'
      session.flash('error', message)
    }

    return response.redirect().back()
  }

  async download({ auth, params, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewInvoices(user)) {
      return response.forbidden()
    }

    const invoice = await Invoice.query()
      .where('id', params.id)
      .preload('customer')
      .preload('branch')
      .preload('booking')
      .firstOrFail()

    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && invoice.branchId !== userBranchId) {
      return response.forbidden()
    }

    const quotation = await quotationForInvoice(invoice.bookingId)
    const document = InvoiceDocumentService.buildForInvoice(invoice, quotation)
    const html = InvoiceDocumentHtmlService.render(document)
    const fileName = `${invoice.invoiceNumber}.html`

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(html)
  }

  async create({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const quotationId = request.qs().quotationId ? Number(request.qs().quotationId) : null
    let quotationDraft = null

    if (quotationId) {
      const quotationQuery = Quotation.query()
        .where('id', quotationId)
        .whereIn('status', ['client_approved', 'approved'])
        .preload('customer')
        .preload('branch')
        .preload('booking')

      if (branchId) {
        quotationQuery.where('branch_id', branchId)
      }

      const quotation = await quotationQuery.first()

      if (!quotation || !(await WorkflowService.canCreateInvoiceFromQuotation(quotation))) {
        return response.notFound()
      }

      quotationDraft = InvoiceService.buildDraftFromQuotation(quotation)
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

    return inertia.render('invoices/create', {
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      customers: customers.map((c) => ({ id: c.id, fullName: c.fullName })),
      bookings: bookings.map((b) => ({ id: b.id, reference: b.reference })),
      defaultBranchId: branchId,
      quotationDraft,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(invoiceStoreValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null

    if (!branchId) {
      session.flash('error', 'Office is required')
      return response.redirect().back()
    }

    if (payload.quotationId) {
      const quotationQuery = Quotation.query()
        .where('id', payload.quotationId)
        .whereIn('status', ['client_approved', 'approved'])
        .preload('booking')

      if (userBranchId) {
        quotationQuery.where('branch_id', userBranchId)
      }

      const quotation = await quotationQuery.first()

      if (!quotation || !(await WorkflowService.canCreateInvoiceFromQuotation(quotation))) {
        session.flash('error', 'Cannot create invoice for this quotation.')
        return response.redirect().back()
      }

      const issueDate = payload.issueDate ?? DateTime.now()
      const dueDate = payload.dueDate ?? issueDate.plus({ days: 30 })
      const subtotal = payload.subtotal ?? 0
      const taxAmount = payload.taxAmount ?? 0
      const totalAmount = payload.totalAmount ?? subtotal + taxAmount

      const invoice = await InvoiceService.createFromQuotationDraft(quotation, {
        subtotal,
        taxAmount,
        totalAmount,
        currency: payload.currency ?? quotation.currency,
        issueDate,
        dueDate,
        notes: payload.notes ?? null,
        userId: user.id,
        ipAddress: request.ip(),
      })

      session.flash('success', 'Draft invoice created from quotation.')
      return response.redirect().toRoute('invoices.show', { id: invoice.id })
    }

    const subtotal = payload.subtotal ?? 0
    const taxAmount = payload.taxAmount ?? 0
    const totalAmount = payload.totalAmount ?? subtotal + taxAmount
    const issueDate = payload.issueDate ?? DateTime.now()
    const dueDate = payload.dueDate ?? issueDate.plus({ days: 30 })

    const invoice = await Invoice.create({
      invoiceNumber: await nextInvoiceNumber(branchId),
      bookingId: payload.bookingId ?? null,
      customerId: payload.customerId,
      branchId,
      status: 'draft',
      subtotal,
      taxAmount,
      totalAmount,
      amountPaid: 0,
      currency: payload.currency ?? 'ZMW',
      issueDate,
      dueDate,
      notes: payload.notes ?? null,
      documentId: null,
    })

    await AuditService.log({
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: invoice.id,
      userId: user.id,
      ipAddress: request.ip(),
      metadata: { invoiceNumber: invoice.invoiceNumber },
    })

    if (invoice.bookingId) {
      await RecoveryReportingService.createOrPopulateFromInvoice(invoice, {
        userId: user.id,
        ipAddress: request.ip(),
      })
    }

    QuickbooksSyncService.enqueueInvoice(invoice.id)

    session.flash('success', 'Invoice created successfully')
    return response.redirect().toRoute('invoices.show', { id: invoice.id })
  }

  async issue({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    const invoice = await Invoice.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && invoice.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (invoice.status !== 'draft') {
      session.flash('error', 'Only draft invoices can be issued')
      return response.redirect().back()
    }

    await InvoiceService.issue(invoice, { userId: user.id, ipAddress: request.ip() })

    session.flash('success', 'Invoice issued successfully')
    return response.redirect().toRoute('invoices.show', { id: invoice.id })
  }

  async markPaid({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    const invoice = await Invoice.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && invoice.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!canMarkInvoicePaid(invoice.status)) {
      session.flash('error', 'This invoice cannot be marked as paid.')
      return response.redirect().back()
    }

    const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid)
    if (balance <= 0) {
      session.flash('error', 'This invoice has no outstanding balance.')
      return response.redirect().back()
    }

    const depositAccountId = String(request.input('depositAccountId') ?? '').trim()
    if (depositAccountId) {
      const connection = await QuickbooksOauthService.getActiveConnection()
      const account = connection
        ? await QuickbooksAccount.query()
            .where('realm_id', connection.realmId)
            .where('quickbooks_id', depositAccountId)
            .where('active', true)
            .first()
        : null

      if (!account) {
        session.flash('error', 'The selected deposit account is not a valid QuickBooks account.')
        return response.redirect().back()
      }

      invoice.quickbooksDepositAccountId = account.quickbooksId
      invoice.quickbooksDepositAccountName = account.fullyQualifiedName ?? account.name
      await invoice.save()
    }

    const paymentReference = await nextPaymentReference(invoice.branchId)

    await InvoiceService.recordClientPayment(invoice, balance, {
      paymentMethod: 'manual',
      reference: paymentReference,
      userId: user.id,
    })

    await PaymentRecord.create({
      reference: paymentReference,
      invoiceId: invoice.id,
      receiptId: null,
      customerId: invoice.customerId,
      branchId: invoice.branchId,
      amount: balance,
      currency: invoice.currency,
      paymentMethod: 'manual',
      paymentReference: null,
      paymentDate: DateTime.now(),
      status: 'completed',
      notes: 'Marked paid by admin',
      documentId: null,
      recordedById: user.id,
    })

    await AuditService.log({
      action: 'invoice.marked_paid',
      entityType: 'invoice',
      entityId: invoice.id,
      userId: user.id,
      ipAddress: request.ip(),
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        amount: balance,
        depositAccountId: invoice.quickbooksDepositAccountId,
      },
    })

    session.flash('success', 'Invoice marked as paid.')
    return response.redirect().toRoute('invoices.show', { id: invoice.id })
  }

  async createFromBooking({ auth, params, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    const booking = await Booking.findOrFail(params.id)
    const userBranchId = AuthorizationService.branchIdFor(user)
    if (userBranchId && booking.branchId !== userBranchId) {
      return response.forbidden()
    }

    if (!(await WorkflowService.canCreateInvoiceForBooking(booking.id))) {
      session.flash('error', 'Record supplier payment before creating the client invoice.')
      return response.redirect().back()
    }

    const existing = await Invoice.query().where('booking_id', booking.id).first()
    if (existing) {
      session.flash('error', 'An invoice already exists for this enquiry.')
      return response.redirect().toRoute('invoices.show', { id: existing.id })
    }

    const invoice = await InvoiceService.createDraftFromBooking(booking, {
      userId: user.id,
      ipAddress: request.ip(),
    })

    session.flash('success', 'Draft client invoice created.')
    return response.redirect().toRoute('invoices.show', { id: invoice.id })
  }
}
