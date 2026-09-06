import db from '@/lib/db';
import { logInfluencerAuditEvent } from './audit-service';

/**
 * Schedules event appearance or hosted visit logistics for an assigned creator
 */
export async function scheduleCreatorAttendance(input: {
  campaignCreatorId: string;
  eventDate: Date | string;
  arrivalWindowStart?: string | null;
  arrivalWindowEnd?: string | null;
  guestCount?: number;
  guestNames?: string[];
  accreditationReference?: string | null;
  complimentaryTicketCount?: number;
  qrReference?: string | null;
  parkingInstructions?: string | null;
  specialRequirements?: string | null;
  assignedContactId?: string | null;
  operationalNotes?: string | null;
  actorId?: string;
}) {
  const attendance = await (db as any).influencerAttendance.create({
    data: {
      campaignCreatorId: input.campaignCreatorId,
      eventDate: new Date(input.eventDate),
      arrivalWindowStart: input.arrivalWindowStart || null,
      arrivalWindowEnd: input.arrivalWindowEnd || null,
      guestCount: input.guestCount || 0,
      guestNamesJson: input.guestNames || [],
      accreditationReference: input.accreditationReference || null,
      complimentaryTicketCount: input.complimentaryTicketCount || 0,
      qrReference: input.qrReference || `E3-CREATOR-${Date.now().toString(36).toUpperCase()}`,
      parkingInstructions: input.parkingInstructions || null,
      specialRequirements: input.specialRequirements || null,
      assignedContactId: input.assignedContactId || null,
      operationalNotes: input.operationalNotes || null,
      status: 'PENDING',
    },
  });

  await logInfluencerAuditEvent({
    action: 'SCHEDULE_ATTENDANCE',
    entity: 'InfluencerAttendance',
    entityId: attendance.id,
    userId: input.actorId,
    metadata: { campaignCreatorId: input.campaignCreatorId, eventDate: input.eventDate },
  });

  return attendance;
}

/**
 * Checks in creator at venue gate / reception
 */
export async function checkInCreatorAttendance(attendanceId: string, actorId?: string) {
  const updated = await (db as any).influencerAttendance.update({
    where: { id: attendanceId },
    data: {
      status: 'CHECKED_IN',
      checkedInAt: new Date(),
    },
  });

  await logInfluencerAuditEvent({
    action: 'CHECK_IN_ATTENDANCE',
    entity: 'InfluencerAttendance',
    entityId: attendanceId,
    userId: actorId,
  });

  return updated;
}

/**
 * Checks out creator after event appearance
 */
export async function checkOutCreatorAttendance(attendanceId: string, actorId?: string) {
  const updated = await (db as any).influencerAttendance.update({
    where: { id: attendanceId },
    data: {
      status: 'CHECKED_OUT',
      checkedOutAt: new Date(),
    },
  });

  await logInfluencerAuditEvent({
    action: 'CHECK_OUT_ATTENDANCE',
    entity: 'InfluencerAttendance',
    entityId: attendanceId,
    userId: actorId,
  });

  return updated;
}
