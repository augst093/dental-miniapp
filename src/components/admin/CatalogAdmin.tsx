'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ArrowDown, ArrowUp, Pencil, Plus, Stethoscope, X } from 'lucide-react';
import { telegramAuthHeaders } from '../../lib/telegramClient';
import { EmptyState } from '../ui/EmptyState';
import { SERVICE_CATEGORIES } from '../../lib/servicesAdmin';

// Staff screen for doctors and services. Everything is read from and saved to the database through
// the staff API, so a price or a working day change applies without a redeploy.

type Section = 'doctors' | 'services';

interface DoctorRow {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number | null;
  workingDays: number[];
  workingHoursStart: string;
  workingHoursEnd: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

interface ServiceRow {
  id: string;
  title: string;
  category: string;
  priceUzs: number;
  durationMinutes: number;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

const WEEKDAYS: { day: number; short: string }[] = [
  { day: 1, short: 'Пн' },
  { day: 2, short: 'Вт' },
  { day: 3, short: 'Ср' },
  { day: 4, short: 'Чт' },
  { day: 5, short: 'Пт' },
  { day: 6, short: 'Сб' },
  { day: 0, short: 'Вс' },
];

const CATEGORY_LABEL: Record<string, string> = {
  emergency: 'Срочная помощь',
  diagnostics: 'Диагностика',
  therapy: 'Терапия',
  implants: 'Имплантация',
  orthodontics: 'Ортодонтия',
  orthopedics: 'Ортопедия',
  pediatric: 'Детская стоматология',
  hygiene: 'Гигиена',
  other: 'Другое',
};

const SLOT_STEPS = [15, 20, 30, 45, 60];
const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

const formatUzs = (value: number) => `${value.toLocaleString('ru-RU').replace(/\s/g, ' ')} сум`;

async function apiCall<T>(method: string, url: string, body?: unknown): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...telegramAuthHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as T };
}

function errorText(data: any): string {
  if (!data) return 'Не удалось выполнить действие';
  if (typeof data.error === 'string') return data.error;
  return data.error?.message || 'Не удалось выполнить действие';
}

// ---------- Bottom sheet with a form ----------

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
      <div className="relative w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sheet-enter">
        <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-300 mb-3" aria-hidden="true" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[16px] text-slate-900">{title}</h3>
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

const fieldClass = 'w-full min-h-[44px] px-3 rounded-2xl border border-slate-200 bg-white text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30';
const labelClass = 'block text-[12px] font-semibold text-slate-600 mb-1';

// ---------- Main component ----------

export function CatalogAdmin() {
  const [section, setSection] = useState<Section>('doctors');
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ kind: Section; item: DoctorRow | ServiceRow | null } | null>(null);
  const [confirmOff, setConfirmOff] = useState<{ id: string; count: number; name: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [d, s] = await Promise.all([
      apiCall<{ doctors: DoctorRow[] }>('GET', '/api/admin/doctors'),
      apiCall<{ services: ServiceRow[] }>('GET', '/api/admin/services'),
    ]);
    if (!d.ok || !s.ok) {
      setError(errorText(d.ok ? s.data : d.data));
    } else {
      setDoctors(d.data.doctors);
      setServices(s.data.services);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 2600);
  };

  // Switch a doctor on or off. Turning off with future bookings asks for confirmation first.
  const toggleDoctor = async (doc: DoctorRow, force = false) => {
    setBusyId(doc.id);
    const res = await apiCall<any>('PATCH', `/api/admin/doctors/${doc.id}`, { isActive: !doc.isActive, force });
    setBusyId(null);
    if (res.status === 409 && res.data?.error?.code === 'HAS_FUTURE_APPOINTMENTS') {
      setConfirmOff({ id: doc.id, count: res.data.error.count, name: doc.name });
      return;
    }
    if (!res.ok) return flash(errorText(res.data));
    setConfirmOff(null);
    flash(doc.isActive ? 'Врач отключён' : 'Врач включён');
    load();
  };

  // Move a service up or down by swapping sort orders
  const moveService = async (index: number, direction: -1 | 1) => {
    const other = index + direction;
    if (other < 0 || other >= services.length) return;
    const a = services[index];
    const b = services[other];
    setBusyId(a.id);
    const [r1, r2] = await Promise.all([
      apiCall<any>('PATCH', `/api/admin/services/${a.id}`, { sortOrder: b.sortOrder }),
      apiCall<any>('PATCH', `/api/admin/services/${b.id}`, { sortOrder: a.sortOrder }),
    ]);
    setBusyId(null);
    if (!r1.ok || !r2.ok) return flash('Не удалось изменить порядок');
    load();
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-full bg-slate-100">
          {(['doctors', 'services'] as Section[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`min-h-[40px] px-4 rounded-full text-[13px] font-semibold transition-colors duration-200 ${
                section === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {key === 'doctors' ? `Врачи (${doctors.length})` : `Услуги (${services.length})`}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing({ kind: section, item: null })}
          className="min-h-[44px] px-3.5 rounded-full bg-[var(--accent)] text-white text-[13px] font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>{section === 'doctors' ? 'Врач' : 'Услуга'}</span>
        </button>
      </div>

      {notice && (
        <div className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2 chat-bubble-in" role="status">
          {notice}
        </div>
      )}

      {loading && (
        <div className="space-y-2.5" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="chat-skeleton h-24 rounded-3xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="clinic-card p-4 rounded-2xl flex items-center justify-between gap-3">
          <span className="text-[13px] text-slate-700">{error}</span>
          <button type="button" onClick={load} className="min-h-[40px] px-3.5 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold">
            Повторить
          </button>
        </div>
      )}

      {!loading && !error && section === 'doctors' && (
        doctors.length === 0 ? (
          <EmptyState icon={<Stethoscope className="w-6 h-6" />} title="Врачей пока нет" text="Добавьте первого врача, чтобы пациенты могли записываться к нему." action={{ label: 'Добавить врача', onClick: () => setEditing({ kind: 'doctors', item: null }) }} />
        ) : (
          <div className="space-y-2.5 stagger">
            {doctors.map((doc) => (
              <div key={doc.id} className={`rounded-3xl border p-4 bg-white/95 transition-opacity duration-200 ${doc.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-[14px] text-slate-900 truncate">{doc.name}</h4>
                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{doc.specialty}</p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {doc.experienceYears !== null ? `${doc.experienceYears} лет стажа · ` : ''}
                      {doc.workingHoursStart}–{doc.workingHoursEnd} · шаг {doc.slotDurationMinutes} мин
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={doc.isActive}
                    aria-label={doc.isActive ? 'Отключить врача' : 'Включить врача'}
                    disabled={busyId === doc.id}
                    onClick={() => toggleDoctor(doc)}
                    className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-300 ${doc.isActive ? 'bg-emerald-500' : 'bg-slate-300'} disabled:opacity-50`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${doc.isActive ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {WEEKDAYS.map((w) => (
                      <span key={w.day} className={`text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${doc.workingDays.includes(w.day) ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'bg-slate-100 text-slate-400'}`}>
                        {w.short}
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={() => setEditing({ kind: 'doctors', item: doc })} className="min-h-[40px] px-3 rounded-full bg-slate-100 text-slate-700 text-[12px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform">
                    <Pencil className="w-3.5 h-3.5" /> Изменить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {!loading && !error && section === 'services' && (
        services.length === 0 ? (
          <EmptyState icon={<Plus className="w-6 h-6" />} title="Услуг пока нет" text="Добавьте услуги и цены: пациенты увидят их при записи." action={{ label: 'Добавить услугу', onClick: () => setEditing({ kind: 'services', item: null }) }} />
        ) : (
          <div className="space-y-2.5 stagger">
            {services.map((srv, index) => (
              <div key={srv.id} className={`rounded-3xl border p-4 bg-white/95 transition-opacity duration-200 ${srv.isActive ? 'border-slate-200/90' : 'border-slate-200 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">{CATEGORY_LABEL[srv.category] ?? srv.category}</div>
                    <h4 className="font-bold text-[14px] text-slate-900 mt-0.5">{srv.title}</h4>
                    <p className="text-[12px] text-slate-600 mt-1">{formatUzs(srv.priceUzs)} · {srv.durationMinutes} мин{srv.isActive ? '' : ' · скрыта'}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button type="button" aria-label="Выше" disabled={index === 0 || busyId === srv.id} onClick={() => moveService(index, -1)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button type="button" aria-label="Ниже" disabled={index === services.length - 1 || busyId === srv.id} onClick={() => moveService(index, 1)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center disabled:opacity-30 active:scale-90 transition-transform">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => setEditing({ kind: 'services', item: srv })} className="min-h-[40px] px-3 rounded-full bg-slate-100 text-slate-700 text-[12px] font-semibold flex items-center gap-1.5 active:scale-95 transition-transform">
                    <Pencil className="w-3.5 h-3.5" /> Изменить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {editing && (
        <EditSheet
          kind={editing.kind}
          item={editing.item}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            flash(message);
            load();
          }}
        />
      )}

      {confirmOff && (
        <Sheet title="Отключить врача?" onClose={() => setConfirmOff(null)}>
          <div className="flex gap-3 items-start rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-900 leading-relaxed">
              У врача <b>{confirmOff.name}</b> есть {confirmOff.count} будущих записей. После отключения пациенты не смогут записаться к нему,
              а эти записи останутся. Перенесите их в разделе «Календарь», прежде чем отключать врача.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setConfirmOff(null)} className="min-h-[44px] rounded-full border border-slate-200 text-slate-700 font-semibold text-[13px]">
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                const doc = doctors.find((d) => d.id === confirmOff.id);
                if (doc) toggleDoctor(doc, true);
              }}
              className="min-h-[44px] rounded-full bg-red-600 text-white font-bold text-[13px]"
            >
              Отключить все равно
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ---------- Create / edit form ----------

function EditSheet({ kind, item, onClose, onSaved }: { kind: Section; item: DoctorRow | ServiceRow | null; onClose: () => void; onSaved: (message: string) => void }) {
  const isDoctor = kind === 'doctors';
  const doc = isDoctor ? (item as DoctorRow | null) : null;
  const srv = !isDoctor ? (item as ServiceRow | null) : null;

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const remove = async (force = false) => {
    if (!item) return;
    setSaving(true);
    setFormError(null);
    const url = isDoctor ? `/api/admin/doctors/${item.id}?force=${force}` : `/api/admin/services/${item.id}`;
    const res = await fetch(url, { method: 'DELETE', headers: telegramAuthHeaders() });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.status === 409 && data?.error?.code === 'HAS_FUTURE_APPOINTMENTS') {
      setFormError(data.error.message);
      setConfirmDelete(true);
      return;
    }
    if (!res.ok) return setFormError(errorText(data));
    onSaved(data.mode === 'deleted' ? 'Удалено' : 'Скрыто от пациентов: по ней были записи, история сохранена');
  };

  // Doctor fields
  const [name, setName] = useState(doc?.name ?? '');
  const [specialty, setSpecialty] = useState(doc?.specialty ?? '');
  const [experience, setExperience] = useState(doc?.experienceYears?.toString() ?? '');
  const [days, setDays] = useState<number[]>(doc?.workingDays ?? [1, 2, 3, 4, 5, 6]);
  const [hoursStart, setHoursStart] = useState(doc?.workingHoursStart ?? '09:00');
  const [hoursEnd, setHoursEnd] = useState(doc?.workingHoursEnd ?? '20:00');
  const [slotStep, setSlotStep] = useState(doc?.slotDurationMinutes ?? 30);

  // Service fields
  const [title, setTitle] = useState(srv?.title ?? '');
  const [category, setCategory] = useState(srv?.category ?? 'therapy');
  const [price, setPrice] = useState(srv ? String(srv.priceUzs) : '');
  const [duration, setDuration] = useState(srv?.durationMinutes ?? 30);
  const [description, setDescription] = useState(srv?.description ?? '');

  const [active, setActive] = useState(item ? item.isActive : true);

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const save = async () => {
    setSaving(true);
    setFormError(null);
    let res;
    if (isDoctor) {
      const body = {
        name,
        specialty,
        experienceYears: experience === '' ? null : Number(experience),
        workingDays: days,
        workingHoursStart: hoursStart,
        workingHoursEnd: hoursEnd,
        slotDurationMinutes: slotStep,
        isActive: active,
      };
      res = doc
        ? await apiCall<any>('PATCH', `/api/admin/doctors/${doc.id}`, { ...body, force: false })
        : await apiCall<any>('POST', '/api/admin/doctors', body);
    } else {
      const body = {
        title,
        category,
        priceUzs: Number(price.replace(/\s/g, '')),
        durationMinutes: duration,
        description: description.trim() === '' ? null : description,
        isActive: active,
      };
      res = srv
        ? await apiCall<any>('PATCH', `/api/admin/services/${srv.id}`, body)
        : await apiCall<any>('POST', '/api/admin/services', body);
    }
    setSaving(false);
    if (!res.ok) {
      if (res.status === 409 && res.data?.error?.code === 'HAS_FUTURE_APPOINTMENTS') {
        setFormError('Врач с будущими записями не отключается из формы. Используйте переключатель в списке.');
      } else {
        setFormError(errorText(res.data));
      }
      return;
    }
    onSaved(doc || srv ? 'Изменения сохранены' : isDoctor ? 'Врач добавлен' : 'Услуга добавлена');
  };

  return (
    <Sheet title={doc || srv ? (isDoctor ? 'Врач' : 'Услуга') : isDoctor ? 'Новый врач' : 'Новая услуга'} onClose={onClose}>
      <div className="space-y-3.5">
        {isDoctor ? (
          <>
            <div>
              <label className={labelClass} htmlFor="d-name">Имя и фамилия</label>
              <input id="d-name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Д-р Имя Фамилия" />
            </div>
            <div>
              <label className={labelClass} htmlFor="d-spec">Специализация</label>
              <input id="d-spec" className={fieldClass} value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Например: терапия, эндодонтия" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass} htmlFor="d-exp">Стаж, лет</label>
                <input id="d-exp" inputMode="numeric" className={fieldClass} value={experience} onChange={(e) => setExperience(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div>
                <label className={labelClass} htmlFor="d-step">Шаг записи</label>
                <select id="d-step" className={fieldClass} value={slotStep} onChange={(e) => setSlotStep(Number(e.target.value))}>
                  {SLOT_STEPS.map((s) => (
                    <option key={s} value={s}>{s} мин</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <span className={labelClass}>Рабочие дни</span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((w) => {
                  const on = days.includes(w.day);
                  return (
                    <button key={w.day} type="button" aria-pressed={on} onClick={() => toggleDay(w.day)} className={`min-h-[40px] min-w-[44px] px-2 rounded-full text-[12px] font-bold transition-colors duration-200 active:scale-90 ${on ? 'bg-[var(--accent)] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {w.short}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass} htmlFor="d-start">Начало</label>
                <input id="d-start" type="time" className={fieldClass} value={hoursStart} onChange={(e) => setHoursStart(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="d-end">Конец</label>
                <input id="d-end" type="time" className={fieldClass} value={hoursEnd} onChange={(e) => setHoursEnd(e.target.value)} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelClass} htmlFor="s-title">Название услуги</label>
              <input id="s-title" className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Лечение кариеса" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={labelClass} htmlFor="s-cat">Категория</label>
                <select id="s-cat" className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)}>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="s-dur">Длительность</label>
                <select id="s-dur" className={fieldClass} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {DURATIONS.map((m) => (
                    <option key={m} value={m}>{m} мин</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="s-price">Цена, сум</label>
              <input id="s-price" inputMode="numeric" className={fieldClass} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))} placeholder="450000" />
              <p className="text-[11px] text-slate-500 mt-1">Новая цена действует только для новых записей. Прошедшие визиты сохраняют свою цену.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="s-desc">Описание (необязательно)</label>
              <textarea id="s-desc" rows={3} className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
            </div>
          </>
        )}

        <label className="flex items-center justify-between gap-3 min-h-[44px] rounded-2xl bg-slate-50 px-3">
          <span className="text-[13px] font-semibold text-slate-700">{isDoctor ? 'Принимает пациентов' : 'Доступна для записи'}</span>
          <input type="checkbox" className="w-5 h-5 accent-[var(--accent)]" checked={active} onChange={(e) => setActive(e.target.checked)} />
        </label>

        {formError && <p role="alert" className="text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-3 py-2">{formError}</p>}

        {item && (
          confirmDelete ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setConfirmDelete(false)} className="min-h-[44px] rounded-full border border-slate-200 text-slate-700 font-semibold text-[13px]">Не удалять</button>
              <button type="button" onClick={() => remove(true)} disabled={saving} className="min-h-[44px] rounded-full bg-red-600 text-white font-bold text-[13px] disabled:opacity-60">Удалить всё равно</button>
            </div>
          ) : (
            <button type="button" onClick={() => remove(false)} disabled={saving} className="min-h-[44px] w-full rounded-full border border-red-200 text-red-600 font-semibold text-[13px] disabled:opacity-60">
              Удалить
            </button>
          )
        )}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-full border border-slate-200 text-slate-700 font-semibold text-[13px]">
            Отмена
          </button>
          <button type="button" onClick={save} disabled={saving} className="min-h-[44px] rounded-full bg-[var(--accent)] text-white font-bold text-[13px] disabled:opacity-60 active:scale-[0.98] transition-transform">
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
