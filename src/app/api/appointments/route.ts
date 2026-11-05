import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { TG_INIT_DATA_HEADER, verifyTelegramUser } from '@/lib/telegramAuth';
import { clientIp, isRateLimited } from '@/lib/rateLimit';
import { escapeHtml, notifyAdminGroup } from '@/lib/adminNotify';
import { prisma } from '@/lib/db';

const IP_LIMIT = 6; // booking attempts per client IP
const USER_LIMIT = 4; // bookings per verified Telegram user
const WINDOW_MS = 10 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

// Uzbek mobile/landline numbers: +998 and 9 digits
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998') ? '+' + digits : null;
}
import { dbRepository } from '@/lib/db';
import { fromTashkentDateTime, formatTashkentISODate, getNowUTC } from '@/lib/timezone';
import { AppointmentStatus } from '@/lib/appointmentLifecycle';
import { authorizeAdminRequest } from "@/lib/telegramAuth";

export async function GET(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) {
    return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
  }
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;
    const status = (searchParams.get('status') as AppointmentStatus) || undefined;

    const appointments = await dbRepository.getAppointments({
      dateStr,
      doctorId,
      status,
    });

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientName,
      patientPhone,
      doctorId,
      doctorName,
      serviceTitle,
      serviceId,
      dateStr, // "2026-11-05"
      timeStr, // "14:30"
      source = 'miniapp',
      notes,
      consentAgreed = false,
      actor = 'patient',
    } = body;

    if (!patientName || !patientPhone) {
      return NextResponse.json(
        { success: false, error: 'Имя и телефон пациента обязательны' },
        { status: 400 }
      );
    }

    if (!dateStr || !timeStr) {
      return NextResponse.json(
        { success: false, error: 'Дата и время приёма обязательны' },
        { status: 400 }
      );
    }

    // Parse Tashkent date & time to UTC Date
    const dateTimeUTC = fromTashkentDateTime(dateStr, timeStr);

    if (isRateLimited('book:ip:' + clientIp(request), IP_LIMIT, WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток. Попробуйте через несколько минут.' },
        { status: 429 }
      );
    }

    // The client must confirm consent to personal data processing (law on personal data)
    if (consentAgreed !== true) {
      return NextResponse.json(
        { success: false, error: 'Нужно согласие на обработку персональных данных' },
        { status: 400 }
      );
    }

    const name = String(patientName).trim();
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ success: false, error: 'Укажите имя (от 2 до 80 символов)' }, { status: 400 });
    }
    const phone = normalizePhone(String(patientPhone));
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Укажите номер в формате +998 XX XXX XX XX' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr)) || !/^\d{2}:\d{2}$/.test(String(timeStr))) {
      return NextResponse.json({ success: false, error: 'Некорректная дата или время' }, { status: 400 });
    }
    if (String(doctorName || '').length > 100 || String(serviceTitle || '').length > 100 || String(notes || '').length > 500) {
      return NextResponse.json({ success: false, error: 'Слишком длинное значение' }, { status: 400 });
    }

    // Telegram ID comes only from the signed initData (never from the request body), so reminders
    // go to the real patient. Phone bookings from the website have no Telegram ID.
    const h = await headers();
    const verified = verifyTelegramUser(h.get(TG_INIT_DATA_HEADER) || '');
    if (verified && isRateLimited('book:tg:' + verified.id, USER_LIMIT, HOUR_MS)) {
      return NextResponse.json(
        { success: false, error: 'Вы уже создали несколько записей за последний час. Позвоните в клинику.' },
        { status: 429 }
      );
    }

    // A booked service is taken from the database (title and price), never trusted from the client.
    // The price is stored on the appointment so later price changes do not rewrite past bookings.
    let finalServiceTitle: string = serviceTitle || 'Консультация';
    let priceUzs: number | undefined;
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: String(serviceId) } });
      if (!service || !service.isActive) {
        return NextResponse.json({ success: false, error: 'Эта услуга сейчас недоступна' }, { status: 400 });
      }
      finalServiceTitle = service.title;
      priceUzs = service.priceUzs;
    }

    const result = await dbRepository.createAppointment({
      patientName: name,
      patientPhone: phone,
      telegramId: verified?.id,
      doctorId: doctorId || undefined,
      doctorName: doctorName || 'Дежурный врач',
      serviceTitle: finalServiceTitle,
      priceUzs,
      dateTimeUTC,
      source,
      notes,
      consentAt: consentAgreed ? new Date() : undefined,
      actor,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Tell the clinic's admin group about the new booking (the bot no longer does this for Mini App bookings)
    await notifyAdminGroup(
      '🆕 <b>Новая запись (Mini App)</b>\n' +
        `👤 ${escapeHtml(name)}\n` +
        `📞 <code>${escapeHtml(phone)}</code>\n` +
        `🦷 ${escapeHtml(String(serviceTitle || 'Консультация'))}\n` +
        `👨‍⚕️ ${escapeHtml(String(doctorName || 'Дежурный врач'))}\n` +
        `📅 ${escapeHtml(String(dateStr))} ${escapeHtml(String(timeStr))} (Ташкент)`
    );

    return NextResponse.json({
      success: true,
      appointment: result.appointment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
