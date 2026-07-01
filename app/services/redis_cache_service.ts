import redis from '@adonisjs/redis/services/main'

export default class RedisCacheService {
  private static redisReady: boolean | null = null

  static async canUseRedis() {
    if (this.redisReady === false) {
      return false
    }

    try {
      await redis.ping()
      this.redisReady = true
      return true
    } catch {
      this.redisReady = false
      return false
    }
  }

  static async get(key: string) {
    if (!(await this.canUseRedis())) {
      return null
    }

    return redis.get(key)
  }

  static async set(key: string, value: string) {
    if (!(await this.canUseRedis())) {
      return false
    }

    await redis.set(key, value)
    return true
  }

  static async getNumber(key: string, fallback = 1) {
    const value = await this.get(key)
    return value ? Number(value) : fallback
  }

  static async incr(key: string) {
    if (!(await this.canUseRedis())) {
      return 1
    }

    return Number(await redis.incr(key))
  }
}
