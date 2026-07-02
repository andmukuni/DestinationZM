import type { QuickbooksInvoicePayload } from '#services/quickbooks/quickbooks_payload_builder'
import { isValidQuickbooksDate, roundMoney } from '#services/quickbooks/quickbooks_payload_builder'

export class QuickbooksPayloadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuickbooksPayloadValidationError'
  }
}

export function validateQuickbooksInvoicePayload(payload: QuickbooksInvoicePayload) {
  if (!payload.CustomerRef?.value?.trim()) {
    throw new QuickbooksPayloadValidationError('CustomerRef.value is required.')
  }

  if (!payload.DocNumber?.trim()) {
    throw new QuickbooksPayloadValidationError('DocNumber is required.')
  }

  if (!isValidQuickbooksDate(payload.TxnDate)) {
    throw new QuickbooksPayloadValidationError('TxnDate must be YYYY-MM-DD.')
  }

  if (!isValidQuickbooksDate(payload.DueDate)) {
    throw new QuickbooksPayloadValidationError('DueDate must be YYYY-MM-DD.')
  }

  if (payload.CustomerMemo !== undefined) {
    if (
      typeof payload.CustomerMemo !== 'object' ||
      payload.CustomerMemo === null ||
      typeof payload.CustomerMemo.value !== 'string' ||
      !payload.CustomerMemo.value.trim()
    ) {
      throw new QuickbooksPayloadValidationError(
        'CustomerMemo must be an object with a non-empty value property.'
      )
    }
  }

  if (!Array.isArray(payload.Line) || payload.Line.length === 0) {
    throw new QuickbooksPayloadValidationError('At least one invoice line is required.')
  }

  if (payload.GlobalTaxCalculation === 'NotApplicable') {
    if (payload.TxnTaxDetail?.TotalTax !== 0) {
      throw new QuickbooksPayloadValidationError(
        'TxnTaxDetail.TotalTax must be 0 when GlobalTaxCalculation is NotApplicable.'
      )
    }
  }

  for (const [index, line] of payload.Line.entries()) {
    validateInvoiceLine(line, index, payload.GlobalTaxCalculation === 'NotApplicable')
  }
}

function validateInvoiceLine(
  line: QuickbooksInvoicePayload['Line'][number],
  index: number,
  outOfScopeTax: boolean
) {
  const prefix = `Line[${index}]`

  if (line.DetailType !== 'SalesItemLineDetail') {
    throw new QuickbooksPayloadValidationError(`${prefix} must use SalesItemLineDetail.`)
  }

  if (!Number.isFinite(line.Amount)) {
    throw new QuickbooksPayloadValidationError(`${prefix}.Amount must be a finite number.`)
  }

  const detail = line.SalesItemLineDetail
  if (!detail?.ItemRef?.value?.trim()) {
    throw new QuickbooksPayloadValidationError(`${prefix}.SalesItemLineDetail.ItemRef.value is required.`)
  }

  if (!outOfScopeTax && !detail?.TaxCodeRef?.value?.trim()) {
    throw new QuickbooksPayloadValidationError(`${prefix}.SalesItemLineDetail.TaxCodeRef.value is required.`)
  }

  if (outOfScopeTax && detail?.TaxCodeRef) {
    throw new QuickbooksPayloadValidationError(
      `${prefix}.SalesItemLineDetail.TaxCodeRef must be omitted when GlobalTaxCalculation is NotApplicable.`
    )
  }

  if (!Number.isFinite(detail.Qty) || detail.Qty <= 0) {
    throw new QuickbooksPayloadValidationError(`${prefix}.SalesItemLineDetail.Qty must be greater than zero.`)
  }

  if (!Number.isFinite(detail.UnitPrice)) {
    throw new QuickbooksPayloadValidationError(`${prefix}.SalesItemLineDetail.UnitPrice must be a finite number.`)
  }

  const expectedAmount = roundMoney(detail.Qty * detail.UnitPrice)
  if (roundMoney(line.Amount) !== expectedAmount) {
    throw new QuickbooksPayloadValidationError(
      `${prefix}.Amount must equal Qty multiplied by UnitPrice.`
    )
  }
}
