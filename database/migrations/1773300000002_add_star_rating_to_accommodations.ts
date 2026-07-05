import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.tinyint('star_rating').unsigned().nullable()
      table.index(['city', 'star_rating', 'active'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['city', 'star_rating', 'active'])
      table.dropColumn('star_rating')
    })
  }
}
