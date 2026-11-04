'use client';

import React from 'react';
import { Calendar, Award } from 'lucide-react';
import { DOCTORS, Language, UI_TRANSLATIONS } from '../../data/clinicData';

interface DoctorsTabProps {
  lang: Language;
  onOpenBooking: (serviceTitle?: string, doctorTitle?: string) => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const DoctorsTab: React.FC<DoctorsTabProps> = ({
  lang,
  onOpenBooking,
  triggerHaptic,
}) => {
  const t = UI_TRANSLATIONS;

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-extrabold text-[var(--ink)]">
          {t.quickTiles.doctorsTitle[lang]}
        </h1>
        <p className="text-[12px] text-[var(--ink-muted)] mt-1">
          {lang === 'uz'
            ? '8 yildan 16 yilgacha amaliy tajribaga ega sertifikatlangan shifokorlar jamoasi'
            : lang === 'en'
            ? 'Certified medical specialists with 8 to 16 years of clinical practice'
            : 'Сертифицированная команда врачей со стажем от 8 до 16 лет'}
        </p>
      </div>

      <div className="space-y-3">
        {DOCTORS.map((doc) => (
          <div key={doc.id} className="clinic-card p-4 space-y-3">
            <div className="flex items-start gap-3">
              {/* Doctor Avatar */}
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] font-extrabold text-[15px] flex items-center justify-center shrink-0 shadow-xs">
                {doc.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-bold text-[15px] text-[var(--ink)] truncate">
                    {doc.name[lang]}
                  </h3>
                  <span className="text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full shrink-0">
                    {doc.experienceYears}{' '}
                    {lang === 'uz' ? 'yil tajriba' : lang === 'en' ? 'yrs exp' : 'лет стажа'}
                  </span>
                </div>

                <div className="text-[12px] font-semibold text-[var(--accent)] mt-0.5">
                  {doc.role[lang]}
                </div>
                <p className="text-[12px] text-[var(--ink-secondary)] mt-1 leading-snug">
                  {doc.specialization[lang]}
                </p>
              </div>
            </div>

            {/* Credentials / Education summary */}
            <div className="bg-[var(--surface-subtle)] border border-[var(--border-subtle)] p-2.5 rounded-xl text-[12px] text-[var(--ink-secondary)] flex items-start gap-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{doc.credentials[lang]}</span>
            </div>

            {/* Action */}
            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenBooking('Консультация профильного специалиста', doc.name[lang]);
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all touch-target"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {lang === 'uz'
                    ? `${doc.name[lang]} qabuliga yozilish`
                    : lang === 'en'
                    ? `Book with ${doc.name[lang]}`
                    : `Записаться к ${doc.name[lang]}`}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
