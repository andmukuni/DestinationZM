import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'travel_recovery_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('product_type', 20).notNullable()
      table.string('currency', 3).notNullable().defaultTo('ZMW')
      table.decimal('price', 14, 2).notNullable().defaultTo(0)
      table.string('pnr', 40).nullable()
      table.string('traveler_name', 120).nullable()
      table.date('travel_start').nullable()
      table.date('travel_end').nullable()
      table.string('itinerary_service', 255).nullable()
      table.string('invoice_receipt_number', 40).nullable()
      table.string('trip_name', 255).nullable()
      table.string('trip_reason', 120).nullable()
      table.string('cost_center', 120).nullable()
      table.date('date_requested').nullable()
      table.string('approved_by', 120).nullable()
      table.string('general_ledger_account', 255).nullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
