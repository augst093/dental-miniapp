import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';
import { AppointmentStatus, LifecycleActor } from '@/lib/appointmentLifecycle';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, actor = 'admin', actorId, reason } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Статус обязателен' },
        { status: 400 }
      );
    }

    const result = dbRepository.updateStatus(
      id,
      status as AppointmentStatus,
      actor as LifecycleActor,
      actorId,
      reason
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
      { success: false, error: error?.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}
