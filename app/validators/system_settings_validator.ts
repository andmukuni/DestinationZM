import vine from '@vinejs/vine'

export const generalSettingsValidator = vine.compile(
  vine.object({
    appDisplayName: vine.string().trim().minLength(1).maxLength(120),
    supportEmail: vine.string().trim().maxLength(255).optional(),
    supportPhone: vine.string().trim().maxLength(40).optional(),
    defaultCurrency: vine.string().trim().fixedLength(3),
    defaultTimezone: vine.string().trim().minLength(1).maxLength(64),
    portalWelcomeMessage: vine.string().trim().maxLength(2000).optional(),
  })
)

export const otherSettingsValidator = vine.compile(
  vine.object({
    maintenanceMode: vine.boolean().optional(),
    allowPortalRegistration: vine.boolean().optional(),
    enableClientNotifications: vine.boolean().optional(),
    defaultInvoiceDueDays: vine.number().min(1).max(365),
    auditRetentionDays: vine.number().min(30).max(3650),
  })
)

export const smtpSettingsValidator = vine.compile(
  vine.object({
    host: vine.string().trim().minLength(1),
    port: vine.number().min(1).max(65535),
    secure: vine.boolean().optional(),
    username: vine.string().trim().optional(),
    password: vine.string().trim().optional(),
    fromAddress: vine.string().trim().email(),
    fromName: vine.string().trim().maxLength(120).optional(),
    enabled: vine.boolean().optional(),
  })
)

export const smtpTestValidator = vine.compile(
  vine.object({
    testEmail: vine.string().trim().email(),
  })
)

export const smsSettingsValidator = vine.compile(
  vine.object({
    provider: vine.enum(['twilio', 'africas_talking', 'custom']),
    accountSid: vine.string().trim().minLength(1),
    authToken: vine.string().trim().optional(),
    fromNumber: vine.string().trim().minLength(1),
    enabled: vine.boolean().optional(),
  })
)

export const whatsappSettingsValidator = vine.compile(
  vine.object({
    provider: vine.enum(['meta', 'twilio', 'custom']),
    apiKey: vine.string().trim().optional(),
    phoneNumberId: vine.string().trim().minLength(1),
    businessAccountId: vine.string().trim().optional(),
    fromNumber: vine.string().trim().optional(),
    enabled: vine.boolean().optional(),
  })
)
