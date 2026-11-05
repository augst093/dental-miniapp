'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Language } from '../../data/clinicData';
import {
  BOOKING_COPY,
  BOOKING_HORIZON_DAYS,
  addDaysIso,
  formatMonthTitle,
  formatWeekday,
  isWorkingDay,
  monthGrid,
  todayIso,
} from '../../lib/bookingDates';

interface CalendarPickerProps {
  value: string | null;
  onChange: (iso: string) => void;
  lang: Language;
  triggerHaptic?: (kind: 'light' | 'medium' | 'heavy') => void;
}

function parseYearMonth(iso: string): { year: number; month0: number } {
  const [y, m] = iso.split('-').map(Number);
  return { year: y, month0: m - 1 };
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ value, onChange, lang, triggerHaptic }) => {
  const copy = BOOKING_COPY[lang];
  const today = todayIso();
  const lastDay = addDaysIso(today, BOOKING_HORIZON_DAYS);

  // Show the month of the chosen day, or the current month
  const start = parseYearMonth(value ?? today);
  const [view, setView] = useState<{ year: number; month0: number }>(start);
  // Which way the month slid, so the grid enters from the matching side
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const cells = useMemo(() => monthGrid(view.year, view.month0), [view]);
  const weekdayLabels = useMemo(() => {
    // Monday-first header built from a known week (2 Nov 2026 is a Monday)
    return Array.from({ length: 7 }, (_, i) => formatWeekday(addDaysIso('2026-11-02', i), lang, 'short'));
  }, [lang]);

  const firstMonth = parseYearMonth(today);
  const lastMonth = parseYearMonth(lastDay);
  const canGoPrev = view.year * 12 + view.month0 > firstMonth.year * 12 + firstMonth.month0;
  const canGoNext = view.year * 12 + view.month0 < lastMonth.year * 12 + lastMonth.month0;

  const shift = (delta: number) => {
    const total = view.year * 12 + view.month0 + delta;
    setDirection(delta > 0 ? 'next' : 'prev');
    setView({ year: Math.floor(total / 12), month0: total % 12 });
    triggerHaptic?.('light');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={copy.prev}
          disabled={!canGoPrev}
          onClick={() => shift(-1)}
          className="w-9 h-9 rounded-full bg-white/90 border border-slate-200/80 flex items-center justify-center text-[var(--ink)] transition-[transform,opacity] duration-200 active:scale-90 disabled:opacity-30 disabled:active:scale-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="relative flex-1 h-7 overflow-hidden">
          <div
            key={`${view.year}-${view.month0}`}
            className={`absolute inset-0 flex items-center justify-center font-bold text-[15px] text-[var(--ink)] ${
              direction === 'next' ? 'cal-title-next' : 'cal-title-prev'
            }`}
          >
            {formatMonthTitle(view.year, view.month0, lang)}
          </div>
        </div>

        <button
          type="button"
          aria-label={copy.next}
          disabled={!canGoNext}
          onClick={() => shift(1)}
          className="w-9 h-9 rounded-full bg-white/90 border border-slate-200/80 flex items-center justify-center text-[var(--ink)] transition-[transform,opacity] duration-200 active:scale-90 disabled:opacity-30 disabled:active:scale-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 px-0.5">
        {weekdayLabels.map((label, index) => (
          <div
            key={index}
            className={`text-center text-[11px] font-semibold uppercase tracking-wide ${
              index === 6 ? 'text-rose-400' : 'text-[var(--ink-muted)]'
            }`}
          >
            {label.slice(0, 2)}
          </div>
        ))}
      </div>

      <div
        key={`${view.year}-${view.month0}-grid`}
        className={`grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 ${direction === 'next' ? 'cal-enter-next' : 'cal-enter-prev'}`}
      >
        {cells.map((iso, index) => {
          if (!iso) return <span key={`empty-${index}`} aria-hidden="true" />;

          const isPast = iso < today;
          const isTooFar = iso > lastDay;
          const closed = !isWorkingDay(iso);
          const disabled = isPast || isTooFar || closed;
          const isSelected = value === iso;
          const isToday = iso === today;
          const day = Number(iso.slice(8, 10));

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={iso}
              onClick={() => {
                triggerHaptic?.('medium');
                onChange(iso);
              }}
              className={`relative aspect-square w-full min-w-0 rounded-2xl flex flex-col items-center justify-center text-[14px] font-semibold transition-[transform,background-color,color,box-shadow] duration-200 active:scale-90 ${
                isSelected
                  ? 'bg-[var(--accent)] text-white shadow-md shadow-blue-600/30 cal-day-selected'
                  : disabled
                  ? 'text-slate-300 cursor-default'
                  : 'bg-white/90 border border-slate-200/70 text-[var(--ink)] hover:border-[var(--accent)]/40'
              }`}
            >
              <span className={closed && !isSelected ? 'line-through decoration-slate-300' : ''}>{day}</span>
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}
              {closed && !isPast && (
                <span className="absolute bottom-1 text-[8px] font-bold uppercase tracking-tight text-rose-300">
                  {lang === 'en' ? 'off' : lang === 'uz' ? 'dam' : 'вых'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!value && <p className="text-center text-[12px] text-[var(--ink-muted)]">{copy.pickDate}</p>}
    </div>
  );
};
