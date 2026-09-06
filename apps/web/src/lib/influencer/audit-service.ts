import db from '@/lib/db';

export interface AuditEventInput {
  action: string;
  entity: string;
  entityId?: string | null;
  userId?: string | null;
  metadata?: Record<string, any> | null;
}

/**
 * Records an audit event using the platform's canonical SystemLog model.
 */
export async function logInfluencerAuditEvent(event: AuditEventInput): Promise<void> {
  try {
    await db.systemLog.create({
      data: {
        action: `INFLUENCER_${event.action.toUpperCase()}`,
        entity: event.entity,
        entityId: event.entityId || null,
        userId: event.userId || null,
        metadata: event.metadata || {},
      },
    });
  } catch (error) {
    // Non-blocking: audit logs should never crash the primary business operation
    console.error('[Influencer Audit Log Error]', error);
  }
}
