import vine from '@vinejs/vine'

export const securitySettingsValidator = vine.compile(
  vine.object({
    turnstileEnabled: vine.boolean().optional(),
    turnstileSiteKey: vine.string().trim().maxLength(255).optional(),
    turnstileSecret: vine.string().trim().optional(),
    requireMfaForStaff: vine.boolean().optional(),
    loginMaxAttempts: vine.number().min(3).max(20),
    loginWindowMinutes: vine.number().min(5).max(120),
  })
)

export const mfaVerifyValidator = vine.compile(
  vine.object({
    code: vine.string().trim().fixedLength(6),
  })
)

export const mfaDisableValidator = vine.compile(
  vine.object({
    code: vine.string().trim().fixedLength(6),
    password: vine.string().trim().minLength(1),
  })
)
