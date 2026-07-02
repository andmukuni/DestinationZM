import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('quickbooks_deposit_account_id', 64).nullable()
      table.string('quickbooks_deposit_account_name', 255).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quickbooks_deposit_account_id')
      table.dropColumn('quickbooks_deposit_account_name')
    })
  }
}
