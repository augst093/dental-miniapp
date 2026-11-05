'use client';

import React, { useEffect, useState } from 'react';
import { BellRing, CalendarCheck, MessageCircle } from 'lucide-react';
import { Language } from '../data/clinicData';

// Three short screens on the first open. Shown once per device; skipped in demo mode.

const STORAGE_KEY = 'dentalux_onboarded_v1';

const SLIDES: Record<
  Language,
  { title: string; text: string }[]
> = {
  ru: [
    { title: 'Запись за пару нажатий', text: 'Выберите услугу, врача и удобное время. Бронирование занимает меньше минуты.' },
    { title: 'Ассистент 24/7', text: 'Ответит на вопросы о ценах, адресе и записи в любое время суток.' },
    { title: 'Напомним о визите', text: 'Пришлём напоминание, подскажем, как добраться, и поможем добавить визит в календарь.' },
  ],
  uz: [
    { title: 'Bir necha bosishda yozilish', text: 'Xizmat, shifokor va qulay vaqtni tanlang. Bron qilish bir daqiqadan kam vaqt oladi.' },
    { title: 'Yordamchi 24/7', text: 'Narxlar, manzil va yozilish bo‘yicha savollarga istalgan vaqtda javob beradi.' },
    { title: 'Qabulni eslatamiz', text: 'Eslatma yuboramiz, yo‘lni ko‘rsatamiz va qabulni taqvimga qo‘shishga yordam beramiz.' },
  ],
  en: [
    { title: 'Booking in a few taps', text: 'Choose a service, a doctor and a convenient time. Booking takes less than a minute.' },
    { title: 'Assistant 24/7', text: 'Answers questions about prices, the address and booking at any time of day.' },
    { title: 'We remind you', text: 'We send a reminder, show how to get here and help you add the visit to your calendar.' },
  ],
};

const ICONS = [CalendarCheck, MessageCircle, BellRing];

const LABELS: Record<Language, { next: string; start: string; skip: string }> = {
  ru: { next: 'Далее', start: 'Начать', skip: 'Пропустить' },
  uz: { next: 'Keyingi', start: 'Boshlash', skip: 'O‘tkazib yuborish' },
  en: { next: 'Next', start: 'Get started', skip: 'Skip' },
};

interface OnboardingProps {
  lang: Language;
  enabled: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ lang, enabled }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (!enabled) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable: skip onboarding rather than block the app
    }
  }, [enabled]);

  // Hide right away if the context changes (for example, demo mode is detected after the first render)
  if (!visible || !enabled) return null;

  const slides = SLIDES[lang];
  const labels = LABELS[lang];
  const slide = slides[index];
  const Icon = ICONS[index];
  const isLast = index === slides.length - 1;

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Nothing to store
    }
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col px-6 pt-safe pb-safe">
      <div className="flex justify-end pt-4">
        <button onClick={finish} className="text-[13px] font-semibold text-[var(--ink-muted)] px-3 py-2">
          {labels.skip}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* key restarts the entrance animation on every slide */}
        <div key={index} className="flex flex-col items-center tab-enter-next">
          <div className="w-28 h-28 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center mb-8">
            <Icon className="w-12 h-12" strokeWidth={1.6} />
          </div>
          <h2 className="type-page-title max-w-xs">{slide.title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-secondary)] max-w-xs">{slide.text}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
        {slides.map((_, dot) => (
          <span
            key={dot}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              dot === index ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-slate-300'
            }`}
          />
        ))}
      </div>

      <button
        onClick={() => (isLast ? finish() : setIndex(index + 1))}
        className="btn-pill-primary w-full py-4 text-[15px] mb-4 active:scale-95 transition-transform"
      >
        {isLast ? labels.start : labels.next}
      </button>
    </div>
  );
};
