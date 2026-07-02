export const QUICKBOOKS_RECONNECT_MESSAGE =
  'QuickBooks authorization expired or was revoked. Go to Settings → QuickBooks and click Connect QuickBooks to reconnect.'

export class QuickbooksReconnectRequiredError extends Error {
  readonly code = 'quickbooks_reconnect_required'

  constructor(message = QUICKBOOKS_RECONNECT_MESSAGE, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'QuickbooksReconnectRequiredError'
  }
}

function errorText(error: unknown) {
  if (error instanceof Error) {
    return `${error.name} ${error.message} ${String((error as { error?: string }).error ?? '')}`
  }
  return String(error)
}

export function isQuickbooksReconnectRequired(error: unknown) {
  const text = errorText(error).toLowerCase()
  return (
    text.includes('invalid_grant') ||
    text.includes('refresh token') ||
    text.includes('token refresh failed') ||
    text.includes('authorization expired') ||
    text.includes('quickbooks_reconnect_required')
  )
}
