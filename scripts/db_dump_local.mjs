#!/usr/bin/env node
/**
 * Export local MySQL database to a SQL file (schema + data).
 * Usage: node scripts/db_dump_local.mjs [outputPath]
 */
import { createWriteStream, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import mysql from 'mysql2/promise'

const output =
  process.argv[2] ??
  resolve('storage/backups/destinationzm-local.sql')

const config = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'DestinationZM',
}

mkdirSync(dirname(output), { recursive: true })

const conn = await mysql.createConnection({
  ...config,
  multipleStatements: true,
})

const out = createWriteStream(output, 'utf8')
const write = (line = '') => out.write(`${line}\n`)

write('-- DestinationZM local database dump')
write(`-- Generated: ${new Date().toISOString()}`)
write(`-- Database: ${config.database}`)
write('SET NAMES utf8mb4;')
write('SET FOREIGN_KEY_CHECKS=0;')
write('SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";')

const [tables] = await conn.query('SHOW TABLES')
const tableKey = `Tables_in_${config.database}`

for (const row of tables) {
  const table = row[tableKey]
  write()
  write(`-- Table: ${table}`)

  const [createRows] = await conn.query(`SHOW CREATE TABLE \`${table}\``)
  write(`DROP TABLE IF EXISTS \`${table}\`;`)
  write(`${createRows[0]['Create Table']};`)

  const [rows] = await conn.query(`SELECT * FROM \`${table}\``)
  if (rows.length === 0) {
    continue
  }

  const columns = Object.keys(rows[0])
  const colList = columns.map((c) => `\`${c}\``).join(', ')

  for (const record of rows) {
    const values = columns
      .map((col) => {
        const value = record[col]
        if (value === null) return 'NULL'
        if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
        if (Buffer.isBuffer(value)) return `X'${value.toString('hex')}'`
        if (typeof value === 'number') return String(value)
        if (typeof value === 'boolean') return value ? '1' : '0'
        if (typeof value === 'object') {
          return `'${JSON.stringify(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`
        }
        return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`
      })
      .join(', ')

    write(`INSERT INTO \`${table}\` (${colList}) VALUES (${values});`)
  }
}

write('SET FOREIGN_KEY_CHECKS=1;')

await conn.end()
await new Promise((resolvePromise, reject) => {
  out.end(() => resolvePromise())
  out.on('error', reject)
})

console.log(`Dump written to ${output}`)
