import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import Booking from '#models/booking'
import Branch from '#models/branch'
import ClientAccount from '#models/client_account'
import Customer from '#models/customer'
import { PORTAL_PRIVILEGE_PRESETS } from '#types/portal_privileges'
import Invoice from '#models/invoice'
import ReportTemplate from '#models/report_template'
import Supplier from '#models/supplier'
import User from '#models/user'
import BookingService from '#services/booking_service'
import InvoiceService from '#services/invoice_service'
import NotificationService from '#services/notification_service'
import QuotationService from '#services/quotation_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import {
  issueClientInvoiceForBooking,
  recordSupplierPaymentOnBooking,
} from '../helpers/middleman_workflow.js'

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    const branch = await Branch.findBy('code', 'LUS-HQ')
    if (!branch) {
      throw new Error('Run branch_seeder first.')
    }

    const admin = await User.findBy('email', 'admin@destinationzm.local')
    const reservations = await User.findBy('email', 'reservations@destinationzm.local')
    const finance = await User.findBy('email', 'finance@destinationzm.local')
    const recovery = await User.findBy('email', 'recovery@destinationzm.local')

    const customer =
      (await Customer.findBy('email', 'chanda.banda@example.com')) ??
      (await Customer.create({
        fullName: 'Chanda Banda',
        company: 'Zambia Tours Ltd',
        email: 'chanda.banda@example.com',
        phone: '+260 97 123 4567',
        branchId: branch.id,
      }))

    if (!customer.company) {
      customer.company = 'Zambia Tours Ltd'
      await customer.save()
    }

    let clientAccount = await ClientAccount.findBy('email', 'chanda.banda@example.com')
    if (!clientAccount) {
      clientAccount = await ClientAccount.create({
        customerId: customer.id,
        fullName: 'Chanda Banda',
        email: 'chanda.banda@example.com',
        role: 'owner',
        password: 'password123',
        isActive: true,
      })
    } else {
      clientAccount.fullName = clientAccount.fullName ?? 'Chanda Banda'
      clientAccount.role = 'owner'
      await clientAccount.save()
    }

    let financeAccount = await ClientAccount.findBy('email', 'finance@zambiatours.co.zm')
    if (!financeAccount) {
      financeAccount = await ClientAccount.create({
        customerId: customer.id,
        fullName: 'Mutale Zulu',
        email: 'finance@zambiatours.co.zm',
        role: 'member',
        privileges: PORTAL_PRIVILEGE_PRESETS.finance.privileges,
        password: 'password123',
        isActive: true,
      })
    } else if (!financeAccount.privileges?.length) {
      financeAccount.privileges = PORTAL_PRIVILEGE_PRESETS.finance.privileges
      await financeAccount.save()
    }

    const supplier =
      (await Supplier.findBy('code', 'SAF-LUA')) ??
      (await Supplier.create({
        name: 'Safari Lodge Luangwa',
        code: 'SAF-LUA',
        contactName: 'John Muleya',
        email: 'bookings@safari-luangwa.co.zm',
        phone: '+260 21 123 456',
        branchId: branch.id,
      }))

    void supplier

    let hybridBooking = await Booking.query()
      .where('customer_id', customer.id)
      .where('status', 'paid')
      .first()

    if (!hybridBooking) {
      hybridBooking = await BookingService.createEnquiry({
        customerId: customer.id,
        branchId: branch.id,
        destination: 'Victoria Falls',
        departDate: DateTime.now().plus({ days: 21 }),
        returnDate: DateTime.now().plus({ days: 25 }),
        pax: 4,
        totalAmount: 18500,
        currency: 'ZMW',
        notes: 'Hybrid workflow demo — family safari package',
        userId: admin?.id ?? null,
      })

      const quotation = await QuotationService.createFromBooking(hybridBooking, {
        createdById: reservations?.id ?? admin?.id ?? null,
        userId: admin?.id ?? null,
      })
      await QuotationService.send(quotation, { userId: reservations?.id ?? admin?.id ?? null })
      await QuotationService.clientApprove(quotation, { clientAccountId: clientAccount.id })

      await NotificationService.notifyRoles(['admin', 'reservations'], {
        type: 'quotation.client_approved',
        title: 'Client approved quotation (seed)',
        body: `${customer.fullName} approved ${quotation.reference}`,
        entityType: 'quotation',
        entityId: quotation.id,
      })

      hybridBooking.merge({
        productType: 'package',
        travelerName: customer.fullName,
        itineraryService: hybridBooking.destination,
        tripName: 'Victoria Falls family safari',
        tripReason: 'Annual leave',
        dateRequested: DateTime.now().minus({ days: 3 }),
        supplierId: supplier.id,
        costCenter: 'CC-TRAVEL-01',
        approvedBy: 'Mutale Zulu',
        generalLedgerAccount: 'GL-6100',
      })
      await hybridBooking.save()

      await BookingService.confirm(hybridBooking, { userId: finance?.id ?? admin?.id ?? null })
      await hybridBooking.refresh()

      const actorId = finance?.id ?? admin?.id ?? null
      await recordSupplierPaymentOnBooking(hybridBooking, `HYBRID-${hybridBooking.id}`, actorId)

      const { recoveryItem, invoice } = await issueClientInvoiceForBooking(hybridBooking, actorId)

      if (['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'].includes(recoveryItem.recoveryStatus)) {
        await RecoveryReportingService.clientApprove(recoveryItem, { clientAccountId: clientAccount.id })
      }

      await NotificationService.notifyRoles(['admin', 'finance'], {
        type: 'recovery_item.client_approved',
        title: 'Client approved recovery item (seed)',
        body: `${customer.fullName} approved ${recoveryItem.recoveryReference}`,
        entityType: 'recovery_report_item',
        entityId: recoveryItem.id,
      })

      await InvoiceService.recordClientPayment(invoice, Number(invoice.totalAmount))
      await hybridBooking.refresh()
    }

    let overdueBooking = await Booking.query()
      .where('customer_id', customer.id)
      .where('status', 'invoiced')
      .first()

    if (!overdueBooking) {
      overdueBooking = await BookingService.create({
        customerId: customer.id,
        branchId: branch.id,
        assignedUserId: reservations?.id ?? admin?.id ?? null,
        destination: 'South Luangwa',
        departDate: DateTime.now().plus({ days: 30 }),
        returnDate: DateTime.now().plus({ days: 34 }),
        pax: 2,
        totalAmount: 12000,
        currency: 'ZMW',
        notes: 'Overdue invoice demo booking',
        userId: admin?.id ?? null,
      })
      await BookingService.confirm(overdueBooking, { userId: admin?.id ?? null })
      await overdueBooking.refresh()

      let invoice = await Invoice.query().where('booking_id', overdueBooking.id).first()
      if (!invoice) {
        invoice = await InvoiceService.createFromBooking(overdueBooking, {
          userId: finance?.id ?? admin?.id ?? null,
        })
      }

      if (invoice.status === 'issued') {
        invoice.dueDate = DateTime.now().minus({ days: 5 })
        await invoice.save()
        await InvoiceService.markOverdue(invoice)
      }
    }

    const templates = [
      { name: 'Bookings summary', slug: 'bookings-summary', source: 'system' as const },
      { name: 'Invoices aging', slug: 'invoices-aging', source: 'system' as const },
      { name: 'Workflow pipeline', slug: 'workflow-pipeline', source: 'system' as const },
    ]

    for (const template of templates) {
      const existing = await ReportTemplate.findBy('slug', template.slug)
      if (!existing) {
        await ReportTemplate.create(template)
      }
    }
  }
}
