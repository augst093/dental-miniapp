'use client';

import React, { useState, useEffect } from 'react';
import {
  SERVICES,
  DOCTORS,
  CATEGORIES,
  Language,
  ServiceItem,
  Doctor,
} from '../data/clinicData';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [activePlanIdx, setActivePlanIdx] = useState<number>(0);
  const [planUnits, setPlanUnits] = useState<number>(TREATMENT_OPTIONS[0].defaultUnits);

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
          source: 'Mini App',
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
    <div className="min-h-[100dvh] bg-[#F6F4F0] text-[#1C1B1A] flex flex-col font-serif selection:bg-[#1B4332] selection:text-white pb-16">
      
      {/* 1. MASTHEAD / TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#F6F4F0] px-5 py-4 flex items-center justify-between">
        <div>
          <div className="font-display font-bold text-lg tracking-tight uppercase text-[#1C1B1A]">
            DENTALUX
          </div>
          <div className="text-[12px] text-[#6B6762] font-sans">
            Ташкент, основана в 2018
          </div>
        </div>

        {/* Clean Language Switcher */}
        <div className="flex items-center gap-1 bg-[#ECE8E1] p-1 font-sans text-xs font-medium">
          {(['ru', 'uz', 'en'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => {
                triggerHaptic('light');
                setLang(l);
              }}
              className={`px-3 py-1 transition-colors ${
                lang === l
                  ? 'bg-[#1C1B1A] text-[#F6F4F0]'
                  : 'text-[#6B6762] hover:text-[#1C1B1A]'
              }`}
            >
              {l === 'ru' ? 'Рус' : l === 'uz' ? 'O‘zb' : 'Eng'}
            </button>
          ))}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="px-5 pt-8 pb-12 max-w-3xl mx-auto w-full">
        <h1 className="font-display font-extrabold text-[28px] sm:text-[38px] leading-[1.05] tracking-tight uppercase text-[#1C1B1A] mb-3">
          {lang === 'ru' && 'Швейцарская точность в центре Ташкента'}
          {lang === 'uz' && 'Toshkent markazida Shveytsariya aniqligi'}
          {lang === 'en' && 'Swiss precision dentistry in Tashkent'}
        </h1>

        <p className="text-[17px] sm:text-[19px] text-[#4A4743] leading-relaxed mb-6 font-serif">
          {lang === 'ru' && 'Официальные протоколы Straumann и Damon. Компьютерная 3D-томография Vatech, бережное лечение под микроскопом и прозрачный расчёт плана на первой консультации.'}
          {lang === 'uz' && "Straumann va Damon rasmiy protokollari. Vatech 3D-tomografiyasi, mikroskop ostida og'riqsiz davolash va birinchi ko'rikdayoq aniq narx rejasi."}
          {lang === 'en' && 'Official Straumann and Damon protocols. 3D CBCT diagnostics, gentle microscope treatment, and a fully transparent treatment plan.'}
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-10">
          <button
            onClick={() => openBookingFor(
              lang === 'ru' ? 'Консультация главврача + 3D-снимок (КТ) — 0 сум' : 'Bosh shifokor ko‘rigi + 3D KT — 0 so‘m'
            )}
            className="font-sans font-semibold text-base bg-[#1B4332] text-white px-6 py-3.5 hover:bg-[#143326] transition-colors text-center"
          >
            {lang === 'ru' && 'Записаться на 3D-осмотр (0 сум)'}
            {lang === 'uz' && 'Bepul 3D-ko‘rikka yozilish (0 so‘m)'}
            {lang === 'en' && 'Book Free 3D Exam ($0)'}
          </button>
          <a
            href="tel:+998712000000"
            className="font-sans text-sm text-[#6B6762] hover:text-[#1C1B1A] py-2 text-center underline underline-offset-4"
          >
            +998 (71) 200-00-00, ежедневно 09:00-21:00
          </a>
        </div>

        {/* 3. HERO SPECIMEN ROW (Horizontal drag/swipe) */}
        <div>
          <div className="flex items-baseline justify-between mb-3 font-sans">
            <span className="text-sm font-semibold text-[#6B6762]">
              {lang === 'ru' && 'Ключевые направления'}
              {lang === 'uz' && 'Asosiy yo‘nalishlar'}
              {lang === 'en' && 'Key Treatments'}
            </span>
            <span className="text-xs text-[#6B6762]">
              {lang === 'ru' && 'листайте вправо'}
              {lang === 'uz' && 'o‘ngga suring'}
              {lang === 'en' && 'scroll right'}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 scroll-snap-x no-scrollbar">
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
                maker: 'TruGEN Material (США)',
                price: '15 000 000 сум',
                usd: '$1 200',
                note: lang === 'ru' ? 'Невидимые капы' : 'Ko‘rinmas kapalar',
              },
              {
                title: lang === 'ru' ? 'Отбеливание Beyond' : 'Beyond Oqartirish',
                maker: 'Beyond ColdLight (США)',
                price: '2 400 000 сум',
                usd: '$190',
                note: lang === 'ru' ? '6-8 тонов за 60 минут' : '60 daqiqada 8 ton',
              },
            ].map((specimen, idx) => (
              <div
                key={idx}
                onClick={() => openBookingFor(specimen.title)}
                className="snap-item min-w-[210px] sm:min-w-[230px] bg-[#ECE8E1] p-5 flex flex-col justify-between cursor-pointer hover:bg-[#E3DDD4] transition-colors"
              >
                <div>
                  <div className="text-xs font-sans text-[#6B6762] mb-1.5">
                    {specimen.maker}
                  </div>
                  <div className="font-display font-bold text-base text-[#1C1B1A] leading-snug mb-1">
                    {specimen.title}
                  </div>
                  <div className="text-xs text-[#524F4B] mb-4 font-serif">
                    {specimen.note}
                  </div>
                </div>
                <div className="pt-3 flex items-baseline justify-between font-sans">
                  <span className="font-bold text-sm text-[#1B4332]">{specimen.price}</span>
                  <span className="text-xs text-[#6B6762]">{specimen.usd}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE LIVE THING: TREATMENT & COST ESTIMATOR */}
      <section className="bg-[#ECE8E1] px-5 py-12">
        <div className="max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight text-[#1C1B1A] mb-1">
              {lang === 'ru' && 'Калькулятор стоимости и сроков'}
              {lang === 'uz' && 'Narx va muddat kalkulyatori'}
              {lang === 'en' && 'Treatment & Timeline Calculator'}
            </h2>
            <p className="text-sm text-[#6B6762] font-serif">
              {lang === 'ru' && 'Выберите процедуру и необходимый объём для расчёта прозрачной сметы.'}
              {lang === 'uz' && 'Muolajani va hajmni tanlang, aniq smetani ko‘ring.'}
              {lang === 'en' && 'Select treatment and scope to view guaranteed timeline and cost.'}
            </p>
          </div>

          {/* Procedure Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-6 font-sans text-xs">
            {TREATMENT_OPTIONS.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActivePlanIdx(idx);
                  setPlanUnits(opt.defaultUnits);
                }}
                className={`p-3 text-left transition-colors font-medium ${
                  activePlanIdx === idx
                    ? 'bg-[#1C1B1A] text-[#F6F4F0]'
                    : 'bg-[#F6F4F0] text-[#1C1B1A] hover:bg-[#E3DDD4]'
                }`}
              >
                {opt.name[lang]}
              </button>
            ))}
          </div>

          {/* Calculation Box (Data UI component keeps its borders) */}
          <div data-ui="calculator-box" className="bg-[#F6F4F0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div>
                <span className="font-sans text-xs text-[#6B6762] block mb-1">
                  {lang === 'ru' && 'Выбранная процедура:'}
                  {lang === 'uz' && 'Tanlangan muolaja:'}
                  {lang === 'en' && 'Selected Treatment:'}
                </span>
                <span className="font-display font-bold text-lg text-[#1C1B1A]">
                  {currentPlan.name[lang]}
                </span>
              </div>

              {/* Unit Stepper */}
              <div className="flex items-center gap-3 font-sans">
                <span className="text-sm text-[#4A4743]">
                  {lang === 'ru' && 'Количество:'}
                  {lang === 'uz' && 'Miqdori:'}
                  {lang === 'en' && 'Quantity:'}
                </span>
                <div className="flex items-center bg-white border border-[#DDD8CE]">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits > 1) setPlanUnits(planUnits - 1);
                    }}
                    className="px-3 py-1.5 text-sm font-bold hover:bg-[#ECE8E1]"
                  >
                    –
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold min-w-[32px] text-center">
                    {planUnits}
                  </span>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      if (planUnits < 16) setPlanUnits(planUnits + 1);
                    }}
                    className="px-3 py-1.5 text-sm font-bold hover:bg-[#ECE8E1]"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#6B6762]">
                  {currentPlan.unitLabel[lang]}
                </span>
              </div>

              <div className="pt-2 text-xs text-[#524F4B] space-y-1 font-serif">
                <div><b>{lang === 'ru' ? 'Срок:' : 'Muddat:'}</b> {currentPlan.durationStr[lang]}</div>
                <div><b>{lang === 'ru' ? 'Гарантия:' : 'Kafolat:'}</b> {currentPlan.guaranteeStr[lang]}</div>
              </div>
            </div>

            {/* Calculated Price & CTA */}
            <div className="flex flex-col items-start md:items-end justify-between pt-4 md:pt-0">
              <div className="font-sans text-left md:text-right mb-4">
                <span className="text-xs text-[#6B6762] block">
                  {lang === 'ru' && 'Итоговая ориентировочная стоимость:'}
                  {lang === 'uz' && 'Jami taxminiy qiymat:'}
                  {lang === 'en' && 'Estimated Total Cost:'}
                </span>
                <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#1B4332]">
                  {calculatedTotalUzs} сум
                </div>
                <div className="text-xs text-[#6B6762]">
                  ≈ ${calculatedTotalUsd} USD
                </div>
              </div>

              <button
                onClick={() => openBookingFor(
                  `${currentPlan.name[lang]} (${planUnits} ${currentPlan.unitLabel[lang]})`
                )}
                className="w-full md:w-auto font-sans font-semibold text-sm bg-[#1B4332] text-white px-6 py-3.5 hover:bg-[#143326] transition-colors"
              >
                {lang === 'ru' && 'Зафиксировать расчёт'}
                {lang === 'uz' && 'Hisobni tasdiqlash'}
                {lang === 'en' && 'Lock this estimate'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FULL SPECIMEN CATALOGUE */}
      <section className="px-5 py-12 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight text-[#1C1B1A]">
            {lang === 'ru' && 'Каталог услуг и стоимость'}
            {lang === 'uz' && 'Xizmatlar katalogi va narxlar'}
            {lang === 'en' && 'Services & Transparent Pricing'}
          </h2>
          <p className="text-sm text-[#6B6762] font-sans mt-1">
            {lang === 'ru' && 'Фиксированные цены без скрытых платежей за анестезию и расходные материалы.'}
            {lang === 'uz' && 'Anesteziya va materiallar uchun yashirin to‘lovlarsiz aniq narxlar.'}
            {lang === 'en' && 'Fixed pricing with all disposables and anesthesia included.'}
          </p>
        </div>

        {/* Clean Text-based Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-6 font-sans text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 transition-colors font-medium ${
                selectedCategory === cat.id
                  ? 'bg-[#1C1B1A] text-[#F6F4F0]'
                  : 'bg-[#ECE8E1] text-[#6B6762] hover:text-[#1C1B1A]'
              }`}
            >
              {cat.label[lang]}
            </button>
          ))}
        </div>

        {/* Service Items List */}
        <div className="space-y-3">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-[#ECE8E1] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E3DDD4] transition-colors"
            >
              <div className="max-w-md">
                <div className="font-display font-bold text-base text-[#1C1B1A] leading-snug mb-1">
                  {svc.name[lang]}
                </div>
                <div className="text-xs text-[#524F4B] leading-relaxed mb-2 font-serif">
                  {svc.description[lang]}
                </div>
                <div className="font-sans text-[12px] text-[#6B6762]">
                  Длительность: {svc.duration}
                </div>
              </div>

              <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0">
                <div className="font-sans text-left sm:text-right">
                  <div className="font-bold text-base text-[#1B4332]">
                    {svc.priceUzs}
                  </div>
                  {svc.priceUsd && (
                    <div className="text-xs text-[#6B6762]">
                      {svc.priceUsd}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openBookingFor(svc.name[lang])}
                  className="font-sans text-xs font-semibold px-4 py-2.5 bg-[#1C1B1A] text-[#F6F4F0] hover:bg-[#1B4332] transition-colors"
                >
                  {lang === 'ru' && 'Выбрать'}
                  {lang === 'uz' && 'Tanlash'}
                  {lang === 'en' && 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. DOCTORS / CLINICAL TEAM */}
      <section className="bg-[#ECE8E1] px-5 py-12">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-tight text-[#1C1B1A] mb-1">
            {lang === 'ru' && 'Ведущие специалисты'}
            {lang === 'uz' && 'Yetakchi shifokorlar'}
            {lang === 'en' && 'Medical Specialists'}
          </h2>
          <p className="text-sm text-[#6B6762] mb-6 font-serif">
            {lang === 'ru' && 'Врачи высшей категории с опытом работы более 9 лет и международными стажировками в Швейцарии и Германии.'}
            {lang === 'uz' && '9 yildan ortiq tajribaga ega, Shveytsariya va Germaniyada malaka oshirgan mutaxassislar.'}
            {lang === 'en' && 'Senior specialists with 9+ years of experience and training in Zurich and Munich.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DOCTORS.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#F6F4F0] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="font-display font-bold text-base text-[#1C1B1A] mb-0.5">
                    {doc.name[lang]}
                  </div>
                  <div className="font-sans text-xs text-[#1B4332] font-semibold mb-2">
                    {doc.role[lang]}
                  </div>
                  <p className="text-xs text-[#524F4B] leading-relaxed mb-4 font-serif">
                    {doc.credentials[lang]}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between font-sans">
                  <span className="text-xs text-[#6B6762]">
                    {lang === 'ru' ? `Стаж ${doc.experienceYears} лет` : `${doc.experienceYears} yil tajriba`}
                  </span>
                  <button
                    onClick={() => openBookingFor('Консультация', doc.name[lang])}
                    className="text-xs font-semibold text-[#1B4332] hover:underline"
                  >
                    {lang === 'ru' && 'Записаться к врачу'}
                    {lang === 'uz' && 'Qabuliga yozilish'}
                    {lang === 'en' && 'Book consultation'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CLINIC LOCATION & FOOTER */}
      <footer className="px-5 py-12 max-w-3xl mx-auto w-full text-xs font-sans text-[#6B6762]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-8">
          <div>
            <div className="font-display font-bold text-sm text-[#1C1B1A] uppercase mb-1">
              DentaLux Tashkent
            </div>
            <p className="text-xs text-[#524F4B] mb-2 font-serif">
              {lang === 'ru' && 'г. Ташкент, Яккасарайский р-н, ул. Шота Руставели, 54 (ориентир: метро Ойбек)'}
              {lang === 'uz' && 'Toshkent sh., Yakkasaroy t., Shota Rustaveli ko‘chasi, 54 (mo‘ljal: Oybek metrosi)'}
              {lang === 'en' && '54 Shota Rustaveli st., Yakkasaray district, Tashkent (near Oybek metro)'}
            </p>
            <div className="space-x-3">
              <a
                href="https://yandex.uz/maps/-/CDuWjF8A"
                target="_blank"
                rel="noreferrer"
                className="text-[#1B4332] font-semibold underline underline-offset-2"
              >
                {lang === 'ru' && 'Яндекс.Карты'}
                {lang === 'uz' && 'Yandex Xarita'}
                {lang === 'en' && 'Yandex Maps'}
              </a>
              <span>·</span>
              <a
                href="tel:+998712000000"
                className="text-[#1C1B1A] font-semibold"
              >
                +998 (71) 200-00-00
              </a>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="font-semibold text-[#1C1B1A] mb-1">
              {lang === 'ru' && 'График работы:'}
              {lang === 'uz' && 'Ish vaqti:'}
              {lang === 'en' && 'Opening hours:'}
            </div>
            <div>{lang === 'ru' ? 'Понедельник - Воскресенье' : 'Dushanba - Yakshanba'}</div>
            <div className="font-bold text-[#1C1B1A]">09:00 - 21:00</div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div>© 2026 DentaLux Aesthetic Clinic. All rights reserved.</div>
          <div className="text-[#8C8882]">Telegram Mini App, Swiss Protocols</div>
        </div>
      </footer>

      {/* 8. MODAL / BOOKING SHEET */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-[#F6F4F0] p-6 max-h-[90vh] overflow-y-auto" data-ui="booking-modal">
            
            {isSuccess ? (
              <div className="text-center py-6">
                <div className="font-display font-bold text-2xl uppercase text-[#1B4332] mb-2">
                  {lang === 'ru' && 'Заявка принята'}
                  {lang === 'uz' && 'Ariza qabul qilindi'}
                  {lang === 'en' && 'Booking Confirmed'}
                </div>
                <p className="text-sm text-[#4A4743] font-serif mb-6 leading-relaxed">
                  {lang === 'ru' && 'Данные переданы администратору клиники. Мы перезвоним вам в течение 10 минут для согласования точного времени.'}
                  {lang === 'uz' && "Ma'lumotlar qabul qilindi. 10 daqiqa ichida administratorimiz siz bilan bog'lanadi."}
                  {lang === 'en' && 'Our clinic administrator will contact you within 10 minutes to confirm your visit.'}
                </p>
                <button
                  onClick={() => {
                    setIsBookingOpen(false);
                    setIsSuccess(false);
                  }}
                  className="w-full font-sans font-semibold text-sm bg-[#1C1B1A] text-white py-3.5"
                >
                  {lang === 'ru' && 'Закрыть'}
                  {lang === 'uz' && 'Yopish'}
                  {lang === 'en' && 'Close'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 font-sans">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-lg uppercase text-[#1C1B1A]">
                      {lang === 'ru' && 'Запись на приём'}
                      {lang === 'uz' && 'Qabulga yozilish'}
                      {lang === 'en' && 'Appointment Booking'}
                    </h3>
                    <div className="text-xs text-[#6B6762] font-serif">
                      {bookingService}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="text-xs font-semibold text-[#6B6762] hover:text-[#1C1B1A] px-2 py-1 bg-[#ECE8E1]"
                  >
                    Закрыть
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
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
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
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
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
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
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
                    className="w-full px-3 py-2.5 bg-white border border-[#DDD8CE] text-sm text-[#1C1B1A] focus:outline-none focus:border-[#1B4332]"
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
                    className="w-full font-sans font-semibold text-sm bg-[#1B4332] text-white py-3.5 hover:bg-[#143326] transition-colors"
                  >
                    {lang === 'ru' && 'Подтвердить бронь'}
                    {lang === 'uz' && 'Band qilishni tasdiqlash'}
                    {lang === 'en' && 'Confirm Booking'}
                  </button>
                  <div className="text-[11px] text-[#6B6762] text-center mt-2 font-serif">
                    {lang === 'ru' && 'Конфиденциально, мгновенное уведомление в Telegram'}
                    {lang === 'uz' && 'Maxfiy, Telegram orqali tezkor tasdiq'}
                    {lang === 'en' && 'Confidential, Instant Telegram alert'}
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