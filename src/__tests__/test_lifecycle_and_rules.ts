/**
 * Automated test suite for Phase 1-8 critical business logic:
 * 1. Status transitions & state machine
 * 2. Double-booking prevention & slot conflict
 * 3. Freeing slot on cancellation & rebooking
 * 4. Persistent reminder scheduling & cancellation
 * 5. Timezone (Asia/Tashkent UTC+5) calculations
 * 6. Metric calculations (confirmation rate, no-show rate, saved slots)
 * 7. Telegram initData HMAC validation & admin authorization
 */

import assert from 'assert';
import crypto from 'crypto';
import {
  validateTransition,
  calculateRequiredReminders,
  AppointmentStatus,
} from '../lib/appointmentLifecycle';
import {
  fromTashkentDateTime,
  formatTashkentISODate,
  formatTashkentTime,
  toTashkentClock,
  isLeadTimeValid,
} from '../lib/timezone';
import {
  validateSlotBooking,
  generateDailySlots,
  DEFAULT_DOCTOR_SCHEDULE,
} from '../lib/slots';
import { dbRepository } from '../lib/db';
import { validateTelegramInitData } from '../lib/telegramAuth';

function runTests() {
  console.log('🧪 Starting Automated Business Logic Tests...\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void) {
    total++;
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      throw err;
    }
  }

  // 1. STATE MACHINE & TRANSITIONS
  test('State Machine: pending -> confirmed is allowed', () => {
    const res = validateTransition('pending', 'confirmed');
    assert.strictEqual(res.allowed, true);
  });

  test('State Machine: pending -> cancelled is allowed', () => {
    const res = validateTransition('pending', 'cancelled');
    assert.strictEqual(res.allowed, true);
  });

  test('State Machine: pending -> completed is NOT allowed (must be confirmed first)', () => {
    const res = validateTransition('pending', 'completed');
    assert.strictEqual(res.allowed, false);
    assert.ok(res.error?.includes('not permitted'));
  });

  test('State Machine: confirmed -> completed and confirmed -> no_show are allowed', () => {
    assert.strictEqual(validateTransition('confirmed', 'completed').allowed, true);
    assert.strictEqual(validateTransition('confirmed', 'no_show').allowed, true);
  });

  test('State Machine: completed is terminal (cannot transition to pending or confirmed)', () => {
    assert.strictEqual(validateTransition('completed', 'pending').allowed, false);
    assert.strictEqual(validateTransition('completed', 'confirmed').allowed, false);
  });

  test('State Machine: cancelled is terminal', () => {
    assert.strictEqual(validateTransition('cancelled', 'confirmed').allowed, false);
  });

  // 2. TIMEZONE & TASHKENT (UTC+5) CALCULATIONS
  test('Timezone: fromTashkentDateTime converts 14:00 Tashkent to 09:00 UTC', () => {
    const dtUTC = fromTashkentDateTime('2026-11-10', '14:00');
    assert.strictEqual(dtUTC.getUTCHours(), 9);
    assert.strictEqual(dtUTC.getUTCMinutes(), 0);
  });

  test('Timezone: formatTashkentTime formats 09:00 UTC back to 14:00 Tashkent', () => {
    const dtUTC = new Date(Date.UTC(2026, 10, 10, 9, 0, 0));
    assert.strictEqual(formatTashkentTime(dtUTC), '14:00');
  });

  test('Timezone: formatTashkentISODate outputs correct YYYY-MM-DD for midnight UTC', () => {
    // 2026-11-09 20:00 UTC is 2026-11-10 01:00 in Tashkent (+5h)
    const dtUTC = new Date(Date.UTC(2026, 10, 9, 20, 0, 0));
    assert.strictEqual(formatTashkentISODate(dtUTC), '2026-11-10');
  });

  // 3. LEAD TIME & SLOT VALIDATION
  test('Lead time: Reject booking in the past or within 2 hours', () => {
    const pastUTC = new Date(Date.now() - 3600000);
    assert.strictEqual(isLeadTimeValid(pastUTC, 120), false);

    const oneHourAhead = new Date(Date.now() + 60 * 60 * 1000);
    assert.strictEqual(isLeadTimeValid(oneHourAhead, 120), false);

    const threeHoursAhead = new Date(Date.now() + 3 * 60 * 60 * 1000);
    assert.strictEqual(isLeadTimeValid(threeHoursAhead, 120), true);
  });

  // 4. DOUBLE BOOKING & CANCELLATION FREES SLOT
  test('Slots: Double-booking prevention rejects same slot', () => {
    const testDateUTC = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const booked = new Set([testDateUTC.getTime()]);

    const res = validateSlotBooking(testDateUTC, booked, 120);
    assert.strictEqual(res.valid, false);
    assert.ok(res.error?.includes('уже занят'));
  });

  test('Database Repository: Cancellation frees slot and allows rebooking', () => {
    const futureUTC = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const docId = 'doc-test-1';

    // 1. Create first appointment
    const created1 = dbRepository.createAppointment({
      patientName: 'Пациент 1',
      patientPhone: '+998901111111',
      doctorId: docId,
      doctorName: 'Д-р Тест',
      serviceTitle: 'Консультация',
      dateTimeUTC: futureUTC,
      isDemo: false,
    });
    assert.strictEqual(created1.success, true);

    // 2. Try to double-book same slot -> must fail
    const createdConflict = dbRepository.createAppointment({
      patientName: 'Пациент 2',
      patientPhone: '+998902222222',
      doctorId: docId,
      doctorName: 'Д-р Тест',
      serviceTitle: 'Чистка',
      dateTimeUTC: futureUTC,
      isDemo: false,
    });
    assert.strictEqual(createdConflict.success, false);
    assert.ok(createdConflict.error?.includes('уже занят'));

    // 3. Cancel first appointment
    const cancelled = dbRepository.updateStatus(
      created1.appointment!.id,
      'cancelled',
      'patient',
      'pat1',
      'Отменил'
    );
    assert.strictEqual(cancelled.success, true);
    assert.strictEqual(cancelled.appointment?.status, 'cancelled');

    // 4. Slot is now free -> Second patient can book it!
    const rebooked = dbRepository.createAppointment({
      patientName: 'Пациент 2 (Спасённый слот)',
      patientPhone: '+998902222222',
      doctorId: docId,
      doctorName: 'Д-р Тест',
      serviceTitle: 'Чистка',
      dateTimeUTC: futureUTC,
      isDemo: false,
    });
    assert.strictEqual(rebooked.success, true);
    assert.strictEqual(rebooked.appointment?.status, 'pending');
  });

  // 5. REMINDERS SCHEDULING & CANCELLATION
  test('Reminders: 24h & 2h reminders scheduled when appointment is >24h ahead', () => {
    const now = new Date();
    const futureAppointment = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const reminders = calculateRequiredReminders(futureAppointment, now);
    assert.strictEqual(reminders.length, 2);
    assert.strictEqual(reminders[0].type, 'reminder_24h');
    assert.strictEqual(reminders[1].type, 'reminder_2h');
  });

  test('Reminders: only 2h reminder scheduled when appointment is booked 5h ahead', () => {
    const now = new Date();
    const appointment5h = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    const reminders = calculateRequiredReminders(appointment5h, now);
    assert.strictEqual(reminders.length, 1);
    assert.strictEqual(reminders[0].type, 'reminder_2h');
  });

  // 6. METRICS CALCULATIONS
  test('Metrics: Calculation formulas and admin saved time', () => {
    const metrics = dbRepository.getMetrics(7);
    assert.strictEqual(typeof metrics.totalBookings, 'number');
    assert.strictEqual(typeof metrics.confirmationRatePercent, 'number');
    assert.ok(metrics.confirmationRatePercent >= 0 && metrics.confirmationRatePercent <= 100);
    assert.strictEqual(metrics.adminMinutesSaved, metrics.botBookings * 4);
    assert.strictEqual(metrics.adminHoursSaved, Number((metrics.adminMinutesSaved / 60).toFixed(1)));
  });

  // 7. TELEGRAM HMAC INITDATA VALIDATION
  test('Telegram Auth: HMAC-SHA256 validation correctly verifies valid hash', () => {
    const mockBotToken = '123456789:ABCDEF_mock_token_for_tests';
    const authDate = Math.floor(Date.now() / 1000);
    const userJson = JSON.stringify({ id: 987654321, first_name: 'TestAdmin' });

    // Build data-check-string
    const dataCheckString = `auth_date=${authDate}\nuser=${userJson}`;
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(mockBotToken).digest();
    const validHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const rawInitData = `user=${encodeURIComponent(userJson)}&auth_date=${authDate}&hash=${validHash}`;

    const authRes = validateTelegramInitData(rawInitData, mockBotToken, '987654321');
    assert.strictEqual(authRes.authenticated, true);
    assert.strictEqual(authRes.isAdmin, true);
    assert.strictEqual(authRes.user?.id, 987654321);
  });

  test('Telegram Auth: Rejects tampered or invalid hash', () => {
    const mockBotToken = '123456789:ABCDEF_mock_token_for_tests';
    const authDate = Math.floor(Date.now() / 1000);
    const userJson = JSON.stringify({ id: 987654321, first_name: 'TestAdmin' });
    const fakeHash = '0000000000000000000000000000000000000000000000000000000000000000';

    const rawInitData = `user=${encodeURIComponent(userJson)}&auth_date=${authDate}&hash=${fakeHash}`;

    const prevDemo = process.env.DEMO_MODE;
    process.env.DEMO_MODE = 'false';
    const authRes = validateTelegramInitData(rawInitData, mockBotToken, '987654321');
    process.env.DEMO_MODE = prevDemo;

    assert.strictEqual(authRes.authenticated, false);
    assert.strictEqual(authRes.error, 'Invalid HMAC signature');
  });

  console.log(`\n🎉 All ${passed}/${total} automated tests PASSED successfully!\n`);
}

runTests();
