'use client';

import React, { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';

// Opened in the external browser from the Telegram Mini App (WebApp.openLink), because
// Telegram's own webview does not open tel: links. In Safari a tel: link starts the call.
export default function CallPage() {
  const [number, setNumber] = useState<string | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('n') ?? '';
    const digits = raw.replace(/[^\d+]/g, '');
    setNumber(digits.length >= 7 ? digits : '');
  }, []);

  if (number === null) return null;

  if (number === '') {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-6 text-center text-[var(--ink)]">
        <p className="text-[15px]">Номер не указан. Вернитесь в приложение и попробуйте ещё раз.</p>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-6 text-center bg-white text-[var(--ink)]">
      <div className="text-[13px] text-[var(--ink-muted)]">DentaLux · звонок в клинику</div>
      <div className="text-[26px] font-extrabold tracking-tight tabular-nums">{number}</div>
      <a
        href={`tel:${number}`}
        className="w-full max-w-xs py-4 rounded-full bg-[var(--accent)] text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
      >
        <Phone className="w-5 h-5" />
        <span>Позвонить</span>
      </a>
    </main>
  );
}
