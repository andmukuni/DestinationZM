import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('invoices', (table) => {
      table.dropForeign(['recovery_report_id'])
      table.dropColumn('recovery_report_id')
    })

    this.schema.dropTableIfExists('recovery_report_lines')
    this.schema.dropTableIfExists('travel_recovery_items')
    this.schema.dropTableIfExists('recovery_reports')

    this.schema.createTable('recovery_reports', (table) => {
      table.increments('id')
      table.string('report_reference', 100).notNullable().unique()
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
      table.date('report_period_start').nullable()
      table.date('report_period_end').nullable()
      table
        .enum('report_type', ['REAL_TIME', 'WEEKLY_SUMMARY', 'MANUAL_EXPORT'])
        .notNullable()
        .defaultTo('REAL_TIME')
      table
        .enum('status', ['DRAFT', 'SENT', 'APPROVED', 'PARTIALLY_RECOVERED', 'RECOVERED', 'CANCELLED'])
        .notNullable()
        .defaultTo('DRAFT')
      table.decimal('total_amount', 15, 2).notNullable().defaultTo(0)
      table.string('currency', 10).notNullable().defaultTo('ZMW')
      table.timestamp('sent_at').nullable()
      table.timestamp('approved_at').nullable()
      table.timestamp('recovered_at').nullable()
      table
        .integer('created_by_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('recovery_report_items', (table) => {
      table.increments('id')
      table
        .integer('recovery_report_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('recovery_reports')
        .onDelete('SET NULL')
      table.string('recovery_reference', 100).notNullable().unique()
      table
        .integer('booking_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('bookings')
        .onDelete('CASCADE')
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
      table.string('product_type', 100).notNullable()
      table.string('currency', 10).notNullable().defaultTo('ZMW')
      table.decimal('price', 15, 2).notNullable()
      table.string('pnr', 100).nullable()
      table.string('traveler_name', 255).notNullable()
      table.date('travel_start').nullable()
      table.date('travel_end').nullable()
      table.text('itinerary_service').nullable()
      table.string('invoice_receipt_number', 100).nullable()
      table
        .integer('supplier_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('suppliers')
        .onDelete('SET NULL')
      table.string('supplier_name', 255).nullable()
      table
        .integer('supplier_invoice_document_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('documents')
        .onDelete('SET NULL')
      table.string('trip_name', 255).nullable()
      table.string('trip_reason', 255).nullable()
      table.string('cost_center', 255).nullable()
      table.date('date_requested').nullable()
      table.string('approved_by', 255).nullable()
      table.string('general_ledger_account', 255).nullable()
      table
        .enum('dz_payment_status', ['NOT_PAID', 'PAID', 'PARTIAL'])
        .notNullable()
        .defaultTo('NOT_PAID')
      table.date('dz_payment_date').nullable()
      table.string('dz_payment_reference', 100).nullable()
      table.decimal('amount_paid_by_dz', 15, 2).notNullable().defaultTo(0)
      table
        .enum('recovery_status', [
          'DRAFT',
          'PENDING_INVOICE',
          'READY_FOR_CLIENT',
          'SENT_TO_CLIENT',
          'UNDER_CLIENT_REVIEW',
          'APPROVED_BY_CLIENT',
          'QUERY_RAISED',
          'REJECTED',
          'RECOVERED',
          'VOID',
        ])
        .notNullable()
        .defaultTo('DRAFT')
      table.timestamp('sent_to_client_at').nullable()
      table.timestamp('client_reviewed_at').nullable()
      table.timestamp('client_approved_at').nullable()
      table.timestamp('recovered_at').nullable()
      table.text('client_query').nullable()
      table.text('rejection_reason').nullable()
      table
        .integer('created_by_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .integer('updated_by_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('recovery_report_audit_logs', (table) => {
      table.increments('id')
      table
        .integer('recovery_report_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('recovery_report_items')
        .onDelete('CASCADE')
      table.string('action', 100).notNullable()
      table.string('old_status', 100).nullable()
      table.string('new_status', 100).nullable()
      table.text('description').nullable()
      table
        .integer('performed_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .integer('performed_by_client_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('client_accounts')
        .onDelete('SET NULL')
      table.timestamp('performed_at').notNullable().defaultTo(this.now())
    })

    this.schema.alterTable('invoices', (table) => {
      table
        .integer('recovery_report_item_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('recovery_report_items')
        .onDelete('SET NULL')
        .after('booking_id')
    })
  }

  async down() {
    this.schema.alterTable('invoices', (table) => {
      table.dropForeign(['recovery_report_item_id'])
      table.dropColumn('recovery_report_item_id')
    })

    this.schema.dropTableIfExists('recovery_report_audit_logs')
    this.schema.dropTableIfExists('recovery_report_items')
    this.schema.dropTableIfExists('recovery_reports')

    this.schema.createTable('recovery_reports', (table) => {
      table.increments('id')
      table.string('reference', 40).notNullable().unique()
      table.integer('booking_id').unsigned().notNullable().references('id').inTable('bookings').onDelete('CASCADE')
      table.integer('quotation_id').unsigned().nullable().references('id').inTable('quotations').onDelete('SET NULL')
      table.integer('branch_id').unsigned().notNullable().references('id').inTable('branches').onDelete('RESTRICT')
      table.integer('created_by_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table
        .enum('status', ['draft', 'sent', 'client_confirmed', 'client_rejected', 'superseded'])
        .notNullable()
        .defaultTo('draft')
      table.text('notes').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamp('client_confirmed_at').nullable()
      table.timestamp('client_rejected_at').nullable()
      table.integer('document_id').unsigned().nullable().references('id').inTable('documents').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }
}
