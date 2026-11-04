'use client';

import React from 'react';
import { Home, Layers, Calculator, Users, MapPin } from 'lucide-react';
import { Language, UI_TRANSLATIONS } from '../data/clinicData';

export type TabType = 'home' | 'services' | 'calculator' | 'doctors' | 'contacts';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lang: Language;
  triggerHaptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  lang,
  triggerHaptic,
}) => {
  const t = UI_TRANSLATIONS.nav;

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t.home[lang], icon: Home },
    { id: 'services', label: t.services[lang], icon: Layers },
    { id: 'calculator', label: t.calculator[lang], icon: Calculator },
    { id: 'doctors', label: t.doctors[lang], icon: Users },
    { id: 'contacts', label: t.contacts[lang], icon: MapPin },
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab !== tabId) {
      triggerHaptic('light');
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bottom-dock pb-safe border-t border-[var(--border)] shadow-lg">
      <div className="max-w-xl mx-auto flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] relative transition-all rounded-xl select-none ${
                isActive
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-[var(--accent)] rounded-full animate-in fade-in duration-200" />
              )}
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  isActive ? 'scale-110 stroke-[2.25]' : 'scale-100 stroke-[1.75]'
                }`}
              />
              <span className="text-[11px] tracking-tight leading-none text-center truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
