/**
 * CLINIC CONFIGURATION (Single Source of Truth)
 * Modify this file when onboarding a new dental clinic client.
 * Time required to configure a new clinic: < 1 hour.
 */

export type Language = 'ru' | 'uz' | 'en';

export interface DoctorConfig {
  id: string;
  name: Record<Language, string>;
  role: Record<Language, string>;
  specialization: Record<Language, string>;
  experienceYears?: number | null; // Optional: rendered only if verified
  credentials?: Record<Language, string> | null; // Optional: empty by default
  initials: string;
  photoUrl: string | null;
  schedule: {
    workingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
    startHour: number;
    endHour: number;
    slotDurationMinutes: number;
  };
}

export interface ServiceConfig {
  id: string;
  category: string;
  name: Record<Language, string>;
  priceUzs: string;
  priceUsd?: string;
  duration: Record<Language, string>;
  description: Record<Language, string>;
  badge?: Record<Language, string>;
  highlight?: boolean;
  partnerBrand?: string;
  keywords: string[];
}

export interface ClinicConfiguration {
  id: string;
  name: Record<Language, string>;
  city: Record<Language, string>;
  address: Record<Language, string>;
  landmark: Record<Language, string>;
  phone: string;
  phoneDisplay: string;
  telegramAdminUrl: string;
  adminIds: string[]; // Telegram user IDs of administrators
  languagesEnabled: Language[];
  theme: {
    primaryColor: string;
    accentColor: string;
  };
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    summary: Record<Language, string>;
  };
  licenseNumber?: string | null; // Optional: rendered only if provided by client (empty by default)
  catalogYear: string;
  rating?: number | null;
  reviewsCount?: number | null;
  emergencyBlockEnabled: boolean;
  reminderTimes: {
    firstReminderHoursBefore: number; // default: 24
    secondReminderHoursBefore: number; // default: 2
  };
  reportSettings: {
    weeklyReportDay: 'Monday';
    weeklyReportTimeTashkent: string; // '09:00'
    defaultPeriodDays: number; // 7
    estimatedMinutesSavedPerBooking: number; // 4
  };
  yandexMapsUrl: string;
  twoGisUrl: string;
}

export const CLINIC_CONFIG: ClinicConfiguration = {
  id: 'dentalux_tashkent',
  name: {
    ru: 'DentaLux',
    uz: 'DentaLux',
    en: 'DentaLux',
  },
  city: {
    ru: 'Ташкент',
    uz: 'Toshkent',
    en: 'Tashkent',
  },
  address: {
    ru: 'г. Ташкент, Яккасарайский р-н, ул. Шота Руставели, 54',
    uz: 'Toshkent sh., Yakkasaroy t., Shota Rustaveli ko‘chasi, 54',
    en: '54 Shota Rustaveli st., Yakkasaray district, Tashkent',
  },
  landmark: {
    ru: 'Ориентир: метро Ойбек (300 м)',
    uz: 'Mo‘ljal: Oybek metrosi (300 m)',
    en: 'Landmark: Oybek metro station (300 m)',
  },
  phone: '+998712000000',
  phoneDisplay: '+998 (71) 200-00-00',
  telegramAdminUrl: 'https://t.me/dentalux_admin',
  adminIds: (process.env.ADMIN_ID || '123456789').split(',').map((s) => s.trim()),
  languagesEnabled: ['ru', 'uz', 'en'],
  theme: {
    primaryColor: '#059669', // Emerald medical
    accentColor: '#0284c7', // Sky blue
  },
  hours: {
    weekdays: '09:00 — 21:00',
    saturday: '09:00 — 20:00',
    sunday: '10:00 — 18:00',
    summary: {
      ru: '09:00 — 21:00, без выходных',
      uz: '09:00 — 21:00, dam olish kunlarisiz',
      en: '09:00 — 21:00, 7 days a week',
    },
  },
  licenseNumber: null, // Empty by default; only rendered if client provides actual license number
  catalogYear: '2026',
  rating: null,
  reviewsCount: null,
  emergencyBlockEnabled: true,
  reminderTimes: {
    firstReminderHoursBefore: 24,
    secondReminderHoursBefore: 2,
  },
  reportSettings: {
    weeklyReportDay: 'Monday',
    weeklyReportTimeTashkent: '09:00',
    defaultPeriodDays: 7,
    estimatedMinutesSavedPerBooking: 4,
  },
  yandexMapsUrl: 'https://yandex.uz/maps/-/CDuWjF8A',
  twoGisUrl: 'https://2gis.uz/tashkent',
};

export const CLINIC_DOCTORS: DoctorConfig[] = [
  {
    id: 'kamilov',
    name: {
      ru: 'Д-р Жасур Камилов',
      uz: 'Dr. Jasur Komilov',
      en: 'Dr. Zhasur Kamilov',
    },
    role: {
      ru: 'Главный врач, хирург-имплантолог',
      uz: 'Bosh shifokor, jarroh-implantolog',
      en: 'Chief Medical Officer, Implant Surgeon',
    },
    specialization: {
      ru: 'Дентальная имплантация, костная пластика, синус-лифтинг',
      uz: 'Dental implantatsiya, suyak plastikasi, sinus-lifting',
      en: 'Dental implantology, bone grafting, sinus lift',
    },
    experienceYears: 16,
    credentials: {
      ru: 'Сертификация по хирургическим протоколам Straumann',
      uz: 'Straumann jarrohlik protokollari bo‘yicha sertifikatlangan',
      en: 'Certified in Straumann surgical protocols',
    },
    initials: 'ЖК',
    photoUrl: null,
    schedule: {
      workingDays: [1, 2, 3, 4, 5, 6],
      startHour: 9,
      endHour: 20,
      slotDurationMinutes: 30,
    },
  },
  {
    id: 'usmanova',
    name: {
      ru: 'Д-р Мадина Усманова',
      uz: 'Dr. Madina Usmonova',
      en: 'Dr. Madina Usmanova',
    },
    role: {
      ru: 'Врач-ортодонт',
      uz: 'Shifokor-ortodont',
      en: 'Orthodontist',
    },
    specialization: {
      ru: 'Брекет-системы Damon, элайнеры Spark, исправление прикуса',
      uz: 'Damon breket tizimlari, Spark elaynerlari, tish qatorini tekislash',
      en: 'Damon bracket systems, Spark aligners, malocclusion correction',
    },
    experienceYears: 11,
    credentials: {
      ru: 'Сертифицированный специалист по брекет-системам Damon',
      uz: 'Damon breket tizimlari bo‘yicha sertifikatlangan mutaxassis',
      en: 'Certified specialist in Damon bracket systems',
    },
    initials: 'МУ',
    photoUrl: null,
    schedule: {
      workingDays: [1, 2, 3, 4, 5, 6],
      startHour: 10,
      endHour: 19,
      slotDurationMinutes: 30,
    },
  },
  {
    id: 'rahimov',
    name: {
      ru: 'Д-р Тимур Рахимов',
      uz: 'Dr. Timur Rahimov',
      en: 'Dr. Timur Rakhimov',
    },
    role: {
      ru: 'Стоматолог-ортопед',
      uz: 'Stomatolog-ortoped',
      en: 'Prosthodontist',
    },
    specialization: {
      ru: 'Керамические виниры E.max, коронки из диоксида циркония',
      uz: 'E.max keramika vinirlari, sirkoniy dioksidi qoplamalari',
      en: 'E.max ceramic veneers, zirconia crowns',
    },
    experienceYears: 13,
    credentials: null,
    initials: 'ТР',
    photoUrl: null,
    schedule: {
      workingDays: [1, 2, 3, 4, 5],
      startHour: 9,
      endHour: 18,
      slotDurationMinutes: 30,
    },
  },
  {
    id: 'ahmedova',
    name: {
      ru: 'Д-р Нилуфар Ахмедова',
      uz: 'Dr. Nilufar Ahmedova',
      en: 'Dr. Nilufar Akhmedova',
    },
    role: {
      ru: 'Стоматолог-терапевт, детский врач',
      uz: 'Stomatolog-terapevt, bolalar shifokori',
      en: 'General & Pediatric Dentist',
    },
    specialization: {
      ru: 'Эстетическая реставрация, лечение каналов под микроскопом',
      uz: 'Estetik restavratsiya, tish kanallarini mikroskop ostida davolash',
      en: 'Aesthetic restorations, microscopic root canal treatment',
    },
    experienceYears: 9,
    credentials: null,
    initials: 'НА',
    photoUrl: null,
    schedule: {
      workingDays: [1, 2, 3, 4, 5, 6],
      startHour: 9,
      endHour: 20,
      slotDurationMinutes: 30,
    },
  },
];
