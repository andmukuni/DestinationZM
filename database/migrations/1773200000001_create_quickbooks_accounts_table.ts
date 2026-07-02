import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quickbooks_accounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('quickbooks_id', 64).notNullable()
      table.string('realm_id', 64).notNullable()
      table.string('name', 255).notNullable()
      table.string('fully_qualified_name', 512).nullable()
      table.string('account_type', 128).nullable()
      table.string('account_sub_type', 128).nullable()
      table.string('classification', 64).nullable()
      table.string('currency', 8).nullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.decimal('current_balance', 14, 2).nullable()
      table.timestamp('synced_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['realm_id', 'quickbooks_id'])
      table.index(['realm_id', 'active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
