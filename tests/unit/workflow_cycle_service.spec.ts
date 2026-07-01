import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Booking from '#models/booking'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import Quotation from '#models/quotation'
import RecoveryReportItem from '#models/recovery_report_item'
import User from '#models/user'
import WorkflowCycleService from '#services/workflow_cycle_service'

test.group('WorkflowCycleService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('next incomplete stage starts with confirm booking when quotation approved', async ({ assert }) => {
    const branch = await Branch.firstOrFail()
    const customer = await Customer.create({
      fullName: 'Cycle Stage Test',
      email: `cycle-stage-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const booking = await Booking.create({
      reference: `BK-CYCLE-${Date.now()}`,
      customerId: customer.id,
      branchId: branch.id,
      assignedUserId: null,
      destination: 'Livingstone',
      departDate: DateTime.now().plus({ days: 10 }),
      returnDate: DateTime.now().plus({ days: 12 }),
      pax: 2,
      status: 'quotation_approved',
      totalAmount: 3000,
      currency: 'ZMW',
      dzPaymentStatus: 'NOT_PAID',
    })

    await Quotation.create({
      reference: `QT-CYCLE-${Date.now()}`,
      bookingId: booking.id,
      customerId: customer.id,
      branchId: branch.id,
      status: 'client_approved',
      subtotal: 3000,
      taxAmount: 0,
      totalAmount: 3000,
      currency: 'ZMW',
      validUntil: DateTime.now().plus({ days: 7 }),
    })

    const rows = await WorkflowCycleService.listIncomplete(await adminUser(branch.id), {})
    const row = rows.find((entry) => entry.id === booking.id)

    assert.exists(row)
    assert.equal(row!.stageLabel, 'Confirm booking')
  })

  test('completed cycles require recovered recovery item and paid invoice', async ({ assert }) => {
    const branch = await Branch.firstOrFail()
    const customer = await Customer.create({
      fullName: 'Completed Cycle Test',
      email: `cycle-done-${Date.now()}@example.com`,
      branchId: branch.id,
    })

    const booking = await Booking.create({
      reference: `BK-DONE-${Date.now()}`,
      customerId: customer.id,
      branchId: branch.id,
      assignedUserId: null,
      destination: 'Ndola',
      departDate: DateTime.now().plus({ days: 20 }),
      returnDate: null,
      pax: 1,
      status: 'paid',
      totalAmount: 4500,
      currency: 'ZMW',
      dzPaymentStatus: 'PAID',
      dzPaymentDate: DateTime.now(),
      amountPaidByDz: 4500,
    })

    await Quotation.create({
      reference: `QT-DONE-${Date.now()}`,
      bookingId: booking.id,
      customerId: customer.id,
      branchId: branch.id,
      status: 'client_approved',
      subtotal: 4500,
      taxAmount: 0,
      totalAmount: 4500,
      currency: 'ZMW',
      validUntil: DateTime.now().plus({ days: 7 }),
    })

    await Invoice.create({
      invoiceNumber: `INV-DONE-${Date.now()}`,
      bookingId: booking.id,
      customerId: customer.id,
      branchId: branch.id,
      status: 'paid',
      subtotal: 4500,
      taxAmount: 0,
      totalAmount: 4500,
      amountPaid: 4500,
      currency: 'ZMW',
      issueDate: DateTime.now(),
      dueDate: DateTime.now().plus({ days: 14 }),
    })

    await RecoveryReportItem.create({
      recoveryReference: `RRI-DONE-${Date.now()}`,
      bookingId: booking.id,
      customerId: customer.id,
      branchId: branch.id,
      productType: 'flight',
      currency: 'ZMW',
      price: 4500,
      travelerName: customer.fullName,
      recoveryStatus: 'RECOVERED',
      dzPaymentStatus: 'PAID',
      amountPaidByDz: 4500,
    })

    const completed = await WorkflowCycleService.list(await adminUser(branch.id), {})
    assert.isTrue(completed.some((entry) => entry.id === booking.id))

    const detail = await WorkflowCycleService.findForUser(await adminUser(branch.id), booking.id)
    assert.isNotNull(detail)
    assert.isTrue(detail!.isComplete)
  })
})

async function adminUser(_branchId: number) {
  const user = await User.findBy('email', 'admin@destinationzm.local')
  if (!user) {
    throw new Error('Seed admin user not found')
  }
  return user
}
