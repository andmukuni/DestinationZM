import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quickbooks_connections'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('realm_id', 64).notNullable().unique()
      table.string('company_name', 255).nullable()
      table.text('access_token_encrypted').notNullable()
      table.text('refresh_token_encrypted').notNullable()
      table.timestamp('access_token_expires_at').notNullable()
      table
        .enum('environment', ['sandbox', 'production'])
        .notNullable()
        .defaultTo('sandbox')
      table
        .integer('connected_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('default_income_account_id', 64).nullable()
      table.string('default_service_item_id', 64).nullable()
      table.string('default_service_item_name', 255).nullable()
      table.boolean('sync_enabled').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
