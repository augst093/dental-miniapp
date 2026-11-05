# Gap audit: DentaLux (Step A)

Branch: `feature/mandatory-spec` (both repos). Nothing pushed to `main`, nothing deployed.
Statuses: **verified** (shown working by a run or a test), **partial** (exists, misses part of the requirement), **missing**, **broken** (exists but violates the requirement).
Evidence: file and line, or the command that was run. Claims from earlier docs and commit messages were not trusted.

## Checks run at audit time

| Repo | Command | Result |
|---|---|---|
| dental_miniapp | `npx tsc --noEmit` | passes |
| dental_miniapp | `npm test` | 17/17 pass (`src/__tests__/test_lifecycle_and_rules.ts`) |
| dental_miniapp | `npm run build` | passes |
| dental_ai_bot | `python -m py_compile` on changed files | passes |
| dental_ai_bot | `python test_system.py` against a local Postgres | passes (language onboarding, lead save). Covers only 2 of the items below. |

No lint script exists in either repo.

## Shortcut check (section 2 of the spec)

| Shortcut | Found? | Evidence |
|---|---|---|
| In-memory `setTimeout` reminders | No | Bot reminders are DB rows polled every 60 s (`dental_ai_bot/services/reminder_service.py:89`). The Mini App writes reminder rows to Postgres (`src/lib/db.ts`). |
| Admin check only in the UI | No for Mini App | Every admin route calls `authorizeAdminRequest` (`src/lib/telegramAuth.ts`). |
| Client-trusted user id | Partly | Booking takes the Telegram id from verified `initData` (`src/app/api/appointments/route.ts`). `/api/chat` and `/api/slots` take no identity. |
| Double booking prevented only in frontend | No | Overlap check runs in a Serializable transaction (`src/lib/db.ts`, P2034 mapped). There is no database exclusion constraint. Partly application-level. |
| Hardcoded or fake numbers in reports | No | Metrics computed from rows (`src/lib/metrics.ts`). The owner report shows placeholders when there is no data. |
| Tests that assert nothing | No | The 17 tests assert state transitions, slots, reminders, metrics, HMAC. |
| Secrets in repo or client bundle | No | `.gitignore` excludes `.env*`. `BOT_TOKEN` and `ADMIN_ID` are server-only. |
| Unhandled rejections in bot handlers | Unknown | Not audited. Needs a dedicated pass. |
| Telegram webhook without secret token | Not applicable | The bot uses long polling, not a webhook (`bot.py:1176-1180`). |

## Section 3: roles and access

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| R-1 | Server-side initData validation, HMAC, constant-time compare, auth_date limit configurable, 401 | **partial** | `validateTelegramInitData` uses `!==` for the hash (`telegramAuth.ts`); `verifyTelegramUser` uses `timingSafeEqual`. The 24 h limit is hardcoded. Chat and slots routes take no identity. |
| R-2 | `ADMIN_ID` bootstrap owner, server-side role checks on staff routes, 403 for patients | **partial** | Admin routes return 401/403/503 (`authorizeAdminRequest`). There is one role only (admin). The bot has no staff check at all. |
| R-3 | Staff table, roles owner / administrator / doctor, UI management, last-owner protection | **missing** | No `Staff` model in `prisma/schema.prisma`. |

## Section 4: admin panel

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| A-1 | Today dashboard with counters, timeline, alerts | **partial** | Today list and status filter counts in `AdminPanel.tsx`. The entry card on home shows totals. No counters for free slots, no timeline per doctor, no alerts block. |
| A-2 | Calendar day and week with doctor filter, tap a free slot to create | **partial** | 7-day calendar in `AdminPanel.tsx`. No doctor filter, no tap-to-create, breaks and days off not shown. |
| A-3 | Appointment details, history, undo 10 s, reason on cancel | **partial** | Status buttons exist. No history view in UI (`AuditLog` is written). No reason list, no undo, no note. |
| A-4 | Manual appointment with validated phone, free slots only, notify checkbox | **partial** | Manual form exists (`AdminPanel.tsx` ~line 750). It posts to the same create route, which checks overlap. No notify checkbox, no patient search. |
| A-5 | Global search with debounce, grouped results | **missing** | Only a local text filter on today's list. |
| A-6 | Patients section (list, card, history, notes, anonymize) | **missing** | No patients UI. `anonymize_user_data` exists in the bot only. |
| A-7 | Doctors management, weekly schedule, breaks, exceptions | **missing** | Doctors come from the static `DOCTORS` constant and `CLINIC_DOCTORS`. The doctor availability toggle in `AdminPanel` is UI only. |
| A-8 | Services management, price snapshot on appointments | **missing** | Services are a static array in `clinicData.ts`. No price snapshot field. |
| A-9 | Reminders screen, retry, reminder settings, staff notification preferences | **missing** | Reminders exist in the DB only. No UI, no settings. |
| A-10 | Inbox with reply delivered through the bot | **missing** | No Inbox model or UI. The AI has no hand-off path. |
| A-11 | Owner report: periods, source split, revenue estimate, CSV, no-show list | **partial** | `OwnerReportTab.tsx` shows 7/30 days, SVG chart, metrics from `computeMetrics`. No CSV, no revenue, no doctor/service breakdown, no no-show list. |
| A-12 | Clinic settings without redeploy | **missing** | Clinic data is in code (`clinicData.ts`, `clinic.config.ts`). |
| A-13 | Audit log viewer | **missing** | `AuditLog` rows are written (`src/lib/db.ts`), nothing shows them. |
| A-14 | Staff management | **missing** | See R-3. |
| A-15 | Daily summary to staff | **missing** | Only a manual digest button and the bot's 08:00 digest (`growth_service.py`). |
| A-16 | Admin UX: skeletons, empty and error states, polling, tap targets, RU/UZ switch, theme | **partial** | Skeleton when loading (added), empty state with action, polling every 25 s (`AdminPanel.tsx:106`). Admin is Russian-only. No offline banner, no `themeParams`, no Desktop layout. |

## Section 5: patient frontend

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| F-1 | Full booking flow with idempotency key, requestContact, consent link, .ics, friendly slot-taken message | **partial** | Flow works (service, doctor, date, time, name, phone, consent, success). No idempotency key (double tap is blocked only by `isSubmitting`). No `requestContact`, no `.ics`. Slot-taken error is shown as text from the server. |
| F-2 | My appointments with cancel and reschedule, respecting the window | **missing** | `VisitCard` shows only the last booking from `localStorage`. There is no list and no server-side cancel or reschedule for patients. |
| F-3 | Language auto-detect, switch, persisted on the patient record | **partial** | Auto-detect from `language_code` in `page.tsx`. Switch exists. Not persisted server-side, bot messages do not use it. |
| F-4 | Calculator and catalog from the same source as booking | **partial** | Services and doctors come from `clinicData.ts`, the calculator too. A second copy exists in `clinic.config.ts` (doctors). |
| F-5 | Polish and accessibility | **partial** | Zoom is allowed. Skeletons and empty states on key screens. Not audited for contrast, labels or keyboard. |
| F-6 | Call buttons read the number from settings and are hidden when there is none | **partial** | Button reads `CLINIC_CONFIG`. The configured number is a placeholder. No hide-if-empty rule. |
| F-7 | Waiting list with 10-minute hold | **missing** | Only a bot table `bot_waitlist` and a notify function. No hold, no offer flow. Not shipped. |

## Section 6: Telegram bot

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| T-1 | Commands per language via `setMyCommands`, `/appointments`, `/language`, `/admin`, menu button | **missing** | No `set_my_commands` in `bot.py`. `/start`, `/digest`, `/waitlist`, `/delete_my_data` exist. |
| T-2 | Webhook with secret token, idempotent by `update_id`, 403 otherwise | **missing** | Long polling (`bot.py:1176-1180`). No `update_id` dedupe. |
| T-3 | Callbacks always answered, idempotent buttons, friendly stale messages, reschedule opens the Mini App | **partial** | 9 callback answers and `handle_reschedule_visit` exist (`bot.py:627`). Idempotency and stale-message text not verified. Reschedule goes to a bot screen, not the Mini App screen. |
| T-4 | Staff notifications with inline actions | **partial** | Group cards from `notifier.py`. No action buttons on Mini App booking alerts (the API posts plain text). |
| T-5 | Blocked bot handled, marked unreachable, shown in the panel | **partial** | `TelegramForbiddenError` handled in `reminder_service.py:168` and `growth_service.py:212,233`: reminder marked failed, staff alerted. Not shown as "unreachable" in any panel. |
| T-6 | Free text to AI with rate limit; photo, voice, sticker, file get a polite reply plus hand-off | **partial** | Free text goes to the AI (`bot.py` router). No photo, voice or document handlers, so those get no reply. |
| T-7 | Outbox with rate limits, `retry_after`, backoff, failed state | **missing** | No outbox table. Sends are direct calls. |
| T-8 | Message quality: short formal texts, escaping, `дд.мм.гггг`, map link | **partial** | HTML parse mode and formatted cards. Dates are raw strings (`2030-01-15 10:00` style) in some messages. No consistent escaping helper. |

## Section 7: backend

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| B-1 | Startup env validation with a schema, `.env.example` | **missing** | No zod or similar. `.env.example` not present in either repo. |
| B-2 | Persistent Postgres, versioned migrations, version column, soft delete, CHECK constraints, indexes | **partial** | Postgres on Railway with a volume (`postgres-volume`). Schema via `prisma db push`, not migrations. No `version` column. No soft delete. Indexes on `Appointment(doctorId,dateTime)`, `dateTime`, `status` exist (`schema.prisma`). |
| B-3 | Booking engine: breaks, exceptions, holidays, durations, DB overlap constraint, idempotency, one state machine, audit rows | **partial** | Slot generator (`src/lib/slots.ts`) covers hours, lead time, booked. No breaks, exceptions, holidays, variable durations. State machine in `appointmentLifecycle.ts` with `ALLOWED_TRANSITIONS`. Audit rows written. Overlap in Serializable transaction, no exclusion constraint. No idempotency key. |
| B-4 | Reminder worker with `FOR UPDATE SKIP LOCKED`, restart-safe, heartbeat, skip past-due, not-confirmed alert | **partial** | Worker polls every 60 s (`reminder_service.py:89`), status and attempts stored, past-due handling in Mini App create. No `SKIP LOCKED`, no heartbeat, no not-confirmed alert (urgent list exists in `database.py`). Safe only with one bot instance. |
| B-5 | No-show prompts after appointment end | **missing** | No such job. |
| B-6 | Reports computed in SQL with Tashkent boundaries, tested with fixtures, CSV endpoint | **partial** | Computed in JS from rows (`src/lib/metrics.ts`), not SQL. Tashkent day boundaries via `timezone.ts`. Metric tests exist. No CSV. |
| B-7 | AI service: context from settings only, PII masking incl. names, medical refusal, emergency routing, injection resistance, timeout, circuit breaker, caps | **partial** | Phones masked (`ai_service.py:121-138`), medical refusal and emergency text in `prompts.py`. Names not masked. No circuit breaker, no daily cap. Injection not tested. Mini App chat has IP rate limit (`src/app/api/chat`). |
| B-8 | Schema validation everywhere, one error format `{error:{code,message}}`, pagination, CORS, CSP and security headers | **partial** | Rate limits on booking and chat. Errors are `{success:false,error}` (not the required shape). No pagination. No CORS config, no CSP or security headers found in `next.config`. |
| B-9 | Structured JSON logs, request id, masked phones, health with DB and bot status, error tracker hook, stale-heartbeat alert | **partial** | `/api/health` returns `{status, time}` only (`src/app/api/health/route.ts`). Plain logs. No request id, no heartbeat, no alert. |
| B-10 | Demo mode fails closed: 404 on all demo endpoints, no seed when off | **broken** | `/api/demo` returns 401/503 when `DEMO_MODE` is off, not 404 (`src/app/api/demo/route.ts` + gate). In-memory seed is created when no DB (`src/lib/db.ts`), with `DEMO_MODE` off it can still run. Demo banner and panel are gated by `?demo=1` only. |
| B-11 | Consent with timestamp and text version, `/delete_my_data`, anonymize, retention job, PRIVACY.md | **partial** | Consent timestamp stored (`consentAt`). `/delete_my_data` exists in the bot. No text version. No admin anonymize in the Mini App. No retention job. No `docs/PRIVACY.md`. |
| B-12 | Backup script, tested restore, RUNBOOK.md | **missing** | Railway backups are not on the trial plan (checked in the Railway backups tab). No script, no runbook. |
| B-13 | One-place clinic config, ONBOARDING in Russian | **partial** | `clinic.config.ts` for the Mini App. The bot keeps its own config in `knowledge_base.json`, `prompts.py`. `docs/ONBOARDING.md` exists (not re-verified). |
| B-14 | Graceful shutdown | **missing** | No signal handlers found in `bot.py`. |
| B-15 | Multi-clinic readiness | **P2, not started** | Out of scope for this step. |

## Section 9: automated tests

| Area | Status | Evidence |
|---|---|---|
| Booking engine: slots, breaks, exceptions, concurrency, idempotency | **partial** | Slot generation and conflict checks tested in `test_lifecycle_and_rules.ts`. No breaks, exceptions or concurrency test. No idempotency test. |
| Status machine, undo, audit, 409 | **partial** | Transitions tested. No undo, no 409 (no version column). |
| Reminders: scheduling, skip past-due, restart idempotency, SKIP LOCKED, retry, alert | **partial** | Scheduling and cancel tested. The rest missing. |
| Outbox | **missing** | Not built. |
| Auth: valid, tampered, expired, role matrix | **partial** | Valid, tampered, admin/non-admin, missing token tested. Expired tested via `authorizeAdminInitData` only. No role matrix (single role). |
| Time: Tashkent midnight boundaries | **partial** | Timezone helpers tested indirectly. No explicit midnight test. |
| Reports with fixtures and hand-computed values, CSV | **partial** | Metric formulas tested. No CSV. |
| AI: PII masking, refusal, emergency, injection, timeout, rate limit | **missing** | Not in the test suite. |
| Demo mode 404 when off | **missing** | Test exists for auth only (`DEMO_MODE=false`), not for 404. |
| Webhook secret and duplicate update | **missing** | No webhook. |

Bot tests (`test_system.py`) cover two behaviours only.

## Section 10: end-to-end demo

Not run. Requires a development bot token and a development database, which do not exist yet. **Needs manual test by owner** until created.

## Summary

- Verified: Mini App type-check, build and 17 unit tests; booking through the API with verified Telegram identity; admin routes locked without a valid signature.
- Largest gaps: patients and doctors and services management, settings, inbox, outbox, webhook, role model, waiting list, demo fail-closed, backups and runbook, tests for concurrency and AI.
- Broken today: demo endpoints do not fail closed (B-10).
- Not ready to show a clinic beyond the current demo: admin management screens (A-5 to A-10, A-12 to A-14), and the bot's delivery guarantees (T-7).
