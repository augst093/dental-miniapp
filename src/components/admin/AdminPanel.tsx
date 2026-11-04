'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  User,
  Check,
  X,
  AlertCircle,
  UserX,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../data/clinicData';
import { CLINIC_DOCTORS, DoctorConfig } from '../../clinic.config';
import {
  AppointmentStatus,
  STATUS_LABELS,
} from '../../lib/appointmentLifecycle';
import { DBAppointment } from '../../lib/db';
import { SlidingIndicator, useSlidingIndicator } from '../ui/SlidingIndicator';
import { CallButton } from '../ui/CallButton';
import {
  formatTashkentISODate,
  formatTashkentTime,
  getNowUTC,
  toTashkentClock,
} from '../../lib/timezone';

interface AdminPanelProps {
  lang: Language;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  onOpenReport?: () => void;
  onSwitchToPatientView?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  triggerHaptic,
  onOpenReport,
  onSwitchToPatientView,
}) => {
  const [appointments, setAppointments] = useState<DBAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'today' | 'week' | 'doctors'>('today');
  const subTabIndicator = useSlidingIndicator<'today' | 'week' | 'doctors'>(activeSubTab);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calendar view selected date (YYYY-MM-DD)
  const todayIso = formatTashkentISODate(getNowUTC());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayIso);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');

  // Manual appointment modal
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualPhone, setManualPhone] = useState<string>('+998 ');
  const [manualDoctor, setManualDoctor] = useState<string>(CLINIC_DOCTORS[0].name.ru);
  const [manualService, setManualService] = useState<string>('Первичный 3D-осмотр (КТ)');
  const [manualDate, setManualDate] = useState<string>(todayIso);
  const [manualTime, setManualTime] = useState<string>('12:00');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualSubmitting, setManualSubmitting] = useState<boolean>(false);

  // Status transition in progress
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/appointments');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        setError(data.error || 'Не удалось загрузить записи');
      }
    } catch {
      setError('Ошибка сети при загрузке расписания');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    // Auto-refresh every 25 seconds
    const interval = setInterval(fetchAppointments, 25000);
    // Refresh on window focus
    const handleFocus = () => fetchAppointments();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAppointments]);

  // Handle status update
  const handleUpdateStatus = async (
    appointmentId: string,
    newStatus: AppointmentStatus,
    reason?: string
  ) => {
    triggerHaptic('medium');
    setUpdatingId(appointmentId);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor: 'admin',
          reason: reason || `Администратор изменил статус на ${newStatus}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Optimistically update local state
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, status: newStatus } : app
          )
        );
        triggerHaptic('light');
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch {
      alert('Сетевая ошибка при обновлении статуса');
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit manual booking
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    setManualSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: manualName.trim(),
          patientPhone: manualPhone.trim(),
          doctorName: manualDoctor,
          serviceTitle: manualService,
          dateStr: manualDate,
          timeStr: manualTime,
          source: 'phone_admin',
          notes: manualNotes.trim() || 'Запись по телефону (администратор)',
          actor: 'admin',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsManualModalOpen(false);
        setManualName('');
        setManualPhone('+998 ');
        setManualNotes('');
        await fetchAppointments();
        triggerHaptic('light');
      } else {
        alert(data.error || 'Не удалось записать пациента');
      }
    } catch {
      alert('Ошибка при сохранении записи');
    } finally {
      setManualSubmitting(false);
    }
  };

  // Filter appointments for Today view
  const todayAppointments = appointments.filter((app) => {
    const isToday = formatTashkentISODate(app.dateTime) === todayIso;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patientPhone.includes(searchQuery) ||
      app.doctorName.toLowerCase().includes(searchQuery.toLowerCase());

    return isToday && matchesStatus && matchesSearch;
  });

  // Filter for Calendar / Week view
  const calendarAppointments = appointments.filter((app) => {
    const isTargetDate = formatTashkentISODate(app.dateTime) === selectedCalendarDate;
    const matchesDoctor =
      selectedDoctorFilter === 'all' || app.doctorId === selectedDoctorFilter || app.doctorName.includes(selectedDoctorFilter);
    return isTargetDate && matchesDoctor;
  });

  // Next 7 days for horizontal date selector
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const now = getNowUTC();
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const iso = formatTashkentISODate(d);
    const clock = toTashkentClock(d);
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return {
      iso,
      dayNum: clock.getUTCDate(),
      dayName: i === 0 ? 'Сегодня' : dayNames[clock.getUTCDay()],
    };
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Admin Header Bar */}
      <div className="clinic-card p-3.5 sm:p-4 rounded-3xl flex items-center justify-between shadow-xs border border-slate-200/80 bg-white/95">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-[15px] sm:text-[16px] text-slate-900 leading-none">
                Панель администратора
              </h1>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Живое расписание клиники DentaLux
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic('light');
              fetchAppointments();
            }}
            disabled={loading}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          {onSwitchToPatientView && (
            <button
              onClick={() => {
                triggerHaptic('medium');
                onSwitchToPatientView();
              }}
              className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              Вид пациента
            </button>
          )}
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div ref={subTabIndicator.attach} className="relative flex items-center justify-between gap-1 p-1 bg-slate-200/70 rounded-2xl">
        <SlidingIndicator box={subTabIndicator.box} className="bg-white shadow-xs" />
        <button
          data-seg-key={'today'}
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('today');
          }}
          className={`relative flex-1 py-2 px-3 rounded-xl text-[12px] font-bold transition-colors duration-300 ${
            activeSubTab === 'today'
              ? 'text-slate-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Сегодня ({appointments.filter((a) => formatTashkentISODate(a.dateTime) === todayIso).length})
        </button>
        <button
          data-seg-key={'week'}
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('week');
          }}
          className={`relative flex-1 py-2 px-3 rounded-xl text-[12px] font-bold transition-colors duration-300 ${
            activeSubTab === 'week'
              ? 'text-slate-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Календарь
        </button>
        <button
          data-seg-key={'doctors'}
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('doctors');
          }}
          className={`relative flex-1 py-2 px-3 rounded-xl text-[12px] font-bold transition-colors duration-300 ${
            activeSubTab === 'doctors'
              ? 'text-slate-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Врачи ({CLINIC_DOCTORS.length})
        </button>
      </div>

      {/* Action Bar: Manual Booking Button + Search */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsManualModalOpen(true);
          }}
          className="btn-pill-primary py-2.5 px-4 text-[13px] flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Записать по телефону</span>
        </button>

        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по пациенту, телефону..."
            className="w-full pl-8 pr-3 py-2 text-[12px] rounded-xl border border-slate-200/90 bg-white/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: TODAY TIMELINE
         ======================================================== */}
      {activeSubTab === 'today' && (
        <div className="space-y-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {[
              { id: 'all', label: 'Все' },
              { id: 'pending', label: 'Ожидают' },
              { id: 'confirmed', label: 'Подтверждены' },
              { id: 'reschedule_requested', label: 'Перенос' },
              { id: 'completed', label: 'Завершены' },
              { id: 'no_show', label: 'Неявки' },
            ].map((f) => {
              const count =
                f.id === 'all'
                  ? appointments.filter((a) => formatTashkentISODate(a.dateTime) === todayIso).length
                  : appointments.filter(
                      (a) => formatTashkentISODate(a.dateTime) === todayIso && a.status === f.id
                    ).length;

              const isSelected = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setStatusFilter(f.id);
                  }}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap font-semibold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Today Appointments List */}
          {todayAppointments.length === 0 ? (
            <div className="clinic-card p-8 text-center rounded-3xl space-y-2">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[14px] text-slate-800">
                {statusFilter === 'all' ? 'На сегодня нет записей' : 'Нет записей с таким статусом'}
              </h3>
              <p className="text-[12px] text-slate-500 max-w-xs mx-auto">
                Используйте кнопку «Записать по телефону» для добавления записи вручную или откройте Mini App в роли пациента.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayAppointments.map((app) => {
                const statusMeta = STATUS_LABELS[app.status] || STATUS_LABELS.pending;
                const isUpdating = updatingId === app.id;

                return (
                  <div
                    key={app.id}
                    className="clinic-card p-3.5 sm:p-4 rounded-3xl border border-slate-200/90 bg-white/95 space-y-3 transition-all hover:border-slate-300"
                  >
                    {/* Top Row: Time, Status, Source */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-[15px] sm:text-[16px] text-blue-900 bg-blue-50 px-2.5 py-1 rounded-xl">
                          {formatTashkentTime(app.dateTime)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({app.durationMinutes} мин)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeColor}`}
                        >
                          {statusMeta.ru}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {app.source === 'phone_admin' ? '📞 Телефон' : '🤖 Mini App'}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Patient & Doctor Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{app.patientName}</span>
                        </div>
                        <div className="text-[12px] font-mono text-slate-600 pl-5">
                          {app.patientPhone}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-800 text-[12px] truncate">
                          🦷 {app.serviceTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          👨‍⚕️ {app.doctorName}
                        </div>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {app.notes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl italic border border-slate-100">
                        Примечание: {app.notes}
                      </div>
                    )}

                    {/* Action Bar (1-Tap Buttons) */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {/* Call link */}
                        <CallButton
                          phone={app.patientPhone}
                          display={app.patientPhone}
                          lang={lang}
                          title="Позвонить пациенту"
                          triggerHaptic={triggerHaptic}
                          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1 text-[11px] font-bold"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>Звонок</span>
                        </CallButton>

                        {/* Telegram Link if available */}
                        {app.telegramId && (
                          <a
                            href={`tg://user?id=${app.telegramId}`}
                            onClick={() => triggerHaptic('light')}
                            className="p-2 rounded-xl bg-[#229ED9]/10 text-[#0088cc] hover:bg-[#229ED9]/20 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Написать в Telegram"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Telegram</span>
                          </a>
                        )}
                      </div>

                      {/* Status Change Buttons */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {app.status === 'pending' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Подтвердить</span>
                          </button>
                        )}

                        {(app.status === 'confirmed' || app.status === 'pending') && (
                          <>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(app.id, 'completed')}
                              className="px-2 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                              title="Отметить успешный визит"
                            >
                              <Check className="w-3 h-3" />
                              <span>Пришёл</span>
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(app.id, 'no_show')}
                              className="px-2 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold flex items-center gap-1 transition-all"
                              title="Пациент не явился"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Не явился</span>
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                              title="Отменить запись (освободить слот)"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: CALENDAR & WEEK VIEW
         ======================================================== */}
      {activeSubTab === 'week' && (
        <div className="space-y-3">
          {/* 7-Day Horizontal Selector */}
          <div className="grid grid-cols-7 gap-1">
            {next7Days.map((d) => {
              const isSelected = selectedCalendarDate === d.iso;
              const count = appointments.filter(
                (a) => formatTashkentISODate(a.dateTime) === d.iso && a.status !== 'cancelled'
              ).length;

              return (
                <button
                  key={d.iso}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCalendarDate(d.iso);
                  }}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-2 ring-blue-600/20'
                      : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] opacity-80 uppercase leading-none">{d.dayName}</span>
                  <span className="text-[15px] font-extrabold my-0.5 leading-none">{d.dayNum}</span>
                  <span
                    className={`text-[9px] px-1.5 rounded-full font-semibold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Doctor Filter Pill Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              onClick={() => setSelectedDoctorFilter('all')}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all ${
                selectedDoctorFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Все врачи
            </button>
            {CLINIC_DOCTORS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctorFilter(doc.name.ru)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap font-semibold border transition-all ${
                  selectedDoctorFilter === doc.name.ru
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {doc.name.ru}
              </button>
            ))}
          </div>

          {/* Appointments on selected date */}
          <div className="space-y-2">
            <div className="text-[12px] font-bold text-slate-700 flex items-center justify-between">
              <span>Записи на {selectedCalendarDate}:</span>
              <span className="text-slate-500 font-normal">
                {calendarAppointments.length} визитов
              </span>
            </div>

            {calendarAppointments.length === 0 ? (
              <div className="clinic-card p-6 text-center rounded-2xl space-y-2">
                <p className="text-[13px] text-slate-500">На этот день записей нет.</p>
                <button
                  onClick={() => {
                    setManualDate(selectedCalendarDate);
                    setIsManualModalOpen(true);
                  }}
                  className="btn-pill-primary py-2 px-4 text-[12px] inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить запись на этот день</span>
                </button>
              </div>
            ) : (
              calendarAppointments.map((app) => (
                <div
                  key={app.id}
                  className="clinic-card p-3 rounded-2xl border border-slate-200/90 bg-white/95 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[14px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg">
                      {formatTashkentTime(app.dateTime)}
                    </span>
                    <div>
                      <div className="font-bold text-[13px] text-slate-900">
                        {app.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {app.serviceTitle} ({app.doctorName})
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      STATUS_LABELS[app.status]?.badgeColor
                    }`}
                  >
                    {STATUS_LABELS[app.status]?.ru}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: DOCTOR SCHEDULE QUICK EDITOR
         ======================================================== */}
      {activeSubTab === 'doctors' && (
        <div className="space-y-2.5">
          <div className="text-[12px] text-slate-500 pb-1">
            Оперативное управление сменами и рабочими часами врачей клиники:
          </div>

          {CLINIC_DOCTORS.map((doc) => (
            <div
              key={doc.id}
              className="clinic-card p-4 rounded-3xl border border-slate-200/90 bg-white/95 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[14px] text-slate-900">{doc.name.ru}</h4>
                  <p className="text-[11px] text-slate-500">{doc.role.ru}</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Активен
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px] pt-1 border-t border-slate-100">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Рабочие часы:</span>
                  <span className="font-bold font-mono text-slate-800">
                    {String(doc.schedule.startHour).padStart(2, '0')}:00 — {doc.schedule.endHour}:00
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-slate-500 text-[10px] block">Длительность слота:</span>
                  <span className="font-bold text-slate-800">
                    {doc.schedule.slotDurationMinutes} минут
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          MODAL: MANUAL PHONE APPOINTMENT ENTRY
         ======================================================== */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-white/90 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-[15px] text-slate-900">
                  Запись пациента по телефону
                </h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-3">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  ФИО Пациента <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Например: Алишер Усманов"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="+998 (90) 123-45-67"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Дата приёма
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[12px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Время слота
                  </label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[12px] text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {[
                      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
                      '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Врач
                </label>
                <select
                  value={manualDoctor}
                  onChange={(e) => setManualDoctor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[12px] text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                >
                  {CLINIC_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.name.ru}>
                      {doc.name.ru} ({doc.role.ru})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Услуга
                </label>
                <input
                  type="text"
                  value={manualService}
                  onChange={(e) => setManualService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[12px] text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Заметка администратора
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Например: острая боль, просил пораньше"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="btn-pill-secondary flex-1 py-2.5 text-[13px]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="btn-pill-primary flex-1 py-2.5 text-[13px] flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{manualSubmitting ? 'Сохранение...' : 'Забронировать слот'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
