import vine from '@vinejs/vine'

const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'reversed'] as const

export const paymentStoreValidator = vine.compile(
  vine.object({
    invoiceId: vine.number().optional(),
    receiptId: vine.number().optional(),
    customerId: vine.number(),
    branchId: vine.number().optional(),
    amount: vine.number().min(0.01),
    currency: vine.string().trim().fixedLength(3).optional(),
    paymentMethod: vine.string().trim().minLength(2).maxLength(60),
    paymentReference: vine.string().trim().maxLength(120).optional(),
    paymentDate: vine.date().optional(),
    status: vine.enum(PAYMENT_STATUSES).optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
  })
)
