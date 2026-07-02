import User from '#models/user'
import AuthorizationService from '#services/authorization_service'
import AuthSecurityService from '#services/auth/auth_security_service'
import MfaService from '#services/auth/mfa_service'
import SecuritySettingsService from '#services/settings/security_settings_service'
import UserActivityService from '#services/user_activity_service'
import { loginValidator } from '#validators/user'
import { mfaVerifyValidator } from '#validators/security_validator'
import { errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    const turnstile = await SecuritySettingsService.turnstilePublicConfig()

    return inertia.render('auth/login', { turnstile })
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const ip = request.ip()

    const blocked = await AuthSecurityService.enforceLoginAttempt(
      { request, response, session },
      'staff_login',
      { email }
    )
    if (blocked) {
      return blocked
    }

    try {
      const user = await User.verifyCredentials(email, password)
      await user.load('branch')

      if (!AuthorizationService.hasRequiredBranch(user)) {
        session.flash('error', 'Your account is not linked to a branch. Contact an administrator.')
        return response.redirect().back()
      }

      await AuthSecurityService.clearLoginAttempts('staff_login', ip, email)

      if (user.mfaEnabled) {
        session.put('mfa_pending_user_id', user.id)
        return response.redirect().toRoute('session.mfa')
      }

      await UserActivityService.touchLastAccessed(user, true)
      await auth.use('web').login(user)
      return response.redirect().toRoute('dashboard')
    } catch (error) {
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        await AuthSecurityService.recordFailedLogin('staff_login', ip, email)
        session.flash('error', 'Invalid email or password')
        return response.redirect().back()
      }

      throw error
    }
  }

  async createMfa({ inertia, session, response }: HttpContext) {
    const pendingUserId = session.get('mfa_pending_user_id')
    if (!pendingUserId) {
      return response.redirect().toRoute('session.create')
    }

    return inertia.render('auth/mfa_verify', {})
  }

  async storeMfa({ request, auth, response, session }: HttpContext) {
    const pendingUserId = session.get('mfa_pending_user_id')
    if (!pendingUserId) {
      return response.redirect().toRoute('session.create')
    }

    const { code } = await request.validateUsing(mfaVerifyValidator)
    const user = await User.find(pendingUserId)

    if (!user || !(await MfaService.verifyUser(user, code))) {
      session.flash('error', 'Invalid authentication code. Try again.')
      return response.redirect().back()
    }

    session.forget('mfa_pending_user_id')
    await user.load('branch')
    await UserActivityService.touchLastAccessed(user, true)
    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('session.create')
  }
}
