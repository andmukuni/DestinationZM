import env from '#start/env'
import SmtpSetting from '#models/smtp_setting'
import SecretCipher from '#services/settings/secret_cipher'

export type ResolvedSmtpConfig = {
  host: string
  port: number
  secure: boolean
  username: string | null
  password: string | null
  fromAddress: string
  fromName: string | null
  enabled: boolean
  source: 'database' | 'environment' | 'none'
}

export type SmtpSettingsView = {
  host: string
  port: number
  secure: boolean
  username: string
  hasPassword: boolean
  fromAddress: string
  fromName: string
  enabled: boolean
  configured: boolean
  source: 'database' | 'environment' | 'none'
}

function envFallback(): ResolvedSmtpConfig | null {
  const host = env.get('SMTP_HOST')
  if (!host) {
    return null
  }

  return {
    host,
    port: env.get('SMTP_PORT') ?? 587,
    secure: env.get('SMTP_SECURE') ?? false,
    username: env.get('SMTP_USER') ?? null,
    password: env.get('SMTP_PASSWORD') ?? null,
    fromAddress: env.get('MAIL_FROM') ?? 'noreply@destinationzm.local',
    fromName: env.get('MAIL_FROM_NAME') ?? null,
    enabled: true,
    source: 'environment',
  }
}

export default class SmtpSettingsService {
  static async getRecord() {
    return SmtpSetting.query().orderBy('id', 'asc').first()
  }

  static async resolve(): Promise<ResolvedSmtpConfig> {
    const record = await this.getRecord()

    if (record?.host) {
      return {
        host: record.host,
        port: record.port,
        secure: record.secure,
        username: record.username,
        password: record.passwordEncrypted ? SecretCipher.decrypt(record.passwordEncrypted) : null,
        fromAddress: record.fromAddress ?? 'noreply@destinationzm.local',
        fromName: record.fromName,
        enabled: record.enabled,
        source: 'database',
      }
    }

    const fallback = envFallback()
    if (fallback) {
      return fallback
    }

    return {
      host: '127.0.0.1',
      port: 1025,
      secure: false,
      username: null,
      password: null,
      fromAddress: 'noreply@destinationzm.local',
      fromName: null,
      enabled: false,
      source: 'none',
    }
  }

  static async toView(): Promise<SmtpSettingsView> {
    const record = await this.getRecord()
    const resolved = await this.resolve()
    const fallback = envFallback()

    if (record?.host) {
      return {
        host: record.host,
        port: record.port,
        secure: record.secure,
        username: record.username ?? '',
        hasPassword: Boolean(record.passwordEncrypted),
        fromAddress: record.fromAddress ?? '',
        fromName: record.fromName ?? '',
        enabled: record.enabled,
        configured: Boolean(record.host && record.fromAddress),
        source: 'database',
      }
    }

    if (fallback) {
      return {
        host: fallback.host,
        port: fallback.port,
        secure: fallback.secure,
        username: fallback.username ?? '',
        hasPassword: Boolean(fallback.password),
        fromAddress: fallback.fromAddress,
        fromName: fallback.fromName ?? '',
        enabled: fallback.enabled,
        configured: true,
        source: 'environment',
      }
    }

    return {
      host: resolved.host,
      port: resolved.port,
      secure: resolved.secure,
      username: '',
      hasPassword: false,
      fromAddress: resolved.fromAddress,
      fromName: '',
      enabled: false,
      configured: false,
      source: 'none',
    }
  }

  static async save(
    input: {
      host: string
      port: number
      secure: boolean
      username?: string | null
      password?: string | null
      fromAddress: string
      fromName?: string | null
      enabled: boolean
    },
    userId: number
  ) {
    let record = await this.getRecord()

    if (!record) {
      record = new SmtpSetting()
    }

    record.host = input.host.trim()
    record.port = input.port
    record.secure = input.secure
    record.username = input.username?.trim() || null
    record.fromAddress = input.fromAddress.trim()
    record.fromName = input.fromName?.trim() || null
    record.enabled = input.enabled
    record.updatedByUserId = userId

    const password = input.password?.trim()
    if (password) {
      record.passwordEncrypted = SecretCipher.encrypt(password)
    } else if (!record.passwordEncrypted && input.username) {
      throw new Error('SMTP password is required when saving credentials for the first time.')
    }

    await record.save()
    return record
  }
}
