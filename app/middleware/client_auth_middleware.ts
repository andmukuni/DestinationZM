import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

export default class ClientAuthMiddleware {
  redirectTo = '/portal/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards ?? ['client'], {
      loginRoute: this.redirectTo,
    })

    const account = ctx.auth.use('client').user
    if (account && !account.isActive) {
      await ctx.auth.use('client').logout()
      ctx.session.flash('error', 'Your account has been deactivated.')
      return ctx.response.redirect(this.redirectTo)
    }

    if (account) {
      await account.load('customer')
    }

    return next()
  }
}
