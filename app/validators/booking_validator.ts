import vine from '@vinejs/vine'

export const bookingStoreValidator = vine.compile(
  vine.object({
    customerId: vine.number(),
    branchId: vine.number().optional(),
    assignedUserId: vine.number().optional(),
    destination: vine.string().trim().minLength(2).maxLength(120),
    departDate: vine.date(),
    returnDate: vine.date().optional(),
    pax: vine.number().min(1).max(999).optional(),
    totalAmount: vine.number().min(0).optional(),
    currency: vine.string().trim().fixedLength(3).optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
  })
)
