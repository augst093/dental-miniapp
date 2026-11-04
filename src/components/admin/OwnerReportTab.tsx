'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Send,
  Zap,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Language } from '../../data/clinicData';
import { ClinicMetrics } from '../../lib/db';

interface OwnerReportTabProps {
  lang: Language;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const OwnerReportTab: React.FC<OwnerReportTabProps> = ({
  lang,
  triggerHaptic,
}) => {
  const [periodDays, setPeriodDays] = useState<7 | 30>(7);
  const [metrics, setMetrics] = useState<ClinicMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [digestStatus, setDigestStatus] = useState<string | null>(null);

  const fetchMetrics = async (days: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?days=${days}`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch {
      // ignore network errors in mock mode
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(periodDays);
  }, [periodDays]);

  const handleSendDigestNow = async () => {
    triggerHaptic('medium');
    setDigestStatus('Отправка...');
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_digest' }),
      });
      const data = await res.json();
      if (data.success) {
        setDigestStatus('✅ Отправлен в Telegram');
        triggerHaptic('light');
        setTimeout(() => setDigestStatus(null), 4000);
      } else {
        setDigestStatus('Ошибка отправки');
      }
    } catch {
      setDigestStatus('Ошибка сети');
    }
  };

  const m = metrics || {
    periodDays,
    totalBookings: 38,
    botBookings: 32,
    phoneBookings: 6,
    confirmedCount: 33,
    confirmationRatePercent: 87,
    completedCount: 29,
    cancellationsCount: 5,
    cancellationsEarlyCount: 4,
    noShowCount: 3,
    noShowRatePercent: 8,
    savedSlotsCount: 4,
    adminMinutesSaved: 128,
    adminHoursSaved: 2.1,
    dailyStats: [
      { date: '2026-10-29', dayLabel: 'Ср 29', total: 5, completed: 4, cancelled: 1, noShow: 0 },
      { date: '2026-10-30', dayLabel: 'Чт 30', total: 6, completed: 5, cancelled: 1, noShow: 0 },
      { date: '2026-10-31', dayLabel: 'Пт 31', total: 4, completed: 3, cancelled: 0, noShow: 1 },
      { date: '2026-11-01', dayLabel: 'Сб 1', total: 7, completed: 6, cancelled: 1, noShow: 0 },
      { date: '2026-11-02', dayLabel: 'Вс 2', total: 3, completed: 2, cancelled: 0, noShow: 1 },
      { date: '2026-11-03', dayLabel: 'Пн 3', total: 6, completed: 5, cancelled: 1, noShow: 0 },
      { date: '2026-11-04', dayLabel: 'Вт 4', total: 7, completed: 4, cancelled: 1, noShow: 1 },
    ],
  };

  // Find max daily count for SVG chart scaling
  const maxDayCount = Math.max(...m.dailyStats.map((d) => d.total), 8);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Title & Period Selector */}
      <div className="clinic-card p-4 rounded-3xl border border-slate-200/90 bg-white/95 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="font-extrabold text-[16px] text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Отчёт для владельца</span>
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Экономика и конверсия приёмов клиники DentaLux
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => {
              triggerHaptic('light');
              setPeriodDays(7);
            }}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
              periodDays === 7
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            7 дней
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setPeriodDays(30);
            }}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
              periodDays === 30
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            30 дней
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* KPI 1: Total & Bot Bookings */}
        <div className="clinic-card p-3.5 rounded-3xl border border-slate-200/80 bg-white/90 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Всего записей</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {Math.round((m.botBookings / (m.totalBookings || 1)) * 100)}% бот
            </span>
          </div>
          <div className="font-extrabold font-mono text-[24px] text-slate-900 leading-none">
            {m.totalBookings}
          </div>
          <p className="text-[10px] text-slate-500">
            {m.botBookings} через Mini App, {m.phoneBookings} телефон
          </p>
        </div>

        {/* KPI 2: Confirmation Rate */}
        <div className="clinic-card p-3.5 rounded-3xl border border-slate-200/80 bg-white/90 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Подтверждаемость</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              +28%
            </span>
          </div>
          <div className="font-extrabold font-mono text-[24px] text-emerald-700 leading-none">
            {m.confirmationRatePercent}%
          </div>
          <p className="text-[10px] text-slate-500">
            {m.confirmedCount} из {m.totalBookings} подтвердили
          </p>
        </div>

        {/* KPI 3: No-show Rate */}
        <div className="clinic-card p-3.5 rounded-3xl border border-slate-200/80 bg-white/90 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Неявки (no-show)</span>
            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
              В 2.5 раза ниже
            </span>
          </div>
          <div className="font-extrabold font-mono text-[24px] text-slate-900 leading-none">
            {m.noShowRatePercent}%
          </div>
          <p className="text-[10px] text-slate-500">
            Всего {m.noShowCount} пациентов не явились
          </p>
        </div>

        {/* KPI 4: Saved Slots */}
        <div className="clinic-card p-3.5 rounded-3xl border border-slate-200/80 bg-white/90 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Спасённые слоты</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              ♻️ Занято
            </span>
          </div>
          <div className="font-extrabold font-mono text-[24px] text-indigo-700 leading-none">
            {m.savedSlotsCount}
          </div>
          <p className="text-[10px] text-slate-500">
            Слоты перебронированы после отмен
          </p>
        </div>
      </div>

      {/* Admin Time Saved Banner */}
      <div className="clinic-card p-4 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-100" />
            <h3 className="font-extrabold text-[14px]">
              Экономия рабочего времени
            </h3>
          </div>
          <span className="font-extrabold font-mono text-[20px] text-yellow-300">
            ~{m.adminHoursSaved} ч
          </span>
        </div>
        <p className="text-[11px] text-blue-100 leading-relaxed">
          Автоматический выбор слотов, запись 24/7 и авто-напоминания освободили
          администратора от рутинных звонков.{' '}
          <span className="opacity-80">
            (*расчёт: 4 минуты на каждую обработку бронирования)
          </span>
        </p>
      </div>

      {/* SVG Bar Chart: Daily Appointments Breakdown */}
      <div className="clinic-card p-4 rounded-3xl border border-slate-200/90 bg-white/95 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[13px] text-slate-900">
              Динамика записей по дням
            </h3>
            <p className="text-[11px] text-slate-500">
              Выполненные, отменённые и неявки
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Приёмы
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" /> Отмены
            </span>
          </div>
        </div>

        {/* Lightweight Responsive SVG Chart */}
        <div className="h-36 w-full pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 350 120">
            {/* Horizontal guideline lines */}
            <line x1="0" y1="20" x2="350" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="350" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="350" y2="100" stroke="#e2e8f0" />

            {/* Bars */}
            {m.dailyStats.map((item, idx) => {
              const x = 20 + idx * 46;
              const barWidth = 24;
              const totalHeight = (item.total / maxDayCount) * 85;
              const completedHeight = (item.completed / maxDayCount) * 85;
              const yBase = 100;

              return (
                <g key={item.date} className="cursor-pointer">
                  {/* Background Bar */}
                  <rect
                    x={x}
                    y={yBase - totalHeight}
                    width={barWidth}
                    height={totalHeight}
                    rx="4"
                    fill="#cbd5e1"
                    className="transition-all hover:opacity-80"
                  />
                  {/* Completed Fill */}
                  <rect
                    x={x}
                    y={yBase - completedHeight}
                    width={barWidth}
                    height={completedHeight}
                    rx="4"
                    fill="#2563eb"
                  />
                  {/* Day Label */}
                  <text
                    x={x + barWidth / 2}
                    y="115"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#64748b"
                  >
                    {item.dayLabel}
                  </text>
                  {/* Total Count */}
                  <text
                    x={x + barWidth / 2}
                    y={yBase - totalHeight - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {item.total}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Weekly Telegram Digest Trigger */}
      <div className="clinic-card p-4 rounded-3xl border border-slate-200/90 bg-white/95 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#229ED9]/10 text-[#0088cc] flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-[13px] text-slate-900">
                Еженедельный дайджест в Telegram
              </h4>
              <p className="text-[11px] text-slate-500">
                Каждый понедельник в 09:00 (Ташкент) отправляется владельцу
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSendDigestNow}
          className="btn-pill-primary w-full py-2.5 text-[12px] flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{digestStatus || 'Отправить дайджест прямо сейчас (Демо)'}</span>
        </button>
      </div>
    </div>
  );
};
