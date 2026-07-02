import { DateTime } from 'luxon'
import Customer from '#models/customer'
import QuickbooksSyncRecord from '#models/quickbooks_sync_record'
import type QuickbooksConnection from '#models/quickbooks_connection'
import QuickbooksClient from '#services/quickbooks/quickbooks_client'
import { buildQuickbooksCustomerPayload } from '#services/quickbooks/quickbooks_payload_builder'

export default class QuickbooksCustomerSync {
  static async syncCustomer(connection: QuickbooksConnection, customerId: number) {
    const existing = await QuickbooksSyncRecord.query()
      .where('entity_type', 'customer')
      .where('local_id', customerId)
      .where('sync_status', 'synced')
      .first()

    if (existing?.quickbooksId) {
      return existing.quickbooksId
    }

    const customer = await Customer.findOrFail(customerId)
    const foundId = await this.findExistingQuickbooksCustomer(connection, customer)

    if (foundId) {
      await this.storeMapping(connection, customerId, foundId)
      return foundId
    }

    const payload = buildQuickbooksCustomerPayload({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      localId: customer.id,
    })

    const response = await QuickbooksClient.createCustomer(connection, payload)
    const quickbooksId = response.Customer?.Id

    if (!quickbooksId) {
      throw new Error('QuickBooks did not return a customer ID.')
    }

    await this.storeMapping(connection, customerId, quickbooksId)
    return quickbooksId
  }

  private static async findExistingQuickbooksCustomer(
    connection: QuickbooksConnection,
    customer: Customer
  ) {
    if (customer.email?.trim()) {
      const escapedEmail = customer.email.trim().replace(/'/g, "\\'")
      const response = await QuickbooksClient.query<{
        Customer?: Array<{ Id: string }>
      }>(
        connection,
        `select Id from Customer where PrimaryEmailAddr = '${escapedEmail}' maxresults 1`
      )

      const match = response.QueryResponse?.Customer?.[0]
      if (match?.Id) {
        return match.Id
      }
    }

    const displayName = (customer.company?.trim() || customer.fullName.trim()).replace(/'/g, "\\'")
    const response = await QuickbooksClient.query<{
      Customer?: Array<{ Id: string }>
    }>(connection, `select Id from Customer where DisplayName = '${displayName}' maxresults 1`)

    return response.QueryResponse?.Customer?.[0]?.Id ?? null
  }

  private static async storeMapping(
    connection: QuickbooksConnection,
    customerId: number,
    quickbooksId: string
  ) {
    const record = await QuickbooksSyncRecord.firstOrCreate(
      {
        entityType: 'customer',
        localId: customerId,
      },
      {
        entityType: 'customer',
        localId: customerId,
        realmId: connection.realmId,
        syncStatus: 'synced',
        quickbooksId,
        attemptCount: 1,
        syncedAt: DateTime.now(),
      }
    )

    record.quickbooksId = quickbooksId
    record.realmId = connection.realmId
    record.syncStatus = 'synced'
    record.lastError = null
    record.syncedAt = DateTime.now()
    await record.save()
  }
}
