import { DateTime } from 'luxon'
import Notification from '#models/notification'
import User from '#models/user'

type CreateNotificationInput = {
  userId: number
  type: string
  title: string
  body?: string | null
  entityType?: string | null
  entityId?: number | null
}

export default class NotificationService {
  static async create(input: CreateNotificationInput) {
    return Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      readAt: null,
    })
  }

  static async notifyRoles(
    roles: string[],
    input: Omit<CreateNotificationInput, 'userId'>
  ) {
    const users = await User.query().whereIn('role', roles)
    const notifications = await Promise.all(
      users.map((user) => this.create({ ...input, userId: user.id }))
    )
    return notifications
  }

  static async forUser(userId: number, limit = 10) {
    return Notification.query()
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  static async unreadCount(userId: number) {
    const [{ $extras }] = await Notification.query()
      .where('user_id', userId)
      .whereNull('read_at')
      .count('* as total')
    return Number($extras.total)
  }

  static async markRead(userId: number, notificationId: number) {
    const notification = await Notification.query()
      .where('id', notificationId)
      .where('user_id', userId)
      .firstOrFail()
    notification.readAt = notification.readAt ?? DateTime.now()
    await notification.save()
    return notification
  }
}
