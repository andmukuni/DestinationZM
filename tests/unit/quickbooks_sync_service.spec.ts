import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'
import Branch from '#models/branch'
import Customer from '#models/customer'
import Invoice from '#models/invoice'
import QuickbooksSyncService from '#services/quickbooks/quickbooks_sync_service'

test.group('QuickbooksSyncService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('canPostInvoiceToQuickbooks allows issued invoices that were never synced', ({ assert }) => {
    assert.isTrue(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'issued', quickbooksSyncStatus: null },
        true
      )
    )
    assert.isTrue(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'issued', quickbooksSyncStatus: 'skipped' },
        true
      )
    )
  })

  test('canPostInvoiceToQuickbooks rejects draft, void, synced, and pending invoices', ({
    assert,
  }) => {
    assert.isFalse(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'draft', quickbooksSyncStatus: null },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'void', quickbooksSyncStatus: null },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'issued', quickbooksSyncStatus: 'synced' },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'issued', quickbooksSyncStatus: 'pending' },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'issued', quickbooksSyncStatus: 'failed' },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canPostInvoiceToQuickbooks(
        { status: 'issued', quickbooksSyncStatus: null },
        false
      )
    )
  })

  test('canRetryInvoiceQuickbooksSync only allows failed non-draft invoices when connected', ({
    assert,
  }) => {
    assert.isTrue(
      QuickbooksSyncService.canRetryInvoiceQuickbooksSync(
        { status: 'issued', quickbooksSyncStatus: 'failed' },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canRetryInvoiceQuickbooksSync(
        { status: 'issued', quickbooksSyncStatus: null },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canRetryInvoiceQuickbooksSync(
        { status: 'draft', quickbooksSyncStatus: 'failed' },
        true
      )
    )
    assert.isFalse(
      QuickbooksSyncService.canRetryInvoiceQuickbooksSync(
        { status: 'issued', quickbooksSyncStatus: 'failed' },
        false
      )
    )
  })

  test('getInvoiceListSyncSummaries returns invoice sync fields from invoice rows', async ({
    assert,
  }) => {
    const branch = await Branch.query().firstOrFail()
    const customer = await Customer.query().where('branch_id', branch.id).firstOrFail()

    const paidInvoice = await Invoice.create({
      invoiceNumber: `INV-QBO-PAID-${Date.now()}`,
      bookingId: null,
      customerId: customer.id,
      branchId: branch.id,
      status: 'paid',
      subtotal: 1000,
      taxAmount: 0,
      totalAmount: 1000,
      amountPaid: 1000,
      currency: 'ZMW',
      issueDate: DateTime.now(),
      dueDate: DateTime.now().plus({ days: 14 }),
      quickbooksSyncStatus: 'synced',
      quickbooksInvoiceId: 'qbo-inv-1',
    })

    const pendingInvoice = await Invoice.create({
      invoiceNumber: `INV-QBO-PENDING-${Date.now()}`,
      bookingId: null,
      customerId: customer.id,
      branchId: branch.id,
      status: 'issued',
      subtotal: 500,
      taxAmount: 0,
      totalAmount: 500,
      amountPaid: 0,
      currency: 'ZMW',
      issueDate: DateTime.now(),
      dueDate: DateTime.now().plus({ days: 14 }),
      quickbooksSyncStatus: 'pending',
    })

    const summaries = await QuickbooksSyncService.getInvoiceListSyncSummaries([
      paidInvoice,
      pendingInvoice,
    ])

    assert.equal(summaries.get(paidInvoice.id)?.quickbooksStatus, 'synced')
    assert.equal(summaries.get(paidInvoice.id)?.quickbooksInvoiceId, 'qbo-inv-1')
    assert.isNull(summaries.get(paidInvoice.id)?.quickbooksPaymentStatus)
    assert.equal(summaries.get(pendingInvoice.id)?.quickbooksStatus, 'pending')
    assert.isNull(summaries.get(pendingInvoice.id)?.quickbooksPaymentStatus)
  })
})
