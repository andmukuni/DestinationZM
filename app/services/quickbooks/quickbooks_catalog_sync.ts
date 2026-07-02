import { DateTime } from 'luxon'
import QuickbooksAccount from '#models/quickbooks_account'
import QuickbooksItem from '#models/quickbooks_item'
import QuickbooksSyncCursor, { type QuickbooksCatalogEntity } from '#models/quickbooks_sync_cursor'
import type QuickbooksConnection from '#models/quickbooks_connection'
import QuickbooksClient, {
  type QuickbooksAccountEntity,
  type QuickbooksItemEntity,
} from '#services/quickbooks/quickbooks_client'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'

/** CDC only supports lookback of 30 days; refresh fully beyond that. */
const CDC_MAX_AGE_DAYS = 30

/** Catalog considered fresh for this long before a background refresh kicks in. */
const STALE_AFTER_MINUTES = 60

export type CatalogRefreshResult = {
  accounts: number
  items: number
  mode: 'cdc' | 'full'
}

export function mapQuickbooksAccountRow(entity: QuickbooksAccountEntity, realmId: string) {
  return {
    quickbooksId: entity.Id,
    realmId,
    name: entity.Name,
    fullyQualifiedName: entity.FullyQualifiedName ?? null,
    accountType: entity.AccountType ?? null,
    accountSubType: entity.AccountSubType ?? null,
    classification: entity.Classification ?? null,
    currency: entity.CurrencyRef?.value ?? null,
    active: entity.status === 'Deleted' ? false : entity.Active !== false,
    currentBalance: entity.CurrentBalance ?? null,
  }
}

export function mapQuickbooksItemRow(entity: QuickbooksItemEntity, realmId: string) {
  return {
    quickbooksId: entity.Id,
    realmId,
    name: entity.Name,
    sku: entity.Sku ?? null,
    type: entity.Type ?? null,
    description: entity.Description ?? null,
    unitPrice: entity.UnitPrice ?? null,
    incomeAccountName: entity.IncomeAccountRef?.name ?? null,
    active: entity.status === 'Deleted' ? false : entity.Active !== false,
  }
}

export default class QuickbooksCatalogSync {
  /**
   * Refresh both catalogs. Uses CDC (only changed entities) when a recent
   * cursor exists; falls back to a full paginated pull otherwise or when
   * `options.full` is set.
   */
  static async refresh(options: { full?: boolean } = {}): Promise<CatalogRefreshResult | null> {
    const connection = await QuickbooksOauthService.getActiveConnection()
    if (!connection) {
      return null
    }

    const cursor = await this.oldestCursor(connection.realmId)
    const canUseCdc =
      !options.full && cursor !== null && cursor > DateTime.now().minus({ days: CDC_MAX_AGE_DAYS })

    if (canUseCdc) {
      return this.refreshViaCdc(connection, cursor)
    }

    return this.refreshFull(connection)
  }

  /** Fire-and-forget refresh when local data is stale (called on page load). */
  static refreshIfStale() {
    void (async () => {
      const connection = await QuickbooksOauthService.getActiveConnection()
      if (!connection) {
        return
      }

      const cursor = await this.oldestCursor(connection.realmId)
      if (cursor && cursor > DateTime.now().minus({ minutes: STALE_AFTER_MINUTES })) {
        return
      }

      await this.refresh()
    })().catch((error) => {
      console.error('[QuickBooks] Catalog refresh failed:', error)
    })
  }

  static async lastSyncedAt(entity: QuickbooksCatalogEntity) {
    const connection = await QuickbooksOauthService.getActiveConnection()
    if (!connection) {
      return null
    }

    const cursor = await QuickbooksSyncCursor.query()
      .where('realm_id', connection.realmId)
      .where('entity', entity)
      .first()

    return cursor?.lastSyncedAt ?? null
  }

  private static async refreshViaCdc(
    connection: QuickbooksConnection,
    since: DateTime
  ): Promise<CatalogRefreshResult> {
    // Small overlap so entities changed during the previous sync are not missed.
    const changedSince = since.minus({ minutes: 5 }).toUTC().toISO()!
    const response = await QuickbooksClient.changedSince(
      connection,
      ['Account', 'Item'],
      changedSince
    )

    const accounts: QuickbooksAccountEntity[] = []
    const items: QuickbooksItemEntity[] = []

    for (const cdcResponse of response.CDCResponse ?? []) {
      for (const queryResponse of cdcResponse.QueryResponse ?? []) {
        accounts.push(...(queryResponse.Account ?? []))
        items.push(...(queryResponse.Item ?? []))
      }
    }

    await this.upsertAccounts(connection.realmId, accounts)
    await this.upsertItems(connection.realmId, items)
    await this.touchCursors(connection.realmId)

    return { accounts: accounts.length, items: items.length, mode: 'cdc' }
  }

  private static async refreshFull(
    connection: QuickbooksConnection
  ): Promise<CatalogRefreshResult> {
    const [accounts, items] = await Promise.all([
      QuickbooksClient.listAccounts(connection),
      QuickbooksClient.listItems(connection),
    ])

    await this.upsertAccounts(connection.realmId, accounts)
    await this.upsertItems(connection.realmId, items)

    // Full pull is authoritative: anything not returned no longer exists in QBO.
    const accountIds = accounts.map((account) => account.Id)
    const itemIds = items.map((item) => item.Id)

    if (accountIds.length > 0) {
      await QuickbooksAccount.query()
        .where('realm_id', connection.realmId)
        .whereNotIn('quickbooks_id', accountIds)
        .update({ active: false })
    }

    if (itemIds.length > 0) {
      await QuickbooksItem.query()
        .where('realm_id', connection.realmId)
        .whereNotIn('quickbooks_id', itemIds)
        .update({ active: false })
    }

    await this.touchCursors(connection.realmId)

    return { accounts: accounts.length, items: items.length, mode: 'full' }
  }

  private static async upsertAccounts(realmId: string, entities: QuickbooksAccountEntity[]) {
    const now = DateTime.now()

    for (const entity of entities) {
      const row = mapQuickbooksAccountRow(entity, realmId)
      const existing = await QuickbooksAccount.query()
        .where('realm_id', realmId)
        .where('quickbooks_id', entity.Id)
        .first()

      if (existing) {
        existing.merge({ ...row, syncedAt: now })
        await existing.save()
      } else {
        await QuickbooksAccount.create({ ...row, syncedAt: now })
      }
    }
  }

  private static async upsertItems(realmId: string, entities: QuickbooksItemEntity[]) {
    const now = DateTime.now()

    for (const entity of entities) {
      const row = mapQuickbooksItemRow(entity, realmId)
      const existing = await QuickbooksItem.query()
        .where('realm_id', realmId)
        .where('quickbooks_id', entity.Id)
        .first()

      if (existing) {
        existing.merge({ ...row, syncedAt: now })
        await existing.save()
      } else {
        await QuickbooksItem.create({ ...row, syncedAt: now })
      }
    }
  }

  private static async oldestCursor(realmId: string) {
    const cursors = await QuickbooksSyncCursor.query()
      .where('realm_id', realmId)
      .whereIn('entity', ['account', 'item'])

    if (cursors.length < 2) {
      return null
    }

    const timestamps = cursors
      .map((cursor) => cursor.lastSyncedAt)
      .filter((value): value is DateTime => value !== null)

    if (timestamps.length < 2) {
      return null
    }

    return timestamps.reduce((oldest, value) => (value < oldest ? value : oldest))
  }

  private static async touchCursors(realmId: string) {
    const now = DateTime.now()

    for (const entity of ['account', 'item'] as QuickbooksCatalogEntity[]) {
      const cursor = await QuickbooksSyncCursor.firstOrCreate(
        { realmId, entity },
        { realmId, entity, lastSyncedAt: now }
      )
      cursor.lastSyncedAt = now
      await cursor.save()
    }
  }
}
