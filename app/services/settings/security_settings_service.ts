import SystemSetting from '#models/system_setting'
import SecretCipher from '#services/settings/secret_cipher'
import SystemSettingsService from '#services/settings/system_settings_service'

export type SecuritySettingsView = {
  turnstileEnabled: boolean
  turnstileSiteKey: string
  hasTurnstileSecret: boolean
  requireMfaForStaff: boolean
  loginMaxAttempts: number
  loginWindowMinutes: number
}

export type TurnstilePublicConfig = {
  enabled: boolean
  siteKey: string
}

const DEFAULTS: SecuritySettingsView = {
  turnstileEnabled: false,
  turnstileSiteKey: '',
  hasTurnstileSecret: false,
  requireMfaForStaff: false,
  loginMaxAttempts: 5,
  loginWindowMinutes: 15,
}

function parseBoolean(value: string | null | undefined, fallback: boolean) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  return value === '1' || value === 'true' || value === 'on'
}

function parseNumber(value: string | null | undefined, fallback: number) {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export default class SecuritySettingsService {
  static async toView(): Promise<SecuritySettingsView> {
    const map = await SystemSettingsService.getGroupMap('security')

    return {
      turnstileEnabled: parseBoolean(map.get('turnstile_enabled'), DEFAULTS.turnstileEnabled),
      turnstileSiteKey: map.get('turnstile_site_key') ?? DEFAULTS.turnstileSiteKey,
      hasTurnstileSecret: Boolean(map.get('turnstile_secret_key')),
      requireMfaForStaff: parseBoolean(
        map.get('require_mfa_for_staff'),
        DEFAULTS.requireMfaForStaff
      ),
      loginMaxAttempts: parseNumber(map.get('login_max_attempts'), DEFAULTS.loginMaxAttempts),
      loginWindowMinutes: parseNumber(map.get('login_window_minutes'), DEFAULTS.loginWindowMinutes),
    }
  }

  static async rateLimitSettings() {
    const view = await this.toView()
    return {
      maxAttempts: view.loginMaxAttempts,
      windowMinutes: view.loginWindowMinutes,
    }
  }

  static async turnstilePublicConfig(): Promise<TurnstilePublicConfig> {
    if (process.env.TURNSTILE_SKIP === 'true') {
      return { enabled: false, siteKey: '' }
    }

    const view = await this.toView()
    if (!view.turnstileEnabled || !view.turnstileSiteKey || !view.hasTurnstileSecret) {
      return { enabled: false, siteKey: '' }
    }

    return {
      enabled: true,
      siteKey: view.turnstileSiteKey,
    }
  }

  static async resolveTurnstileSecret() {
    const row = await SystemSetting.query()
      .where('group', 'security')
      .where('key', 'turnstile_secret_key')
      .first()

    if (!row?.value) {
      return null
    }

    return SecretCipher.decrypt(row.value)
  }

  static async save(
    input: SecuritySettingsView & { turnstileSecret?: string | null },
    userId: number
  ) {
    const values: Record<string, { value: string | boolean | number; isSecret?: boolean }> = {
      turnstile_enabled: { value: input.turnstileEnabled },
      turnstile_site_key: { value: input.turnstileSiteKey },
      require_mfa_for_staff: { value: input.requireMfaForStaff },
      login_max_attempts: { value: input.loginMaxAttempts },
      login_window_minutes: { value: input.loginWindowMinutes },
    }

    const secret = input.turnstileSecret?.trim()
    if (secret) {
      values.turnstile_secret_key = { value: secret, isSecret: true }
    }

    await SystemSettingsService.saveGroup('security', values, userId)
  }

  static async isMfaRequiredForStaff() {
    const view = await this.toView()
    return view.requireMfaForStaff
  }
}
