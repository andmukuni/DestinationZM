import env from '#start/env'
import SmsSetting, { type SmsProvider } from '#models/sms_setting'
import SecretCipher from '#services/settings/secret_cipher'

export type SmsSettingsView = {
  provider: SmsProvider
  accountSid: string
  fromNumber: string
  hasAuthToken: boolean
  enabled: boolean
  configured: boolean
  source: 'database' | 'environment' | 'none'
}

function envFallback(): { provider: SmsProvider; accountSid: string; authToken: string; fromNumber: string } | null {
  const accountSid = env.get('SMS_ACCOUNT_SID')
  const authToken = env.get('SMS_AUTH_TOKEN')

  if (!accountSid || !authToken) {
    return null
  }

  return {
    provider: (env.get('SMS_PROVIDER') ?? 'twilio') as SmsProvider,
    accountSid,
    authToken,
    fromNumber: env.get('SMS_FROM_NUMBER') ?? '',
  }
}

export default class SmsSettingsService {
  static async getRecord() {
    return SmsSetting.query().orderBy('id', 'asc').first()
  }

  static async toView(): Promise<SmsSettingsView> {
    const record = await this.getRecord()
    const fallback = envFallback()

    if (record) {
      return {
        provider: record.provider,
        accountSid: record.accountSid ?? '',
        fromNumber: record.fromNumber ?? '',
        hasAuthToken: Boolean(record.authTokenEncrypted),
        enabled: record.enabled,
        configured: Boolean(record.accountSid && record.authTokenEncrypted && record.fromNumber),
        source: record.authTokenEncrypted ? 'database' : 'none',
      }
    }

    if (fallback) {
      return {
        provider: fallback.provider,
        accountSid: fallback.accountSid,
        fromNumber: fallback.fromNumber,
        hasAuthToken: true,
        enabled: true,
        configured: true,
        source: 'environment',
      }
    }

    return {
      provider: 'twilio',
      accountSid: '',
      fromNumber: '',
      hasAuthToken: false,
      enabled: false,
      configured: false,
      source: 'none',
    }
  }

  static async save(
    input: {
      provider: SmsProvider
      accountSid: string
      authToken?: string | null
      fromNumber: string
      enabled: boolean
    },
    userId: number
  ) {
    let record = await this.getRecord()

    if (!record) {
      record = new SmsSetting()
    }

    record.provider = input.provider
    record.accountSid = input.accountSid.trim()
    record.fromNumber = input.fromNumber.trim()
    record.enabled = input.enabled
    record.updatedByUserId = userId

    const token = input.authToken?.trim()
    if (token) {
      record.authTokenEncrypted = SecretCipher.encrypt(token)
    } else if (!record.authTokenEncrypted) {
      throw new Error('SMS auth token is required when saving for the first time.')
    }

    await record.save()
    return record
  }
}
