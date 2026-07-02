import { BaseSchema } from '@adonisjs/lucid/schema'

async function columnExists(
  db: Parameters<Parameters<BaseSchema['defer']>[0]>[0],
  tableName: string,
  columnName: string
) {
  const result = await db.rawQuery(
    `
    SELECT COUNT(*) AS count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
  `,
    [tableName, columnName]
  )

  const rows = result[0] as Array<{ count: number | string }>
  return Number(rows[0]?.count ?? 0) > 0
}

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      if (!(await columnExists(db, 'quickbooks_sync_records', 'last_intuit_tid'))) {
        await db.rawQuery(`
          ALTER TABLE quickbooks_sync_records
            MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            ADD COLUMN last_intuit_tid VARCHAR(64) NULL
        `)
      }
    })

    this.defer(async (db) => {
      if (!(await columnExists(db, 'users', 'mfa_enabled'))) {
        await db.rawQuery(`
          ALTER TABLE users
            MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            MODIFY COLUMN updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
            ADD COLUMN mfa_enabled TINYINT(1) NOT NULL DEFAULT 0,
            ADD COLUMN mfa_secret_encrypted TEXT NULL,
            ADD COLUMN mfa_confirmed_at TIMESTAMP NULL DEFAULT NULL
        `)
      }
    })
  }

  async down() {
    this.defer(async (db) => {
      if (await columnExists(db, 'quickbooks_sync_records', 'last_intuit_tid')) {
        await db.rawQuery(`ALTER TABLE quickbooks_sync_records DROP COLUMN last_intuit_tid`)
      }
    })

    this.defer(async (db) => {
      if (await columnExists(db, 'users', 'mfa_enabled')) {
        await db.rawQuery(`
          ALTER TABLE users
            DROP COLUMN mfa_enabled,
            DROP COLUMN mfa_secret_encrypted,
            DROP COLUMN mfa_confirmed_at
        `)
      }
    })
  }
}
