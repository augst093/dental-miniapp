'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../data/clinicData';
import { Header } from '../components/Header';
import { BottomNav, TabType } from '../components/BottomNav';
import { StickyCta } from '../components/StickyCta';
import { BookingModal } from '../components/BookingModal';
import { HomeTab } from '../components/tabs/HomeTab';
import { ServicesTab } from '../components/tabs/ServicesTab';
import { CalculatorTab } from '../components/tabs/CalculatorTab';
import { DoctorsTab } from '../components/tabs/DoctorsTab';
import { ContactsTab } from '../components/tabs/ContactsTab';

export default function MiniAppPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [userName, setUserName] = useState<string>('');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingService, setBookingService] = useState<string>('Первичный 3D-осмотр (КТ)');
  const [bookingDoctor, setBookingDoctor] = useState<string>('');

  // Sticky CTA Dismissed State
  const [isCtaDismissed, setIsCtaDismissed] = useState<boolean>(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setTimeout(() => {
          if (tgUser.first_name) {
            setUserName(tgUser.first_name);
          }
          if (tgUser.language_code === 'uz') {
            setLang('uz');
          }
        }, 0);
      }
    }
  }, []);

  // Native Haptic Feedback Helper
  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  }, []);

  // Switch Tab with Haptic & Smooth Scroll
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // BackButton behavior for Tab Navigation (when modal is closed)
  const handleTabBack = useCallback(() => {
    triggerHaptic('light');
    setActiveTab('home');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [triggerHaptic]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // If modal is open, modal handles BackButton itself
    if (isBookingOpen) return;

    if (activeTab !== 'home') {
      tg.BackButton.show();
      tg.BackButton.onClick(handleTabBack);
    } else {
      tg.BackButton.hide();
      tg.BackButton.offClick(handleTabBack);
    }

    return () => {
      tg.BackButton.offClick(handleTabBack);
    };
  }, [activeTab, isBookingOpen, handleTabBack]);

  // Open booking modal helper
  const handleOpenBooking = (serviceTitle?: string, doctorTitle?: string) => {
    if (serviceTitle) setBookingService(serviceTitle);
    if (doctorTitle) setBookingDoctor(doctorTitle);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans select-none antialiased bg-mesh-radial">
      {/* 1. Sticky Opaque Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        triggerHaptic={triggerHaptic}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 px-4 pt-[74px] sm:pt-[80px] pb-3 max-w-xl mx-auto w-full">
        {activeTab === 'home' && (
          <HomeTab
            lang={lang}
            onNavigateTab={handleTabChange}
            onOpenBooking={handleOpenBooking}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'services' && (
          <ServicesTab
            lang={lang}
            onOpenBooking={handleOpenBooking}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorTab
            lang={lang}
            onOpenBooking={handleOpenBooking}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsTab
            lang={lang}
            onOpenBooking={handleOpenBooking}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsTab
            lang={lang}
            onOpenBooking={() => handleOpenBooking()}
            triggerHaptic={triggerHaptic}
          />
        )}
      </main>

      {/* 3. Sticky Primary CTA (Hidden when dismissed, on Calculator, or when booking modal is open) */}
      {!isBookingOpen && activeTab !== 'calculator' && !isCtaDismissed && (
        <StickyCta
          lang={lang}
          onOpenBooking={() => handleOpenBooking()}
          onDismiss={() => setIsCtaDismissed(true)}
          triggerHaptic={triggerHaptic}
        />
      )}

      {/* 4. Fixed Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={lang}
        triggerHaptic={triggerHaptic}
      />

      {/* 5. 3-Step Progressive Disclosure Booking Wizard */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialService={bookingService}
        initialDoctor={bookingDoctor}
        lang={lang}
        triggerHaptic={triggerHaptic}
        userNamePrefill={userName}
      />
    </div>
  );
}