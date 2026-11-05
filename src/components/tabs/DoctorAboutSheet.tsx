'use client';

import React, { useEffect, useState } from 'react';
import { Award, Calendar, Check, GraduationCap, Languages, User, X } from 'lucide-react';
import { Doctor, Language } from '../../data/clinicData';

// "About the doctor": a bottom sheet with biography, education and specialisations.
// Opens from a doctor card; the booking button books this doctor directly.

function yearsWord(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;
  if (mod10 === 1 && mod100 !== 11) return 'год';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'года';
  return 'лет';
}

const COPY: Record<
  Language,
  {
    about: string;
    experience: (years: number) => string;
    education: string;
    specialisation: string;
    languages: string;
    credentials: string;
    book: string;
    close: string;
  }
> = {
  ru: {
    about: 'О враче',
    experience: (years) => `${years} ${yearsWord(years)} стажа`,
    education: 'Образование и курсы',
    specialisation: 'Направления работы',
    languages: 'Языки приёма',
    credentials: 'Сертификаты',
    book: 'Записаться к врачу',
    close: 'Закрыть',
  },
  uz: {
    about: 'Shifokor haqida',
    experience: (years) => `${years} yillik tajriba`,
    education: 'Ta’lim va kurslar',
    specialisation: 'Yo‘nalishlar',
    languages: 'Qabul tillari',
    credentials: 'Sertifikatlar',
    book: 'Shifokorga yozilish',
    close: 'Yopish',
  },
  en: {
    about: 'About the doctor',
    experience: (years) => `${years} years of experience`,
    education: 'Education and courses',
    specialisation: 'Areas of work',
    languages: 'Languages',
    credentials: 'Certificates',
    book: 'Book with this doctor',
    close: 'Close',
  },
};

interface DoctorAboutSheetProps {
  doctor: Doctor;
  lang: Language;
  onClose: () => void;
  onBook: (doctorName: string) => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const DoctorAboutSheet: React.FC<DoctorAboutSheetProps> = ({
  doctor,
  lang,
  onClose,
  onBook,
  triggerHaptic,
}) => {
  const copy = COPY[lang];
  const [closing, setClosing] = useState<boolean>(false);

  // Smooth exit: play the slide-down first, then unmount
  const close = (after?: () => void) => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => {
      onClose();
      after?.();
    }, 260);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const specialisations = doctor.specialization[lang]
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={copy.about}
    >
      <button
        type="button"
        aria-label={copy.close}
        onClick={() => close()}
        className={`absolute inset-0 bg-slate-950/55 ${closing ? 'about-backdrop-out' : 'about-backdrop-in'}`}
      />

      <div
        className={`relative w-full sm:max-w-lg max-h-[88dvh] overflow-y-auto bg-white/[0.98] rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-white/90 px-5 pt-3 pb-6 ${
          closing ? 'sheet-exit' : 'sheet-enter'
        }`}
      >
        <div className="mx-auto w-10 h-1.5 rounded-full bg-slate-300 mb-4" aria-hidden="true" />

        <button
          type="button"
          aria-label={copy.close}
          onClick={() => close()}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 sheet-reveal" style={delay(60)}>
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0 ring-4 ring-[var(--accent)]/10">
            {doctor.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doctor.photoUrl} alt={doctor.name[lang]} className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0 pr-10">
            <div className="type-section-title leading-tight">{doctor.name[lang]}</div>
            <div className="text-[13px] font-semibold text-[var(--accent)] mt-0.5">{doctor.role[lang]}</div>
            <div className="mt-1.5 inline-flex text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-full">
              {copy.experience(doctor.experienceYears)}
            </div>
          </div>
        </div>

        <section className="mt-5 sheet-reveal" style={delay(140)}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">{copy.about}</div>
          <p className="text-[14px] leading-relaxed text-[var(--ink-secondary)]">{doctor.bio[lang]}</p>
        </section>

        <section className="mt-5 sheet-reveal" style={delay(220)}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">
            {copy.specialisation}
          </div>
          <div className="flex flex-wrap gap-2">
            {specialisations.map((item, index) => (
              <span
                key={item}
                className="text-[12px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] px-3 py-1.5 rounded-full sheet-reveal"
                style={delay(260 + index * 50)}
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-5 sheet-reveal" style={delay(300)}>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{copy.education}</span>
          </div>
          <ul className="space-y-2">
            {doctor.education[lang].map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13px] text-[var(--ink)] sheet-reveal"
                style={delay(340 + index * 60)}
              >
                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 sheet-reveal" style={delay(420)}>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>{copy.credentials}</span>
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--ink-secondary)] bg-slate-50 border border-slate-200/70 rounded-2xl p-3">
            {doctor.credentials[lang]}
          </p>
        </section>

        <section className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-[var(--ink-secondary)] sheet-reveal" style={delay(480)}>
          <Languages className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-semibold text-[var(--ink)]">{copy.languages}:</span>
          <span>{doctor.languages[lang]}</span>
        </section>

        <div className="mt-6 sheet-reveal" style={delay(520)}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              close(() => onBook(doctor.name[lang]));
            }}
            className="btn-pill-primary w-full py-3.5 text-[14px] flex items-center justify-center gap-2 touch-target"
          >
            <Calendar className="w-4 h-4" />
            <span>{copy.book}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
