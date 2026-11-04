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
    <div className="min-h-[100dvh] bg-[#F6F4F0] text-[#1C1B1A] flex flex-col font-sans selection:bg-[#1B4332] selection:text-white pb-28">
      
      {/* 1. APPLE GLASS HEADER */}
      <header className="sticky top-0 z-30 glass-panel px-5 py-3.5 flex items-center justify-between border-b border-[#DDD8CE]/60">
        <div>
          <div className="font-display font-extrabold text-[17px] tracking-tight text-[#1C1B1A] flex items-center gap-1.5">
            DENTALUX
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1B4332]"></span>
          </div>
          <div className="text-[11px] text-[#6B6762] font-medium tracking-normal">
            Tashkent · Swiss Protocols
          </div>
        </div>

        {/* Apple Segmented Language Control */}
        <div className="flex items-center gap-1 bg-[#ECE8E1]/80 p-1 rounded-full text-xs font-semibold">
          {(['ru', 'uz', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                triggerHaptic('light');
                setLang(l);
              }}
              className={`px-3 py-1 rounded-full transition-all duration-200 ${
                lang === l
                  ? 'bg-white text-[#1C1B1A] shadow-sm'
                  : 'text-[#6B6762] hover:text-[#1C1B1A]'
              }`}
            >
              {l === 'ru' ? 'РУС' : l === 'uz' ? 'O‘ZB' : 'ENG'}
            </button>
          ))}
        </div>
      </header>

      {/* 2. TAB CONTENT VIEWS */}
      <main className="flex-1 px-4 pt-5 max-w-xl mx-auto w-full">
        
        {/* ========================================================
            TAB 1: ГЛАВНАЯ (HOME / DASHBOARD)
           ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* Hero Glass Card */}
            <div className="glass-card-dark rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-medium tracking-wide mb-3 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-[#E2DDD4]" />
                  {lang === 'ru' && 'Бесплатный 3D-снимок (КТ) на первой консультации'}
                  {lang === 'uz' && 'Birinchi ko‘rikda bepul 3D KT rentgen'}
                  {lang === 'en' && 'Free 3D CT scan with initial consultation'}
                </div>

                <h1 className="font-display font-extrabold text-[24px] sm:text-[28px] leading-[1.12] mb-2.5">
                  {lang === 'ru' && 'Швейцарская точность и эстетика улыбки'}
                  {lang === 'uz' && 'Toshkent markazida Shveytsariya aniqligi'}
                  {lang === 'en' && 'Swiss precision dentistry in Tashkent'}
                </h1>

                <p className="text-white/80 text-[13px] leading-relaxed mb-5">
                  {lang === 'ru' && 'Официальные протоколы Straumann и Damon. Бережное лечение под микроскопом и прозрачная смета без скрытых доплат.'}
                  {lang === 'uz' && 'Straumann va Damon rasmiy protokollari. Mikroskop ostida og‘riqsiz davolash va birinchi ko‘rikdayoq aniq narx rejasi.'}
                  {lang === 'en' && 'Official Straumann & Damon protocols. Gentle microscope treatment with fully transparent estimates.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => openBookingFor(
                      lang === 'ru' ? 'Консультация главврача + 3D-снимок (0 сум)' : 'Bosh shifokor ko‘rigi + 3D KT (0 so‘m)'
                    )}
                    className="font-semibold text-xs tracking-wide bg-white text-[#1B4332] px-5 py-3 rounded-2xl hover:bg-white/95 transition-all text-center shadow-sm active:scale-98"
                  >
                    {lang === 'ru' && 'Записаться на 3D-осмотр (0 сум)'}
                    {lang === 'uz' && 'Bepul 3D-ko‘rikka yozilish (0 so‘m)'}
                    {lang === 'en' && 'Book Free 3D Exam ($0)'}
                  </button>

                  <button
                    onClick={() => switchTab('calculator')}
                    className="font-medium text-xs tracking-wide bg-white/15 hover:bg-white/20 text-white px-4 py-3 rounded-2xl backdrop-blur-md transition-all text-center active:scale-98"
                  >
                    {lang === 'ru' && 'Калькулятор сметы →'}
                    {lang === 'uz' && 'Narx kalkulyatori →'}
                    {lang === 'en' && 'Cost calculator →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Quick-Access Navigation Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => switchTab('services')}
                className="glass-panel rounded-3xl p-4 cursor-pointer hover:bg-white/90 transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Каталог услуг'}
                    {lang === 'uz' && 'Xizmatlar'}
                    {lang === 'en' && 'Services'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] mt-0.5">
                    {lang === 'ru' && '7 категорий и цены'}
                    {lang === 'uz' && '7 yo‘nalish va narxlar'}
                    {lang === 'en' && '7 categories & rates'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('calculator')}
                className="glass-panel rounded-3xl p-4 cursor-pointer hover:bg-white/90 transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-3">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Калькулятор'}
                    {lang === 'uz' && 'Kalkulyator'}
                    {lang === 'en' && 'Calculator'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] mt-0.5">
                    {lang === 'ru' && 'Расчёт стоимости'}
                    {lang === 'uz' && 'Aniq hisob-kitob'}
                    {lang === 'en' && 'Custom estimates'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('doctors')}
                className="glass-panel rounded-3xl p-4 cursor-pointer hover:bg-white/90 transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Врачи клиники'}
                    {lang === 'uz' && 'Shifokorlar'}
                    {lang === 'en' && 'Doctors'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] mt-0.5">
                    {lang === 'ru' && 'Стаж от 9 до 16 лет'}
                    {lang === 'uz' && '9 yildan ortiq tajriba'}
                    {lang === 'en' && 'Senior specialists'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('contacts')}
                className="glass-panel rounded-3xl p-4 cursor-pointer hover:bg-white/90 transition-all active:scale-98 flex flex-col justify-between"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Адрес и часы'}
                    {lang === 'uz' && 'Manzil va vaqt'}
                    {lang === 'en' && 'Location'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762]" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] mt-0.5">
                    {lang === 'ru' && 'Метро Ойбек, 09-21'}
                    {lang === 'uz' && 'Oybek metrosi, 09-21'}
                    {lang === 'en' && 'Oybek metro, 9-21'}
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Specimens (Apple Horizontal Glass Scroller) */}
            <div className="glass-panel rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <div className="font-display font-bold text-base text-[#1C1B1A]">
                    {lang === 'ru' && 'Флагманские направления'}
                    {lang === 'uz' && 'Asosiy xizmatlar'}
                    {lang === 'en' && 'Featured Treatments'}
                  </div>
                  <div className="text-[11px] text-[#6B6762]">
                    {lang === 'ru' && 'Официальные швейцарские и немецкие материалы'}
                    {lang === 'uz' && 'Shveytsariya va Germaniya materiallari'}
                    {lang === 'en' && 'Swiss & German certified materials'}
                  </div>
                </div>
                <button
                  onClick={() => switchTab('services')}
                  className="text-xs font-semibold text-[#1B4332] hover:underline flex items-center"
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
                    className="snap-item min-w-[210px] bg-[#ECE8E1]/60 hover:bg-[#ECE8E1] transition-all rounded-2xl p-4 flex flex-col justify-between cursor-pointer border border-white/60 active:scale-98"
                  >
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-[#6B6762] mb-1">
                        {specimen.maker}
                      </div>
                      <div className="font-display font-bold text-sm text-[#1C1B1A] leading-snug mb-1">
                        {specimen.title}
                      </div>
                      <div className="text-[11px] text-[#524F4B] mb-3">
                        {specimen.note}
                      </div>
                    </div>
                    <div className="pt-2.5 border-t border-[#DDD8CE]/60 flex items-baseline justify-between">
                      <span className="font-bold text-xs text-[#1B4332]">{specimen.price}</span>
                      <span className="text-[11px] text-[#6B6762]">{specimen.usd}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="glass-panel rounded-2xl p-3">
                <ShieldCheck className="w-5 h-5 text-[#1B4332] mx-auto mb-1" />
                <div className="text-[11px] font-bold text-[#1C1B1A]">100% стерильность</div>
                <div className="text-[9px] text-[#6B6762]">Автоклавы класс B</div>
              </div>
              <div className="glass-panel rounded-2xl p-3">
                <Award className="w-5 h-5 text-[#1B4332] mx-auto mb-1" />
                <div className="text-[11px] font-bold text-[#1C1B1A]">Швейцария & США</div>
                <div className="text-[9px] text-[#6B6762]">Сертифицировано</div>
              </div>
              <div className="glass-panel rounded-2xl p-3">
                <Clock className="w-5 h-5 text-[#1B4332] mx-auto mb-1" />
                <div className="text-[11px] font-bold text-[#1C1B1A]">09:00 — 21:00</div>
                <div className="text-[9px] text-[#6B6762]">Без выходных</div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: УСЛУГИ (SERVICES & PRICING)
           ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div>
              <h2 className="font-display font-bold text-xl text-[#1C1B1A]">
                {lang === 'ru' && 'Каталог услуг и фиксированные цены'}
                {lang === 'uz' && 'Xizmatlar katalogi va aniq narxlar'}
                {lang === 'en' && 'Services & Transparent Pricing'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Анестезия, 3D-контроль и расходные материалы уже включены в стоимость.'}
                {lang === 'uz' && 'Anesteziya va sarf materiallari narx ichiga kiritilgan.'}
                {lang === 'en' && 'All anesthesia, 3D controls and disposables are fully included.'}
              </p>
            </div>

            {/* Apple Pill Category Scroller */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? 'bg-[#1B4332] text-white shadow-sm'
                      : 'glass-panel text-[#6B6762] hover:text-[#1C1B1A]'
                  }`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>

            {/* Services Cards */}
            <div className="space-y-3">
              {filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between gap-3 hover:bg-white/95 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-display font-bold text-sm sm:text-base text-[#1C1B1A] leading-snug">
                        {svc.name[lang]}
                      </div>
                      <span className="text-[11px] font-medium text-[#6B6762] whitespace-nowrap bg-[#ECE8E1]/80 px-2.5 py-0.5 rounded-full">
                        {svc.duration}
                      </span>
                    </div>

                    <p className="text-xs text-[#524F4B] leading-relaxed mb-3">
                      {svc.description[lang]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DDD8CE]/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm sm:text-base text-[#1B4332]">
                        {svc.priceUzs}
                      </div>
                      {svc.priceUsd && (
                        <div className="text-[11px] text-[#6B6762]">
                          ≈ {svc.priceUsd}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => openBookingFor(svc.name[lang])}
                      className="text-xs font-semibold bg-[#1C1B1A] text-white px-4 py-2 rounded-xl hover:bg-[#1B4332] transition-colors active:scale-98"
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
            <div>
              <h2 className="font-display font-bold text-xl text-[#1C1B1A]">
                {lang === 'ru' && 'Интерактивный калькулятор сметы'}
                {lang === 'uz' && 'Narx va muddat kalkulyatori'}
                {lang === 'en' && 'Treatment Cost Estimator'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Рассчитайте точную смету, длительность и гарантию в пару кликов.'}
                {lang === 'uz' && 'Muolajani tanlang, muddat va kafolatni darhol bilib oling.'}
                {lang === 'en' && 'Select treatment and scope to view guaranteed timeline and cost.'}
              </p>
            </div>

            {/* Treatment Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TREATMENT_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActivePlanIdx(idx);
                    setPlanUnits(opt.defaultUnits);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 text-xs font-semibold ${
                    activePlanIdx === idx
                      ? 'bg-[#1B4332] text-white shadow-md'
                      : 'glass-panel text-[#1C1B1A] hover:bg-white/90'
                  }`}
                >
                  {opt.name[lang]}
                </button>
              ))}
            </div>

            {/* Apple Glass Calculation Panel */}
            <div className="glass-panel rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#6B6762] uppercase tracking-wider font-semibold">
                    {lang === 'ru' && 'Выбранная услуга'}
                    {lang === 'uz' && 'Tanlangan muolaja'}
                    {lang === 'en' && 'Selected procedure'}
                  </div>
                  <div className="font-display font-bold text-base text-[#1C1B1A]">
                    {currentPlan.name[lang]}
                  </div>
                </div>

                {/* Apple Stepper Pill */}
                <div className="flex items-center gap-2 bg-[#ECE8E1]/90 p-1 rounded-full">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits > 1) setPlanUnits(planUnits - 1);
                    }}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1C1B1A] shadow-sm font-bold text-sm active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-xs min-w-[20px] text-center">
                    {planUnits}
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits < 16) setPlanUnits(planUnits + 1);
                    }}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1C1B1A] shadow-sm font-bold text-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scope Detail */}
              <div className="bg-[#ECE8E1]/50 rounded-2xl p-3.5 text-xs text-[#524F4B] space-y-1.5">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span><b>{lang === 'ru' ? 'Срок:' : 'Muddat:'}</b> {currentPlan.durationStr[lang]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
                  <span><b>{lang === 'ru' ? 'Гарантия:' : 'Kafolat:'}</b> {currentPlan.guaranteeStr[lang]}</span>
                </div>
              </div>

              {/* Total Price & Lock Button */}
              <div className="pt-2 border-t border-[#DDD8CE]/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#6B6762] uppercase tracking-wider font-semibold">
                    {lang === 'ru' && 'Итоговая стоимость'}
                    {lang === 'uz' && 'Jami qiymat'}
                    {lang === 'en' && 'Total estimate'}
                  </div>
                  <div className="font-display font-extrabold text-xl text-[#1B4332]">
                    {calculatedTotalUzs} сум
                  </div>
                  <div className="text-[11px] text-[#6B6762]">
                    ≈ ${calculatedTotalUsd} USD
                  </div>
                </div>

                <button
                  onClick={() => openBookingFor(
                    `${currentPlan.name[lang]} (${planUnits} ${currentPlan.unitLabel[lang]})`
                  )}
                  className="font-semibold text-xs bg-[#1B4332] text-white px-5 py-3 rounded-2xl hover:bg-[#143326] transition-all shadow-sm active:scale-98"
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
            <div>
              <h2 className="font-display font-bold text-xl text-[#1C1B1A]">
                {lang === 'ru' && 'Врачи клиники и консилиум'}
                {lang === 'uz' && 'Yetakchi mutaxassislar'}
                {lang === 'en' && 'Medical Specialists'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Опыт работы от 8 до 16 лет. Стажировки в Швейцарии, Германии и США.'}
                {lang === 'uz' && 'Shveytsariya va Germaniyada malaka oshirgan oliy toifali mutaxassislar.'}
                {lang === 'en' && '8 to 16 years of clinical excellence with training in Zurich and Munich.'}
              </p>
            </div>

            <div className="space-y-3">
              {DOCTORS.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-panel rounded-3xl p-5 hover:bg-white/95 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-sm">
                      {doc.initials}
                    </div>
                    <div>
                      <div className="font-display font-bold text-base text-[#1C1B1A]">
                        {doc.name[lang]}
                      </div>
                      <div className="text-xs font-semibold text-[#1B4332] mt-0.5">
                        {doc.role[lang]}
                      </div>
                      <div className="text-[11px] text-[#6B6762] mt-0.5">
                        {lang === 'ru' ? `Стаж ${doc.experienceYears} лет` : `${doc.experienceYears} yil tajriba`}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#524F4B] leading-relaxed mb-3.5 bg-[#ECE8E1]/50 p-3 rounded-2xl">
                    {doc.credentials[lang]}
                  </p>

                  <button
                    onClick={() => openBookingFor('Консультация', doc.name[lang])}
                    className="w-full text-xs font-semibold py-2.5 rounded-xl bg-[#1C1B1A] text-white hover:bg-[#1B4332] transition-colors text-center active:scale-98"
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
            <div>
              <h2 className="font-display font-bold text-xl text-[#1C1B1A]">
                {lang === 'ru' && 'Адрес, контакты и часы работы'}
                {lang === 'uz' && 'Manzil, aloqa va ish vaqti'}
                {lang === 'en' && 'Clinic Location & Hours'}
              </h2>
              <p className="text-xs text-[#6B6762] mt-0.5">
                {lang === 'ru' && 'Удобное расположение в центре Ташкента с бесплатной охраняемой парковкой.'}
                {lang === 'uz' && 'Toshkent markazida qulay joylashuv va bepul avtoturargoh.'}
                {lang === 'en' && 'Prime location in central Tashkent with dedicated guest parking.'}
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-5 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#1B4332] mb-1">
                  DentaLux Aesthetic Clinic
                </div>
                <div className="font-display font-bold text-base text-[#1C1B1A] mb-1">
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

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href="https://yandex.uz/maps/-/CDuWjF8A"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center font-semibold text-xs py-3 rounded-2xl bg-[#1B4332] text-white hover:bg-[#143326] transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {lang === 'ru' && 'Маршрут на Яндекс.Картах'}
                  {lang === 'uz' && 'Yandex Xaritada ochish'}
                  {lang === 'en' && 'Yandex Maps route'}
                </a>

                <a
                  href="tel:+998712000000"
                  className="flex-1 text-center font-semibold text-xs py-3 rounded-2xl glass-panel text-[#1C1B1A] hover:bg-white transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Phone className="w-3.5 h-3.5" />
                  +998 (71) 200-00-00
                </a>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 space-y-3">
              <div className="font-display font-bold text-sm text-[#1C1B1A]">
                {lang === 'ru' && 'График приёма'}
                {lang === 'uz' && 'Qabul grafigi'}
                {lang === 'en' && 'Operating Hours'}
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-[#DDD8CE]/40">
                <span className="text-[#6B6762]">
                  {lang === 'ru' ? 'Понедельник — Пятница' : 'Dushanba — Juma'}
                </span>
                <span className="font-bold text-[#1C1B1A]">09:00 — 21:00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-[#DDD8CE]/40">
                <span className="text-[#6B6762]">
                  {lang === 'ru' ? 'Суббота' : 'Shanba'}
                </span>
                <span className="font-bold text-[#1C1B1A]">09:00 — 20:00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-[#6B6762]">
                  {lang === 'ru' ? 'Воскресенье' : 'Yakshanba'}
                </span>
                <span className="font-bold text-[#1C1B1A]">10:00 — 18:00</span>
              </div>
            </div>

            <div className="text-center text-[11px] text-[#6B6762] pt-2">
              Лицензия Минздрава РУз №008412 · Официальный партнёр Straumann (Базель)
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          3. APPLE DOCKED BOTTOM NAVIGATION TABBAR (Панель управления)
         ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav pb-safe pt-2 px-3">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* Tab 1: Home */}
          <button
            onClick={() => switchTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'home'
                ? 'text-[#1B4332] scale-105'
                : 'text-[#6B6762] hover:text-[#1C1B1A]'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'home' ? 'bg-[#1B4332]/10' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">
              {lang === 'ru' ? 'Главная' : lang === 'uz' ? 'Asosiy' : 'Home'}
            </span>
          </button>

          {/* Tab 2: Services */}
          <button
            onClick={() => switchTab('services')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'services'
                ? 'text-[#1B4332] scale-105'
                : 'text-[#6B6762] hover:text-[#1C1B1A]'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'services' ? 'bg-[#1B4332]/10' : ''}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">
              {lang === 'ru' ? 'Услуги' : lang === 'uz' ? 'Xizmatlar' : 'Services'}
            </span>
          </button>

          {/* Tab 3: Calculator */}
          <button
            onClick={() => switchTab('calculator')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'calculator'
                ? 'text-[#1B4332] scale-105'
                : 'text-[#6B6762] hover:text-[#1C1B1A]'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'calculator' ? 'bg-[#1B4332]/10' : ''}`}>
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">
              {lang === 'ru' ? 'Расчёт' : lang === 'uz' ? 'Hisob' : 'Estimate'}
            </span>
          </button>

          {/* Tab 4: Doctors */}
          <button
            onClick={() => switchTab('doctors')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'doctors'
                ? 'text-[#1B4332] scale-105'
                : 'text-[#6B6762] hover:text-[#1C1B1A]'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'doctors' ? 'bg-[#1B4332]/10' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">
              {lang === 'ru' ? 'Врачи' : lang === 'uz' ? 'Shifokor' : 'Doctors'}
            </span>
          </button>

          {/* Tab 5: Contacts */}
          <button
            onClick={() => switchTab('contacts')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'contacts'
                ? 'text-[#1B4332] scale-105'
                : 'text-[#6B6762] hover:text-[#1C1B1A]'
            }`}
          >
            <div className={`p-1 rounded-xl ${activeTab === 'contacts' ? 'bg-[#1B4332]/10' : ''}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">
              {lang === 'ru' ? 'Клиника' : lang === 'uz' ? 'Klinika' : 'Clinic'}
            </span>
          </button>

        </div>
      </nav>

      {/* ========================================================
          4. APPLE BOTTOM SHEET MODAL (Форма записи)
         ======================================================== */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#F6F4F0] p-6 max-h-[88vh] overflow-y-auto rounded-t-[32px] shadow-2xl border-t border-white/80 animate-in slide-in-from-bottom duration-200">
            
            {/* Apple Drag Handle */}
            <div className="w-10 h-1 bg-[#DDD8CE] rounded-full mx-auto mb-5" />

            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7" />
                </div>
                <div className="font-display font-bold text-xl text-[#1C1B1A] mb-1.5">
                  {lang === 'ru' && 'Запись успешно принята'}
                  {lang === 'uz' && 'Ariza qabul qilindi'}
                  {lang === 'en' && 'Booking Confirmed'}
                </div>
                <p className="text-xs text-[#524F4B] mb-6 leading-relaxed">
                  {lang === 'ru' && 'Мы перезвоним вам в течение 10 минут для согласования точного времени.'}
                  {lang === 'uz' && "10 daqiqa ichida administratorimiz siz bilan bog'lanadi."}
                  {lang === 'en' && 'Our clinic administrator will contact you within 10 minutes.'}
                </p>
                <button
                  onClick={() => {
                    setIsBookingOpen(false);
                    setIsSuccess(false);
                  }}
                  className="w-full font-semibold text-xs bg-[#1C1B1A] text-white py-3 rounded-2xl active:scale-98"
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
                    <h3 className="font-display font-bold text-lg text-[#1C1B1A]">
                      {lang === 'ru' && 'Запись на приём'}
                      {lang === 'uz' && 'Qabulga yozilish'}
                      {lang === 'en' && 'Book Appointment'}
                    </h3>
                    <div className="text-xs text-[#1B4332] font-semibold mt-0.5">
                      {bookingService}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#ECE8E1] flex items-center justify-center text-[#6B6762] hover:text-[#1C1B1A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] mb-1">
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
                    className="w-full px-3.5 py-2.5 bg-white rounded-2xl border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] mb-1">
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
                    className="w-full px-3.5 py-2.5 bg-white rounded-2xl border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] mb-1">
                    {lang === 'ru' && 'Удобное время:'}
                    {lang === 'uz' && 'Qulay vaqt:'}
                    {lang === 'en' && 'Preferred Time:'}
                  </label>
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-2xl border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="Сегодня (в ближайшее время)">Сегодня (в ближайшее время)</option>
                    <option value="Завтра утро (10:00 - 13:00)">Завтра утро (10:00 - 13:00)</option>
                    <option value="Завтра день (14:00 - 18:00)">Завтра день (14:00 - 18:00)</option>
                    <option value="Выходные">В субботу или воскресенье</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A4743] mb-1">
                    {lang === 'ru' && 'Врач:'}
                    {lang === 'uz' && 'Shifokor:'}
                    {lang === 'en' && 'Doctor:'}
                  </label>
                  <select
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-2xl border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
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
                    className="w-full font-semibold text-xs bg-[#1B4332] text-white py-3.5 rounded-2xl hover:bg-[#143326] transition-all shadow-sm active:scale-98"
                  >
                    {lang === 'ru' && 'Подтвердить запись'}
                    {lang === 'uz' && 'Band qilishni tasdiqlash'}
                    {lang === 'en' && 'Confirm Booking'}
                  </button>
                  <div className="text-[10px] text-[#6B6762] text-center mt-2">
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