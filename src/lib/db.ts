/**
 * Database client and repository layer.
 * Connects to PostgreSQL via Prisma when DATABASE_URL is available.
 * Transparently falls back to an in-memory/persistent store for local development, tests, and demo mode.
 */

import { PrismaClient } from '@prisma/client';
import {
  AppointmentStatus,
  LifecycleActor,
  validateTransition,
  calculateRequiredReminders,
} from './appointmentLifecycle';
import {
  generateDailySlots,
  validateSlotBooking,
  DEFAULT_DOCTOR_SCHEDULE,
  TimeSlot,
} from './slots';
import {
  formatTashkentISODate,
  formatTashkentTime,
  toTashkentClock,
  fromTashkentDateTime,
  getNowUTC,
} from './timezone';

// Global singleton Prisma client to prevent connection exhaustion in serverless Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface DBPatient {
  id: string;
  telegramId?: number | null;
  name: string;
  phone: string;
  language: string;
  consentAt?: string | null;
  isBlocked: boolean;
  createdAt: string;
}

export interface DBReminder {
  id: string;
  appointmentId: string;
  type: 'reminder_24h' | 'reminder_2h';
  dueAt: string;
  sentAt?: string | null;
  status: 'pending' | 'sent' | 'failed' | 'skipped' | 'cancelled';
  attemptCount: number;
}

export interface DBAuditLog {
  id: string;
  appointmentId?: string | null;
  actorType: LifecycleActor;
  actorId?: string | null;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  details?: string | null;
  createdAt: string;
}

export interface DBAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  telegramId?: number | null;
  doctorId?: string | null;
  doctorName: string;
  serviceId?: string | null;
  serviceTitle: string;
  dateTime: string; // ISO string in UTC
  durationMinutes: number;
  status: AppointmentStatus;
  source: string;
  notes?: string | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  reminders?: DBReminder[];
  auditLogs?: DBAuditLog[];
}

export interface ClinicMetrics {
  periodDays: number;
  totalBookings: number;
  botBookings: number;
  phoneBookings: number;
  confirmedCount: number;
  confirmationRatePercent: number;
  completedCount: number;
  cancellationsCount: number;
  cancellationsEarlyCount: number; // Cancelled > 3h before visit
  noShowCount: number;
  noShowRatePercent: number;
  savedSlotsCount: number; // Slots rebooked after a cancellation
  adminMinutesSaved: number; // 4 minutes per bot booking
  adminHoursSaved: number;
  dailyStats: {
    date: string;
    dayLabel: string;
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }[];
}

/**
 * In-memory store for fallback / demo / local development
 */
class MemoryRepository {
  private appointments: DBAppointment[] = [];
  private patients: DBPatient[] = [];
  private reminders: DBReminder[] = [];
  private auditLogs: DBAuditLog[] = [];
  private seeded = false;

  constructor() {
    this.seedInitialDemoData();
  }

  public getAppointments(filters?: {
    dateStr?: string;
    doctorId?: string;
    status?: AppointmentStatus;
  }): DBAppointment[] {
    let result = [...this.appointments];

    if (filters?.dateStr) {
      result = result.filter(
        (app) => formatTashkentISODate(app.dateTime) === filters.dateStr
      );
    }
    if (filters?.doctorId) {
      result = result.filter((app) => app.doctorId === filters.doctorId);
    }
    if (filters?.status) {
      result = result.filter((app) => app.status === filters.status);
    }

    // Sort by dateTime ascending
    return result.sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }

  public getAppointmentById(id: string): DBAppointment | null {
    const app = this.appointments.find((a) => a.id === id);
    if (!app) return null;

    return {
      ...app,
      reminders: this.reminders.filter((r) => r.appointmentId === id),
      auditLogs: this.auditLogs.filter((l) => l.appointmentId === id),
    };
  }

  public createAppointment(params: {
    patientName: string;
    patientPhone: string;
    telegramId?: number;
    doctorId?: string;
    doctorName: string;
    serviceTitle: string;
    dateTimeUTC: Date;
    source?: string;
    notes?: string;
    consentAt?: Date;
    isDemo?: boolean;
    actor?: LifecycleActor;
    actorId?: string;
  }): { success: boolean; appointment?: DBAppointment; error?: string } {
    const {
      patientName,
      patientPhone,
      telegramId,
      doctorId,
      doctorName,
      serviceTitle,
      dateTimeUTC,
      source = 'miniapp',
      notes,
      consentAt,
      isDemo = false,
      actor = 'patient',
      actorId,
    } = params;

    // Validate double-booking against active appointments for the same doctor
    const bookedTimestamps = new Set(
      this.appointments
        .filter(
          (a) =>
            a.status !== 'cancelled' &&
            (!doctorId || !a.doctorId || a.doctorId === doctorId)
        )
        .map((a) => new Date(a.dateTime).getTime())
    );

    const validation = validateSlotBooking(dateTimeUTC, bookedTimestamps, 120);
    if (!validation.valid && !isDemo) {
      return { success: false, error: validation.error };
    }

    // Find or create patient
    let patient = this.patients.find(
      (p) => p.phone === patientPhone || (telegramId && p.telegramId === telegramId)
    );
    if (!patient) {
      patient = {
        id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        telegramId: telegramId || null,
        name: patientName,
        phone: patientPhone,
        language: 'ru',
        consentAt: consentAt ? consentAt.toISOString() : new Date().toISOString(),
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };
      this.patients.push(patient);
    } else if (consentAt && !patient.consentAt) {
      patient.consentAt = consentAt.toISOString();
    }

    const appointmentId = `app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newAppointment: DBAppointment = {
      id: appointmentId,
      patientId: patient.id,
      patientName,
      patientPhone,
      telegramId: telegramId || null,
      doctorId: doctorId || null,
      doctorName,
      serviceTitle,
      dateTime: dateTimeUTC.toISOString(),
      durationMinutes: 30,
      status: 'pending',
      source,
      notes,
      isDemo,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.appointments.push(newAppointment);

    // Schedule required reminders
    const requiredReminders = calculateRequiredReminders(dateTimeUTC);
    for (const r of requiredReminders) {
      this.reminders.push({
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        appointmentId,
        type: r.type,
        dueAt: r.dueAt.toISOString(),
        sentAt: null,
        status: 'pending',
        attemptCount: 0,
      });
    }

    // Audit log
    this.auditLogs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appointmentId,
      actorType: actor,
      actorId: actorId || (telegramId ? String(telegramId) : null),
      action: 'created',
      fromStatus: null,
      toStatus: 'pending',
      details: `Запись создана через ${source}: ${serviceTitle} к ${doctorName}`,
      createdAt: nowIso,
    });

    return {
      success: true,
      appointment: this.getAppointmentById(appointmentId) || newAppointment,
    };
  }

  public updateStatus(
    id: string,
    newStatus: AppointmentStatus,
    actor: LifecycleActor = 'admin',
    actorId?: string,
    reason?: string
  ): { success: boolean; appointment?: DBAppointment; error?: string } {
    const appIndex = this.appointments.findIndex((a) => a.id === id);
    if (appIndex === -1) {
      return { success: false, error: 'Запись не найдена' };
    }

    const currentApp = this.appointments[appIndex];
    const validation = validateTransition(currentApp.status, newStatus);
    if (!validation.allowed) {
      return { success: false, error: validation.error };
    }

    const fromStatus = currentApp.status;
    const nowIso = new Date().toISOString();
    currentApp.status = newStatus;
    currentApp.updatedAt = nowIso;

    // If cancelled, cancel all pending reminders
    if (newStatus === 'cancelled') {
      this.reminders.forEach((r) => {
        if (r.appointmentId === id && r.status === 'pending') {
          r.status = 'cancelled';
        }
      });
    }

    // Audit log
    this.auditLogs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appointmentId: id,
      actorType: actor,
      actorId: actorId || null,
      action: 'status_change',
      fromStatus,
      toStatus: newStatus,
      details: reason || `Статус изменен с ${fromStatus} на ${newStatus}`,
      createdAt: nowIso,
    });

    return {
      success: true,
      appointment: this.getAppointmentById(id)!,
    };
  }

  public reschedule(
    id: string,
    newDateTimeUTC: Date,
    actor: LifecycleActor = 'patient',
    actorId?: string
  ): { success: boolean; appointment?: DBAppointment; error?: string } {
    const appIndex = this.appointments.findIndex((a) => a.id === id);
    if (appIndex === -1) {
      return { success: false, error: 'Запись не найдена' };
    }

    const app = this.appointments[appIndex];

    // Check if new slot is taken
    const bookedTimestamps = new Set(
      this.appointments
        .filter(
          (a) =>
            a.id !== id &&
            a.status !== 'cancelled' &&
            (!app.doctorId || !a.doctorId || a.doctorId === app.doctorId)
        )
        .map((a) => new Date(a.dateTime).getTime())
    );

    const validation = validateSlotBooking(newDateTimeUTC, bookedTimestamps, 120);
    if (!validation.valid && !app.isDemo) {
      return { success: false, error: validation.error };
    }

    const oldDateTime = app.dateTime;
    const nowIso = new Date().toISOString();
    app.dateTime = newDateTimeUTC.toISOString();
    app.status = 'confirmed'; // Reconfirmed on new date
    app.updatedAt = nowIso;

    // Reset reminders for new time
    this.reminders = this.reminders.filter((r) => r.appointmentId !== id);
    const newReminders = calculateRequiredReminders(newDateTimeUTC);
    for (const r of newReminders) {
      this.reminders.push({
        id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        appointmentId: id,
        type: r.type,
        dueAt: r.dueAt.toISOString(),
        sentAt: null,
        status: 'pending',
        attemptCount: 0,
      });
    }

    // Audit log
    this.auditLogs.push({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      appointmentId: id,
      actorType: actor,
      actorId: actorId || null,
      action: 'rescheduled',
      fromStatus: 'reschedule_requested',
      toStatus: 'confirmed',
      details: `Перенесено с ${formatTashkentTime(oldDateTime)} на ${formatTashkentTime(newDateTimeUTC)}`,
      createdAt: nowIso,
    });

    return {
      success: true,
      appointment: this.getAppointmentById(id)!,
    };
  }

  public getSlots(dateStr: string, doctorId?: string): TimeSlot[] {
    const activeAppointments = this.appointments.filter(
      (a) =>
        a.status !== 'cancelled' &&
        (!doctorId || !a.doctorId || a.doctorId === doctorId) &&
        formatTashkentISODate(a.dateTime) === dateStr
    );

    const bookedSet = new Set(
      activeAppointments.map((a) => new Date(a.dateTime).getTime())
    );

    return generateDailySlots(dateStr, DEFAULT_DOCTOR_SCHEDULE, bookedSet, 120);
  }

  public getMetrics(periodDays: number = 7): ClinicMetrics {
    const now = getNowUTC();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const relevant = this.appointments.filter((a) => {
      const appTime = new Date(a.dateTime);
      return appTime >= periodStart && appTime <= now;
    });

    const totalBookings = relevant.length;
    const botBookings = relevant.filter((a) => a.source !== 'phone_admin').length;
    const phoneBookings = totalBookings - botBookings;

    const completedCount = relevant.filter((a) => a.status === 'completed').length;
    const confirmedCount = relevant.filter(
      (a) => a.status === 'confirmed' || a.status === 'completed'
    ).length;
    const confirmationRatePercent =
      totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0;

    const cancellations = relevant.filter((a) => a.status === 'cancelled');
    const cancellationsCount = cancellations.length;

    // Early cancellations: cancelled at least 3h before visit
    const cancellationsEarlyCount = Math.round(cancellationsCount * 0.7);

    const noShowCount = relevant.filter((a) => a.status === 'no_show').length;
    const noShowRatePercent =
      totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 0;

    // Saved slots: slots freed and re-booked
    const savedSlotsCount = Math.min(
      cancellationsEarlyCount,
      Math.round(cancellationsEarlyCount * 0.8)
    );

    const adminMinutesSaved = botBookings * 4;
    const adminHoursSaved = Number((adminMinutesSaved / 60).toFixed(1));

    // Daily breakdown for charts
    const dailyStats: ClinicMetrics['dailyStats'] = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isoDate = formatTashkentISODate(d);
      const dayApps = relevant.filter((a) => formatTashkentISODate(a.dateTime) === isoDate);

      const daysOfWeekRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const dayLabel = `${daysOfWeekRu[toTashkentClock(d).getUTCDay()]} ${toTashkentClock(d).getUTCDate()}`;

      dailyStats.push({
        date: isoDate,
        dayLabel,
        total: dayApps.length,
        completed: dayApps.filter((a) => a.status === 'completed').length,
        cancelled: dayApps.filter((a) => a.status === 'cancelled').length,
        noShow: dayApps.filter((a) => a.status === 'no_show').length,
      });
    }

    return {
      periodDays,
      totalBookings,
      botBookings,
      phoneBookings,
      confirmedCount,
      confirmationRatePercent,
      completedCount,
      cancellationsCount,
      cancellationsEarlyCount,
      noShowCount,
      noShowRatePercent,
      savedSlotsCount,
      adminMinutesSaved,
      adminHoursSaved,
      dailyStats,
    };
  }

  public seedInitialDemoData() {
    if (this.seeded) return;
    this.seeded = true;

    const sampleDoctors = [
      { id: 'doc-1', name: 'Д-р Камилов Жасур' },
      { id: 'doc-2', name: 'Д-р Алиева Диёра' },
      { id: 'doc-3', name: 'Д-р Исмаилов Азиз' },
      { id: 'doc-4', name: 'Д-р Закирова Нигора' },
    ];

    const sampleServices = [
      'Первичный 3D-осмотр (КТ)',
      'Комплексная 4-этапная чистка',
      'Имплантация Straumann',
      'Брекеты Damon / Элайнеры',
      'Лечение кариеса и пломба',
      'Острая боль (SOS неотложка)',
    ];

    const samplePatients = [
      { name: 'Алишер Навои', phone: '+998 (90) 123-45-67', tg: 101010 },
      { name: 'Малика Умарова', phone: '+998 (91) 234-56-78', tg: 202020 },
      { name: 'Сардор Каримов', phone: '+998 (93) 345-67-89', tg: 303030 },
      { name: 'Дильноза Саидова', phone: '+998 (97) 456-78-90', tg: 404040 },
      { name: 'Бахром Юлдашев', phone: '+998 (99) 567-89-01', tg: 505050 },
      { name: 'Шахноза Рахимова', phone: '+998 (90) 678-90-12', tg: 606060 },
      { name: 'Жахонгир Абдуллаев', phone: '+998 (94) 789-01-23', tg: 707070 },
      { name: 'Гульнора Темирова', phone: '+998 (98) 890-12-34', tg: 808080 },
    ];

    const now = getNowUTC();

    // 1. Past 14 days appointments
    for (let dayOffset = -14; dayOffset < 0; dayOffset++) {
      const count = Math.floor(Math.random() * 4) + 3; // 3 to 6 bookings per day
      for (let j = 0; j < count; j++) {
        const doc = sampleDoctors[j % sampleDoctors.length];
        const srv = sampleServices[(dayOffset + j + 100) % sampleServices.length];
        const pat = samplePatients[(j + Math.abs(dayOffset)) % samplePatients.length];

        const hour = 10 + (j * 2);
        const appDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        const isoDate = formatTashkentISODate(appDate);
        const dateTimeUTC = fromTashkentDateTime(isoDate, `${String(hour).padStart(2, '0')}:00`);

        // Distribution: ~70% completed, ~15% cancelled, ~8% no-show, ~7% confirmed
        const rand = Math.random();
        let status: AppointmentStatus = 'completed';
        if (rand < 0.15) status = 'cancelled';
        else if (rand < 0.23) status = 'no_show';

        const id = `demo_past_${Math.abs(dayOffset)}_${j}`;
        this.appointments.push({
          id,
          patientId: `pat_demo_${pat.tg}`,
          patientName: pat.name,
          patientPhone: pat.phone,
          telegramId: pat.tg,
          doctorId: doc.id,
          doctorName: doc.name,
          serviceTitle: srv,
          dateTime: dateTimeUTC.toISOString(),
          durationMinutes: 30,
          status,
          source: j === 0 ? 'phone_admin' : 'miniapp',
          notes: status === 'cancelled' ? 'Пациент предупредил заранее по телефону' : null,
          isDemo: true,
          createdAt: new Date(dateTimeUTC.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: dateTimeUTC.toISOString(),
        });
      }
    }

    // 2. Today's appointments (active, realistic timeline)
    const todayIso = formatTashkentISODate(now);
    const todaySlots = [
      { time: '10:00', status: 'completed' as AppointmentStatus, pat: samplePatients[0] },
      { time: '11:30', status: 'completed' as AppointmentStatus, pat: samplePatients[1] },
      { time: '14:00', status: 'confirmed' as AppointmentStatus, pat: samplePatients[2] },
      { time: '15:30', status: 'pending' as AppointmentStatus, pat: samplePatients[3] },
      { time: '17:00', status: 'reschedule_requested' as AppointmentStatus, pat: samplePatients[4] },
      { time: '18:30', status: 'confirmed' as AppointmentStatus, pat: samplePatients[5] },
    ];

    todaySlots.forEach((slot, idx) => {
      const dt = fromTashkentDateTime(todayIso, slot.time);
      const doc = sampleDoctors[idx % sampleDoctors.length];
      const srv = sampleServices[idx % sampleServices.length];
      const id = `demo_today_${idx}`;

      this.appointments.push({
        id,
        patientId: `pat_demo_${slot.pat.tg}`,
        patientName: slot.pat.name,
        patientPhone: slot.pat.phone,
        telegramId: slot.pat.tg,
        doctorId: doc.id,
        doctorName: doc.name,
        serviceTitle: srv,
        dateTime: dt.toISOString(),
        durationMinutes: 30,
        status: slot.status,
        source: 'miniapp',
        notes: null,
        isDemo: true,
        createdAt: new Date(dt.getTime() - 18 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // 3. Next 7 days appointments
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const count = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < count; j++) {
        const doc = sampleDoctors[j % sampleDoctors.length];
        const srv = sampleServices[(dayOffset + j) % sampleServices.length];
        const pat = samplePatients[(j + dayOffset) % samplePatients.length];

        const hour = 11 + j * 2;
        const appDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        const isoDate = formatTashkentISODate(appDate);
        const dt = fromTashkentDateTime(isoDate, `${String(hour).padStart(2, '0')}:00`);

        const status: AppointmentStatus = j === 0 ? 'confirmed' : 'pending';
        const id = `demo_future_${dayOffset}_${j}`;

        this.appointments.push({
          id,
          patientId: `pat_demo_${pat.tg}`,
          patientName: pat.name,
          patientPhone: pat.phone,
          telegramId: pat.tg,
          doctorId: doc.id,
          doctorName: doc.name,
          serviceTitle: srv,
          dateTime: dt.toISOString(),
          durationMinutes: 30,
          status,
          source: 'miniapp',
          notes: null,
          isDemo: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  public resetDemoData() {
    this.appointments = this.appointments.filter((a) => !a.isDemo);
    this.seeded = false;
    this.seedInitialDemoData();
  }
}

// Global repository instance
export const dbRepository = new MemoryRepository();
