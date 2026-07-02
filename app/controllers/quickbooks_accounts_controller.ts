import QuickbooksAccount from '#models/quickbooks_account'
import AuthorizationService from '#services/authorization_service'
import QuickbooksCatalogSync from '#services/quickbooks/quickbooks_catalog_sync'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'
import type { HttpContext } from '@adonisjs/core/http'

function canViewCatalog(user: Parameters<typeof AuthorizationService.can>[0]) {
  return (
    AuthorizationService.can(user, 'invoices.view') ||
    AuthorizationService.can(user, 'invoices.manage')
  )
}

export default class QuickbooksAccountsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewCatalog(user)) {
      return response.forbidden()
    }

    const connection = await QuickbooksOauthService.getActiveConnection()
    const search = String(request.qs().search ?? '').trim()
    const accountType = String(request.qs().type ?? '').trim() || null

    let accounts: QuickbooksAccount[] = []
    let accountTypes: string[] = []

    if (connection) {
      QuickbooksCatalogSync.refreshIfStale()

      const query = QuickbooksAccount.query()
        .where('realm_id', connection.realmId)
        .where('active', true)
        .orderBy('fully_qualified_name', 'asc')

      if (search) {
        query.where((accountQuery) => {
          accountQuery
            .whereILike('name', `%${search}%`)
            .orWhereILike('fully_qualified_name', `%${search}%`)
        })
      }

      if (accountType) {
        query.where('account_type', accountType)
      }

      accounts = await query

      const typeRows = await QuickbooksAccount.query()
        .where('realm_id', connection.realmId)
        .where('active', true)
        .whereNotNull('account_type')
        .distinct('account_type')
        .orderBy('account_type', 'asc')
      accountTypes = typeRows
        .map((row) => row.accountType)
        .filter((value): value is string => Boolean(value))
    }

    const lastSyncedAt = connection ? await QuickbooksCatalogSync.lastSyncedAt('account') : null

    return inertia.render('quickbooks/accounts', {
      filters: { search, type: accountType },
      accountTypes,
      accounts: accounts.map((account) => ({
        id: account.id,
        quickbooksId: account.quickbooksId,
        name: account.name,
        fullyQualifiedName: account.fullyQualifiedName ?? account.name,
        accountType: account.accountType ?? '—',
        accountSubType: account.accountSubType ?? '—',
        classification: account.classification ?? '—',
        currency: account.currency,
        currentBalance: account.currentBalance !== null ? Number(account.currentBalance) : null,
      })),
      quickbooksConnected: Boolean(connection),
      canRefresh: AuthorizationService.can(user, 'invoices.manage'),
      lastSyncedAt: lastSyncedAt?.toFormat('dd LLL yyyy HH:mm') ?? null,
    })
  }

  async refresh({ auth, request, response, session }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!AuthorizationService.can(user, 'invoices.manage')) {
      return response.forbidden()
    }

    try {
      const result = await QuickbooksCatalogSync.refresh({
        full: request.input('full') === '1',
      })

      if (!result) {
        session.flash('error', 'QuickBooks is not connected.')
      } else {
        session.flash(
          'success',
          `Chart of accounts refreshed from QuickBooks (${result.accounts} change${result.accounts === 1 ? '' : 's'}).`
        )
      }
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'QuickBooks refresh failed.')
    }

    return response.redirect().back()
  }
}
