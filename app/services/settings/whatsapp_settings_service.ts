import env from '#start/env'
import WhatsappSetting, { type WhatsappProvider } from '#models/whatsapp_setting'
import SecretCipher from '#services/settings/secret_cipher'

export type WhatsappSettingsView = {
  provider: WhatsappProvider
  phoneNumberId: string
  businessAccountId: string
  fromNumber: string
  hasApiKey: boolean
  enabled: boolean
  configured: boolean
  source: 'database' | 'environment' | 'none'
}

function envFallback(): {
  provider: WhatsappProvider
  apiKey: string
  phoneNumberId: string
  businessAccountId: string
  fromNumber: string
} | null {
  const apiKey = env.get('WHATSAPP_API_KEY')
  if (!apiKey) {
    return null
  }

  return {
    provider: (env.get('WHATSAPP_PROVIDER') ?? 'meta') as WhatsappProvider,
    apiKey,
    phoneNumberId: env.get('WHATSAPP_PHONE_NUMBER_ID') ?? '',
    businessAccountId: env.get('WHATSAPP_BUSINESS_ACCOUNT_ID') ?? '',
    fromNumber: env.get('WHATSAPP_FROM_NUMBER') ?? '',
  }
}

export default class WhatsappSettingsService {
  static async getRecord() {
    return WhatsappSetting.query().orderBy('id', 'asc').first()
  }

  static async toView(): Promise<WhatsappSettingsView> {
    const record = await this.getRecord()
    const fallback = envFallback()

    if (record) {
      return {
        provider: record.provider,
        phoneNumberId: record.phoneNumberId ?? '',
        businessAccountId: record.businessAccountId ?? '',
        fromNumber: record.fromNumber ?? '',
        hasApiKey: Boolean(record.apiKeyEncrypted),
        enabled: record.enabled,
        configured: Boolean(record.apiKeyEncrypted && record.phoneNumberId),
        source: record.apiKeyEncrypted ? 'database' : 'none',
      }
    }

    if (fallback) {
      return {
        provider: fallback.provider,
        phoneNumberId: fallback.phoneNumberId,
        businessAccountId: fallback.businessAccountId,
        fromNumber: fallback.fromNumber,
        hasApiKey: true,
        enabled: true,
        configured: true,
        source: 'environment',
      }
    }

    return {
      provider: 'meta',
      phoneNumberId: '',
      businessAccountId: '',
      fromNumber: '',
      hasApiKey: false,
      enabled: false,
      configured: false,
      source: 'none',
    }
  }

  static async save(
    input: {
      provider: WhatsappProvider
      apiKey?: string | null
      phoneNumberId: string
      businessAccountId?: string | null
      fromNumber?: string | null
      enabled: boolean
    },
    userId: number
  ) {
    let record = await this.getRecord()

    if (!record) {
      record = new WhatsappSetting()
    }

    record.provider = input.provider
    record.phoneNumberId = input.phoneNumberId.trim()
    record.businessAccountId = input.businessAccountId?.trim() || null
    record.fromNumber = input.fromNumber?.trim() || null
    record.enabled = input.enabled
    record.updatedByUserId = userId

    const apiKey = input.apiKey?.trim()
    if (apiKey) {
      record.apiKeyEncrypted = SecretCipher.encrypt(apiKey)
    } else if (!record.apiKeyEncrypted) {
      throw new Error('WhatsApp API key is required when saving for the first time.')
    }

    await record.save()
    return record
  }
}
