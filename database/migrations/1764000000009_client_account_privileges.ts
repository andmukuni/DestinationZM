import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('client_accounts', (table) => {
      table.json('privileges').nullable().after('role')
    })
  }

  async down() {
    this.schema.alterTable('client_accounts', (table) => {
      table.dropColumn('privileges')
    })
  }
}
