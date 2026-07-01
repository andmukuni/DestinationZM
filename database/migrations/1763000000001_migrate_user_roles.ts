import { BaseSchema } from '@adonisjs/lucid/schema'

const NEW_ROLES =
  "'admin','finance','reservations','operations','recovery','management','executive'"

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE users MODIFY role ENUM('admin','manager','travel_agent','finance','reservations','operations','recovery','management','executive') NOT NULL DEFAULT 'travel_agent'`
      )
      await db.rawQuery(`UPDATE users SET role = 'management' WHERE role = 'manager'`)
      await db.rawQuery(`UPDATE users SET role = 'reservations' WHERE role = 'travel_agent'`)
      await db.rawQuery(
        `ALTER TABLE users MODIFY role ENUM(${NEW_ROLES}) NOT NULL DEFAULT 'reservations'`
      )

      await db.rawQuery(
        `ALTER TABLE role_permissions MODIFY role ENUM('admin','manager','travel_agent','finance','reservations','operations','recovery','management','executive') NOT NULL`
      )
      await db.rawQuery(`UPDATE role_permissions SET role = 'management' WHERE role = 'manager'`)
      await db.rawQuery(`UPDATE role_permissions SET role = 'reservations' WHERE role = 'travel_agent'`)
      await db.rawQuery(`DELETE FROM role_permissions WHERE role IN ('admin')`)
      await db.rawQuery(
        `ALTER TABLE role_permissions MODIFY role ENUM(${NEW_ROLES}) NOT NULL`
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(
        `ALTER TABLE users MODIFY role ENUM('admin','manager','travel_agent','finance','reservations','operations','recovery','management','executive') NOT NULL DEFAULT 'reservations'`
      )
      await db.rawQuery(`UPDATE users SET role = 'manager' WHERE role IN ('management', 'executive')`)
      await db.rawQuery(
        `UPDATE users SET role = 'travel_agent' WHERE role IN ('finance', 'reservations', 'operations', 'recovery')`
      )
      await db.rawQuery(
        `ALTER TABLE users MODIFY role ENUM('admin','manager','travel_agent') NOT NULL DEFAULT 'travel_agent'`
      )

      await db.rawQuery(
        `ALTER TABLE role_permissions MODIFY role ENUM('admin','manager','travel_agent','finance','reservations','operations','recovery','management','executive') NOT NULL`
      )
      await db.rawQuery(`UPDATE role_permissions SET role = 'manager' WHERE role IN ('management', 'executive')`)
      await db.rawQuery(
        `UPDATE role_permissions SET role = 'travel_agent' WHERE role IN ('finance', 'reservations', 'operations', 'recovery')`
      )
      await db.rawQuery(
        `ALTER TABLE role_permissions MODIFY role ENUM('admin','manager','travel_agent') NOT NULL`
      )
    })
  }
}
