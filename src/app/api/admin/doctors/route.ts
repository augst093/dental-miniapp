import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authorizeAdminRequest } from '@/lib/telegramAuth';
import { validateDoctorInput } from '@/lib/doctorsAdmin';
import { serializeDoctor, writeAdminAudit } from '@/lib/doctorsApi';

// Staff: list doctors (including inactive ones) and add a doctor
export async function GET(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });
  try {
    const doctors = await prisma.doctor.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ success: true, doctors: doctors.map(serializeDoctor) });
  } catch {
    return NextResponse.json({ success: false, error: 'База недоступна, попробуйте позже' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const gate = authorizeAdminRequest(request);
  if (!gate.ok) return NextResponse.json({ success: false, error: gate.error }, { status: gate.status });

  const parsed = validateDoctorInput(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });

  try {
    const v = parsed.value;
    const created = await prisma.doctor.create({
      data: {
        name: v.name!,
        specialty: v.specialty!,
        experienceYears: v.experienceYears ?? null,
        workingDays: v.workingDays!.join(','),
        workingHoursStart: v.workingHoursStart!,
        workingHoursEnd: v.workingHoursEnd!,
        slotDurationMinutes: v.slotDurationMinutes!,
        isActive: v.isActive ?? true,
      },
    });
    await writeAdminAudit(gate.user.id, 'doctor_created', created.id, `${created.name}`);
    return NextResponse.json({ success: true, doctor: serializeDoctor(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Не удалось сохранить врача' }, { status: 500 });
  }
}
