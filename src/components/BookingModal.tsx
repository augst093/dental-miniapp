'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Check,
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
  DOCTORS,
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

const TIME_SLOTS = ['10:00', '12:30', '14:30', '16:30', '18:30', '20:00'];

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
  const [selectedService, setSelectedService] = useState<string>(
    initialService || QUICK_SERVICES[lang][0].title
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    initialDoctor || t.anyDoctor[lang]
  );
  const [selectedDayPreset, setSelectedDayPreset] = useState<'today' | 'tomorrow' | 'weekend'>('today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('12:30');
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
      setIsSuccess(false);
      setStep(1);
      onClose();
      return;
    }

    if (step === 3) {
      triggerHaptic('light');
      setStep(2);
    } else if (step === 2) {
      triggerHaptic('light');
      setStep(1);
    } else {
      triggerHaptic('light');
      onClose();
    }
  }, [step, isSuccess, onClose, triggerHaptic]);

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
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAgreed) return;

    triggerHaptic('heavy');
    setIsSubmitting(true);
    setBookingError(null);

    try {
      // Determine target ISO date based on day preset
      const now = new Date();
      const nowTashkent = new Date(now.getTime() + 5 * 60 * 60 * 1000);
      const targetDate = new Date(nowTashkent);
      if (selectedDayPreset === 'tomorrow') {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (selectedDayPreset === 'weekend') {
        const day = targetDate.getDay();
        const daysUntilSat = (6 - day + 7) % 7 || 7;
        targetDate.setDate(targetDate.getDate() + daysUntilSat);
      }
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, '0');
      const d = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      // Submit to database API
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    setIsSuccess(false);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={resetAndClose}
      />

      {/* Modal Card / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border-t sm:border border-white/90 rounded-t-[32px] sm:rounded-3xl max-h-[92dvh] flex flex-col shadow-2xl z-10 overflow-hidden pb-safe">
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
                        className={`w-2 h-2 rounded-full transition-all ${
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
            className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] hover:bg-[var(--border)] active:scale-95 flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] transition-all"
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
            <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-[var(--ink)]">
                  {t.successTitle[lang]}
                </h4>
                <p className="text-[13px] text-[var(--ink-secondary)] mt-1 max-w-sm mx-auto">
                  {t.disclaimer[lang]}
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-[var(--surface-subtle)] border border-[var(--border)] rounded-xl p-3.5 text-left space-y-2 text-[13px]">
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
                    {selectedDayPreset === 'today'
                      ? 'Сегодня'
                      : selectedDayPreset === 'tomorrow'
                      ? 'Завтра'
                      : 'В выходные'}
                    , {selectedTimeSlot}
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
                  className="flex items-center justify-center gap-2 p-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[13px] font-semibold text-[var(--ink)] transition-all touch-target"
                >
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{t.routeAction[lang]}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                </a>

                <a
                  href={`tel:${config.phone}`}
                  className="flex items-center justify-center gap-2 p-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[13px] font-semibold text-[var(--ink)] transition-all touch-target"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{t.callAction[lang]}</span>
                </a>
              </div>

              <a
                href={config.telegramAdminUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-full bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[13px] font-bold text-[#0088cc] transition-all touch-target"
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
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-2">
                      {t.step1Title[lang]}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {QUICK_SERVICES[lang].map((srv) => {
                        const isSelected = selectedService === srv.title;
                        return (
                          <button
                            type="button"
                            key={srv.id}
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedService(srv.title);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
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
                      {DOCTORS.map((doc) => (
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

              {/* STEP 2: DATE & TIME SELECTION */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-2">
                      {t.dayLabel[lang]}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'today', label: lang === 'uz' ? 'Bugun' : lang === 'en' ? 'Today' : 'Сегодня', sub: 'В день визита' },
                        { id: 'tomorrow', label: lang === 'uz' ? 'Ertaga' : lang === 'en' ? 'Tomorrow' : 'Завтра', sub: 'С утра / днём' },
                        { id: 'weekend', label: lang === 'uz' ? 'Dam olishda' : lang === 'en' ? 'Weekend' : 'В выходные', sub: 'Сб или Вс' },
                      ].map((item) => {
                        const isSelected = selectedDayPreset === item.id;
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedDayPreset(item.id as 'today' | 'tomorrow' | 'weekend');
                            }}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              isSelected
                                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] font-bold text-[var(--accent)] ring-1 ring-[var(--accent)]'
                                : 'border-slate-200/80 bg-white/80 text-[var(--ink-secondary)] hover:border-slate-300'
                            }`}
                          >
                            <div className="text-[13px] font-semibold">{item.label}</div>
                            <div className="text-[10px] text-[var(--ink-muted)] mt-0.5">{item.sub}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-bold text-[var(--ink)] mb-2">
                      {t.timeLabel[lang]}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTimeSlot === slot;
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => {
                              triggerHaptic('light');
                              setSelectedTimeSlot(slot);
                            }}
                            className={`py-2.5 px-2 rounded-full border text-[13px] font-semibold transition-all ${
                              isSelected
                                ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-blue-600/25'
                                : 'bg-white/80 border-slate-200/80 text-[var(--ink)] hover:border-slate-300'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
                      className="btn-pill-primary flex-1 py-3 text-[14px] flex items-center justify-center gap-1.5 touch-target"
                    >
                      <span>{t.nextStep[lang]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT INFORMATION & SUBMIT */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-200">
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
                        {selectedDayPreset === 'today'
                          ? 'Сегодня'
                          : selectedDayPreset === 'tomorrow'
                          ? 'Завтра'
                          : 'В выходные'}
                        , {selectedTimeSlot}
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
