import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';
import { fromTashkentDateTime } from '@/lib/timezone';
import { LifecycleActor } from '@/lib/appointmentLifecycle';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { dateStr, timeStr, actor = 'patient', actorId } = body;

    if (!dateStr || !timeStr) {
      return NextResponse.json(
        { success: false, error: 'Новые дата и время обязательны' },
        { status: 400 }
      );
    }

    const newDateTimeUTC = fromTashkentDateTime(dateStr, timeStr);

    const result = dbRepository.reschedule(
      id,
      newDateTimeUTC,
      actor as LifecycleActor,
      actorId
    );

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
      { success: false, error: error?.message || 'Failed to reschedule' },
      { status: 500 }
    );
  }
}
