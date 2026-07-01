import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'portal_registration_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('full_name', 120).notNullable()
      table.string('email', 255).notNullable()
      table.string('company', 255).nullable()
      table.string('phone', 64).nullable()
      table.text('message').nullable()
      table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['email', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
