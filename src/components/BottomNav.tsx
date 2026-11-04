'use client';

import React from 'react';
import {
  Home,
  Layers,
  Calculator,
  Users,
  MapPin,
  Calendar,
  BarChart3,
  User,
} from 'lucide-react';
import { Language, UI_TRANSLATIONS } from '../data/clinicData';
import { SlidingIndicator, useSlidingIndicator } from './ui/SlidingIndicator';

export type TabType =
  | 'home'
  | 'services'
  | 'calculator'
  | 'doctors'
  | 'contacts'
  | 'admin_today'
  | 'admin_report';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lang: Language;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
  role?: 'patient' | 'admin';
  onSwitchRole?: (role: 'patient' | 'admin') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  lang,
  triggerHaptic,
  role = 'patient',
  onSwitchRole,
}) => {
  const t = UI_TRANSLATIONS.nav;
  const indicator = useSlidingIndicator<TabType>(activeTab);

  // Patient navigation items
  const patientTabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t.home[lang], icon: Home },
    { id: 'services', label: t.services[lang], icon: Layers },
    { id: 'calculator', label: t.calculator[lang], icon: Calculator },
    { id: 'doctors', label: t.doctors[lang], icon: Users },
    { id: 'contacts', label: t.contacts[lang], icon: MapPin },
  ];

  // Admin navigation items
  const adminTabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    {
      id: 'admin_today',
      label: lang === 'uz' ? 'Qabullar' : lang === 'en' ? 'Today' : 'Записи',
      icon: Calendar,
    },
    {
      id: 'admin_report',
      label: lang === 'uz' ? 'Hisobot' : lang === 'en' ? 'Report' : 'Отчёт',
      icon: BarChart3,
    },
    {
      id: 'home',
      label: lang === 'uz' ? 'Bemor' : lang === 'en' ? 'Patient' : 'Пациент',
      icon: User,
    },
  ];

  const currentTabs = role === 'admin' ? adminTabs : patientTabs;

  const handleTabClick = (tabId: TabType) => {
    if (role === 'admin' && tabId === 'home') {
      triggerHaptic('medium');
      if (onSwitchRole) onSwitchRole('patient');
      onTabChange('home');
      return;
    }

    if (activeTab !== tabId) {
      triggerHaptic('light');
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40 pointer-events-none pb-safe">
      <div
        ref={indicator.attach}
        className="relative frosted-glass-pill backdrop-blur-2xl backdrop-saturate-150 p-1.5 rounded-full flex items-center justify-around gap-0.5 shadow-2xl pointer-events-auto border border-white/95"
      >
        <SlidingIndicator
          box={indicator.box}
          className="bg-blue-50/90 shadow-xs border border-blue-200/60"
        />
        {currentTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              data-seg-key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] relative transition-colors duration-300 rounded-full select-none ${
                isActive
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.3]' : 'scale-100 stroke-[1.8]'
                }`}
              />
              <span className="text-[10px] sm:text-[11px] tracking-tight leading-none text-center truncate max-w-[62px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
