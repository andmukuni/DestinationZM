import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import LoginRateLimitService from '#services/auth/login_rate_limit_service'

export default class LoginRateLimitMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { route: string }) {
    const email = String(ctx.request.input('email', '')).trim()

    if (email && (await LoginRateLimitService.isLocked(options.route, ctx.request.ip(), email))) {
      ctx.session.flash('error', LoginRateLimitService.lockoutMessage())
      return ctx.response.redirect().back()
    }

    return next()
  }
}
