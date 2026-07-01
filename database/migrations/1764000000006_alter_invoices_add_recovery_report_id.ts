import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invoices'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('recovery_report_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('recovery_reports')
        .onDelete('SET NULL')
        .after('booking_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['recovery_report_id'])
      table.dropColumn('recovery_report_id')
    })
  }
}
