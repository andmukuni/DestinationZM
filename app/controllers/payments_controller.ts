import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import PaymentRecord from '#models/payment_record'
import AuthorizationService from '#services/authorization_service'
import AuditService from '#services/audit_service'
import InvoiceService from '#services/invoice_service'
import { paymentStoreValidator } from '#validators/payment_validator'
import type { HttpContext } from '@adonisjs/core/http'

function canViewPayments(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'payments.view') ||
    AuthorizationService.can(user, 'payments.manage')
  )
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

export default class PaymentsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!canViewPayments(user)) {
      return response.forbidden()
    }

    const search = String(request.qs().search ?? '').trim()
    const userBranchId = AuthorizationService.branchIdFor(user)
    const filterBranchId = request.qs().branchId ? Number(request.qs().branchId) : null
    const branchId = userBranchId ?? filterBranchId ?? null

    const query = PaymentRecord.query()
      .preload('customer')
      .preload('invoice')
      .orderBy('payment_date', 'desc')

    if (userBranchId) {
      query.where('branch_id', userBranchId)
    } else if (branchId) {
      query.where('branch_id', branchId)
    }

    if (search) {
      query.whereILike('reference', `%${search}%`)
    }

    const payments = await query

    return inertia.render('payments/index', {
      filters: { search, branchId: branchId ?? null },
      payments: payments.map((p) => ({
        id: p.id,
        reference: p.reference,
        customer: p.customer?.fullName ?? 'Unknown',
        invoiceId: p.invoiceId,
        invoiceNumber: p.invoice?.invoiceNumber ?? '—',
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate.toFormat('dd LLL yyyy'),
        status: p.status,
      })),
    })
  }

  async create({ auth, inertia, response }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'payments.manage')) {
      return response.forbidden()
    }

    const branchId = AuthorizationService.branchIdFor(user)
    const branches = await Branch.query().orderBy('name', 'asc')
    const scopedBranches = branchId ? branches.filter((b) => b.id === branchId) : branches

    const customerQuery = Customer.query().orderBy('full_name', 'asc')
    if (branchId) {
      customerQuery.where('branch_id', branchId)
    }
    const customers = await customerQuery

    const invoiceQuery = Invoice.query()
      .preload('customer')
      .whereIn('status', ['issued', 'partially_paid', 'overdue'])
      .orderBy('due_date', 'asc')

    if (branchId) {
      invoiceQuery.where('branch_id', branchId)
    }
    const invoices = await invoiceQuery

    return inertia.render('payments/create', {
      branches: scopedBranches.map((b) => ({ id: b.id, name: b.name })),
      customers: customers.map((c) => ({ id: c.id, fullName: c.fullName })),
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer?.fullName ?? 'Unknown',
      })),
      defaultBranchId: branchId,
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    const user = auth.use("web").getUserOrFail()
    if (!AuthorizationService.can(user, 'payments.manage')) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(paymentStoreValidator)
    const userBranchId = AuthorizationService.branchIdFor(user)
    const branchId = userBranchId ?? payload.branchId ?? null

    if (!branchId) {
      session.flash('error', 'Office is required')
      return response.redirect().back()
    }

    const paymentDate = payload.paymentDate ?? DateTime.now()
    const status = payload.status ?? 'completed'

    const payment = await PaymentRecord.create({
      reference: await nextPaymentReference(branchId),
      invoiceId: payload.invoiceId ?? null,
      receiptId: payload.receiptId ?? null,
      customerId: payload.customerId,
      branchId,
      amount: payload.amount,
      currency: payload.currency ?? 'ZMW',
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference ?? null,
      paymentDate,
      status,
      notes: payload.notes ?? null,
      documentId: null,
      recordedById: user.id,
    })

    if (payload.invoiceId && status === 'completed') {
      const invoice = await Invoice.findOrFail(payload.invoiceId)
      if (userBranchId && invoice.branchId !== userBranchId) {
        return response.forbidden()
      }

      invoice.amountPaid = Number(invoice.amountPaid) + payload.amount
      await invoice.save()
      await InvoiceService.updatePaymentStatus(invoice)
    }

    await AuditService.log({
      action: 'payment.created',
      entityType: 'payment_record',
      entityId: payment.id,
      userId: user.id,
      ipAddress: request.ip(),
      metadata: { reference: payment.reference },
    })

    session.flash('success', 'Payment recorded successfully')
    return response.redirect().toRoute('payments')
  }
}
