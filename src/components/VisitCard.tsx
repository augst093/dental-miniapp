'use client';

import React, { useEffect, useState } from 'react';
import { CalendarCheck, CalendarClock, CalendarPlus, MapPin, X } from 'lucide-react';
import { CLINIC_CONFIG, Language } from '../data/clinicData';
import { buildCalendarUrl, openExternal } from '../lib/openExternal';
import { IconBadge } from './ui/IconBadge';
import { PatientVisit, loadVisit, saveVisit } from '../lib/patientVisit';

// The patient's next visit on the home screen. Each action updates the card on this device
// and opens the assistant chat with a ready message, so the clinic hears about it.

const COPY: Record<
  Language,
  {
    title: string;
    confirm: string;
    reschedule: string;
    cancel: string;
    dismiss: string;
    calendar: string;
    route: string;
    bring: string;
    confirmed: string;
    cancelled: string;
    askConfirm: (date: string, time: string) => string;
    askReschedule: (date: string, time: string) => string;
    askCancel: (date: string, time: string) => string;
  }
> = {
  ru: {
    title: 'Ваш визит',
    confirm: 'Подтвердить',
    reschedule: 'Перенести',
    cancel: 'Отменить',
    dismiss: 'Убрать',
    calendar: 'В календарь',
    route: 'Маршрут',
    bring: 'Возьмите паспорт и приходите за 10 минут.',
    confirmed: 'Визит подтверждён',
    cancelled: 'Визит отменён',
    askConfirm: (d, t) => `Подтверждаю визит ${d} в ${t}.`,
    askReschedule: (d, t) => `Хочу перенести визит ${d} в ${t} на другое время.`,
    askCancel: (d, t) => `Хочу отменить визит ${d} в ${t}.`,
  },
  uz: {
    title: 'Sizning qabulingiz',
    confirm: 'Tasdiqlash',
    reschedule: 'Ko‘chirish',
    cancel: 'Bekor qilish',
    dismiss: 'Yopish',
    calendar: 'Kalendarga',
    route: 'Yo‘l',
    bring: 'Pasportingizni oling va 10 daqiqa oldin keling.',
    confirmed: 'Qabul tasdiqlandi',
    cancelled: 'Qabul bekor qilindi',
    askConfirm: (d, t) => `${d} soat ${t} dagi qabulni tasdiqlayman.`,
    askReschedule: (d, t) => `${d} soat ${t} dagi qabulni boshqa vaqtga ko‘chirmoqchiman.`,
    askCancel: (d, t) => `${d} soat ${t} dagi qabulni bekor qilmoqchiman.`,
  },
  en: {
    title: 'Your visit',
    confirm: 'Confirm',
    reschedule: 'Reschedule',
    cancel: 'Cancel',
    dismiss: 'Dismiss',
    calendar: 'Add to calendar',
    route: 'Route',
    bring: 'Bring your passport and arrive 10 minutes early.',
    confirmed: 'Visit confirmed',
    cancelled: 'Visit cancelled',
    askConfirm: (d, t) => `I confirm my visit on ${d} at ${t}.`,
    askReschedule: (d, t) => `I would like to reschedule my visit on ${d} at ${t}.`,
    askCancel: (d, t) => `I would like to cancel my visit on ${d} at ${t}.`,
  },
};

function formatDate(dateStr: string, lang: Language): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long' });
}

interface VisitCardProps {
  lang: Language;
  onAskChat: (text: string) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({ lang, onAskChat }) => {
  const copy = COPY[lang];
  const [visit, setVisit] = useState<PatientVisit | null>(null);

  // Read the saved booking after mount (localStorage is not available during render)
  useEffect(() => {
    setVisit(loadVisit());
  }, []);

  if (!visit) return null;

  const date = formatDate(visit.dateStr, lang);
  const update = (next: PatientVisit | null) => {
    saveVisit(next);
    setVisit(next);
  };

  const confirm = () => {
    update({ ...visit, status: 'confirmed' });
    onAskChat(copy.askConfirm(date, visit.timeStr));
  };

  const reschedule = () => {
    onAskChat(copy.askReschedule(date, visit.timeStr));
  };

  const cancel = () => {
    update({ ...visit, status: 'cancelled' });
    onAskChat(copy.askCancel(date, visit.timeStr));
  };

  if (visit.status === 'cancelled') {
    return (
      <div className="clinic-card p-4 rounded-3xl flex items-center justify-between gap-3 chat-bubble-in">
        <span className="text-[13px] font-semibold text-[var(--ink-muted)]">{copy.cancelled}</span>
        <button
          onClick={() => update(null)}
          aria-label={copy.dismiss}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const confirmed = visit.status === 'confirmed';

  return (
    <div key={visit.status} className="clinic-card p-4 sm:p-5 rounded-3xl space-y-3 chat-bubble-in">
      <div className="flex items-start gap-3">
        <IconBadge tone={confirmed ? 'success' : 'accent'}>
          <CalendarCheck className="w-5 h-5" />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
            {confirmed ? copy.confirmed : copy.title}
          </div>
          <div className="font-bold text-[15px] text-[var(--ink)]">
            {date}, {visit.timeStr}
          </div>
          <div className="text-[12px] text-[var(--ink-secondary)] truncate">
            {visit.doctor} · {visit.service}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() =>
            openExternal(
              buildCalendarUrl({
                title: `DentaLux: ${visit.service}`,
                dateStr: visit.dateStr,
                timeStr: visit.timeStr,
                location: CLINIC_CONFIG.address[lang],
                details: `${visit.doctor}. ${copy.bring}`,
              })
            )
          }
          className="py-2.5 rounded-full bg-white border border-slate-200 text-[var(--ink)] text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <CalendarPlus className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{copy.calendar}</span>
        </button>
        <button
          onClick={() => openExternal(CLINIC_CONFIG.yandexMapsUrl)}
          className="py-2.5 rounded-full bg-white border border-slate-200 text-[var(--ink)] text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>{copy.route}</span>
        </button>
      </div>

      {!confirmed && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={confirm}
            className="py-2.5 rounded-full bg-[var(--accent)] text-white text-[12px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>{copy.confirm}</span>
          </button>
          <button
            onClick={reschedule}
            className="py-2.5 rounded-full bg-white border border-slate-200 text-[var(--accent)] text-[12px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>{copy.reschedule}</span>
          </button>
          <button
            onClick={cancel}
            className="py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[12px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <X className="w-3.5 h-3.5" />
            <span>{copy.cancel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
