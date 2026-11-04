'use client';

import React, { useEffect, useState } from 'react';
import { CallButton } from '../ui/CallButton';
import {
  Sparkles,
  Phone,
  ArrowRight,
  Layers,
  Calculator,
  Users,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Camera,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  CLINIC_CONFIG,
  DOCTORS,
  SERVICES,
  Language,
  UI_TRANSLATIONS,
} from '../../data/clinicData';
import { TabType } from '../BottomNav';

interface HomeTabProps {
  lang: Language;
  onNavigateTab: (tab: TabType) => void;
  onOpenBooking: (serviceTitle?: string, doctorTitle?: string) => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  lang,
  onNavigateTab,
  onOpenBooking,
  triggerHaptic,
}) => {
  const t = UI_TRANSLATIONS;
  const config = CLINIC_CONFIG;

  const featuredServices = SERVICES.filter((s) => s.highlight);

  // Show the photo block only once public/hero-clinic.jpg actually loads
  const [hasHeroPhoto, setHasHeroPhoto] = useState<boolean>(false);
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setHasHeroPhoto(true);
    probe.src = '/hero-clinic.jpg';
  }, []);

  const handleTileClick = (tab: TabType) => {
    triggerHaptic('light');
    onNavigateTab(tab);
  };

  return (
    <div className="space-y-6 pb-36 sm:pb-40">
      {/* ========================================================
          1. EMERGENCY SOS BANNER (ACUTE PAIN RELIEF) - Frosted Red Glass
         ======================================================== */}
      <section className="bg-white/80 backdrop-blur-md border border-red-100 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full">
                  {t.emergencyBanner.badge[lang]}
                </span>
                <span className="text-[11px] font-semibold text-red-600">
                  {lang === 'uz' ? 'Bugun qabul' : lang === 'en' ? 'Today walk-in' : 'Приём сегодня'}
                </span>
              </div>
              <h2 className="font-bold text-[14px] sm:text-[15px] text-[var(--ink)] mt-1 leading-snug">
                {t.emergencyBanner.title[lang]}
              </h2>
              <p className="hidden sm:block text-[12px] text-[var(--ink-secondary)] mt-0.5">
                {t.emergencyBanner.sub[lang]}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-red-200/60">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onOpenBooking(
                SERVICES.find((s) => s.id === 'emergency-relief')?.name[lang] ||
                  'Неотложная помощь при острой боли'
              );
            }}
            className="sos-pulse flex-1 py-2.5 px-4 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 shadow-sm shadow-red-600/25 transition-all touch-target"
          >
            <span>{t.emergencyBanner.action[lang]}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <CallButton
            phone={config.phone}
            display={config.phoneDisplay}
            lang={lang}
            title={t.emergencyBanner.callAction[lang]}
            triggerHaptic={triggerHaptic}
            className="py-2.5 px-4 rounded-full bg-white/80 hover:bg-white active:scale-95 border border-red-200 text-red-700 font-bold text-[12px] sm:text-[13px] hidden sm:flex items-center justify-center gap-1.5 shadow-xs transition-all touch-target"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>{t.emergencyBanner.callAction[lang]}</span>
          </CallButton>
        </div>
      </section>

      {/* ========================================================
          2. HERO SECTION (V2.1 Aesthetic: Bold Sans + Royal Blue Serif Italic)
         ======================================================== */}
      <section className="clinic-card p-5 sm:p-7 relative overflow-hidden space-y-5 border border-white/90 shadow-xl">
        {/* Clinic photo: drop a file at public/hero-clinic.jpg; gradient shows until then */}
        {hasHeroPhoto && (
          <div className="hero-media" role="img" aria-label="DentaLux Tashkent" />
        )}

        {/* Soft atmospheric ambient light glows */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-blue-500/10 rounded-full pointer-events-none blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-500/10 rounded-full pointer-events-none blur-3xl" />

        <div className="relative z-10 space-y-4">
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-[var(--accent-subtle)] border border-blue-200/70 px-3 py-1 rounded-full text-[11px] font-bold text-[var(--accent)] tracking-wide">
            <Sparkles className="w-3 h-3 text-[var(--accent)]" />
            <span>{t.hero.badge[lang]}</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.12] text-[var(--ink)]">
              {lang === 'uz' ? (
                <>
                  <span>Toshkentda tish davolash</span>
                  <br />
                  <span className="font-serif italic font-normal text-[var(--accent)] text-[32px] sm:text-[40px]">
                    va implantatsiya.
                  </span>
                </>
              ) : lang === 'en' ? (
                <>
                  <span>Advanced Dental Care</span>
                  <br />
                  <span className="font-serif italic font-normal text-[var(--accent)] text-[32px] sm:text-[40px]">
                    & implants in Tashkent.
                  </span>
                </>
              ) : (
                <>
                  <span>Лечение и имплантация</span>
                  <br />
                  <span className="font-serif italic font-normal text-[var(--accent)] text-[32px] sm:text-[40px]">
                    зубов в Ташкенте.
                  </span>
                </>
              )}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[var(--ink-secondary)] mt-3 leading-relaxed max-w-lg">
              {t.hero.subtitle[lang]}
            </p>
          </div>

          {/* Doctor Avatar Stack with Frosted Pill */}
          <div className="hidden sm:inline-flex items-center gap-2.5 bg-white/70 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-full shadow-xs">
            <div className="flex -space-x-1.5 px-0.5 py-0.5">
              {DOCTORS.map((doc) => (
                <div
                  key={doc.id}
                  className="inline-flex w-7 h-7 rounded-full overflow-hidden ring-2 ring-white bg-[var(--accent-subtle)] text-[var(--accent)] items-center justify-center shrink-0 shadow-xs"
                  title={doc.name[lang]}
                >
                  {doc.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doc.photoUrl} alt={doc.name[lang]} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </div>
              ))}
            </div>
            <span className="text-[12px] text-[var(--ink-secondary)] font-medium leading-tight">
              {t.hero.teamSubtitle[lang]}
            </span>
          </div>

          {/* Actions with Reference Pill Styling */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenBooking();
              }}
              className="btn-pill-primary py-3.5 px-6 text-[13px] sm:text-[14px] flex items-center justify-center gap-2 touch-target"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.hero.ctaBooking[lang]}</span>
            </button>

            <button
              onClick={() => handleTileClick('calculator')}
              className="btn-pill-secondary py-3.5 px-6 text-[13px] sm:text-[14px] flex items-center justify-center gap-1.5 touch-target"
            >
              <Calculator className="w-4 h-4 text-[var(--accent)]" />
              <span>{t.hero.ctaCalculator[lang]}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

      </section>

      {/* ========================================================
          3. QUICK TILES (4 Core Entry Points) - Frosted Glass
         ======================================================== */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => handleTileClick('services')}
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] rounded-2xl touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[var(--accent)] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[var(--ink-muted)] bg-slate-100/90 px-2 py-0.5 rounded-full">
              {t.quickTiles.catalogBadge[lang]}
            </span>
          </div>
          <div className="mt-2">
            <h3 className="font-bold text-[13px] text-[var(--ink)] leading-snug">
              {t.quickTiles.catalogTitle[lang]}
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5">
              {t.quickTiles.catalogSub[lang]}
            </p>
          </div>
        </button>

        <button
          onClick={() => handleTileClick('calculator')}
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] rounded-2xl touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
              {t.quickTiles.calcBadge[lang]}
            </span>
          </div>
          <div className="mt-2">
            <h3 className="font-bold text-[13px] text-[var(--ink)] leading-snug">
              {t.quickTiles.calcTitle[lang]}
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5">
              {t.quickTiles.calcSub[lang]}
            </p>
          </div>
        </button>

        <button
          onClick={() => handleTileClick('doctors')}
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] rounded-2xl touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
              {t.quickTiles.doctorsBadge[lang]}
            </span>
          </div>
          <div className="mt-2">
            <h3 className="font-bold text-[13px] text-[var(--ink)] leading-snug">
              {t.quickTiles.doctorsTitle[lang]}
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5">
              {t.quickTiles.doctorsSub[lang]}
            </p>
          </div>
        </button>

        <button
          onClick={() => handleTileClick('contacts')}
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] rounded-2xl touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
              {t.quickTiles.contactsBadge[lang]}
            </span>
          </div>
          <div className="mt-2">
            <h3 className="font-bold text-[13px] text-[var(--ink)] leading-snug">
              {t.quickTiles.contactsTitle[lang]}
            </h3>
            <p className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5">
              {t.quickTiles.contactsSub[lang]}
            </p>
          </div>
        </button>
      </section>

      {/* ========================================================
          4. FEATURED TREATMENTS - Frosted Glass Cards with Pill Buttons
         ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif italic font-normal text-[22px] text-[var(--ink)]">
              {t.featured.title[lang]}
            </h2>
            <p className="text-[12px] text-[var(--ink-muted)]">
              {t.featured.subtitle[lang]}
            </p>
          </div>
          <button
            onClick={() => handleTileClick('services')}
            className="text-[12px] font-bold text-[var(--accent)] hover:underline flex items-center gap-0.5"
          >
            <span>{t.featured.viewAll[lang]}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {featuredServices.map((srv) => (
            <div
              key={srv.id}
              className="clinic-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[14px] text-[var(--ink)]">
                    {srv.name[lang]}
                  </h3>
                  {srv.badge && (
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2.5 py-0.5 rounded-full">
                      {srv.badge[lang]}
                    </span>
                  )}
                  {srv.partnerBrand && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {srv.partnerBrand}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
                  {srv.description[lang]}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--ink-muted)] pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {srv.duration[lang]}
                  </span>
                </div>
              </div>

              <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                <div className="text-left sm:text-right">
                  <div className="text-[15px] font-bold text-[var(--accent)]">
                    {srv.priceUzs}
                  </div>
                  {srv.priceUsd && (
                    <div className="text-[11px] text-[var(--ink-muted)]">
                      ≈ {srv.priceUsd}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    onOpenBooking(srv.name[lang]);
                  }}
                  className="btn-pill-primary py-2 px-4 text-[12px] touch-target"
                >
                  {t.featured.bookItem[lang]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. STANDARDS & LICENSING - Frosted Card with Rounded Elements
         ======================================================== */}
      <section className="clinic-card p-4 sm:p-5 space-y-3 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[var(--accent)] flex items-center justify-center shrink-0">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)]">
                {t.standards.diagnosticsTitle[lang]}
              </div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {t.standards.diagnosticsDesc[lang]}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)]">
                {t.standards.hoursTitle[lang]}
              </div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {t.standards.hoursDesc[lang]}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)]">
                {config.licenseNumber
                  ? t.standards.licenseTitle[lang]
                  : lang === 'uz'
                  ? 'Sterillik 100%'
                  : lang === 'en'
                  ? 'Sterilization 100%'
                  : 'Стерилизация 100%'}
              </div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {config.licenseNumber ||
                  (lang === 'uz'
                    ? 'Avtoklavlash va xalqaro sanitariya protokoli'
                    : lang === 'en'
                    ? 'Autoclaving & international safety protocol'
                    : 'Автоклавирование и протокол безопасности')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
