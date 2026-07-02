import QuickbooksAppSettingsService from '#services/quickbooks/quickbooks_app_settings_service'
import QuickbooksClient from '#services/quickbooks/quickbooks_client'
import {
  QuickbooksReconnectRequiredError,
  QUICKBOOKS_RECONNECT_MESSAGE,
} from '#services/quickbooks/quickbooks_oauth_errors'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'

export type QuickbooksConnectionTestResult = {
  ok: boolean
  stage: 'credentials' | 'oauth' | 'api'
  message: string
  reconnectRequired?: boolean
  details?: {
    environment?: string
    companyName?: string | null
    realmId?: string
    serviceItemCount?: number
    apiBaseUrl?: string
    redirectUri?: string
  }
}

export default class QuickbooksConnectionTestService {
  static async run(): Promise<QuickbooksConnectionTestResult> {
    const configured = await QuickbooksAppSettingsService.isConfigured()
    if (!configured) {
      return {
        ok: false,
        stage: 'credentials',
        message: 'Save QuickBooks API credentials before testing the connection.',
      }
    }

    const appConfig = await QuickbooksAppSettingsService.resolve()

    try {
      await QuickbooksOauthService.createOAuthClient()
    } catch (error) {
      return {
        ok: false,
        stage: 'oauth',
        message: error instanceof Error ? error.message : 'QuickBooks OAuth client could not be created.',
        details: {
          environment: appConfig.environment,
          apiBaseUrl: appConfig.apiBaseUrl,
          redirectUri: appConfig.redirectUri,
        },
      }
    }

    const connection = await QuickbooksOauthService.getConnection()
    if (!connection) {
      return {
        ok: true,
        stage: 'credentials',
        message:
          'OAuth credentials look valid. Connect your QuickBooks company to test live API access.',
        details: {
          environment: appConfig.environment,
          apiBaseUrl: appConfig.apiBaseUrl,
          redirectUri: appConfig.redirectUri,
        },
      }
    }

    try {
      const companyName = await QuickbooksClient.getCompanyInfo(connection)
      const itemsResponse = await QuickbooksClient.listServiceItems(connection)
      const serviceItemCount = itemsResponse.QueryResponse?.Item?.length ?? 0

      return {
        ok: true,
        stage: 'api',
        message: companyName
          ? `API connection successful — ${companyName}.`
          : 'API connection successful.',
        details: {
          environment: connection.environment,
          companyName,
          realmId: connection.realmId,
          serviceItemCount,
          apiBaseUrl: appConfig.apiBaseUrl,
        },
      }
    } catch (error) {
      if (error instanceof QuickbooksReconnectRequiredError) {
        return {
          ok: false,
          stage: 'oauth',
          reconnectRequired: true,
          message: QUICKBOOKS_RECONNECT_MESSAGE,
          details: {
            environment: connection.environment,
            realmId: connection.realmId,
            apiBaseUrl: appConfig.apiBaseUrl,
          },
        }
      }

      return {
        ok: false,
        stage: 'api',
        message: error instanceof Error ? error.message : 'QuickBooks API connection test failed.',
        details: {
          environment: connection.environment,
          realmId: connection.realmId,
          apiBaseUrl: appConfig.apiBaseUrl,
        },
      }
    }
  }
}
