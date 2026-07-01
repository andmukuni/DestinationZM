import vine from '@vinejs/vine'
import { USER_ROLES } from '#types/user_roles'

export const userStoreValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(120),
    email: vine.string().trim().email().maxLength(255),
    password: vine.string().minLength(8).maxLength(255),
    role: vine.enum(USER_ROLES),
    branchId: vine.number().optional(),
  })
)

export const passwordUpdateValidator = vine.compile(
  vine.object({
    currentPassword: vine.string(),
    password: vine.string().minLength(8).maxLength(255),
    passwordConfirmation: vine.string().confirmed({ confirmationField: 'password' }),
  })
)
