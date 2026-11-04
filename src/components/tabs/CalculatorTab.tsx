'use client';

import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Check,
  Calendar,
  CreditCard,
} from 'lucide-react';
import {
  TREATMENT_CALCULATOR_OPTIONS,
  Language,
  UI_TRANSLATIONS,
} from '../../data/clinicData';

interface CalculatorTabProps {
  lang: Language;
  onOpenBooking: (serviceTitle?: string) => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  lang,
  onOpenBooking,
  triggerHaptic,
}) => {
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number>(0);
  const [planUnits, setPlanUnits] = useState<number>(
    TREATMENT_CALCULATOR_OPTIONS[0].defaultUnits
  );

  const t = UI_TRANSLATIONS.calculator;
  const currentPlan = TREATMENT_CALCULATOR_OPTIONS[selectedPlanIdx];

  const handlePlanSelect = (idx: number) => {
    triggerHaptic('light');
    setSelectedPlanIdx(idx);
    setPlanUnits(TREATMENT_CALCULATOR_OPTIONS[idx].defaultUnits);
  };

  const handleIncrement = () => {
    if (planUnits < currentPlan.maxUnits) {
      triggerHaptic('light');
      setPlanUnits((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (planUnits > currentPlan.minUnits) {
      triggerHaptic('light');
      setPlanUnits((prev) => prev - 1);
    }
  };

  const handlePresetSelect = (units: number) => {
    triggerHaptic('light');
    setPlanUnits(units);
  };

  const totalUzs = (currentPlan.basePriceUzs * planUnits).toLocaleString('ru-RU');
  const totalUsd = (currentPlan.basePriceUsd * planUnits).toLocaleString('en-US');

  const handleBookWithEstimate = () => {
    triggerHaptic('medium');
    const serviceName = `${currentPlan.name[lang]} (${planUnits} ${currentPlan.unitLabel[lang]}) ~ ${totalUzs} сум`;
    onOpenBooking(serviceName);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title & Clinical Context */}
      <div>
        <h1 className="text-xl font-extrabold text-[var(--ink)]">
          {t.title[lang]}
        </h1>
        <p className="text-[12px] text-[var(--ink-secondary)] mt-1 leading-relaxed">
          {t.subtitle[lang]}
        </p>
      </div>

      {/* Protocol Selection Tabs */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-bold text-[var(--ink)] block">
          {t.selectProtocol[lang]}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TREATMENT_CALCULATOR_OPTIONS.map((plan, idx) => {
            const isSelected = selectedPlanIdx === idx;
            return (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-[13px] text-[var(--ink)] leading-snug">
                  {plan.name[lang]}
                </div>
                <div className="text-[11px] text-[var(--ink-muted)] mt-1">
                  {plan.durationStr[lang]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Units & Stepper Card */}
      <div className="clinic-card p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[13px] font-bold text-[var(--ink)]">
              {t.selectUnits[lang]}
            </div>
            <div className="text-[12px] text-[var(--accent)] font-semibold mt-0.5">
              {planUnits} {currentPlan.unitLabel[lang]}
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-2 bg-[var(--surface-subtle)] border border-[var(--border)] p-1 rounded-xl">
            <button
              onClick={handleDecrement}
              disabled={planUnits <= currentPlan.minUnits}
              className="w-9 h-9 rounded-lg bg-[var(--surface)] text-[var(--ink)] hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all border border-[var(--border)]"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold font-mono text-[16px] w-8 text-center text-[var(--ink)]">
              {planUnits}
            </span>
            <button
              onClick={handleIncrement}
              disabled={planUnits >= currentPlan.maxUnits}
              className="w-9 h-9 rounded-lg bg-[var(--surface)] text-[var(--ink)] hover:bg-slate-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all border border-[var(--border)]"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Presets if available */}
        {currentPlan.presets && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {currentPlan.presets.map((preset) => {
              const isSelected = planUnits === preset.units;
              return (
                <button
                  key={preset.units}
                  onClick={() => handlePresetSelect(preset.units)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'bg-[var(--surface-subtle)] text-[var(--ink-secondary)] hover:bg-slate-200'
                  }`}
                >
                  {preset.label[lang]}
                </button>
              );
            })}
          </div>
        )}

        {/* Total Cost Display Box */}
        <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            {t.totalLabel[lang]}
          </div>
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {totalUzs} сум
            </div>
            <div className="text-[13px] text-slate-300 font-mono">
              ≈ ${totalUsd}
            </div>
          </div>
        </div>

        {/* Installment Badge */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-900 text-[12px]">
          <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-medium">{t.installmentBadge[lang]}</span>
        </div>

        {/* Included Scope Breakdown */}
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="text-[13px] font-bold text-[var(--ink)]">
            {t.scopeTitle[lang]}
          </div>
          <div className="text-[12px] text-[var(--ink-secondary)] bg-[var(--surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1.5">
            <p className="font-semibold text-[var(--ink)] mb-2">
              {currentPlan.clinicalScope[lang]}
            </p>
            <ul className="space-y-1.5">
              {currentPlan.breakdown[lang].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Notice (No Prepayment, Zero Fear) */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[12px] text-emerald-900 leading-relaxed font-medium">
          {t.trustNotice[lang]}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleBookWithEstimate}
          className="w-full py-3.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all touch-target"
        >
          <Calendar className="w-4 h-4" />
          <span>{t.ctaBookWithEstimate[lang]}</span>
        </button>
      </div>
    </div>
  );
};
