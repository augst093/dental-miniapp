import { NextResponse } from 'next/server';

// Lightweight liveness check for uptime monitors (e.g. UptimeRobot).
// Deliberately exposes nothing about infrastructure.
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
}
