// Shared helpers for the staff doctor endpoints: database mapping, counting future bookings, audit rows.
import type { Doctor } from '@prisma/client';
import { prisma } from './db';
import type { DoctorInput } from './doctorsAdmin';

export function serializeDoctor(d: Doctor) {
  return {
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    experienceYears: d.experienceYears,
    workingDays: d.workingDays.split(',').map(Number),
    workingHoursStart: d.workingHoursStart,
    workingHoursEnd: d.workingHoursEnd,
    slotDurationMinutes: d.slotDurationMinutes,
    isActive: d.isActive,
  };
}

export function toDbData(v: Partial<DoctorInput>) {
  const data: Record<string, unknown> = {};
  if (v.name !== undefined) data.name = v.name;
  if (v.specialty !== undefined) data.specialty = v.specialty;
  if (v.experienceYears !== undefined) data.experienceYears = v.experienceYears;
  if (v.workingDays !== undefined) data.workingDays = v.workingDays.join(',');
  if (v.workingHoursStart !== undefined) data.workingHoursStart = v.workingHoursStart;
  if (v.workingHoursEnd !== undefined) data.workingHoursEnd = v.workingHoursEnd;
  if (v.slotDurationMinutes !== undefined) data.slotDurationMinutes = v.slotDurationMinutes;
  if (v.isActive !== undefined) data.isActive = v.isActive;
  return data;
}

const ACTIVE = ['pending', 'confirmed', 'reschedule_requested'] as const;

export async function countFutureActiveAppointments(doctorId: string): Promise<number> {
  return prisma.appointment.count({
    where: { doctorId, dateTime: { gte: new Date() }, status: { in: [...ACTIVE] } },
  });
}

export async function writeAdminAudit(actorId: number | string, action: string, doctorId: string, details: string) {
  await prisma.auditLog.create({
    data: { actorType: 'admin', actorId: String(actorId), action, details: `doctor:${doctorId} ${details}`, appointmentId: null },
  });
}
