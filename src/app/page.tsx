'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CLINIC_CONFIG, Language } from '../data/clinicData';
import { Header } from '../components/Header';
import { BottomNav, TabType } from '../components/BottomNav';
import { BookingModal } from '../components/BookingModal';
import { HomeTab } from '../components/tabs/HomeTab';
import { ServicesTab } from '../components/tabs/ServicesTab';
import { CalculatorTab } from '../components/tabs/CalculatorTab';
import { DoctorsTab } from '../components/tabs/DoctorsTab';
import { ContactsTab } from '../components/tabs/ContactsTab';
import { AdminPanel } from '../components/admin/AdminPanel';
import { telegramAuthHeaders } from '../lib/telegramClient';
import { OwnerReportTab } from '../components/admin/OwnerReportTab';
import { DemoControlDrawer } from '../components/admin/DemoControlDrawer';
import { ChatScreen } from '../components/chat/ChatScreen';
import { VisitCard } from '../components/VisitCard';
import { Onboarding } from '../components/Onboarding';
import { MessageCircle } from 'lucide-react';

// Patient dock order, used to decide which way content slides
const PATIENT_TAB_ORDER: TabType[] = ['home', 'services', 'calculator', 'doctors', 'contacts'];

export default function MiniAppPage() {
  const [lang, setLang] = useState<Language>('ru');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [userName, setUserName] = useState<string>('');

  // Role: 'patient' or 'admin' (Demo Mode enables quick switching)
  const [currentRole, setCurrentRole] = useState<'patient' | 'admin'>('patient');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingService, setBookingService] = useState<string>('Первичный 3D-осмотр (КТ)');
  const [bookingDoctor, setBookingDoctor] = useState<string>('');

  // Sticky CTA Dismissed State

  // Assistant chat (full-screen, opened from the floating button)
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  // Text prepared for the chat input (for example, from the visit card)
  const [chatDraft, setChatDraft] = useState<string>('');

  const openChatWith = (text: string) => {
    setChatDraft(text);
    setIsChatOpen(true);
  };

  // Admin inside Telegram: the server checks the signed initData and says whether this person is an admin
  const [isTgAdmin, setIsTgAdmin] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp?.initData) return;
    fetch('/api/me', { headers: telegramAuthHeaders() })
      .then((r) => r.json())
      .then((data) => setIsTgAdmin(Boolean(data?.isAdmin)))
      .catch(() => setIsTgAdmin(false));
  }, []);

  // Demo panel is hidden for patients; enable with ?demo=1 in the URL
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsDemoMode(new URLSearchParams(window.location.search).has('demo'));

    // Clinic branding: the accent colour comes from config, not from hardcoded CSS
    document.documentElement.style.setProperty('--accent', CLINIC_CONFIG.brand.accentColor);
  }, []);

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
  // Tab slide direction: moving right in the dock slides content in from the right, and back slides from the left
  const [tabDirection, setTabDirection] = useState<'next' | 'prev'>('next');

  const handleTabChange = useCallback(
    (tab: TabType) => {
      const from = PATIENT_TAB_ORDER.indexOf(activeTab);
      const to = PATIENT_TAB_ORDER.indexOf(tab);
      if (from !== -1 && to !== -1) setTabDirection(to >= from ? 'next' : 'prev');
      setActiveTab(tab);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [activeTab]
  );

  // Role change handler
  const handleRoleChange = (role: 'patient' | 'admin') => {
    setCurrentRole(role);
    if (role === 'admin') {
      setActiveTab('admin_today');
    } else {
      setActiveTab('home');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // BackButton behavior for Tab Navigation (when modal is closed)
  const handleTabBack = useCallback(() => {
    triggerHaptic('light');
    if (currentRole === 'admin') {
      setActiveTab('admin_today');
    } else {
      setActiveTab('home');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentRole, triggerHaptic]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (isBookingOpen) return;

    const isRoot = currentRole === 'admin' ? activeTab === 'admin_today' : activeTab === 'home';

    if (!isRoot) {
      tg.BackButton.show();
      tg.BackButton.onClick(handleTabBack);
    } else {
      tg.BackButton.hide();
      tg.BackButton.offClick(handleTabBack);
    }

    return () => {
      tg.BackButton.offClick(handleTabBack);
    };
  }, [activeTab, currentRole, isBookingOpen, handleTabBack]);

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
    <>
    {/* The app stays mounted but hidden while the chat is open, so nothing shows behind the chat */}
    <div
      style={{ display: isChatOpen ? 'none' : undefined }}
      className="min-h-[100dvh] bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans select-none antialiased bg-mesh-radial"
    >
      {/* 0. Demo Control Drawer & Discreet Floating Island Banner (only with ?demo=1) */}
      {isDemoMode && (
        <DemoControlDrawer
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          triggerHaptic={triggerHaptic}
        />
      )}

      {/* 0b. Admin switch for verified clinic admins opening the Mini App in Telegram */}
      {isTgAdmin && !isDemoMode && (
        <button
          onClick={() => handleRoleChange(currentRole === 'admin' ? 'patient' : 'admin')}
          className="fixed right-3 top-[14px] z-[60] rounded-full bg-[var(--accent)] text-white text-[12px] font-bold px-3.5 py-1.5 shadow-lg active:scale-95 transition-transform"
        >
          {currentRole === 'admin' ? 'Для пациентов' : 'Админ-панель'}
        </button>
      )}

      {/* 1. Sticky Opaque Header */}
      <Header
        lang={lang}
        onLanguageChange={setLang}
        triggerHaptic={triggerHaptic}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 px-4 pt-[78px] sm:pt-[84px] pb-3 max-w-xl mx-auto w-full">
        <div
          key={`${currentRole}-${activeTab}`}
          className={tabDirection === 'next' ? 'tab-enter-next' : 'tab-enter-prev'}
        >
        {/* ================= ADMIN VIEW ================= */}
        {currentRole === 'admin' ? (
          <>
            {activeTab === 'admin_report' ? (
              <OwnerReportTab
                lang={lang}
                triggerHaptic={triggerHaptic}
              />
            ) : (
              <AdminPanel
                lang={lang}
                triggerHaptic={triggerHaptic}
                onOpenReport={() => handleTabChange('admin_report')}
                onSwitchToPatientView={() => handleRoleChange('patient')}
              />
            )}
          </>
        ) : (
          /* ================= PATIENT VIEW ================= */
          <>
            {activeTab === 'home' && <VisitCard lang={lang} onAskChat={openChatWith} />}
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
          </>
        )}
        </div>
      </main>

      {/* 3a. First-open onboarding (patient view; skipped in demo mode so presentations are not interrupted) */}
      <Onboarding lang={lang} enabled={!isDemoMode && currentRole === 'patient'} />

      {/* 3b. Floating chat button (patient view, above the navigation dock) */}
      {currentRole === 'patient' && !isBookingOpen && !isChatOpen && activeTab !== 'calculator' && (
        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsChatOpen(true);
          }}
          aria-label="Чат с ассистентом"
          className={`fixed right-4 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-[var(--accent)] border border-blue-100 shadow-2xl flex items-center justify-center active:scale-90 transition-transform chat-fab ${
            'bottom-[96px]'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* 4. Fixed Bottom Navigation Dock */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={lang}
        triggerHaptic={triggerHaptic}
        role={currentRole}
        onSwitchRole={handleRoleChange}
      />

    </div>

    {/* 5. 3-Step Progressive Disclosure Booking Wizard (outside the hidden app root, so it works from the chat) */}
    <BookingModal
      isOpen={isBookingOpen}
      onClose={handleCloseBooking}
      initialService={bookingService}
      initialDoctor={bookingDoctor}
      lang={lang}
      triggerHaptic={triggerHaptic}
      userNamePrefill={userName}
    />

    {/* 3c. Assistant chat: full screen. Booking opened from the chat returns here when closed. */}
    {isChatOpen && (
      <ChatScreen
        lang={lang}
        onClose={() => {
          setIsChatOpen(false);
          setChatDraft('');
        }}
        onOpenBooking={() => handleOpenBooking()}
        initialDraft={chatDraft}
        triggerHaptic={triggerHaptic}
      />
    )}
    </>
  );
}