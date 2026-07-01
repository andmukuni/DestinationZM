import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('portal_booking_types', (table) => {
      table.increments('id')
      table.string('slug', 60).notNullable().unique()
      table.string('name', 120).notNullable()
      table.text('description').nullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('portal_booking_fields', (table) => {
      table.increments('id')
      table
        .integer('portal_booking_type_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('portal_booking_types')
        .onDelete('CASCADE')
      table.string('field_key', 60).notNullable()
      table.string('label', 120).notNullable()
      table
        .enum('field_type', ['text', 'number', 'date', 'textarea', 'select'])
        .notNullable()
        .defaultTo('text')
      table.string('placeholder', 255).nullable()
      table.boolean('required').notNullable().defaultTo(false)
      table.json('options').nullable()
      table.integer('sort_order').notNullable().defaultTo(0)
      table
        .enum('maps_to', [
          'destination',
          'depart_date',
          'return_date',
          'pax',
          'product_type',
          'notes_line',
          'custom',
        ])
        .notNullable()
        .defaultTo('custom')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['portal_booking_type_id', 'field_key'])
    })

    this.schema.alterTable('bookings', (table) => {
      table
        .integer('portal_booking_type_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('portal_booking_types')
        .onDelete('SET NULL')
      table.json('enquiry_data').nullable()
    })
  }

  async down() {
    this.schema.alterTable('bookings', (table) => {
      table.dropForeign(['portal_booking_type_id'])
      table.dropColumn('portal_booking_type_id')
      table.dropColumn('enquiry_data')
    })
    this.schema.dropTable('portal_booking_fields')
    this.schema.dropTable('portal_booking_types')
  }
}
