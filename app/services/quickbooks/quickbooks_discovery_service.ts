import type OAuthClient from 'intuit-oauth'
import type { QuickbooksEnvironment } from '#models/quickbooks_connection'

type DiscoveryDocument = {
  authorization_endpoint: string
  token_endpoint: string
  revocation_endpoint?: string
  userinfo_endpoint?: string
}

const DISCOVERY_URLS: Record<QuickbooksEnvironment, string> = {
  sandbox: 'https://developer.api.intuit.com/.well-known/openid_sandbox_configuration',
  production: 'https://developer.api.intuit.com/.well-known/openid_configuration',
}

const CACHE_TTL_MS = 60 * 60 * 1000

const cache = new Map<QuickbooksEnvironment, { doc: DiscoveryDocument; expiresAt: number }>()

export default class QuickbooksDiscoveryService {
  static async get(environment: QuickbooksEnvironment): Promise<DiscoveryDocument> {
    const cached = cache.get(environment)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.doc
    }

    const response = await fetch(DISCOVERY_URLS[environment], {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`QuickBooks discovery document request failed (${response.status}).`)
    }

    const doc = (await response.json()) as DiscoveryDocument

    if (!doc.authorization_endpoint || !doc.token_endpoint) {
      throw new Error('QuickBooks discovery document is missing required OAuth endpoints.')
    }

    cache.set(environment, { doc, expiresAt: Date.now() + CACHE_TTL_MS })
    return doc
  }

  static async applyToClient(client: OAuthClient, environment: QuickbooksEnvironment) {
    const doc = await this.get(environment)
    const userInfoEndpoint =
      doc.userinfo_endpoint ??
      (environment === 'production'
        ? 'https://accounts.platform.intuit.com/v1/openid_connect/userinfo'
        : 'https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo')

    const oauthClient = client as OAuthClient & {
      setAuthorizeURLs: (params: {
        authorizeEndpoint: string
        tokenEndpoint: string
        revokeEndpoint: string
        userInfoEndpoint: string
      }) => OAuthClient
    }

    oauthClient.setAuthorizeURLs({
      authorizeEndpoint: doc.authorization_endpoint,
      tokenEndpoint: doc.token_endpoint,
      revokeEndpoint:
        doc.revocation_endpoint ?? 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
      userInfoEndpoint,
    })
  }
}
