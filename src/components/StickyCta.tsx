'use client';

import React from 'react';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { Language, UI_TRANSLATIONS } from '../data/clinicData';

interface StickyCtaProps {
  lang: Language;
  onOpenBooking: () => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const StickyCta: React.FC<StickyCtaProps> = ({
  lang,
  onOpenBooking,
  triggerHaptic,
}) => {
  const t = UI_TRANSLATIONS.stickyCta;

  const handleClick = () => {
    triggerHaptic('medium');
    onOpenBooking();
  };

  return (
    <div className="fixed bottom-[65px] left-0 right-0 z-20 px-3 pointer-events-none pb-safe">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-white/85 backdrop-blur-xl border border-white/90 p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[13px] sm:text-[14px] text-[var(--ink)] leading-tight">
                {t.title[lang]}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] border border-blue-200/50 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-[var(--accent)]" />
                {t.badge[lang]}
              </span>
            </div>
            <p className="text-[11px] sm:text-[12px] text-[var(--ink-muted)] truncate mt-0.5">
              {t.sub[lang]}
            </p>
          </div>

          <button
            onClick={handleClick}
            className="btn-pill-primary shrink-0 py-2.5 px-4 text-[13px] flex items-center gap-1.5 touch-target"
          >
            <Calendar className="w-4 h-4" />
            <span>
              {lang === 'uz' ? 'Yozilish' : lang === 'en' ? 'Book Now' : 'Записаться'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </button>
        </div>
      </div>
    </div>
  );
};
