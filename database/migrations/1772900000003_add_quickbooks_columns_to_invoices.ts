import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('quickbooks_invoice_id', 64).nullable()
      table
        .enum('quickbooks_sync_status', ['pending', 'synced', 'failed', 'skipped'])
        .nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quickbooks_invoice_id')
      table.dropColumn('quickbooks_sync_status')
    })
  }
}
