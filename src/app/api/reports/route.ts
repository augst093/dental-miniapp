import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodDays = parseInt(searchParams.get('days') || '7', 10);

    const metrics = dbRepository.getMetrics(periodDays);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
