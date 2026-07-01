import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 80).notNullable()
      table.string('title', 255).notNullable()
      table.text('body').nullable()
      table.string('entity_type', 80).nullable()
      table.integer('entity_id').unsigned().nullable()
      table.timestamp('read_at').nullable()
      table.timestamp('created_at').notNullable()
      table.index(['user_id', 'read_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
