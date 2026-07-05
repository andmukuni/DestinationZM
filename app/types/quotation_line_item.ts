export type QuotationLineItem = {
  quantity: number
  title: string
  description: string
  amount: number
  clientApproved?: boolean
}

export type QuotationLineItemsData = {
  version: 1
  items: QuotationLineItem[]
}

export function quotationLineItems(items: QuotationLineItemsData | null | undefined) {
  return items?.items ?? []
}

export function approvedQuotationLineItems(items: QuotationLineItem[]) {
  if (items.length === 0) {
    return []
  }

  const hasApprovalFlags = items.some((item) => item.clientApproved !== undefined)
  if (!hasApprovalFlags) {
    return items
  }

  return items.filter((item) => item.clientApproved)
}

export function quotationTotalsFromLineItems(
  items: QuotationLineItem[],
  taxAmount = 0,
  fullSubtotal?: number
) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
  const basis = fullSubtotal && fullSubtotal > 0 ? fullSubtotal : subtotal
  const taxRatio = basis > 0 ? subtotal / basis : 1
  const adjustedTax = Number((taxAmount * taxRatio).toFixed(2))

  return {
    subtotal,
    taxAmount: adjustedTax,
    totalAmount: subtotal + adjustedTax,
    itemCount: items.length,
  }
}

export function markClientApprovedLineItems(items: QuotationLineItem[], approvedIndices: number[]) {
  const approvedSet = new Set(approvedIndices)

  return items.map((item, index) => ({
    ...item,
    clientApproved: approvedSet.has(index),
  }))
}

export function isQuotationLineItemsData(value: unknown): value is QuotationLineItemsData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    (value as QuotationLineItemsData).version === 1 &&
    Array.isArray((value as QuotationLineItemsData).items)
  )
}
