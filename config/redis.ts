import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'

export default defineConfig({
  connection: 'main',
  connections: {
    main: {
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      username: env.get('REDIS_USERNAME') || undefined,
      password: env.get('REDIS_PASSWORD') || undefined,
      db: 0,
      keyPrefix: 'destination-zm:',
    },
  },
})
