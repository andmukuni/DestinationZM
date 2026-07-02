export type QuickbooksSyncStatus = 'pending' | 'synced' | 'failed' | 'skipped' | null
export type QuickbooksPaymentSyncStatus = 'pending' | 'synced' | 'failed' | null

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info'

export function quickbooksInvoiceTone(status: QuickbooksSyncStatus): Tone {
  if (status === 'synced') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'failed') return 'danger'
  return 'default'
}

export function quickbooksInvoiceLabel(status: QuickbooksSyncStatus, connected: boolean) {
  if (!connected) return 'Not connected'
  if (status === 'synced') return 'Posted'
  if (status === 'pending') return 'Pending'
  if (status === 'failed') return 'Failed'
  if (status === 'skipped' || !status) return 'Not posted'
  return status
}

export function quickbooksPaymentTone(status: QuickbooksPaymentSyncStatus): Tone {
  if (status === 'synced') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'failed') return 'danger'
  return 'default'
}

export function quickbooksPaymentLabel(status: QuickbooksPaymentSyncStatus) {
  if (status === 'synced') return 'QBO paid'
  if (status === 'pending') return 'QBO pending'
  if (status === 'failed') return 'QBO failed'
  return null
}

export function invoicePaymentLabel(
  status: string,
  amountPaid: number,
  totalAmount: number
): 'Paid' | 'Partial' | 'Unpaid' {
  if (status === 'paid' || (totalAmount > 0 && amountPaid >= totalAmount)) {
    return 'Paid'
  }
  if (status === 'partially_paid' || amountPaid > 0) {
    return 'Partial'
  }
  return 'Unpaid'
}

export function invoicePaymentTone(
  status: string,
  amountPaid: number,
  totalAmount: number
): Tone {
  const label = invoicePaymentLabel(status, amountPaid, totalAmount)
  if (label === 'Paid') return 'success'
  if (label === 'Partial') return 'info'
  return 'default'
}
