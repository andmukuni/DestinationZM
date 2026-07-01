import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .enum('document_type', [
          'quotation',
          'booking_confirmation',
          'supplier_document',
          'invoice',
          'receipt',
          'recovery_schedule',
          'payment_record',
          'travel_supporting',
          'excel_report',
        ])
        .notNullable()
      table.string('title', 255).notNullable()
      table.string('file_path', 500).notNullable()
      table.string('mime_type', 120).nullable()
      table.integer('file_size').unsigned().nullable()
      table.string('reference_type', 80).nullable()
      table.integer('reference_id').unsigned().nullable()
      table
        .integer('uploaded_by_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table
        .integer('branch_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('branches')
        .onDelete('SET NULL')
      table.enum('status', ['active', 'archived']).notNullable().defaultTo('active')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['reference_type', 'reference_id'])
      table.index(['document_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
