import vine from '@vinejs/vine'

export const supplierStoreValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    code: vine.string().trim().maxLength(40).optional(),
    contactName: vine.string().trim().maxLength(120).optional(),
    email: vine.string().trim().email().maxLength(255).optional(),
    phone: vine.string().trim().maxLength(40).optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
    isActive: vine.boolean().optional(),
    branchId: vine.number().optional(),
  })
)
