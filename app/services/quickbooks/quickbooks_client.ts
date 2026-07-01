import quickbooksConfig from '#config/quickbooks'
import type QuickbooksConnection from '#models/quickbooks_connection'
import QuickbooksAppSettingsService from '#services/quickbooks/quickbooks_app_settings_service'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'

type QuickbooksRequestOptions = {
  connection: QuickbooksConnection
  method: 'GET' | 'POST'
  path: string
  body?: unknown
  query?: Record<string, string>
}

export type QuickbooksQueryResponse<T> = {
  QueryResponse?: T
  Invoice?: { Id: string; DocNumber?: string }
  Customer?: { Id: string; DisplayName?: string }
  Payment?: { Id: string }
  Fault?: {
    Error?: Array<{ Message?: string; Detail?: string; code?: string }>
  }
}

export default class QuickbooksClient {
  static async request<T = QuickbooksQueryResponse<unknown>>(options: QuickbooksRequestOptions) {
    const accessToken = await QuickbooksOauthService.ensureFreshAccessToken(options.connection)
    const appConfig = await QuickbooksAppSettingsService.resolve()
    const url = new URL(
      `${appConfig.apiBaseUrl}/v3/company/${options.connection.realmId}/${options.path.replace(/^\//, '')}`
    )

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        url.searchParams.set(key, value)
      }
    }

    url.searchParams.set('minorversion', quickbooksConfig.minorVersion)

    const response = await fetch(url, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const text = await response.text()
    let payload: T | null = null

    if (text) {
      try {
        payload = JSON.parse(text) as T
      } catch {
        throw new Error(`QuickBooks returned invalid JSON (${response.status}).`)
      }
    }

    if (!response.ok) {
      const fault = (payload as QuickbooksQueryResponse<unknown> | null)?.Fault
      const message =
        fault?.Error?.map((error) => error.Message || error.Detail).filter(Boolean).join('; ') ||
        text ||
        `QuickBooks request failed (${response.status}).`
      throw new Error(message)
    }

    return payload as T
  }

  static query<T>(connection: QuickbooksConnection, sql: string) {
    return this.request<QuickbooksQueryResponse<T>>({
      connection,
      method: 'GET',
      path: 'query',
      query: { query: sql, minorversion: quickbooksConfig.minorVersion },
    })
  }

  static createInvoice(connection: QuickbooksConnection, body: unknown) {
    return this.request<QuickbooksQueryResponse<unknown>>({
      connection,
      method: 'POST',
      path: 'invoice',
      body,
    })
  }

  static createCustomer(connection: QuickbooksConnection, body: unknown) {
    return this.request<QuickbooksQueryResponse<unknown>>({
      connection,
      method: 'POST',
      path: 'customer',
      body,
    })
  }

  static createPayment(connection: QuickbooksConnection, body: unknown) {
    return this.request<QuickbooksQueryResponse<unknown>>({
      connection,
      method: 'POST',
      path: 'payment',
      body,
    })
  }

  static listServiceItems(connection: QuickbooksConnection) {
    return this.query<{ Item?: Array<{ Id: string; Name: string; Type?: string }> }>(
      connection,
      "select Id, Name, Type from Item where Type = 'Service' maxresults 100"
    )
  }

  static async getCompanyInfo(connection: QuickbooksConnection) {
    const response = await this.request<{
      CompanyInfo?: { CompanyName?: string; LegalName?: string }
    }>({
      connection,
      method: 'GET',
      path: 'companyinfo/' + connection.realmId,
    })

    return response.CompanyInfo?.CompanyName ?? response.CompanyInfo?.LegalName ?? null
  }
}
