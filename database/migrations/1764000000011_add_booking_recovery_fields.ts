import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bookings'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('product_type', 100).nullable()
      table.string('pnr', 100).nullable()
      table.string('traveler_name', 255).nullable()
      table.string('itinerary_service', 255).nullable()
      table.string('trip_name', 255).nullable()
      table.string('trip_reason', 255).nullable()
      table.string('cost_center', 255).nullable()
      table.date('date_requested').nullable()
      table.string('approved_by', 255).nullable()
      table.string('general_ledger_account', 255).nullable()
      table
        .integer('supplier_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('suppliers')
        .onDelete('SET NULL')
      table.string('invoice_receipt_number', 100).nullable()
      table
        .enum('dz_payment_status', ['NOT_PAID', 'PAID', 'PARTIAL'])
        .notNullable()
        .defaultTo('NOT_PAID')
      table.date('dz_payment_date').nullable()
      table.string('dz_payment_reference', 100).nullable()
      table.decimal('amount_paid_by_dz', 15, 2).notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['supplier_id'])
      table.dropColumns(
        'product_type',
        'pnr',
        'traveler_name',
        'itinerary_service',
        'trip_name',
        'trip_reason',
        'cost_center',
        'date_requested',
        'approved_by',
        'general_ledger_account',
        'supplier_id',
        'invoice_receipt_number',
        'dz_payment_status',
        'dz_payment_date',
        'dz_payment_reference',
        'amount_paid_by_dz'
      )
    })
  }
}
