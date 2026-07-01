import vine from '@vinejs/vine'

export const reportRunValidator = vine.compile(
  vine.object({
    templateId: vine.number(),
    branchId: vine.number().optional(),
  })
)

export const reportTemplateStoreValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(120),
    slug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(80)
      .regex(/^[a-z0-9-]+$/),
    description: vine.string().trim().maxLength(2000).optional(),
  })
)
