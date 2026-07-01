import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recovery_report_lines'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('recovery_report_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('recovery_reports')
        .onDelete('CASCADE')
      table.string('booking_reference', 40).nullable()
      table.string('destination', 120).nullable()
      table.date('depart_date').nullable()
      table.date('return_date').nullable()
      table.integer('pax').nullable()
      table.string('description', 255).notNullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('unit_price', 14, 2).notNullable().defaultTo(0)
      table.decimal('line_total', 14, 2).notNullable().defaultTo(0)
      table.decimal('tax_amount', 14, 2).notNullable().defaultTo(0)
      table.decimal('total_amount', 14, 2).notNullable().defaultTo(0)
      table.string('currency', 3).notNullable().defaultTo('ZMW')
      table.integer('sort_order').notNullable().defaultTo(0)
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
