'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Language } from '../../data/clinicData';
import { STATUS_LABELS, type AppointmentStatus } from '../../lib/appointmentLifecycle';
import { formatTashkentISODate, formatTashkentTime } from '../../lib/timezone';
import { monthGrid, formatMonthTitle, formatDayLong } from '../../lib/bookingDates';

// Staff month calendar: every day with its visit count, the chosen day's visits below.
// Browsable from the current month up to January 2027.

export const CALENDAR_LAST_MONTH = { year: 2027, month0: 0 }; // January 2027

interface Appt {
  id: string;
  dateTime: string;
  status: string;
  patientName: string;
  serviceTitle: string;
  doctorName: string;
}

interface Props {
  appointments: Appt[];
  selected: string;
  onSelect: (iso: string) => void;
  onAddForDate: (iso: string) => void;
  todayIso: string;
  lang?: Language;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function monthIndex(year: number, month0: number) {
  return year * 12 + month0;
}

export function MonthCalendar({ appointments, selected, onSelect, onAddForDate, todayIso, lang = 'ru' }: Props) {
  const initial = { year: Number(selected.slice(0, 4)), month0: Number(selected.slice(5, 7)) - 1 };
  const [view, setView] = useState(initial);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const startYear = Number(todayIso.slice(0, 4));
  const startMonth0 = Number(todayIso.slice(5, 7)) - 1;
  // Past months are allowed (history); the forward limit is January 2027
  const canPrev = monthIndex(view.year, view.month0) > monthIndex(startYear, startMonth0) - 12;
  const canNext = monthIndex(view.year, view.month0) < monthIndex(CALENDAR_LAST_MONTH.year, CALENDAR_LAST_MONTH.month0);

  const cells = useMemo(() => monthGrid(view.year, view.month0), [view]);

  // Visit counts per day for the month (cancelled visits are not counted)
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) {
      if (a.status === 'cancelled') continue;
      const iso = formatTashkentISODate(a.dateTime);
      map.set(iso, (map.get(iso) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  const dayVisits = useMemo(
    () =>
      appointments
        .filter((a) => formatTashkentISODate(a.dateTime) === selected)
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [appointments, selected]
  );

  const shift = (delta: number) => {
    const total = monthIndex(view.year, view.month0) + delta;
    setDirection(delta > 0 ? 'next' : 'prev');
    setView({ year: Math.floor(total / 12), month0: total % 12 });
  };

  const goToday = () => {
    setDirection(monthIndex(startYear, startMonth0) >= monthIndex(view.year, view.month0) ? 'next' : 'prev');
    setView({ year: startYear, month0: startMonth0 });
    onSelect(todayIso);
  };

  const monthVisits = cells.filter(Boolean).reduce((sum, iso) => sum + (counts.get(iso as string) ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Предыдущий месяц"
          disabled={!canPrev}
          onClick={() => shift(-1)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center min-w-0">
          <div key={`${view.year}-${view.month0}`} className={`font-bold text-[16px] text-slate-900 ${direction === 'next' ? 'cal-title-next' : 'cal-title-prev'}`}>
            {formatMonthTitle(view.year, view.month0, lang)}
          </div>
          <div className="text-[11px] text-slate-500">Записей в месяце: {monthVisits}</div>
        </div>
        <button
          type="button"
          aria-label="Следующий месяц"
          disabled={!canNext}
          onClick={() => shift(1)}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-30 active:scale-90 transition-transform"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-center">
        <button type="button" onClick={goToday} className="text-[12px] font-bold text-[var(--accent)] px-3 py-1.5 rounded-full bg-[var(--accent-subtle)] active:scale-95 transition-transform">
          Сегодня
        </button>
      </div>

      {/* Grid */}
      <div className="clinic-card rounded-3xl p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`text-center text-[10px] font-bold uppercase tracking-wide ${i >= 5 ? 'text-rose-400' : 'text-slate-500'}`}>
              {d}
            </div>
          ))}
        </div>
        <div key={`${view.year}-${view.month0}-grid`} className={`grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 ${direction === 'next' ? 'cal-enter-next' : 'cal-enter-prev'}`}>
          {cells.map((iso, index) => {
            if (!iso) return <span key={`e-${index}`} aria-hidden="true" />;
            const count = counts.get(iso) ?? 0;
            const isSelected = iso === selected;
            const isToday = iso === todayIso;
            const day = Number(iso.slice(8, 10));
            const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3;
            const tint = ['bg-white', 'bg-blue-50', 'bg-blue-100', 'bg-blue-200'][level];
            return (
              <button
                key={iso}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${iso}, записей: ${count}`}
                onClick={() => onSelect(iso)}
                className={`relative aspect-square w-full min-w-0 rounded-2xl flex flex-col items-center justify-center text-[13px] font-semibold transition-[transform,background-color,color,box-shadow] duration-200 active:scale-90 ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-md shadow-blue-600/30 cal-day-selected'
                    : `${tint} text-slate-800 border border-slate-200/70`
                }`}
              >
                <span>{day}</span>
                {count > 0 && (
                  <span className={`text-[9px] font-bold leading-none mt-0.5 ${isSelected ? 'text-white/85' : 'text-slate-500'}`}>{count}</span>
                )}
                {isToday && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent)]" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[13px] font-bold text-slate-800">{formatDayLong(selected, lang)}</div>
          <button
            type="button"
            onClick={() => onAddForDate(selected)}
            className="min-h-[40px] px-3 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" /> Запись
          </button>
        </div>
        {dayVisits.length === 0 ? (
          <div className="clinic-card rounded-2xl p-5 text-center text-[13px] text-slate-500">На этот день записей нет.</div>
        ) : (
          <div className="clinic-card rounded-2xl overflow-hidden divide-y divide-slate-100">
            {dayVisits.map((app) => (
              <div key={app.id} className="px-4 py-3 flex items-center gap-3 sheet-reveal">
                <span className="font-mono font-bold text-[13px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">{formatTashkentTime(app.dateTime)}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[13px] text-slate-900 truncate">{app.patientName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{app.serviceTitle} · {app.doctorName}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${STATUS_LABELS[app.status as AppointmentStatus]?.badgeColor ?? ''}`}>
                  {STATUS_LABELS[app.status as AppointmentStatus]?.ru ?? app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

