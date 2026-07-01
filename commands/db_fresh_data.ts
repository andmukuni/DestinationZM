import { BaseCommand, flags } from '@adonisjs/core/ace'
import db from '@adonisjs/lucid/services/db'
import type { CommandOptions } from '@adonisjs/core/types/ace'

const PRESERVED_TABLES = new Set([
  'users',
  'branches',
  'role_permissions',
  'adonis_schema',
  'adonis_schema_versions',
])

export default class DbFreshData extends BaseCommand {
  static commandName = 'db:fresh-data'
  static description = 'Delete all business data and keep admin users, branches, and role permissions'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Skip confirmation prompt' })
  declare force: boolean

  async run() {
    const confirmed =
      this.force ||
      (await this.prompt.confirm(
        'This will permanently delete all bookings, customers, enquiries, invoices, and portal accounts. Users will be kept. Continue?'
      ))

    if (!confirmed) {
      this.logger.warning('Cancelled.')
      return
    }

    const result = await db.rawQuery('SHOW TABLES')
    const rows = result[0] as Array<Record<string, string>>
    const tables = rows.map((row) => Object.values(row)[0]!)

    const toTruncate = tables.filter((table) => !PRESERVED_TABLES.has(table))

    this.logger.info(`Truncating ${toTruncate.length} tables...`)

    await db.rawQuery('SET FOREIGN_KEY_CHECKS = 0')

    for (const table of toTruncate) {
      await db.rawQuery(`TRUNCATE TABLE \`${table}\``)
      this.logger.success(`Truncated ${table}`)
    }

    await db.rawQuery('SET FOREIGN_KEY_CHECKS = 1')

    this.logger.success('Database reset complete. Users, branches, and role permissions were preserved.')
    this.logger.info(
      'Run `node ace db:seed --files database/seeders/08_portal_booking_types_seeder.ts` to restore enquiry form types.'
    )
  }
}
