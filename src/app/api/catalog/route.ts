import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildCatalog } from '@/lib/catalog';

// Public: doctors and services the patient app shows. Read-only, no personal data.
export async function GET() {
  try {
    const [doctors, services] = await Promise.all([
      prisma.doctor.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
      prisma.service.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    ]);
    const catalog = buildCatalog(
      doctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty, experienceYears: d.experienceYears, isActive: d.isActive })),
      services.map((s) => ({ id: s.id, title: s.title, category: s.category, priceUzs: s.priceUzs, durationMinutes: s.durationMinutes, description: s.description, isActive: s.isActive }))
    );
    return NextResponse.json({ success: true, source: catalog.source, doctors: catalog.doctors, services: catalog.services });
  } catch {
    // No database (local demo): the demo catalog is used
    return NextResponse.json({ success: true, source: 'demo', doctors: null, services: null });
  }
}
