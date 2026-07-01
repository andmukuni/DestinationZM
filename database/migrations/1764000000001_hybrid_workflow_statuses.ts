import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE bookings MODIFY status ENUM(
          'enquiry_submitted','quotation_preparing','quotation_sent','quotation_approved',
          'confirmed','recovery_preparing','recovery_sent','recovery_confirmed',
          'invoiced','paid','closed','cancelled','draft'
        ) NOT NULL DEFAULT 'draft'`
      )
      await db.rawQuery(`UPDATE bookings SET status = 'enquiry_submitted' WHERE status = 'draft' AND id > 0`)

      await db.rawQuery(
        `ALTER TABLE quotations MODIFY status ENUM(
          'draft','sent','client_approved','client_rejected','expired','superseded','approved','rejected'
        ) NOT NULL DEFAULT 'draft'`
      )
      await db.rawQuery(`UPDATE quotations SET status = 'client_approved' WHERE status = 'approved'`)
      await db.rawQuery(`UPDATE quotations SET status = 'client_rejected' WHERE status = 'rejected'`)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE bookings MODIFY status ENUM('draft','confirmed','invoiced','paid','closed','cancelled') NOT NULL DEFAULT 'draft'`
      )
      await db.rawQuery(
        `ALTER TABLE quotations MODIFY status ENUM('draft','sent','approved','rejected','expired') NOT NULL DEFAULT 'draft'`
      )
    })
  }
}
