'use client';

import React, { useState } from 'react';
import { SlidingIndicator, useSlidingIndicator } from '../ui/SlidingIndicator';
import { Search, X, AlertCircle } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import {
  CATEGORIES,
  Language,
  UI_TRANSLATIONS,
} from '../../data/clinicData';

interface ServicesTabProps {
  lang: Language;
  onOpenBooking: (serviceTitle?: string) => void;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

import { useCatalog } from '../../lib/useCatalog';

export const ServicesTab: React.FC<ServicesTabProps> = ({
  lang,
  onOpenBooking,
  triggerHaptic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const categoryIndicator = useSlidingIndicator<string>(selectedCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = UI_TRANSLATIONS;

  const handleCategorySelect = (catId: string) => {
    triggerHaptic('light');
    setSelectedCategory(catId);
  };

  const handleClearSearch = () => {
    triggerHaptic('light');
    setSearchQuery('');
  };

  const { services: SERVICES } = useCatalog();
  const filteredServices = SERVICES.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesCategory;

    const matchesName = s.name[lang].toLowerCase().includes(query);
    const matchesDesc = s.description[lang].toLowerCase().includes(query);
    const matchesKeywords = s.keywords?.some((k) => k.toLowerCase().includes(query));

    return matchesCategory && (matchesName || matchesDesc || matchesKeywords);
  });

  return (
    <div className="space-y-6 pb-36 sm:pb-40">
      {/* Header and Search */}
      <div className="space-y-4">
        <div>
          <h1 className="type-page-title">
            {t.quickTiles.catalogTitle[lang]}
          </h1>
          <p className="text-[12px] text-[var(--ink-muted)]">
            {lang === 'uz'
              ? 'Toshkentdagi DentaLux klinikasining to‘liq xizmatlar narxnomasi'
              : lang === 'en'
              ? 'Complete dental treatment and diagnostics price list'
              : 'Официальный прайс-лист клиники DentaLux в Ташкенте'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'uz'
                ? 'Xizmat, og‘riq yoki mutaxassis bo‘yicha qidiruv...'
                : lang === 'en'
                ? 'Search treatment, symptom or specialist...'
                : 'Поиск услуги, симптома (болит зуб, пломба, брекеты)...'
            }
            className="w-full pl-11 pr-10 py-3 rounded-full border border-slate-200/90 bg-white/90 text-[var(--ink)] text-[13px] placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Category Chips */}
        <div
          ref={categoryIndicator.attach}
          className="relative flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
        >
          <SlidingIndicator
            box={categoryIndicator.box}
            className={selectedCategory === 'emergency' ? 'bg-red-600 shadow-xs' : 'bg-[var(--accent)] shadow-xs'}
          />
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const isEmergency = cat.id === 'emergency';

            return (
              <button
                key={cat.id}
                data-seg-key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-colors duration-300 flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'text-white'
                    : isEmergency
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-white/80 text-[var(--ink-secondary)] border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {isEmergency && <AlertCircle className="w-3.5 h-3.5" />}
                <span>{cat.label[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4 stagger">
        <div className="flex items-center justify-between text-[12px] text-[var(--ink-muted)] px-1">
          <span>
            {lang === 'uz'
              ? `Topildi: ${filteredServices.length} xizmat`
              : lang === 'en'
              ? `Found: ${filteredServices.length} services`
              : `Найдено: ${filteredServices.length} услуг`}
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleCategorySelect('all')}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              {lang === 'uz' ? 'Barchasini ko‘rsatish' : lang === 'en' ? 'Show all' : 'Сбросить фильтр'}
            </button>
          )}
        </div>

        {filteredServices.length === 0 ? (
          <EmptyState
            icon={<Search className="w-6 h-6" />}
            tone="neutral"
            title={
              lang === 'uz' ? 'Hech narsa topilmadi' : lang === 'en' ? 'No matching services found' : 'Ничего не найдено'
            }
            text={
              lang === 'uz'
                ? 'Boshqa so‘z bilan qidiring yoki umumiy konsultatsiyaga yoziling'
                : lang === 'en'
                ? 'Try another keyword or book a general initial consultation'
                : 'Попробуйте другой запрос или запишитесь на первичный осмотр'
            }
            action={{
              label: lang === 'uz' ? 'Qabulga yozilish' : lang === 'en' ? 'Book a visit' : 'Записаться на осмотр',
              onClick: () => onOpenBooking(),
            }}
          />
        ) : (
          filteredServices.map((srv) => (
            <div
              key={srv.id}
              className={`clinic-card p-4 sm:p-5 space-y-3 rounded-2xl transition-[transform,background-color,color,border-color,box-shadow,opacity] ${
                srv.highlight ? 'border-blue-300/80 bg-blue-50/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-[14px] text-[var(--ink)] leading-snug">
                      {srv.name[lang]}
                    </h3>
                    {srv.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          srv.badge.ru === 'SOS'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                        }`}
                      >
                        {srv.badge[lang]}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {srv.description[lang]}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <div className="font-serif italic text-[19px] text-[var(--accent)] leading-tight">
                    {srv.priceUzs}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
                    <span>{srv.duration[lang]}</span>
                    {srv.priceUsd && <span>· ≈ {srv.priceUsd}</span>}
                  </div>
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
          ))
        )}
      </div>
    </div>
  );
};
