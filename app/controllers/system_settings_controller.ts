import AuthorizationService from '#services/authorization_service'
import User from '#models/user'
import SmsSettingsService from '#services/settings/sms_settings_service'
import SmtpSettingsService from '#services/settings/smtp_settings_service'
import {
  buildSettingsPageProps,
  canAccessSettingsSection,
  isMissingSettingsTable,
  visibleSettingsSections,
  type SettingsSection,
} from '#services/settings/settings_access'
import SystemSettingsService from '#services/settings/system_settings_service'
import SecuritySettingsService from '#services/settings/security_settings_service'
import MfaService from '#services/auth/mfa_service'
import WhatsappSettingsService from '#services/settings/whatsapp_settings_service'
import {
  generalSettingsValidator,
  otherSettingsValidator,
  portalSettingsValidator,
  smsSettingsValidator,
  smtpSettingsValidator,
  smtpTestValidator,
  whatsappSettingsValidator,
} from '#validators/system_settings_validator'
import {
  mfaDisableValidator,
  mfaVerifyValidator,
  securitySettingsValidator,
} from '#validators/security_validator'
import type { HttpContext } from '@adonisjs/core/http'
import nodemailer from 'nodemailer'

function parseCheckbox(value: unknown) {
  return value === '1' || value === true || value === 'on'
}

function migrationRequiredProps(
  user: Parameters<typeof buildSettingsPageProps>[0],
  section: SettingsSection
) {
  return buildSettingsPageProps(user, section, {
    migrationRequired: true,
    general: {
      appDisplayName: 'DestinationZM',
      supportEmail: '',
      supportPhone: '',
      defaultCurrency: 'ZMW',
      defaultTimezone: 'Africa/Lusaka',
    },
    portal: {
      portalWelcomeMessage: '',
      maintenanceMode: false,
      allowPortalRegistration: false,
      enableClientNotifications: true,
    },
    other: {
      defaultInvoiceDueDays: 30,
      auditRetentionDays: 365,
    },
    security: {
      turnstileEnabled: false,
      turnstileSiteKey: '',
      hasTurnstileSecret: false,
      requireMfaForStaff: false,
      loginMaxAttempts: 5,
      loginWindowMinutes: 15,
    },
    smtp: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      hasPassword: false,
      fromAddress: '',
      fromName: '',
      enabled: false,
      configured: false,
      source: 'none' as const,
    },
    sms: {
      provider: 'twilio' as const,
      accountSid: '',
      fromNumber: '',
      hasAuthToken: false,
      enabled: false,
      configured: false,
      source: 'none' as const,
    },
    whatsapp: {
      provider: 'meta' as const,
      phoneNumberId: '',
      businessAccountId: '',
      fromNumber: '',
      hasApiKey: false,
      enabled: false,
      configured: false,
      source: 'none' as const,
    },
  })
}

export default class SystemSettingsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const sections = visibleSettingsSections(user)

    if (sections.length === 0) {
      return response.forbidden()
    }

    const first = sections[0]!.id
    const paths: Record<SettingsSection, string> = {
      general: '/settings/general',
      portal: '/settings/portal',
      smtp: '/settings/smtp',
      quickbooks: '/settings/quickbooks',
      sms: '/settings/sms',
      whatsapp: '/settings/whatsapp',
      security: '/settings/security',
      other: '/settings/other',
    }

    return response.redirect(paths[first])
  }

  async general({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'general')) {
      return response.forbidden()
    }

    try {
      const general = await SystemSettingsService.generalToView()
      return inertia.render(
        'settings/general',
        buildSettingsPageProps(user, 'general', { general })
      )
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/general', migrationRequiredProps(user, 'general'))
    }
  }

  async updateGeneral({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(generalSettingsValidator)

    await SystemSettingsService.saveGeneral(
      {
        appDisplayName: payload.appDisplayName,
        supportEmail: payload.supportEmail ?? '',
        supportPhone: payload.supportPhone ?? '',
        defaultCurrency: payload.defaultCurrency.toUpperCase(),
        defaultTimezone: payload.defaultTimezone,
      },
      user.id
    )

    session.flash('success', 'General settings saved.')
    return response.redirect().toRoute('settings.general')
  }

  async portal({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'portal')) {
      return response.forbidden()
    }

    try {
      const portal = await SystemSettingsService.portalToView()
      return inertia.render('settings/portal', buildSettingsPageProps(user, 'portal', { portal }))
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/portal', migrationRequiredProps(user, 'portal'))
    }
  }

  async updatePortal({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(portalSettingsValidator)

    await SystemSettingsService.savePortal(
      {
        portalWelcomeMessage: payload.portalWelcomeMessage ?? '',
        maintenanceMode: parseCheckbox(request.input('maintenanceMode')),
        allowPortalRegistration: parseCheckbox(request.input('allowPortalRegistration')),
        enableClientNotifications: parseCheckbox(request.input('enableClientNotifications')),
      },
      user.id
    )

    session.flash('success', 'Client portal settings saved.')
    return response.redirect().toRoute('settings.portal')
  }

  async smtp({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'smtp')) {
      return response.forbidden()
    }

    try {
      const smtp = await SmtpSettingsService.toView()
      return inertia.render('settings/smtp', buildSettingsPageProps(user, 'smtp', { smtp }))
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/smtp', migrationRequiredProps(user, 'smtp'))
    }
  }

  async updateSmtp({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(smtpSettingsValidator)

    try {
      await SmtpSettingsService.save(
        {
          host: payload.host,
          port: payload.port,
          secure: parseCheckbox(request.input('secure')),
          username: payload.username ?? null,
          password: payload.password ?? null,
          fromAddress: payload.fromAddress,
          fromName: payload.fromName ?? null,
          enabled: parseCheckbox(request.input('enabled')),
        },
        user.id
      )

      session.flash('success', 'SMTP settings saved.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save SMTP settings.'
      session.flash('error', message)
    }

    return response.redirect().toRoute('settings.smtp')
  }

  async testSmtp({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(smtpTestValidator)
    const config = await SmtpSettingsService.resolve()

    if (!config.host || !config.fromAddress) {
      session.flash('error', 'Save SMTP settings before sending a test email.')
      return response.redirect().toRoute('settings.smtp')
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.username ? { user: config.username, pass: config.password ?? '' } : undefined,
      })

      await transporter.sendMail({
        from: config.fromName ? `"${config.fromName}" <${config.fromAddress}>` : config.fromAddress,
        to: payload.testEmail,
        subject: 'DestinationZM SMTP test',
        text: 'This is a test email from DestinationZM system settings.',
        html: '<p>This is a test email from <strong>DestinationZM</strong> system settings.</p>',
      })

      session.flash('success', `Test email sent to ${payload.testEmail}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send test email.'
      session.flash('error', message)
    }

    return response.redirect().toRoute('settings.smtp')
  }

  async sms({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'sms')) {
      return response.forbidden()
    }

    try {
      const sms = await SmsSettingsService.toView()
      return inertia.render('settings/sms', buildSettingsPageProps(user, 'sms', { sms }))
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/sms', migrationRequiredProps(user, 'sms'))
    }
  }

  async updateSms({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(smsSettingsValidator)

    try {
      await SmsSettingsService.save(
        {
          provider: payload.provider,
          accountSid: payload.accountSid,
          authToken: payload.authToken ?? null,
          fromNumber: payload.fromNumber,
          enabled: parseCheckbox(request.input('enabled')),
        },
        user.id
      )

      session.flash('success', 'SMS settings saved.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save SMS settings.'
      session.flash('error', message)
    }

    return response.redirect().toRoute('settings.sms')
  }

  async whatsapp({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'whatsapp')) {
      return response.forbidden()
    }

    try {
      const whatsapp = await WhatsappSettingsService.toView()
      return inertia.render(
        'settings/whatsapp',
        buildSettingsPageProps(user, 'whatsapp', { whatsapp })
      )
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/whatsapp', migrationRequiredProps(user, 'whatsapp'))
    }
  }

  async updateWhatsapp({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(whatsappSettingsValidator)

    try {
      await WhatsappSettingsService.save(
        {
          provider: payload.provider,
          apiKey: payload.apiKey ?? null,
          phoneNumberId: payload.phoneNumberId,
          businessAccountId: payload.businessAccountId ?? null,
          fromNumber: payload.fromNumber ?? null,
          enabled: parseCheckbox(request.input('enabled')),
        },
        user.id
      )

      session.flash('success', 'WhatsApp settings saved.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save WhatsApp settings.'
      session.flash('error', message)
    }

    return response.redirect().toRoute('settings.whatsapp')
  }

  async other({ auth, inertia, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'other')) {
      return response.forbidden()
    }

    try {
      const other = await SystemSettingsService.otherToView()
      return inertia.render('settings/other', buildSettingsPageProps(user, 'other', { other }))
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/other', migrationRequiredProps(user, 'other'))
    }
  }

  async updateOther({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(otherSettingsValidator)

    await SystemSettingsService.saveOther(
      {
        defaultInvoiceDueDays: payload.defaultInvoiceDueDays,
        auditRetentionDays: payload.auditRetentionDays,
      },
      user.id
    )

    session.flash('success', 'Other settings saved.')
    return response.redirect().toRoute('settings.other')
  }

  async security({ auth, inertia, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canAccessSettingsSection(user, 'security')) {
      return response.forbidden()
    }

    try {
      const security = await SecuritySettingsService.toView()
      const mfaSetup = session.get('mfa_setup') as
        | { qrDataUrl: string; manualKey: string }
        | undefined

      return inertia.render(
        'settings/security',
        buildSettingsPageProps(user, 'security', {
          security,
          mfa: {
            enabled: user.mfaEnabled,
            confirmedAt: user.mfaConfirmedAt?.toISO() ?? null,
            setup: mfaSetup ?? null,
          },
        })
      )
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      return inertia.render('settings/security', migrationRequiredProps(user, 'security'))
    }
  }

  async updateSecurity({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(securitySettingsValidator)
    const current = await SecuritySettingsService.toView()

    await SecuritySettingsService.save(
      {
        turnstileEnabled: parseCheckbox(request.input('turnstileEnabled')),
        turnstileSiteKey: payload.turnstileSiteKey ?? current.turnstileSiteKey,
        hasTurnstileSecret: current.hasTurnstileSecret,
        requireMfaForStaff: parseCheckbox(request.input('requireMfaForStaff')),
        loginMaxAttempts: payload.loginMaxAttempts,
        loginWindowMinutes: payload.loginWindowMinutes,
        turnstileSecret: payload.turnstileSecret ?? null,
      },
      user.id
    )

    session.flash('success', 'Security settings saved.')
    return response.redirect().toRoute('settings.security')
  }

  async startMfaSetup({ auth, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const { secret, otpauthUrl } = MfaService.generateSetup(user)
    const qrDataUrl = await MfaService.qrDataUrl(otpauthUrl)

    session.put('mfa_setup', {
      secret,
      qrDataUrl,
      manualKey: secret,
    })

    session.flash(
      'success',
      'Scan the QR code with your authenticator app, then enter a code to confirm.'
    )
    return response.redirect().toRoute('settings.security')
  }

  async confirmMfaSetup({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const setup = session.get('mfa_setup') as { secret: string } | undefined
    if (!setup?.secret) {
      session.flash('error', 'Start MFA setup again before confirming.')
      return response.redirect().toRoute('settings.security')
    }

    const { code } = await request.validateUsing(mfaVerifyValidator)
    const ok = await MfaService.enable(user, setup.secret, code)

    session.forget('mfa_setup')

    if (!ok) {
      session.flash('error', 'Invalid authentication code. MFA was not enabled.')
      return response.redirect().toRoute('settings.security')
    }

    session.flash('success', 'Two-factor authentication is now enabled for your account.')
    return response.redirect().toRoute('settings.security')
  }

  async disableMfa({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.isAdmin(user)) {
      return response.forbidden()
    }

    const payload = await request.validateUsing(mfaDisableValidator)

    try {
      await User.verifyCredentials(user.email, payload.password)
    } catch {
      session.flash('error', 'Password is incorrect.')
      return response.redirect().toRoute('settings.security')
    }

    const ok = await MfaService.disable(user, payload.code)
    if (!ok) {
      session.flash('error', 'Invalid authentication code. MFA was not disabled.')
      return response.redirect().toRoute('settings.security')
    }

    session.flash('success', 'Two-factor authentication has been disabled.')
    return response.redirect().toRoute('settings.security')
  }
}
