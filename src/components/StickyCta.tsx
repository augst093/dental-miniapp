'use client';

import React from 'react';
import { Calendar, Sparkles, ArrowRight, X } from 'lucide-react';
import { Language, UI_TRANSLATIONS } from '../data/clinicData';

interface StickyCtaProps {
  lang: Language;
  onOpenBooking: () => void;
  onDismiss: () => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const StickyCta: React.FC<StickyCtaProps> = ({
  lang,
  onOpenBooking,
  onDismiss,
  triggerHaptic,
}) => {
  const t = UI_TRANSLATIONS.stickyCta;

  const handleClick = () => {
    triggerHaptic('medium');
    onOpenBooking();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    onDismiss();
  };

  return (
    <div className="fixed bottom-[78px] sm:bottom-[82px] left-3 right-3 max-w-md mx-auto z-30 pointer-events-none pb-safe">
      <div className="pointer-events-auto">
        <div className="frosted-glass-pill backdrop-blur-2xl backdrop-saturate-150 p-2 sm:p-2.5 pl-3 sm:pl-3.5 rounded-full flex items-center justify-between gap-2 shadow-2xl border border-white/95 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Text clickable area */}
          <div
            onClick={handleClick}
            className="min-w-0 flex-1 cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[12.5px] sm:text-[13.5px] text-[var(--ink)] leading-tight">
                {t.title[lang]}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] border border-blue-200/50 px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-[var(--accent)]" />
                {t.badge[lang]}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {t.sub[lang]}
            </p>
          </div>

          {/* Action button + Dismiss close X */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleClick}
              className="btn-pill-primary shrink-0 py-1.5 px-3 sm:px-3.5 text-[12px] sm:text-[12.5px] flex items-center gap-1 touch-target shadow-sm active:scale-95 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {lang === 'uz' ? 'Yozilish' : lang === 'en' ? 'Book' : 'Записаться'}
              </span>
              <ArrowRight className="w-3 h-3 hidden sm:inline" />
            </button>

            {/* Close cross button */}
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full bg-slate-200/60 hover:bg-slate-300/80 active:scale-90 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all touch-target"
              title={lang === 'uz' ? 'Yopish' : lang === 'en' ? 'Dismiss' : 'Скрыть'}
              aria-label={lang === 'uz' ? 'Yopish' : lang === 'en' ? 'Dismiss' : 'Скрыть'}
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
