'use client';

import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CLINIC_CONFIG, Language, UI_TRANSLATIONS } from '../../data/clinicData';

interface ContactsTabProps {
  lang: Language;
  onOpenBooking: () => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  lang,
  onOpenBooking,
  triggerHaptic,
}) => {
  const config = CLINIC_CONFIG;
  const t = UI_TRANSLATIONS;

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[var(--ink)]">
          {t.quickTiles.contactsTitle[lang]}
        </h1>
        <p className="text-[12px] text-[var(--ink-muted)] mt-1">
          {lang === 'uz'
            ? 'Klinika manzili, qabul vaqti va aloqa yo‘llari'
            : lang === 'en'
            ? 'Clinic address, working hours and contact methods'
            : 'Точный адрес клиники, часы приёма и прямая связь'}
        </p>
      </div>

      {/* Address & Navigation Card */}
      <div className="clinic-card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-[var(--ink)]">
              {config.address[lang]}
            </h3>
            <p className="text-[12px] text-[var(--accent)] font-medium mt-0.5">
              {config.landmark[lang]}
            </p>
          </div>
        </div>

        {/* Map Links (Yandex & 2GIS) */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={config.yandexMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('light')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--border)] border border-[var(--border)] text-[12px] font-semibold text-[var(--ink)] transition-all touch-target"
          >
            <span>Яндекс Карты</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
          </a>

          <a
            href={config.twoGisUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('light')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--border)] border border-[var(--border)] text-[12px] font-semibold text-[var(--ink)] transition-all touch-target"
          >
            <span>2GIS</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
          </a>
        </div>
      </div>

      {/* Working Hours Card */}
      <div className="clinic-card p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-[14px] text-[var(--ink)]">
            {lang === 'uz' ? 'Ish jadvali' : lang === 'en' ? 'Working Hours' : 'Режим работы'}
          </h3>
        </div>

        <div className="space-y-2 text-[13px] border-t border-[var(--border-subtle)] pt-2">
          <div className="flex justify-between items-center">
            <span className="text-[var(--ink-secondary)]">
              {lang === 'uz' ? 'Dushanba — Juma:' : lang === 'en' ? 'Monday — Friday:' : 'Понедельник — Пятница:'}
            </span>
            <span className="font-bold text-[var(--ink)]">{config.hours.weekdays}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--ink-secondary)]">
              {lang === 'uz' ? 'Shanba:' : lang === 'en' ? 'Saturday:' : 'Суббота:'}
            </span>
            <span className="font-bold text-[var(--ink)]">{config.hours.saturday}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--ink-secondary)]">
              {lang === 'uz' ? 'Yakshanba:' : lang === 'en' ? 'Sunday:' : 'Воскресенье:'}
            </span>
            <span className="font-bold text-[var(--ink)]">{config.hours.sunday}</span>
          </div>
        </div>
      </div>

      {/* Direct Contact Channels */}
      <div className="space-y-2">
        <a
          href={`tel:${config.phone}`}
          onClick={() => triggerHaptic('medium')}
          className="clinic-card-interactive p-4 flex items-center justify-between touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {lang === 'uz' ? 'Telefon orqali qo‘ng‘iroq' : lang === 'en' ? 'Direct phone call' : 'Прямой звонок'}
              </div>
              <div className="font-bold text-[15px] text-[var(--ink)]">
                {config.phoneDisplay}
              </div>
            </div>
          </div>
          <span className="text-[12px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded-lg">
            {lang === 'uz' ? 'Qo‘ng‘iroq' : lang === 'en' ? 'Call' : 'Позвонить'}
          </span>
        </a>

        {/* Telegram Direct Chat (Crucial for Uzbekistan) */}
        <a
          href={config.telegramAdminUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => triggerHaptic('medium')}
          className="clinic-card-interactive p-4 flex items-center justify-between touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 text-[#0088cc] flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {lang === 'uz' ? 'Telegram ma’muri' : lang === 'en' ? 'Telegram Admin' : 'Администратор в Telegram'}
              </div>
              <div className="font-bold text-[15px] text-[var(--ink)]">
                @dentalux_admin
              </div>
            </div>
          </div>
          <span className="text-[12px] font-bold text-[#0088cc] bg-[#229ED9]/10 px-2.5 py-1 rounded-lg">
            {lang === 'uz' ? 'Yozish' : lang === 'en' ? 'Chat' : 'Написать'}
          </span>
        </a>
      </div>

      {/* Official License & Accreditation */}
      <div className="clinic-card p-4 space-y-2 text-[12px] text-[var(--ink-secondary)]">
        <div className="flex items-center gap-2 text-[var(--ink)] font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{config.licenseNumber}</span>
        </div>
        <p className="text-[11px] text-[var(--ink-muted)]">
          {lang === 'uz'
            ? 'Toshkent shahar Sog‘liqni saqlash boshqarmasi tomonidan berilgan rasmiy tibbiy faoliyat litsenziyasi.'
            : lang === 'en'
            ? 'Official medical dentistry license issued by the Ministry of Health of the Republic of Uzbekistan.'
            : 'Лицензия на осуществление медицинской стоматологической деятельности выдана Министерством здравоохранения РУз.'}
        </p>

        {/* Partner Brands */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[var(--ink-muted)]">Сертификация:</span>
          {config.partnerBrands.map((b) => (
            <span
              key={b}
              className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Direct Booking CTA */}
      <button
        onClick={() => {
          triggerHaptic('medium');
          onOpenBooking();
        }}
        className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all touch-target"
      >
        <span>{t.hero.ctaBooking[lang]}</span>
      </button>
    </div>
  );
};
