import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recovery_reports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('reference', 40).notNullable().unique()
      table
        .integer('booking_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('bookings')
        .onDelete('CASCADE')
      table
        .integer('quotation_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('quotations')
        .onDelete('SET NULL')
      table
        .integer('branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table
        .integer('created_by_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .enum('status', ['draft', 'sent', 'client_confirmed', 'client_rejected', 'superseded'])
        .notNullable()
        .defaultTo('draft')
      table.text('notes').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamp('client_confirmed_at').nullable()
      table.timestamp('client_rejected_at').nullable()
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
