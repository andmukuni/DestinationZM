import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import QuickbooksSyncRecord from '#models/quickbooks_sync_record'
import type QuickbooksConnection from '#models/quickbooks_connection'
import QuickbooksClient from '#services/quickbooks/quickbooks_client'
import QuickbooksCustomerSync from '#services/quickbooks/quickbooks_customer_sync'
import QuickbooksInvoiceSync from '#services/quickbooks/quickbooks_invoice_sync'
import {
  buildQuickbooksPaymentPayload,
  resolveQuickbooksCurrencyRef,
} from '#services/quickbooks/quickbooks_payload_builder'

export default class QuickbooksPaymentSync {
  static async syncPayment(connection: QuickbooksConnection, invoiceId: number) {
    const invoice = await Invoice.query().where('id', invoiceId).preload('customer').firstOrFail()

    if (invoice.status !== 'paid') {
      return null
    }

    const existingPayment = await QuickbooksSyncRecord.query()
      .where('entity_type', 'payment')
      .where('local_id', invoiceId)
      .where('sync_status', 'synced')
      .first()

    if (existingPayment?.quickbooksId) {
      return existingPayment.quickbooksId
    }

    const invoiceRecord = await QuickbooksSyncRecord.query()
      .where('entity_type', 'invoice')
      .where('local_id', invoiceId)
      .where('sync_status', 'synced')
      .first()

    let invoiceQuickbooksId = invoiceRecord?.quickbooksId ?? invoice.quickbooksInvoiceId

    if (!invoiceQuickbooksId) {
      invoiceQuickbooksId = await QuickbooksInvoiceSync.syncInvoice(connection, invoiceId)
    }

    const customerQuickbooksId = await QuickbooksCustomerSync.syncCustomer(
      connection,
      invoice.customerId
    )

    const currencyPrefs = await QuickbooksClient.getCurrencyPreferences(connection)

    const payload = buildQuickbooksPaymentPayload(
      {
        customerQuickbooksId,
        invoiceQuickbooksId,
        totalAmount: Number(invoice.totalAmount),
        currency: invoice.currency,
        paymentDate: DateTime.now().toISODate() ?? invoice.issueDate.toISODate()!,
        reference: invoice.invoiceNumber,
      },
      {
        currencyRef: resolveQuickbooksCurrencyRef(invoice.currency, currencyPrefs),
        depositToAccountId: invoice.quickbooksDepositAccountId,
      }
    )

    const response = await QuickbooksClient.createPayment(connection, payload)
    const quickbooksId = response.Payment?.Id

    if (!quickbooksId) {
      throw new Error('QuickBooks did not return a payment ID.')
    }

    const record = await QuickbooksSyncRecord.firstOrCreate(
      {
        entityType: 'payment',
        localId: invoiceId,
      },
      {
        entityType: 'payment',
        localId: invoiceId,
        realmId: connection.realmId,
        syncStatus: 'pending',
        attemptCount: 0,
      }
    )

    record.quickbooksId = quickbooksId
    record.realmId = connection.realmId
    record.syncStatus = 'synced'
    record.lastError = null
    record.attemptCount = record.attemptCount + 1
    record.syncedAt = DateTime.now()
    await record.save()

    return quickbooksId
  }
}
