'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarClock, X } from 'lucide-react';
import type { Language } from '../data/clinicData';
import { telegramAuthHeaders } from '../lib/telegramClient';
import { CalendarPicker } from './booking/CalendarPicker';
import { TimePicker } from './booking/TimePicker';
import { formatDayLong } from '../lib/bookingDates';

// Patient's own appointments: reschedule or cancel. Shown only inside Telegram (signed initData required).

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

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Ожидает подтверждения', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Подтверждена', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reschedule_requested: { label: 'Запрошен перенос', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Отменена', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  completed: { label: 'Визит состоялся', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  no_show: { label: 'Не пришли', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });

function errorText(data: any): string {
  if (!data) return 'Не удалось выполнить действие';
  if (typeof data.error === 'string') return data.error;
  return data.error?.message || 'Не удалось выполнить действие';
}

export function MyAppointments({ lang, triggerHaptic }: { lang: Language; triggerHaptic?: (k: 'light' | 'medium' | 'heavy') => void }) {
  const [items, setItems] = useState<MyAppointment[] | null>(null);
  const [inTelegram, setInTelegram] = useState<boolean>(false);
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

  if (!inTelegram || items === null || items.length === 0) return null;

  const upcoming = items.filter((i) => new Date(i.dateTime).getTime() >= Date.now() - 60 * 60 * 1000 && i.status !== 'cancelled');
  if (upcoming.length === 0) return null;

  return (
    <section className="space-y-2.5" aria-label="Мои записи">
      <h2 className="type-section-title">Мои записи</h2>
      {message && <p className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2">{message}</p>}
      {upcoming.map((item) => {
        const st = STATUS[item.status] ?? STATUS.pending;
        const when = `${formatDayLong(item.dateStr, lang)}, ${timeFormat.format(new Date(item.dateTime))}`;
        return (
          <div key={item.id} className="clinic-card p-4 rounded-3xl space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold text-[14px] text-[var(--ink)] truncate">{item.serviceTitle}</div>
                <div className="text-[12px] text-[var(--ink-secondary)] truncate">{item.doctorName}</div>
                <div className="text-[13px] font-semibold text-[var(--accent)] mt-1">{when}</div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${st.cls}`}>{st.label}</span>
            </div>
            {item.canChange ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic?.('light');
                    setRescheduleFor(item);
                  }}
                  className="min-h-[44px] rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] text-[13px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <CalendarClock className="w-4 h-4" /> Перенести
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic?.('light');
                    setCancelFor(item);
                  }}
                  className="min-h-[44px] rounded-full border border-slate-200 text-slate-700 text-[13px] font-bold active:scale-95 transition-transform"
                >
                  Отменить
                </button>
              </div>
            ) : (
              item.changeBlockedReason && <p className="text-[12px] text-[var(--ink-muted)]">{item.changeBlockedReason}</p>
            )}
          </div>
        );
      })}

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
