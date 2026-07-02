import { randomBytes } from 'node:crypto'
import QuickbooksSyncRecord from '#models/quickbooks_sync_record'
import QuickbooksAppSettingsService from '#services/quickbooks/quickbooks_app_settings_service'
import QuickbooksClient from '#services/quickbooks/quickbooks_client'
import QuickbooksConnectionTestService from '#services/quickbooks/quickbooks_connection_test_service'
import { QuickbooksReconnectRequiredError } from '#services/quickbooks/quickbooks_oauth_errors'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'
import {
  buildSettingsPageProps,
  canConfigureQuickbooksCredentials,
  type canManageQuickbooks,
  isMissingSettingsTable,
} from '#services/settings/settings_access'
import QuickbooksAccessService from '#services/quickbooks/quickbooks_access_service'
import SecuritySettingsService from '#services/settings/security_settings_service'
import {
  quickbooksCredentialsValidator,
  quickbooksSettingsValidator,
} from '#validators/quickbooks_validator'
import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'

export default class QuickbooksSettingsController {
  private async authorizeQuickbooks(
    user: User,
    session: HttpContext['session'],
    response: HttpContext['response']
  ) {
    try {
      QuickbooksAccessService.assertStaffQuickbooksAccess(user)
    } catch {
      return response.forbidden()
    }

    if ((await SecuritySettingsService.isMfaRequiredForStaff()) && !user.mfaEnabled) {
      session.flash(
        'error',
        'Enable two-factor authentication in Security settings before using QuickBooks.'
      )
      return response.redirect().toRoute('settings.security')
    }

    return null
  }

  async index({ auth, inertia, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    try {
      return await this.renderIndex(user, inertia)
    } catch (error) {
      if (!isMissingSettingsTable(error)) {
        throw error
      }

      const appUrl = process.env.APP_URL ?? 'http://localhost:3333'

      return inertia.render(
        'settings/quickbooks',
        buildSettingsPageProps(user, 'quickbooks', {
          migrationRequired: true,
          canEditCredentials: canConfigureQuickbooksCredentials(user),
          appSettings: {
            clientId: '',
            redirectUri: `${appUrl}/settings/quickbooks/callback`,
            environment: 'sandbox' as const,
            hasClientSecret: false,
            source: 'none' as const,
            configured: false,
          },
          configured: false,
          environment: 'sandbox',
          redirectUri: `${appUrl}/settings/quickbooks/callback`,
          connection: null,
          serviceItems: [],
          failedSyncs: [],
        })
      )
    }
  }

  private async renderIndex(
    user: Parameters<typeof canManageQuickbooks>[0],
    inertia: HttpContext['inertia']
  ) {
    const appSettings = await QuickbooksAppSettingsService.toView()
    const connection = await QuickbooksOauthService.getConnection()
    let serviceItems: Array<{ id: string; name: string }> = []

    if (connection) {
      try {
        const itemsResponse = await QuickbooksClient.listServiceItems(connection)
        const items = itemsResponse.QueryResponse?.Item ?? []
        serviceItems = items.map((item) => ({ id: item.Id, name: item.Name }))
      } catch {
        serviceItems = []
      }
    }

    const failedSyncs = await QuickbooksSyncRecord.query()
      .where('sync_status', 'failed')
      .orderBy('updated_at', 'desc')
      .limit(10)

    return inertia.render(
      'settings/quickbooks',
      buildSettingsPageProps(user, 'quickbooks', {
        canEditCredentials: canConfigureQuickbooksCredentials(user),
        appSettings,
        configured: appSettings.configured,
        environment: appSettings.environment,
        redirectUri: appSettings.redirectUri,
        connection: connection
          ? {
              companyName: connection.companyName,
              realmId: connection.realmId,
              environment: connection.environment,
              syncEnabled: connection.syncEnabled,
              defaultServiceItemId: connection.defaultServiceItemId,
              defaultServiceItemName: connection.defaultServiceItemName,
              defaultIncomeAccountId: connection.defaultIncomeAccountId,
              connectedAt: connection.createdAt.toISO()!,
            }
          : null,
        serviceItems,
        failedSyncs: failedSyncs.map((record) => ({
          id: record.id,
          entityType: record.entityType,
          localId: record.localId,
          lastError: record.lastError,
          lastIntuitTid: record.lastIntuitTid,
          attemptCount: record.attemptCount,
          updatedAt: record.updatedAt?.toISO() ?? null,
        })),
      })
    )
  }

  async updateCredentials({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canConfigureQuickbooksCredentials(user)) {
      return response.forbidden()
    }
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    const payload = await request.validateUsing(quickbooksCredentialsValidator)

    try {
      await QuickbooksAppSettingsService.save(
        {
          clientId: payload.clientId,
          clientSecret: payload.clientSecret ?? null,
          redirectUri: payload.redirectUri,
          environment: payload.environment,
        },
        user.id
      )

      session.flash('success', 'QuickBooks API credentials saved.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save QuickBooks credentials.'
      session.flash('error', message)
    }

    return response.redirect().toRoute('settings.quickbooks')
  }

  async testConnection({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    const result = await QuickbooksConnectionTestService.run()

    if (request.accepts(['json'])) {
      return response.status(result.ok ? 200 : 422).json(result)
    }

    session.flash(result.ok ? 'success' : 'error', result.message)
    return response.redirect().toRoute('settings.quickbooks')
  }

  async connect({ auth, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    if (!(await QuickbooksOauthService.isConfigured())) {
      session.flash('error', 'Save QuickBooks API credentials in Settings before connecting.')
      return response.redirect().toRoute('settings.quickbooks')
    }

    const state = randomBytes(16).toString('hex')
    session.put('quickbooks_oauth_state', state)

    const authorizeUrl = await QuickbooksOauthService.buildAuthorizeUrl(state)
    return response.redirect(authorizeUrl)
  }

  async callback({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    const expectedState = session.get('quickbooks_oauth_state')
    const state = request.input('state')
    const realmId = request.input('realmId')
    const code = request.input('code')
    const error = request.input('error')

    session.forget('quickbooks_oauth_state')

    if (error) {
      session.flash(
        'error',
        `QuickBooks connection was cancelled: ${error}. Click Connect QuickBooks to try again.`
      )
      return response.redirect().toRoute('settings.quickbooks')
    }

    if (!expectedState || !state || expectedState !== state) {
      session.flash(
        'error',
        'QuickBooks OAuth state mismatch (CSRF protection). Please click Connect QuickBooks and try again.'
      )
      return response.redirect().toRoute('settings.quickbooks')
    }

    if (!code || !realmId) {
      session.flash(
        'error',
        'QuickBooks did not return an authorization code. Click Connect QuickBooks to try again.'
      )
      return response.redirect().toRoute('settings.quickbooks')
    }

    try {
      const callbackUrl = request.url(true)
      const connection = await QuickbooksOauthService.handleCallback(callbackUrl, realmId, user.id)
      const companyName = await QuickbooksClient.getCompanyInfo(connection)
      if (companyName) {
        connection.companyName = companyName
        await connection.save()
      }

      session.flash('success', 'QuickBooks connected successfully.')
    } catch (callbackError) {
      const message =
        callbackError instanceof QuickbooksReconnectRequiredError
          ? callbackError.message
          : callbackError instanceof Error
            ? callbackError.message
            : 'QuickBooks connection failed.'
      session.flash('error', message)
    }

    return response.redirect().toRoute('settings.quickbooks')
  }

  async disconnect({ auth, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    await QuickbooksOauthService.disconnect()
    session.flash('success', 'QuickBooks disconnected.')
    return response.redirect().toRoute('settings.quickbooks')
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    const denied = await this.authorizeQuickbooks(user, session, response)
    if (denied) {
      return denied
    }

    const connection = await QuickbooksOauthService.getConnection()
    if (!connection) {
      session.flash('error', 'Connect QuickBooks before updating sync settings.')
      return response.redirect().toRoute('settings.quickbooks')
    }

    const payload = await request.validateUsing(quickbooksSettingsValidator)
    const rawSyncEnabled = request.input('syncEnabled')

    if (payload.defaultServiceItemId !== undefined) {
      connection.defaultServiceItemId = payload.defaultServiceItemId || null

      if (connection.defaultServiceItemId) {
        try {
          const itemsResponse = await QuickbooksClient.listServiceItems(connection)
          const items = itemsResponse.QueryResponse?.Item ?? []
          const match = items.find((item) => item.Id === connection.defaultServiceItemId)
          connection.defaultServiceItemName = match?.Name ?? payload.defaultServiceItemName ?? null
        } catch {
          connection.defaultServiceItemName = payload.defaultServiceItemName ?? null
        }
      } else {
        connection.defaultServiceItemName = null
      }
    } else if (payload.defaultServiceItemName !== undefined) {
      connection.defaultServiceItemName = payload.defaultServiceItemName || null
    }

    if (payload.defaultIncomeAccountId !== undefined) {
      connection.defaultIncomeAccountId = payload.defaultIncomeAccountId || null
    }

    connection.syncEnabled =
      rawSyncEnabled === '1' || rawSyncEnabled === true || rawSyncEnabled === 'on'

    await connection.save()
    session.flash('success', 'QuickBooks sync settings updated.')
    return response.redirect().toRoute('settings.quickbooks')
  }
}
