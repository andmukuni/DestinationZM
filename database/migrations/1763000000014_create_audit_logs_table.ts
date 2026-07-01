import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('action', 80).notNullable()
      table.string('entity_type', 80).notNullable()
      table.integer('entity_id').unsigned().nullable()
      table.json('metadata').nullable()
      table.string('ip_address', 45).nullable()
      table.timestamp('created_at').notNullable()
      table.index(['entity_type', 'entity_id'])
      table.index(['action'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
