import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('reference', 40).notNullable().unique()
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
        .integer('assigned_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('destination', 120).notNullable()
      table.date('depart_date').notNullable()
      table.date('return_date').nullable()
      table.integer('pax').notNullable().defaultTo(1)
      table
        .enum('status', ['draft', 'confirmed', 'invoiced', 'paid', 'closed', 'cancelled'])
        .notNullable()
        .defaultTo('draft')
      table.decimal('total_amount', 14, 2).notNullable().defaultTo(0)
      table.string('currency', 3).notNullable().defaultTo('ZMW')
      table.text('notes').nullable()
      table.timestamp('confirmed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
