'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { telegramAuthHeaders } from '@/lib/telegramClient';
import { CallButton } from './ui/CallButton';
import { saveVisit } from '../lib/patientVisit';
import { CalendarPicker } from './booking/CalendarPicker';
import { TimePicker } from './booking/TimePicker';
import { formatDayLong } from '../lib/bookingDates';
import { markMoving } from '../lib/motion';
import { useCatalog } from '../lib/useCatalog';
import {
  X,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  MapPin,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  Language,
  UI_TRANSLATIONS,
} from '../data/clinicData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialDoctor?: string;
  lang: Language;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  userNamePrefill?: string;
}

const QUICK_SERVICES: Record<
  Language,
  { id: string; title: string; price: string; isFree?: boolean; isSos?: boolean }[]
> = {
  ru: [
    { id: '3d-consultation', title: 'Первичный 3D-осмотр (КТ)', price: 'Бесплатно', isFree: true },
    { id: 'sos-pain', title: 'Острая боль (SOS неотложка)', price: 'от 250 000 сум', isSos: true },
    { id: 'implant', title: 'Имплантация Straumann', price: 'от 8 500 000 сум' },
    { id: 'braces', title: 'Брекеты Damon / Элайнеры', price: 'от 7 500 000 сум' },
    { id: 'caries', title: 'Лечение кариеса и пломба', price: 'от 450 000 сум' },
    { id: 'hygiene', title: 'Комплексная 4-этапная чистка', price: '650 000 сум' },
  ],
  uz: [
    { id: '3d-consultation', title: 'Dastlabki 3D-ko‘rik (KT)', price: 'Bepul', isFree: true },
    { id: 'sos-pain', title: 'O‘tkir og‘riq (SOS tezkor yordam)', price: '250 000 so‘mdan', isSos: true },
    { id: 'implant', title: 'Straumann implantatsiyasi', price: '8 500 000 so‘mdan' },
    { id: 'braces', title: 'Damon breketlar / Elaynerlar', price: '7 500 000 so‘mdan' },
    { id: 'caries', title: 'Karies davolash va plomba', price: '450 000 so‘mdan' },
    { id: 'hygiene', title: '4 bosqichli professional tozalash', price: '650 000 so‘m' },
  ],
  en: [
    { id: '3d-consultation', title: 'Initial 3D Examination (CT)', price: 'Free', isFree: true },
    { id: 'sos-pain', title: 'Urgent Tooth Pain (SOS)', price: 'from 250k UZS', isSos: true },
    { id: 'implant', title: 'Straumann Dental Implant', price: 'from 8.5M UZS' },
    { id: 'braces', title: 'Damon Braces / Clear Aligners', price: 'from 7.5M UZS' },
    { id: 'caries', title: 'Caries Treatment & Filling', price: 'from 450k UZS' },
    { id: 'hygiene', title: '4-Stage Deep Dental Hygiene', price: '650k UZS' },
  ],
};

function formatUzbekPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (!digits.startsWith('998')) {
    digits = '998' + digits;
  }
  digits = digits.slice(0, 12);

  const country = '+998';
  const op = digits.slice(3, 5);
  const part1 = digits.slice(5, 8);
  const part2 = digits.slice(8, 10);
  const part3 = digits.slice(10, 12);

  let formatted = country;
  if (op) formatted += ` (${op}`;
  if (op.length === 2) formatted += `)`;
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += `-${part2}`;
  if (part3) formatted += `-${part3}`;

  return formatted;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialDoctor,
  lang,
  triggerHaptic,
  userNamePrefill,
}) => {
  const t = UI_TRANSLATIONS.bookingModal;
  const config = CLINIC_CONFIG;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Steps slide in the direction of travel. The current step first slides out, then the next one enters.
  const [stepDir, setStepDir] = useState<'next' | 'prev'>('next');
  const [stepExiting, setStepExiting] = useState(false);
  const stepTimer = useRef<number | undefined>(undefined);
  const [closing, setClosing] = useState<boolean>(false);

  // Close with the sheet sliding down; `after` runs when the exit is done (used to reset the form without jumps)
  const closeAnimated = useCallback(
    (after?: () => void) => {
      if (closing) return;
      setClosing(true);
      window.setTimeout(() => {
        after?.();
        setClosing(false);
        onClose();
      }, 260);
    },
    [closing, onClose]
  );

  const goToStep = useCallback(
    (target: 1 | 2 | 3) => {
      if (target === step || stepExiting) return;
      setStepDir(target > step ? 'next' : 'prev');
      setStepExiting(true);
      markMoving(620);
      if (stepTimer.current !== undefined) window.clearTimeout(stepTimer.current);
      stepTimer.current = window.setTimeout(() => {
        setStep(target);
        setStepExiting(false);
        stepTimer.current = undefined;
      }, 190);
    },
    [step, stepExiting]
  );
  const [selectedService, setSelectedService] = useState<string>(
    initialService || QUICK_SERVICES[lang][0].title
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    initialDoctor || t.anyDoctor[lang]
  );
  const catalog = useCatalog();
  const matchedDoctor = catalog.doctors.find((doc) => Object.values(doc.name).includes(selectedDoctor));
  const selectedDoctorId = matchedDoctor ? (matchedDoctor.dbId ?? matchedDoctor.id) : undefined;
  const serviceChoices = catalog.source === 'database'
    ? catalog.services.map((s) => ({ id: s.id, title: s.name[lang], price: s.priceUzs, isFree: false, isSos: s.id === 'emergency-relief' }))
    : QUICK_SERVICES[lang];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>(userNamePrefill || '');
  const [clientPhone, setClientPhone] = useState<string>('+998 ');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Render-phase sync when props change (standard React pattern)
  const [prevInitialService, setPrevInitialService] = useState(initialService);
  if (initialService && initialService !== prevInitialService) {
    setPrevInitialService(initialService);
    setSelectedService(initialService);
  }

  const [prevInitialDoctor, setPrevInitialDoctor] = useState(initialDoctor);
  if (initialDoctor && initialDoctor !== prevInitialDoctor) {
    setPrevInitialDoctor(initialDoctor);
    setSelectedDoctor(initialDoctor);
  }

  const [prevUserNamePrefill, setPrevUserNamePrefill] = useState(userNamePrefill);
  if (userNamePrefill && userNamePrefill !== prevUserNamePrefill && !clientName) {
    setPrevUserNamePrefill(userNamePrefill);
    setClientName(userNamePrefill);
  }

  // Handle Telegram BackButton
  const handleTelegramBack = useCallback(() => {
    if (isSuccess) {
      closeAnimated(() => {
        setIsSuccess(false);
        setStep(1);
      });
      return;
    }

    if (step === 3) {
      triggerHaptic('light');
      goToStep(2);
    } else if (step === 2) {
      triggerHaptic('light');
      goToStep(1);
    } else {
      triggerHaptic('light');
      closeAnimated();
    }
  }, [step, isSuccess, closeAnimated, triggerHaptic, goToStep]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (isOpen) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleTelegramBack);
    } else {
      tg.BackButton.hide();
      tg.BackButton.offClick(handleTelegramBack);
    }

    return () => {
      tg.BackButton.offClick(handleTelegramBack);
    };
  }, [isOpen, handleTelegramBack]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw.length < 5 && raw !== '+998') {
      setClientPhone('+998 ');
      return;
    }
    const formatted = formatUzbekPhone(raw);
    setClientPhone(formatted);
  };

  const handleNextStep = () => {
    triggerHaptic('medium');
    if (step === 1) goToStep(2);
    else if (step === 2) goToStep(3);
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (step === 3) goToStep(2);
    else if (step === 2) goToStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAgreed) return;

    triggerHaptic('heavy');
    setIsSubmitting(true);
    setBookingError(null);

    try {
      if (!selectedDate || !selectedTimeSlot) {
        setBookingError(lang === 'uz' ? 'Sana va vaqtni tanlang' : lang === 'en' ? 'Please choose a date and time' : 'Выберите дату и время');
        setIsSubmitting(false);
        return;
      }
      const dateStr = selectedDate;

      // Submit to database API
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...telegramAuthHeaders() },
        body: JSON.stringify({
          patientName: clientName.trim() || (lang === 'uz' ? 'Bemor' : lang === 'en' ? 'Patient' : 'Пациент'),
          patientPhone: clientPhone.trim(),
          doctorName: selectedDoctor,
          serviceTitle: selectedService,
          dateStr,
          timeStr: selectedTimeSlot,
          consentAgreed: true,
          source: 'miniapp',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setBookingError(data.error || 'Ошибка при бронировании слота');
        setIsSubmitting(false);
        return;
      }

      // Keep the booking on this device so the home screen can show it
      saveVisit({
        id: `${Date.now().toString(36)}`,
        doctor: selectedDoctor,
        service: selectedService,
        dateStr,
        timeStr: selectedTimeSlot,
        status: 'pending',
      });

      setIsSuccess(true);

      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        if (tg.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
        try {
          const payload = {
            name: clientName.trim() || (lang === 'uz' ? 'Bemor' : lang === 'en' ? 'Patient' : 'Пациент'),
            phone: clientPhone.trim() || 'Не указан',
            service: selectedService,
            doctor: selectedDoctor,
            time: `${dateStr} ${selectedTimeSlot}`,
            source: 'Mini App 3-Step Wizard',
          };
          tg.sendData(JSON.stringify(payload));
        } catch {
          // Fallback for regular browser tests
        }
      }
    } catch {
      // Optimistic completion in offline/demo mode
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    triggerHaptic('light');
    closeAnimated(() => {
      setIsSuccess(false);
      setStep(1);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div aria-hidden="true" className={`absolute inset-0 bg-slate-950/55 ${closing ? 'about-backdrop-out' : 'about-backdrop-in'}`} />
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={resetAndClose}
      />

      {/* Modal Card / Bottom Sheet */}
      <div className={`${closing ? 'sheet-exit' : 'sheet-enter'} relative w-full max-w-lg bg-white/[0.98] border-t sm:border border-white/90 rounded-t-[32px] sm:rounded-3xl max-h-[92dvh] flex flex-col shadow-2xl z-10 overflow-hidden pb-safe`}>
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-[var(--ink)] leading-tight">
                {isSuccess ? t.successTitle[lang] : t.title[lang]}
              </h3>
              {!isSuccess && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[12px] text-[var(--ink-muted)]">
                    {step === 1 && t.step1Title[lang]}
                    {step === 2 && t.step2Title[lang]}
                    {step === 3 && t.step3Title[lang]}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className={`w-2 h-2 rounded-full transition-[transform,background-color,color,border-color,box-shadow,opacity] ${
                          step === s
                            ? 'bg-[var(--accent)] w-4'
                            : step > s
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--border)] active:scale-95 flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] transition-[transform,background-color,color,border-color,box-shadow,opacity]"
            aria-label={t.cancel[lang]}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* ========================================================
              TRIUMPH SCREEN (SUCCESS STATE)
             ======================================================== */}
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="relative w-20 h-20 mx-auto success-pop">
                <span className="success-halo absolute inset-0 rounded-full bg-emerald-400/30" aria-hidden="true" />
                <svg viewBox="0 0 80 80" className="relative w-20 h-20" aria-hidden="true">
                  <circle cx="40" cy="40" r="36" fill="#ecfdf5" stroke="#10b981" strokeWidth="3" pathLength={1} className="success-circle" />
                  <path d="M25 41 L35 51 L55 30" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="success-check" />
                </svg>
              </div>

              <div className="success-rise" style={{ animationDelay: '520ms' }}>
                <h4 className="text-xl font-bold text-[var(--ink)]">
                  {t.successTitle[lang]}
                </h4>
                <p className="text-[13px] text-[var(--ink-secondary)] mt-1 max-w-sm mx-auto">
                  {t.disclaimer[lang]}
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="success-rise bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl p-3.5 text-left space-y-2 text-[13px]" style={{ animationDelay: '640ms' }}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  {t.successDetailsTitle[lang]}
                </div>
                <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--ink-muted)]">Услуга:</span>
                  <span className="font-semibold text-right text-[var(--ink)]">
                    {selectedService}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--ink-muted)]">Врач:</span>
                  <span className="font-semibold text-[var(--ink)]">{selectedDoctor}</span>
                </div>
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--ink-muted)]">Время:</span>
                  <span className="font-semibold text-[var(--accent)]">
                    {selectedDate ? formatDayLong(selectedDate, lang) : ''}, {selectedTimeSlot}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--ink-muted)]">Адрес:</span>
                  <span className="font-medium text-right text-[var(--ink-secondary)]">
                    {config.address[lang]} ({config.landmark[lang]})
                  </span>
                </div>
              </div>

              {/* Quick Contact & Navigation Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={config.yandexMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[13px] font-semibold text-[var(--ink)] transition-[transform,background-color,color,border-color,box-shadow,opacity] touch-target"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{t.routeAction[lang]}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                </a>

                <CallButton
                  phone={config.phone}
                  display={config.phoneDisplay}
                  lang={lang}
                  title={t.callAction[lang]}
                  className="flex items-center justify-center gap-2 p-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[13px] font-semibold text-[var(--ink)] transition-[transform,background-color,color,border-color,box-shadow,opacity] touch-target"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{t.callAction[lang]}</span>
                </CallButton>
              </div>

              <a
                href={config.telegramAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[13px] font-bold text-[#0088cc] transition-[transform,background-color,color,border-color,box-shadow,opacity] touch-target"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.telegramAction[lang]}</span>
              </a>

              <button
                onClick={resetAndClose}
                className="btn-pill-primary w-full py-3.5 text-[14px] touch-target"
              >
                {t.closeSuccess[lang]}
              </button>
            </div>
          ) : (
            /* ========================================================
                PROGRESSIVE 3-STEP FORM
               ======================================================== */
            <div>
              {/* STEP 1: SERVICE & DOCTOR SELECTION */}
              {step === 1 && (
                <div className={`space-y-4 ${`step-view ${stepExiting ? (stepDir === 'next' ? 'step-out-next' : 'step-out-prev') : (stepDir === 'next' ? 'step-in-next' : 'step-in-prev')}`}`}>
                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-2">
                      {t.step1Title[lang]}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {serviceChoices.map((srv) => {
                        const isSelected = selectedService === srv.title;
                        return (
                          <button
                            type="button"
                            key={srv.id}
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedService(srv.title);
                            }}
                            className={`p-3 rounded-xl border text-left transition-[transform,background-color,color,border-color,box-shadow,opacity] relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)]'
                                : 'border-[var(--border)] bg-[var(--surface)] hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-[13px] text-[var(--ink)] leading-snug">
                                {srv.title}
                              </span>
                              {srv.isFree && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                                  0 сум
                                </span>
                              )}
                              {srv.isSos && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full shrink-0">
                                  SOS
                                </span>
                              )}
                            </div>
                            <span className="text-[12px] font-bold text-[var(--accent)] mt-1.5">
                              {srv.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Doctor Selector */}
                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-1.5">
                      {t.doctorLabel[lang]}
                    </label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => {
                        triggerHaptic('light');
                        setSelectedDoctor(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)] text-[14px] focus:border-[var(--accent)] focus:outline-none"
                    >
                      <option value={t.anyDoctor[lang]}>{t.anyDoctor[lang]}</option>
                      {catalog.doctors.map((doc) => (
                        <option key={doc.id} value={doc.name[lang]}>
                          {doc.name[lang]} — {doc.role[lang]} ({doc.experienceYears}{' '}
                          {lang === 'uz' ? 'yil' : lang === 'en' ? 'yrs' : 'лет'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn-pill-primary w-full py-3.5 text-[14px] flex items-center justify-center gap-1.5 touch-target"
                    >
                      <span>{t.nextStep[lang]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE & TIME SELECTION (live calendar + live free slots) */}
              {step === 2 && (
                <div className={`space-y-5 ${`step-view ${stepExiting ? (stepDir === 'next' ? 'step-out-next' : 'step-out-prev') : (stepDir === 'next' ? 'step-in-next' : 'step-in-prev')}`}`}>
                  <div className="clinic-card p-3.5 rounded-3xl">
                    <CalendarPicker
                      value={selectedDate}
                      lang={lang}
                      triggerHaptic={triggerHaptic}
                      onChange={(iso) => {
                        setSelectedDate(iso);
                        setSelectedTimeSlot(null);
                      }}
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-2.5 time-reveal">
                      <label className="block text-[13px] font-bold text-[var(--ink)]">
                        {formatDayLong(selectedDate, lang)}
                      </label>
                      <TimePicker
                        key={`${selectedDate}-${selectedDoctorId ?? 'any'}`}
                        dateIso={selectedDate}
                        doctorId={selectedDoctorId}
                        value={selectedTimeSlot}
                        lang={lang}
                        triggerHaptic={triggerHaptic}
                        onChange={(time) => setSelectedTimeSlot(time)}
                      />
                    </div>
                  )}

                  {/* Summary of Step 1 */}
                  <div className="bg-slate-100/80 border border-slate-200/80 p-2.5 rounded-2xl text-[12px] flex items-center justify-between">
                    <span className="text-[var(--ink-muted)]">Выбрано:</span>
                    <span className="font-semibold text-[var(--ink)] truncate max-w-[220px]">
                      {selectedService} ({selectedDoctor})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="btn-pill-secondary flex-1 py-3 text-[14px] flex items-center justify-center gap-1.5 touch-target"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t.backStep[lang]}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={step === 2 && (!selectedDate || !selectedTimeSlot)}
                      className="btn-pill-primary flex-1 py-3 text-[14px] flex items-center justify-center gap-1.5 touch-target disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <span>{t.nextStep[lang]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT INFORMATION & SUBMIT */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className={`space-y-4 ${`step-view ${stepExiting ? (stepDir === 'next' ? 'step-out-next' : 'step-out-prev') : (stepDir === 'next' ? 'step-in-next' : 'step-in-prev')}`}`}>
                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-1">
                      {t.nameLabel[lang]} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[var(--ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={t.namePlaceholder[lang]}
                        className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200/90 bg-white/90 text-[var(--ink)] text-[14px] focus:border-[var(--accent)] focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-1">
                      {t.phoneLabel[lang]} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[var(--ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        inputMode="tel"
                        required
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        placeholder="+998 (90) 123-45-67"
                        className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-slate-200/90 bg-white/90 text-[var(--ink)] font-mono text-[14px] focus:border-[var(--accent)] focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Consent checkbox for personal data processing */}
                    <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-[var(--ink-secondary)] select-none pt-1">
                      <input
                        type="checkbox"
                        required
                        checked={consentAgreed}
                        onChange={(e) => setConsentAgreed(e.target.checked)}
                        className="mt-0.5 rounded text-[var(--accent)] focus:ring-[var(--accent)] cursor-pointer"
                      />
                      <span className="leading-tight">
                        {lang === 'uz'
                          ? 'Qabulni tashkil etish uchun aloqa ma’lumotlarim (ism va telefon) qayta ishlanishiga roziman.'
                          : lang === 'en'
                          ? 'I consent to the processing of my contact details for booking management.'
                          : 'Согласен на обработку контактных данных (имя и телефон) для организации приёма.'}
                      </span>
                    </label>

                    {bookingError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-[12px] font-medium animate-in fade-in">
                        {bookingError}
                      </div>
                    )}

                    {/* Trust Reassurance Badge */}
                    <div className="bg-blue-50/90 border border-blue-200/80 p-3 rounded-2xl flex items-start gap-2.5 text-blue-950 text-[12px] leading-relaxed">
                      <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                      <span>{t.trustGuarantee[lang]}</span>
                    </div>

                  {/* Summary recap */}
                  <div className="bg-slate-100/80 border border-slate-200/80 p-3 rounded-2xl text-[12px] space-y-1 text-[var(--ink-secondary)]">
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Приём:</span>
                      <span className="font-semibold text-[var(--ink)]">{selectedService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--ink-muted)]">Дата и время:</span>
                      <span className="font-semibold text-[var(--accent)]">
                        {selectedDate ? formatDayLong(selectedDate, lang) : ''}, {selectedTimeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="btn-pill-secondary py-3.5 px-5 text-[14px] flex items-center justify-center gap-1 touch-target"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t.backStep[lang]}</span>
                    </button>
                    <button
                      type="submit"
                      className="btn-pill-primary flex-1 py-3.5 text-[14px] flex items-center justify-center gap-1.5 touch-target"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t.submitButton[lang]}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
