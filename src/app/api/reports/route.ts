import { NextRequest, NextResponse } from 'next/server';
import { dbRepository } from '@/lib/db';
import { authorizeAdminRequest } from "@/lib/telegramAuth";

export async function GET(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) {
    return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
  }
  try {
    const { searchParams } = new URL(request.url);
    const periodDays = parseInt(searchParams.get('days') || '7', 10);

    const metrics = await dbRepository.getMetrics(periodDays);

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
