import assert from 'assert';
import { checkCanChange, sortForPatient } from '../lib/patientAppointments';

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
  } catch (e: any) {
    console.log(`  ❌ [FAIL] ${name}: ${e?.message}`);
    process.exitCode = 1;
  }
}

const now = new Date('2030-01-15T10:00:00Z');
const inHours = (h: number) => new Date(now.getTime() + h * 3600 * 1000);
const app = (over: Partial<{ telegramId: number | null; status: string; dateTime: Date }> = {}) => ({
  telegramId: 111,
  status: 'confirmed',
  dateTime: inHours(10),
  ...over,
});

(async () => {
  console.log('--- Patient appointment rules ---');
  await test('owner can change a visit more than 3 hours ahead', () => {
    assert.deepStrictEqual(checkCanChange(app(), 111, now), { ok: true });
  });
  await test('another patient cannot change it', () => {
    const r = checkCanChange(app(), 222, now);
    assert.strictEqual(r.ok, false);
    if (!r.ok) assert.strictEqual(r.code, 'NOT_OWNER');
  });
  await test('cancelled or completed visits cannot be changed', () => {
    for (const status of ['cancelled', 'completed', 'no_show']) {
      const r = checkCanChange(app({ status }), 111, now);
      assert.strictEqual(r.ok, false);
    }
  });
  await test('within 3 hours of the visit the change is refused with the clinic hint', () => {
    const r = checkCanChange(app({ dateTime: inHours(2) }), 111, now);
    assert.strictEqual(r.ok, false);
    if (!r.ok) {
      assert.strictEqual(r.code, 'TOO_LATE');
      assert.ok(r.error.includes('Позвоните'));
    }
  });
  await test('exactly 3 hours ahead is still allowed', () => {
    assert.deepStrictEqual(checkCanChange(app({ dateTime: inHours(3) }), 111, now), { ok: true });
  });
  await test('upcoming visits come first, then the past ones newest first', () => {
    const items = [
      { id: 'past-old', dateTime: inHours(-50), status: 'completed' },
      { id: 'soon', dateTime: inHours(5), status: 'confirmed' },
      { id: 'past-new', dateTime: inHours(-2), status: 'completed' },
      { id: 'later', dateTime: inHours(100), status: 'pending' },
    ];
    assert.deepStrictEqual(sortForPatient(items, now).map((i) => i.id), ['soon', 'later', 'past-new', 'past-old']);
  });
})();
