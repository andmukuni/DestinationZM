import vine from '@vinejs/vine'

export const quickbooksCredentialsValidator = vine.compile(
  vine.object({
    clientId: vine.string().trim().minLength(1),
    clientSecret: vine.string().trim().optional(),
    redirectUri: vine
      .string()
      .trim()
      .regex(/^https?:\/\/[^\s/$.?#][^\s]*$/i),
    environment: vine.enum(['sandbox', 'production']),
  })
)

export const quickbooksSettingsValidator = vine.compile(
  vine.object({
    defaultServiceItemId: vine.string().trim().optional(),
    defaultServiceItemName: vine.string().trim().optional(),
    defaultIncomeAccountId: vine.string().trim().optional(),
    syncEnabled: vine.boolean().optional(),
  })
)
