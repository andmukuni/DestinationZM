import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('invoice_number', 40).notNullable().unique()
      table
        .integer('booking_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('bookings')
        .onDelete('SET NULL')
      table
        .integer('customer_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('customers')
        .onDelete('RESTRICT')
      table
        .integer('branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table
        .enum('status', ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void'])
        .notNullable()
        .defaultTo('draft')
      table.decimal('subtotal', 14, 2).notNullable().defaultTo(0)
      table.decimal('tax_amount', 14, 2).notNullable().defaultTo(0)
      table.decimal('total_amount', 14, 2).notNullable().defaultTo(0)
      table.decimal('amount_paid', 14, 2).notNullable().defaultTo(0)
      table.string('currency', 3).notNullable().defaultTo('ZMW')
      table.date('issue_date').notNullable()
      table.date('due_date').notNullable()
      table.text('notes').nullable()
      table
        .integer('document_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('documents')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
