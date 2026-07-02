import type { HttpContext } from '@adonisjs/core/http'
import TurnstileService from '#services/auth/turnstile_service'
import LoginRateLimitService from '#services/auth/login_rate_limit_service'

export type AuthRouteKey = 'staff_login' | 'portal_login' | 'portal_register'

export default class AuthSecurityService {
  static async enforceLoginAttempt(
    ctx: Pick<HttpContext, 'request' | 'response' | 'session'>,
    route: AuthRouteKey,
    options: { email: string }
  ) {
    const ip = ctx.request.ip()
    const email = options.email.trim()

    if (email && (await LoginRateLimitService.isLocked(route, ip, email))) {
      ctx.session.flash('error', LoginRateLimitService.lockoutMessage())
      return ctx.response.redirect().back()
    }

    const turnstileToken = ctx.request.input('cf-turnstile-response')
    if (!(await TurnstileService.verify(turnstileToken, ip))) {
      if (email) {
        await LoginRateLimitService.recordFailure(route, ip, email)
      }
      ctx.session.flash('error', TurnstileService.failureMessage())
      return ctx.response.redirect().back()
    }

    return null
  }

  static async recordFailedLogin(route: AuthRouteKey, ip: string, email: string) {
    await LoginRateLimitService.recordFailure(route, ip, email)
  }

  static async clearLoginAttempts(route: AuthRouteKey, ip: string, email: string) {
    await LoginRateLimitService.clear(route, ip, email)
  }
}
