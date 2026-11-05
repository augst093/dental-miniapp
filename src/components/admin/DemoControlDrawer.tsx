'use client';

import React, { useState } from 'react';
import { telegramAuthHeaders } from '@/lib/telegramClient';
import { SlidingIndicator, useSlidingIndicator } from '../ui/SlidingIndicator';
import {
  Sparkles,
  User,
  ShieldCheck,
  Bell,
  CalendarPlus,
  UserX,
  Send,
  RotateCcw,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

interface DemoControlDrawerProps {
  currentRole: 'patient' | 'admin';
  onRoleChange: (role: 'patient' | 'admin') => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  onRefreshData?: () => void;
}

export const DemoControlDrawer: React.FC<DemoControlDrawerProps> = ({
  currentRole,
  onRoleChange,
  triggerHaptic,
  onRefreshData,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const roleIndicator = useSlidingIndicator<'patient' | 'admin'>(currentRole);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const executeDemoAction = async (action: string) => {
    triggerHaptic('medium');
    setActionLoading(true);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...telegramAuthHeaders() },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message || 'Действие выполнено');
        triggerHaptic('light');
        if (onRefreshData) onRefreshData();
      } else {
        showFeedback(`Ошибка: ${data.error}`);
      }
    } catch {
      showFeedback('Сетевая ошибка при выполнении демо-действия');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* 1. Discreet Top Pill Banner (Floating Island) */}
      <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 text-white backdrop-blur-xl rounded-full shadow-lg border border-slate-700/80 text-[11px] font-semibold select-none">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="opacity-90">Демо-версия</span>

        <span className="opacity-30">|</span>

        {/* Quick Role Switcher */}
        <button
          onClick={() => {
            triggerHaptic('light');
            const next = currentRole === 'patient' ? 'admin' : 'patient';
            onRoleChange(next);
            showFeedback(next === 'admin' ? 'Переключено на: Администратор' : 'Переключено на: Пациент');
          }}
          className="text-blue-300 hover:text-white transition-colors flex items-center gap-1 font-bold"
        >
          {currentRole === 'admin' ? (
            <>
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Админ</span>
            </>
          ) : (
            <>
              <User className="w-3 h-3 text-blue-300" />
              <span>Пациент</span>
            </>
          )}
        </button>

        <span className="opacity-30">|</span>

        {/* Open Full Demo Control Drawer */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsOpen(true);
          }}
          className="text-yellow-300 hover:text-yellow-200 transition-colors flex items-center gap-0.5 font-bold"
        >
          <Sparkles className="w-3 h-3" />
          <span>Пульт</span>
        </button>
      </div>

      {/* Floating Action Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-2.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-blue-500/40 text-[12px] font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 2. Full Demo Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900">
                    Демо-пульт для презентации
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Мгновенная симуляция сценариев для владельца клиники
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Switch */}
            <div className="bg-slate-100 p-2.5 rounded-2xl flex items-center justify-between">
              <span className="text-[12px] font-bold text-slate-700">Текущая роль:</span>
              <div ref={roleIndicator.attach} className="relative flex items-center gap-1">
                <SlidingIndicator
                  box={roleIndicator.box}
                  className={currentRole === 'admin' ? 'bg-blue-600 shadow-xs' : 'bg-white shadow-xs'}
                />
                <button
                  data-seg-key={'patient'}
                  onClick={() => {
                    triggerHaptic('light');
                    onRoleChange('patient');
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-[12px] font-bold transition-colors duration-300 ${
                    currentRole === 'patient'
                      ? 'text-blue-600'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Пациент
                </button>
                <button
                  data-seg-key={'admin'}
                  onClick={() => {
                    triggerHaptic('light');
                    onRoleChange('admin');
                  }}
                  className={`relative px-3 py-1.5 rounded-xl text-[12px] font-bold transition-colors duration-300 ${
                    currentRole === 'admin'
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Администратор
                </button>
              </div>
            </div>

            {/* Quick Demo Scenario Buttons */}
            <div className="space-y-2 text-[12px]">
              {/* Action 1: Send reminder now */}
              <button
                disabled={actionLoading}
                onClick={() => executeDemoAction('send_reminder')}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-blue-900 font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Отправить напоминание сейчас</span>
                </div>
                <span className="text-[10px] bg-blue-200/60 px-2 py-0.5 rounded-full">
                  24ч / 2ч
                </span>
              </button>

              {/* Action 2: Sample appointment tomorrow */}
              <button
                disabled={actionLoading}
                onClick={() => executeDemoAction('create_sample')}
                className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-900 font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <CalendarPlus className="w-4 h-4 text-emerald-600" />
                  <span>Создать тестовую запись на завтра</span>
                </div>
                <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full">
                  15:00
                </span>
              </button>

              {/* Action 3: Simulate cancellation */}
              <button
                disabled={actionLoading}
                onClick={() => executeDemoAction('simulate_cancellation')}
                className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <UserX className="w-4 h-4 text-amber-600" />
                  <span>Смоделировать отмену пациентом</span>
                </div>
                <span className="text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-full">
                  Свободный слот
                </span>
              </button>

              {/* Action 4: Weekly digest */}
              <button
                disabled={actionLoading}
                onClick={() => executeDemoAction('send_digest')}
                className="w-full p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-900 font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>Отправить недельный дайджест</span>
                </div>
                <span className="text-[10px] bg-indigo-200/60 px-2 py-0.5 rounded-full">
                  Telegram
                </span>
              </button>

              {/* Action 5: Reset demo data */}
              <button
                disabled={actionLoading}
                onClick={() => executeDemoAction('reset_demo')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>Сбросить демо-данные (14 дней)</span>
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full">
                  Чистый срез
                </span>
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-colors"
            >
              Закрыть пульт
            </button>
          </div>
        </div>
      )}
    </>
  );
};
