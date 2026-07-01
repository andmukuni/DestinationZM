import vine from '@vinejs/vine'

export const receiptStoreValidator = vine.compile(
  vine.object({
    invoiceId: vine.number(),
    amount: vine.number().min(0.01),
    currency: vine.string().trim().fixedLength(3).optional(),
    paymentMethod: vine.string().trim().minLength(2).maxLength(60),
    paymentReference: vine.string().trim().maxLength(120).optional(),
    receivedDate: vine.date().optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
  })
)
