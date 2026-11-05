import assert from 'assert';
import { validateServiceInput } from '../lib/servicesAdmin';

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
  } catch (e: any) {
    console.log(`  ❌ [FAIL] ${name}: ${e?.message}`);
    process.exitCode = 1;
  }
}

const valid = { title: 'Лечение кариеса', category: 'therapy', priceUzs: 450000, durationMinutes: 45 };

(async () => {
  console.log('--- Services admin validation ---');
  await test('accepts a complete valid service and fills defaults', () => {
    const r = validateServiceInput(valid);
    assert.ok(r.ok);
    if (r.ok) {
      assert.strictEqual(r.value.isActive, true);
      assert.strictEqual(r.value.sortOrder, 0);
      assert.strictEqual(r.value.description, null);
    }
  });
  await test('rejects a price that is not a whole number of sums', () => {
    assert.strictEqual(validateServiceInput({ ...valid, priceUzs: 450000.5 }).ok, false);
  });
  await test('rejects negative and absurdly large prices', () => {
    assert.strictEqual(validateServiceInput({ ...valid, priceUzs: -1 }).ok, false);
    assert.strictEqual(validateServiceInput({ ...valid, priceUzs: 999_999_999_999 }).ok, false);
  });
  await test('accepts a zero price (free consultation)', () => {
    assert.strictEqual(validateServiceInput({ ...valid, priceUzs: 0 }).ok, true);
  });
  await test('rejects unknown category', () => {
    assert.strictEqual(validateServiceInput({ ...valid, category: 'spa' }).ok, false);
  });
  await test('rejects duration that is not a multiple of 5 or out of range', () => {
    assert.strictEqual(validateServiceInput({ ...valid, durationMinutes: 47 }).ok, false);
    assert.strictEqual(validateServiceInput({ ...valid, durationMinutes: 5 }).ok, false);
    assert.strictEqual(validateServiceInput({ ...valid, durationMinutes: 300 }).ok, false);
  });
  await test('partial update changes only the sent fields (reorder)', () => {
    const r = validateServiceInput({ sortOrder: 3 }, true);
    assert.ok(r.ok);
    if (r.ok) assert.deepStrictEqual(r.value, { sortOrder: 3 });
  });
  await test('rejects a too short title', () => {
    assert.strictEqual(validateServiceInput({ ...valid, title: 'AB' }).ok, false);
  });
  await test('rejects non-object body', () => {
    assert.strictEqual(validateServiceInput('nope').ok, false);
  });
})();
