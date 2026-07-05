import vine from '@vinejs/vine'

export const quotationStoreValidator = vine.compile(
  vine.object({
    customerId: vine.number(),
    branchId: vine.number().optional(),
    bookingId: vine.number().optional(),
    subtotal: vine.number().min(0).optional(),
    taxAmount: vine.number().min(0).optional(),
    totalAmount: vine.number().min(0).optional(),
    currency: vine.string().trim().fixedLength(3).optional(),
    validUntil: vine.date().optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
    lineItems: vine
      .array(
        vine.object({
          quantity: vine.number().min(1),
          title: vine.string().trim().minLength(1).maxLength(255),
          description: vine.string().trim().maxLength(5000).optional(),
          amount: vine.number().min(0),
        })
      )
      .optional(),
  })
)

export const quotationUpdateValidator = quotationStoreValidator

export const portalQuotationApproveValidator = vine.compile(
  vine.object({
    approvedItemIndices: vine.array(vine.number().min(0)).minLength(1),
  })
)
