import assert from 'assert';
import { buildCatalog, formatSum } from '../lib/catalog';
import { DOCTORS, SERVICES } from '../data/clinicData';

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
  } catch (e: any) {
    console.log(`  ❌ [FAIL] ${name}: ${e?.message}`);
    process.exitCode = 1;
  }
}

(async () => {
  console.log('--- Catalog from the database ---');
  await test('empty database falls back to the demo catalog', () => {
    const c = buildCatalog([], []);
    assert.strictEqual(c.source, 'demo');
    assert.strictEqual(c.doctors, DOCTORS);
    assert.strictEqual(c.services, SERVICES);
  });
  await test('a doctor from the database keeps the demo biography when the name matches', () => {
    const demo = DOCTORS[0];
    const c = buildCatalog([{ id: 'uuid-1', name: demo.name.ru, specialty: 'Новая специализация', experienceYears: 20, isActive: true }], []);
    assert.strictEqual(c.source, 'database');
    assert.strictEqual(c.doctors[0].dbId, 'uuid-1');
    assert.strictEqual(c.doctors[0].specialization.ru, 'Новая специализация');
    assert.strictEqual(c.doctors[0].experienceYears, 20);
    assert.strictEqual(c.doctors[0].bio.ru, demo.bio.ru);
  });
  await test('inactive doctors are hidden', () => {
    const c = buildCatalog([{ id: 'a', name: 'Д-р Скрыт', specialty: 'x', experienceYears: null, isActive: false }, { id: 'b', name: 'Д-р Видим', specialty: 'y', experienceYears: 3, isActive: true }], []);
    assert.deepStrictEqual(c.doctors.map((d) => d.dbId), ['b']);
  });
  await test('a new service from the database shows its price in sums and its duration', () => {
    const c = buildCatalog([{ id: 'x', name: 'Д-р Тест', specialty: 'Терапия', experienceYears: 5, isActive: true }], [
      { id: 's1', title: 'Новая процедура', category: 'therapy', priceUzs: 450000, durationMinutes: 45, description: null, isActive: true },
    ]);
    assert.strictEqual(c.services.length, 1);
    assert.strictEqual(c.services[0].priceUzs, '450 000 сум');
    assert.strictEqual(c.services[0].duration.ru, '45 мин');
    assert.strictEqual(c.services[0].name.uz, 'Новая процедура');
  });
  await test('a known service keeps its wording and takes the database price', () => {
    const known = SERVICES[0];
    const c = buildCatalog([{ id: 'x', name: 'Д-р Тест', specialty: 'Терапия', experienceYears: 5, isActive: true }], [
      { id: 's2', title: known.name.ru, category: 'emergency', priceUzs: 300000, durationMinutes: 30, description: null, isActive: true },
    ]);
    assert.strictEqual(c.services[0].priceUzs, '300 000 сум');
    assert.strictEqual(c.services[0].name.uz, known.name.uz);
  });
  await test('inactive services are hidden', () => {
    const c = buildCatalog([{ id: 'x', name: 'Д-р Тест', specialty: 'Терапия', experienceYears: 5, isActive: true }], [
      { id: 's3', title: 'Скрытая', category: 'other', priceUzs: 1, durationMinutes: 30, description: null, isActive: false },
    ]);
    assert.strictEqual(c.services.length, SERVICES.length, 'no active db services -> demo services');
  });
  await test('sum formatting uses thin spaces between thousands', () => {
    assert.strictEqual(formatSum(8500000), '8 500 000 сум');
  });
})();
