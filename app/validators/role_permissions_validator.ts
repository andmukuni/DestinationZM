import vine from '@vinejs/vine'
import { MANAGEABLE_ROLES, type UserRole } from '#types/user_roles'
import { PERMISSION_SLUGS } from '#types/permissions'

const manageablePermissionsShape = Object.fromEntries(
  MANAGEABLE_ROLES.map((role) => [role, vine.array(vine.enum(PERMISSION_SLUGS))])
) as unknown as Record<UserRole, ReturnType<typeof vine.array>>

export const rolePermissionsUpdateValidator = vine.compile(
  vine.object({
    permissions: vine.object(manageablePermissionsShape),
  })
)
