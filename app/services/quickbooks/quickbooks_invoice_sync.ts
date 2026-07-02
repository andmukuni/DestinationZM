import { DateTime } from 'luxon'
import Invoice from '#models/invoice'
import QuickbooksSyncRecord from '#models/quickbooks_sync_record'
import type QuickbooksConnection from '#models/quickbooks_connection'
import InvoiceDocumentService from '#services/invoice_document_service'
import QuickbooksClient from '#services/quickbooks/quickbooks_client'
import QuickbooksCustomerSync from '#services/quickbooks/quickbooks_customer_sync'
import {
  buildQuickbooksInvoicePayload,
  resolveQuickbooksCurrencyRef,
} from '#services/quickbooks/quickbooks_payload_builder'

export default class QuickbooksInvoiceSync {
  static async syncInvoice(connection: QuickbooksConnection, invoiceId: number) {
    const invoice = await Invoice.query()
      .where('id', invoiceId)
      .preload('customer')
      .firstOrFail()

    const existing = await QuickbooksSyncRecord.query()
      .where('entity_type', 'invoice')
      .where('local_id', invoiceId)
      .first()

    if (existing?.syncStatus === 'synced' && existing.quickbooksId) {
      return existing.quickbooksId
    }

    if (!connection.defaultServiceItemId) {
      throw new Error('QuickBooks default service item is not configured in settings.')
    }

    const customerQuickbooksId = await QuickbooksCustomerSync.syncCustomer(
      connection,
      invoice.customerId
    )

    const quotation = await InvoiceDocumentService.quotationForBooking(invoice.bookingId)
    const lineItems = quotation?.lineItems?.items ?? []
    const currencyPrefs = await QuickbooksClient.getCurrencyPreferences(connection)

    const payload = buildQuickbooksInvoicePayload(
      {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate.toISODate() ?? DateTime.now().toISODate()!,
        dueDate: invoice.dueDate.toISODate() ?? DateTime.now().toISODate()!,
        currency: invoice.currency,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.taxAmount),
        totalAmount: Number(invoice.totalAmount),
        notes: invoice.notes,
        lineItems,
        serviceItemId: connection.defaultServiceItemId,
        serviceItemName: connection.defaultServiceItemName,
        customerQuickbooksId,
      },
      {
        currencyRef: resolveQuickbooksCurrencyRef(invoice.currency, currencyPrefs),
      }
    )

    try {
      const response = await QuickbooksClient.createInvoice(connection, payload)
      const quickbooksId = response.Invoice?.Id

      if (!quickbooksId) {
        throw new Error('QuickBooks did not return an invoice ID.')
      }

      await this.markSynced(invoice, connection, quickbooksId, existing)
      return quickbooksId
    } catch (error) {
      const duplicateId = await this.tryResolveDuplicateDocNumber(
        connection,
        invoice.invoiceNumber
      )

      if (duplicateId) {
        await this.markSynced(invoice, connection, duplicateId, existing)
        return duplicateId
      }

      throw error
    }
  }

  private static async tryResolveDuplicateDocNumber(
    connection: QuickbooksConnection,
    docNumber: string
  ) {
    const escaped = docNumber.replace(/'/g, "\\'")
    const response = await QuickbooksClient.query<{
      Invoice?: Array<{ Id: string }>
    }>(connection, `select Id from Invoice where DocNumber = '${escaped}' maxresults 1`)

    return response.QueryResponse?.Invoice?.[0]?.Id ?? null
  }

  private static async markSynced(
    invoice: Invoice,
    connection: QuickbooksConnection,
    quickbooksId: string,
    existing: QuickbooksSyncRecord | null
  ) {
    const record =
      existing ??
      (await QuickbooksSyncRecord.create({
        entityType: 'invoice',
        localId: invoice.id,
        realmId: connection.realmId,
        syncStatus: 'pending',
        attemptCount: 0,
      }))

    record.quickbooksId = quickbooksId
    record.realmId = connection.realmId
    record.syncStatus = 'synced'
    record.lastError = null
    record.attemptCount = record.attemptCount + 1
    record.syncedAt = DateTime.now()
    await record.save()

    invoice.quickbooksInvoiceId = quickbooksId
    invoice.quickbooksSyncStatus = 'synced'
    await invoice.save()
  }
}
