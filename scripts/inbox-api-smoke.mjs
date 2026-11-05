// Smoke test for the inbox API. Run against a LOCAL server with a TEST database only.
// BOT_TOKEN must be a test value: replies are expected to fail delivery, and the failure must be stored.
import crypto from 'crypto';

const BASE = 'http://localhost:3300';
const TOKEN = process.env.BOT_TOKEN || '123456:TESTTOKEN';

function initData(userId, first) {
  const authDate = Math.floor(Date.now() / 1000);
  const user = JSON.stringify({ id: userId, first_name: first });
  const check = `auth_date=${authDate}\nuser=${user}`;
  const secret = crypto.createHmac('sha256', 'WebAppData').update(TOKEN).digest();
  const hash = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return `user=${encodeURIComponent(user)}&auth_date=${authDate}&hash=${hash}`;
}
const ADMIN = initData(111, 'Admin');
const PATIENT = initData(333, 'Пациент');

async function call(method, path, body, auth) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['X-Telegram-Init-Data'] = auth;
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json().catch(() => null) };
}
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} ${extra}`); };

let r = await call('POST', '/api/inbox', { text: 'Вопрос' });
check('patient question without signature -> 401', r.status === 401, `(${r.status})`);
r = await call('POST', '/api/inbox', { text: '   ' }, PATIENT);
check('empty question -> 400', r.status === 400, `(${r.status})`);
r = await call('POST', '/api/inbox', { text: 'Сколько стоит имплант?' }, PATIENT);
check('patient question -> 201', r.status === 201, `(${r.status})`);
const threadId = r.body?.threadId;
r = await call('POST', '/api/inbox', { text: 'Ещё один вопрос' }, PATIENT);
check('follow-up joins the open thread', r.status === 201 && r.body?.threadId === threadId, `(${r.status})`);

r = await call('GET', '/api/admin/inbox');
check('staff list without auth -> 401', r.status === 401, `(${r.status})`);
r = await call('GET', '/api/admin/inbox', null, PATIENT);
check('patient cannot read staff inbox -> 403', r.status === 403, `(${r.status})`);
r = await call('GET', '/api/admin/inbox?status=bogus', null, ADMIN);
check('unknown status filter -> 400', r.status === 400, `(${r.status})`);
r = await call('GET', '/api/admin/inbox?status=new', null, ADMIN);
check('staff sees the new thread with counts', r.status === 200 && r.body.threads.some((t) => t.id === threadId) && r.body.counts.new >= 1, `(new=${r.body?.counts?.new})`);
r = await call('GET', `/api/admin/inbox/${threadId}`, null, ADMIN);
check('thread holds both patient messages', r.status === 200 && r.body.thread.messages.length === 2, `(${r.body?.thread?.messages?.length})`);

r = await call('POST', `/api/admin/inbox/${threadId}/reply`, { text: 'Ответ администратора' }, ADMIN);
check('reply with failing delivery is not reported as sent', r.status === 502 || r.status === 409, `(${r.status}) ${r.body?.error?.code ?? ''}`);
r = await call('GET', `/api/admin/inbox/${threadId}`, null, ADMIN);
const out = r.body?.thread?.messages?.find((m) => m.direction === 'out');
check('failed reply is stored with status failed', out?.deliveryStatus === 'failed', `(${out?.deliveryStatus})`);

r = await call('PATCH', `/api/admin/inbox/${threadId}`, { status: 'resolved' }, ADMIN);
check('staff resolves the thread -> 200', r.status === 200 && r.body.status === 'resolved', `(${r.status})`);
r = await call('POST', '/api/inbox', { text: 'Новый вопрос после закрытия' }, PATIENT);
check('after resolving, a new question opens a new thread', r.status === 201 && r.body?.threadId !== threadId, `(${r.status})`);

console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
process.exit(results.every(Boolean) ? 0 : 1);
