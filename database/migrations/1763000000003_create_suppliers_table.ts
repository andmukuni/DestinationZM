import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'suppliers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 120).notNullable()
      table.string('code', 40).nullable().unique()
      table.string('contact_name', 120).nullable()
      table.string('email', 255).nullable()
      table.string('phone', 40).nullable()
      table.text('notes').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
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
