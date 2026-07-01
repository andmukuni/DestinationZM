import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const loginValidator = vine.compile(
  vine.object({
    email: email(),
    password: vine.string(),
  })
)
