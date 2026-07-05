import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accommodations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
      table.enum('kind', ['hotel', 'lodge', 'apartment']).notNullable()
      table.string('city', 120).notNullable()
      table.string('region', 120).nullable()
      table.string('country', 120).notNullable()
      table.json('keywords').nullable()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['city', 'country'])
      table.index(['kind', 'active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
