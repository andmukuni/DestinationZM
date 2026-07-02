import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('quickbooks_sync_records', (table) => {
      table.string('last_intuit_tid', 64).nullable()
    })

    this.schema.alterTable('users', (table) => {
      table.boolean('mfa_enabled').notNullable().defaultTo(false)
      table.text('mfa_secret_encrypted').nullable()
      table.timestamp('mfa_confirmed_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable('quickbooks_sync_records', (table) => {
      table.dropColumn('last_intuit_tid')
    })

    this.schema.alterTable('users', (table) => {
      table.dropColumn('mfa_enabled')
      table.dropColumn('mfa_secret_encrypted')
      table.dropColumn('mfa_confirmed_at')
    })
  }
}
