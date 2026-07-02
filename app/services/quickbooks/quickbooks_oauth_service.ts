import OAuthClient from 'intuit-oauth'
import QuickbooksConnection from '#models/quickbooks_connection'
import QuickbooksAppSettingsService from '#services/quickbooks/quickbooks_app_settings_service'
import QuickbooksDiscoveryService from '#services/quickbooks/quickbooks_discovery_service'
import {
  isQuickbooksReconnectRequired,
  QuickbooksReconnectRequiredError,
  QUICKBOOKS_RECONNECT_MESSAGE,
} from '#services/quickbooks/quickbooks_oauth_errors'
import QuickbooksTokenCipher from '#services/quickbooks/quickbooks_token_cipher'
import { DateTime } from 'luxon'

type OAuthTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
}

const OAUTH_RETRY_ATTEMPTS = 2
const OAUTH_RETRY_DELAY_MS = 400

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withOAuthRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown

  for (let attempt = 1; attempt <= OAUTH_RETRY_ATTEMPTS; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (isQuickbooksReconnectRequired(error) || attempt === OAUTH_RETRY_ATTEMPTS) {
        throw error
      }
      await sleep(OAUTH_RETRY_DELAY_MS)
    }
  }

  throw lastError
}

export default class QuickbooksOauthService {
  static async isConfigured() {
    return QuickbooksAppSettingsService.isConfigured()
  }

  static async createOAuthClient() {
    const config = await QuickbooksAppSettingsService.resolve()

    if (!config.clientId || !config.clientSecret) {
      throw new Error(
        'QuickBooks is not configured. Add API credentials in Settings before connecting.'
      )
    }

    const client = new OAuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      environment: config.environment,
      redirectUri: config.redirectUri,
    })

    await QuickbooksDiscoveryService.applyToClient(client, config.environment)
    return client
  }

  static async buildAuthorizeUrl(state: string) {
    const config = await QuickbooksAppSettingsService.resolve()
    const client = await this.createOAuthClient()
    return client.authorizeUri({
      scope: [config.scopes],
      state,
    })
  }

  static async invalidateConnection() {
    const connections = await QuickbooksConnection.all()
    for (const connection of connections) {
      await connection.delete()
    }
  }

  static async handleOAuthFailure(error: unknown) {
    if (!isQuickbooksReconnectRequired(error)) {
      return false
    }

    await this.invalidateConnection()
    return true
  }

  static async handleCallback(callbackUrl: string, realmId: string, userId: number) {
    const config = await QuickbooksAppSettingsService.resolve()
    const client = await this.createOAuthClient()

    let authResponse
    try {
      authResponse = await withOAuthRetry(() => client.createToken(callbackUrl))
    } catch (error) {
      if (await this.handleOAuthFailure(error)) {
        throw new QuickbooksReconnectRequiredError(undefined, { cause: error })
      }
      throw error
    }

    const token = authResponse.getJson() as OAuthTokenResponse

    if (!token.access_token || !token.refresh_token) {
      throw new Error('QuickBooks OAuth did not return tokens.')
    }

    const expiresAt = DateTime.now().plus({ seconds: token.expires_in ?? 3600 })

    const existing = await QuickbooksConnection.query().where('realm_id', realmId).first()

    const connection = existing ?? new QuickbooksConnection()
    if (!existing) {
      connection.realmId = realmId
    }

    connection.accessTokenEncrypted = QuickbooksTokenCipher.encrypt(token.access_token)
    connection.refreshTokenEncrypted = QuickbooksTokenCipher.encrypt(token.refresh_token)
    connection.accessTokenExpiresAt = expiresAt
    connection.environment = config.environment
    connection.connectedByUserId = userId
    connection.syncEnabled = true

    await connection.save()
    return connection
  }

  static async disconnect() {
    await this.invalidateConnection()
  }

  static async getConnection() {
    return QuickbooksConnection.query().orderBy('id', 'desc').first()
  }

  static async getActiveConnection() {
    return QuickbooksConnection.query().where('sync_enabled', true).orderBy('id', 'desc').first()
  }

  static async ensureFreshAccessToken(connection: QuickbooksConnection) {
    const expiresAt = connection.accessTokenExpiresAt
    const refreshThreshold = DateTime.now().plus({ minutes: 5 })

    if (expiresAt > refreshThreshold) {
      return QuickbooksTokenCipher.decrypt(connection.accessTokenEncrypted)
    }

    const client = await this.createOAuthClient()
    const refreshToken = QuickbooksTokenCipher.decrypt(connection.refreshTokenEncrypted)

    client.setToken({
      access_token: QuickbooksTokenCipher.decrypt(connection.accessTokenEncrypted),
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: Math.max(expiresAt.diff(DateTime.now(), 'seconds').seconds, 0),
      x_refresh_token_expires_in: 8726400,
    })

    try {
      const authResponse = await withOAuthRetry(() => client.refresh())
      const token = authResponse.getJson() as OAuthTokenResponse

      if (!token.access_token || !token.refresh_token) {
        throw new QuickbooksReconnectRequiredError()
      }

      connection.accessTokenEncrypted = QuickbooksTokenCipher.encrypt(token.access_token)
      connection.refreshTokenEncrypted = QuickbooksTokenCipher.encrypt(token.refresh_token)
      connection.accessTokenExpiresAt = DateTime.now().plus({ seconds: token.expires_in ?? 3600 })
      await connection.save()

      return token.access_token
    } catch (error) {
      if (await this.handleOAuthFailure(error)) {
        throw new QuickbooksReconnectRequiredError(undefined, { cause: error })
      }
      throw error
    }
  }

  static reconnectMessage() {
    return QUICKBOOKS_RECONNECT_MESSAGE
  }
}
