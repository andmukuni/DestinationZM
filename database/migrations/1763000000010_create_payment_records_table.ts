import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_records'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('reference', 40).notNullable().unique()
      table
        .integer('invoice_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('invoices')
        .onDelete('SET NULL')
      table
        .integer('receipt_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('receipts')
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
      table.decimal('amount', 14, 2).notNullable()
      table.string('currency', 3).notNullable().defaultTo('ZMW')
      table.string('payment_method', 60).notNullable()
      table.string('payment_reference', 120).nullable()
      table.date('payment_date').notNullable()
      table
        .enum('status', ['pending', 'completed', 'failed', 'reversed'])
        .notNullable()
        .defaultTo('completed')
      table.text('notes').nullable()
      table
        .integer('document_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('documents')
        .onDelete('SET NULL')
      table
        .integer('recorded_by_id')
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
