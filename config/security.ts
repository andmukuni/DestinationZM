import env from '#start/env'

/**
 * Secure cookies when APP_URL is HTTPS, or when SESSION_SECURE_COOKIE is set (LoanTrack-style).
 */
export function useSecureCookies() {
  const explicit = env.get('SESSION_SECURE_COOKIE')
  if (explicit !== undefined) {
    return explicit
  }

  return env.get('APP_URL').startsWith('https://')
}

export function useHttpsHeaders() {
  return env.get('APP_URL').startsWith('https://')
}
