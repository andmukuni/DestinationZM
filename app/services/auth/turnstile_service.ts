import SecuritySettingsService from '#services/settings/security_settings_service'

type TurnstileVerifyResponse = {
  'success': boolean
  'error-codes'?: string[]
}

export default class TurnstileService {
  static async isRequired() {
    const config = await SecuritySettingsService.turnstilePublicConfig()
    return config.enabled
  }

  static async verify(token: string | undefined, remoteIp: string | null) {
    if (process.env.TURNSTILE_SKIP === 'true') {
      return true
    }

    const config = await SecuritySettingsService.turnstilePublicConfig()
    if (!config.enabled) {
      return true
    }

    if (!token?.trim()) {
      return false
    }

    const secret = await SecuritySettingsService.resolveTurnstileSecret()
    if (!secret) {
      return false
    }

    const body = new URLSearchParams({
      secret,
      response: token.trim(),
    })

    if (remoteIp) {
      body.set('remoteip', remoteIp)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!response.ok) {
      return false
    }

    const payload = (await response.json()) as TurnstileVerifyResponse
    return payload.success === true
  }

  static failureMessage() {
    return 'Captcha verification failed. Please try again.'
  }
}
