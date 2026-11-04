'use client';

import React from 'react';
import { Phone, Clock, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-30 header-bar px-4 py-2.5 pt-safe transition-all duration-200">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            DL
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[15px] tracking-tight text-[var(--ink)] shrink-0">
                {config.name[lang]}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-blue-200/50 px-2 py-0.5 rounded-full shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-[var(--accent)]" />
                {config.city[lang]}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[var(--ink-muted)] truncate">
              <Clock className="w-3 h-3 shrink-0 text-emerald-600" />
              <span>{config.hours.weekdays}</span>
              <span className="text-[var(--border)]">·</span>
              <span className="text-emerald-700 font-medium">{t.header.statusOpen[lang]}</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Direct Call & Language Selector */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Direct Phone Call Pill */}
          <a
            href={`tel:${config.phone}`}
            onClick={() => triggerHaptic('medium')}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-blue-50 active:scale-95 border border-slate-200/80 flex items-center justify-center text-[var(--accent)] transition-all touch-target shadow-xs"
            title={t.header.callButtonAria[lang]}
            aria-label={t.header.callButtonAria[lang]}
          >
            <Phone className="w-3.5 h-3.5 fill-current opacity-90" />
          </a>

          {/* Language Selector Pill */}
          <div className="flex items-center p-0.5 bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-full text-[12px] font-semibold shadow-xs">
            {(['ru', 'uz', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => handleLangClick(l)}
                className={`px-2 py-0.5 rounded-full transition-all ${
                  lang === l
                    ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
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
