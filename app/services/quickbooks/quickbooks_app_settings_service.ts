import env from '#start/env'
import quickbooksConfig, { type QuickbooksEnvironment } from '#config/quickbooks'
import QuickbooksAppSetting from '#models/quickbooks_app_setting'
import QuickbooksTokenCipher from '#services/quickbooks/quickbooks_token_cipher'

export type ResolvedQuickbooksAppConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  environment: QuickbooksEnvironment
  scopes: string
  apiBaseUrl: string
  source: 'database' | 'environment' | 'none'
}

export type QuickbooksAppSettingsView = {
  clientId: string
  redirectUri: string
  environment: QuickbooksEnvironment
  hasClientSecret: boolean
  source: 'database' | 'environment' | 'none'
  configured: boolean
}

function apiBaseUrlFor(environment: QuickbooksEnvironment) {
  return environment === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com'
}

function envFallbackConfig(): ResolvedQuickbooksAppConfig | null {
  const clientId = env.get('QUICKBOOKS_CLIENT_ID') ?? ''
  const clientSecret = env.get('QUICKBOOKS_CLIENT_SECRET') ?? ''

  if (!clientId || !clientSecret) {
    return null
  }

  const environment = (env.get('QUICKBOOKS_ENVIRONMENT') ?? 'sandbox') as QuickbooksEnvironment

  return {
    clientId,
    clientSecret,
    redirectUri:
      env.get('QUICKBOOKS_REDIRECT_URI') ?? `${env.get('APP_URL')}/settings/quickbooks/callback`,
    environment,
    scopes: env.get('QUICKBOOKS_SCOPES') ?? 'com.intuit.quickbooks.accounting',
    apiBaseUrl: apiBaseUrlFor(environment),
    source: 'environment',
  }
}

export default class QuickbooksAppSettingsService {
  static async getRecord() {
    return QuickbooksAppSetting.query().orderBy('id', 'asc').first()
  }

  static async resolve(): Promise<ResolvedQuickbooksAppConfig> {
    const record = await this.getRecord()

    if (record?.clientId && record.clientSecretEncrypted) {
      return {
        clientId: record.clientId,
        clientSecret: QuickbooksTokenCipher.decrypt(record.clientSecretEncrypted),
        redirectUri: record.redirectUri ?? `${env.get('APP_URL')}/settings/quickbooks/callback`,
        environment: record.environment,
        scopes: record.scopes,
        apiBaseUrl: apiBaseUrlFor(record.environment),
        source: 'database',
      }
    }

    const fallback = envFallbackConfig()
    if (fallback) {
      return fallback
    }

    const environment = record?.environment ?? 'sandbox'

    return {
      clientId: record?.clientId ?? '',
      clientSecret: '',
      redirectUri: record?.redirectUri ?? `${env.get('APP_URL')}/settings/quickbooks/callback`,
      environment,
      scopes: record?.scopes ?? quickbooksConfig.scopes,
      apiBaseUrl: apiBaseUrlFor(environment),
      source: 'none',
    }
  }

  static async isConfigured() {
    const config = await this.resolve()
    return Boolean(config.clientId && config.clientSecret)
  }

  static async toView(): Promise<QuickbooksAppSettingsView> {
    const record = await this.getRecord()
    const resolved = await this.resolve()
    const envFallback = envFallbackConfig()

    if (record?.clientId) {
      return {
        clientId: record.clientId,
        redirectUri: record.redirectUri ?? resolved.redirectUri,
        environment: record.environment,
        hasClientSecret: Boolean(record.clientSecretEncrypted),
        source: record.clientSecretEncrypted ? 'database' : 'none',
        configured: Boolean(record.clientId && record.clientSecretEncrypted),
      }
    }

    if (envFallback) {
      return {
        clientId: envFallback.clientId,
        redirectUri: envFallback.redirectUri,
        environment: envFallback.environment,
        hasClientSecret: true,
        source: 'environment',
        configured: true,
      }
    }

    return {
      clientId: '',
      redirectUri: resolved.redirectUri,
      environment: resolved.environment,
      hasClientSecret: false,
      source: 'none',
      configured: false,
    }
  }

  static async save(
    input: {
      clientId: string
      clientSecret?: string | null
      redirectUri: string
      environment: QuickbooksEnvironment
    },
    userId: number
  ) {
    let record = await this.getRecord()

    if (!record) {
      record = new QuickbooksAppSetting()
    }

    record.clientId = input.clientId.trim()
    record.redirectUri = input.redirectUri.trim()
    record.environment = input.environment
    record.scopes = quickbooksConfig.scopes
    record.updatedByUserId = userId

    const secret = input.clientSecret?.trim()
    if (secret) {
      record.clientSecretEncrypted = QuickbooksTokenCipher.encrypt(secret)
    } else if (!record.clientSecretEncrypted) {
      throw new Error(
        'Client secret is required when saving QuickBooks credentials for the first time.'
      )
    }

    await record.save()
    return record
  }
}
