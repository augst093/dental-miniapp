import assert from 'assert';
import { validateInboxText, deliveryOutcome, canReply, isInboxStatus, MAX_INBOX_TEXT } from '../lib/inbox';

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
  console.log('--- Inbox rules ---');
  await test('trims a message and keeps its text', () => {
    const r = validateInboxText('  Сколько стоит имплант?  ');
    assert.ok(r.ok);
    if (r.ok) assert.strictEqual(r.value, 'Сколько стоит имплант?');
  });
  await test('rejects empty and whitespace-only messages', () => {
    assert.strictEqual(validateInboxText('').ok, false);
    assert.strictEqual(validateInboxText('   ').ok, false);
    assert.strictEqual(validateInboxText(undefined).ok, false);
  });
  await test('rejects a message longer than the limit', () => {
    assert.strictEqual(validateInboxText('а'.repeat(MAX_INBOX_TEXT + 1)).ok, false);
    assert.strictEqual(validateInboxText('а'.repeat(MAX_INBOX_TEXT)).ok, true);
  });
  await test('maps Telegram results: success, blocked bot (403), other failures', () => {
    assert.strictEqual(deliveryOutcome({ ok: true, status: 200 }), 'sent');
    assert.strictEqual(deliveryOutcome({ ok: false, status: 403 }), 'blocked');
    assert.strictEqual(deliveryOutcome({ ok: false, status: 429 }), 'failed');
    assert.strictEqual(deliveryOutcome({ ok: false, status: 0 }), 'failed');
  });
  await test('does not offer a reply to a patient who blocked the bot', () => {
    assert.strictEqual(canReply({ patientUnreachable: true }), false);
    assert.strictEqual(canReply({ patientUnreachable: false }), true);
  });
  await test('accepts only known statuses', () => {
    assert.strictEqual(isInboxStatus('new'), true);
    assert.strictEqual(isInboxStatus('answered'), true);
    assert.strictEqual(isInboxStatus('deleted'), false);
    assert.strictEqual(isInboxStatus(undefined), false);
  });
})();
