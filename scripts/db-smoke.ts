/**
 * Smoke test for the PostgreSQL repository.
 *
 * Run once from the project folder, with the PUBLIC database URL set in the same terminal:
 *   $env:DATABASE_URL = "postgresql://..."      (PowerShell)
 *   npx tsx scripts/db-smoke.ts
 *
 * It fills in the clinic's doctors (so bookings can reference them), then books a test
 * appointment, checks the double-booking rule, confirms and cancels it, and removes
 * everything it created. Real patient data is not touched.
 */

import assert from 'node:assert/strict';
import { DOCTORS } from '../src/data/clinicData';
import { dbRepository, prisma } from '../src/lib/db';
import { fromTashkentDateTime } from '../src/lib/timezone';

const TEST_DATE = '2030-01-15';
const TEST_PHONE = '+998000000000';
const TEST_NAME = 'Smoke Test';

async function seedDoctors() {
  for (const doc of DOCTORS) {
    await prisma.doctor.upsert({
      where: { id: doc.id },
      update: { name: doc.name.ru, specialty: doc.specialization.ru, experienceYears: doc.experienceYears },
      create: {
        id: doc.id,
        name: doc.name.ru,
        specialty: doc.specialization.ru,
        experienceYears: doc.experienceYears,
        photoUrl: doc.photoUrl,
      },
    });
  }
  console.log(`  врачи в базе: ${DOCTORS.length}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL не задан в этом терминале');
  }

  console.log('1. Заполняем врачей');
  await seedDoctors();

  const doctorId = DOCTORS[0].id;
  const when = fromTashkentDateTime(TEST_DATE, '10:00');

  console.log('2. Свободные слоты до записи');
  const slotsBefore = await dbRepository.getSlots(TEST_DATE, doctorId);
  assert.ok(slotsBefore.length > 0, 'слоты должны генерироваться');
  console.log(`  ок: ${slotsBefore.length} слотов`);

  console.log('3. Создаём запись');
  const created = await dbRepository.createAppointment({
    patientName: TEST_NAME,
    patientPhone: TEST_PHONE,
    doctorId,
    doctorName: DOCTORS[0].name.ru,
    serviceTitle: 'Smoke test',
    dateTimeUTC: when,
    source: 'smoke',
    consentAt: new Date(),
  });
  assert.equal(created.success, true, created.error);
  const id = created.appointment!.id;
  console.log(`  ок: запись ${id}`);

  try {
    console.log('4. Второй пациент на тот же слот должен получить отказ');
    const clash = await dbRepository.createAppointment({
      patientName: 'Smoke Clash',
      patientPhone: '+998000000001',
      doctorId,
      doctorName: DOCTORS[0].name.ru,
      serviceTitle: 'Smoke test',
      dateTimeUTC: when,
      source: 'smoke',
    });
    assert.equal(clash.success, false, 'накладка должна быть отклонена');
    console.log(`  ок: отказ "${clash.error}"`);

    console.log('5. Подтверждаем и отменяем');
    const confirmed = await dbRepository.updateStatus(id, 'confirmed', 'admin');
    assert.equal(confirmed.success, true, confirmed.error);
    const cancelled = await dbRepository.updateStatus(id, 'cancelled', 'admin');
    assert.equal(cancelled.success, true, cancelled.error);
    console.log('  ок: pending → confirmed → cancelled');

    console.log('6. После отмены слот снова свободен');
    const slotsAfter = await dbRepository.getSlots(TEST_DATE, doctorId);
    const slot10 = slotsAfter.find((s) => s.time === '10:00');
    assert.ok(slot10?.available, 'слот 10:00 должен освободиться');
    console.log('  ок');

    console.log('7. Журнал действий записан');
    const full = await dbRepository.getAppointmentById(id);
    assert.ok((full?.auditLogs?.length ?? 0) >= 3, 'создание, подтверждение и отмена в журнале');
    console.log(`  ок: ${full?.auditLogs?.length} записей в журнале`);
  } finally {
    console.log('8. Убираем тестовые данные');
    await prisma.appointment.deleteMany({ where: { id } });
    await prisma.patient.deleteMany({ where: { phone: { in: [TEST_PHONE, '+998000000001'] } } });
    console.log('  ок');
  }

  console.log('\nВСЁ ПРОШЛО: база работает, правила записи соблюдаются.');
}

main()
  .catch((error) => {
    console.error('\nОШИБКА:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
