import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import PermissionService from '#services/permission_service'
import type { PermissionSlug } from '#types/permissions'

export default class PermissionMiddleware {
  async handle(ctx: HttpContext, next: NextFn, permission: PermissionSlug) {
    const user = ctx.auth.use("web").getUserOrFail()
    await PermissionService.bootstrap()

    if (!PermissionService.can(user, permission)) {
      return ctx.response.forbidden()
    }

    return next()
  }
}
