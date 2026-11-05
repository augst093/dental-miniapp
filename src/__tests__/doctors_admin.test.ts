import assert from 'assert';
import { validateDoctorInput, isDeactivation } from '../lib/doctorsAdmin';

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
  } catch (e: any) {
    console.log(`  ❌ [FAIL] ${name}: ${e?.message}`);
    process.exitCode = 1;
  }
}

const valid = {
  name: 'Д-р Тест Врач',
  specialty: 'Терапия и эндодонтия',
  experienceYears: 10,
  workingDays: [1, 2, 3, 4, 5, 6],
  workingHoursStart: '09:00',
  workingHoursEnd: '20:00',
  slotDurationMinutes: 30,
};

(async () => {
  console.log('--- Doctors admin validation ---');
  await test('accepts a complete valid doctor', () => {
    const r = validateDoctorInput(valid);
    assert.strictEqual(r.ok, true);
    if (r.ok) assert.strictEqual(r.value.isActive, true);
  });
  await test('rejects a too short name', () => {
    const r = validateDoctorInput({ ...valid, name: 'Ab' });
    assert.strictEqual(r.ok, false);
  });
  await test('rejects end time not after start time', () => {
    const r = validateDoctorInput({ ...valid, workingHoursStart: '18:00', workingHoursEnd: '09:00' });
    assert.strictEqual(r.ok, false);
  });
  await test('rejects malformed time', () => {
    assert.strictEqual(validateDoctorInput({ ...valid, workingHoursStart: '9am' }).ok, false);
    assert.strictEqual(validateDoctorInput({ ...valid, workingHoursEnd: '25:00' }).ok, false);
  });
  await test('rejects empty and out-of-range working days', () => {
    assert.strictEqual(validateDoctorInput({ ...valid, workingDays: [] }).ok, false);
    assert.strictEqual(validateDoctorInput({ ...valid, workingDays: [7] }).ok, false);
  });
  await test('deduplicates and sorts working days', () => {
    const r = validateDoctorInput({ ...valid, workingDays: [3, 1, 3] });
    assert.ok(r.ok);
    if (r.ok) assert.deepStrictEqual(r.value.workingDays, [1, 3]);
  });
  await test('rejects unsupported slot step', () => {
    assert.strictEqual(validateDoctorInput({ ...valid, slotDurationMinutes: 25 }).ok, false);
  });
  await test('rejects absurd experience', () => {
    assert.strictEqual(validateDoctorInput({ ...valid, experienceYears: 99 }).ok, false);
    assert.strictEqual(validateDoctorInput({ ...valid, experienceYears: -1 }).ok, false);
  });
  await test('partial update checks only the fields sent', () => {
    const r = validateDoctorInput({ isActive: false }, true);
    assert.ok(r.ok);
    if (r.ok) assert.deepStrictEqual(r.value, { isActive: false });
  });
  await test('rejects non-object body', () => {
    assert.strictEqual(validateDoctorInput(null).ok, false);
  });
  await test('detects deactivation only when a doctor goes from active to inactive', () => {
    assert.strictEqual(isDeactivation({ isActive: true }, { isActive: false }), true);
    assert.strictEqual(isDeactivation({ isActive: false }, { isActive: false }), false);
    assert.strictEqual(isDeactivation({ isActive: true }, { name: 'X' }), false);
  });
})();
