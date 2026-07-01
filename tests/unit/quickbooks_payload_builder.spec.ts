import { test } from '@japa/runner'
import {
  buildQuickbooksCustomerPayload,
  buildQuickbooksInvoicePayload,
  buildQuickbooksPaymentPayload,
} from '#services/quickbooks/quickbooks_payload_builder'

test.group('Quickbooks payload builder', () => {
  test('builds invoice payload from line items', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload({
      invoiceNumber: 'INV-202607-0001',
      issueDate: '2026-07-01',
      dueDate: '2026-07-31',
      currency: 'ZMW',
      subtotal: 1500,
      taxAmount: 0,
      totalAmount: 1500,
      notes: 'Travel enquiry details',
      lineItems: [
        {
          quantity: 1,
          title: 'Hotels',
          description: 'Livingstone',
          amount: 1500,
        },
      ],
      serviceItemId: '19',
      serviceItemName: 'Travel Services',
      customerQuickbooksId: '1',
    })

    assert.equal(payload.DocNumber, 'INV-202607-0001')
    assert.equal(payload.CustomerRef.value, '1')
    assert.equal(payload.Line.length, 1)
    assert.equal(payload.Line[0]?.Amount, 1500)
    assert.equal(payload.Line[0]?.SalesItemLineDetail.ItemRef.value, '19')
  })

  test('builds fallback single line when no line items exist', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload({
      invoiceNumber: 'INV-202607-0002',
      issueDate: '2026-07-01',
      dueDate: '2026-07-31',
      currency: 'ZMW',
      subtotal: 900,
      taxAmount: 0,
      totalAmount: 900,
      notes: null,
      lineItems: [],
      serviceItemId: '19',
      serviceItemName: 'Travel Services',
      customerQuickbooksId: '2',
    })

    assert.equal(payload.Line.length, 1)
    assert.equal(payload.Line[0]?.Amount, 900)
  })

  test('builds payment payload linked to invoice', ({ assert }) => {
    const payload = buildQuickbooksPaymentPayload({
      customerQuickbooksId: '2',
      invoiceQuickbooksId: '145',
      totalAmount: 900,
      currency: 'ZMW',
      paymentDate: '2026-07-15',
      reference: 'INV-202607-0002',
    })

    assert.equal(payload.TotalAmt, 900)
    assert.equal(payload.Line[0]?.LinkedTxn[0]?.TxnId, '145')
    assert.equal(payload.Line[0]?.LinkedTxn[0]?.TxnType, 'Invoice')
  })

  test('builds customer payload with email and company', ({ assert }) => {
    const payload = buildQuickbooksCustomerPayload({
      fullName: 'Andrew Mukuni',
      email: 'client@example.com',
      phone: '+260 97 000 0000',
      company: 'Example Travel Ltd',
      localId: 12,
    })

    assert.equal(payload.DisplayName, 'Example Travel Ltd')
    assert.equal(payload.PrimaryEmailAddr?.Address, 'client@example.com')
    assert.include(payload.Notes ?? '', '#12')
  })
})
