import vine from '@vinejs/vine'

export const customerStoreValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(255).optional(),
    phone: vine.string().trim().maxLength(40).optional(),
    company: vine.string().trim().maxLength(120).optional(),
    notes: vine.string().trim().maxLength(5000).optional(),
    branchId: vine.number().optional(),
  })
)
