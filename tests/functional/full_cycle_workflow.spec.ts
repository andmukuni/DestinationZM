import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import ClientAccount from '#models/client_account'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import RecoveryReportItem from '#models/recovery_report_item'
import Supplier from '#models/supplier'
import BookingService from '#services/booking_service'
import InvoiceService from '#services/invoice_service'
import QuotationService from '#services/quotation_service'
import RecoveryReportingService from '#services/recovery_reporting_service'
import WorkflowService from '#services/workflow_service'
import {
  issueClientInvoiceForBooking,
  recordSupplierPaymentOnBooking,
} from '../../database/helpers/middleman_workflow.js'

test.group('Full middleman workflow cycle', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('runs enquiry through paid invoice with recovery populated', async ({ assert }) => {
    const branch =
      (await Branch.findBy('code', 'LUS-HQ')) ??
      (await Branch.create({
        name: 'Test HQ',
        code: 'TST-HQ',
      }))

    const customer = await Customer.create({
      fullName: 'Cycle Test Client',
      email: `cycle-test-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const clientAccount = await ClientAccount.create({
      customerId: customer.id,
      fullName: customer.fullName,
      email: customer.email!,
      role: 'owner',
      password: 'password123',
      isActive: true,
    })

    const supplier = await Supplier.create({
      name: 'Test Supplier',
      code: `TST-SUP-${Date.now()}`,
      branchId: branch.id,
    })

    const booking = await BookingService.createEnquiry({
      customerId: customer.id,
      branchId: branch.id,
      destination: 'Lusaka to Johannesburg',
      departDate: DateTime.now().plus({ days: 14 }),
      returnDate: DateTime.now().plus({ days: 16 }),
      pax: 1,
      totalAmount: 5500,
      currency: 'ZMW',
      notes: 'Functional cycle test',
    })

    const quotation = await QuotationService.createFromBooking(booking, { userId: null })
    await QuotationService.send(quotation, { userId: null })
    await QuotationService.clientApprove(quotation, { clientAccountId: clientAccount.id })

    booking.merge({
      productType: 'flight',
      travelerName: customer.fullName,
      itineraryService: booking.destination,
      tripName: 'Board meeting travel',
      tripReason: 'Business',
      costCenter: 'CC-TEST-01',
      approvedBy: 'Finance Lead',
      generalLedgerAccount: 'GL-6100',
      supplierId: supplier.id,
    })
    await booking.save()

    await BookingService.confirm(booking, { userId: null })
    await booking.refresh()
    assert.equal(booking.status, 'confirmed')

    await recordSupplierPaymentOnBooking(booking, 'FUNC-TEST', null)
    assert.isTrue(await WorkflowService.canCreateInvoiceForBooking(booking.id))

    const { invoice, recoveryItem } = await issueClientInvoiceForBooking(booking, null)
    await booking.refresh()

    assert.equal(invoice.status, 'issued')
    assert.isNotNull(recoveryItem)
    assert.equal(invoice.recoveryReportItemId, recoveryItem.id)
    assert.include(['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'READY_FOR_CLIENT'], recoveryItem.recoveryStatus)

    if (['SENT_TO_CLIENT', 'UNDER_CLIENT_REVIEW', 'QUERY_RAISED'].includes(recoveryItem.recoveryStatus)) {
      await RecoveryReportingService.clientApprove(recoveryItem, { clientAccountId: clientAccount.id })
    }

    await InvoiceService.recordClientPayment(invoice, Number(invoice.totalAmount))
    await booking.refresh()

    const paidInvoice = await Invoice.findOrFail(invoice.id)
    assert.equal(paidInvoice.status, 'paid')
    assert.equal(booking.status, 'paid')

    const persistedRecovery = await RecoveryReportItem.findByOrFail('booking_id', booking.id)
    assert.equal(persistedRecovery.recoveryStatus, 'APPROVED_BY_CLIENT')

    await RecoveryReportingService.markRecovered(persistedRecovery, { userId: null })
    await persistedRecovery.refresh()
    assert.equal(persistedRecovery.recoveryStatus, 'RECOVERED')
  })
})
