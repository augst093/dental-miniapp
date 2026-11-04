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
  Star,
  Search,
  CheckCircle2,
  Calendar,
  Zap,
  Info,
  CreditCard,
  ArrowUpRight,
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
  highlightBadge: Record<Language, string>;
}

const TREATMENT_OPTIONS: TreatmentPlanOption[] = [
  {
    id: 'veneers',
    name: {
      ru: 'Виниры E.max',
      uz: 'E.max Vinirlari',
      en: 'E.max Veneers',
    },
    basePriceUzs: 3200000,
    basePriceUsd: 250,
    durationStr: {
      ru: '3-5 дней, 2 визита',
      uz: '3-5 kun, 2 tashrif',
      en: '3-5 days, 2 visits',
    },
    guaranteeStr: {
      ru: 'Паспорт Ivoclar Vivadent (10 лет)',
      uz: 'Ivoclar Vivadent 10 yillik pasporti',
      en: '10-yr Ivoclar Vivadent warranty',
    },
    defaultUnits: 6,
    unitLabel: { ru: 'зубов', uz: 'tish', en: 'teeth' },
    highlightBadge: { ru: 'Хит эстетики', uz: 'Top estetika', en: 'Aesthetics Hit' },
  },
  {
    id: 'implants',
    name: {
      ru: 'Импланты Straumann',
      uz: 'Straumann Implantlari',
      en: 'Straumann Implants',
    },
    basePriceUzs: 7200000,
    basePriceUsd: 580,
    durationStr: {
      ru: '45 минут операция, приживление 2 мес',
      uz: "45 daqiqa jarrohlik, bitishi 2 oy",
      en: '45-min surgery, 2-month healing',
    },
    guaranteeStr: {
      ru: 'Пожизненный международный сертификат',
      uz: 'Xalqaro umrbod kafolat hujjati',
      en: 'Global lifetime warranty certificate',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'имплант', uz: 'implant', en: 'implant' },
    highlightBadge: { ru: 'Швейцария 99.6%', uz: 'Shveytsariya 99.6%', en: 'Swiss 99.6%' },
  },
  {
    id: 'brackets',
    name: {
      ru: 'Брекеты Damon Q2',
      uz: 'Damon Q2 Breketlari',
      en: 'Damon Q2 Braces',
    },
    basePriceUzs: 7500000,
    basePriceUsd: 600,
    durationStr: {
      ru: '12-16 месяцев',
      uz: '12-16 oy',
      en: '12-16 months',
    },
    guaranteeStr: {
      ru: 'Сертификат Ormco USA, без удаления зубов',
      uz: "Ormco USA sertifikati, tish sug'urmasdan",
      en: 'Ormco USA protocol, no extractions',
    },
    defaultUnits: 2,
    unitLabel: { ru: 'челюсти', uz: 'jag‘', en: 'jaws' },
    highlightBadge: { ru: 'Без удаления', uz: "Sug'urmasdan", en: 'No extractions' },
  },
  {
    id: 'aligners',
    name: {
      ru: 'Элайнеры Spark',
      uz: 'Spark Elaynerlari',
      en: 'Spark Aligners',
    },
    basePriceUzs: 15000000,
    basePriceUsd: 1200,
    durationStr: {
      ru: '8-14 месяцев',
      uz: '8-14 oy',
      en: '8-14 months',
    },
    guaranteeStr: {
      ru: '3D-моделирование улыбки до начала',
      uz: '3D jilmayish yakuniy modeli',
      en: '3D smile preview before treatment',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'курс', uz: 'kurs', en: 'course' },
    highlightBadge: { ru: '100% невидимые', uz: '100% ko‘rinmas', en: 'Invisible' },
  },
  {
    id: 'whitening',
    name: {
      ru: 'Отбеливание Beyond',
      uz: 'Beyond Oqartirish',
      en: 'Beyond Whitening',
    },
    basePriceUzs: 2400000,
    basePriceUsd: 190,
    durationStr: {
      ru: '1 сеанс (60 минут)',
      uz: '1 seans (60 daqiqa)',
      en: '1 session (60 mins)',
    },
    guaranteeStr: {
      ru: 'Осветление на 6-8 тонов, защита эмали',
      uz: '6-8 tonga oqartirish, emal himoyasi',
      en: '6-8 shades brighter, safe enamel',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'сеанс', uz: 'seans', en: 'session' },
    highlightBadge: { ru: 'За 60 минут', uz: '60 daqiqada', en: 'In 60 mins' },
  },
];

const TIME_SLOTS = ['10:00', '12:30', '14:30', '16:30', '18:30', '20:00'];
const DATE_PRESETS = [
  { id: 'today', label: { ru: 'Сегодня', uz: 'Bugun', en: 'Today' } },
  { id: 'tomorrow', label: { ru: 'Завтра', uz: 'Ertaga', en: 'Tomorrow' } },
  { id: 'weekend', label: { ru: 'В выходные', uz: 'Dam olishda', en: 'Weekend' } },
];

export default function MiniAppPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculator State
  const [activePlanIdx, setActivePlanIdx] = useState<number>(0);
  const [planUnits, setPlanUnits] = useState<number>(TREATMENT_OPTIONS[0].defaultUnits);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingService, setBookingService] = useState<string>('Консультация главврача + 3D-снимок (КТ)');
  const [bookingDoctor, setBookingDoctor] = useState<string>('Любой свободный специалист');
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('12:30');
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
        const fullDateStr = `${selectedDatePreset === 'today' ? 'Сегодня' : selectedDatePreset === 'tomorrow' ? 'Завтра' : 'Выходные'} в ${selectedTimeSlot}`;
        const payload = {
          name: clientName.trim() || 'Пациент',
          phone: clientPhone.trim() || 'Не указан',
          service: bookingService,
          doctor: bookingDoctor,
          date: fullDateStr,
          source: 'Mini App (Apple Glass UI)',
        };
        tg.sendData(JSON.stringify(payload));
      } catch {
        // Fallback for browser tests
      }
    }
  };

  const filteredServices = SERVICES.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      s.name[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description[lang].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-[100dvh] bg-[#F6F4F0] text-[#1C1B1A] flex flex-col font-sans selection:bg-[#1B4332] selection:text-white pb-32">
      
      {/* 1. FLOATING APPLE GLASS ISLAND HEADER (Zero sharp edges, Micro-Indicators) */}
      <header className="sticky top-2 z-30 px-3 max-w-xl mx-auto w-full">
        <div className="apple-glass rounded-full px-4 sm:px-5 py-2.5 flex items-center justify-between shadow-sm">
          
          {/* Logo & Live Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-black text-xs shadow-sm">
              D
            </div>
            <div>
              <div className="font-display font-black text-[15px] tracking-tight text-[#1C1B1A] leading-none flex items-center gap-1.5">
                DENTALUX
                <span className="flex h-2 w-2 relative">
                  <span className="pulse-ring-emerald absolute inline-flex h-full w-full rounded-full bg-[#1B4332] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B4332]"></span>
                </span>
              </div>
              <div className="text-[10px] text-[#6B6762] font-semibold flex items-center gap-1 mt-0.5">
                <span>09:00—21:00</span>
                <span>·</span>
                <span className="text-[#1B4332] font-bold">Ойбек</span>
              </div>
            </div>
          </div>

          {/* Rating Pill + Language Segmented Control */}
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#1C1B1A] border border-white/90 shadow-xs">
              <Star className="w-3 h-3 fill-[#E6A117] text-[#E6A117]" />
              <span>4.98</span>
            </div>

            <div className="flex items-center gap-0.5 bg-[#ECE8E1]/90 p-0.5 rounded-full text-xs font-bold">
              {(['ru', 'uz', 'en'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    triggerHaptic('light');
                    setLang(l);
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all duration-200 text-[10px] apple-press ${
                    lang === l
                      ? 'bg-white text-[#1C1B1A] shadow-sm font-extrabold'
                      : 'text-[#6B6762] hover:text-[#1C1B1A]'
                  }`}
                >
                  {l === 'ru' ? 'РУС' : l === 'uz' ? 'O‘ZB' : 'ENG'}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* 2. TAB CONTENT VIEWS */}
      <main className="flex-1 px-3 pt-3 max-w-xl mx-auto w-full">
        
        {/* ========================================================
            TAB 1: ГЛАВНАЯ (HOME / DASHBOARD)
           ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Hero Apple Glass Dark Card with Shimmering Sheen */}
            <div className="apple-glass-dark shimmer-layer rounded-[32px] p-6 sm:p-7 text-white relative overflow-hidden">
              <div className="relative z-10">
                
                {/* Top Badge with Live Pulsing Dot */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide mb-3 backdrop-blur-md border border-white/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <span>
                    {lang === 'ru' && 'Бесплатный 3D-снимок (КТ) при записи'}
                    {lang === 'uz' && 'Birinchi ko‘rikda bepul 3D KT rentgen'}
                    {lang === 'en' && 'Free 3D CT scan with initial exam'}
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-[24px] sm:text-[29px] leading-[1.12] mb-2.5">
                  {lang === 'ru' && 'Швейцарская точность и эстетика улыбки'}
                  {lang === 'uz' && 'Toshkent markazida Shveytsariya aniqligi'}
                  {lang === 'en' && 'Swiss precision dentistry in Tashkent'}
                </h1>

                <p className="text-white/85 text-[13px] sm:text-[14px] leading-relaxed mb-5 font-normal">
                  {lang === 'ru' && 'Официальные протоколы Straumann и Damon. Бережное лечение под микроскопом и фиксированная прозрачная смета без доплат.'}
                  {lang === 'uz' && 'Straumann va Damon rasmiy protokollari. Mikroskop ostida og‘riqsiz davolash va aniq narx rejasi.'}
                  {lang === 'en' && 'Official Straumann & Damon protocols. Gentle microscope care with 100% transparent pricing.'}
                </p>

                {/* Micro-Social Proof / Doctor Avatar Stack */}
                <div className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl w-fit border border-white/10">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-6 w-6 rounded-full bg-[#E2DDD4] text-[#1B4332] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332]">СК</div>
                    <div className="inline-block h-6 w-6 rounded-full bg-[#ECE8E1] text-[#1B4332] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332]">МУ</div>
                    <div className="inline-block h-6 w-6 rounded-full bg-[#E3DDD4] text-[#1B4332] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332]">ТР</div>
                  </div>
                  <span className="text-[11px] text-white/90 font-medium">
                    {lang === 'ru' && '4 ведущих хирурга на смене сегодня'}
                    {lang === 'uz' && 'Bugun 4 nafar yetakchi shifokor qabulda'}
                    {lang === 'en' && '4 senior specialists on duty today'}
                  </span>
                </div>

                {/* Apple Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => openBookingFor(
                      lang === 'ru' ? 'Консультация главврача + 3D-снимок (0 сум)' : 'Bosh shifokor ko‘rigi + 3D KT (0 so‘m)'
                    )}
                    className="font-bold text-xs bg-white text-[#1B4332] px-6 py-3.5 rounded-full hover:bg-white/95 transition-all text-center shadow-lg active:scale-95 apple-press flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'ru' ? 'Записаться на 3D-осмотр (0 сум)' : lang === 'uz' ? '3D-ko‘rikka yozilish (0 so‘m)' : 'Book Free 3D Exam ($0)'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => switchTab('calculator')}
                    className="font-semibold text-xs bg-white/15 hover:bg-white/25 text-white px-5 py-3.5 rounded-full backdrop-blur-md transition-all text-center active:scale-95 apple-press"
                  >
                    {lang === 'ru' && 'Калькулятор сметы'}
                    {lang === 'uz' && 'Narx kalkulyatori'}
                    {lang === 'en' && 'Cost calculator'}
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Quick-Access Rounded Grid with Live Tags */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => switchTab('services')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all apple-press flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] shadow-xs group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1B4332] bg-[#1B4332]/10 px-2 py-0.5 rounded-full">
                    Прайс 2026
                  </span>
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Каталог услуг'}
                    {lang === 'uz' && 'Xizmatlar'}
                    {lang === 'en' && 'Services'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && '7 категорий и цены'}
                    {lang === 'uz' && '7 yo‘nalish va narxlar'}
                    {lang === 'en' && '7 categories & rates'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('calculator')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all apple-press flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] shadow-xs group-hover:scale-105 transition-transform">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-[#E6A117] bg-[#E6A117]/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    3D Смета
                  </span>
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Калькулятор'}
                    {lang === 'uz' && 'Kalkulyator'}
                    {lang === 'en' && 'Calculator'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && 'Точный расчёт в суммах'}
                    {lang === 'uz' && 'Aniq hisob-kitob'}
                    {lang === 'en' && 'Instant estimate'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('doctors')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all apple-press flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] shadow-xs group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1B4332] bg-[#1B4332]/10 px-2 py-0.5 rounded-full">
                    9–16 лет
                  </span>
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Врачи клиники'}
                    {lang === 'uz' && 'Shifokorlar'}
                    {lang === 'en' && 'Doctors'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && 'Хирурги и ортодонты'}
                    {lang === 'uz' && 'Xirurg va ortodontlar'}
                    {lang === 'en' && 'Surgeons & specialists'}
                  </div>
                </div>
              </div>

              <div
                onClick={() => switchTab('contacts')}
                className="apple-glass rounded-[28px] p-5 cursor-pointer hover:bg-white/95 transition-all apple-press flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#ECE8E1] flex items-center justify-center text-[#1B4332] shadow-xs group-hover:scale-105 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1C1B1A] bg-white px-2 py-0.5 rounded-full border border-black/5">
                    Парковка
                  </span>
                </div>
                <div>
                  <div className="font-display font-extrabold text-[15px] text-[#1C1B1A] flex items-center justify-between">
                    {lang === 'ru' && 'Адрес и часы'}
                    {lang === 'uz' && 'Manzil va vaqt'}
                    {lang === 'en' && 'Location'}
                    <ChevronRight className="w-4 h-4 text-[#6B6762] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[11px] text-[#6B6762] font-medium mt-0.5">
                    {lang === 'ru' && 'Метро Ойбек, 09-21'}
                    {lang === 'uz' && 'Oybek metrosi, 09-21'}
                    {lang === 'en' && 'Oybek metro, 9-21'}
                  </div>
                </div>
              </div>
            </div>

            {/* Flagship Carousel with Quality Micro-Badges */}
            <div className="apple-glass rounded-[32px] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-display font-black text-base text-[#1C1B1A]">
                    {lang === 'ru' && 'Флагманские направления'}
                    {lang === 'uz' && 'Asosiy xizmatlar'}
                    {lang === 'en' && 'Featured Treatments'}
                  </div>
                  <div className="text-[11px] text-[#6B6762]">
                    {lang === 'ru' && 'Швейцарские и американские протоколы'}
                    {lang === 'uz' && 'Shveytsariya va AQSh protokollari'}
                    {lang === 'en' && 'Swiss & USA protocols'}
                  </div>
                </div>
                <button
                  onClick={() => switchTab('services')}
                  className="text-xs font-bold text-[#1B4332] flex items-center gap-0.5 bg-[#1B4332]/10 px-3 py-1.5 rounded-full apple-press"
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
                    badge: '10 лет гарантии',
                    price: '3 200 000 сум',
                    usd: '$250',
                    note: lang === 'ru' ? '3-5 дней, 2 визита' : '3-5 kun, 2 tashrif',
                  },
                  {
                    title: lang === 'ru' ? 'Импланты Straumann' : 'Straumann Implantlari',
                    maker: 'Straumann SLA (Швейцария)',
                    badge: '99.6% приживление',
                    price: '7 200 000 сум',
                    usd: '$580',
                    note: lang === 'ru' ? 'Пожизненный паспорт' : 'Umrbod pasport',
                  },
                  {
                    title: lang === 'ru' ? 'Брекеты Damon Q2' : 'Damon Q2 Breketlari',
                    maker: 'Ormco (США)',
                    badge: 'Без удаления',
                    price: '7 500 000 сум',
                    usd: '$600',
                    note: lang === 'ru' ? 'Быстрое исправление' : "Tezkor tekislash",
                  },
                  {
                    title: lang === 'ru' ? 'Элайнеры Spark' : 'Spark Elaynerlari',
                    maker: 'TruGEN (США)',
                    badge: '100% невидимо',
                    price: '15 000 000 сум',
                    usd: '$1 200',
                    note: lang === 'ru' ? 'Комфортно есть и говорить' : 'Mutlaqo sezilmaydi',
                  },
                ].map((specimen, idx) => (
                  <div
                    key={idx}
                    onClick={() => openBookingFor(specimen.title)}
                    className="snap-item min-w-[215px] bg-[#ECE8E1]/65 hover:bg-[#ECE8E1] transition-all rounded-[24px] p-5 flex flex-col justify-between cursor-pointer border border-white/80 active:scale-97 apple-press"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#6B6762] uppercase tracking-wider">
                          {specimen.maker}
                        </span>
                        <span className="text-[9px] font-bold text-[#1B4332] bg-white/80 px-2 py-0.5 rounded-full">
                          {specimen.badge}
                        </span>
                      </div>
                      <div className="font-display font-bold text-[15px] text-[#1C1B1A] leading-snug mb-1">
                        {specimen.title}
                      </div>
                      <div className="text-[12px] text-[#524F4B] mb-3">
                        {specimen.note}
                      </div>
                    </div>
                    <div className="pt-2.5 border-t border-[#DDD8CE]/60 flex items-baseline justify-between">
                      <span className="font-extrabold text-sm text-[#1B4332]">{specimen.price}</span>
                      <span className="text-xs font-semibold text-[#6B6762]">{specimen.usd}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Standard Pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="apple-glass rounded-3xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-extrabold text-[#1C1B1A]">100% стерильно</div>
                <div className="text-[10px] text-[#6B6762]">Автоклавы B</div>
              </div>
              <div className="apple-glass rounded-3xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs font-extrabold text-[#1C1B1A]">Швейцария</div>
                <div className="text-[10px] text-[#6B6762]">Сертификаты</div>
              </div>
              <div className="apple-glass rounded-3xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs font-extrabold text-[#1C1B1A]">09:00 — 21:00</div>
                <div className="text-[10px] text-[#6B6762]">Без выходных</div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 2: УСЛУГИ (SERVICES & PRICING WITH SEARCH)
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
                {lang === 'ru' && 'Анестезия, 3D-контроль и расходные материалы включены в стоимость.'}
                {lang === 'uz' && 'Anesteziya va sarf materiallari narx ichiga kiritilgan.'}
                {lang === 'en' && 'All anesthesia, 3D controls and disposables are fully included.'}
              </p>
            </div>

            {/* Apple Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B6762] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск услуги (виниры, импланты, чистка)...' : 'Xizmatni qidiring...'}
                className="w-full pl-10 pr-10 py-3 bg-white/80 rounded-full border border-white/90 apple-glass text-xs text-[#1C1B1A] placeholder-[#6B6762] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-5 h-5 rounded-full bg-[#ECE8E1] text-[#6B6762] absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              )}
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
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 apple-press ${
                    selectedCategory === cat.id
                      ? 'bg-[#1B4332] text-white shadow-md'
                      : 'apple-glass text-[#6B6762] hover:text-[#1C1B1A]'
                  }`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>

            {/* Installment Banner Card */}
            <div className="apple-glass rounded-2xl p-3 flex items-center justify-between text-xs font-medium text-[#1B4332] bg-[#1B4332]/5 border border-[#1B4332]/10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'ru' ? 'Рассрочка 0% до 12 месяцев (Uzum Nasiya, Anorbank)' : '12 oygacha 0% muddatli to‘lov mavjud'}</span>
              </div>
              <span className="font-bold text-[11px] bg-white px-2 py-0.5 rounded-full shadow-2xs">0-0-12</span>
            </div>

            {/* Services Cards (Rounded 30px) */}
            <div className="space-y-3.5">
              {filteredServices.length === 0 ? (
                <div className="text-center py-10 apple-glass rounded-[30px] p-6 text-[#6B6762] text-xs">
                  {lang === 'ru' && 'По вашему запросу ничего не найдено. Напишите нам в чат!'}
                  {lang === 'uz' && 'Xizmat topilmadi.'}
                  {lang === 'en' && 'No services matched your query.'}
                </div>
              ) : (
                filteredServices.map((svc) => (
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
                        className="text-xs font-bold bg-[#1C1B1A] text-white px-5 py-2.5 rounded-full hover:bg-[#1B4332] transition-colors apple-press shadow-sm"
                      >
                        {lang === 'ru' && 'Записаться'}
                        {lang === 'uz' && 'Yozilish'}
                        {lang === 'en' && 'Book'}
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                  className={`p-4 rounded-[24px] text-left transition-all duration-200 text-xs font-bold apple-press relative overflow-hidden ${
                    activePlanIdx === idx
                      ? 'bg-[#1B4332] text-white shadow-lg'
                      : 'apple-glass text-[#1C1B1A] hover:bg-white/95'
                  }`}
                >
                  <div className="text-[10px] opacity-80 mb-1">{opt.highlightBadge[lang]}</div>
                  <div className="text-sm font-extrabold">{opt.name[lang]}</div>
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
                  <span className="font-extrabold text-sm min-w-[28px] text-center">
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
              <div className="bg-[#ECE8E1]/60 rounded-[24px] p-4 text-xs text-[#524F4B] space-y-2.5">
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
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#1B4332] shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{lang === 'ru' ? 'Компьютерная томография (КТ 3D) входит бесплатно' : '3D KT rentgen bepul'}</span>
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
                  className="font-bold text-xs bg-[#1B4332] text-white px-6 py-3.5 rounded-full hover:bg-[#143326] transition-all shadow-md active:scale-95 apple-press flex items-center gap-1.5"
                >
                  <span>{lang === 'ru' ? 'Зафиксировать расчёт' : lang === 'uz' ? 'Hisobni tasdiqlash' : 'Lock estimate'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
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
                  className="apple-glass rounded-[32px] p-6 hover:bg-white/95 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden"
                >
                  {/* Status Indicator */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-black text-base tracking-wider shrink-0 shadow-md">
                        {doc.initials}
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-base sm:text-lg text-[#1C1B1A] flex items-center gap-1.5">
                          {doc.name[lang]}
                          <CheckCircle2 className="w-4 h-4 text-[#1B4332] inline" />
                        </div>
                        <div className="text-xs font-bold text-[#1B4332] mt-0.5">
                          {doc.role[lang]}
                        </div>
                        <div className="text-[11px] font-semibold text-[#6B6762] mt-0.5 flex items-center gap-2">
                          <span>{lang === 'ru' ? `Стаж ${doc.experienceYears} лет` : `${doc.experienceYears} yil tajriba`}</span>
                          <span>·</span>
                          <span className="flex items-center text-[#E6A117] font-bold">
                            <Star className="w-3 h-3 fill-current inline mr-0.5" /> 4.99
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B4332]/10 text-[#1B4332]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] inline-block animate-pulse"></span>
                      Приём
                    </span>
                  </div>

                  <p className="text-xs text-[#524F4B] leading-relaxed mb-4 bg-[#ECE8E1]/60 p-4 rounded-2xl">
                    {doc.credentials[lang]}
                  </p>

                  <button
                    onClick={() => openBookingFor('Консультация', doc.name[lang])}
                    className="w-full text-xs font-bold py-3 rounded-full bg-[#1C1B1A] text-white hover:bg-[#1B4332] transition-colors text-center active:scale-97 apple-press shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'ru' ? 'Записаться к доктору' : lang === 'uz' ? 'Qabuliga yozilish' : 'Book with doctor'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
                  className="flex-1 text-center font-bold text-xs py-3.5 rounded-full bg-[#1B4332] text-white hover:bg-[#143326] transition-colors flex items-center justify-center gap-1.5 active:scale-97 apple-press shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  {lang === 'ru' && 'Маршрут на Яндекс.Картах'}
                  {lang === 'uz' && 'Yandex Xaritada ochish'}
                  {lang === 'en' && 'Yandex Maps route'}
                </a>

                <a
                  href="tel:+998712000000"
                  className="flex-1 text-center font-bold text-xs py-3.5 rounded-full apple-glass text-[#1C1B1A] hover:bg-white transition-colors flex items-center justify-center gap-1.5 active:scale-97 apple-press shadow-xs"
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
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 apple-press ${
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
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 apple-press ${
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
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 apple-press ${
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
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 apple-press ${
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
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 apple-press ${
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
          4. APPLE ROUNDED BOTTOM SHEET (Interactive Slots & Pills)
         ======================================================== */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#F6F4F0] p-6 max-h-[90vh] overflow-y-auto rounded-t-[36px] sm:rounded-[36px] shadow-2xl border-t sm:border border-white/90 animate-in slide-in-from-bottom duration-250">
            
            {/* Apple Drag Handle Pill */}
            <div className="w-12 h-1.5 bg-[#DDD8CE] rounded-full mx-auto mb-4" />

            {isSuccess ? (
              <div className="text-center py-6 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-[#1B4332] text-white flex items-center justify-center mx-auto mb-3 shadow-lg pulse-glow">
                  <Check className="w-8 h-8" />
                </div>
                <div className="font-display font-extrabold text-xl text-[#1C1B1A] mb-1.5">
                  {lang === 'ru' && 'Запись подтверждена'}
                  {lang === 'uz' && 'Ariza qabul qilindi'}
                  {lang === 'en' && 'Booking Confirmed'}
                </div>
                <p className="text-xs text-[#524F4B] mb-6 leading-relaxed max-w-xs mx-auto">
                  {lang === 'ru' && 'Ваш запрос отправлен главному администратору клиники. Мы перезвоним вам в течение 10 минут.'}
                  {lang === 'uz' && "Arizangiz qabul qilindi. 10 daqiqa ichida administratorimiz siz bilan bog'lanadi."}
                  {lang === 'en' && 'Our clinic administrator will contact you within 10 minutes.'}
                </p>
                <button
                  onClick={() => {
                    setIsBookingOpen(false);
                    setIsSuccess(false);
                  }}
                  className="w-full font-bold text-xs bg-[#1C1B1A] text-white py-3.5 rounded-full active:scale-95 shadow-md apple-press"
                >
                  {lang === 'ru' && 'Отлично'}
                  {lang === 'uz' && 'Ajoyib'}
                  {lang === 'en' && 'Great'}
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
                    <div className="text-xs text-[#1B4332] font-bold mt-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
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
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-sm text-[#1C1B1A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 shadow-xs"
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
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-sm text-[#1C1B1A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 shadow-xs"
                  />
                </div>

                {/* Date Preset Pills */}
                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'День приёма:'}
                    {lang === 'uz' && 'Qabul kuni:'}
                    {lang === 'en' && 'Preferred Day:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DATE_PRESETS.map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedDatePreset(d.id);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all apple-press ${
                          selectedDatePreset === d.id
                            ? 'bg-[#1B4332] text-white shadow-sm'
                            : 'bg-white border border-[#DDD8CE]/70 text-[#6B6762]'
                        }`}
                      >
                        {d.label[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selector Pills */}
                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'Удобное время:'}
                    {lang === 'uz' && 'Qulay vaqt:'}
                    {lang === 'en' && 'Preferred Time:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedTimeSlot(slot);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all apple-press ${
                          selectedTimeSlot === slot
                            ? 'bg-[#1B4332] text-white shadow-sm'
                            : 'bg-white border border-[#DDD8CE]/70 text-[#1C1B1A]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#4A4743] mb-1.5">
                    {lang === 'ru' && 'Врач:'}
                    {lang === 'uz' && 'Shifokor:'}
                    {lang === 'en' && 'Doctor:'}
                  </label>
                  <select
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="w-full px-4 py-3 bg-white rounded-2xl border border-[#DDD8CE]/80 text-xs font-semibold text-[#1C1B1A] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 shadow-xs"
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
                    className="w-full font-bold text-xs bg-[#1B4332] text-white py-4 rounded-full hover:bg-[#143326] transition-all shadow-md active:scale-97 apple-press flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'ru' ? 'Подтвердить бронирование' : lang === 'uz' ? 'Band qilishni tasdiqlash' : 'Confirm Booking'}</span>
                    <ArrowUpRight className="w-4 h-4" />
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