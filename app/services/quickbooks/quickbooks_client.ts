import quickbooksConfig from '#config/quickbooks'
import type QuickbooksConnection from '#models/quickbooks_connection'
import QuickbooksAppSettingsService from '#services/quickbooks/quickbooks_app_settings_service'
import {
  QuickbooksApiError,
  readIntuitTid,
} from '#services/quickbooks/quickbooks_api_error'
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
    Error?: Array<{ Message?: string; Detail?: string; code?: string; element?: string }>
  }
}

export type QuickbooksRequestResult<T> = {
  data: T
  intuitTid: string | null
}

export default class QuickbooksClient {
  static async request<T = QuickbooksQueryResponse<unknown>>(
    options: QuickbooksRequestOptions
  ): Promise<QuickbooksRequestResult<T>> {
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

    const intuitTid = readIntuitTid(response.headers)
    const text = await response.text()
    let payload: T | null = null

    if (text) {
      try {
        payload = JSON.parse(text) as T
      } catch {
        throw new QuickbooksApiError(`QuickBooks returned invalid JSON (${response.status}).`, {
          status: response.status,
          intuitTid,
        })
      }
    }

    if (!response.ok) {
      const fault = (payload as QuickbooksQueryResponse<unknown> | null)?.Fault
      const message =
        fault?.Error?.map((error) =>
          [error.element, error.Message, error.Detail, error.code ? `(${error.code})` : null]
            .filter(Boolean)
            .join(': ')
        )
          .filter(Boolean)
          .join('; ') ||
        text ||
        `QuickBooks request failed (${response.status}).`
      throw new QuickbooksApiError(message, {
        status: response.status,
        intuitTid,
        fault,
      })
    }

    return {
      data: payload as T,
      intuitTid,
    }
  }

  static async query<T>(connection: QuickbooksConnection, sql: string) {
    const result = await this.request<QuickbooksQueryResponse<T>>({
      connection,
      method: 'GET',
      path: 'query',
      query: { query: sql, minorversion: quickbooksConfig.minorVersion },
    })
    return result.data
  }

  static async createInvoice(connection: QuickbooksConnection, body: unknown) {
    const result = await this.request<QuickbooksQueryResponse<unknown>>({
      connection,
      method: 'POST',
      path: 'invoice',
      body,
    })
    return result.data
  }

  static async createCustomer(connection: QuickbooksConnection, body: unknown) {
    const result = await this.request<QuickbooksQueryResponse<unknown>>({
      connection,
      method: 'POST',
      path: 'customer',
      body,
    })
    return result.data
  }

  static async createPayment(connection: QuickbooksConnection, body: unknown) {
    const result = await this.request<QuickbooksQueryResponse<unknown>>({
      connection,
      method: 'POST',
      path: 'payment',
      body,
    })
    return result.data
  }

  static listServiceItems(connection: QuickbooksConnection) {
    return this.query<{ Item?: Array<{ Id: string; Name: string; Type?: string }> }>(
      connection,
      "select Id, Name, Type from Item where Type = 'Service' maxresults 100"
    )
  }

  static async getDefaultTaxCodeId(connection: QuickbooksConnection) {
    const response = await this.query<{ TaxCode?: Array<{ Id: string; Name?: string }> }>(
      connection,
      'select Id, Name from TaxCode maxresults 20'
    )

    const taxCodes = response.QueryResponse?.TaxCode ?? []
    if (taxCodes.length === 0) {
      throw new Error(
        'QuickBooks has no tax codes configured. Add a tax code in QuickBooks before syncing invoices.'
      )
    }

    const preferredNames = ['non', 'no vat', 'exempt', 'zero rated', 'zero-rated', 'out of scope']
    const preferred = taxCodes.find((taxCode) => {
      const name = (taxCode.Name ?? '').trim().toLowerCase()
      return preferredNames.some((candidate) => name.includes(candidate))
    })

    return preferred?.Id ?? taxCodes[0]!.Id
  }

  static async getCurrencyPreferences(connection: QuickbooksConnection) {
    const result = await this.request<{
      Preferences?: {
        CurrencyPrefs?: {
          MultiCurrencyEnabled?: boolean
          HomeCurrency?: { value?: string }
        }
      }
    }>({
      connection,
      method: 'GET',
      path: 'preferences',
    })

    const prefs = result.data.Preferences?.CurrencyPrefs

    return {
      multiCurrencyEnabled: Boolean(prefs?.MultiCurrencyEnabled),
      homeCurrency: prefs?.HomeCurrency?.value?.toUpperCase() ?? 'USD',
    }
  }

  static async getCompanyInfo(connection: QuickbooksConnection) {
    const result = await this.request<{
      CompanyInfo?: { CompanyName?: string; LegalName?: string }
    }>({
      connection,
      method: 'GET',
      path: 'companyinfo/' + connection.realmId,
    })

    return (
      result.data.CompanyInfo?.CompanyName ?? result.data.CompanyInfo?.LegalName ?? null
    )
  }
}
