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
  Award,
  ChevronRight,
  Check,
  X,
  Sparkles,
  Plus,
  Minus,
  ArrowUpRight,
  Calendar,
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

interface TreatmentPlanOption {
  id: string;
  name: Record<Language, string>;
  basePriceUzs: number;
  basePriceUsd: number;
  durationStr: Record<Language, string>;
  guaranteeStr: Record<Language, string>;
  defaultUnits: number;
  unitLabel: Record<Language, string>;
}

const TREATMENT_OPTIONS: TreatmentPlanOption[] = [
  {
    id: 'veneers',
    name: {
      ru: 'Керамические виниры E.max',
      uz: 'E.max keramika vinirlari',
      en: 'E.max Ceramic Veneers',
    },
    basePriceUzs: 3200000,
    basePriceUsd: 250,
    durationStr: {
      ru: '3-5 дней, 2 визита',
      uz: '3-5 kun, 2 tashrif',
      en: '3-5 days, 2 visits',
    },
    guaranteeStr: {
      ru: 'Гарантийный паспорт Ivoclar Vivadent на 10 лет',
      uz: 'Ivoclar Vivadent 10 yillik kafolat pasporti',
      en: '10-year official Ivoclar Vivadent warranty',
    },
    defaultUnits: 6,
    unitLabel: { ru: 'зубов', uz: 'tish', en: 'teeth' },
  },
  {
    id: 'implants',
    name: {
      ru: 'Имплантация Straumann SLA',
      uz: 'Straumann SLA implantatsiyasi',
      en: 'Straumann SLA Implantation',
    },
    basePriceUzs: 7200000,
    basePriceUsd: 580,
    durationStr: {
      ru: 'Установка за 45 минут, приживление 2 месяца',
      uz: "45 daqiqada o'rnatish, bitishi 2 oy",
      en: '45-min surgery, 2-month integration',
    },
    guaranteeStr: {
      ru: 'Пожизненная международная гарантия Straumann',
      uz: 'Straumann xalqaro umrbod kafolati',
      en: 'Straumann lifetime global warranty',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'имплант', uz: 'implant', en: 'implant' },
  },
  {
    id: 'brackets',
    name: {
      ru: 'Брекет-система Damon Q2',
      uz: 'Damon Q2 breket tizimi',
      en: 'Damon Q2 Braces System',
    },
    basePriceUzs: 7500000,
    basePriceUsd: 600,
    durationStr: {
      ru: '12-16 месяцев',
      uz: '12-16 oy',
      en: '12-16 months',
    },
    guaranteeStr: {
      ru: 'Сертификат Ormco (США), без удаления зубов',
      uz: "Ormco (AQSh) sertifikati, tish sug'urmasdan",
      en: 'Ormco USA certified protocol, no extractions',
    },
    defaultUnits: 2,
    unitLabel: { ru: 'челюсти', uz: 'jag‘', en: 'jaws' },
  },
  {
    id: 'aligners',
    name: {
      ru: 'Прозрачные элайнеры Spark',
      uz: 'Spark shaffof elaynerlari',
      en: 'Spark Clear Aligners',
    },
    basePriceUzs: 15000000,
    basePriceUsd: 1200,
    durationStr: {
      ru: '8-14 месяцев',
      uz: '8-14 oy',
      en: '8-14 months',
    },
    guaranteeStr: {
      ru: '3D-моделирование результата до начала лечения',
      uz: 'Davolashdan oldin 3D yakuniy natija modeli',
      en: 'Pre-treatment 3D simulation of final smile',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'курс', uz: 'kurs', en: 'course' },
  },
  {
    id: 'whitening',
    name: {
      ru: 'Отбеливание Beyond Polus',
      uz: 'Beyond Polus tish oqartirish',
      en: 'Beyond Polus Cold Whitening',
    },
    basePriceUzs: 2400000,
    basePriceUsd: 190,
    durationStr: {
      ru: '1 сеанс (60 минут)',
      uz: '1 seans (60 daqiqa)',
      en: '1 session (60 mins)',
    },
    guaranteeStr: {
      ru: 'Осветление на 6-8 тонов без повреждения эмали',
      uz: 'Emalga ziyon yetkazmasdan 6-8 tonga oqartirish',
      en: '6-8 shades brighter with zero enamel damage',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'процедура', uz: 'muolaja', en: 'procedure' },
  },
];

export default function MiniAppPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calculator State
  const [activePlanIdx, setActivePlanIdx] = useState<number>(0);
  const [planUnits, setPlanUnits] = useState<number>(TREATMENT_OPTIONS[0].defaultUnits);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingService, setBookingService] = useState<string>('Консультация главврача + 3D-снимок (КТ)');
  const [bookingDoctor, setBookingDoctor] = useState<string>('Любой свободный специалист');
  const [bookingDate, setBookingDate] = useState<string>('Завтра в удобное время');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+998 ');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPlan = TREATMENT_OPTIONS[activePlanIdx];
  const calculatedTotalUzs = (currentPlan.basePriceUzs * planUnits).toLocaleString('ru-RU');
  const calculatedTotalUsd = (currentPlan.basePriceUsd * planUnits).toLocaleString('en-US');

  const openBookingFor = (serviceTitle: string, doctorTitle?: string) => {
    triggerHaptic('medium');
    setBookingService(serviceTitle);
    if (doctorTitle) {
      setBookingDoctor(doctorTitle);
    }
    setIsBookingOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    setIsSuccess(true);

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
      try {
        const payload = {
          name: clientName.trim() || 'Пациент',
          phone: clientPhone.trim() || 'Не указан',
          service: bookingService,
          doctor: bookingDoctor,
          date: bookingDate,
          source: 'Mini App (Apple Glass UI)',
        };
        tg.sendData(JSON.stringify(payload));
      } catch {
        // Fallback for standalone browser testing
      }
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? SERVICES
    : SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-[100dvh] bg-[#F6F4F0] text-[#1C1B1A] flex flex-col font-sans selection:bg-[#1B4332] selection:text-white pb-32">
      
      {/* 1. FLOATING APPLE GLASS ISLAND HEADER (Zero sharp edges) */}
      <header className="sticky top-2 z-30 px-3 max-w-xl mx-auto w-full">
        <div className="apple-glass rounded-full px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-black text-xs shadow-sm">
              D
            </div>
            <div>
              <div className="font-display font-black text-[15px] tracking-tight text-[#1C1B1A] leading-none">
                DENTALUX
              </div>
              <div className="text-[10px] text-[#6B6762] font-semibold mt-0.5">
                Tashkent · Swiss Tech
              </div>
            </div>
          </div>

          {/* Apple Segmented Language Control */}
          <div className="flex items-center gap-0.5 bg-[#ECE8E1]/90 p-1 rounded-full text-xs font-bold">
            {(['ru', 'uz', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  triggerHaptic('light');
                  setLang(l);
                }}
                className={`px-3 py-1 rounded-full transition-all duration-200 text-[11px] ${
                  lang === l
                    ? 'bg-white text-[#1C1B1A] shadow-sm'
                    : 'text-[#6B6762] hover:text-[#1C1B1A]'
                }`}
              >
                {l === 'ru' ? 'РУС' : l === 'uz' ? 'O‘ZB' : 'ENG'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. TAB CONTENT VIEWS */}
      <main className="flex-1 px-3 pt-4 max-w-xl mx-auto w-full">
        
        {/* ========================================================
            TAB 1: ГЛАВНАЯ (HOME / DASHBOARD)
           ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Hero Apple Glass Dark Card (Rounded 32px) */}
            <div className="apple-glass-dark rounded-[32px] p-6 sm:p-7 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide mb-3.5 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#E2DDD4]" />
                  {lang === 'ru' && 'Бесплатный 3D-снимок (КТ) при записи'}
                  {lang === 'uz' && 'Birinchi ko‘rikda bepul 3D KT rentgen'}
                  {lang === 'en' && 'Free 3D CT scan with initial exam'}
                </div>

                <h1 className="font-display font-extrabold text-[25px] sm:text-[30px] leading-[1.12] mb-3">
                  {lang === 'ru' && 'Швейцарская точность и эстетика улыбки'}
                  {lang === 'uz' && 'Toshkent markazida Shveytsariya aniqligi'}
                  {lang === 'en' && 'Swiss precision dentistry in Tashkent'}
                </h1>

                <p className="text-white/85 text-[14px] leading-relaxed mb-6 font-normal">
                  {lang === 'ru' && 'Официальные протоколы Straumann и Damon. Бережное лечение под микроскопом и фиксированная прозрачная смета.'}
                  {lang === 'uz' && 'Straumann va Damon rasmiy protokollari. Mikroskop ostida og‘riqsiz davolash va aniq narx rejasi.'}
                  {lang === 'en' && 'Official Straumann & Damon protocols. Gentle microscope care with 100% transparent pricing.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => openBookingFor(
                      lang === 'ru' ? 'Консультация главврача + 3D-снимок (0 сум)' : 'Bosh shifokor ko‘rigi + 3D KT (0 so‘m)'
                    )}
                    className="font-bold text-xs bg-white text-[#1B4332] px-6 py-3.5 rounded-full hover:bg-white/95 transition-all text-center shadow-md active:scale-97"
                  >
                    {lang === 'ru' && 'Записаться на 3D-осмотр (0 сум)'}
                    {lang === 'uz' && 'Bepul 3D-ko‘rikka yozilish (0 so‘m)'}
                    {lang === 'en' && 'Book Free 3D Exam ($0)'}
                  </button>

                  <button
                    onClick={() => switchTab('calculator')}
                    className="font-semibold text-xs bg-white/15 hover:bg-white/25 text-white px-5 py-3.5 rounded-full backdrop-blur-md transition-all text-center active:scale-97"
                  >
                    {lang === 'ru' && 'Калькулятор сметы →'}
                    {lang === 'uz' && 'Narx kalkulyatori →'}
                    {lang === 'en' && 'Cost calculator →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Quick-Access Rounded Grid (Rounded 28px) */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => switchTab('services')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all active:scale-97 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-4 shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Каталог услуг'}
                    {lang === 'uz' && 'Xizmatlar'}
                    {lang === 'en' && 'Services'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[12px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && '7 категорий и цены'}
                    {lang === 'uz' && '7 yo‘nalish va narxlar'}
                    {lang === 'en' && '7 categories & rates'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('calculator')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all active:scale-97 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-4 shadow-sm">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Калькулятор'}
                    {lang === 'uz' && 'Kalkulyator'}
                    {lang === 'en' && 'Calculator'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[12px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && 'Точный расчёт'}
                    {lang === 'uz' && 'Aniq hisob-kitob'}
                    {lang === 'en' && 'Instant estimate'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('doctors')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all active:scale-97 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-4 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Врачи клиники'}
                    {lang === 'uz' && 'Shifokorlar'}
                    {lang === 'en' && 'Doctors'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[12px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && 'Стаж от 9 до 16 лет'}
                    {lang === 'uz' && '9 yildan ortiq tajriba'}
                    {lang === 'en' && 'Senior specialists'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('contacts')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all active:scale-97 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-4 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Адрес и часы'}
                    {lang === 'uz' && 'Manzil va vaqt'}
                    {lang === 'en' && 'Location'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[12px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && 'Метро Ойбек, 09-21'}
                    {lang === 'uz' && 'Oybek metrosi, 09-21'}
                    {lang === 'en' && 'Oybek metro, 9-21'}
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Treatments (Rounded 32px with Horizontal Glass Carousel) */}
            <div className="apple-glass rounded-[32px] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-display font-black text-base text-[#1C1B1A]">
                    {lang === 'ru' && 'Флагманские процедуры'}
                    {lang === 'uz' && 'Asosiy xizmatlar'}
                    {lang === 'en' && 'Featured Treatments'}
                  </div>
                  <div className="text-[11px] text-[#6B6762]">
                    {lang === 'ru' && 'Швейцарские и американские материалы'}
                    {lang === 'uz' && 'Shveytsariya va AQSh materiallari'}
                    {lang === 'en' && 'Swiss & USA certified materials'}
                  </div>
                </div>
                <button
                  onClick={() => switchTab('services')}
                  className="text-xs font-bold text-[#1B4332] hover:underline flex items-center gap-0.5 bg-[#1B4332]/10 px-3 py-1.5 rounded-full"
                >
                  {lang === 'ru' && 'Все'}
                  {lang === 'uz' && 'Barchasi'}
                  {lang === 'en' && 'All'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scroll-snap-x no-scrollbar">
                {[
                  {
                    title: lang === 'ru' ? 'Виниры E.max' : 'E.max Vinirlari',
                    maker: 'Ivoclar (Германия)',
                    price: '3 200 000 сум',
                    usd: '$250',
                    note: lang === 'ru' ? '3-5 дней, 10 лет гарантии' : '3-5 kun, 10 yil kafolat',
                  },
                  {
                    title: lang === 'ru' ? 'Импланты Straumann' : 'Straumann Implantlari',
                    maker: 'Straumann SLA (Швейцария)',
                    price: '7 200 000 сум',
                    usd: '$580',
                    note: lang === 'ru' ? 'Пожизненный паспорт' : 'Umrbod pasport',
                  },
                  {
                    title: lang === 'ru' ? 'Брекеты Damon Q2' : 'Damon Q2 Breketlari',
                    maker: 'Ormco (США)',
                    price: '7 500 000 сум',
                    usd: '$600',
                    note: lang === 'ru' ? 'Без удаления зубов' : "Tish sug'urmasdan",
                  },
                  {
                    title: lang === 'ru' ? 'Элайнеры Spark' : 'Spark Elaynerlari',
                    maker: 'TruGEN (США)',
                    price: '15 000 000 сум',
                    usd: '$1 200',
                    note: lang === 'ru' ? '100% невидимые капы' : '100% ko‘rinmas',
                  },
                ].map((specimen, idx) => (
                  <div
                    key={idx}
                    onClick={() => openBookingFor(specimen.title)}
                    className="snap-item min-w-[210px] bg-[#ECE8E1]/60 hover:bg-[#ECE8E1] transition-all rounded-[24px] p-5 flex flex-col justify-between cursor-pointer border border-white/80 active:scale-97"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#6B6762] uppercase tracking-wider block mb-1">
                        {specimen.maker}
                      </span>
                      <div className="font-display font-bold text-[15px] text-[#1C1B1A] leading-snug mb-1">
                        {specimen.title}
                      </div>
                      <div className="text-[12px] text-[#524F4B] mb-4">
                        {specimen.note}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#DDD8CE]/60 flex items-baseline justify-between">
                      <span className="font-extrabold text-sm text-[#1B4332]">{specimen.price}</span>
                      <span className="text-xs font-semibold text-[#6B6762]">{specimen.usd}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apple Pill Badges */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="apple-glass rounded-3xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#1C1B1A]">100% стерильно</div>
                <div className="text-[10px] text-[#6B6762]">Автоклавы B</div>
              </div>
              <div className="apple-glass rounded-3xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-1.5">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#1C1B1A]">Швейцария</div>
                <div className="text-[10px] text-[#6B6762]">Сертификаты</div>
              </div>
              <div className="apple-glass rounded-3xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-1.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#1C1B1A]">09:00 — 21:00</div>
                <div className="text-[10px] text-[#6B6762]">Без выходных</div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: УСЛУГИ (SERVICES & PRICING)
           ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="px-1">
              <h2 className="font-display font-extrabold text-2xl text-[#1C1B1A]">
                {lang === 'ru' && 'Каталог услуг и цены'}
                {lang === 'uz' && 'Xizmatlar katalogi va narxlar'}
                {lang === 'en' && 'Services & Transparent Pricing'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Анестезия, 3D-контроль и расходные материалы уже включены в стоимость.'}
                {lang === 'uz' && 'Anesteziya va sarf materiallari narx ichiga kiritilgan.'}
                {lang === 'en' && 'All anesthesia, 3D controls and disposables are fully included.'}
              </p>
            </div>

            {/* Apple Pill Category Scroller (Rounded Full) */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-[#1B4332] text-white shadow-md'
                      : 'apple-glass text-[#6B6762] hover:text-[#1C1B1A]'
                  }`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>

            {/* Services Cards (Rounded 30px) */}
            <div className="space-y-3.5">
              {filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="apple-glass rounded-[30px] p-5 sm:p-6 flex flex-col justify-between gap-3.5 hover:bg-white/95 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-display font-extrabold text-base text-[#1C1B1A] leading-snug">
                        {svc.name[lang]}
                      </div>
                      <span className="text-[11px] font-bold text-[#6B6762] whitespace-nowrap bg-[#ECE8E1] px-3 py-1 rounded-full">
                        {svc.duration}
                      </span>
                    </div>

                    <p className="text-xs text-[#524F4B] leading-relaxed mb-1">
                      {svc.description[lang]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DDD8CE]/50 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-base text-[#1B4332]">
                        {svc.priceUzs}
                      </div>
                      {svc.priceUsd && (
                        <div className="text-[11px] font-semibold text-[#6B6762]">
                          ≈ {svc.priceUsd}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => openBookingFor(svc.name[lang])}
                      className="text-xs font-bold bg-[#1C1B1A] text-white px-5 py-2.5 rounded-full hover:bg-[#1B4332] transition-colors active:scale-95 shadow-sm"
                    >
                      {lang === 'ru' && 'Записаться'}
                      {lang === 'uz' && 'Yozilish'}
                      {lang === 'en' && 'Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: КАЛЬКУЛЯТОР (CALCULATOR ESTIMATOR)
           ======================================================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="px-1">
              <h2 className="font-display font-extrabold text-2xl text-[#1C1B1A]">
                {lang === 'ru' && 'Калькулятор сметы'}
                {lang === 'uz' && 'Narx va muddat kalkulyatori'}
                {lang === 'en' && 'Treatment Cost Estimator'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Рассчитайте точную смету, длительность и гарантию в пару кликов.'}
                {lang === 'uz' && 'Muolajani tanlang, muddat va kafolatni darhol bilib oling.'}
                {lang === 'en' && 'Select treatment and scope to view guaranteed timeline and cost.'}
              </p>
            </div>

            {/* Treatment Selector Pills (Rounded 24px) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TREATMENT_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActivePlanIdx(idx);
                    setPlanUnits(opt.defaultUnits);
                  }}
                  className={`p-4 rounded-[24px] text-left transition-all duration-200 text-xs font-bold active:scale-97 ${
                    activePlanIdx === idx
                      ? 'bg-[#1B4332] text-white shadow-lg'
                      : 'apple-glass text-[#1C1B1A] hover:bg-white/95'
                  }`}
                >
                  {opt.name[lang]}
                </button>
              ))}
            </div>

            {/* Apple Glass Calculation Panel (Rounded 32px) */}
            <div className="apple-glass rounded-[32px] p-6 space-y-5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#6B6762] uppercase tracking-wider font-bold">
                    {lang === 'ru' && 'Выбранная процедура'}
                    {lang === 'uz' && 'Tanlangan muolaja'}
                    {lang === 'en' && 'Selected procedure'}
                  </div>
                  <div className="font-display font-black text-lg text-[#1C1B1A] mt-0.5">
                    {currentPlan.name[lang]}
                  </div>
                </div>

                {/* Apple Stepper Pill (Rounded Full) */}
                <div className="flex items-center gap-2 bg-[#ECE8E1] p-1.5 rounded-full shadow-inner">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits > 1) setPlanUnits(planUnits - 1);
                    }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1C1B1A] shadow-sm font-bold text-sm active:scale-90"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-sm min-w-[24px] text-center">
                    {planUnits}
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits < 16) setPlanUnits(planUnits + 1);
                    }}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1C1B1A] shadow-sm font-bold text-sm active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scope Detail (Rounded 24px) */}
              <div className="bg-[#ECE8E1]/60 rounded-[24px] p-4 text-xs text-[#524F4B] space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#1B4332] shadow-xs">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span><b>{lang === 'ru' ? 'Срок:' : 'Muddat:'}</b> {currentPlan.durationStr[lang]}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#1B4332] shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span><b>{lang === 'ru' ? 'Гарантия:' : 'Kafolat:'}</b> {currentPlan.guaranteeStr[lang]}</span>
                </div>
              </div>

              {/* Total Price & Pill CTA */}
              <div className="pt-3 border-t border-[#DDD8CE]/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#6B6762] uppercase tracking-wider font-bold">
                    {lang === 'ru' && 'Итоговая стоимость'}
                    {lang === 'uz' && 'Jami qiymat'}
                    {lang === 'en' && 'Total estimate'}
                  </div>
                  <div className="font-display font-black text-2xl text-[#1B4332]">
                    {calculatedTotalUzs} сум
                  </div>
                  <div className="text-xs font-semibold text-[#6B6762]">
                    ≈ ${calculatedTotalUsd} USD
                  </div>
                </div>

                <button
                  onClick={() => openBookingFor(
                    `${currentPlan.name[lang]} (${planUnits} ${currentPlan.unitLabel[lang]})`
                  )}
                  className="font-bold text-xs bg-[#1B4332] text-white px-6 py-3.5 rounded-full hover:bg-[#143326] transition-all shadow-md active:scale-95"
                >
                  {lang === 'ru' && 'Зафиксировать расчёт'}
                  {lang === 'uz' && 'Hisobni tasdiqlash'}
                  {lang === 'en' && 'Lock estimate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ВРАЧИ (DOCTORS & CLINICAL TEAM)
           ======================================================== */}
        {activeTab === 'doctors' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="px-1">
              <h2 className="font-display font-extrabold text-2xl text-[#1C1B1A]">
                {lang === 'ru' && 'Врачи клиники'}
                {lang === 'uz' && 'Yetakchi mutaxassislar'}
                {lang === 'en' && 'Medical Specialists'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Опыт работы от 8 до 16 лет. Стажировки в Швейцарии, Германии и США.'}
                {lang === 'uz' && 'Shveytsariya va Germaniyada malaka oshirgan oliy toifali mutaxassislar.'}
                {lang === 'en' && '8 to 16 years of clinical excellence with training in Zurich and Munich.'}
              </p>
            </div>

            <div className="space-y-3.5">
              {DOCTORS.map((doc) => (
                <div
                  key={doc.id}
                  className="apple-glass rounded-[32px] p-6 hover:bg-white/95 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-start gap-4 mb-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-black text-base tracking-wider shrink-0 shadow-md">
                      {doc.initials}
                    </div>
                    <div>
                      <div className="font-display font-extrabold text-base sm:text-lg text-[#1C1B1A]">
                        {doc.name[lang]}
                      </div>
                      <div className="text-xs font-bold text-[#1B4332] mt-0.5">
                        {doc.role[lang]}
                      </div>
                      <div className="text-[11px] font-semibold text-[#6B6762] mt-0.5">
                        {lang === 'ru' ? `Стаж ${doc.experienceYears} лет` : `${doc.experienceYears} yil tajriba`}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#524F4B] leading-relaxed mb-4 bg-[#ECE8E1]/60 p-4 rounded-2xl">
                    {doc.credentials[lang]}
                  </p>

                  <button
                    onClick={() => openBookingFor('Консультация', doc.name[lang])}
                    className="w-full text-xs font-bold py-3 rounded-full bg-[#1C1B1A] text-white hover:bg-[#1B4332] transition-colors text-center active:scale-97 shadow-sm"
                  >
                    {lang === 'ru' && `Записаться к доктору`}
                    {lang === 'uz' && `Qabuliga yozilish`}
                    {lang === 'en' && `Book with doctor`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: КЛИНИКА / КОНТАКТЫ (CLINIC & CONTACTS)
           ======================================================== */}
        {activeTab === 'contacts' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="px-1">
              <h2 className="font-display font-extrabold text-2xl text-[#1C1B1A]">
                {lang === 'ru' && 'Адрес и контакты'}
                {lang === 'uz' && 'Manzil va aloqa'}
                {lang === 'en' && 'Clinic Location & Hours'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Удобное расположение в центре Ташкента с бесплатной охраняемой парковкой.'}
                {lang === 'uz' && 'Toshkent markazida qulay joylashuv va bepul avtoturargoh.'}
                {lang === 'en' && 'Prime location in central Tashkent with dedicated guest parking.'}
              </p>
            </div>

            {/* Address Card (Rounded 32px) */}
            <div className="apple-glass rounded-[32px] p-6 space-y-4 shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B4332] bg-[#1B4332]/10 px-3 py-1 rounded-full inline-block mb-2">
                  DentaLux Aesthetic Clinic
                </span>
                <div className="font-display font-extrabold text-base text-[#1C1B1A] mb-1">
                  {lang === 'ru' && 'г. Ташкент, Яккасарайский р-н, ул. Шота Руставели, 54'}
                  {lang === 'uz' && 'Toshkent sh., Yakkasaroy t., Shota Rustaveli ko‘chasi, 54'}
                  {lang === 'en' && '54 Shota Rustaveli st., Yakkasaray district, Tashkent'}
                </div>
                <div className="text-xs text-[#6B6762]">
                  {lang === 'ru' && 'Ориентир: метро Ойбек / гранд-отель'}
                  {lang === 'uz' && 'Mo‘ljal: Oybek metrosi'}
                  {lang === 'en' && 'Landmark: Oybek metro station'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <a
                  href="https://yandex.uz/maps/-/CDuWjF8A"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center font-bold text-xs py-3.5 rounded-full bg-[#1B4332] text-white hover:bg-[#143326] transition-colors flex items-center justify-center gap-1.5 active:scale-97 shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  {lang === 'ru' && 'Маршрут на Яндекс.Картах'}
                  {lang === 'uz' && 'Yandex Xaritada ochish'}
                  {lang === 'en' && 'Yandex Maps route'}
                </a>

                <a
                  href="tel:+998712000000"
                  className="flex-1 text-center font-bold text-xs py-3.5 rounded-full apple-glass text-[#1C1B1A] hover:bg-white transition-colors flex items-center justify-center gap-1.5 active:scale-97 shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  +998 (71) 200-00-00
                </a>
              </div>
            </div>

            {/* Operating Hours Card (Rounded 32px) */}
            <div className="apple-glass rounded-[32px] p-6 space-y-3.5 shadow-sm">
              <div className="font-display font-extrabold text-base text-[#1C1B1A]">
                {lang === 'ru' && 'График приёма'}
                {lang === 'uz' && 'Qabul grafigi'}
                {lang === 'en' && 'Operating Hours'}
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-[#DDD8CE]/40">
                <span className="text-[#6B6762]">
                  {lang === 'ru' ? 'Понедельник — Пятница' : 'Dushanba — Juma'}
                </span>
                <span className="font-extrabold text-[#1C1B1A]">09:00 — 21:00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-[#DDD8CE]/40">
                <span className="text-[#6B6762]">
                  {lang === 'ru' ? 'Суббота' : 'Shanba'}
                </span>
                <span className="font-extrabold text-[#1C1B1A]">09:00 — 20:00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="text-[#6B6762]">
                  {lang === 'ru' ? 'Воскресенье' : 'Yakshanba'}
                </span>
                <span className="font-extrabold text-[#1C1B1A]">10:00 — 18:00</span>
              </div>
            </div>

            <div className="text-center text-[11px] text-[#6B6762] pt-3">
              Лицензия Минздрава РУз №008412 · Официальный партнёр Straumann (Базель)
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          3. FLOATING APPLE GLASS DOCK (Нижняя панель управления без острых краёв)
         ======================================================== */}
      <nav className="fixed bottom-4 left-3 right-3 z-40 max-w-md mx-auto apple-glass-dock rounded-full py-2 px-3 flex items-center justify-around shadow-2xl">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => switchTab('home')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 active:scale-90 ${
            activeTab === 'home'
              ? 'text-[#1B4332] scale-105'
              : 'text-[#6B6762] hover:text-[#1C1B1A]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'home' ? 'bg-[#1B4332]/10 text-[#1B4332]' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">
            {lang === 'ru' ? 'Главная' : lang === 'uz' ? 'Asosiy' : 'Home'}
          </span>
        </button>

        {/* Tab 2: Services */}
        <button
          onClick={() => switchTab('services')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 active:scale-90 ${
            activeTab === 'services'
              ? 'text-[#1B4332] scale-105'
              : 'text-[#6B6762] hover:text-[#1C1B1A]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'services' ? 'bg-[#1B4332]/10 text-[#1B4332]' : ''}`}>
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">
            {lang === 'ru' ? 'Услуги' : lang === 'uz' ? 'Xizmat' : 'Services'}
          </span>
        </button>

        {/* Tab 3: Calculator */}
        <button
          onClick={() => switchTab('calculator')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 active:scale-90 ${
            activeTab === 'calculator'
              ? 'text-[#1B4332] scale-105'
              : 'text-[#6B6762] hover:text-[#1C1B1A]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'calculator' ? 'bg-[#1B4332]/10 text-[#1B4332]' : ''}`}>
            <Calculator className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">
            {lang === 'ru' ? 'Расчёт' : lang === 'uz' ? 'Hisob' : 'Estimate'}
          </span>
        </button>

        {/* Tab 4: Doctors */}
        <button
          onClick={() => switchTab('doctors')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 active:scale-90 ${
            activeTab === 'doctors'
              ? 'text-[#1B4332] scale-105'
              : 'text-[#6B6762] hover:text-[#1C1B1A]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'doctors' ? 'bg-[#1B4332]/10 text-[#1B4332]' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">
            {lang === 'ru' ? 'Врачи' : lang === 'uz' ? 'Shifokor' : 'Doctors'}
          </span>
        </button>

        {/* Tab 5: Contacts */}
        <button
          onClick={() => switchTab('contacts')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 active:scale-90 ${
            activeTab === 'contacts'
              ? 'text-[#1B4332] scale-105'
              : 'text-[#6B6762] hover:text-[#1C1B1A]'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${activeTab === 'contacts' ? 'bg-[#1B4332]/10 text-[#1B4332]' : ''}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">
            {lang === 'ru' ? 'Клиника' : lang === 'uz' ? 'Klinika' : 'Clinic'}
          </span>
        </button>

      </nav>

      {/* ========================================================
          4. APPLE ROUNDED BOTTOM SHEET MODAL (Rounded 36px)
         ======================================================== */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#F6F4F0] p-6 max-h-[88vh] overflow-y-auto rounded-t-[36px] sm:rounded-[36px] shadow-2xl border-t sm:border border-white/90 animate-in slide-in-from-bottom duration-200">
            
            {/* Apple Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-[#DDD8CE] rounded-full mx-auto mb-5" />

            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Check className="w-8 h-8" />
                </div>
                <div className="font-display font-extrabold text-xl text-[#1C1B1A] mb-1.5">
                  {lang === 'ru' && 'Запись принята'}
                  {lang === 'uz' && 'Ariza qabul qilindi'}
                  {lang === 'en' && 'Booking Confirmed'}
                </div>
                <p className="text-xs text-[#524F4B] mb-6 leading-relaxed">
                  {lang === 'ru' && 'Мы перезвоним вам в течение 10 минут для согласования точного времени приёма.'}
                  {lang === 'uz' && "10 daqiqa ichida administratorimiz siz bilan bog'lanadi."}
                  {lang === 'en' && 'Our clinic administrator will contact you within 10 minutes.'}
                </p>
                <button
                  onClick={() => {
                    setIsBookingOpen(false);
                    setIsSuccess(false);
                  }}
                  className="w-full font-bold text-xs bg-[#1C1B1A] text-white py-3.5 rounded-full active:scale-95 shadow-md"
                >
                  {lang === 'ru' && 'Готово'}
                  {lang === 'uz' && 'Tayyor'}
                  {lang === 'en' && 'Done'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-[#1C1B1A]">
                      {lang === 'ru' && 'Запись на приём'}
                      {lang === 'uz' && 'Qabulga yozilish'}
                      {lang === 'en' && 'Book Appointment'}
                    </h3>
                    <div className="text-xs text-[#1B4332] font-bold mt-0.5">
                      {bookingService}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#ECE8E1] flex items-center justify-center text-[#6B6762] hover:text-[#1C1B1A] active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'Ваше имя:'}
                    {lang === 'uz' && 'Ismingiz:'}
                    {lang === 'en' && 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Азиз"
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'Номер телефона:'}
                    {lang === 'uz' && 'Telefon raqam:'}
                    {lang === 'en' && 'Phone Number:'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'Удобное время:'}
                    {lang === 'uz' && 'Qulay vaqt:'}
                    {lang === 'en' && 'Preferred Time:'}
                  </label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332] shadow-xs"
                  >
                    <option value="Сегодня (в ближайшее время)">Сегодня (в ближайшее время)</option>
                    <option value="Завтра утро (10:00 - 13:00)">Завтра утро (10:00 - 13:00)</option>
                    <option value="Завтра день (14:00 - 18:00)">Завтра день (14:00 - 18:00)</option>
                    <option value="Выходные">В субботу или воскресенье</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'Врач:'}
                    {lang === 'uz' && 'Shifokor:'}
                    {lang === 'en' && 'Doctor:'}
                  </label>
                  <select
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332] shadow-xs"
                  >
                    <option value="Любой свободный специалист">Любой свободный специалист</option>
                    <option value="Д-р Азиз Каримов (Имплантолог)">Д-р Азиз Каримов (Хирург-имплантолог)</option>
                    <option value="Д-р Мадина Умарова (Ортодонт)">Д-р Мадина Умарова (Ортодонт Damon/Spark)</option>
                    <option value="Д-р Сардор Рахимов (Ортопед)">Д-р Сардор Рахимов (Ортопед E.max)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full font-bold text-xs bg-[#1B4332] text-white py-4 rounded-full hover:bg-[#143326] transition-all shadow-md active:scale-97"
                  >
                    {lang === 'ru' && 'Подтвердить запись'}
                    {lang === 'uz' && 'Band qilishni tasdiqlash'}
                    {lang === 'en' && 'Confirm Booking'}
                  </button>
                  <div className="text-[10px] text-[#6B6762] text-center mt-2 font-medium">
                    {lang === 'ru' && 'Конфиденциально · Мгновенное подтверждение в Telegram'}
                    {lang === 'uz' && 'Maxfiy · Telegram orqali tezkor tasdiq'}
                    {lang === 'en' && 'Confidential · Instant Telegram notification'}
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}