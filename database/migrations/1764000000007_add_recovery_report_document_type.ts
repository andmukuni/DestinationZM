import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE documents MODIFY document_type ENUM(
          'quotation','booking_confirmation','supplier_document','invoice','receipt',
          'recovery_schedule','recovery_report','payment_record','travel_supporting','excel_report'
        ) NOT NULL`
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE documents MODIFY document_type ENUM(
          'quotation','booking_confirmation','supplier_document','invoice','receipt',
          'recovery_schedule','payment_record','travel_supporting','excel_report'
        ) NOT NULL`
      )
    })
  }
}
