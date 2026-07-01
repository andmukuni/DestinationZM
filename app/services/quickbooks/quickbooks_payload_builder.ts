import type { QuotationLineItem } from '#types/quotation_line_item'

export type QuickbooksInvoiceLineInput = {
  quantity: number
  title: string
  description: string
  amount: number
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

export type QuickbooksInvoicePayload = {
  CustomerRef: { value: string }
  DocNumber: string
  TxnDate: string
  DueDate: string
  CurrencyRef?: { value: string }
  CustomerMemo?: string
  PrivateNote?: string
  Line: Array<{
    DetailType: 'SalesItemLineDetail'
    Amount: number
    Description?: string
    SalesItemLineDetail: {
      ItemRef: { value: string; name?: string }
      Qty: number
      UnitPrice: number
    }
  }>
}

export function buildQuickbooksInvoicePayload(
  input: QuickbooksInvoicePayloadInput
): QuickbooksInvoicePayload {
  const lines =
    input.lineItems.length > 0
      ? input.lineItems.map((item) => lineFromItem(item, input.serviceItemId, input.serviceItemName))
      : [
          {
            DetailType: 'SalesItemLineDetail' as const,
            Amount: roundMoney(input.totalAmount),
            Description: input.invoiceNumber,
            SalesItemLineDetail: {
              ItemRef: {
                value: input.serviceItemId,
                ...(input.serviceItemName ? { name: input.serviceItemName } : {}),
              },
              Qty: 1,
              UnitPrice: roundMoney(input.totalAmount),
            },
          },
        ]

  const payload: QuickbooksInvoicePayload = {
    CustomerRef: { value: input.customerQuickbooksId },
    DocNumber: input.invoiceNumber,
    TxnDate: input.issueDate,
    DueDate: input.dueDate,
    Line: lines,
  }

  if (input.currency) {
    payload.CurrencyRef = { value: input.currency }
  }

  if (input.notes?.trim()) {
    payload.CustomerMemo = input.notes.trim().slice(0, 1000)
  }

  if (input.taxAmount > 0) {
    payload.PrivateNote = `Tax amount: ${input.taxAmount}`
  }

  return payload
}

function lineFromItem(
  item: QuotationLineItem | QuickbooksInvoiceLineInput,
  serviceItemId: string,
  serviceItemName: string | null
) {
  const qty = item.quantity > 0 ? item.quantity : 1
  const amount = roundMoney(item.amount)
  const unitPrice = roundMoney(amount / qty)
  const description = [item.title, item.description].filter(Boolean).join(' — ').trim()

  return {
    DetailType: 'SalesItemLineDetail' as const,
    Amount: amount,
    ...(description ? { Description: description.slice(0, 4000) } : {}),
    SalesItemLineDetail: {
      ItemRef: {
        value: serviceItemId,
        ...(serviceItemName ? { name: serviceItemName } : {}),
      },
      Qty: qty,
      UnitPrice: unitPrice,
    },
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
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

export function buildQuickbooksPaymentPayload(
  input: QuickbooksPaymentPayloadInput
): QuickbooksPaymentPayload {
  const payload: QuickbooksPaymentPayload = {
    CustomerRef: { value: input.customerQuickbooksId },
    TotalAmt: roundMoney(input.totalAmount),
    TxnDate: input.paymentDate,
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

  if (input.currency) {
    payload.CurrencyRef = { value: input.currency }
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
