import Invoice from '#models/invoice'
import PaymentRecord from '#models/payment_record'
import InvoiceDocumentHtmlService from '#services/invoice_document_html_service'
import InvoiceDocumentService from '#services/invoice_document_service'
import InvoiceService from '#services/invoice_service'
import PortalPrivilegeService from '#services/portal_privilege_service'
import { portalPaymentValidator } from '#validators/portal_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

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
    default:
      return 'warning'
  }
}

export default class PortalInvoicesController {
  async index({ auth, inertia, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_invoices')) {
      return response.forbidden()
    }

    const invoices = await Invoice.query()
      .where('customer_id', account.customerId)
      .whereNot('status', 'draft')
      .preload('booking')
      .orderBy('issue_date', 'desc')

    return inertia.render('portal/invoices/index', {
      pageTitle: 'Invoices',
      pageDescription: 'View balances and pay outstanding invoices',
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        balance: Number(invoice.totalAmount) - Number(invoice.amountPaid),
        currency: invoice.currency,
        issueDate: invoice.issueDate.toFormat('dd LLL yyyy'),
        dueDate: invoice.dueDate.toFormat('dd LLL yyyy'),
        bookingReference: invoice.booking?.reference ?? null,
        canPay:
          ['issued', 'partially_paid', 'overdue'].includes(invoice.status) &&
          PortalPrivilegeService.has(account, 'pay_invoices'),
      })),
    })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_invoices')) {
      return response.forbidden()
    }

    const invoice = await Invoice.query()
      .where('id', params.id)
      .where('customer_id', account.customerId)
      .preload('booking')
      .preload('customer')
      .preload('branch')
      .first()

    if (!invoice || invoice.status === 'draft') {
      return response.notFound()
    }

    const quotation = await InvoiceDocumentService.quotationForBooking(invoice.bookingId)
    const document = InvoiceDocumentService.buildForInvoice(invoice, quotation, { audience: 'portal' })
    const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid)
    const canPay =
      ['issued', 'partially_paid', 'overdue'].includes(invoice.status) &&
      PortalPrivilegeService.has(account, 'pay_invoices')

    return inertia.render('portal/invoices/show', {
      pageTitle: invoice.invoiceNumber,
      pageDescription: `Due ${invoice.dueDate.toFormat('dd LLL yyyy')}`,
      invoiceId: invoice.id,
      document,
      statusTone: invoiceStatusTone(invoice.status),
      canPay,
      balance,
      currency: invoice.currency,
      booking: invoice.bookingId ? { id: invoice.bookingId } : null,
      quotation: quotation ? { id: quotation.id } : null,
    })
  }

  async download({ auth, params, response }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'view_invoices')) {
      return response.forbidden()
    }

    const invoice = await Invoice.query()
      .where('id', params.id)
      .where('customer_id', account.customerId)
      .preload('booking')
      .preload('customer')
      .preload('branch')
      .first()

    if (!invoice || invoice.status === 'draft') {
      return response.notFound()
    }

    const quotation = await InvoiceDocumentService.quotationForBooking(invoice.bookingId)
    const document = InvoiceDocumentService.buildForInvoice(invoice, quotation, { audience: 'portal' })
    const html = InvoiceDocumentHtmlService.render(document)
    const fileName = `${invoice.invoiceNumber}.html`

    response.header('Content-Type', 'text/html; charset=utf-8')
    response.header('Content-Disposition', `attachment; filename="${fileName}"`)
    return response.send(html)
  }

  async pay({ auth, params, request, response, session }: HttpContext) {
    const account = auth.use('client').getUserOrFail()
    if (!PortalPrivilegeService.has(account, 'pay_invoices')) {
      return response.forbidden()
    }

    const invoice = await Invoice.query()
      .where('id', params.id)
      .where('customer_id', account.customerId)
      .firstOrFail()

    if (!['issued', 'partially_paid', 'overdue'].includes(invoice.status)) {
      session.flash('error', 'This invoice cannot be paid.')
      return response.redirect().back()
    }

    const payload = await request.validateUsing(portalPaymentValidator)
    const balance = Number(invoice.totalAmount) - Number(invoice.amountPaid)
    const amount = payload.amount ?? balance

    await InvoiceService.recordClientPayment(invoice, amount)

    await PaymentRecord.create({
      reference: `PAY-${DateTime.now().toFormat('yyyyMMddHHmmss')}`,
      invoiceId: invoice.id,
      receiptId: null,
      customerId: invoice.customerId,
      branchId: invoice.branchId,
      amount,
      currency: invoice.currency,
      paymentMethod: payload.paymentMethod,
      paymentReference: payload.paymentReference ?? null,
      paymentDate: DateTime.now(),
      status: 'completed',
      notes: 'Client portal payment',
      documentId: null,
      recordedById: null,
    })

    session.flash('success', 'Payment submitted successfully. Thank you.')
    return response.redirect().toRoute('portal.invoices.show', { id: invoice.id })
  }
}
