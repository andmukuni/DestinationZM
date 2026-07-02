import redis from '@adonisjs/redis/services/main'
import SecuritySettingsService from '#services/settings/security_settings_service'

export default class LoginRateLimitService {
  static async settings() {
    return SecuritySettingsService.rateLimitSettings()
  }

  private static key(route: string, ip: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    return `login:${route}:${ip}:${normalizedEmail}`
  }

  static async isLocked(route: string, ip: string, email: string) {
    const { maxAttempts } = await this.settings()
    const value = await redis.get(this.key(route, ip, email))
    const attempts = value ? Number(value) : 0
    return Number.isFinite(attempts) && attempts >= maxAttempts
  }

  static async recordFailure(route: string, ip: string, email: string) {
    const { maxAttempts, windowMinutes } = await this.settings()
    const redisKey = this.key(route, ip, email)
    const attempts = await redis.incr(redisKey)

    if (attempts === 1) {
      await redis.expire(redisKey, windowMinutes * 60)
    }

    return attempts >= maxAttempts
  }

  static async clear(route: string, ip: string, email: string) {
    await redis.del(this.key(route, ip, email))
  }

  static lockoutMessage() {
    return 'Too many sign-in attempts. Please wait a few minutes and try again.'
  }
}
