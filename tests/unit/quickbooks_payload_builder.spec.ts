import { test } from '@japa/runner'
import {
  buildQuickbooksCustomerPayload,
  buildQuickbooksInvoicePayload,
  buildQuickbooksPaymentPayload,
  resolveQuickbooksCurrencyRef,
  sumQuickbooksLineAmounts,
} from '#services/quickbooks/quickbooks_payload_builder'

const baseInput = {
  invoiceNumber: 'INV-202607-0001',
  issueDate: '2026-07-01T10:15:00.000Z',
  dueDate: '2026-07-31',
  currency: 'ZMW',
  subtotal: 89432.99,
  taxAmount: 0,
  totalAmount: 89432.99,
  notes: 'Travel enquiry details',
  serviceItemId: '19',
  serviceItemName: 'Travel Services',
  customerQuickbooksId: '1',
}

test.group('Quickbooks payload builder', () => {
  test('omits CurrencyRef when multi-currency is disabled', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        lineItems: [
          {
            quantity: 1,
            title: 'Hotels',
            description: 'Livingstone',
            amount: 89432.99,
          },
        ],
      },
      {
        currencyRef: resolveQuickbooksCurrencyRef('ZMW', {
          multiCurrencyEnabled: false,
          homeCurrency: 'ZMW',
        }),
        taxCodeId: 'NON',
      }
    )

    assert.isUndefined(payload.CurrencyRef)
  })

  test('includes CurrencyRef only for foreign currency when multi-currency is enabled', ({
    assert,
  }) => {
    const currencyRef = resolveQuickbooksCurrencyRef('ZMW', {
      multiCurrencyEnabled: true,
      homeCurrency: 'USD',
    })

    assert.equal(currencyRef, 'ZMW')

    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        notes: null,
        lineItems: [],
      },
      { currencyRef, taxCodeId: 'NON' }
    )

    assert.equal(payload.CurrencyRef?.value, 'ZMW')
  })

  test('uses CustomerMemo.value object shape for notes', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        lineItems: [],
      },
      { taxCodeId: 'NON' }
    )

    assert.deepEqual(payload.CustomerMemo, { value: 'Travel enquiry details' })
    assert.equal(payload.TxnDate, '2026-07-01')
    assert.equal(payload.DueDate, '2026-07-31')
  })

  test('builds invoice payload from line items with TaxCodeRef', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        lineItems: [
          {
            quantity: 1,
            title: 'Hotels',
            description: 'Livingstone',
            amount: 89432.99,
          },
        ],
      },
      { taxCodeId: 'NON' }
    )

    assert.equal(payload.DocNumber, 'INV-202607-0001')
    assert.equal(payload.CustomerRef.value, '1')
    assert.equal(payload.Line.length, 1)
    assert.equal(payload.Line[0]?.Amount, 89432.99)
    assert.equal(payload.Line[0]?.SalesItemLineDetail.ItemRef.value, '19')
    assert.equal(payload.Line[0]?.SalesItemLineDetail.TaxCodeRef.value, 'NON')
    assert.equal(payload.Line[0]?.SalesItemLineDetail.Qty, 1)
    assert.equal(payload.Line[0]?.SalesItemLineDetail.UnitPrice, 89432.99)
  })

  test('keeps Amount equal to Qty multiplied by UnitPrice on every line', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        totalAmount: 100,
        lineItems: [
          {
            quantity: 3,
            title: 'Safari package',
            description: 'South Luangwa',
            amount: 100,
          },
        ],
      },
      { taxCodeId: 'NON' }
    )

    for (const line of payload.Line) {
      const detail = line.SalesItemLineDetail
      assert.equal(line.Amount, detail.Qty * detail.UnitPrice)
    }
  })

  test('adds adjustment line when line items do not sum to invoice total', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        subtotal: 80000,
        taxAmount: 9432.99,
        totalAmount: 89432.99,
        lineItems: [
          {
            quantity: 1,
            title: 'Hotels',
            description: 'Livingstone',
            amount: 80000,
          },
        ],
      },
      { taxCodeId: 'NON' }
    )

    assert.equal(payload.Line.length, 2)
    assert.equal(sumQuickbooksLineAmounts(payload.Line), 89432.99)
    assert.equal(payload.Line[1]?.Description, 'Tax and adjustments')
    assert.equal(payload.Line[1]?.Amount, 9432.99)
  })

  test('builds fallback single line when no line items exist', ({ assert }) => {
    const payload = buildQuickbooksInvoicePayload(
      {
        ...baseInput,
        notes: null,
        lineItems: [],
      },
      { taxCodeId: 'NON' }
    )

    assert.equal(payload.Line.length, 1)
    assert.equal(payload.Line[0]?.Amount, 89432.99)
    assert.equal(payload.Line[0]?.SalesItemLineDetail.TaxCodeRef.value, 'NON')
  })

  test('builds payment payload linked to invoice', ({ assert }) => {
    const payload = buildQuickbooksPaymentPayload(
      {
        customerQuickbooksId: '2',
        invoiceQuickbooksId: '145',
        totalAmount: 900,
        currency: 'ZMW',
        paymentDate: '2026-07-15T12:00:00.000Z',
        reference: 'INV-202607-0002',
      },
      {
        currencyRef: resolveQuickbooksCurrencyRef('ZMW', {
          multiCurrencyEnabled: true,
          homeCurrency: 'USD',
        }),
      }
    )

    assert.equal(payload.TotalAmt, 900)
    assert.equal(payload.TxnDate, '2026-07-15')
    assert.equal(payload.CurrencyRef?.value, 'ZMW')
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
