'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarClock, ChevronRight, X } from 'lucide-react';
import type { Language } from '../data/clinicData';
import { telegramAuthHeaders } from '../lib/telegramClient';
import { CalendarPicker } from './booking/CalendarPicker';
import { TimePicker } from './booking/TimePicker';
import { formatDayLong } from '../lib/bookingDates';

// Patient's own appointments. One featured next visit, the rest as a compact list.
// Shown only inside Telegram (signed initData required).

interface MyAppointment {
  id: string;
  serviceTitle: string;
  doctorName: string;
  doctorId: string | null;
  dateTime: string;
  dateStr: string;
  status: string;
  canChange: boolean;
  changeBlockedReason: string | null;
}

const STATUS: Record<string, { label: string; dot: string; pill: string }> = {
  pending: { label: 'Ожидает подтверждения', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Подтверждена', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reschedule_requested: { label: 'Запрошен перенос', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Отменена', dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border-slate-200' },
  completed: { label: 'Визит состоялся', dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border-slate-200' },
  no_show: { label: 'Не пришли', dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });
const shortDay = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'Asia/Tashkent' });

function errorText(data: any): string {
  if (!data) return 'Не удалось выполнить действие';
  if (typeof data.error === 'string') return data.error;
  return data.error?.message || 'Не удалось выполнить действие';
}

export function MyAppointments({ lang, triggerHaptic }: { lang: Language; triggerHaptic?: (k: 'light' | 'medium' | 'heavy') => void }) {
  const [items, setItems] = useState<MyAppointment[] | null>(null);
  const [inTelegram, setInTelegram] = useState<boolean>(false);
  const [picked, setPicked] = useState<MyAppointment | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<MyAppointment | null>(null);
  const [cancelFor, setCancelFor] = useState<MyAppointment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/my/appointments', { headers: telegramAuthHeaders() });
    if (!res.ok) return setItems([]);
    const data = await res.json();
    setItems(data.appointments ?? []);
  }, []);

  useEffect(() => {
    const has = Boolean(window.Telegram?.WebApp?.initData);
    setInTelegram(has);
    if (has) load();
  }, [load]);

  if (!inTelegram) return null;
  if (items === null) {
    // Reserve the space of the next-visit card while loading, so nothing pops in later
    return (
      <section className="space-y-3" aria-label="Мои записи" aria-busy="true">
        <div className="chat-skeleton h-6 w-40 rounded-full" />
        <div className="chat-skeleton h-[220px] rounded-3xl" />
      </section>
    );
  }

  const upcoming = items.filter((i) => new Date(i.dateTime).getTime() >= Date.now() - 60 * 60 * 1000 && i.status !== 'cancelled');
  if (upcoming.length === 0) return null;

  const [featured, ...rest] = upcoming;
  const featuredStatus = STATUS[featured.status] ?? STATUS.pending;

  return (
    <section className="space-y-3" aria-label="Мои записи">
      <div className="flex items-end justify-between px-1">
        <h2 className="type-section-title">Мои записи</h2>
        {upcoming.length > 1 && <span className="text-[12px] text-[var(--ink-muted)]">В планах: {upcoming.length}</span>}
      </div>

      {message && (
        <p role="status" className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2.5 chat-bubble-in">
          {message}
        </p>
      )}

      {/* Next visit: the one thing the patient needs to see */}
      <article className="clinic-card rounded-3xl p-5 space-y-4 chat-bubble-in relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">Ближайший визит</span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${featuredStatus.pill}`}>{featuredStatus.label}</span>
        </div>
        <div>
          <div className="text-[20px] font-bold text-[var(--ink)] leading-tight">
            {formatDayLong(featured.dateStr, lang)}
          </div>
          <div className="text-[15px] font-semibold text-[var(--accent)] mt-0.5">{timeFormat.format(new Date(featured.dateTime))}</div>
        </div>
        <div className="space-y-0.5">
          <div className="text-[14px] font-semibold text-[var(--ink)] truncate">{featured.serviceTitle}</div>
          <div className="text-[13px] text-[var(--ink-secondary)] truncate">{featured.doctorName}</div>
        </div>
        {featured.canChange ? (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic?.('light');
                setRescheduleFor(featured);
              }}
              className="min-h-[46px] rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-[14px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform duration-200"
            >
              <CalendarClock className="w-4 h-4" /> Перенести
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic?.('light');
                setCancelFor(featured);
              }}
              className="min-h-[46px] rounded-full border border-slate-200 text-slate-700 text-[14px] font-bold active:scale-[0.97] transition-transform duration-200"
            >
              Отменить
            </button>
          </div>
        ) : (
          featured.changeBlockedReason && <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed">{featured.changeBlockedReason}</p>
        )}
      </article>

      {/* Other visits: compact rows, details and actions open on tap */}
      {rest.length > 0 && (
        <div className="clinic-card rounded-3xl overflow-hidden divide-y divide-slate-100">
          {rest.map((item, index) => {
            const st = STATUS[item.status] ?? STATUS.pending;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic?.('light');
                  setPicked(item);
                }}
                style={{ animationDelay: `${index * 60}ms` }}
                className="w-full min-h-[64px] px-4 py-3 flex items-center gap-3 text-left active:bg-slate-50 transition-colors duration-200 sheet-reveal"
              >
                <div className="w-12 shrink-0 text-center">
                  <div className="text-[13px] font-bold text-[var(--ink)] leading-tight">{shortDay.format(new Date(item.dateTime))}</div>
                  <div className="text-[11px] text-[var(--ink-muted)]">{timeFormat.format(new Date(item.dateTime))}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-[var(--ink)] truncate">{item.serviceTitle}</div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-secondary)] truncate">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} aria-hidden="true" />
                    <span className="truncate">{st.label} · {item.doctorName}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {picked && (
        <Sheet title="Запись" onClose={() => setPicked(null)}>
          <div className="space-y-1 mb-4">
            <div className="text-[15px] font-bold text-[var(--ink)]">{formatDayLong(picked.dateStr, lang)}, {timeFormat.format(new Date(picked.dateTime))}</div>
            <div className="text-[13px] text-[var(--ink-secondary)]">{picked.serviceTitle} · {picked.doctorName}</div>
          </div>
          {picked.canChange ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const target = picked;
                  setPicked(null);
                  setRescheduleFor(target);
                }}
                className="min-h-[46px] rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-[14px] font-bold flex items-center justify-center gap-1.5"
              >
                <CalendarClock className="w-4 h-4" /> Перенести
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = picked;
                  setPicked(null);
                  setCancelFor(target);
                }}
                className="min-h-[46px] rounded-full border border-slate-200 text-slate-700 text-[14px] font-bold"
              >
                Отменить
              </button>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">{picked.changeBlockedReason}</p>
          )}
        </Sheet>
      )}

      {rescheduleFor && (
        <RescheduleSheet
          item={rescheduleFor}
          lang={lang}
          triggerHaptic={triggerHaptic}
          onClose={() => setRescheduleFor(null)}
          onDone={() => {
            setRescheduleFor(null);
            setMessage('Запись перенесена. Новое время подтверждено.');
            load();
          }}
        />
      )}

      {cancelFor && (
        <Sheet title="Отменить визит?" onClose={() => setCancelFor(null)}>
          <p className="text-[14px] text-[var(--ink-secondary)] leading-relaxed">
            {formatDayLong(cancelFor.dateStr, lang)}, {timeFormat.format(new Date(cancelFor.dateTime))} — {cancelFor.serviceTitle}. Слот освободится для других пациентов.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setCancelFor(null)} className="min-h-[44px] rounded-full border border-slate-200 text-slate-700 font-semibold text-[13px]">
              Оставить
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await fetch(`/api/my/appointments/${cancelFor.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', ...telegramAuthHeaders() },
                  body: JSON.stringify({ action: 'cancel' }),
                });
                const data = await res.json().catch(() => ({}));
                setBusy(false);
                setCancelFor(null);
                setMessage(res.ok ? 'Запись отменена.' : errorText(data));
                load();
              }}
              className="min-h-[44px] rounded-full bg-red-600 text-white font-bold text-[13px] disabled:opacity-60"
            >
              Отменить визит
            </button>
          </div>
        </Sheet>
      )}
    </section>
  );
}

function RescheduleSheet({
  item,
  lang,
  triggerHaptic,
  onClose,
  onDone,
}: {
  item: MyAppointment;
  lang: Language;
  triggerHaptic?: (k: 'light' | 'medium' | 'heavy') => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!date || !time) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/my/appointments/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...telegramAuthHeaders() },
      body: JSON.stringify({ action: 'reschedule', dateStr: date, timeStr: time }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(errorText(data));
    triggerHaptic?.('medium');
    onDone();
  };

  return (
    <Sheet title="Новое время" onClose={onClose}>
      <p className="text-[12px] text-[var(--ink-secondary)] mb-3">{item.serviceTitle} · {item.doctorName}</p>
      <CalendarPicker value={date} lang={lang} triggerHaptic={triggerHaptic} onChange={(iso) => { setDate(iso); setTime(null); }} />
      {date && (
        <div className="mt-4 space-y-2">
          <div className="text-[13px] font-bold text-[var(--ink)]">{formatDayLong(date, lang)}</div>
          <TimePicker key={`${date}-${item.doctorId ?? 'any'}`} dateIso={date} doctorId={item.doctorId ?? undefined} value={time} lang={lang} triggerHaptic={triggerHaptic} onChange={setTime} />
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-[12px] font-semibold text-red-600">{error}</p>}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onClose} className="min-h-[44px] rounded-full border border-slate-200 text-slate-700 font-semibold text-[13px]">
          Назад
        </button>
        <button type="button" disabled={!date || !time || saving} onClick={save} className="btn-pill-primary min-h-[44px] text-[13px] disabled:opacity-40">
          {saving ? 'Сохраняем…' : 'Перенести'}
        </button>
      </div>
    </Sheet>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Закрыть" onClick={onClose} className="absolute inset-0 bg-slate-950/55 about-backdrop-in" />
      <div className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto bg-white/[0.98] rounded-t-[28px] sm:rounded-3xl shadow-2xl px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sheet-enter">
        <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-300 mb-3" aria-hidden="true" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[16px] text-[var(--ink)]">{title}</h3>
          <button type="button" aria-label="Закрыть" onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
