// Smoke test for the staff doctor API. Run against a LOCAL server with a TEST database only:
//   BASE is hard-coded to localhost; start the app with DATABASE_URL pointing at a dev database
//   and BOT_TOKEN set to a test value (never a production token).
import crypto from 'crypto';
const BASE = 'http://localhost:3300';
const TOKEN = '123456:TESTTOKEN';
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

const doc = { name: 'Д-р Smoke Тест', specialty: 'Терапия тестовая', experienceYears: 5, workingDays: [1,2,3,4,5,6], workingHoursStart: '09:00', workingHoursEnd: '18:00', slotDurationMinutes: 30 };

let r = await call('GET', '/api/admin/doctors');
check('no auth -> 401', r.status === 401, `(${r.status})`);
r = await call('GET', '/api/admin/doctors', null, PATIENT);
check('patient -> 403', r.status === 403, `(${r.status})`);
r = await call('POST', '/api/admin/doctors', { ...doc, workingHoursEnd: '08:00' }, ADMIN);
check('invalid hours -> 400', r.status === 400, `(${r.status}) ${r.body?.error}`);
r = await call('POST', '/api/admin/doctors', doc, PATIENT);
check('patient cannot create -> 403', r.status === 403, `(${r.status})`);
r = await call('POST', '/api/admin/doctors', doc, ADMIN);
check('admin creates doctor -> 201', r.status === 201, `(${r.status})`);
const id = r.body?.doctor?.id;
r = await call('GET', '/api/admin/doctors', null, ADMIN);
check('admin lists doctors incl. new one', r.status === 200 && r.body.doctors.some((d) => d.id === id));
r = await call('PATCH', `/api/admin/doctors/${id}`, { experienceYears: 7 }, ADMIN);
check('admin edits experience -> 200', r.status === 200 && r.body.doctor.experienceYears === 7);
r = await call('PATCH', `/api/admin/doctors/nope-missing`, { isActive: false }, ADMIN);
check('unknown doctor -> 404', r.status === 404, `(${r.status})`);

// A future booking for this doctor from a patient
const future = await call('POST', '/api/appointments', { patientName: 'Пациент Тест', patientPhone: '+998901234567', doctorId: id, doctorName: doc.name, serviceTitle: 'Консультация', dateStr: '2030-02-04', timeStr: '10:00', consentAgreed: true }, PATIENT);
check('patient books future slot -> 200', future.status === 200, `(${future.status}) ${future.body?.error ?? ''}`);
r = await call('PATCH', `/api/admin/doctors/${id}`, { isActive: false }, ADMIN);
check('deactivate with future booking -> 409 HAS_FUTURE_APPOINTMENTS', r.status === 409 && r.body?.error?.code === 'HAS_FUTURE_APPOINTMENTS', `(${r.status}) count=${r.body?.error?.count}`);
r = await call('PATCH', `/api/admin/doctors/${id}`, { isActive: false, force: true }, ADMIN);
check('deactivate with force -> 200', r.status === 200 && r.body.doctor.isActive === false);
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
