import ClientAccount from '#models/client_account'
import SystemSettingsService from '#services/settings/system_settings_service'
import AuthSecurityService from '#services/auth/auth_security_service'
import SecuritySettingsService from '#services/settings/security_settings_service'
import { loginValidator } from '#validators/user'
import { errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class PortalSessionController {
  async create({ inertia }: HttpContext) {
    const allowPortalRegistration = await SystemSettingsService.isPortalRegistrationAllowed()
    const turnstile = await SecuritySettingsService.turnstilePublicConfig()

    return inertia.render('portal/login', {
      allowPortalRegistration,
      turnstile,
    })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const ip = request.ip()

    const blocked = await AuthSecurityService.enforceLoginAttempt(
      { request, response, session },
      'portal_login',
      { email }
    )
    if (blocked) {
      return blocked
    }

    try {
      const account = await ClientAccount.verifyCredentials(email, password)
      if (!account.isActive) {
        session.flash('error', 'Your account has been deactivated.')
        return response.redirect().back()
      }

      await AuthSecurityService.clearLoginAttempts('portal_login', ip, email)

      account.lastLoginAt = DateTime.now()
      await account.save()
      await account.load('customer')
      await auth.use('client').login(account)

      return response.redirect().toRoute('portal.dashboard')
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        await AuthSecurityService.recordFailedLogin('portal_login', ip, email)
        session.flash('error', 'Invalid email or password')
        return response.redirect().back()
      }
      throw error
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('client').logout()
    return response.redirect().toRoute('portal.login')
  }
}
