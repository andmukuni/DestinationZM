import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('portal_booking_types', (table) => {
      table.string('tab_label', 120).nullable()
      table.string('icon_key', 40).nullable()
    })

    this.schema.raw(`
      ALTER TABLE portal_booking_fields
      MODIFY COLUMN field_type ENUM('text', 'number', 'date', 'textarea', 'select', 'checkbox', 'time', 'radio')
      NOT NULL DEFAULT 'text'
    `)
  }

  async down() {
    this.schema.alterTable('portal_booking_types', (table) => {
      table.dropColumn('tab_label')
      table.dropColumn('icon_key')
    })

    this.schema.raw(`
      ALTER TABLE portal_booking_fields
      MODIFY COLUMN field_type ENUM('text', 'number', 'date', 'textarea', 'select')
      NOT NULL DEFAULT 'text'
    `)
  }
}
