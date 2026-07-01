export type QuotationLineItem = {
  quantity: number
  title: string
  description: string
  amount: number
}

export type QuotationLineItemsData = {
  version: 1
  items: QuotationLineItem[]
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
