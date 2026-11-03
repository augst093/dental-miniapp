'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  Award,
  ChevronRight,
  CheckCircle2,
  Stethoscope,
  Users,
  Info,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import {
  SERVICES,
  DOCTORS,
  CATEGORIES,
  Language,
  ServiceItem,
  Doctor,
} from '../data/clinicData';

export default function MiniAppPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<'services' | 'doctors' | 'booking' | 'about'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Booking state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(SERVICES[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('Завтра (10:00)');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+998 ');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Auto-detect Telegram user's name
      if (tg.initDataUnsafe?.user?.first_name) {
        setClientName(tg.initDataUnsafe.user.first_name);
      }
      // Auto-detect language code if uz
      if (tg.initDataUnsafe?.user?.language_code === 'uz') {
        setLang('uz');
      }
    }
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    setIsBooked(true);

    // Send data back to Telegram bot if available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
      try {
        const payload = {
          client_name: clientName,
          phone: clientPhone,
          service: selectedService?.name[lang] || 'Консультация',
          preferred_time: bookingDate,
          doctor: selectedDoctor?.name[lang] || 'Любой свободный доктор',
          source: 'telegram_mini_app',
        };
        tg.sendData(JSON.stringify(payload));
      } catch {
        // Fallback if running outside WebApp wrapper
      }
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-xl">🦷</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base tracking-tight text-white">DentaLux</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Tashkent
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>метро Ойбек (ул. Афросиёб 12Б)</span>
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
          {(['ru', 'uz', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                triggerHaptic('light');
                setLang(l);
              }}
              className={`px-2 py-1 rounded uppercase transition-all ${
                lang === l
                  ? 'bg-teal-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 pt-3 space-y-4 max-w-lg mx-auto w-full">
        {/* Special Offer Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-900/40 via-slate-900 to-emerald-950/40 border border-teal-500/30 p-4 shadow-xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              {lang === 'uz' ? 'OY AKSIYASI' : lang === 'en' ? 'LIMITED OFFER' : 'АКЦИЯ МЕСЯЦА'}
            </span>
          </div>

          <h2 className="text-lg font-bold text-white leading-snug">
            {lang === 'uz'
              ? '3D-Tomografiya (KT) + Ko\'rik — 0 SO\'M'
              : lang === 'en'
              ? 'Free 3D CT Scan + Chief Doctor Exam'
              : 'Бесплатная 3D-томография (КТ) + Консультация главврача'}
          </h2>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {lang === 'uz'
              ? 'Telegram orqali yozilganda 350 000 so\'m tejab qoling! Barcha jag\' kompyuter rentgeni va davolash rejasi.'
              : lang === 'en'
              ? 'Save 350,000 UZS when booking via Telegram! Includes full 3D scan and tailored treatment plan.'
              : 'Сэкономьте 350 000 сум при записи через Telegram! Полный 3D-снимок челюсти Vatech и план лечения.'}
          </p>

          <button
            onClick={() => {
              triggerHaptic('medium');
              setSelectedService(SERVICES[0]);
              setActiveTab('booking');
            }}
            className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-all"
          >
            <span>{lang === 'uz' ? 'Aksiyaga yozilish' : lang === 'en' ? 'Claim Free 3D Scan' : 'Записаться по акции (0 сум)'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Switches */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900/90 border border-slate-800/90 p-1 rounded-xl">
          {[
            { id: 'services', label: { ru: 'Услуги', uz: 'Xizmatlar', en: 'Services' }, icon: Stethoscope },
            { id: 'doctors', label: { ru: 'Врачи', uz: 'Shifokorlar', en: 'Doctors' }, icon: Users },
            { id: 'booking', label: { ru: 'Запись', uz: 'Qabul', en: 'Booking' }, icon: Calendar },
            { id: 'about', label: { ru: 'Клиника', uz: 'Klinika', en: 'About' }, icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-800 text-teal-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span>{tab.label[lang]}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {/* Horizontal Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat.id);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>

            {/* Services List */}
            <div className="space-y-2.5">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    service.highlight
                      ? 'bg-teal-950/20 border-teal-500/40 shadow-md shadow-teal-500/10'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {service.badge && (
                        <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                          {service.badge[lang]}
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-white">{service.name[lang]}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-teal-400">{service.priceUzs}</div>
                      {service.priceUsd && (
                        <div className="text-[10px] text-slate-400">{service.priceUsd}</div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {service.description[lang]}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {service.duration}
                    </span>
                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        setSelectedService(service);
                        setActiveTab('booking');
                      }}
                      className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
                    >
                      <span>{lang === 'uz' ? 'Tanlash' : lang === 'en' ? 'Select' : 'Выбрать'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DOCTORS TEAM */}
        {activeTab === 'doctors' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              {lang === 'uz'
                ? 'DentaLux shifokorlari Germaniya, Shveytsariya va AQShda xalqaro malaka oshirgan.'
                : lang === 'en'
                ? 'Our doctors have undergone training in Switzerland, Germany, and the USA.'
                : 'Ведущие доктора Ташкента с европейскими сертификатами и опытом 8–16 лет.'}
            </p>

            <div className="space-y-3">
              {DOCTORS.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${doc.color} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}
                    >
                      {doc.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white truncate">{doc.name[lang]}</h3>
                        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                          {doc.experienceYears} {lang === 'uz' ? 'yil' : lang === 'en' ? 'yrs' : 'лет'}
                        </span>
                      </div>
                      <p className="text-xs text-teal-400 font-medium truncate mt-0.5">{doc.role[lang]}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    {doc.credentials[lang]}
                  </p>

                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setSelectedDoctor(doc);
                      setActiveTab('booking');
                    }}
                    className="mt-3 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-teal-300 border border-teal-500/20 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                  >
                    <span>{lang === 'uz' ? 'Shifokor qabuliga yozilish' : lang === 'en' ? 'Book with this Doctor' : 'Записаться к доктору'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKING FORM */}
        {activeTab === 'booking' && (
          <div className="space-y-4">
            {isBooked ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'uz' ? 'Arizangiz qabul qilindi!' : lang === 'en' ? 'Booking Confirmed!' : 'Заявка успешно принята!'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                  {lang === 'uz'
                    ? `Rahmat, ${clientName}! Biz siz uchun 0 so'mlik 3D-rentgen va konsultatsiyani band qildik. 10 daqiqa ichida qo'ng'iroq qilamiz.`
                    : lang === 'en'
                    ? `Thank you, ${clientName}! We reserved your free 3D scan and exam. Our receptionist will call you within 10 minutes.`
                    : `Спасибо, ${clientName}! Бесплатный 3D-снимок и осмотр забронированы. Старший администратор перезвонит Вам в течение 10 минут.`}
                </p>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left text-xs space-y-1">
                  <div><span className="text-slate-400">Услуга:</span> <span className="font-semibold text-white">{selectedService?.name[lang]}</span></div>
                  <div><span className="text-slate-400">Врач:</span> <span className="font-semibold text-white">{selectedDoctor?.name[lang] || 'Любой свободный'}</span></div>
                  <div><span className="text-slate-400">Время:</span> <span className="font-semibold text-teal-400">{bookingDate}</span></div>
                </div>
                <button
                  onClick={() => setIsBooked(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  {lang === 'uz' ? 'Yangi yozuv' : lang === 'en' ? 'New Booking' : 'Оформить еще одну запись'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                {/* Service Selector Display */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    {lang === 'uz' ? 'Tanlangan muolaja' : lang === 'en' ? 'Selected Service' : 'Выбранная процедура'}
                  </label>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{selectedService?.name[lang] || 'Консультация главврача'}</div>
                      <div className="text-xs text-teal-400 font-semibold">{selectedService?.priceUzs}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('services')}
                      className="text-xs text-slate-400 hover:text-teal-400 underline"
                    >
                      {lang === 'uz' ? 'O\'zgartirish' : lang === 'en' ? 'Change' : 'Изменить'}
                    </button>
                  </div>
                </div>

                {/* Doctor Selection */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {lang === 'uz' ? 'Shifokor' : lang === 'en' ? 'Doctor' : 'Специалист'}
                  </label>
                  <select
                    value={selectedDoctor?.id || ''}
                    onChange={(e) => {
                      const doc = DOCTORS.find((d) => d.id === e.target.value) || null;
                      setSelectedDoctor(doc);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">
                      {lang === 'uz' ? 'Ixtiyoriy bo\'sh shifokor' : lang === 'en' ? 'Any Available Doctor' : 'Любой свободный доктор'}
                    </option>
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name[lang]} ({d.role[lang]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Preferred Date / Time Slot Chips */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    {lang === 'uz' ? 'Qulay vaqt' : lang === 'en' ? 'Preferred Time' : 'Удобный день и время'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      'Сегодня после обеда',
                      'Завтра (10:00 - 14:00)',
                      'Завтра (15:00 - 20:00)',
                      'В субботу утром',
                      'В субботу днем',
                      'Уточнить при звонке',
                    ].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setBookingDate(slot);
                        }}
                        className={`p-2 rounded-lg text-center font-medium border text-[11px] transition-all ${
                          bookingDate === slot
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {lang === 'uz' ? 'Ismingiz' : lang === 'en' ? 'Your Name' : 'Ваше имя'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Алишер"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      {lang === 'uz' ? 'Telefon raqamingiz' : lang === 'en' ? 'Phone Number' : 'Номер телефона'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+998 90 123 45 67"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {lang === 'uz'
                      ? 'Qabulga yozilish (Bepul 3D-rentgen)'
                      : lang === 'en'
                      ? 'Confirm Reservation (Free 3D Scan)'
                      : 'Записаться на прием (Бесплатный 3D-снимок)'}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 4: ABOUT CLINIC & CONTACTS */}
        {activeTab === 'about' && (
          <div className="space-y-3.5">
            {/* Location & Contacts */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{lang === 'uz' ? 'Manzil va aloqa' : lang === 'en' ? 'Location & Contacts' : 'Адрес и контакты'}</span>
              </h3>

              <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                <div><b>г. Ташкент</b>, Мирабадский р-н, ул. Афросиёб, 12Б</div>
                <div className="text-teal-400 font-medium">🚇 метро Ойбек (300 м) — напротив Grand Mir Hotel</div>
                <div className="text-slate-400">🕒 Пн - Сб: 09:00 - 20:00 (Вс - выходной)</div>
                <div className="text-slate-400">🚗 Бесплатная охраняемая парковка для пациентов</div>
              </div>

              <div className="pt-2 flex gap-2">
                <a
                  href="https://yandex.uz/maps/-/CDuWjF8A"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <span>Яндекс.Карты</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href="tel:+998712004488"
                  className="flex-1 py-2 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Позвонить</span>
                </a>
              </div>
            </div>

            {/* Installments & Tech Badges */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-400 font-bold text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Рассрочка 0%</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  До 12 месяцев через Uzum Nasiya, Anorbank, Zoodpay без переплат.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Стерильность 100%</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Немецкие автоклавы Melag класса B, вскрытие пакета при вас.
                </p>
              </div>
            </div>

            {/* Equipment Showcase */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span>Оборудование экспертного уровня</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Дентальный микроскоп <b>Carl Zeiss</b> (Германия) с 25x увеличением</li>
                <li>3D-компьютерный томограф <b>Vatech</b> с минимальной лучевой нагрузкой</li>
                <li>Компьютерная деликатная анестезия (безболезненный укол)</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Quick Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 p-3 z-40 max-w-lg mx-auto">
        <div className="flex gap-2">
          <a
            href="tel:+998712004488"
            className="w-12 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0 transition-all"
          >
            <Phone className="w-5 h-5" />
          </a>
          <button
            onClick={() => {
              triggerHaptic('medium');
              setActiveTab('booking');
            }}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>
              {lang === 'uz' ? 'Qabulga yozilish (0 so\'m)' : lang === 'en' ? 'Book Appointment (Free)' : 'Записаться на прием (Бесплатно)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
