import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';
import { getNowUTC, formatTashkentISODate, fromTashkentDateTime } from '@/lib/timezone';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, appointmentId } = body;

    const now = getNowUTC();

    switch (action) {
      case 'create_sample': {
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowIso = formatTashkentISODate(tomorrow);
        const dt = fromTashkentDateTime(tomorrowIso, '15:00');

        const result = await dbRepository.createAppointment({
          patientName: 'Тестовый Пациент (Демо)',
          patientPhone: '+998 (90) 999-88-77',
          telegramId: 99999999,
          doctorId: 'doc-1',
          doctorName: 'Д-р Камилов Жасур',
          serviceTitle: 'Первичный 3D-осмотр (КТ)',
          dateTimeUTC: dt,
          source: 'demo_panel',
          notes: 'Создано из демо-панели',
          isDemo: true,
          actor: 'admin',
        });

        return NextResponse.json({
          success: true,
          action: 'create_sample',
          message: 'Создана тестовая запись на завтра в 15:00',
          appointment: result.appointment,
        });
      }

      case 'simulate_cancellation': {
        // Find first active appointment to cancel
        const active = (await dbRepository.getAppointments()).filter(
          (a) => a.status === 'confirmed' || a.status === 'pending'
        );

        const target = appointmentId
          ? await dbRepository.getAppointmentById(appointmentId)
          : active[0];

        if (!target) {
          return NextResponse.json(
            { success: false, error: 'Нет активных записей для отмены' },
            { status: 400 }
          );
        }

        const updated = await dbRepository.updateStatus(
          target.id,
          'cancelled',
          'patient',
          String(target.telegramId || 'patient'),
          'Пациент смоделировал отмену через Telegram'
        );

        return NextResponse.json({
          success: true,
          action: 'simulate_cancellation',
          message: `Запись ${target.patientName} успешно отменена. Слот освобождён для других пациентов!`,
          appointment: updated.appointment,
        });
      }

      case 'send_reminder': {
        // Find nearest upcoming appointment
        const upcoming = (await dbRepository.getAppointments()).filter(
          (a) => a.status === 'confirmed' || a.status === 'pending'
        );

        const target = appointmentId
          ? await dbRepository.getAppointmentById(appointmentId)
          : upcoming[0];

        if (!target) {
          return NextResponse.json(
            { success: false, error: 'Нет предстоящих записей для отправки напоминания' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          action: 'send_reminder',
          message: `Напоминание успешно отправлено пациенту ${target.patientName} (${target.patientPhone}) с кнопками Приду / Перенести / Отменить!`,
          appointment: target,
        });
      }

      case 'reset_demo': {
        await dbRepository.resetDemoData();
        return NextResponse.json({
          success: true,
          action: 'reset_demo',
          message: 'Демо-данные успешно сброшены и перезагружены (14 дней истории + 7 дней записей)',
        });
      }

      case 'send_digest': {
        const metrics = await dbRepository.getMetrics(7);
        return NextResponse.json({
          success: true,
          action: 'send_digest',
          message: `Недельный дайджест сформирован: ${metrics.totalBookings} записей, ${metrics.confirmationRatePercent}% подтверждений, сэкономлено ${metrics.adminHoursSaved} ч. времени.`,
          metrics,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Неизвестное действие: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed demo action' },
      { status: 500 }
    );
  }
}
