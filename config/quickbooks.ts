import env from '#start/env'

export type QuickbooksEnvironment = 'sandbox' | 'production'

/** Static QuickBooks defaults. Credentials are loaded from the database (with env fallback). */
export default {
  scopes: env.get('QUICKBOOKS_SCOPES') ?? 'com.intuit.quickbooks.accounting',
  minorVersion: '75',
  maxSyncAttempts: 5,
}
