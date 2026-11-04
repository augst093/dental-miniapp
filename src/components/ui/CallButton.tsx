'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Phone, X } from 'lucide-react';

// Telegram Mini Apps do not reliably open tel: links, so a plain link does nothing when tapped.
// This button shows the number in a sheet: the number itself, a call link, and a copy action.

type Lang = 'ru' | 'uz' | 'en';

const LABELS: Record<Lang, { call: string; copy: string; copied: string; close: string }> = {
  ru: { call: 'Позвонить', copy: 'Скопировать номер', copied: 'Номер скопирован', close: 'Закрыть' },
  uz: { call: 'Qo‘ng‘iroq qilish', copy: 'Raqamni nusxalash', copied: 'Raqam nusxalandi', close: 'Yopish' },
  en: { call: 'Call', copy: 'Copy number', copied: 'Number copied', close: 'Close' },
};

interface CallButtonProps {
  // Number to dial, e.g. +998712000000 (anything except digits and + is removed)
  phone: string;
  // Number as people read it, e.g. +998 (71) 200-00-00
  display: string;
  lang?: Lang;
  title?: string;
  className?: string;
  triggerHaptic?: (style?: 'light' | 'medium' | 'heavy') => void;
  children: React.ReactNode;
}

export const CallButton: React.FC<CallButtonProps> = ({
  phone,
  display,
  lang = 'ru',
  title,
  className,
  triggerHaptic,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const labels = LABELS[lang];
  const dialNumber = phone.replace(/[^\d+]/g, '');

  // Escape closes the sheet and the page behind does not scroll while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(dialNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the number is still on screen to read out
    }
  };

  const sheet = (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 sheet-enter">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[16px] text-[var(--ink)]">{title}</h3>
          <button
            onClick={() => setOpen(false)}
            aria-label={labels.close}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-1">
          <div className="text-[24px] font-extrabold tracking-tight text-[var(--ink)] tabular-nums">{display}</div>
        </div>

        <a
          href={`tel:${dialNumber}`}
          onClick={(event) => {
            // Inside Telegram, tel: is ignored: open the call page in Safari, where dialing works
            const webApp = window.Telegram?.WebApp;
            if (webApp?.openLink) {
              event.preventDefault();
              webApp.openLink(`${window.location.origin}/call?n=${encodeURIComponent(dialNumber)}`);
            }
          }}
          className="btn-pill-primary w-full py-3 flex items-center justify-center gap-2 text-[14px] active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4" />
          <span>{labels.call}</span>
        </a>

        <button
          onClick={copyNumber}
          className="btn-pill-secondary w-full py-3 flex items-center justify-center gap-2 text-[14px] active:scale-95 transition-transform"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? labels.copied : labels.copy}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          triggerHaptic?.('medium');
          setOpen(true);
        }}
        className={className}
        title={title}
        aria-label={title}
      >
        {children}
      </button>
      {open && typeof document !== 'undefined' && createPortal(sheet, document.body)}
    </>
  );
};
