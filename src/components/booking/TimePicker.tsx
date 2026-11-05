'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarX2, RotateCcw } from 'lucide-react';
import type { Language } from '../../data/clinicData';
import { BOOKING_COPY } from '../../lib/bookingDates';

interface SlotDto {
  time: string;
  available: boolean;
  reason?: 'booked' | 'past' | 'too_soon' | 'day_off';
}

interface TimePickerProps {
  dateIso: string;
  doctorId?: string;
  value: string | null;
  onChange: (time: string) => void;
  lang: Language;
  triggerHaptic?: (kind: 'light' | 'medium' | 'heavy') => void;
}

type Status = 'loading' | 'ready' | 'error';

function groupOf(time: string): 'morning' | 'afternoon' | 'evening' {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return 'morning';
  if (hour < 16) return 'afternoon';
  return 'evening';
}

export const TimePicker: React.FC<TimePickerProps> = ({ dateIso, doctorId, value, onChange, lang, triggerHaptic }) => {
  const copy = BOOKING_COPY[lang];
  const [status, setStatus] = useState<Status>('loading');
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [attempt, setAttempt] = useState(0);

  // Load live availability for this day and doctor. Abort stale requests when the user switches days fast.
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    const query = new URLSearchParams({ date: dateIso });
    if (doctorId) query.set('doctorId', doctorId);

    fetch(`/api/slots?${query.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.success) throw new Error(data?.error || 'slots');
        setSlots(data.slots as SlotDto[]);
        setStatus('ready');
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [dateIso, doctorId, attempt]);

  const groups = useMemo(() => {
    const result: Record<'morning' | 'afternoon' | 'evening', SlotDto[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    slots.forEach((slot) => result[groupOf(slot.time)].push(slot));
    return result;
  }, [slots]);

  const anyFree = slots.some((slot) => slot.available);

  if (status === 'loading') {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="chat-skeleton h-4 w-32 rounded-full" />
        <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="chat-skeleton h-10 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="clinic-card p-4 rounded-2xl flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-[var(--ink-secondary)]">{copy.loadError}</span>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="px-3 py-1.5 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold flex items-center gap-1 active:scale-95 transition-transform"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {copy.retry}
        </button>
      </div>
    );
  }

  if (!anyFree) {
    return (
      <div className="clinic-card p-5 rounded-2xl text-center space-y-2 chat-bubble-in">
        <CalendarX2 className="w-7 h-7 mx-auto text-[var(--ink-muted)]" />
        <div className="text-[14px] font-bold text-[var(--ink)]">{copy.noTimes}</div>
        <div className="text-[12px] text-[var(--ink-secondary)]">{copy.noTimesHint}</div>
      </div>
    );
  }

  let stagger = 0;
  const sections: { key: 'morning' | 'afternoon' | 'evening'; label: string }[] = [
    { key: 'morning', label: copy.morning },
    { key: 'afternoon', label: copy.afternoon },
    { key: 'evening', label: copy.evening },
  ];

  return (
    <div className="space-y-4">
      <div className="relative space-y-4">

        {sections.map((section) => {
          const items = groups[section.key];
          if (items.length === 0) return null;
          return (
            <div key={section.key} className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">{section.label}</div>
              <div className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-2">
                {items.map((slot) => {
                  const isSelected = value === slot.time;
                  const delay = Math.min(stagger++ * 22, 360);
                  const unavailable = !slot.available;
                  const label =
                    slot.reason === 'booked' ? copy.busy : slot.reason === 'too_soon' ? copy.tooSoon : slot.reason === 'past' ? copy.past : '';
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={unavailable}
                      aria-pressed={isSelected}
                      title={label || undefined}
                      onClick={() => {
                        triggerHaptic?.('light');
                        onChange(slot.time);
                      }}
                      style={{
                        animationDelay: `${delay}ms`,
                        ...(isSelected ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : {}),
                      }}
                      className={`relative py-2.5 rounded-full border text-[13px] font-semibold tabular-nums transition-[transform,color,border-color,background-color,box-shadow] duration-300 active:scale-90 ${
                        isSelected
                          ? 'text-white shadow-md shadow-blue-600/30 cal-day-selected'
                          : unavailable
                          ? 'border-transparent bg-slate-100/70 text-slate-400 line-through decoration-slate-300 cursor-not-allowed cal-chip-enter'
                          : 'bg-white/90 border-slate-200/80 text-[var(--ink)] hover:border-[var(--accent)]/40 cal-chip-enter'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!value && <p className="text-center text-[12px] text-[var(--ink-muted)]">{copy.pickTime}</p>}
    </div>
  );
};
