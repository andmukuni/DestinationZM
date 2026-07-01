#!/usr/bin/env node
/**
 * Import a SQL dump file into MySQL.
 * Usage: DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_DATABASE=... node scripts/db_import.mjs [dumpPath]
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import mysql from 'mysql2/promise'

const dumpPath = resolve(process.argv[2] ?? 'storage/backups/destinationzm-local.sql')

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE,
  multipleStatements: true,
}

if (!config.host || !config.user || !config.database) {
  console.error('Set DB_HOST, DB_USER, DB_DATABASE (and optional DB_PASSWORD, DB_PORT).')
  process.exit(1)
}

const sql = readFileSync(dumpPath, 'utf8')

const conn = await mysql.createConnection(config)
console.log(`Importing ${dumpPath} into ${config.user}@${config.host}:${config.port}/${config.database} ...`)
await conn.query(sql)
await conn.end()
console.log('Import complete.')
