import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'quotations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('line_items').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('line_items')
    })
  }
}
