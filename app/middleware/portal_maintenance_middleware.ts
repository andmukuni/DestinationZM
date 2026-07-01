import SystemSettingsService from '#services/settings/system_settings_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class PortalMaintenanceMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const maintenanceMode = await SystemSettingsService.isMaintenanceMode()

    if (!maintenanceMode) {
      return next()
    }

    if (await ctx.auth.use('client').check()) {
      await ctx.auth.use('client').logout()
    }

    return ctx.inertia.render('portal/maintenance', {})
  }
}
