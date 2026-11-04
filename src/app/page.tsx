'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  Layers,
  Calculator,
  Users,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ChevronRight,
  Check,
  X,
  Plus,
  Minus,
  Search,
  Calendar,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import {
  SERVICES,
  DOCTORS,
  CATEGORIES,
  Language,
  ServiceItem,
  Doctor,
} from '../data/clinicData';

type TabType = 'home' | 'services' | 'calculator' | 'doctors' | 'contacts';

interface CalculatorPlan {
  id: string;
  name: Record<Language, string>;
  category: string;
  basePriceUzs: number;
  basePriceUsd: number;
  unitLabel: Record<Language, string>;
  note: Record<Language, string>;
}

const CALCULATOR_PLANS: CalculatorPlan[] = [
  {
    id: 'straumann',
    category: 'implants',
    name: {
      ru: 'Имплант Straumann BLX (Швейцария)',
      uz: 'Straumann BLX implantati (Shveytsariya)',
      en: 'Straumann BLX Implant (Switzerland)',
    },
    basePriceUzs: 7500000,
    basePriceUsd: 600,
    unitLabel: { ru: 'имплант', uz: 'implant', en: 'implant' },
    note: {
      ru: 'Пожизненная международная гарантия Straumann Group.',
      uz: 'Straumann Group umrbod xalqaro kafolati.',
      en: 'Lifetime international warranty by Straumann Group.',
    },
  },
  {
    id: 'osstem',
    category: 'implants',
    name: {
      ru: 'Имплант Osstem TS III (Южная Корея)',
      uz: 'Osstem TS III implantati (Janubiy Koreya)',
      en: 'Osstem TS III Implant (South Korea)',
    },
    basePriceUzs: 4200000,
    basePriceUsd: 335,
    unitLabel: { ru: 'имплант', uz: 'implant', en: 'implant' },
    note: {
      ru: 'Проверенная система с приживаемостью 98.8%.',
      uz: '98.8% bitish ko‘rsatkichiga ega ishonchli tizim.',
      en: 'Proven implant system with 98.8% success rate.',
    },
  },
  {
    id: 'damon-q2',
    category: 'brackets',
    name: {
      ru: 'Брекеты Damon Q2 металлические (США)',
      uz: 'Damon Q2 metall breketlari (AQSh)',
      en: 'Damon Q2 Metal Braces (USA)',
    },
    basePriceUzs: 7500000,
    basePriceUsd: 600,
    unitLabel: { ru: 'челюсть', uz: 'jag‘', en: 'arch' },
    note: {
      ru: 'Самолигирующая система: лечение без удаления здоровых зубов.',
      uz: 'O‘zi ligirlanuvchi tizim: tish sug‘urmasdan tekislash.',
      en: 'Self-ligating system: fast correction without extractions.',
    },
  },
  {
    id: 'emax',
    category: 'veneers',
    name: {
      ru: 'Керамические виниры E.max (Германия)',
      uz: 'E.max keramik vinirlari (Germaniya)',
      en: 'E.max Ceramic Veneers (Germany)',
    },
    basePriceUzs: 3100000,
    basePriceUsd: 250,
    unitLabel: { ru: 'винир', uz: 'vinir', en: 'unit' },
    note: {
      ru: 'Прессованная керамика Ivoclar Vivadent с ручной эстетикой.',
      uz: 'Ivoclar Vivadent presslangan keramikasi.',
      en: 'Pressed Ivoclar Vivadent ceramic with natural translucency.',
    },
  },
  {
    id: 'caries',
    category: 'therapy',
    name: {
      ru: 'Лечение кариеса под микроскопом',
      uz: 'Kariesni mikroskop ostida davolash',
      en: 'Microscopic Caries Treatment',
    },
    basePriceUzs: 550000,
    basePriceUsd: 44,
    unitLabel: { ru: 'зуб', uz: 'tish', en: 'tooth' },
    note: {
      ru: 'Японский нанокомпозит Tokuyama Estelite.',
      uz: 'Tokuyama Estelite yapon nanokompoziti.',
      en: 'Japanese nanohybrid composite Tokuyama Estelite.',
    },
  },
];

export default function DentalMiniApp() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator State
  const [calcPlanIdx, setCalcPlanIdx] = useState<number>(0);
  const [calcUnits, setCalcUnits] = useState<number>(1);

  // Booking Sheet State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingService, setBookingService] = useState<string>('Первичный осмотр + 3D-снимок (КТ)');
  const [bookingDoctor, setBookingDoctor] = useState<string>('Д-р Сардор Каримов (Главврач)');
  const [bookingDate, setBookingDate] = useState<string>('today');
  const [bookingTime, setBookingTime] = useState<string>('12:30');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+998 ');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user?.first_name) {
        setClientName(tg.initDataUnsafe.user.first_name);
      }
      if (tg.initDataUnsafe?.user?.language_code === 'uz') {
        setLang('uz');
      }
    }
  }, []);

  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const switchTab = (tab: TabType) => {
    triggerHaptic('light');
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openBooking = (service: string, doctor?: string) => {
    triggerHaptic('medium');
    setBookingService(service);
    if (doctor) setBookingDoctor(doctor);
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    setIsSubmitted(true);

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
      try {
        const dateText = bookingDate === 'today' ? 'Сегодня' : bookingDate === 'tomorrow' ? 'Завтра' : 'Суббота';
        const payload = {
          name: clientName.trim() || 'Пациент',
          phone: clientPhone.trim() || 'Не указан',
          service: bookingService,
          doctor: bookingDoctor,
          date: `${dateText} в ${bookingTime}`,
          lang: lang,
        };
        tg.sendData(JSON.stringify(payload));
      } catch (err) {
        console.log('TG sendData skipped:', err);
      }
    }
  };

  // Filtered Services
  const filteredServices = SERVICES.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesQuery =
      s.name[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description[lang].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const selectedPlan = CALCULATOR_PLANS[calcPlanIdx];
  const totalPriceUzs = selectedPlan.basePriceUzs * calcUnits;
  const totalPriceUsd = selectedPlan.basePriceUsd * calcUnits;
  const monthlyInstallmentUzs = Math.round(totalPriceUzs / 12);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#111827] flex flex-col font-sans selection:bg-[#1B4332] selection:text-white pb-28">
      
      {/* ========================================================
          1. APPLE TOP NAVIGATION BAR (Clean, quiet, confident)
         ======================================================== */}
      <header className="sticky top-0 z-30 bg-[#F7F6F2]/90 backdrop-blur-xl border-b border-black/[0.06] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[17px] tracking-tight text-[#111827]">DentaLux</span>
              <span className="text-[11px] text-[#1B4332] font-semibold bg-[#1B4332]/10 px-2 py-0.5 rounded-full">
                09:00—21:00
              </span>
            </div>
            <p className="text-[12px] text-[#6B7280]">
              {lang === 'ru' && 'Ташкент · м. Ойбек'}
              {lang === 'uz' && 'Toshkent · Oybek m.'}
              {lang === 'en' && 'Tashkent · Oybek Metro'}
            </p>
          </div>

          {/* iOS Segmented Language Switcher */}
          <div className="flex bg-black/[0.06] p-0.5 rounded-lg text-[11px] font-semibold">
            {(['ru', 'uz', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  triggerHaptic('light');
                  setLang(l);
                }}
                className={`px-2.5 py-1 rounded-[6px] transition-all ios-press ${
                  lang === l
                    ? 'bg-white text-[#111827] shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {l === 'ru' ? 'RU' : l === 'uz' ? 'UZ' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN TAB CONTENT
         ======================================================== */}
      <main className="flex-1 px-4 pt-4 max-w-md mx-auto w-full space-y-5">
        
        {/* ========================================================
            TAB 1: ГЛАВНАЯ (PATIENT DASHBOARD / TODAY)
           ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Primary Action: Consultation Pass (High utility, zero slop) */}
            <div className="ios-card rounded-2xl p-5 border border-black/[0.08] relative overflow-hidden bg-white">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B4332] bg-[#1B4332]/10 px-2.5 py-1 rounded-md">
                  {lang === 'ru' && 'Первичный приём'}
                  {lang === 'uz' && 'Birlamchi qabul'}
                  {lang === 'en' && 'Initial Consultation'}
                </span>
                <span className="text-[12px] font-semibold text-[#6B7280]">
                  45 {lang === 'ru' ? 'мин' : lang === 'uz' ? 'daq' : 'min'}
                </span>
              </div>

              <h1 className="text-[19px] font-bold leading-snug text-[#111827] mb-2">
                {lang === 'ru' && 'Осмотр главврача и 3D-томография (КТ)'}
                {lang === 'uz' && 'Bosh shifokor ko‘rigi va 3D-tomografiya (KT)'}
                {lang === 'en' && 'Chief Doctor Exam & 3D CT Scan'}
              </h1>

              <p className="text-[13px] text-[#4B5563] leading-relaxed mb-4">
                {lang === 'ru' && 'Компьютерная томография обеих челюстей на аппарате Vatech, детальный осмотр полости рта и прозрачный план лечения.'}
                {lang === 'uz' && 'Vatech apparatida butun jag‘ 3D-tomografiyasi va shifokorlar bilan aniq davolash rejasi.'}
                {lang === 'en' && 'Full jaw 3D CT scan using Vatech scanner + comprehensive consultation with treatment roadmap.'}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
                <div>
                  <div className="text-[11px] text-[#6B7280]">{lang === 'ru' ? 'Стоимость' : lang === 'uz' ? 'Narxi' : 'Cost'}</div>
                  <div className="text-[16px] font-bold text-[#1B4332]">
                    0 сум <span className="text-[12px] line-through font-normal text-[#9CA3AF]">350 000 сум</span>
                  </div>
                </div>

                <button
                  onClick={() => openBooking(
                    lang === 'ru' ? 'Осмотр главврача + 3D-снимок (КТ) — 0 сум' : 'Bosh shifokor ko‘rigi + 3D-KT (0 so‘m)'
                  )}
                  className="bg-[#1B4332] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#143326] ios-press transition-colors shadow-xs"
                >
                  {lang === 'ru' && 'Записаться'}
                  {lang === 'uz' && 'Yozilish'}
                  {lang === 'en' && 'Book Appointment'}
                </button>
              </div>
            </div>

            {/* Quick Navigation Inset Group */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] px-1 mb-2">
                {lang === 'ru' && 'Разделы клиники'}
                {lang === 'uz' && 'Klinika bo‘limlari'}
                {lang === 'en' && 'Sections'}
              </div>

              <div className="ios-card rounded-2xl divide-y divide-black/[0.06] overflow-hidden">
                <button
                  onClick={() => switchTab('services')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] text-left transition-colors ios-press"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F0EEE9] flex items-center justify-center text-[#1B4332]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#111827]">
                        {lang === 'ru' && 'Прейскурант и услуги'}
                        {lang === 'uz' && 'Xizmatlar va narxlar'}
                        {lang === 'en' && 'Services & Pricing'}
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        {lang === 'ru' && '30+ процедур с прозрачной стоимостью'}
                        {lang === 'uz' && '30 dan ortiq davolash turlari'}
                        {lang === 'en' && '30+ transparent medical procedures'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </button>

                <button
                  onClick={() => switchTab('calculator')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] text-left transition-colors ios-press"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F0EEE9] flex items-center justify-center text-[#1B4332]">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#111827]">
                        {lang === 'ru' && 'Калькулятор сметы'}
                        {lang === 'uz' && 'Narx kalkulyatori'}
                        {lang === 'en' && 'Cost Calculator'}
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        {lang === 'ru' && 'Расчёт имплантации, брекетов и виниров'}
                        {lang === 'uz' && 'Implant, breket va vinirlar hisobi'}
                        {lang === 'en' && 'Estimate implants, braces & veneers'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </button>

                <button
                  onClick={() => switchTab('doctors')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-black/[0.02] text-left transition-colors ios-press"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F0EEE9] flex items-center justify-center text-[#1B4332]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-[#111827]">
                        {lang === 'ru' && 'Врачи клиники'}
                        {lang === 'uz' && 'Shifokorlar jamoasi'}
                        {lang === 'en' && 'Medical Specialists'}
                      </div>
                      <div className="text-[12px] text-[#6B7280]">
                        {lang === 'ru' && 'Хирурги, ортодонты и терапевты (стаж 8–16 лет)'}
                        {lang === 'uz' && 'Xirurglar va ortodontlar (8-16 yil tajriba)'}
                        {lang === 'en' && 'Senior surgeons & orthodontists'}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>
            </div>

            {/* Inset Group: Key Clinical Protocols */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] px-1 mb-2">
                {lang === 'ru' && 'Основные направления'}
                {lang === 'uz' && 'Asosiy yo‘nalishlar'}
                {lang === 'en' && 'Key Treatments'}
              </div>

              <div className="ios-card rounded-2xl divide-y divide-black/[0.06] overflow-hidden">
                <div
                  onClick={() => openBooking('Имплантация Straumann BLX')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition-colors ios-press"
                >
                  <div className="pr-3">
                    <div className="text-[14px] font-semibold text-[#111827]">
                      {lang === 'ru' && 'Имплантация Straumann (Швейцария)'}
                      {lang === 'uz' && 'Straumann implantatsiyasi (Shveytsariya)'}
                      {lang === 'en' && 'Straumann Implant (Switzerland)'}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      {lang === 'ru' && 'Пожизненная международная гарантия'}
                      {lang === 'uz' && 'Umrbod xalqaro kafolat'}
                      {lang === 'en' && 'Lifetime international warranty'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-bold text-[#111827] tabular">от 7 500 000 сум</div>
                    <div className="text-[11px] text-[#6B7280]">$600</div>
                  </div>
                </div>

                <div
                  onClick={() => openBooking('Брекеты Damon Q2')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition-colors ios-press"
                >
                  <div className="pr-3">
                    <div className="text-[14px] font-semibold text-[#111827]">
                      {lang === 'ru' && 'Брекеты Damon Q2 (США)'}
                      {lang === 'uz' && 'Damon Q2 breketlari (AQSh)'}
                      {lang === 'en' && 'Damon Q2 Braces (USA)'}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      {lang === 'ru' && 'Выравнивание без удаления зубов'}
                      {lang === 'uz' && 'Tish sug‘urmasdan tekislash'}
                      {lang === 'en' && 'Non-extraction self-ligating'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-bold text-[#111827] tabular">от 7 500 000 сум</div>
                    <div className="text-[11px] text-[#6B7280]">$600 / челюсть</div>
                  </div>
                </div>

                <div
                  onClick={() => openBooking('Керамические виниры E.max')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition-colors ios-press"
                >
                  <div className="pr-3">
                    <div className="text-[14px] font-semibold text-[#111827]">
                      {lang === 'ru' && 'Керамические виниры E.max'}
                      {lang === 'uz' && 'E.max keramik vinirlari'}
                      {lang === 'en' && 'E.max Ceramic Veneers'}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      {lang === 'ru' && 'Прессованная немецкая керамика Ivoclar'}
                      {lang === 'uz' && 'Ivoclar presslangan nemis keramikasi'}
                      {lang === 'en' && 'German Ivoclar pressed ceramic'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-bold text-[#111827] tabular">от 3 100 000 сум</div>
                    <div className="text-[11px] text-[#6B7280]">$250 / ед.</div>
                  </div>
                </div>

                <div
                  onClick={() => openBooking('Профессиональная гигиена AirFlow')}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] transition-colors ios-press"
                >
                  <div className="pr-3">
                    <div className="text-[14px] font-semibold text-[#111827]">
                      {lang === 'ru' && 'Профессиональная гигиена AirFlow'}
                      {lang === 'uz' && 'AirFlow professional tozalash'}
                      {lang === 'en' && 'AirFlow Prophylaxis'}
                    </div>
                    <div className="text-[12px] text-[#6B7280]">
                      {lang === 'ru' && 'Швейцарский протокол снятия налёта'}
                      {lang === 'uz' && 'Og‘riqsiz tish toshlarini tozalash'}
                      {lang === 'en' && 'Gentle biofilm and calculus removal'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-bold text-[#111827] tabular">650 000 сум</div>
                    <div className="text-[11px] text-[#6B7280]">$50</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inset Group: Standards & Financial Options */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] px-1 mb-2">
                {lang === 'ru' && 'Стандарты и гарантии'}
                {lang === 'uz' && 'Kafolat va qulayliklar'}
                {lang === 'en' && 'Standards & Terms'}
              </div>

              <div className="ios-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      {lang === 'ru' && 'Официальный договор и гарантия'}
                      {lang === 'uz' && 'Rasmiy shartnoma va kafolat'}
                      {lang === 'en' && 'Official Contract & Warranty'}
                    </div>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed">
                      {lang === 'ru' && 'Фиксируем смету в договоре до начала лечения. Никаких скрытых платежей.'}
                      {lang === 'uz' && 'Davolash narxi boshlanishidan oldin shartnomada qat’iy belgilanadi.'}
                      {lang === 'en' && 'Fixed pricing agreed upon before treatment starts with no hidden fees.'}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-black/[0.06]" />

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] shrink-0 mt-0.5 font-bold text-[10px]">
                    0%
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#111827]">
                      {lang === 'ru' && 'Рассрочка без процентов до 12 месяцев'}
                      {lang === 'uz' && '12 oygacha foizsiz muddatli to‘lov'}
                      {lang === 'en' && '0% Interest Installments up to 12 mo.'}
                    </div>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed">
                      {lang === 'ru' && 'Партнёрство с Uzum Nasiya, Anorbank и Paymart. Оформление за 2 минуты в клинике.'}
                      {lang === 'uz' && 'Uzum Nasiya, Anorbank va Paymart orqali 2 daqiqada rasmiylashtirish.'}
                      {lang === 'en' && 'Available via Uzum Nasiya and local banks right at the reception.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: УСЛУГИ И ЦЕНЫ (SERVICES CATALOG)
           ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Apple Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'ru' ? 'Поиск услуги или процедуры...' : lang === 'uz' ? 'Xizmat yoki davolashni qidirish...' : 'Search procedure...'
                }
                className="w-full pl-9 pr-8 py-2.5 bg-black/[0.05] rounded-xl text-[14px] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#111827]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills (No Scrollbar) */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors ios-press ${
                    selectedCategory === cat.id
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-black/[0.05] text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>

            {/* Services Inset List */}
            <div className="ios-card rounded-2xl divide-y divide-black/[0.06] overflow-hidden">
              {filteredServices.length === 0 ? (
                <div className="p-8 text-center text-[#6B7280] text-[13px]">
                  {lang === 'ru' && 'По вашему запросу ничего не найдено.'}
                  {lang === 'uz' && 'Hech narsa topilmadi.'}
                  {lang === 'en' && 'No procedures match your search.'}
                </div>
              ) : (
                filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-3.5 hover:bg-black/[0.01] transition-colors flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[14px] font-semibold text-[#111827] leading-snug">
                          {service.name[lang]}
                        </div>
                        <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">
                          {service.description[lang]}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[13px] font-bold text-[#111827] tabular">
                          {service.priceUzs}
                        </div>
                        {service.priceUsd && (
                          <div className="text-[11px] text-[#6B7280]">{service.priceUsd}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#9CA3AF] font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration}
                      </span>

                      <button
                        onClick={() => openBooking(service.name[lang])}
                        className="text-[12px] font-semibold text-[#1B4332] bg-[#1B4332]/10 hover:bg-[#1B4332]/15 px-3 py-1.5 rounded-lg transition-colors ios-press"
                      >
                        {lang === 'ru' && 'Выбрать время'}
                        {lang === 'uz' && 'Vaqt tanlash'}
                        {lang === 'en' && 'Select Time'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 3: КАЛЬКУЛЯТОР СМЕТЫ (ACCURATE COST CALCULATOR)
           ======================================================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="ios-card rounded-2xl p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                {lang === 'ru' && '1. Выберите протокол лечения'}
                {lang === 'uz' && '1. Davolash turini tanlang'}
                {lang === 'en' && '1. Select Treatment'}
              </div>

              <div className="space-y-1.5">
                {CALCULATOR_PLANS.map((plan, idx) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setCalcPlanIdx(idx);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ios-press ${
                      calcPlanIdx === idx
                        ? 'border-[#1B4332] bg-[#1B4332]/5'
                        : 'border-black/[0.06] hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[#111827]">
                        {plan.name[lang]}
                      </span>
                      <span className="text-[13px] font-bold text-[#1B4332] tabular">
                        {plan.basePriceUzs.toLocaleString('ru-RU')} сум
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">
                      {plan.note[lang]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Units Stepper Card */}
            <div className="ios-card rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#111827]">
                  {lang === 'ru' && 'Количество:'}
                  {lang === 'uz' && 'Soni:'}
                  {lang === 'en' && 'Quantity:'}
                </div>
                <div className="text-[12px] text-[#6B7280]">
                  {selectedPlan.unitLabel[lang]}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (calcUnits > 1) {
                      triggerHaptic('light');
                      setCalcUnits(calcUnits - 1);
                    }
                  }}
                  disabled={calcUnits <= 1}
                  className="w-9 h-9 rounded-xl bg-black/[0.05] disabled:opacity-40 flex items-center justify-center text-[#111827] font-bold ios-press"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="text-[16px] font-bold tabular w-6 text-center">
                  {calcUnits}
                </span>

                <button
                  onClick={() => {
                    if (calcUnits < 28) {
                      triggerHaptic('light');
                      setCalcUnits(calcUnits + 1);
                    }
                  }}
                  className="w-9 h-9 rounded-xl bg-black/[0.05] flex items-center justify-center text-[#111827] font-bold ios-press"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Estimate Breakdown Card */}
            <div className="ios-card rounded-2xl p-4 bg-[#1B4332] text-white">
              <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold mb-1">
                {lang === 'ru' && 'Предварительная смета'}
                {lang === 'uz' && 'Taxminiy hisob-kitob'}
                {lang === 'en' && 'Total Treatment Estimate'}
              </div>

              <div className="text-[24px] font-bold tabular mb-1">
                {totalPriceUzs.toLocaleString('ru-RU')} сум
              </div>

              <div className="text-[12px] text-white/80 tabular mb-4">
                ≈ ${totalPriceUsd.toLocaleString('en-US')}
              </div>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[12px]">
                <span className="text-white/80">
                  {lang === 'ru' && 'В рассрочку на 12 мес:'}
                  {lang === 'uz' && '12 oyga bo‘lib to‘lash:'}
                  {lang === 'en' && '12 months installment:'}
                </span>
                <span className="font-bold tabular">
                  {monthlyInstallmentUzs.toLocaleString('ru-RU')} сум / мес
                </span>
              </div>

              <button
                onClick={() => openBooking(
                  `${selectedPlan.name[lang]} (${calcUnits} ${selectedPlan.unitLabel[lang]}) — ${totalPriceUzs.toLocaleString('ru-RU')} сум`
                )}
                className="w-full mt-4 bg-white text-[#1B4332] font-semibold text-[13px] py-3 rounded-xl hover:bg-white/95 transition-colors ios-press shadow-sm"
              >
                {lang === 'ru' && 'Зафиксировать смету и записаться'}
                {lang === 'uz' && 'Narxni saqlab qabulga yozilish'}
                {lang === 'en' && 'Lock this price & book'}
              </button>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: ВРАЧИ КЛИНИКИ (DOCTORS DIRECTORY)
           ======================================================== */}
        {activeTab === 'doctors' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="text-[12px] text-[#6B7280] px-1">
              {lang === 'ru' && 'Все специалисты клиники проходят регулярную сертификацию в Швейцарии и Германии.'}
              {lang === 'uz' && 'Barcha shifokorlar Shveytsariya va Germaniyada malaka oshirgan.'}
              {lang === 'en' && 'All our specialists are certified by European dental associations.'}
            </div>

            <div className="space-y-3">
              {DOCTORS.map((doc) => (
                <div key={doc.id} className="ios-card rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-bold text-[14px] shrink-0">
                      {doc.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-[#111827]">
                        {doc.name[lang]}
                      </div>
                      <div className="text-[12px] text-[#1B4332] font-medium leading-snug mt-0.5">
                        {doc.role[lang]}
                      </div>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        {lang === 'ru' && `Стаж практики: ${doc.experienceYears} лет`}
                        {lang === 'uz' && `Ish staji: ${doc.experienceYears} yil`}
                        {lang === 'en' && `Experience: ${doc.experienceYears} years`}
                      </div>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#4B5563] leading-relaxed bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.04]">
                    {doc.credentials[lang]}
                  </p>

                  <button
                    onClick={() => openBooking(
                      lang === 'ru' ? `Консультация: ${doc.name[lang]}` : `Qabul: ${doc.name[lang]}`,
                      doc.name[lang]
                    )}
                    className="w-full text-center py-2.5 text-[12px] font-semibold text-[#1B4332] bg-[#1B4332]/10 hover:bg-[#1B4332]/15 rounded-xl transition-colors ios-press"
                  >
                    {lang === 'ru' && 'Записаться к доктору'}
                    {lang === 'uz' && 'Shifokor qabuliga yozilish'}
                    {lang === 'en' && 'Book with this doctor'}
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 5: КЛИНИКА И КОНТАКТЫ (CLINIC & ADDRESS)
           ======================================================== */}
        {activeTab === 'contacts' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            <div className="ios-card rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[14px] font-bold text-[#111827]">
                    {lang === 'ru' && 'Адрес клиники'}
                    {lang === 'uz' && 'Klinika manzili'}
                    {lang === 'en' && 'Clinic Location'}
                  </div>
                  <div className="text-[13px] text-[#4B5563] mt-0.5 leading-snug">
                    {lang === 'ru' && 'г. Ташкент, Мирабадский район, ул. Мирабад, д. 21'}
                    {lang === 'uz' && 'Toshkent sh., Mirobod tumani, Mirobod ko‘chasi, 21-uy'}
                    {lang === 'en' && '21 Mirabad Street, Mirabad District, Tashkent'}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-1">
                    {lang === 'ru' && 'Ориентир: метро Ойбек, отель Grand Mir. Собственная парковка для пациентов.'}
                    {lang === 'uz' && 'Mo‘ljal: Oybek metrosi, Grand Mir mehmonxonasi. Bemorlar uchun bepul avtoturargoh.'}
                    {lang === 'en' && 'Landmark: Oybek Metro, Grand Mir Hotel. Dedicated patient parking.'}
                  </div>
                </div>
              </div>

              <div className="h-px bg-black/[0.06]" />

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[14px] font-bold text-[#111827]">
                    {lang === 'ru' && 'Режим работы'}
                    {lang === 'uz' && 'Ish vaqti'}
                    {lang === 'en' && 'Working Hours'}
                  </div>
                  <div className="text-[13px] text-[#4B5563] mt-0.5">
                    {lang === 'ru' && 'Понедельник — Воскресенье: с 09:00 до 21:00'}
                    {lang === 'uz' && 'Dushanba — Yakshanba: 09:00 dan 21:00 gacha'}
                    {lang === 'en' && 'Monday — Sunday: 09:00 — 21:00'}
                  </div>
                  <div className="text-[11px] text-[#1B4332] font-semibold mt-0.5">
                    {lang === 'ru' && 'Без выходных и перерывов'}
                    {lang === 'uz' && 'Dam olish kunlarisiz'}
                    {lang === 'en' && 'Open 7 days a week'}
                  </div>
                </div>
              </div>

              <div className="h-px bg-black/[0.06]" />

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#1B4332] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[14px] font-bold text-[#111827]">
                    {lang === 'ru' && 'Служба заботы'}
                    {lang === 'uz' && 'Bog‘lanish'}
                    {lang === 'en' && 'Direct Line'}
                  </div>
                  <div className="text-[13px] text-[#4B5563] mt-0.5 tabular">
                    +998 (71) 200-00-00 · +998 (90) 123-45-67
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <a
                href="https://yandex.com/maps"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-black/[0.08] text-[13px] font-semibold text-[#111827] hover:bg-black/[0.02] transition-colors ios-press shadow-xs"
              >
                <MapPin className="w-4 h-4 text-[#1B4332]" />
                <span>{lang === 'ru' ? 'Маршрут в Яндекс Картах' : lang === 'uz' ? 'Yandex Xaritada ko‘rish' : 'Open in Yandex Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </a>

              <a
                href="tel:+998712000000"
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#1B4332] text-white text-[13px] font-semibold hover:bg-[#143326] transition-colors ios-press shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>{lang === 'ru' ? 'Позвонить в регистратуру' : lang === 'uz' ? 'Qo‘ng‘iroq qilish' : 'Call Reception'}</span>
              </a>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================
          3. AUTHENTIC APPLE TAB BAR (Fixed bottom dock)
         ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 ios-tabbar pb-safe">
        <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
          
          <button
            onClick={() => switchTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ios-press ${
              activeTab === 'home' ? 'text-[#1B4332]' : 'text-[#8E8E93]'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-semibold mt-1">
              {lang === 'ru' ? 'Главная' : lang === 'uz' ? 'Asosiy' : 'Home'}
            </span>
          </button>

          <button
            onClick={() => switchTab('services')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ios-press ${
              activeTab === 'services' ? 'text-[#1B4332]' : 'text-[#8E8E93]'
            }`}
          >
            <Layers className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-semibold mt-1">
              {lang === 'ru' ? 'Услуги' : lang === 'uz' ? 'Xizmatlar' : 'Services'}
            </span>
          </button>

          <button
            onClick={() => switchTab('calculator')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ios-press ${
              activeTab === 'calculator' ? 'text-[#1B4332]' : 'text-[#8E8E93]'
            }`}
          >
            <Calculator className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-semibold mt-1">
              {lang === 'ru' ? 'Расчёт' : lang === 'uz' ? 'Hisob' : 'Estimate'}
            </span>
          </button>

          <button
            onClick={() => switchTab('doctors')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ios-press ${
              activeTab === 'doctors' ? 'text-[#1B4332]' : 'text-[#8E8E93]'
            }`}
          >
            <Users className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-semibold mt-1">
              {lang === 'ru' ? 'Врачи' : lang === 'uz' ? 'Shifokor' : 'Doctors'}
            </span>
          </button>

          <button
            onClick={() => switchTab('contacts')}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ios-press ${
              activeTab === 'contacts' ? 'text-[#1B4332]' : 'text-[#8E8E93]'
            }`}
          >
            <MapPin className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-semibold mt-1">
              {lang === 'ru' ? 'Клиника' : lang === 'uz' ? 'Klinika' : 'Clinic'}
            </span>
          </button>

        </div>
      </nav>

      {/* ========================================================
          4. APPLE BOTTOM SHEET MODAL (Booking)
         ======================================================== */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-[28px] p-5 max-h-[92vh] overflow-y-auto shadow-2xl border-t border-black/[0.08] animate-in slide-in-from-bottom duration-200">
            
            {/* Grab handle */}
            <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-4" />

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-[#1B4332] text-white flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-1">
                  {lang === 'ru' && 'Запись подтверждена'}
                  {lang === 'uz' && 'Ariza qabul qilindi'}
                  {lang === 'en' && 'Booking Submitted'}
                </h3>
                <p className="text-[13px] text-[#4B5563] mb-6 max-w-xs mx-auto">
                  {lang === 'ru' && 'Администратор клиники свяжется с вами в течение 10 минут для подтверждения времени.'}
                  {lang === 'uz' && 'Administratorimiz 10 daqiqa ichida vaqtni tasdiqlash uchun bog‘lanadi.'}
                  {lang === 'en' && 'Our receptionist will contact you shortly to confirm your slot.'}
                </p>
                <button
                  onClick={() => {
                    setIsBookingOpen(false);
                    setIsSubmitted(false);
                  }}
                  className="w-full py-3 bg-[#111827] text-white font-semibold text-[13px] rounded-xl ios-press"
                >
                  {lang === 'ru' ? 'Готово' : lang === 'uz' ? 'Tayyor' : 'Done'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#111827]">
                      {lang === 'ru' && 'Запись на приём'}
                      {lang === 'uz' && 'Qabulga yozilish'}
                      {lang === 'en' && 'Book Appointment'}
                    </h3>
                    <div className="text-[12px] text-[#1B4332] font-semibold mt-0.5 line-clamp-1">
                      {bookingService}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center text-[#6B7280] hover:text-[#111827]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Patient Name */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#4B5563] mb-1">
                    {lang === 'ru' ? 'Ваше имя' : lang === 'uz' ? 'Ismingiz' : 'Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Азиз"
                    className="w-full px-3.5 py-2.5 bg-black/[0.04] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Patient Phone */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#4B5563] mb-1">
                    {lang === 'ru' ? 'Номер телефона' : lang === 'uz' ? 'Telefon raqam' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-3.5 py-2.5 bg-black/[0.04] rounded-xl text-[14px] text-[#111827] tabular focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  />
                </div>

                {/* Date Presets */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">
                    {lang === 'ru' ? 'Желаемый день' : lang === 'uz' ? 'Qabul kuni' : 'Day'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'today', ru: 'Сегодня', uz: 'Bugun', en: 'Today' },
                      { id: 'tomorrow', ru: 'Завтра', uz: 'Ertaga', en: 'Tomorrow' },
                      { id: 'weekend', ru: 'Суббота', uz: 'Shanba', en: 'Saturday' },
                    ].map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => {
                          triggerHaptic('light');
                          setBookingDate(d.id);
                        }}
                        className={`py-2 text-[12px] font-semibold rounded-lg border transition-colors ios-press ${
                          bookingDate === d.id
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-black/[0.03] text-[#4B5563] border-transparent hover:bg-black/[0.06]'
                        }`}
                      >
                        {d[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#4B5563] mb-1.5">
                    {lang === 'ru' ? 'Время приёма' : lang === 'uz' ? 'Vaqt' : 'Time'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['10:00', '12:30', '14:30', '16:30', '18:30', '20:00'].map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => {
                          triggerHaptic('light');
                          setBookingTime(time);
                        }}
                        className={`py-2 text-[12px] font-semibold rounded-lg border tabular transition-colors ios-press ${
                          bookingTime === time
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-black/[0.03] text-[#4B5563] border-transparent hover:bg-black/[0.06]'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#4B5563] mb-1">
                    {lang === 'ru' ? 'Специалист' : lang === 'uz' ? 'Shifokor' : 'Doctor'}
                  </label>
                  <select
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/[0.04] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1B4332]"
                  >
                    <option value="Д-р Сардор Каримов (Главврач)">Д-р Сардор Каримов (Хирург-имплантолог)</option>
                    <option value="Д-р Мадина Усманова (Ортодонт)">Д-р Мадина Усманова (Ортодонт Damon/Spark)</option>
                    <option value="Д-р Тимур Рахимов (Ортопед)">Д-р Тимур Рахимов (Ортопед E.max)</option>
                    <option value="Д-р Нилуфар Ахмедова (Терапевт)">Д-р Нилуфар Ахмедова (Детский врач)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#1B4332] text-white font-semibold text-[14px] rounded-xl hover:bg-[#143326] transition-colors ios-press shadow-xs"
                  >
                    {lang === 'ru' ? 'Подтвердить запись' : lang === 'uz' ? 'Band qilishni tasdiqlash' : 'Confirm Appointment'}
                  </button>
                  <p className="text-center text-[11px] text-[#9CA3AF] mt-2">
                    {lang === 'ru' && 'Мгновенное уведомление в Telegram · Без предоплаты'}
                    {lang === 'uz' && 'Telegram orqali tezkor tasdiq · Oldindan to‘lovsiz'}
                    {lang === 'en' && 'Instant Telegram notification · No prepayment needed'}
                  </p>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}