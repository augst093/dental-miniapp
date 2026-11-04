'use client';

import React from 'react';
import {
  Sparkles,
  Phone,
  ArrowRight,
  Layers,
  Calculator,
  Users,
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

  const handleTileClick = (tab: TabType) => {
    triggerHaptic('light');
    onNavigateTab(tab);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* ========================================================
          1. EMERGENCY SOS BANNER (ACUTE PAIN RELIEF)
         ======================================================== */}
      <section className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-300/80 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                  {t.emergencyBanner.badge[lang]}
                </span>
                <span className="text-[11px] font-semibold text-red-600">
                  {lang === 'uz' ? 'Bugun qabul' : lang === 'en' ? 'Today walk-in' : 'Приём сегодня'}
                </span>
              </div>
              <h2 className="font-bold text-[14px] sm:text-[15px] text-[var(--ink)] mt-1 leading-snug">
                {t.emergencyBanner.title[lang]}
              </h2>
              <p className="text-[12px] text-[var(--ink-secondary)] mt-0.5">
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
            className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 shadow-xs transition-all touch-target"
          >
            <span>{t.emergencyBanner.action[lang]}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={`tel:${config.phone}`}
            onClick={() => triggerHaptic('medium')}
            className="py-2 px-3 rounded-xl bg-[var(--surface)] hover:bg-red-50 active:scale-95 border border-red-300 text-red-700 font-bold text-[12px] sm:text-[13px] flex items-center justify-center gap-1.5 transition-all touch-target"
          >
            <Phone className="w-3.5 h-3.5 fill-current" />
            <span>{t.emergencyBanner.callAction[lang]}</span>
          </a>
        </div>
      </section>

      {/* ========================================================
          2. HERO CARD (Clean Medical Flat Teal, Doctor Avatars)
         ======================================================== */}
      <section className="bg-[var(--accent)] text-[var(--accent-contrast)] radius-lg p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative medical cross glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none blur-xl" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-100">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>{t.hero.badge[lang]}</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
              {t.hero.title[lang]}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-emerald-100/90 mt-2 leading-relaxed">
              {t.hero.subtitle[lang]}
            </p>
          </div>

          {/* Doctor Avatar Stack with clean overlapping borders */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2 overflow-hidden py-0.5">
              {DOCTORS.map((doc) => (
                <div
                  key={doc.id}
                  className="inline-flex w-7 h-7 rounded-full ring-2 ring-white/50 bg-[#073635] text-white text-[10px] font-extrabold items-center justify-center shrink-0 shadow-xs"
                  title={doc.name[lang]}
                >
                  {doc.initials}
                </div>
              ))}
            </div>
            <span className="text-[12px] text-emerald-100 font-medium leading-tight">
              {t.hero.teamSubtitle[lang]}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenBooking();
              }}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 text-[var(--accent)] font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all touch-target"
            >
              <Calendar className="w-4 h-4 text-[var(--accent)]" />
              <span>{t.hero.ctaBooking[lang]}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                {t.hero.badgeFree[lang]}
              </span>
            </button>

            <button
              onClick={() => handleTileClick('calculator')}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/15 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-all touch-target"
            >
              <Calculator className="w-4 h-4" />
              <span>{t.hero.ctaCalculator[lang]}</span>
            </button>
          </div>
        </div>

        {/* Clean photo placeholder container */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/80">
          <div className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            <span>{t.hero.photoPlaceholder[lang]}</span>
          </div>
          <span className="font-mono text-emerald-300">Vatech Pax-i3D</span>
        </div>
      </section>

      {/* ========================================================
          3. QUICK TILES (4 Core Entry Points)
         ======================================================== */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => handleTileClick('services')}
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-[var(--ink-muted)] bg-[var(--surface-subtle)] px-1.5 py-0.5 rounded">
              {t.quickTiles.catalogBadge[lang]}
            </span>
          </div>
          <div>
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
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              {t.quickTiles.calcBadge[lang]}
            </span>
          </div>
          <div>
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
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded">
              {t.quickTiles.doctorsBadge[lang]}
            </span>
          </div>
          <div>
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
          className="clinic-card-interactive p-3.5 text-left flex flex-col justify-between min-h-[96px] touch-target"
        >
          <div className="flex items-start justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
              {t.quickTiles.contactsBadge[lang]}
            </span>
          </div>
          <div>
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
          4. FEATURED TREATMENTS (Flat, High Contrast Cards)
         ======================================================== */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[16px] text-[var(--ink)]">
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
              className="clinic-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[14px] text-[var(--ink)]">
                    {srv.name[lang]}
                  </h3>
                  {srv.badge && (
                    <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded-full">
                      {srv.badge[lang]}
                    </span>
                  )}
                  {srv.partnerBrand && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
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
                  className="py-1.5 px-3 rounded-lg bg-[var(--accent-subtle)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white font-semibold text-[12px] transition-all touch-target"
                >
                  {t.featured.bookItem[lang]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          5. STANDARDS & LICENSING (Trust Foundation)
         ======================================================== */}
      <section className="clinic-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Camera className="w-3.5 h-3.5" />
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
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
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
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-[var(--ink)]">
                {t.standards.licenseTitle[lang]}
              </div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                {config.licenseNumber}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
