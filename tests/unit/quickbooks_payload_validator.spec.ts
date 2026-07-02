import { test } from '@japa/runner'
import type { QuickbooksInvoicePayload } from '#services/quickbooks/quickbooks_payload_builder'
import {
  QuickbooksPayloadValidationError,
  validateQuickbooksInvoicePayload,
} from '#services/quickbooks/quickbooks_payload_validator'

function validPayload(): QuickbooksInvoicePayload {
  return {
    CustomerRef: { value: '1' },
    DocNumber: 'INV-202607-0001',
    TxnDate: '2026-07-01',
    DueDate: '2026-07-31',
    CustomerMemo: { value: 'Travel enquiry details' },
    Line: [
      {
        DetailType: 'SalesItemLineDetail',
        Amount: 89432.99,
        Description: 'Hotels — Livingstone',
        SalesItemLineDetail: {
          ItemRef: { value: '19' },
          Qty: 1,
          UnitPrice: 89432.99,
          TaxCodeRef: { value: 'NON' },
        },
      },
    ],
  }
}

test.group('Quickbooks payload validator', () => {
  test('accepts a valid invoice payload', ({ assert }) => {
    assert.doesNotThrow(() => validateQuickbooksInvoicePayload(validPayload()))
  })

  test('rejects raw-string CustomerMemo', ({ assert }) => {
    const payload = validPayload()
    ;(payload as unknown as { CustomerMemo: string }).CustomerMemo = 'Invalid memo'

    assert.throws(
      () => validateQuickbooksInvoicePayload(payload),
      QuickbooksPayloadValidationError,
      'CustomerMemo must be an object with a non-empty value property.'
    )
  })

  test('rejects missing TaxCodeRef on invoice lines', ({ assert }) => {
    const payload = validPayload()
    delete payload.Line[0]!.SalesItemLineDetail.TaxCodeRef

    assert.throws(
      () => validateQuickbooksInvoicePayload(payload),
      QuickbooksPayloadValidationError,
      'TaxCodeRef.value is required.'
    )
  })

  test('rejects line amounts that do not match Qty multiplied by UnitPrice', ({ assert }) => {
    const payload = validPayload()
    payload.Line[0]!.Amount = 100

    assert.throws(
      () => validateQuickbooksInvoicePayload(payload),
      QuickbooksPayloadValidationError,
      'Amount must equal Qty multiplied by UnitPrice.'
    )
  })
})
