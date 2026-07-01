import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('system_settings', (table) => {
      table.increments('id')
      table.string('group', 64).notNullable()
      table.string('key', 128).notNullable()
      table.text('value').nullable()
      table.boolean('is_secret').notNullable().defaultTo(false)
      table
        .integer('updated_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['group', 'key'])
    })

    this.schema.createTable('smtp_settings', (table) => {
      table.increments('id')
      table.string('host', 255).nullable()
      table.integer('port').notNullable().defaultTo(587)
      table.boolean('secure').notNullable().defaultTo(false)
      table.string('username', 255).nullable()
      table.text('password_encrypted').nullable()
      table.string('from_address', 255).nullable()
      table.string('from_name', 255).nullable()
      table.boolean('enabled').notNullable().defaultTo(false)
      table
        .integer('updated_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('sms_settings', (table) => {
      table.increments('id')
      table.enum('provider', ['twilio', 'africas_talking', 'custom']).notNullable().defaultTo('twilio')
      table.string('account_sid', 255).nullable()
      table.text('auth_token_encrypted').nullable()
      table.string('from_number', 64).nullable()
      table.boolean('enabled').notNullable().defaultTo(false)
      table
        .integer('updated_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('whatsapp_settings', (table) => {
      table.increments('id')
      table.enum('provider', ['meta', 'twilio', 'custom']).notNullable().defaultTo('meta')
      table.text('api_key_encrypted').nullable()
      table.string('phone_number_id', 128).nullable()
      table.string('business_account_id', 128).nullable()
      table.string('from_number', 64).nullable()
      table.boolean('enabled').notNullable().defaultTo(false)
      table
        .integer('updated_by_user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('whatsapp_settings')
    this.schema.dropTable('sms_settings')
    this.schema.dropTable('smtp_settings')
    this.schema.dropTable('system_settings')
  }
}
