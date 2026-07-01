import vine from '@vinejs/vine'

export const recoveryItemQueryValidator = vine.compile(
  vine.object({
    search: vine.string().trim().optional(),
    status: vine.string().trim().optional(),
    tab: vine.string().trim().optional(),
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    customerId: vine.number().optional(),
    recoveryItemId: vine.number().optional(),
  })
)

export const recoveryClientQueryValidator = vine.compile(
  vine.object({
    query: vine.string().trim().minLength(3).maxLength(2000),
  })
)

export const recoveryClientRejectValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().minLength(3).maxLength(2000),
  })
)

export const recoveryExportValidator = vine.compile(
  vine.object({
    startDate: vine.string().trim().optional(),
    endDate: vine.string().trim().optional(),
    recoveryItemId: vine.number().optional(),
  })
)

export const bookingSupplierPaymentValidator = vine.compile(
  vine.object({
    invoiceReceiptNumber: vine.string().trim().maxLength(100),
    dzPaymentDate: vine.string().trim().optional(),
    dzPaymentReference: vine.string().trim().maxLength(100).optional(),
    amountPaidByDz: vine.number().min(0).optional(),
  })
)

export const bookingConfirmValidator = vine.compile(
  vine.object({
    productType: vine.string().trim().maxLength(100).optional(),
    pnr: vine.string().trim().maxLength(100).optional(),
    travelerName: vine.string().trim().maxLength(255).optional(),
    itineraryService: vine.string().trim().maxLength(255).optional(),
    tripName: vine.string().trim().maxLength(255).optional(),
    tripReason: vine.string().trim().maxLength(255).optional(),
    costCenter: vine.string().trim().maxLength(255).optional(),
    dateRequested: vine.string().trim().optional(),
    approvedBy: vine.string().trim().maxLength(255).optional(),
    generalLedgerAccount: vine.string().trim().maxLength(255).optional(),
    supplierId: vine.number().optional(),
  })
)
