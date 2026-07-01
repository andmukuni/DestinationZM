import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import PermissionService from '#services/permission_service'
import UserActivityService from '#services/user_activity_service'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards ?? ['web'], { loginRoute: this.redirectTo })

    const user = ctx.auth.use('web').user
    if (user) {
      await PermissionService.bootstrap()
      await UserActivityService.touchLastAccessed(user)
    }

    return next()
  }
}
