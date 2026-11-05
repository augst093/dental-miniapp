import assert from 'assert';
import { nextDelaySeconds, classifySendFailure, afterFailure, OUTBOX_MAX_ATTEMPTS, validateOutboxText } from '../lib/outbox';

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
  console.log('--- Outbox policy ---');
  await test('backoff grows exponentially and is capped at 30 minutes', () => {
    assert.strictEqual(nextDelaySeconds(1), 5);
    assert.strictEqual(nextDelaySeconds(2), 10);
    assert.strictEqual(nextDelaySeconds(3), 20);
    assert.strictEqual(nextDelaySeconds(20), 1800);
  });
  await test('429 waits the time Telegram asked for', () => {
    assert.strictEqual(classifySendFailure(429), 'retry_after');
    const r = afterFailure(0, 'retry_after', 37);
    assert.deepStrictEqual(r, { status: 'pending', delaySeconds: 37 });
  });
  await test('403 (blocked bot) is final, never retried', () => {
    assert.strictEqual(classifySendFailure(403), 'blocked');
    assert.deepStrictEqual(afterFailure(0, 'blocked'), { status: 'failed', delaySeconds: 0 });
  });
  await test('400 (bad request) is final', () => {
    assert.strictEqual(afterFailure(0, classifySendFailure(400)).status, 'failed');
  });
  await test('network or server errors retry with backoff', () => {
    assert.strictEqual(classifySendFailure(0), 'transient');
    assert.strictEqual(classifySendFailure(502), 'transient');
    assert.deepStrictEqual(afterFailure(2, 'transient'), { status: 'pending', delaySeconds: 20 });
  });
  await test('gives up after the maximum number of attempts', () => {
    assert.strictEqual(afterFailure(OUTBOX_MAX_ATTEMPTS - 1, 'transient').status, 'failed');
    assert.strictEqual(afterFailure(OUTBOX_MAX_ATTEMPTS - 2, 'transient').status, 'pending');
  });
  await test('rejects empty and oversized text', () => {
    assert.strictEqual(validateOutboxText('   '), false);
    assert.strictEqual(validateOutboxText('a'.repeat(4001)), false);
    assert.strictEqual(validateOutboxText('ok'), true);
  });
})();
