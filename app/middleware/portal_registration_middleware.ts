import SystemSettingsService from '#services/settings/system_settings_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PortalRegistrationMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const allowed = await SystemSettingsService.isPortalRegistrationAllowed()

    if (!allowed) {
      ctx.session.flash('error', 'Portal self-registration is not available.')
      return ctx.response.redirect().toRoute('portal.login')
    }

    return next()
  }
}
