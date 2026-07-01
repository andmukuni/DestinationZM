import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'report_runs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('template_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('report_templates')
        .onDelete('CASCADE')
      table
        .integer('generated_by_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.json('parameters').nullable()
      table
        .integer('output_document_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('documents')
        .onDelete('SET NULL')
      table.enum('status', ['pending', 'completed', 'failed']).notNullable().defaultTo('pending')
      table.text('error_message').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
