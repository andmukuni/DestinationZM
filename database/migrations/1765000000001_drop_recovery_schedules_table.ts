import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.dropTableIfExists('recovery_schedules')
  }

  async down() {
    this.schema.createTable('recovery_schedules', (table) => {
      table.increments('id')
      table
        .integer('invoice_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('invoices')
        .onDelete('CASCADE')
      table.integer('customer_id').unsigned().notNullable().references('id').inTable('customers')
      table.integer('branch_id').unsigned().notNullable().references('id').inTable('branches')
      table
        .integer('assigned_officer_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
      table.string('status').notNullable().defaultTo('open')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }
}
