import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quickbooks_sync_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .enum('entity_type', ['customer', 'invoice', 'payment'])
        .notNullable()
      table.integer('local_id').unsigned().notNullable()
      table.string('quickbooks_id', 64).nullable()
      table.string('realm_id', 64).notNullable()
      table
        .enum('sync_status', ['pending', 'synced', 'failed', 'skipped'])
        .notNullable()
        .defaultTo('pending')
      table.text('last_error').nullable()
      table.integer('attempt_count').unsigned().notNullable().defaultTo(0)
      table.timestamp('synced_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['entity_type', 'local_id'])
      table.index(['sync_status', 'entity_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
