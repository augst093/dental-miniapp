'use client';

import React, { useEffect, useState } from 'react';
import { CLINIC_CONFIG } from '../../data/clinicData';

// Sales page for clinic owners. Not linked from the patient Mini App.

interface SampleMetrics {
  totalBookings: number;
  botBookings: number;
  confirmationRatePercent: number;
  noShowRatePercent: number;
  savedSlotsCount: number;
  adminHoursSaved: number;
}

const SETUP_INCLUDES = [
  'Настройка бота и Mini App под вашу клинику',
  'Загрузка врачей, услуг и цен из прайса',
  'Панель администратора и график врачей',
  'Обучение администратора (около 1 часа)',
];

const SUPPORT_INCLUDES = [
  'Напоминания пациентам за 24 часа и за 2 часа',
  'Круглосуточный ответ бота на русском и узбекском',
  'Утренняя сводка директору и еженедельный отчёт',
  'Просьба об отзыве после визита и напоминание о профилактике',
  'Ежедневная резервная копия данных',
  'Обновления и техническая поддержка',
];

export default function PricingPage() {
  const [metrics, setMetrics] = useState<SampleMetrics | null>(null);

  useEffect(() => {
    fetch('/api/reports?days=30')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.metrics) setMetrics(data.metrics);
      })
      .catch(() => setMetrics(null));
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)] px-4 py-10 max-w-3xl mx-auto space-y-10">
      <header className="space-y-3">
        <p className="text-[12px] font-bold uppercase tracking-wider text-[var(--accent)]">
          {CLINIC_CONFIG.name.ru} · автоматизация клиники
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Записи 24/7 и меньше неявок.
          <span className="block font-serif italic font-normal text-[var(--accent)]">
            Без лишнего персонала.
          </span>
        </h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="clinic-card p-6 rounded-3xl space-y-4">
          <h2 className="font-bold text-[15px]">Внедрение</h2>
          <p className="text-3xl font-extrabold">$450 <span className="text-[14px] font-medium text-[var(--ink-muted)]">разово</span></p>
          <ul className="space-y-2 text-[13px] text-[var(--ink-secondary)]">
            {SETUP_INCLUDES.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="clinic-card p-6 rounded-3xl space-y-4 border-2 border-[var(--accent)]/30">
          <h2 className="font-bold text-[15px]">Сопровождение</h2>
          <p className="text-3xl font-extrabold">$50 <span className="text-[14px] font-medium text-[var(--ink-muted)]">в месяц</span></p>
          <ul className="space-y-2 text-[13px] text-[var(--ink-secondary)]">
            {SUPPORT_INCLUDES.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="clinic-card p-6 rounded-3xl space-y-4">
        <div>
          <h2 className="font-serif italic text-[22px]">Пример отчёта за 30 дней</h2>
          <p className="text-[12px] text-[var(--ink-muted)] mt-1">
            Цифры ниже из демо-данных, а не из реальной клиники. Ваш отчёт будет считаться по вашим записям.
          </p>
        </div>

        {metrics ? (
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="Записей" value={metrics.totalBookings} />
            <Stat label="Через бота и Mini App" value={metrics.botBookings} />
            <Stat label="Подтверждено" value={`${metrics.confirmationRatePercent}%`} />
            <Stat label="Неявки" value={`${metrics.noShowRatePercent}%`} />
            <Stat label="Освобождённые слоты" value={metrics.savedSlotsCount} />
            <Stat label="Время администратора" value={`~${metrics.adminHoursSaved} ч`} />
          </dl>
        ) : (
          <p className="text-[13px] text-[var(--ink-muted)]">Загружаем пример…</p>
        )}
      </section>

      <footer className="text-[12px] text-[var(--ink-muted)]">
        Вопросы и запуск клиники: {CLINIC_CONFIG.phoneDisplay}
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-[var(--accent-subtle)] p-4">
      <dt className="text-[11px] text-[var(--ink-muted)]">{label}</dt>
      <dd className="text-2xl font-extrabold text-[var(--ink)]">{value}</dd>
    </div>
  );
}
