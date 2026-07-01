import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quickbooks_app_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('client_id', 255).nullable()
      table.text('client_secret_encrypted').nullable()
      table.string('redirect_uri', 512).nullable()
      table
        .enum('environment', ['sandbox', 'production'])
        .notNullable()
        .defaultTo('sandbox')
      table
        .string('scopes', 255)
        .notNullable()
        .defaultTo('com.intuit.quickbooks.accounting')
      table
        .integer('updated_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
