import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quickbooks_sync_cursors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('realm_id', 64).notNullable()
      table.string('entity', 32).notNullable()
      table.timestamp('last_synced_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['realm_id', 'entity'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
