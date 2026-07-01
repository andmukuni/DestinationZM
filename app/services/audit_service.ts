import AuditLog from '#models/audit_log'

type LogActionInput = {
  action: string
  entityType: string
  entityId?: number | null
  userId?: number | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
}

export default class AuditService {
  static async log(input: LogActionInput) {
    return AuditLog.create({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      userId: input.userId ?? null,
      metadata: input.metadata ?? null,
      ipAddress: input.ipAddress ?? null,
    })
  }

  static listForEntity(entityType: string, entityId: number) {
    return AuditLog.query()
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .preload('user')
      .orderBy('created_at', 'desc')
  }
}
