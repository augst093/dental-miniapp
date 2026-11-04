export type Language = 'ru' | 'uz' | 'en';

export interface ClinicConfig {
  name: Record<Language, string>;
  city: Record<Language, string>;
  address: Record<Language, string>;
  landmark: Record<Language, string>;
  phone: string;
  phoneDisplay: string;
  telegramAdminUrl: string;
  // Branding: applied to the accent colour on load, so each clinic can have its own
  brand: {
    accentColor: string;
  };
  // Administrator hourly cost in UZS, used to show savings in money; 0 hides the line
  adminHourlyRateUzs: number; // TODO: уточнить ставку администратора у клиники
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    summary: Record<Language, string>;
  };
  licenseNumber: string; // TODO: подтвердить у клиники точный номер лицензии Минздрава
  catalogYear: string;
  rating: number | null; // TODO: подтвердить у клиники реальный рейтинг перед показом
  reviewsCount: number | null;
  partnerBrands: string[];
  yandexMapsUrl: string;
  twoGisUrl: string;
}

export const CLINIC_CONFIG: ClinicConfig = {
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
  telegramAdminUrl: 'https://t.me/dentalux_admin', // TODO: заменить реальным логином администратора
  brand: {
    accentColor: '#1D4ED8', // Electric royal cobalt, matches the current design
  },
  adminHourlyRateUzs: 0, // TODO: уточнить ставку администратора у клиники
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
  licenseNumber: '', // Optional: will be rendered only if filled by the clinic
  catalogYear: '2026',
  rating: null, // TODO: подтвердить у клиники реальный рейтинг перед показом
  reviewsCount: null,
  partnerBrands: ['Straumann', 'Damon', 'Ormco', 'Ivoclar'], // TODO: подтвердить у клиники партнерские сертификаты
  yandexMapsUrl: 'https://yandex.uz/maps/-/CDuWjF8A',
  twoGisUrl: 'https://2gis.uz/tashkent',
};

export interface ServiceItem {
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

export interface Doctor {
  id: string;
  name: Record<Language, string>;
  role: Record<Language, string>;
  specialization: Record<Language, string>;
  experienceYears: number;
  credentials: Record<Language, string>;
  initials: string;
  photoUrl: string | null; // TODO: заменить реальным фото врача (null = аккуратный плейсхолдер)
}

export interface TreatmentPlanOption {
  id: string;
  name: Record<Language, string>;
  basePriceUzs: number;
  basePriceUsd: number;
  durationStr: Record<Language, string>;
  defaultUnits: number;
  minUnits: number;
  maxUnits: number;
  unitLabel: Record<Language, string>;
  presets?: { units: number; label: Record<Language, string> }[];
  clinicalScope: Record<Language, string>;
  breakdown: Record<Language, string[]>;
  partnerBrand?: string;
}

export interface ClinicReview {
  id: string;
  author: string;
  date: string;
  treatment: Record<Language, string>;
  text: Record<Language, string>;
  rating: number;
}

// TODO: подключить реальные отзывы пациентов клиники после верификации
export const CLINIC_REVIEWS: ClinicReview[] = [];

export const CATEGORIES = [
  { id: 'all', label: { ru: 'Все услуги', uz: 'Barcha xizmatlar', en: 'All Services' } },
  { id: 'emergency', label: { ru: 'Острая боль (SOS)', uz: 'O‘tkir og‘riq (SOS)', en: 'Urgent Pain (SOS)' } },
  { id: 'diagnostics', label: { ru: 'Диагностика', uz: 'Tashxis', en: 'Diagnostics' } },
  { id: 'therapy', label: { ru: 'Терапия', uz: 'Terapiya', en: 'Therapy' } },
  { id: 'implants', label: { ru: 'Имплантация', uz: 'Implantatsiya', en: 'Implants' } },
  { id: 'orthodontics', label: { ru: 'Ортодонтия', uz: 'Ortodontiya', en: 'Orthodontics' } },
  { id: 'orthopedics', label: { ru: 'Ортопедия и виниры', uz: 'Ortopediya va vinirlar', en: 'Prosthodontics' } },
  { id: 'pediatric', label: { ru: 'Детская стоматология', uz: 'Bolalar stomatologiyasi', en: 'Pediatric' } },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'emergency-relief',
    category: 'emergency',
    name: {
      ru: 'Неотложная помощь при острой боли',
      uz: 'O‘tkir tish og‘rig‘ida tezkor yordam',
      en: 'Emergency Pain Relief Visit',
    },
    priceUzs: 'от 250 000 сум',
    priceUsd: '$20',
    duration: {
      ru: 'Срочно (в день обращения)',
      uz: 'Shoshilinch (murojaat kuni)',
      en: 'Urgent (same day)',
    },
    description: {
      ru: 'Снятие пульсирующей боли, обезболивание, вскрытие полости при пульпите или периодонтите без очереди.',
      uz: 'Og‘riqni tezkor qoldirish, anesteziya, pulpit va periodontitda shoshilinch yordam ko‘rsatish.',
      en: 'Immediate local anesthesia, pulpitis/periodontitis intervention, and urgent relief without delay.',
    },
    badge: { ru: 'SOS', uz: 'SOS', en: 'SOS' },
    highlight: true,
    keywords: ['боль', 'болит', 'острая', 'пульпит', 'неотложка', 'срочно', 'зуб', 'og‘riq', 'pain', 'emergency'],
  },
  {
    id: 'consultation-3d',
    category: 'diagnostics',
    name: {
      ru: 'Консультация врача + 3D-снимок (КТ)',
      uz: 'Shifokor ko‘rigi + 3D-tomografiya (KT)',
      en: 'Doctor Consultation + 3D CT Scan',
    },
    priceUzs: 'Бесплатно при начале лечения',
    priceUsd: '$0',
    duration: {
      ru: '30–45 мин',
      uz: '30–45 daq',
      en: '30–45 mins',
    },
    description: {
      ru: 'Компьютерная томография челюстно-лицевой области на томографе Vatech и составление прозрачного плана лечения.',
      uz: 'Vatech raqamli tomografida tekshirish va shaxsiy shaffof davolash rejasini tuzish.',
      en: 'Computed tomography scan on a digital dental scanner with comprehensive treatment planning.',
    },
    badge: { ru: 'Бесплатно', uz: 'Bepul', en: 'Free' },
    highlight: true,
    keywords: ['диагностика', 'кт', 'снимок', 'консультация', 'осмотр', 'tashxis', 'rentgen', 'scan'],
  },
  {
    id: 'straumann-implant',
    category: 'implants',
    name: {
      ru: 'Имплантация Straumann (Швейцария)',
      uz: 'Straumann implantatsiyasi (Shveytsariya)',
      en: 'Straumann Dental Implant (Switzerland)',
    },
    priceUzs: 'от 8 500 000 сум',
    priceUsd: '$670',
    duration: {
      ru: '1 визит (30–45 мин)',
      uz: '1 tashrif (30–45 daq)',
      en: '1 visit (30–45 mins)',
    },
    description: {
      ru: 'Оригинальный швейцарский титановый имплантат с гидрофильной поверхностью SLActive для надёжного приживления.',
      uz: 'Tez va ishonchli birikuvchi gidrofil yuzaga ega Shveytsariya original titan implantatini o‘rnatish.',
      en: 'Placement of a Swiss titanium implant with hydrophilic SLActive surface for optimal osseointegration.',
    },
    partnerBrand: 'Straumann',
    badge: { ru: 'Швейцария', uz: 'Shveytsariya', en: 'Swiss' },
    keywords: ['имплант', 'имплантация', 'штрауман', 'straumann', 'implant', 'tish'],
  },
  {
    id: 'osstem-implant',
    category: 'implants',
    name: {
      ru: 'Имплантация Osstem (Южная Корея)',
      uz: 'Osstem implantatsiyasi (Janubiy Koreya)',
      en: 'Osstem Dental Implant (South Korea)',
    },
    priceUzs: 'от 4 500 000 сум',
    priceUsd: '$350',
    duration: {
      ru: '1 визит (30 мин)',
      uz: '1 tashrif (30 daq)',
      en: '1 visit (30 mins)',
    },
    description: {
      ru: 'Классическая или одномоментная имплантация корейской сертифицированной системой.',
      uz: 'Koreya sertifikatlangan tizimi orqali klassik yoki darhol o‘rnatiladigan implantatsiya.',
      en: 'Standard two-stage or immediate implant placement using certified Korean systems.',
    },
    keywords: ['осстем', 'osstem', 'корея', 'имплант', 'implant'],
  },
  {
    id: 'damon-q2',
    category: 'orthodontics',
    name: {
      ru: 'Брекет-система Damon Q2 (США)',
      uz: 'Damon Q2 passiv breket tizimi (AQSh)',
      en: 'Damon Q2 Metal Braces (USA)',
    },
    priceUzs: 'от 7 500 000 сум / челюсть',
    priceUsd: '$600',
    duration: {
      ru: 'Курс 12–18 мес',
      uz: 'Kurs 12–18 oy',
      en: 'Course 12–18 mos',
    },
    description: {
      ru: 'Самолигирующие брекеты пониженного трения для бережного выравнивания прикуса без удаления здоровых зубов.',
      uz: 'Tishlarni sog‘lom sug‘urmasdan nozik tekislash uchun past ishqalanishli passiv breketlar.',
      en: 'Passive self-ligating metal braces designed for gentle alignment without extractions.',
    },
    partnerBrand: 'Damon',
    keywords: ['брекеты', 'дэймон', 'прикус', 'выравнивание', 'breket', 'tekislash', 'braces'],
  },
  {
    id: 'spark-aligners',
    category: 'orthodontics',
    name: {
      ru: 'Ортодонтические элайнеры Spark',
      uz: 'Spark ortodontik elaynerlari',
      en: 'Spark Clear Aligners',
    },
    priceUzs: 'от 15 000 000 сум',
    priceUsd: '$1 200',
    duration: {
      ru: 'Курс 6–14 мес',
      uz: 'Kurs 6–14 oy',
      en: 'Course 6–14 mos',
    },
    description: {
      ru: 'Прозрачные съёмные каппы из медицинского полимера TruGEN для комфортного выравнивания без металлических замков.',
      uz: 'Metall qulflarsiz qulay va sezilarsiz tekislash uchun TruGEN polimeridan shaffof kapalar.',
      en: 'Transparent removable clear aligners made from medical-grade TruGEN material.',
    },
    partnerBrand: 'Ormco',
    keywords: ['капы', 'элайнеры', 'прозрачные', 'спарк', 'elayner', 'kapa', 'aligners'],
  },
  {
    id: 'emax-veneers',
    category: 'orthopedics',
    name: {
      ru: 'Керамические виниры E.max',
      uz: 'E.max keramika vinirlari',
      en: 'E.max Ceramic Veneers',
    },
    priceUzs: 'от 3 000 000 сум / ед.',
    priceUsd: '$240',
    duration: {
      ru: '2–3 визита',
      uz: '2–3 tashrif',
      en: '2–3 visits',
    },
    description: {
      ru: 'Керамические накладки из дисиликата лития Ivoclar для восстановления безупречной формы, цвета и анатомии зубов.',
      uz: 'Tish shakli, oqligi va anatomiyasini tiklash uchun Ivoclar litiy disilikatli qoplamalari.',
      en: 'Lithium disilicate ceramic veneers by Ivoclar to restore tooth shape, color, and anatomy.',
    },
    partnerBrand: 'Ivoclar',
    keywords: ['виниры', 'керамика', 'емакс', 'эстетика', 'голливудская улыбка', 'vinir', 'veneers'],
  },
  {
    id: 'hygiene-complex',
    category: 'therapy',
    name: {
      ru: 'Профессиональная гигиена полости рта',
      uz: 'Og‘iz bo‘shlig‘i gigiyenasi',
      en: 'Professional Dental Hygiene',
    },
    priceUzs: '550 000 сум',
    priceUsd: '$45',
    duration: {
      ru: '45 мин',
      uz: '45 daq',
      en: '45 mins',
    },
    description: {
      ru: 'Ультразвуковое удаление зубного камня, чистка AirFlow от пигментного налёта и реминерализирующая терапия эмали.',
      uz: 'Toshlarni ultratovush bilan tozalash, AirFlow apparatida dog‘larni ketkazish va emalni mustahkamlash.',
      en: 'Ultrasonic calculus removal, AirFlow plaque polishing, and remineralizing enamel treatment.',
    },
    keywords: ['чистка', 'гигиена', 'камень', 'айрфлоу', 'отбеливание', 'tozalash', 'cleaning'],
  },
  {
    id: 'pediatric-therapy',
    category: 'pediatric',
    name: {
      ru: 'Лечение кариеса молочных зубов',
      uz: 'Sut tishlari kariesini davolash',
      en: 'Pediatric Caries Treatment',
    },
    priceUzs: 'от 280 000 сум',
    priceUsd: '$22',
    duration: {
      ru: '30 мин',
      uz: '30 daq',
      en: '30 mins',
    },
    description: {
      ru: 'Бережное лечение молочных зубов с деликатной анестезией, мультфильмами и адаптацией для детей без слёз.',
      uz: 'Og‘riqsizlantirish, multfilmlar va mehr bilan bolalar sut tishlarini qo‘rquvsiz davolash.',
      en: 'Gentle treatment of deciduous teeth using topical anesthesia and psychological adaptation for kids.',
    },
    keywords: ['детям', 'детский', 'молочные зубы', 'кариес', 'пломба', 'bolalar', 'pediatric'],
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'karimov',
    name: {
      ru: 'Д-р Сардор Каримов',
      uz: 'Dr. Sardor Karimov',
      en: 'Dr. Sardor Karimov',
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
      ru: 'Ташкентская медицинская академия. Сертификация по хирургическим протоколам Straumann.',
      uz: 'Toshkent tibbiyot akademiyasi. Straumann jarrohlik protokollari bo‘yicha sertifikatlangan.',
      en: 'Tashkent Medical Academy. Certified in Straumann surgical protocols.',
    },
    initials: 'СК',
    photoUrl: null, // TODO: заменить реальным фото врача
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
      ru: 'Сертифицированный специалист по самолигирующим системам Ormco и прозрачным элайнерам.',
      uz: 'Ormco tizimlari va shaffof elaynerlar bo‘yicha sertifikatlangan mutaxassis.',
      en: 'Certified specialist in Ormco self-ligating systems and clear aligners.',
    },
    initials: 'МУ',
    photoUrl: null, // TODO: заменить реальным фото врача
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
      en: 'E.max ceramic veneers, zirconia crowns, functional rehabilitation',
    },
    experienceYears: 13,
    credentials: {
      ru: 'Специализация по цифровому протоколу протезирования и микропротезированию зубов.',
      uz: 'Raqamli tish protezlash va mikroprotezlash bo‘yicha ixtisoslashgan.',
      en: 'Specialized in digital prosthodontic protocols and ceramic micro-restorations.',
    },
    initials: 'ТР',
    photoUrl: null, // TODO: заменить реальным фото врача
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
      en: 'Dental Practitioner, Pediatric Dentist',
    },
    specialization: {
      ru: 'Эндодонтия, эстетическая реставрация, адаптация тревожных деток',
      uz: 'Endodontiya, estetik restavratsiya, bolalarni mehr bilan moslashtirish',
      en: 'Endodontics, aesthetic restorations, pediatric patient adaptation',
    },
    experienceYears: 8,
    credentials: {
      ru: 'Обучение современным протоколам эндодонтического лечения и приёма детей без слёз.',
      uz: 'Zamonaviy endodontik davolash va bolalarni qo‘rquvsiz qabul qilish protokollari bo‘yicha mutaxassis.',
      en: 'Trained in advanced endodontic treatment protocols and pediatric care.',
    },
    initials: 'НА',
    photoUrl: null, // TODO: заменить реальным фото врача
  },
];

export const TREATMENT_CALCULATOR_OPTIONS: TreatmentPlanOption[] = [
  {
    id: 'implants',
    name: {
      ru: 'Имплантация Straumann',
      uz: 'Straumann implantatsiyasi',
      en: 'Straumann Dental Implant',
    },
    basePriceUzs: 8500000,
    basePriceUsd: 670,
    durationStr: {
      ru: '1 визит хирургии (приживление 8–12 недель)',
      uz: '1 jarrohlik tashrifi (birikishi 8–12 hafta)',
      en: '1 surgical visit (healing 8–12 weeks)',
    },
    defaultUnits: 1,
    minUnits: 1,
    maxUnits: 6,
    unitLabel: { ru: 'имплант(а)', uz: 'implant', en: 'implant(s)' },
    presets: [
      { units: 1, label: { ru: '1 имплант', uz: '1 implant', en: '1 implant' } },
      { units: 2, label: { ru: '2 импланта', uz: '2 implant', en: '2 implants' } },
      { units: 4, label: { ru: '4 (All-on-4)', uz: '4 (All-on-4)', en: '4 (All-on-4)' } },
    ],
    clinicalScope: {
      ru: 'Хирургический этап: титановый имплантат Straumann, анестезия, 3D КТ и формирователь десны.',
      uz: 'Jarrohlik bosqichi: Straumann titan implantati, og‘riqsizlantirish, nazorat KT va milk shakllantiruvchi qopqoqcha.',
      en: 'Surgical stage: Straumann titanium implant, local anesthesia, follow-up CT, and healing abutment.',
    },
    breakdown: {
      ru: [
        'Оригинальный имплантат Straumann (Швейцария) с паспортом изделия',
        'Местная анестезия немецким препаратом Ubistesin',
        'Контрольная 3D-томография после установки',
        'Установка формирователя десны и снятие швов',
        'Коронка (цирконий/керамика) устанавливается на этапе ортопедии через 2-3 мес.',
      ],
      uz: [
        'Original Straumann (Shveytsariya) titan implantati mahsulot pasporti bilan',
        'Germaniyaning Ubistesin vositasi bilan og‘riqsizlantirish',
        'O‘rnatilgandan keyingi nazorat 3D-tomografiyasi',
        'Milk shakllantiruvchi qopqoqchani o‘rnatish va choklarni olish',
        'Qoplama (sirkoniy/keramika) 2-3 oydan so‘ng ortopediya bosqichida qo‘yiladi',
      ],
      en: [
        'Genuine Straumann (Switzerland) titanium implant with certificate',
        'Local anesthesia using German Ubistesin',
        'Follow-up 3D computed tomography scan',
        'Healing abutment placement & suture removal',
        'Crown (zirconia/ceramic) is placed during prosthetic phase after 2-3 months',
      ],
    },
    partnerBrand: 'Straumann',
  },
  {
    id: 'veneers',
    name: {
      ru: 'Керамические виниры E.max',
      uz: 'E.max keramika vinirlari',
      en: 'E.max Ceramic Veneers',
    },
    basePriceUzs: 3000000,
    basePriceUsd: 240,
    durationStr: {
      ru: '2–3 визита (срок лаборатории 5–7 дней)',
      uz: '2–3 tashrif (laboratoriya muddati 5–7 kun)',
      en: '2–3 visits (lab turnaround 5–7 days)',
    },
    defaultUnits: 6,
    minUnits: 1,
    maxUnits: 12,
    unitLabel: { ru: 'винир(ов)', uz: 'vinir', en: 'veneer(s)' },
    presets: [
      { units: 4, label: { ru: 'Зона улыбки (4)', uz: 'Old tishlar (4)', en: 'Smile zone (4)' } },
      { units: 6, label: { ru: 'Линия улыбки (6)', uz: 'Tabassum chizig‘i (6)', en: 'Full smile (6)' } },
      { units: 10, label: { ru: 'Челюсть (10)', uz: 'To‘liq jag‘ (10)', en: 'Full arch (10)' } },
    ],
    clinicalScope: {
      ru: 'Компьютерное 3D-сканирование, деликатная микрообработка эмали, временные накладки и фиксация.',
      uz: '3D raqamli skanerlash, emalni nozik tayyorlash, vaqtinchalik qoplamalar va mustahkam mahkamlash.',
      en: 'Digital 3D scanning, minimal enamel prep, provisional restorations, and adhesive bonding.',
    },
    breakdown: {
      ru: [
        'Цифровой дизайн улыбки (Digital Smile Design) до начала работы',
        'Высокопрочная прессованная керамика Ivoclar IPS e.max (Лихтенштейн)',
        'Временные защитные виниры на период изготовления',
        'Адгезивная фиксация на светоотверждаемый цемент Variolink',
      ],
      uz: [
        'Ishni boshlashdan oldin raqamli tabassum dizayni (Digital Smile Design)',
        'Ivoclar IPS e.max yuqori chidamli presslangan keramikasi (Lixtenshteyn)',
        'Tayyorlanish davrida vaqtinchalik himoya vinirlari',
        'Variolink maxsus sementi bilan mustahkam yopishtirish',
      ],
      en: [
        'Digital Smile Design preview before any enamel preparation',
        'High-strength pressed ceramic by Ivoclar IPS e.max',
        'Provisional aesthetic veneers during lab fabrication',
        'Adhesive cementation using Variolink light-cured cement',
      ],
    },
    partnerBrand: 'Ivoclar',
  },
  {
    id: 'brackets',
    name: {
      ru: 'Брекет-система Damon Q2',
      uz: 'Damon Q2 breket tizimi',
      en: 'Damon Q2 Bracket System',
    },
    basePriceUzs: 7500000,
    basePriceUsd: 600,
    durationStr: {
      ru: 'Курс лечения 12–18 месяцев',
      uz: 'Davolash kursi 12–18 oy',
      en: 'Treatment course 12–18 months',
    },
    defaultUnits: 2,
    minUnits: 1,
    maxUnits: 2,
    unitLabel: { ru: 'челюсть(и)', uz: 'jag‘', en: 'jaw(s)' },
    presets: [
      { units: 1, label: { ru: '1 челюсть', uz: '1 jag‘', en: '1 jaw' } },
      { units: 2, label: { ru: '2 челюсти (комплекс)', uz: '2 jag‘ (kompleks)', en: 'Both jaws' } },
    ],
    clinicalScope: {
      ru: 'Диагностика, фиксация замков Damon, стартовый набор дуг Ormco и план перемещения зубов.',
      uz: 'Tashxis, Damon qulflarini o‘rnatish, boshlang‘ich Ormco simlari va davolash rejasi.',
      en: 'Full diagnostic analysis, Damon bracket bonding, initial Ormco archwires, and movement roadmap.',
    },
    breakdown: {
      ru: [
        'Оригинальная американская пассивная самолигирующая система Damon Q2',
        'Комплект дуг с памятью формы CuNiTi (Ormco USA)',
        'Установка и фиксация брекетов на световой адгезив',
        'Плановые активации проводятся 1 раз в 1.5–2 месяца',
      ],
      uz: [
        'Original Amerika passiv breket tizimi Damon Q2',
        'Shaklni eslab qoluvchi CuNiTi simlar to‘plami (Ormco USA)',
        'Breketlarni maxsus polimer yelim yordamida o‘rnatish',
        'Rejali faollashtirish tekshiruvlari har 1.5–2 oyda 1 marta o‘tkaziladi',
      ],
      en: [
        'Genuine American passive self-ligating Damon Q2 bracket kit',
        'High-tech shape-memory CuNiTi archwires (Ormco USA)',
        'Direct precision bonding on enamel',
        'Routine adjustment appointments every 6-8 weeks',
      ],
    },
    partnerBrand: 'Damon',
  },
  {
    id: 'aligners',
    name: {
      ru: 'Элайнеры Spark (каппы)',
      uz: 'Spark shaffof elaynerlari',
      en: 'Spark Clear Aligners',
    },
    basePriceUzs: 15000000,
    basePriceUsd: 1200,
    durationStr: {
      ru: 'Курс 6–14 месяцев',
      uz: 'Kurs 6–14 oy',
      en: 'Course 6–14 months',
    },
    defaultUnits: 2,
    minUnits: 1,
    maxUnits: 2,
    unitLabel: { ru: 'челюсть(и)', uz: 'jag‘', en: 'jaw(s)' },
    presets: [
      { units: 1, label: { ru: '1 челюсть (экспресс)', uz: '1 jag‘ (ekspress)', en: '1 jaw (express)' } },
      { units: 2, label: { ru: '2 челюсти (полный курс)', uz: '2 jag‘ (to‘liq kurs)', en: 'Both jaws (full)' } },
    ],
    clinicalScope: {
      ru: 'Цифровой 3D-сетап перемещения каждого зуба, индивидуальный набор прозрачных капп на весь курс.',
      uz: 'Har bir tish siljishining 3D raqamli modeli va butun kurs uchun individual shaffof kapalar to‘plami.',
      en: 'Digital 3D tooth movement simulation and full custom series of clear aligners.',
    },
    breakdown: {
      ru: [
        '3D-моделирование и визуализация итоговой улыбки до начала лечения',
        'Медицинский гипоаллергенный полимер TruGEN с максимальной прозрачностью',
        'Индивидуальный комплект капп со сменой каждые 10–14 дней',
        'Контрольные очные визиты к ортодонту 1 раз в 2 месяца',
      ],
      uz: [
        'Davolashdan oldin yakuniy natijani 3D kompyuterda ko‘rish imkoniyati',
        'TruGEN o‘ta shaffof va xavfsiz tibbiy polimeri',
        'Har 10-14 kunda almashtiriladigan individual kapalar to‘plami',
        'Shifokor ko‘rigi har 2 oyda 1 marta',
      ],
      en: [
        '3D digital smile simulation before starting treatment',
        'Medical-grade ultra-clear stain-resistant TruGEN polymer',
        'Full set of progressive aligners changed every 10-14 days',
        'Follow-up orthodontic check-ups every 2 months',
      ],
    },
    partnerBrand: 'Ormco',
  },
];

export const UI_TRANSLATIONS = {
  header: {
    statusOpen: { ru: 'Приём по записи', uz: 'Oldindan yozuv bo‘yicha', en: 'By appointment' },
    callButtonAria: { ru: 'Позвонить в клинику прямо сейчас', uz: 'Klinikaga to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qilish', en: 'Call clinic directly' },
  },
  emergencyBanner: {
    badge: { ru: 'ОСТРАЯ БОЛЬ', uz: 'O‘TKIR OG‘RIQ', en: 'URGENT PAIN' },
    title: { ru: 'Болит зуб? Примем сегодня без очереди', uz: 'Tish og‘riyaptimi? Bugun navbatsiz qabul qilamiz', en: 'Severe tooth pain? Walk in today' },
    sub: { ru: 'Снятие пульсирующей боли и дежурный хирург', uz: 'Og‘riqni qoldirish va navbatchi jarroh yordami', en: 'Instant relief & emergency dental surgeon' },
    action: { ru: 'Срочная помощь', uz: 'Shoshilinch yordam', en: 'Get Urgent Help' },
    callAction: { ru: 'Позвонить дежурному', uz: 'Navbatchiga qo‘ng‘iroq', en: 'Call Doctor' },
  },
  hero: {
    badge: {
      ru: 'Первичный приём с диагностикой',
      uz: 'Diagnostika bilan dastlabki ko‘rik',
      en: 'Initial diagnostic examination',
    },
    title: {
      ru: 'Лечение и имплантация зубов в Ташкенте',
      uz: 'Toshkentda tishlarni davolash va implantatsiya',
      en: 'Dental care and implants in Tashkent',
    },
    subtitle: {
      ru: 'Компьютерная томография 3D, восстановление зубов и исправление прикуса для всей семьи. Прозрачный план лечения без скрытых доплат.',
      uz: '3D kompyuter tomografiyasi, butun oila uchun tishlarni tiklash va tekislash. Yashirin to‘lovlarsiz shaffof davolash rejasi.',
      en: '3D computed tomography, tooth restoration, and orthodontics for all ages. Clear treatment plan without unexpected fees.',
    },
    teamSubtitle: {
      ru: 'Врачи-специалисты со стажем от 8 до 16 лет',
      uz: '8 yildan 16 yilgacha tajribaga ega shifokorlar',
      en: 'Medical specialists with 8 to 16 years of practice',
    },
    ctaBooking: {
      ru: 'Записаться на консультацию',
      uz: 'Konsultatsiyaga yozilish',
      en: 'Book a Consultation',
    },
    ctaCalculator: {
      ru: 'Рассчитать смету',
      uz: 'Smetani hisoblash',
      en: 'Calculate Estimate',
    },
    badgeFree: {
      ru: 'Бесплатно',
      uz: 'Bepul',
      en: 'Free',
    },
    photoPlaceholder: {
      ru: 'Кабинет цифровой томографии и хирургии DentaLux',
      uz: 'DentaLux raqamli tomografiya va jarrohlik xonasi',
      en: 'DentaLux Digital CT & Surgery Suite',
    },
  },
  quickTiles: {
    catalogTitle: { ru: 'Каталог услуг', uz: 'Xizmatlar katalogi', en: 'Service Catalog' },
    catalogSub: { ru: 'Терапия, имплантация, ортодонтия', uz: 'Terapiya, implantatsiya, ortodontiya', en: 'Therapy, implants, orthodontics' },
    catalogBadge: { ru: 'Прейскурант', uz: 'Narxnoma', en: 'Price list' },

    calcTitle: { ru: 'Калькулятор сметы', uz: 'Smeta kalkulyatori', en: 'Cost Estimator' },
    calcSub: { ru: 'Расчёт по объёму и срокам', uz: 'Hajm va muddat bo‘yicha hisob', en: 'Estimate by tooth count & scope' },
    calcBadge: { ru: 'Онлайн расчёт', uz: 'Onlayn hisob', en: 'Online estimate' },

    doctorsTitle: { ru: 'Врачи клиники', uz: 'Klinika shifokorlari', en: 'Medical Team' },
    doctorsSub: { ru: 'Хирурги, ортодонты, терапевты', uz: 'Jarroh, ortodont va terapevtlar', en: 'Surgeons & specialists' },
    doctorsBadge: { ru: '4 врача', uz: '4 shifokor', en: '4 specialists' },

    contactsTitle: { ru: 'Адрес и часы', uz: 'Manzil va vaqt', en: 'Location & Hours' },
    contactsSub: { ru: 'ул. Шота Руставели, 54', uz: 'Shota Rustaveli ko‘chasi, 54', en: '54 Shota Rustaveli st.' },
    contactsBadge: { ru: 'м. Ойбек', uz: 'Oybek m.', en: 'Oybek metro' },
  },
  featured: {
    title: { ru: 'Основные направления лечения', uz: 'Asosiy davolash yo‘nalishlari', en: 'Key Clinical Treatments' },
    subtitle: { ru: 'Современные клинические протоколы с фиксацией плана', uz: 'Aniq reja bilan zamonaviy klinik protokollar', en: 'Modern clinical protocols with treatment planning' },
    viewAll: { ru: 'Весь каталог', uz: 'Barcha xizmatlar', en: 'Full catalog' },
    bookItem: { ru: 'Записаться на консультацию', uz: 'Qabulga yozilish', en: 'Book an appointment' },
  },
  calculator: {
    title: { ru: 'Калькулятор стоимости лечения', uz: 'Davolash smetasi kalkulyatori', en: 'Treatment Cost Estimator' },
    subtitle: {
      ru: 'Прозрачный предварительный расчёт. Итоговый план фиксируется на консилиуме врачей после 3D-снимка.',
      uz: 'Shaffof dastlabki hisob-kitob. Aniq reja 3D-rentgendan so‘ng shifokor ko‘rigida tasdiqlanadi.',
      en: 'Transparent preliminary estimate. Final plan is confirmed after the 3D CT scan.',
    },
    selectProtocol: { ru: 'Выберите протокол лечения:', uz: 'Davolash protokolini tanlang:', en: 'Select treatment protocol:' },
    scopeTitle: { ru: 'Что входит в данную сумму:', uz: 'Ushbu narx ichiga nimalar kiradi:', en: 'What is included in this estimate:' },
    selectUnits: { ru: 'Количество:', uz: 'Miqdori:', en: 'Quantity:' },
    totalLabel: { ru: 'Ориентировочная сумма сметы', uz: 'Taxminiy smeta qiymati', en: 'Estimated Total' },
    ctaBookWithEstimate: { ru: 'Записаться с этой сметой', uz: 'Smeta bo‘yicha yozilish', en: 'Book with this Estimate' },
    trustNotice: {
      ru: '🛡️ Без предоплаты. Оплата услуг производится в клинике только после очного осмотра и согласования плана.',
      uz: '🛡️ Hech qanday oldindan to‘lovsiz. To‘lov ko‘rikdan so‘ng faqat klinikada amalga oshiriladi.',
      en: '🛡️ No prepayment needed. Payment is made at the clinic after consultation and treatment plan approval.',
    },
    installmentBadge: {
      ru: 'Доступна рассрочка 0% до 12 месяцев (Uzum Nasiya, Anorbank)',
      uz: '12 oygacha 0% foizsiz muddatli to‘lov (Uzum Nasiya, Anorbank)',
      en: '0% installment plan available up to 12 months',
    },
  },
  standards: {
    diagnosticsTitle: { ru: '3D-томограф Vatech', uz: '3D Vatech tomografi', en: 'Vatech 3D CT' },
    diagnosticsDesc: { ru: 'Снимок обеих челюстей перед лечением', uz: 'Davolashdan oldin 3D tashxis', en: 'Full-jaw 3D scan before care' },
    hoursTitle: { ru: '09:00 — 21:00', uz: '09:00 — 21:00', en: '09:00 — 21:00' },
    hoursDesc: { ru: 'Ежедневный приём по записи', uz: 'Har kuni qabul yozuv bo‘yicha', en: 'Open daily by appointment' },
    licenseTitle: { ru: 'Официальная лицензия', uz: 'Rasmiy litsenziya', en: 'Medical License' },
    licenseDesc: { ru: 'Минздрав Республики Узбекистан', uz: 'O‘zbekiston Sog‘liqni saqlash vazirligi', en: 'Ministry of Health of Uzbekistan' },
  },
  nav: {
    home: { ru: 'Главная', uz: 'Asosiy', en: 'Home' },
    services: { ru: 'Услуги', uz: 'Xizmatlar', en: 'Services' },
    calculator: { ru: 'Смета', uz: 'Kalkulyator', en: 'Estimate' },
    doctors: { ru: 'Врачи', uz: 'Shifokorlar', en: 'Doctors' },
    contacts: { ru: 'Клиника', uz: 'Klinika', en: 'Clinic' },
  },
  stickyCta: {
    title: { ru: 'Записаться на консультацию', uz: 'Konsultatsiyaga yozilish', en: 'Book a Consultation' },
    badge: { ru: 'Бесплатно', uz: 'Bepul', en: 'Free' },
    sub: { ru: '0 сум вместо 350 000 сум · Без предоплаты', uz: '350 000 so‘m o‘rniga 0 so‘m · Oldindan to‘lovsiz', en: '$0 instead of regular fee · No prepayment' },
  },
  bookingModal: {
    title: { ru: 'Запись на приём', uz: 'Qabulga yozilish', en: 'Book Appointment' },
    step1Title: { ru: '1. Что вас беспокоит?', uz: '1. Nima bezovta qilyapti?', en: '1. Select Treatment' },
    step1Doctor: { ru: 'Желаемый врач', uz: 'Tanlangan shifokor', en: 'Preferred Doctor' },
    step2Title: { ru: '2. Когда вам удобно?', uz: '2. Qachon qulay?', en: '2. Pick Date & Time' },
    step3Title: { ru: '3. Контактные данные', uz: '3. Bog‘lanish uchun', en: '3. Your Contacts' },
    nextStep: { ru: 'Далее →', uz: 'Keyingisi →', en: 'Next Step →' },
    backStep: { ru: '← Назад', uz: '← Orqaga', en: '← Back' },
    cancel: { ru: 'Отмена', uz: 'Yopish', en: 'Cancel' },

    nameLabel: { ru: 'Ваше имя', uz: 'Ismingiz', en: 'Your Name' },
    namePlaceholder: { ru: 'Например, Азиз', uz: 'Masalan, Aziz', en: 'E.g., John' },
    phoneLabel: { ru: 'Номер телефона', uz: 'Telefon raqamingiz', en: 'Phone Number' },
    dayLabel: { ru: 'День приёма', uz: 'Qabul kuni', en: 'Preferred Day' },
    timeLabel: { ru: 'Время приёма', uz: 'Qulay vaqt', en: 'Preferred Time' },
    doctorLabel: { ru: 'Специалист', uz: 'Mutaxassis', en: 'Specialist' },
    anyDoctor: { ru: 'Любой профильный специалист', uz: 'Ixtiyoriy mutaxassis', en: 'Any available specialist' },
    submitButton: { ru: 'Забронировать приём', uz: 'Qabulni band qilish', en: 'Confirm Appointment' },
    trustGuarantee: {
      ru: '🛡️ Бесплатная консультация. Никакой предоплаты не требуется — оплата только в клинике.',
      uz: '🛡️ Bepul konsultatsiya. Hech qanday oldindan to‘lov talab qilinmaydi.',
      en: '🛡️ Free consultation. No advance payment required — pay only at the clinic.',
    },
    disclaimer: {
      ru: 'Администратор клиники перезвонит для подтверждения за 5 минут.',
      uz: 'Klinika ma’muri 5 daqiqa ichida tasdiqlash uchun bog‘lanadi.',
      en: 'Clinic administrator will call within 5 minutes to confirm.',
    },
    successTitle: { ru: 'Вы успешно записаны!', uz: 'Qabul muvaffaqiyatli band qilindi!', en: 'Appointment Confirmed!' },
    successDetailsTitle: { ru: 'Детали вашей записи:', uz: 'Qabul tafsilotlari:', en: 'Your Appointment Details:' },
    routeAction: { ru: 'Открыть маршрут на карте', uz: 'Xaritada marshrutni ochish', en: 'Open Route on Map' },
    callAction: { ru: 'Позвонить в клинику', uz: 'Klinikaga qo‘ng‘iroq qilish', en: 'Call Clinic' },
    telegramAction: { ru: 'Написать в Telegram', uz: 'Telegram orqali yozish', en: 'Chat on Telegram' },
    closeSuccess: { ru: 'Вернуться на главную', uz: 'Bosh sahifaga qaytish', en: 'Back to Home' },
  },
};
