import ClientAccount from '#models/client_account'
import PortalRegistrationRequest from '#models/portal_registration_request'
import AuthSecurityService from '#services/auth/auth_security_service'
import SecuritySettingsService from '#services/settings/security_settings_service'
import { portalRegistrationValidator } from '#validators/portal_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class PortalRegistrationController {
  async create({ inertia }: HttpContext) {
    const turnstile = await SecuritySettingsService.turnstilePublicConfig()

    return inertia.render('portal/register', { turnstile })
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(portalRegistrationValidator)
    const ip = request.ip()

    const blocked = await AuthSecurityService.enforceLoginAttempt(
      { request, response, session },
      'portal_register',
      { email: payload.email }
    )
    if (blocked) {
      return blocked
    }

    const existingAccount = await ClientAccount.findBy('email', payload.email)
    if (existingAccount) {
      session.flash('error', 'An account with this email already exists. Sign in instead.')
      return response.redirect().toRoute('portal.login')
    }

    const pendingRequest = await PortalRegistrationRequest.query()
      .where('email', payload.email)
      .where('status', 'pending')
      .first()

    if (pendingRequest) {
      session.flash(
        'success',
        'We already have a pending request for this email. Our team will contact you soon.'
      )
      return response.redirect().toRoute('portal.login')
    }

    await PortalRegistrationRequest.create({
      fullName: payload.fullName,
      email: payload.email,
      company: payload.company ?? null,
      phone: payload.phone ?? null,
      message: payload.message ?? null,
      status: 'pending',
    })

    session.flash(
      'success',
      'Your portal access request has been submitted. We will contact you soon.'
    )
    return response.redirect().toRoute('portal.login')
  }
}
