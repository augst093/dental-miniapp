'use client';

import React from 'react';
import { Calendar, Award, User } from 'lucide-react';
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
    <div className="space-y-4 pb-36 sm:pb-40">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
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
          <div key={doc.id} className="clinic-card p-4 sm:p-5 space-y-3.5 rounded-3xl">
            <div className="flex items-start gap-3">
              {/* Doctor Avatar */}
              <div className="w-12 h-12 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0 shadow-sm">
                <User className="w-6 h-6" strokeWidth={1.75} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="font-bold text-[15px] text-[var(--ink)] truncate">
                    {doc.name[lang]}
                  </h3>
                  <span className="text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-full shrink-0">
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
            <div className="bg-slate-100/80 border border-slate-200/60 p-3 rounded-2xl text-[12px] text-[var(--ink-secondary)] flex items-start gap-2">
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
                className="btn-pill-primary w-full sm:w-auto py-3 px-6 text-[13px] flex items-center justify-center gap-2 touch-target"
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
