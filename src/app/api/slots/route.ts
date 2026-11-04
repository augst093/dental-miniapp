import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';
import { formatTashkentISODate, getNowUTC } from '@/lib/timezone';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || formatTashkentISODate(getNowUTC());
    const doctorId = searchParams.get('doctorId') || undefined;

    const slots = dbRepository.getSlots(dateStr, doctorId);

    return NextResponse.json({
      success: true,
      date: dateStr,
      doctorId: doctorId || null,
      slots,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}
