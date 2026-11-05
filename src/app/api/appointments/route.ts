import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';
import { fromTashkentDateTime, formatTashkentISODate, getNowUTC } from '@/lib/timezone';
import { AppointmentStatus } from '@/lib/appointmentLifecycle';

export async function GET(request: NextRequest) {
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
      telegramId,
      doctorId,
      doctorName,
      serviceTitle,
      dateStr, // "2026-11-05"
      timeStr, // "14:30"
      source = 'miniapp',
      notes,
      consentAgreed = true,
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

    const result = await dbRepository.createAppointment({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      telegramId: telegramId ? Number(telegramId) : undefined,
      doctorId: doctorId || undefined,
      doctorName: doctorName || 'Дежурный врач',
      serviceTitle: serviceTitle || 'Консультация',
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
