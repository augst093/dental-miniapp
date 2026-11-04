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
  Check,
  X,
  Plus,
  Minus,
  Search,
  Building2,
  Camera,
  ArrowRight,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  SERVICES,
  DOCTORS,
  CATEGORIES,
  TREATMENT_CALCULATOR_OPTIONS,
  CLINIC_REVIEWS,
  UI_TRANSLATIONS,
  Language,
  Doctor,
} from '../data/clinicData';

type TabType = 'home' | 'services' | 'calculator' | 'doctors' | 'contacts';

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
  const [planUnits, setPlanUnits] = useState<number>(TREATMENT_CALCULATOR_OPTIONS[0].defaultUnits);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingService, setBookingService] = useState<string>('Консультация врача + 3D-снимок (КТ)');
  const [bookingDoctor, setBookingDoctor] = useState<string>('Любой профильный специалист');
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
      const userName = tg.initDataUnsafe?.user?.first_name;
      const userLang = tg.initDataUnsafe?.user?.language_code;
      if (userName || userLang === 'uz') {
        setTimeout(() => {
          if (userName) setClientName(userName);
          if (userLang === 'uz') setLang('uz');
        }, 0);
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

  const currentPlan = TREATMENT_CALCULATOR_OPTIONS[activePlanIdx];
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
        const fullDateStr = `${
          selectedDatePreset === 'today' ? 'Сегодня' : selectedDatePreset === 'tomorrow' ? 'Завтра' : 'Выходные'
        } в ${selectedTimeSlot}`;
        const payload = {
          name: clientName.trim() || 'Пациент',
          phone: clientPhone.trim() || 'Не указан',
          service: bookingService,
          doctor: bookingDoctor,
          date: fullDateStr,
          source: 'Mini App (Clinical Web)',
        };
        tg.sendData(JSON.stringify(payload));
      } catch {
        // Fallback in web browser tests
      }
    }
  };

  const filteredServices = SERVICES.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.name[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description[lang].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const t = UI_TRANSLATIONS;

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans">
      {/* ========================================================
          1. HEADER (Opaque, Zero Bleed, High Contrast)
         ======================================================== */}
      <header className="sticky top-0 z-30 header-bar px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Clinic Brand & Address */}
          <div>
            <div className="font-bold text-base tracking-tight text-[var(--ink)] flex items-center gap-1.5 leading-none">
              <span>{CLINIC_CONFIG.name[lang]}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true"></span>
            </div>
            <div className="text-[13px] text-[var(--ink-secondary)] mt-0.5 font-medium">
              <span>{CLINIC_CONFIG.city[lang]}</span>
              <span className="mx-1">·</span>
              <span>{CLINIC_CONFIG.hours.weekdays}</span>
            </div>
          </div>

          {/* Language Selector (Touch targets >= 44x36px with clear active indicator) */}
          <div className="flex items-center bg-[var(--surface-subtle)] p-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
            {(['ru', 'uz', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  triggerHaptic('light');
                  setLang(l);
                }}
                aria-label={`Выбрать язык ${l.toUpperCase()}`}
                className={`min-h-[36px] px-3 rounded-[6px] text-[13px] font-semibold transition-colors ${
                  lang === l
                    ? 'bg-white text-[var(--ink)] shadow-xs font-bold border border-slate-200/80'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                }`}
              >
                {l === 'ru' ? 'РУС' : l === 'uz' ? 'O‘ZB' : 'ENG'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ========================================================
          2. MAIN TAB CONTENT (Container max-w-xl, pb-36 for safe dock clearance)
         ======================================================== */}
      <main className="flex-1 px-4 pt-4 pb-36 max-w-xl mx-auto w-full">
        {/* ========================================================
            TAB 1: ГЛАВНАЯ (HOME / DASHBOARD)
           ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-5">
            {/* Hero Section: Flat Medical Color (No AI Gradient), Specific Value, Verified Team */}
            <div className="bg-[var(--accent)] text-white rounded-[var(--radius-lg)] p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="relative z-10">
                {/* Diagnostic Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-sm)] bg-white/15 text-[13px] font-medium tracking-wide mb-3 backdrop-blur-xs border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-teal-200" aria-hidden="true"></span>
                  <span>{t.hero.badge[lang]}</span>
                </div>

                {/* Hero Title: Strictly under 8 words */}
                <h1 className="font-extrabold text-2xl sm:text-3xl leading-snug tracking-tight mb-2.5">
                  {t.hero.title[lang]}
                </h1>

                {/* Benefit description */}
                <p className="text-white/90 text-sm sm:text-[15px] leading-relaxed mb-4">
                  {t.hero.subtitle[lang]}
                </p>

                {/* Real Photo Placeholder: Aspect 16:9 for clinic/treatment room */}
                <div className="aspect-[16/9] w-full rounded-[var(--radius-md)] overflow-hidden bg-teal-950/40 border border-white/15 my-3 flex flex-col items-center justify-center text-center p-4">
                  {/* TODO: заменить реальным фото клиники / лечебного кабинета */}
                  <Camera className="w-7 h-7 text-white/70 mb-1.5" aria-hidden="true" />
                  <span className="text-xs text-white/80 font-medium">
                    {lang === 'ru' && 'Кабинет цифровой томографии и хирургии DentaLux'}
                    {lang === 'uz' && 'DentaLux raqamli tomografiya va jarrohlik xonasi'}
                    {lang === 'en' && 'DentaLux Digital CT & Surgery Suite'}
                  </span>
                  <span className="text-[11px] text-white/60 mt-0.5">
                    {/* TODO: загрузить фото интерьера клиники */}
                    (Фото клиники)
                  </span>
                </div>

                {/* Doctor Avatar Stack: Clean readable initials, verified staff */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex -space-x-2">
                    {DOCTORS.map((doc) => (
                      <div
                        key={doc.id}
                        className="w-8 h-8 rounded-full border-2 border-[var(--accent)] bg-white text-[var(--accent)] flex items-center justify-center font-bold text-xs shadow-xs"
                      >
                        {doc.photoUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={doc.photoUrl}
                            alt={doc.name[lang]}
                            className="w-full h-full object-cover rounded-full"
                            loading="lazy"
                          />
                        ) : (
                          <span>{doc.initials}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[13px] text-white/90 font-medium">
                    {t.hero.teamSubtitle[lang]}
                  </span>
                </div>

                {/* Action Buttons: Min 44px height, no '(0 сум)' in text */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
                  <button
                    onClick={() => openBookingFor('Первичная консультация + 3D-снимок')}
                    className="touch-target font-bold text-sm bg-white text-[var(--accent)] px-5 py-3 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors text-center shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>{t.hero.ctaBooking[lang]}</span>
                    <span className="text-[11px] font-extrabold bg-teal-100 text-[var(--accent)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                      {t.hero.badgeFree[lang]}
                    </span>
                  </button>

                  <button
                    onClick={() => switchTab('calculator')}
                    className="touch-target font-semibold text-sm bg-white/15 hover:bg-white/20 text-white px-5 py-3 rounded-[var(--radius-md)] transition-colors text-center border border-white/20 flex items-center justify-center"
                  >
                    {t.hero.ctaCalculator[lang]}
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tiles: High utility, clear hierarchy, no gray identical square icons */}
            <div className="space-y-2.5">
              {/* Primary Actions: 2 Prominent Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Catalog */}
                <div
                  onClick={() => switchTab('services')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && switchTab('services')}
                  className="clinic-card-interactive p-4 sm:p-5 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded-[var(--radius-sm)]">
                      {t.quickTiles.catalogBadge[lang]}
                    </span>
                    <Layers className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[var(--ink)]">
                      {t.quickTiles.catalogTitle[lang]}
                    </h2>
                    <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                      {t.quickTiles.catalogSub[lang]}
                    </p>
                  </div>
                </div>

                {/* 2. Calculator */}
                <div
                  onClick={() => switchTab('calculator')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && switchTab('calculator')}
                  className="clinic-card-interactive p-4 sm:p-5 bg-teal-50/60 border-teal-200/80 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-[var(--radius-sm)]">
                      {t.quickTiles.calcBadge[lang]}
                    </span>
                    <Calculator className="w-5 h-5 text-teal-800" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[var(--ink)]">
                      {t.quickTiles.calcTitle[lang]}
                    </h2>
                    <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                      {t.quickTiles.calcSub[lang]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Utility Row: Compact Cards (Doctors + Clinic Info) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Doctors */}
                <div
                  onClick={() => switchTab('doctors')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && switchTab('doctors')}
                  className="clinic-card-interactive p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[var(--ink-secondary)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
                      {t.quickTiles.doctorsBadge[lang]}
                    </span>
                    <Users className="w-4 h-4 text-[var(--ink-muted)]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--ink)]">
                      {t.quickTiles.doctorsTitle[lang]}
                    </h3>
                    <p className="text-[12px] text-[var(--ink-secondary)] truncate">
                      {t.quickTiles.doctorsSub[lang]}
                    </p>
                  </div>
                </div>

                {/* Contacts & Location */}
                <div
                  onClick={() => switchTab('contacts')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && switchTab('contacts')}
                  className="clinic-card-interactive p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[var(--ink-secondary)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
                      {t.quickTiles.contactsBadge[lang]}
                    </span>
                    <MapPin className="w-4 h-4 text-[var(--ink-muted)]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--ink)]">
                      {t.quickTiles.contactsTitle[lang]}
                    </h3>
                    <p className="text-[12px] text-[var(--ink-secondary)] truncate">
                      {t.quickTiles.contactsSub[lang]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Treatments: Clean Section WITHOUT Nested "Card in Card" */}
            <section className="space-y-3 pt-1">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">
                    {t.featured.title[lang]}
                  </h3>
                  <p className="text-[13px] text-[var(--ink-secondary)]">
                    {t.featured.subtitle[lang]}
                  </p>
                </div>
                <button
                  onClick={() => switchTab('services')}
                  className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 shrink-0 px-2 py-1"
                >
                  <span>{t.featured.viewAll[lang]}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Horizontal List of Treatments with Verifiable Facts (No Fake 99.6% / 10 year guarantees) */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {TREATMENT_CALCULATOR_OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openBookingFor(item.name[lang])}
                    className="clinic-card-interactive min-w-[240px] max-w-[280px] p-4 flex flex-col justify-between cursor-pointer shrink-0"
                  >
                    <div>
                      {item.partnerBrand && CLINIC_CONFIG.partnerBrands.includes(item.partnerBrand) && (
                        <span className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-[var(--radius-sm)] inline-block mb-1.5">
                          {item.partnerBrand}
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-[var(--ink)] mb-1">
                        {item.name[lang]}
                      </h4>
                      <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed mb-3">
                        {item.clinicalScope[lang]}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-[var(--border)] flex items-baseline justify-between">
                      <div>
                        <div className="font-bold text-sm text-[var(--accent)]">
                          от {item.basePriceUzs.toLocaleString('ru-RU')} сум
                        </div>
                        <div className="text-[11px] text-[var(--ink-muted)]">
                          ≈ ${item.basePriceUsd}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                        {item.durationStr[lang].split('(')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Clinical Trust & Standards (Verifiable facts only) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="clinic-card p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                  <span className="text-xs font-bold text-[var(--ink)]">
                    {t.standards.diagnosticsTitle[lang]}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--ink-secondary)]">
                  {t.standards.diagnosticsDesc[lang]}
                </p>
              </div>

              <div className="clinic-card p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                  <span className="text-xs font-bold text-[var(--ink)]">
                    {t.standards.hoursTitle[lang]}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--ink-secondary)]">
                  {t.standards.hoursDesc[lang]}
                </p>
              </div>

              <div className="clinic-card p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-[var(--accent)]" aria-hidden="true" />
                  <span className="text-xs font-bold text-[var(--ink)]">
                    {t.standards.licenseTitle[lang]}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--ink-secondary)]">
                  {CLINIC_CONFIG.licenseNumber}
                </p>
              </div>
            </div>

            {/* Patient Reviews Section: Clean placeholder with TODO comment */}
            <div className="clinic-card p-4 text-center">
              {/* TODO: подключить реальные отзывы пациентов клиники (Яндекс.Карты / Google) */}
              <div className="text-xs font-bold text-[var(--ink)] mb-0.5">
                {lang === 'ru' && 'Отзывы пациентов клиники'}
                {lang === 'uz' && 'Klinika bemorlarining fikrlari'}
                {lang === 'en' && 'Patient Reviews'}
              </div>
              <p className="text-[13px] text-[var(--ink-secondary)]">
                {lang === 'ru' && 'Мы собираем честную обратную связь после каждого завершённого курса лечения.'}
                {lang === 'uz' && 'Har bir muolajadan so‘ng bemorlarning haqqoniy fikrlarini yig‘ib boramiz.'}
                {lang === 'en' && 'We gather authentic verified feedback after every completed treatment plan.'}
              </p>
              {CLINIC_REVIEWS.length > 0 && (
                <div className="text-xs text-[var(--ink-muted)] mt-1">
                  {CLINIC_REVIEWS.length} {lang === 'ru' ? 'отзывов' : 'reviews'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: УСЛУГИ (SERVICES CATALOG & SEARCH)
           ======================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-xl text-[var(--ink)]">
                {lang === 'ru' && 'Каталог услуг и прейскурант'}
                {lang === 'uz' && 'Xizmatlar katalogi va narxnoma'}
                {lang === 'en' && 'Service Catalog & Pricing'}
              </h2>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                {lang === 'ru' && 'Цены включают первичный осмотр, стерильные наборы и необходимые расходные материалы.'}
                {lang === 'uz' && 'Narxlarga ko‘rik, steril to‘plamlar va barcha sarf materiallari kiritilgan.'}
                {lang === 'en' && 'All rates include sterile tray sets, local anesthesia and necessary disposables.'}
              </p>
            </div>

            {/* Search Input: Min 44px touch target */}
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'ru'
                    ? 'Поиск по названию услуги (имплантация, брекеты, гигиена)...'
                    : lang === 'uz'
                    ? 'Xizmat nomi bo‘yicha qidiruv...'
                    : 'Search services...'
                }
                className="w-full pl-10 pr-10 min-h-[44px] bg-white rounded-[var(--radius-md)] border border-[var(--border)] text-sm text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Очистить поиск"
                  className="w-7 h-7 rounded-full bg-[var(--surface-subtle)] text-[var(--ink-secondary)] absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills: Min 44px touch target */}
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedCategory(cat.id);
                  }}
                  className={`min-h-[44px] px-3.5 rounded-[var(--radius-sm)] text-[13px] font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--accent)] text-white font-bold'
                      : 'bg-white border border-[var(--border)] text-[var(--ink-secondary)] hover:text-[var(--ink)]'
                  }`}
                >
                  {cat.label[lang]}
                </button>
              ))}
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {filteredServices.length === 0 ? (
                <div className="clinic-card p-6 text-center text-[var(--ink-secondary)] text-sm">
                  {lang === 'ru' && 'По вашему запросу услуг не найдено.'}
                  {lang === 'uz' && 'So‘rovingiz bo‘yicha xizmatlar topilmadi.'}
                  {lang === 'en' && 'No services matched your query.'}
                </div>
              ) : (
                filteredServices.map((svc) => (
                  <div key={svc.id} className="clinic-card p-4 sm:p-5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-base text-[var(--ink)] leading-snug">
                          {svc.name[lang]}
                        </h3>
                        <span className="text-[12px] font-medium text-[var(--ink-secondary)] bg-[var(--surface-subtle)] px-2.5 py-0.5 rounded-[var(--radius-sm)] whitespace-nowrap border border-[var(--border)]">
                          {svc.duration[lang]}
                        </span>
                      </div>
                      <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
                        {svc.description[lang]}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-base text-[var(--accent)]">
                          {svc.priceUzs}
                        </div>
                        {svc.priceUsd && (
                          <div className="text-[12px] text-[var(--ink-muted)]">
                            ≈ {svc.priceUsd}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => openBookingFor(svc.name[lang])}
                        className="touch-target text-xs font-bold bg-[var(--accent)] text-white px-4 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
                      >
                        {lang === 'ru' ? 'Записаться' : lang === 'uz' ? 'Yozilish' : 'Book'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: КАЛЬКУЛЯТОР (ESTIMATOR)
           ======================================================== */}
        {activeTab === 'calculator' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-xl text-[var(--ink)]">
                {t.quickTiles.calcTitle[lang]}
              </h2>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                {lang === 'ru' && 'Ориентировочный расчёт стоимости и объёма лечения. Окончательная смета составляется после осмотра.'}
                {lang === 'uz' && 'Taxminiy hisob-kitob. Aniq smeta shifokor ko‘rigidan so‘ng tasdiqlanadi.'}
                {lang === 'en' && 'Preliminary estimate. Final treatment plan is verified during clinical examination.'}
              </p>
            </div>

            {/* Treatment Selector */}
            <div className="grid grid-cols-2 gap-2">
              {TREATMENT_CALCULATOR_OPTIONS.map((opt, idx) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActivePlanIdx(idx);
                    setPlanUnits(opt.defaultUnits);
                  }}
                  className={`min-h-[44px] p-3 rounded-[var(--radius-md)] text-left transition-colors border ${
                    activePlanIdx === idx
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-bold'
                      : 'bg-white text-[var(--ink)] border-[var(--border)] hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[11px] opacity-80 mb-0.5">
                    {opt.partnerBrand || 'Протокол'}
                  </div>
                  <div className="text-[13px] leading-tight">
                    {opt.name[lang]}
                  </div>
                </button>
              ))}
            </div>

            {/* Calculation Card */}
            <div className="clinic-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--ink-muted)]">
                    {lang === 'ru' ? 'Выбранная процедура' : lang === 'uz' ? 'Tanlangan muolaja' : 'Selected Procedure'}
                  </div>
                  <div className="font-bold text-base text-[var(--ink)] mt-0.5">
                    {currentPlan.name[lang]}
                  </div>
                </div>

                {/* Stepper with >= 44x44px accessible buttons */}
                <div className="flex items-center gap-2 bg-[var(--surface-subtle)] p-1 rounded-[var(--radius-sm)] border border-[var(--border)]">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits > 1) setPlanUnits(planUnits - 1);
                    }}
                    aria-label="Уменьшить количество"
                    className="touch-target w-10 h-10 rounded-[6px] bg-white flex items-center justify-center text-[var(--ink)] shadow-xs font-bold border border-slate-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm min-w-[28px] text-center">
                    {planUnits}
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits < 16) setPlanUnits(planUnits + 1);
                    }}
                    aria-label="Увеличить количество"
                    className="touch-target w-10 h-10 rounded-[6px] bg-white flex items-center justify-center text-[var(--ink)] shadow-xs font-bold border border-slate-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scope Breakdown */}
              <div className="bg-[var(--surface-subtle)] rounded-[var(--radius-sm)] p-3.5 text-[13px] text-[var(--ink-secondary)] space-y-2 border border-[var(--border)]">
                <div>
                  <span className="font-bold text-[var(--ink)]">
                    {lang === 'ru' ? 'Клинический объём: ' : 'Klinik hajm: '}
                  </span>
                  <span>{currentPlan.clinicalScope[lang]}</span>
                </div>
                <div>
                  <span className="font-bold text-[var(--ink)]">
                    {lang === 'ru' ? 'Ориентировочный срок: ' : 'Kutilayotgan muddat: '}
                  </span>
                  <span>{currentPlan.durationStr[lang]}</span>
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[var(--ink-muted)]">
                    {lang === 'ru' ? 'Итого по сметe' : lang === 'uz' ? 'Jami smeta' : 'Estimated Total'}
                  </div>
                  <div className="font-extrabold text-xl text-[var(--accent)]">
                    {calculatedTotalUzs} сум
                  </div>
                  <div className="text-[12px] text-[var(--ink-muted)]">
                    ≈ ${calculatedTotalUsd} USD
                  </div>
                </div>

                <button
                  onClick={() =>
                    openBookingFor(`${currentPlan.name[lang]} (${planUnits} ${currentPlan.unitLabel[lang]})`)
                  }
                  className="touch-target text-xs font-bold bg-[var(--accent)] text-white px-5 py-3 rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
                >
                  {lang === 'ru' ? 'Зафиксировать расчёт' : lang === 'uz' ? 'Hisobni tasdiqlash' : 'Lock Estimate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ВРАЧИ (DOCTORS LIST WITH PHOTO PLACEHOLDERS)
           ======================================================== */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-xl text-[var(--ink)]">
                {t.quickTiles.doctorsTitle[lang]}
              </h2>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                {lang === 'ru' && 'Штатные специалисты клиники с высшим профильным медицинским образованием.'}
                {lang === 'uz' && 'Oliy tibbiy ma’lumotga ega klinikaning yetakchi shifokorlari.'}
                {lang === 'en' && 'Licensed full-time medical specialists with advanced clinical training.'}
              </p>
            </div>

            <div className="space-y-3">
              {DOCTORS.map((doc: Doctor) => (
                <div key={doc.id} className="clinic-card p-4 sm:p-5 space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Doctor Photo or Clean Neutral Placeholder */}
                    <div className="w-20 h-24 rounded-[var(--radius-sm)] bg-slate-100 border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
                      {/* TODO: заменить реальным фото врача */}
                      {doc.photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={doc.photoUrl}
                          alt={doc.name[lang]}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-1">
                          <span className="font-bold text-sm text-[var(--accent)] mb-0.5">
                            {doc.initials}
                          </span>
                          <span className="text-[10px] text-[var(--ink-muted)]">
                            {/* TODO: фото */}
                            Фото
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-base text-[var(--ink)]">
                        {doc.name[lang]}
                      </h3>
                      <div className="text-[13px] font-semibold text-[var(--accent)] mt-0.5">
                        {doc.role[lang]}
                      </div>
                      <div className="text-[12px] text-[var(--ink-secondary)] mt-1">
                        <b>{lang === 'ru' ? 'Стаж: ' : 'Tajriba: '}</b> {doc.experienceYears} {lang === 'ru' ? 'лет' : 'yil'}
                      </div>
                      <div className="text-[12px] text-[var(--ink-muted)] mt-0.5">
                        {doc.specialization[lang]}
                      </div>
                    </div>
                  </div>

                  <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed bg-[var(--surface-subtle)] p-3 rounded-[var(--radius-sm)] border border-[var(--border)]">
                    {doc.credentials[lang]}
                  </p>

                  <button
                    onClick={() => openBookingFor('Консультация', doc.name[lang])}
                    className="touch-target w-full text-xs font-bold py-3 rounded-[var(--radius-md)] bg-white border border-[var(--border)] text-[var(--ink)] hover:bg-slate-50 transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === 'ru' ? 'Записаться к специалисту' : lang === 'uz' ? 'Qabuliga yozilish' : 'Book with Doctor'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: КЛИНИКА И КОНТАКТЫ
           ======================================================== */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-xl text-[var(--ink)]">
                {t.quickTiles.contactsTitle[lang]}
              </h2>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                {lang === 'ru' && 'Центральный филиал клиники в Ташкенте с удобным подъездом.'}
                {lang === 'uz' && 'Toshkent shahrida qulay joylashuvga ega bosh klinika.'}
                {lang === 'en' && 'Main clinic location in central Tashkent with direct access.'}
              </p>
            </div>

            {/* Clinic Photo Placeholder: Aspect 16:9 */}
            <div className="aspect-[16/9] w-full rounded-[var(--radius-md)] overflow-hidden bg-slate-100 border border-[var(--border)] flex flex-col items-center justify-center p-4 text-center">
              {/* TODO: заменить реальным фото клиники / входной группы */}
              <Building2 className="w-8 h-8 text-[var(--ink-muted)] mb-1.5" aria-hidden="true" />
              <span className="text-sm font-semibold text-[var(--ink)]">
                {CLINIC_CONFIG.name[lang]} · {CLINIC_CONFIG.city[lang]}
              </span>
              <span className="text-xs text-[var(--ink-muted)] mt-0.5">
                {/* TODO: загрузить фото фасада или зоны ресепшн */}
                (Фото фасада и зоны ожидания)
              </span>
            </div>

            {/* Address & Navigation Links */}
            <div className="clinic-card p-4 sm:p-5 space-y-3">
              <div>
                <div className="font-bold text-base text-[var(--ink)]">
                  {CLINIC_CONFIG.address[lang]}
                </div>
                <div className="text-[13px] text-[var(--ink-secondary)] mt-0.5">
                  {CLINIC_CONFIG.landmark[lang]}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={CLINIC_CONFIG.yandexMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="touch-target flex-1 text-center font-bold text-xs py-3 rounded-[var(--radius-md)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{lang === 'ru' ? 'Маршрут на Яндекс.Картах' : 'Yandex Xaritada ochish'}</span>
                </a>

                <a
                  href={`tel:${CLINIC_CONFIG.phone}`}
                  className="touch-target flex-1 text-center font-bold text-xs py-3 rounded-[var(--radius-md)] bg-white border border-[var(--border)] text-[var(--ink)] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>{CLINIC_CONFIG.phoneDisplay}</span>
                </a>
              </div>
            </div>

            {/* Hours Table */}
            <div className="clinic-card p-4 sm:p-5 space-y-2.5">
              <div className="font-bold text-sm text-[var(--ink)] mb-1">
                {lang === 'ru' ? 'График работы' : lang === 'uz' ? 'Ish jadvali' : 'Operating Hours'}
              </div>
              <div className="flex justify-between items-center text-[13px] py-1 border-b border-[var(--border)]">
                <span className="text-[var(--ink-secondary)]">
                  {lang === 'ru' ? 'Понедельник — Пятница' : 'Dushanba — Juma'}
                </span>
                <span className="font-bold text-[var(--ink)]">{CLINIC_CONFIG.hours.weekdays}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] py-1 border-b border-[var(--border)]">
                <span className="text-[var(--ink-secondary)]">
                  {lang === 'ru' ? 'Суббота' : 'Shanba'}
                </span>
                <span className="font-bold text-[var(--ink)]">{CLINIC_CONFIG.hours.saturday}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] py-1">
                <span className="text-[var(--ink-secondary)]">
                  {lang === 'ru' ? 'Воскресенье' : 'Yakshanba'}
                </span>
                <span className="font-bold text-[var(--ink)]">{CLINIC_CONFIG.hours.sunday}</span>
              </div>
            </div>

            {/* Official Medical License */}
            <div className="text-center text-[12px] text-[var(--ink-muted)] py-2">
              {CLINIC_CONFIG.licenseNumber}
              {/* TODO: подтвердить у клиники */}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          3. ATTACHED BOTTOM NAVIGATION (Fixed bottom, not floating capsule)
         ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bottom-dock pb-safe">
        <div className="max-w-xl mx-auto flex items-center justify-around px-2 py-1">
          {/* Tab 1: Home */}
          <button
            onClick={() => switchTab('home')}
            aria-label={t.nav.home[lang]}
            className={`min-h-[48px] touch-target flex-1 flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'home'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {activeTab === 'home' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            )}
            <Home className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[12px] tracking-tight">{t.nav.home[lang]}</span>
          </button>

          {/* Tab 2: Services */}
          <button
            onClick={() => switchTab('services')}
            aria-label={t.nav.services[lang]}
            className={`min-h-[48px] touch-target flex-1 flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'services'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {activeTab === 'services' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            )}
            <Layers className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[12px] tracking-tight">{t.nav.services[lang]}</span>
          </button>

          {/* Tab 3: Calculator */}
          <button
            onClick={() => switchTab('calculator')}
            aria-label={t.nav.calculator[lang]}
            className={`min-h-[48px] touch-target flex-1 flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'calculator'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {activeTab === 'calculator' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            )}
            <Calculator className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[12px] tracking-tight">{t.nav.calculator[lang]}</span>
          </button>

          {/* Tab 4: Doctors */}
          <button
            onClick={() => switchTab('doctors')}
            aria-label={t.nav.doctors[lang]}
            className={`min-h-[48px] touch-target flex-1 flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'doctors'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {activeTab === 'doctors' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            )}
            <Users className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[12px] tracking-tight">{t.nav.doctors[lang]}</span>
          </button>

          {/* Tab 5: Contacts */}
          <button
            onClick={() => switchTab('contacts')}
            aria-label={t.nav.contacts[lang]}
            className={`min-h-[48px] touch-target flex-1 flex flex-col items-center justify-center transition-colors relative ${
              activeTab === 'contacts'
                ? 'text-[var(--accent)] font-bold'
                : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            {activeTab === 'contacts' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            )}
            <MapPin className="w-5 h-5 mb-0.5" aria-hidden="true" />
            <span className="text-[12px] tracking-tight">{t.nav.contacts[lang]}</span>
          </button>
        </div>
      </nav>

      {/* ========================================================
          4. ACCESSIBLE BOOKING MODAL SHEET
         ======================================================== */}
      {isBookingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.bookingModal.title[lang]}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4"
        >
          <div className="w-full sm:max-w-md bg-white p-6 max-h-[90vh] overflow-y-auto rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)] shadow-xl border-t sm:border border-[var(--border)]">
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-teal-100 text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-lg text-[var(--ink)] mb-1">
                  {t.bookingModal.successTitle[lang]}
                </h3>
                <p className="text-[13px] text-[var(--ink-secondary)] mb-6 leading-relaxed max-w-xs mx-auto">
                  {t.bookingModal.successMessage[lang]}
                </p>
                <button
                  onClick={() => {
                    setIsBookingOpen(false);
                    setIsSuccess(false);
                  }}
                  className="touch-target w-full font-bold text-sm bg-[var(--accent)] text-white py-3 rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
                >
                  {t.bookingModal.closeButton[lang]}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--ink)]">
                      {t.bookingModal.title[lang]}
                    </h3>
                    <div className="text-[13px] text-[var(--accent)] font-semibold mt-0.5">
                      {bookingService}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    aria-label="Закрыть окно записи"
                    className="touch-target w-9 h-9 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    {t.bookingModal.nameLabel[lang]}:
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={t.bookingModal.namePlaceholder[lang]}
                    className="touch-target w-full px-3.5 py-2.5 bg-white rounded-[var(--radius-md)] border border-[var(--border)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    {t.bookingModal.phoneLabel[lang]}:
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="touch-target w-full px-3.5 py-2.5 bg-white rounded-[var(--radius-md)] border border-[var(--border)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] shadow-xs"
                  />
                </div>

                {/* Day Selection */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    {t.bookingModal.dayLabel[lang]}:
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
                        className={`touch-target py-2 px-3 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors border ${
                          selectedDatePreset === d.id
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-bold'
                            : 'bg-white border-[var(--border)] text-[var(--ink-secondary)]'
                        }`}
                      >
                        {d.label[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    {t.bookingModal.timeLabel[lang]}:
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
                        className={`touch-target py-2 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors border ${
                          selectedTimeSlot === slot
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-bold'
                            : 'bg-white border-[var(--border)] text-[var(--ink)]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)] mb-1.5">
                    {t.bookingModal.doctorLabel[lang]}:
                  </label>
                  <select
                    value={bookingDoctor}
                    onChange={(e) => setBookingDoctor(e.target.value)}
                    className="touch-target w-full px-3.5 py-2.5 bg-white rounded-[var(--radius-md)] border border-[var(--border)] text-xs font-semibold text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] shadow-xs"
                  >
                    <option value="Любой профильный специалист">
                      {t.bookingModal.anyDoctor[lang]}
                    </option>
                    {DOCTORS.map((doc) => (
                      <option key={doc.id} value={doc.name[lang]}>
                        {doc.name[lang]} ({doc.role[lang]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="touch-target w-full font-bold text-sm bg-[var(--accent)] text-white py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
                  >
                    {t.bookingModal.submitButton[lang]}
                  </button>
                  <div className="text-[12px] text-[var(--ink-muted)] text-center mt-2 leading-relaxed">
                    {t.bookingModal.disclaimer[lang]}
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