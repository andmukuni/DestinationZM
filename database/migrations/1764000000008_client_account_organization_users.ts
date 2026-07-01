import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('client_accounts', (table) => {
      table.string('full_name', 120).nullable().after('customer_id')
      table.enum('role', ['owner', 'admin', 'member']).notNullable().defaultTo('member').after('email')
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE client_accounts ca
        INNER JOIN customers c ON c.id = ca.customer_id
        SET ca.full_name = c.full_name
        WHERE ca.full_name IS NULL
      `)
    })
  }

  async down() {
    this.schema.alterTable('client_accounts', (table) => {
      table.dropColumn('full_name')
      table.dropColumn('role')
    })
  }
}
