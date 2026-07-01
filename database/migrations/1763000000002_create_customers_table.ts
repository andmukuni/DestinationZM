import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('full_name', 120).notNullable()
      table.string('email', 255).nullable()
      table.string('phone', 40).nullable()
      table.string('company', 120).nullable()
      table.text('notes').nullable()
      table
        .integer('branch_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('branches')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
