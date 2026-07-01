import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import Receipt from '#models/receipt'
import AuthorizationService from '#services/authorization_service'
import AuditService from '#services/audit_service'
import InvoiceService from '#services/invoice_service'
import { receiptStoreValidator } from '#validators/receipt_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewReceipts(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'receipts.view') ||
    AuthorizationService.can(user, 'receipts.manage')
  )
}

async function nextReceiptNumber(branchId: number) {
  const prefix = `RCP-${DateTime.now().toFormat('yyyyMM')}`
  const latest = await Receipt.query()
    .where('branch_id', branchId)
    .where('receipt_number', 'like', `${prefix}-%`)
    .orderBy('id', 'desc')
    .first()

  const sequence = latest ? Number(latest.receiptNumber.split('-').pop()) + 1 : 1
  return `${prefix}-${String(sequence).padStart(4, '0')}`
}

export default class ReceiptsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewReceipts(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = Receipt.query()
      .preload('customer')
      .preload('invoice')
      .orderBy('received_date', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (search) {
      query.whereILike('receipt_number', `%${search}%`)
    }

    const receipts = await query

    return inertia.render('receipts/index', {
      filters: { search, branchId: branchId ?? null },
      receipts: receipts.map((r) => ({
        id: r.id,
        receiptNumber: r.receiptNumber,
        customer: r.customer?.fullName ?? 'Unknown',
        invoiceId: r.invoiceId,
        invoiceNumber: r.invoice?.invoiceNumber ?? '—',
        amount: r.amount,
        currency: r.currency,
        paymentMethod: r.paymentMethod,
        receivedDate: r.receivedDate.toFormat('dd LLL yyyy'),
      })),
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'receipts.manage')) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const invoiceQuery = Invoice.query()
      .preload('customer')
      .whereIn('status', ['issued', 'partially_paid', 'overdue'])
      .orderBy('due_date', 'asc')

    if (branchId) {
      invoiceQuery.where('branch_id', branchId)
    }

    const invoices = await invoiceQuery

    return inertia.render('receipts/create', {
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.fullName ?? 'Unknown',
        totalAmount: inv.totalAmount,
        amountPaid: inv.amountPaid,
        currency: inv.currency,
      })),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'receipts.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(receiptStoreValidator)
    const invoice = await Invoice.findOrFail(payload.invoiceId)
    const userBranchId = AuthorizationService.branchIdFor(user)

    if (userBranchId && invoice.branchId !== userBranchId) {
      return response.forbidden()
    }

    const receivedDate = payload.receivedDate ?? DateTime.now()

    const receipt = await Receipt.create({
      receiptNumber: await nextReceiptNumber(invoice.branchId),
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      branchId: invoice.branchId,
      amount: payload.amount,
      currency: payload.currency ?? invoice.currency,
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference ?? null,
      receivedDate,
      notes: payload.notes ?? null,
      documentId: null,
      recordedById: user.id,
    })

    invoice.amountPaid = Number(invoice.amountPaid) + payload.amount
    await invoice.save()
    await InvoiceService.updatePaymentStatus(invoice)

    await AuditService.log({
      action: 'receipt.created',
      entityType: 'receipt',
      entityId: receipt.id,
      userId: user.id,
      ipAddress: request.ip(),
      metadata: { receiptNumber: receipt.receiptNumber, invoiceId: invoice.id },
    })

    session.flash('success', 'Receipt recorded successfully')
    return response.redirect().toRoute('receipts')
  }
}
