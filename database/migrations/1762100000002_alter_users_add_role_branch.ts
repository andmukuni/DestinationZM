import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('role', ['admin', 'manager', 'travel_agent'])
        .notNullable()
        .defaultTo('travel_agent')
      table.integer('branch_id').unsigned().nullable().references('id').inTable('branches').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['branch_id'])
      table.dropColumn('branch_id')
      table.dropColumn('role')
    })
  }
}
