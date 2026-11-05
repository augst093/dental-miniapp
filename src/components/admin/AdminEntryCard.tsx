'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { Language } from '../../data/clinicData';
import { telegramAuthHeaders } from '../../lib/telegramClient';
import { formatTashkentISODate, getNowUTC } from '../../lib/timezone';
import { IconBadge } from '../ui/IconBadge';

// Shown on the home screen only to verified clinic admins (Telegram ID in ADMIN_ID).
// Gives a live summary of today and one clear way into the admin panel.

const COPY: Record<Language, {
  title: string;
  open: string;
  today: (n: number) => string;
  pending: (n: number) => string;
  loading: string;
}> = {
  ru: {
    title: 'Панель администратора',
    open: 'Открыть панель',
    today: (n) => `Сегодня: ${n} ${plural(n, ['запись', 'записи', 'записей'])}`,
    pending: (n) => `${n} ждут подтверждения`,
    loading: 'Загружаем расписание…',
  },
  uz: {
    title: 'Administrator paneli',
    open: 'Panelni ochish',
    today: (n) => `Bugun: ${n} ta yozuv`,
    pending: (n) => `${n} ta tasdiqlash kutmoqda`,
    loading: 'Jadval yuklanmoqda…',
  },
  en: {
    title: 'Admin panel',
    open: 'Open panel',
    today: (n) => `Today: ${n} ${n === 1 ? 'booking' : 'bookings'}`,
    pending: (n) => `${n} waiting for confirmation`,
    loading: 'Loading schedule…',
  },
};

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

interface AdminEntryCardProps {
  lang: Language;
  onOpen: () => void;
}

export const AdminEntryCard: React.FC<AdminEntryCardProps> = ({ lang, onOpen }) => {
  const copy = COPY[lang];
  const [loading, setLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<{ dateTime: string; status: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/appointments', { headers: telegramAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.success) setAppointments(data.appointments || []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const todayIso = formatTashkentISODate(getNowUTC());
    const today = appointments.filter(
      (a) => formatTashkentISODate(a.dateTime) === todayIso && a.status !== 'cancelled'
    );
    const pending = today.filter((a) => a.status === 'pending').length;
    return { total: today.length, pending };
  }, [appointments]);

  return (
    <div className="clinic-card p-4 rounded-3xl space-y-3.5 success-rise border-[var(--accent)]/20">
      <div className="flex items-center gap-3">
        <IconBadge tone="accent">
          <ShieldCheck className="w-5 h-5" />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">{copy.title}</div>
          {loading ? (
            <div className="chat-skeleton h-3.5 w-44 rounded-full mt-1.5" aria-label={copy.loading} />
          ) : (
            <div className="text-[13px] text-[var(--ink-secondary)] truncate">
              {`${copy.today(summary.total)}${summary.pending ? ` · ${copy.pending(summary.pending)}` : ''}`}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="w-full py-3 rounded-full bg-[var(--accent)] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-transform duration-200"
      >
        <span>{copy.open}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
