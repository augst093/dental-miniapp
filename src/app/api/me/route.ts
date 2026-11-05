import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { TG_INIT_DATA_HEADER, authorizeAdminInitData } from '@/lib/telegramAuth';

// Tells the Mini App whether the person opening it is an admin. Only the signed
// initData decides this; the client cannot claim it.
export async function GET() {
  const h = await headers();
  const gate = authorizeAdminInitData(h.get(TG_INIT_DATA_HEADER) || '');
  if (gate.ok) {
    return NextResponse.json({ success: true, isAdmin: true, name: gate.user.first_name || '' });
  }
  return NextResponse.json({ success: true, isAdmin: false });
}
