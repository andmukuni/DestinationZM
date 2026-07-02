import QuickbooksItem from '#models/quickbooks_item'
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

export default class QuickbooksItemsController {
  async index({ auth, inertia, request, response }: HttpContext) {
    const user = auth.use('web').getUserOrFail()
    if (!canViewCatalog(user)) {
      return response.forbidden()
    }

    const connection = await QuickbooksOauthService.getActiveConnection()
    const search = String(request.qs().search ?? '').trim()
    const itemType = String(request.qs().type ?? '').trim() || null

    let items: QuickbooksItem[] = []
    let itemTypes: string[] = []

    if (connection) {
      QuickbooksCatalogSync.refreshIfStale()

      const query = QuickbooksItem.query()
        .where('realm_id', connection.realmId)
        .where('active', true)
        .orderBy('name', 'asc')

      if (search) {
        query.where((itemQuery) => {
          itemQuery
            .whereILike('name', `%${search}%`)
            .orWhereILike('sku', `%${search}%`)
            .orWhereILike('description', `%${search}%`)
        })
      }

      if (itemType) {
        query.where('type', itemType)
      }

      items = await query

      const typeRows = await QuickbooksItem.query()
        .where('realm_id', connection.realmId)
        .where('active', true)
        .whereNotNull('type')
        .distinct('type')
        .orderBy('type', 'asc')
      itemTypes = typeRows.map((row) => row.type).filter((value): value is string => Boolean(value))
    }

    const lastSyncedAt = connection ? await QuickbooksCatalogSync.lastSyncedAt('item') : null

    return inertia.render('quickbooks/items', {
      filters: { search, type: itemType },
      itemTypes,
      items: items.map((item) => ({
        id: item.id,
        quickbooksId: item.quickbooksId,
        name: item.name,
        sku: item.sku ?? '—',
        type: item.type ?? '—',
        description: item.description,
        unitPrice: item.unitPrice !== null ? Number(item.unitPrice) : null,
        incomeAccountName: item.incomeAccountName ?? '—',
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
          `Products & services refreshed from QuickBooks (${result.items} change${result.items === 1 ? '' : 's'}).`
        )
      }
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : 'QuickBooks refresh failed.')
    }

    return response.redirect().back()
  }
}
