import quickbooksConfig from '#config/quickbooks'
import Invoice from '#models/invoice'
import QuickbooksSyncRecord from '#models/quickbooks_sync_record'
import AuditService from '#services/audit_service'
import { QuickbooksApiError } from '#services/quickbooks/quickbooks_api_error'
import QuickbooksInvoiceSync from '#services/quickbooks/quickbooks_invoice_sync'
import {
  QuickbooksReconnectRequiredError,
  QUICKBOOKS_RECONNECT_MESSAGE,
} from '#services/quickbooks/quickbooks_oauth_errors'
import QuickbooksOauthService from '#services/quickbooks/quickbooks_oauth_service'
import QuickbooksCustomerSync from '#services/quickbooks/quickbooks_customer_sync'
import QuickbooksPaymentSync from '#services/quickbooks/quickbooks_payment_sync'

function syncErrorDetails(error: unknown) {
  if (error instanceof QuickbooksReconnectRequiredError) {
    return {
      message: QUICKBOOKS_RECONNECT_MESSAGE,
      intuitTid: null,
    }
  }

  if (error instanceof QuickbooksApiError) {
    return {
      message: error.message,
      intuitTid: error.intuitTid,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      intuitTid: null,
    }
  }

  return {
    message: 'QuickBooks sync failed.',
    intuitTid: null,
  }
}

async function markSyncFailure(record: QuickbooksSyncRecord, error: unknown, invoiceId?: number) {
  const { message, intuitTid } = syncErrorDetails(error)
  record.syncStatus = 'failed'
  record.lastError = message
  record.lastIntuitTid = intuitTid
  await record.save()

  if (invoiceId) {
    await Invoice.query().where('id', invoiceId).update({ quickbooksSyncStatus: 'failed' })
  }
}

export type InvoiceListSyncSummary = {
  quickbooksStatus: 'pending' | 'synced' | 'failed' | 'skipped' | null
  quickbooksInvoiceId: string | null
  quickbooksPaymentStatus: 'pending' | 'synced' | 'failed' | null
}

type InvoicePostEligibility = Pick<Invoice, 'status' | 'quickbooksSyncStatus'>

export default class QuickbooksSyncService {
  static canPostInvoiceToQuickbooks(invoice: InvoicePostEligibility, connected: boolean) {
    if (!connected) {
      return false
    }

    if (invoice.status === 'draft' || invoice.status === 'void') {
      return false
    }

    if (invoice.quickbooksSyncStatus === 'synced' || invoice.quickbooksSyncStatus === 'pending') {
      return false
    }

    return invoice.quickbooksSyncStatus === null || invoice.quickbooksSyncStatus === 'skipped'
  }

  static canRetryInvoiceQuickbooksSync(invoice: InvoicePostEligibility, connected: boolean) {
    if (!connected) {
      return false
    }

    if (invoice.status === 'draft' || invoice.status === 'void') {
      return false
    }

    return invoice.quickbooksSyncStatus === 'failed'
  }

  static async getInvoiceListSyncSummaries(
    invoices: Array<Pick<Invoice, 'id' | 'quickbooksSyncStatus' | 'quickbooksInvoiceId' | 'status'>>
  ): Promise<Map<number, InvoiceListSyncSummary>> {
    const result = new Map<number, InvoiceListSyncSummary>()
    if (invoices.length === 0) {
      return result
    }

    const invoiceIds = invoices.map((invoice) => invoice.id)
    const records = await QuickbooksSyncRecord.query().whereIn('local_id', invoiceIds)

    const invoiceRecords = new Map<number, QuickbooksSyncRecord>()
    const paymentRecords = new Map<number, QuickbooksSyncRecord>()

    for (const record of records) {
      if (record.entityType === 'invoice') {
        invoiceRecords.set(record.localId, record)
      } else if (record.entityType === 'payment') {
        paymentRecords.set(record.localId, record)
      }
    }

    for (const invoice of invoices) {
      const invoiceRecord = invoiceRecords.get(invoice.id)
      const paymentRecord = paymentRecords.get(invoice.id)
      const paymentSyncStatus = paymentRecord?.syncStatus
      const quickbooksPaymentStatus =
        invoice.status === 'paid' && paymentSyncStatus && paymentSyncStatus !== 'skipped'
          ? paymentSyncStatus
          : null

      result.set(invoice.id, {
        quickbooksStatus: invoice.quickbooksSyncStatus ?? invoiceRecord?.syncStatus ?? null,
        quickbooksInvoiceId: invoice.quickbooksInvoiceId ?? invoiceRecord?.quickbooksId ?? null,
        quickbooksPaymentStatus,
      })
    }

    return result
  }

  static async retryInvoiceSync(invoiceId: number, options: { manual?: boolean } = {}) {
    if (options.manual) {
      const record = await QuickbooksSyncRecord.query()
        .where('entity_type', 'invoice')
        .where('local_id', invoiceId)
        .first()

      if (record) {
        record.attemptCount = 0
        await record.save()
      }
    }

    return this.processInvoice(invoiceId, options)
  }

  static enqueueInvoice(invoiceId: number) {
    void (async () => {
      if (!(await QuickbooksOauthService.isConfigured())) {
        return
      }

      await this.processInvoice(invoiceId)
    })().catch((error) => {
      console.error('[QuickBooks] Invoice sync failed:', error)
    })
  }

  static enqueuePayment(invoiceId: number) {
    void (async () => {
      if (!(await QuickbooksOauthService.isConfigured())) {
        return
      }

      await this.processPayment(invoiceId)
    })().catch((error) => {
      console.error('[QuickBooks] Payment sync failed:', error)
    })
  }

  static enqueueCustomer(customerId: number) {
    void (async () => {
      if (!(await QuickbooksOauthService.isConfigured())) {
        return
      }

      await this.processCustomer(customerId)
    })().catch((error) => {
      console.error('[QuickBooks] Customer sync failed:', error)
    })
  }

  static async processCustomer(customerId: number, options: { manual?: boolean } = {}) {
    const connection = await QuickbooksOauthService.getActiveConnection()
    if (!connection?.syncEnabled) {
      return null
    }

    const record = await this.ensurePendingRecord('customer', customerId, connection.realmId)

    if (record.syncStatus === 'synced' && record.quickbooksId) {
      return record.quickbooksId
    }

    if (
      !options.manual &&
      record.attemptCount >= quickbooksConfig.maxSyncAttempts &&
      record.syncStatus === 'failed'
    ) {
      return null
    }

    if (options.manual) {
      record.attemptCount = 0
    }

    try {
      record.syncStatus = 'pending'
      record.attemptCount = record.attemptCount + 1
      record.lastError = null
      record.lastIntuitTid = null
      await record.save()

      const quickbooksId = await QuickbooksCustomerSync.syncCustomer(connection, customerId)

      await AuditService.log({
        action: 'quickbooks.customer_synced',
        entityType: 'customer',
        entityId: customerId,
        metadata: { quickbooksId },
      })

      return quickbooksId
    } catch (error) {
      const { message, intuitTid } = syncErrorDetails(error)
      await markSyncFailure(record, error)

      await AuditService.log({
        action: 'quickbooks.customer_sync_failed',
        entityType: 'customer',
        entityId: customerId,
        metadata: { error: message, intuitTid },
      })

      throw error
    }
  }

  static async getCustomerListSyncSummaries(customerIds: number[]) {
    const result = new Map<
      number,
      {
        syncStatus: 'pending' | 'synced' | 'failed' | 'skipped' | null
        quickbooksId: string | null
      }
    >()

    if (customerIds.length === 0) {
      return result
    }

    const records = await QuickbooksSyncRecord.query()
      .where('entity_type', 'customer')
      .whereIn('local_id', customerIds)

    for (const record of records) {
      result.set(record.localId, {
        syncStatus: record.syncStatus,
        quickbooksId: record.quickbooksId,
      })
    }

    return result
  }

  static async processInvoice(invoiceId: number, options: { manual?: boolean } = {}) {
    const connection = await QuickbooksOauthService.getActiveConnection()
    if (!connection?.syncEnabled) {
      return null
    }

    const record = await this.ensurePendingRecord('invoice', invoiceId, connection.realmId)

    if (record.syncStatus === 'synced' && record.quickbooksId) {
      return record.quickbooksId
    }

    if (
      !options.manual &&
      record.attemptCount >= quickbooksConfig.maxSyncAttempts &&
      record.syncStatus === 'failed'
    ) {
      return null
    }

    try {
      record.syncStatus = 'pending'
      record.attemptCount = record.attemptCount + 1
      record.lastError = null
      record.lastIntuitTid = null
      await record.save()

      await Invoice.query().where('id', invoiceId).update({ quickbooksSyncStatus: 'pending' })

      const quickbooksId = await QuickbooksInvoiceSync.syncInvoice(connection, invoiceId)

      await AuditService.log({
        action: 'quickbooks.invoice_synced',
        entityType: 'invoice',
        entityId: invoiceId,
        metadata: { quickbooksId },
      })

      return quickbooksId
    } catch (error) {
      const { message, intuitTid } = syncErrorDetails(error)
      await markSyncFailure(record, error, invoiceId)

      await AuditService.log({
        action: 'quickbooks.invoice_sync_failed',
        entityType: 'invoice',
        entityId: invoiceId,
        metadata: { error: message, intuitTid },
      })

      throw error
    }
  }

  static async processPayment(invoiceId: number) {
    const connection = await QuickbooksOauthService.getActiveConnection()
    if (!connection?.syncEnabled) {
      return null
    }

    const invoice = await Invoice.find(invoiceId)
    if (!invoice || invoice.status !== 'paid') {
      return null
    }

    const record = await this.ensurePendingRecord('payment', invoiceId, connection.realmId)

    if (record.syncStatus === 'synced' && record.quickbooksId) {
      return record.quickbooksId
    }

    try {
      record.syncStatus = 'pending'
      record.attemptCount = record.attemptCount + 1
      record.lastError = null
      record.lastIntuitTid = null
      await record.save()

      const quickbooksId = await QuickbooksPaymentSync.syncPayment(connection, invoiceId)

      await AuditService.log({
        action: 'quickbooks.payment_synced',
        entityType: 'invoice',
        entityId: invoiceId,
        metadata: { quickbooksId },
      })

      return quickbooksId
    } catch (error) {
      const { message, intuitTid } = syncErrorDetails(error)
      await markSyncFailure(record, error)

      await AuditService.log({
        action: 'quickbooks.payment_sync_failed',
        entityType: 'invoice',
        entityId: invoiceId,
        metadata: { error: message, intuitTid },
      })

      throw error
    }
  }

  static async processPending(limit = 25) {
    const connection = await QuickbooksOauthService.getActiveConnection()
    if (!connection?.syncEnabled) {
      return { processed: 0, failures: 0 }
    }

    const pending = await QuickbooksSyncRecord.query()
      .whereIn('sync_status', ['pending', 'failed'])
      .where('attempt_count', '<', quickbooksConfig.maxSyncAttempts)
      .orderBy('updated_at', 'asc')
      .limit(limit)

    let processed = 0
    let failures = 0

    for (const record of pending) {
      try {
        if (record.entityType === 'invoice') {
          await this.processInvoice(record.localId)
        } else if (record.entityType === 'payment') {
          await this.processPayment(record.localId)
        } else if (record.entityType === 'customer') {
          await this.processCustomer(record.localId)
        }
        processed += 1
      } catch {
        failures += 1
      }
    }

    return { processed, failures }
  }

  static async getInvoiceSyncSummary(invoiceId: number) {
    const record = await QuickbooksSyncRecord.query()
      .where('entity_type', 'invoice')
      .where('local_id', invoiceId)
      .first()

    const invoice = await Invoice.find(invoiceId)

    return {
      connected: Boolean(await QuickbooksOauthService.getActiveConnection()),
      status: invoice?.quickbooksSyncStatus ?? record?.syncStatus ?? null,
      quickbooksInvoiceId: invoice?.quickbooksInvoiceId ?? record?.quickbooksId ?? null,
      lastError: record?.lastError ?? null,
      lastIntuitTid: record?.lastIntuitTid ?? null,
      syncedAt: record?.syncedAt?.toISO() ?? null,
    }
  }

  private static async ensurePendingRecord(
    entityType: 'invoice' | 'payment' | 'customer',
    localId: number,
    realmId: string
  ) {
    return QuickbooksSyncRecord.firstOrCreate(
      {
        entityType,
        localId,
      },
      {
        entityType,
        localId,
        realmId,
        syncStatus: 'pending',
        attemptCount: 0,
      }
    )
  }
}
