import User from '#models/user'
import { DateTime } from 'luxon'

const THROTTLE_MINUTES = 5

export default class UserActivityService {
  static async touchLastAccessed(user: User, force = false) {
    const now = DateTime.now()

    if (
      !force &&
      user.lastAccessedAt &&
      now.diff(user.lastAccessedAt, 'minutes').minutes < THROTTLE_MINUTES
    ) {
      return
    }

    await user.merge({ lastAccessedAt: now }).save()
  }

  static formatLastAccessed(at: DateTime | null) {
    if (!at) {
      return 'Never'
    }

    const hoursAgo = DateTime.now().diff(at, 'hours').hours
    if (hoursAgo < 24) {
      return at.toRelative({ style: 'long' }) ?? at.toFormat('HH:mm')
    }

    return at.toFormat('dd LLL yyyy · HH:mm')
  }
}
