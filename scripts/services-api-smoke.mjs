// Smoke test for the staff services API and the price snapshot on bookings.
// Run against a LOCAL server with a TEST database only (never production).
// DATABASE_URL must point at the test database; BOT_TOKEN must be a test value.
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const BASE = 'http://localhost:3300';
const TOKEN = process.env.BOT_TOKEN || '123456:TESTTOKEN';
const db = new PrismaClient();

function initData(userId) {
  const authDate = Math.floor(Date.now() / 1000);
  const user = JSON.stringify({ id: userId, first_name: 'T' });
  const check = `auth_date=${authDate}\nuser=${user}`;
  const secret = crypto.createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return `user=${encodeURIComponent(user)}&auth_date=${authDate}&hash=${hash}`;
}
const ADMIN = initData(111), PATIENT = initData(222);
async function call(method, path, body, auth) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['X-Telegram-Init-Data'] = auth;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json().catch(() => null) };
}
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

const svc = { title: 'Smoke Услуга', category: 'therapy', priceUzs: 300000, durationMinutes: 30 };

let r = await call('POST', '/api/admin/services', svc);
check('no auth -> 401', r.status === 401, `(${r.status})`);
r = await call('POST', '/api/admin/services', svc, PATIENT);
check('patient -> 403', r.status === 403, `(${r.status})`);
r = await call('POST', '/api/admin/services', { ...svc, priceUzs: 1.5 }, ADMIN);
check('fractional price -> 400', r.status === 400, `(${r.status})`);
r = await call('POST', '/api/admin/services', svc, ADMIN);
check('admin creates service -> 201', r.status === 201, `(${r.status})`);
const id = r.body?.service?.id;

r = await call('GET', '/api/admin/services', null, ADMIN);
check('admin lists services', r.status === 200 && r.body.services.some((s) => s.id === id));

r = await call('PATCH', `/api/admin/services/${id}`, { priceUzs: 350000, sortOrder: 2 }, ADMIN);
check('admin changes price and order -> 200', r.status === 200 && r.body.service.priceUzs === 350000 && r.body.service.sortOrder === 2);

// Booking with the service id: title and price come from the database
const before = await call('POST', '/api/appointments', { patientName: 'Пациент Услуга', patientPhone: '+998901112233', serviceId: id, serviceTitle: 'Подделка из клиента', dateStr: '2030-03-04', timeStr: '11:00', consentAgreed: true }, PATIENT);
check('booking with service id -> 200', before.status === 200, `(${before.status}) ${before.body?.error ?? ''}`);
const appId = before.body?.appointment?.id;
const row = appId ? await db.appointment.findUnique({ where: { id: appId } }) : null;
check('title comes from the database, not the client', row?.serviceTitle === svc.title, `(${row?.serviceTitle})`);
check('price snapshot stored at booking (350000)', row?.priceUzs === 350000, `(${row?.priceUzs})`);

// Price change later must not rewrite the past booking
r = await call('PATCH', `/api/admin/services/${id}`, { priceUzs: 500000 }, ADMIN);
const rowAfter = appId ? await db.appointment.findUnique({ where: { id: appId } }) : null;
check('later price change keeps the old snapshot', rowAfter?.priceUzs === 350000, `(${rowAfter?.priceUzs})`);

// Inactive service cannot be booked
await call('PATCH', `/api/admin/services/${id}`, { isActive: false }, ADMIN);
r = await call('POST', '/api/appointments', { patientName: 'Пациент Услуга', patientPhone: '+998901112233', serviceId: id, dateStr: '2030-03-04', timeStr: '12:00', consentAgreed: true }, PATIENT);
check('inactive service -> 400', r.status === 400, `(${r.status})`);

await db.$disconnect();
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
