'use client';

import React from 'react';
import { Phone, Sparkles } from 'lucide-react';
import { CLINIC_CONFIG, Language, UI_TRANSLATIONS } from '../data/clinicData';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLanguageChange, triggerHaptic }) => {
  const t = UI_TRANSLATIONS;
  const config = CLINIC_CONFIG;

  const handleLangClick = (newLang: Language) => {
    if (newLang !== lang) {
      triggerHaptic('light');
      onLanguageChange(newLang);
    }
  };

  return (
    <header className="fixed top-2.5 sm:top-3 left-3 right-3 max-w-md mx-auto z-40 pointer-events-none pt-safe transition-all duration-300">
      <div className="frosted-glass-pill backdrop-blur-2xl backdrop-saturate-150 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full flex items-center justify-between gap-2 shadow-2xl pointer-events-auto border border-white/95">
        {/* Brand & Clinic Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo Badge */}
          <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm tracking-tight shrink-0 select-none">
            DL
          </div>

          {/* Name & Open Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-[14px] sm:text-[15px] tracking-tight text-[var(--ink)] shrink-0 whitespace-nowrap">
                {config.name[lang]}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] border border-blue-200/60 px-1.5 py-0.5 rounded-full shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-[var(--accent)]" />
                {config.city[lang]}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-[var(--ink-muted)] mt-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-emerald-700 font-semibold shrink-0">{t.header.statusOpen[lang]}</span>
              <span className="text-slate-300 hidden min-[400px]:inline">·</span>
              <span className="truncate hidden min-[400px]:inline">{config.hours.weekdays}</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Direct Phone Call & Language Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Direct Phone Call Button */}
          <a
            href={`tel:${config.phone}`}
            onClick={() => triggerHaptic('medium')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50/90 hover:bg-blue-100 active:scale-95 border border-blue-200/70 flex items-center justify-center text-[var(--accent)] transition-all touch-target shadow-xs"
            title={t.header.callButtonAria[lang]}
            aria-label={t.header.callButtonAria[lang]}
          >
            <Phone className="w-3.5 h-3.5 fill-current opacity-90" />
          </a>

          {/* Segmented Language Selector Capsule */}
          <div className="flex items-center p-0.5 bg-slate-100/80 backdrop-blur-md border border-slate-200/70 rounded-full text-[11px] sm:text-[12px] font-bold shadow-xs">
            {(['ru', 'uz', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLangClick(l)}
                className={`px-2 py-0.5 rounded-full transition-all select-none ${
                  lang === l
                    ? 'bg-[var(--accent)] text-white shadow-xs font-extrabold'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                {l === 'ru' ? 'РУ' : l === 'uz' ? 'O‘Z' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
