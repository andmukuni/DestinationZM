/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

/**
 * Coolify / Laravel-style env aliases (LoanTrack-compatible).
 */
if (!process.env.APP_URL?.trim() && process.env.SERVICE_URL_APP?.trim()) {
  process.env.APP_URL = process.env.SERVICE_URL_APP.trim()
}

if (!process.env.DB_USER?.trim() && process.env.DB_USERNAME?.trim()) {
  process.env.DB_USER = process.env.DB_USERNAME.trim()
}

if (!process.env.NODE_ENV?.trim() && process.env.APP_ENV?.trim()) {
  const appEnv = process.env.APP_ENV.trim()
  process.env.NODE_ENV = appEnv === 'production' ? 'production' : appEnv === 'test' ? 'test' : 'development'
}

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'file', 'database', 'redis'] as const),
  // Database
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // Redis
  REDIS_HOST: Env.schema.string({ format: 'host' }),
  REDIS_PORT: Env.schema.number(),
  REDIS_USERNAME: Env.schema.string.optional(),
  REDIS_PASSWORD: Env.schema.string.optional(),

  // QuickBooks Online (optional — sync disabled when unset)
  QUICKBOOKS_CLIENT_ID: Env.schema.string.optional(),
  QUICKBOOKS_CLIENT_SECRET: Env.schema.string.optional(),
  QUICKBOOKS_REDIRECT_URI: Env.schema.string.optional(),
  QUICKBOOKS_ENVIRONMENT: Env.schema.enum.optional(['sandbox', 'production'] as const),
  QUICKBOOKS_SCOPES: Env.schema.string.optional(),

  // SMTP (optional fallback — prefer Settings UI)
  SMTP_HOST: Env.schema.string.optional(),
  SMTP_PORT: Env.schema.number.optional(),
  SMTP_SECURE: Env.schema.boolean.optional(),
  SMTP_USER: Env.schema.string.optional(),
  SMTP_PASSWORD: Env.schema.string.optional(),
  MAIL_FROM: Env.schema.string.optional(),
  MAIL_FROM_NAME: Env.schema.string.optional(),

  // SMS (optional fallback)
  SMS_PROVIDER: Env.schema.enum.optional(['twilio', 'africas_talking', 'custom'] as const),
  SMS_ACCOUNT_SID: Env.schema.string.optional(),
  SMS_AUTH_TOKEN: Env.schema.string.optional(),
  SMS_FROM_NUMBER: Env.schema.string.optional(),

  // WhatsApp (optional fallback)
  WHATSAPP_PROVIDER: Env.schema.enum.optional(['meta', 'twilio', 'custom'] as const),
  WHATSAPP_API_KEY: Env.schema.string.optional(),
  WHATSAPP_PHONE_NUMBER_ID: Env.schema.string.optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: Env.schema.string.optional(),
  WHATSAPP_FROM_NUMBER: Env.schema.string.optional(),
})
