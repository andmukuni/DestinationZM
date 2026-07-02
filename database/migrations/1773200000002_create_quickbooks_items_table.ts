import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quickbooks_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('quickbooks_id', 64).notNullable()
      table.string('realm_id', 64).notNullable()
      table.string('name', 255).notNullable()
      table.string('sku', 128).nullable()
      table.string('type', 64).nullable()
      table.text('description').nullable()
      table.decimal('unit_price', 14, 2).nullable()
      table.string('income_account_name', 255).nullable()
      table.boolean('active').notNullable().defaultTo(true)
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
