import type { QuotationLineItem } from '#types/quotation_line_item'

export type QuickbooksInvoiceLineInput = {
  quantity: number
  title: string
  description: string
  amount: number
}

export type QuickbooksCurrencyPrefs = {
  multiCurrencyEnabled: boolean
  homeCurrency: string
}

export type QuickbooksInvoicePayloadInput = {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes: string | null
  lineItems: QuickbooksInvoiceLineInput[]
  serviceItemId: string
  serviceItemName: string | null
  customerQuickbooksId: string
}

export type QuickbooksInvoicePayloadOptions = {
  /** Only set when QBO multi-currency is enabled and the invoice uses a foreign currency. */
  currencyRef?: string | null
  /** When null, invoice uses GlobalTaxCalculation NotApplicable (no TaxCodeRef on lines). */
  taxCodeId?: string | null
}

export type QuickbooksInvoiceLinePayload = {
  DetailType: 'SalesItemLineDetail'
  Amount: number
  Description?: string
  SalesItemLineDetail: {
    ItemRef: { value: string }
    Qty: number
    UnitPrice: number
    TaxCodeRef?: { value: string }
  }
}

export type QuickbooksInvoicePayload = {
  CustomerRef: { value: string }
  DocNumber: string
  TxnDate: string
  DueDate: string
  CurrencyRef?: { value: string }
  CustomerMemo?: { value: string }
  PrivateNote?: string
  GlobalTaxCalculation?: 'NotApplicable'
  TxnTaxDetail?: { TotalTax: number }
  Line: QuickbooksInvoiceLinePayload[]
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function normalizeQuickbooksDate(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  if (!match) {
    throw new Error(`Invalid QuickBooks date: ${value}`)
  }

  return match[1]
}

export function resolveQuickbooksCurrencyRef(
  currency: string,
  prefs: QuickbooksCurrencyPrefs
): string | null {
  if (!prefs.multiCurrencyEnabled) {
    return null
  }

  const normalized = currency.trim().toUpperCase()
  if (!normalized || normalized === prefs.homeCurrency) {
    return null
  }

  return normalized
}

export function sumQuickbooksLineAmounts(lines: QuickbooksInvoiceLinePayload[]) {
  return roundMoney(lines.reduce((total, line) => total + line.Amount, 0))
}

export function buildQuickbooksInvoicePayload(
  input: QuickbooksInvoicePayloadInput,
  options: QuickbooksInvoicePayloadOptions = {}
): QuickbooksInvoicePayload {
  const taxCodeId = options.taxCodeId?.trim() || null
  const lines = buildInvoiceLines(input, taxCodeId)

  const payload: QuickbooksInvoicePayload = {
    CustomerRef: { value: input.customerQuickbooksId },
    DocNumber: input.invoiceNumber.trim(),
    TxnDate: normalizeQuickbooksDate(input.issueDate),
    DueDate: normalizeQuickbooksDate(input.dueDate),
    Line: lines,
  }

  if (!taxCodeId) {
    payload.GlobalTaxCalculation = 'NotApplicable'
    payload.TxnTaxDetail = { TotalTax: 0 }
  }

  if (options.currencyRef) {
    payload.CurrencyRef = { value: options.currencyRef }
  }

  if (input.notes?.trim()) {
    payload.CustomerMemo = { value: input.notes.trim().slice(0, 1000) }
  }

  if (input.taxAmount > 0) {
    payload.PrivateNote = `Tax amount: ${roundMoney(input.taxAmount)}`
  }

  return payload
}

function buildInvoiceLines(input: QuickbooksInvoicePayloadInput, taxCodeId: string | null) {
  if (input.lineItems.length === 0) {
    return [
      buildSalesLine({
        serviceItemId: input.serviceItemId,
        taxCodeId,
        amount: input.totalAmount,
        qty: 1,
        description: input.invoiceNumber,
      }),
    ]
  }

  const lines = input.lineItems.map((item) =>
    lineFromItem(item, input.serviceItemId, taxCodeId)
  )

  const lineSum = sumQuickbooksLineAmounts(lines)
  const targetTotal = roundMoney(input.totalAmount)
  const difference = roundMoney(targetTotal - lineSum)

  if (Math.abs(difference) >= 0.01) {
    lines.push(
      buildSalesLine({
        serviceItemId: input.serviceItemId,
        taxCodeId,
        amount: difference,
        qty: 1,
        description:
          difference > 0 ? 'Tax and adjustments' : 'Discount and adjustments',
      })
    )
  }

  return lines
}

function buildSalesLine(input: {
  serviceItemId: string
  taxCodeId: string | null
  amount: number
  qty: number
  description?: string
}): QuickbooksInvoiceLinePayload {
  const qty = input.qty > 0 ? input.qty : 1
  const unitPrice = roundMoney(input.amount / qty)
  const amount = roundMoney(unitPrice * qty)

  return {
    DetailType: 'SalesItemLineDetail',
    Amount: amount,
    ...(input.description ? { Description: input.description.slice(0, 4000) } : {}),
    SalesItemLineDetail: {
      ItemRef: {
        value: input.serviceItemId,
      },
      Qty: qty,
      UnitPrice: unitPrice,
      ...(input.taxCodeId ? { TaxCodeRef: { value: input.taxCodeId } } : {}),
    },
  }
}

function lineFromItem(
  item: QuotationLineItem | QuickbooksInvoiceLineInput,
  serviceItemId: string,
  taxCodeId: string | null
) {
  const qty = item.quantity > 0 ? item.quantity : 1
  const description = [item.title, item.description].filter(Boolean).join(' — ').trim()

  return buildSalesLine({
    serviceItemId,
    taxCodeId,
    amount: item.amount,
    qty,
    description: description || undefined,
  })
}

export function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    throw new Error('QuickBooks money values must be finite numbers.')
  }

  return Math.round(value * 100) / 100
}

export function isValidQuickbooksDate(value: string) {
  return ISO_DATE_PATTERN.test(value)
}

export type QuickbooksPaymentPayloadInput = {
  customerQuickbooksId: string
  invoiceQuickbooksId: string
  totalAmount: number
  currency: string
  paymentDate: string
  reference?: string | null
}

export type QuickbooksPaymentPayload = {
  CustomerRef: { value: string }
  TotalAmt: number
  TxnDate: string
  CurrencyRef?: { value: string }
  PrivateNote?: string
  Line: Array<{
    Amount: number
    LinkedTxn: Array<{
      TxnId: string
      TxnType: 'Invoice'
    }>
  }>
}

export type QuickbooksPaymentPayloadOptions = {
  currencyRef?: string | null
}

export function buildQuickbooksPaymentPayload(
  input: QuickbooksPaymentPayloadInput,
  options: QuickbooksPaymentPayloadOptions = {}
): QuickbooksPaymentPayload {
  const payload: QuickbooksPaymentPayload = {
    CustomerRef: { value: input.customerQuickbooksId },
    TotalAmt: roundMoney(input.totalAmount),
    TxnDate: normalizeQuickbooksDate(input.paymentDate),
    Line: [
      {
        Amount: roundMoney(input.totalAmount),
        LinkedTxn: [
          {
            TxnId: input.invoiceQuickbooksId,
            TxnType: 'Invoice',
          },
        ],
      },
    ],
  }

  if (options.currencyRef) {
    payload.CurrencyRef = { value: options.currencyRef }
  }

  if (input.reference?.trim()) {
    payload.PrivateNote = input.reference.trim().slice(0, 4000)
  }

  return payload
}

export type QuickbooksCustomerPayload = {
  DisplayName: string
  PrimaryEmailAddr?: { Address: string }
  PrimaryPhone?: { FreeFormNumber: string }
  CompanyName?: string
  Notes?: string
}

export function buildQuickbooksCustomerPayload(input: {
  fullName: string
  email: string | null
  phone: string | null
  company: string | null
  localId: number
}): QuickbooksCustomerPayload {
  const payload: QuickbooksCustomerPayload = {
    DisplayName: input.company?.trim() || input.fullName.trim(),
    Notes: `DestinationZM customer #${input.localId}`,
  }

  if (input.email?.trim()) {
    payload.PrimaryEmailAddr = { Address: input.email.trim() }
  }

  if (input.phone?.trim()) {
    payload.PrimaryPhone = { FreeFormNumber: input.phone.trim() }
  }

  if (input.company?.trim()) {
    payload.CompanyName = input.company.trim()
  }

  return payload
}
