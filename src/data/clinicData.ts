export type Language = 'ru' | 'uz' | 'en';

export interface ClinicConfig {
  name: Record<Language, string>;
  city: Record<Language, string>;
  address: Record<Language, string>;
  landmark: Record<Language, string>;
  phone: string;
  phoneDisplay: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    summary: Record<Language, string>;
  };
  licenseNumber: string; // TODO: подтвердить у клиники точный номер лицензии Минздрава
  catalogYear: string;   // TODO: подтвердить актуальный год прейскуранта
  rating: number | null; // TODO: подтвердить у клиники реальный рейтинг перед включением (null = скрыто)
  reviewsCount: number | null; // TODO: подтвердить реальное количество отзывов
  partnerBrands: string[]; // TODO: подтвердить у клиники официальный статус партнерства
  yandexMapsUrl: string;
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
    ru: 'Ориентир: метро Ойбек',
    uz: 'Mo‘ljal: Oybek metrosi',
    en: 'Landmark: Oybek metro station',
  },
  phone: '+998712000000',
  phoneDisplay: '+998 (71) 200-00-00',
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
  licenseNumber: 'Лицензия Минздрава РУз №008412', // TODO: подтвердить у клиники
  catalogYear: '2026', // TODO: подтвердить у клиники
  rating: null, // TODO: подтвердить у клиники реальный рейтинг перед показом
  reviewsCount: null, // TODO: подтвердить реальное число отзывов
  partnerBrands: ['Straumann', 'Damon', 'Ormco', 'Ivoclar'], // TODO: подтвердить у клиники партнерские сертификаты
  yandexMapsUrl: 'https://yandex.uz/maps/-/CDuWjF8A',
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
  unitLabel: Record<Language, string>;
  clinicalScope: Record<Language, string>;
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
  { id: 'diagnostics', label: { ru: 'Диагностика', uz: 'Tashxis', en: 'Diagnostics' } },
  { id: 'therapy', label: { ru: 'Терапия', uz: 'Terapiya', en: 'Therapy' } },
  { id: 'implants', label: { ru: 'Имплантация', uz: 'Implantatsiya', en: 'Implants' } },
  { id: 'orthodontics', label: { ru: 'Ортодонтия', uz: 'Ortodontiya', en: 'Orthodontics' } },
  { id: 'orthopedics', label: { ru: 'Ортопедия и виниры', uz: 'Ortopediya va vinirlar', en: 'Prosthodontics' } },
  { id: 'pediatric', label: { ru: 'Детская стоматология', uz: 'Bolalar stomatologiyasi', en: 'Pediatric' } },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'consultation-3d',
    category: 'diagnostics',
    name: {
      ru: 'Консультация врача + 3D-снимок (КТ)',
      uz: "Shifokor ko'rigi + 3D-tomografiya (KT)",
      en: 'Doctor Consultation + 3D CT Scan',
    },
    priceUzs: 'Бесплатно при начале лечения',
    priceUsd: 'FREE',
    duration: {
      ru: '30–45 мин',
      uz: '30–45 daq',
      en: '30–45 mins',
    },
    description: {
      ru: 'Компьютерная томография челюстно-лицевой области на цифровом томографе и составление плана лечения.',
      uz: "Raqamli tomografda jag'-yuz sohasini tekshirish va shaxsiy davolash rejasini tuzish.",
      en: 'Computed tomography scan on a digital dental scanner with comprehensive treatment planning.',
    },
    badge: { ru: 'Бесплатно', uz: 'Bepul', en: 'Free' },
    highlight: true,
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
      ru: 'Установка швейцарского титанового имплантата с гидрофильной поверхностью для ускоренной остеоинтеграции.',
      uz: "Tez va ishonchli birikuvchi gidrofil yuzaga ega Shveytsariya titan implantati o'rnatish.",
      en: 'Placement of a Swiss titanium implant with hydrophilic surface for optimal osseointegration.',
    },
    partnerBrand: 'Straumann',
    badge: { ru: 'Швейцария', uz: 'Shveytsariya', en: 'Swiss' },
  },
  {
    id: 'osstem-implant',
    category: 'implants',
    name: {
      ru: 'Имплантация Osstem (Южная Корея)',
      uz: "Osstem implantatsiyasi (Janubiy Koreya)",
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
      ru: 'Классическая двухэтапная или одномоментная имплантация корейской сертифицированной системой.',
      uz: "Koreya sertifikatlangan tizimi orqali klassik yoki darhol o'rnatiladigan implantatsiya.",
      en: 'Standard two-stage or immediate implant placement using certified Korean systems.',
    },
  },
  {
    id: 'damon-q2',
    category: 'orthodontics',
    name: {
      ru: 'Брекет-система Damon Q2 (США)',
      uz: 'Damon Q2 metall breketlari (AQSh)',
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
      ru: 'Самолигирующие металлические брекеты пониженного трения для исправления прикуса у подростков и взрослых.',
      uz: "O'smirlar va kattalarda tish qatorini tekislash uchun past ishqalanishli passiv breketlar.",
      en: 'Passive self-ligating metal braces designed for gentle alignment in teens and adults.',
    },
    partnerBrand: 'Damon',
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
      ru: 'Прозрачные съёмные каппы из медицинского полимера TruGEN для комфортного выравнивания зубного ряда.',
      uz: "Tishlarni qulay va sezilarsiz tekislash uchun TruGEN polimeridan tayyorlangan shaffof kapalar.",
      en: 'Transparent removable clear aligners made from medical-grade TruGEN material.',
    },
    partnerBrand: 'Ormco',
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
      ru: 'Керамические накладки из дисиликата лития Ivoclar для восстановления формы, цвета и анатомии зубов.',
      uz: "Tishlarning shakli, rangi va anatomiyasini tiklash uchun Ivoclar litiy disilikatli qoplamalari.",
      en: 'Lithium disilicate ceramic veneers by Ivoclar to restore tooth shape, color, and anatomy.',
    },
    partnerBrand: 'Ivoclar',
  },
  {
    id: 'hygiene-complex',
    category: 'therapy',
    name: {
      ru: 'Профессиональная гигиена полости рта',
      uz: "Og'iz bo'shlig'i gigiyenasi",
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
      ru: 'Ультразвуковое удаление наддесневого и поддесневого камня, чистка AirFlow и реминерализирующая терапия.',
      uz: "Toshlarni ultratovush bilan tozalash, AirFlow apparati va emalni mustahkamlovchi terapiya.",
      en: 'Ultrasonic calculus removal, AirFlow plaque polishing, and remineralizing enamel treatment.',
    },
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
      ru: 'Лечение временных зубов с аппликационной анестезией и пломбировочными материалами светового отверждения.',
      uz: "Og'riqsizlantirish va zamonaviy yorug'likda qotadigan materiallar bilan sut tishlarini davolash.",
      en: 'Gentle treatment of deciduous teeth using topical anesthesia and light-cured fillings.',
    },
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
      uz: 'Ormco o‘zi ligirlanuvchi tizimlari va shaffof elaynerlar bo‘yicha sertifikatlangan mutaxassis.',
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
      uz: 'E.max keramika vinirlari, tsirkoniy dioksidi qoplamalari',
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
      ru: 'Эндодонтия, эстетическая реставрация, адаптация детей',
      uz: 'Endodontiya, estetik restavratsiya, bolalar stomatologiyasi',
      en: 'Endodontics, aesthetic restorations, pediatric patient adaptation',
    },
    experienceYears: 8,
    credentials: {
      ru: 'Обучение современным протоколам эндодонтического лечения и адаптивного приёма детей.',
      uz: 'Zamonaviy endodontik davolash va bolalarni moslashtirish protokollari bo‘yicha ta’lim olgan.',
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
      ru: 'Дентальная имплантация',
      uz: 'Dental implantatsiya',
      en: 'Dental Implantation',
    },
    basePriceUzs: 8500000,
    basePriceUsd: 670,
    durationStr: {
      ru: '1 хирургический визит (приживление 8–12 недель)',
      uz: '1 jarrohlik tashrifi (birikishi 8–12 hafta)',
      en: '1 surgical visit (healing 8–12 weeks)',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'имплант', uz: 'implant', en: 'implant' },
    clinicalScope: {
      ru: 'Установка имплантата, анестезия, контрольная томография и формирователь десны.',
      uz: "Implantat o'rnatish, og'riqsizlantirish, nazorat KT va milk shakllantirgich.",
      en: 'Implant placement, local anesthesia, follow-up CT scan, and healing abutment.',
    },
    partnerBrand: 'Straumann',
  },
  {
    id: 'veneers',
    name: {
      ru: 'Керамические виниры',
      uz: 'Keramika vinirlari',
      en: 'Ceramic Veneers',
    },
    basePriceUzs: 3000000,
    basePriceUsd: 240,
    durationStr: {
      ru: '2–3 визита (срок изготовления 5–7 дней)',
      uz: '2–3 tashrif (tayyorlanish muddati 5–7 kun)',
      en: '2–3 visits (fabrication time 5–7 days)',
    },
    defaultUnits: 6,
    unitLabel: { ru: 'единиц', uz: 'dona', en: 'units' },
    clinicalScope: {
      ru: '3D-сканирование, препарирование в пределах эмали, временные накладки и фиксация.',
      uz: "3D-skanerlash, emalni nozik tayyorlash, vaqtinchalik qoplamalar va mustahkam yopishtirish.",
      en: '3D scanning, minimal enamel prep, provisional restorations, and adhesive cementation.',
    },
    partnerBrand: 'Ivoclar',
  },
  {
    id: 'brackets',
    name: {
      ru: 'Брекет-система Damon',
      uz: 'Damon breket tizimi',
      en: 'Damon Bracket System',
    },
    basePriceUzs: 7500000,
    basePriceUsd: 600,
    durationStr: {
      ru: 'Курс лечения 12–18 месяцев',
      uz: 'Davolash kursi 12–18 oy',
      en: 'Treatment course 12–18 months',
    },
    defaultUnits: 2,
    unitLabel: { ru: 'челюсти', uz: 'jag‘', en: 'jaws' },
    clinicalScope: {
      ru: 'Диагностика, фиксация замков, дуги начального этапа и регулярная плановая активация.',
      uz: "Tashxis, qulflarni o'rnatish, dastlabki simlar va rejali tekshiruvlar.",
      en: 'Diagnostics, bracket bonding, initial archwires, and scheduled clinical adjustments.',
    },
    partnerBrand: 'Damon',
  },
  {
    id: 'aligners',
    name: {
      ru: 'Ортодонтические элайнеры',
      uz: 'Ortodontik elaynerlar',
      en: 'Orthodontic Aligners',
    },
    basePriceUzs: 15000000,
    basePriceUsd: 1200,
    durationStr: {
      ru: 'Курс 6–14 месяцев',
      uz: 'Kurs 6–14 oy',
      en: 'Course 6–14 months',
    },
    defaultUnits: 1,
    unitLabel: { ru: 'курс', uz: 'kurs', en: 'course' },
    clinicalScope: {
      ru: 'Цифровой сетап перемещения зубов, комплект капп на весь курс и контрольные осмотры.',
      uz: "Tishlar siljishining raqamli modeli, butun kurs uchun kapalar to'plami va nazorat.",
      en: 'Digital tooth movement setup, full set of custom aligners, and monitoring visits.',
    },
    partnerBrand: 'Ormco',
  },
];

export const UI_TRANSLATIONS = {
  header: {
    statusOpen: { ru: 'Приём по записи', uz: 'Qabul yozuv bo‘yicha', en: 'By appointment' },
  },
  hero: {
    badge: {
      ru: 'Первичный приём с диагностикой',
      uz: 'Tashxis bilan dastlabki qabul',
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
      uz: 'Narxni hisoblash',
      en: 'Calculate Estimate',
    },
    badgeFree: {
      ru: 'Бесплатно',
      uz: 'Bepul',
      en: 'Free',
    },
  },
  quickTiles: {
    catalogTitle: { ru: 'Каталог услуг', uz: 'Xizmatlar katalogi', en: 'Service Catalog' },
    catalogSub: { ru: 'Терапия, имплантация, ортодонтия', uz: 'Terapiya, implantatsiya, ortodontiya', en: 'Therapy, implants, orthodontics' },
    catalogBadge: { ru: 'Прейскурант', uz: 'Narxnoma', en: 'Price list' },

    calcTitle: { ru: 'Калькулятор сметы', uz: 'Narx kalkulyatori', en: 'Cost Estimator' },
    calcSub: { ru: 'Расчёт по количеству зубов и срокам', uz: 'Tish soni va muddat bo‘yicha hisob', en: 'Estimate by tooth count & scope' },
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
    viewAll: { ru: 'Весь каталог', uz: 'Barchasi', en: 'Full catalog' },
    bookItem: { ru: 'Записаться на приём', uz: 'Qabulga yozilish', en: 'Book an appointment' },
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
    calculator: { ru: 'Смета', uz: 'Hisob', en: 'Estimate' },
    doctors: { ru: 'Врачи', uz: 'Shifokorlar', en: 'Doctors' },
    contacts: { ru: 'Клиника', uz: 'Klinika', en: 'Clinic' },
  },
  bookingModal: {
    title: { ru: 'Запись на консультацию', uz: 'Qabulga yozilish', en: 'Appointment Request' },
    nameLabel: { ru: 'Ваше имя', uz: 'Ismingiz', en: 'Your Name' },
    namePlaceholder: { ru: 'Например, Азиз', uz: 'Masalan, Aziz', en: 'E.g., John' },
    phoneLabel: { ru: 'Номер телефона', uz: 'Telefon raqam', en: 'Phone Number' },
    dayLabel: { ru: 'Желаемый день', uz: 'Qulay kun', en: 'Preferred Day' },
    timeLabel: { ru: 'Удобное время', uz: 'Qulay vaqt', en: 'Preferred Time' },
    doctorLabel: { ru: 'Специалист', uz: 'Mutaxassis', en: 'Specialist' },
    anyDoctor: { ru: 'Любой профильный специалист', uz: 'Ixtiyoriy mutaxassis', en: 'Any available specialist' },
    submitButton: { ru: 'Подтвердить запись', uz: 'Yozilishni tasdiqlash', en: 'Confirm Appointment' },
    disclaimer: {
      ru: 'Администратор клиники перезвонит для согласования точного времени.',
      uz: 'Klinika ma’muri aniq vaqtni kelishish uchun siz bilan bog‘lanadi.',
      en: 'Our administrator will call back to confirm the exact time slot.',
    },
    successTitle: { ru: 'Заявка принята', uz: 'Ariza qabul qilindi', en: 'Request Received' },
    successMessage: {
      ru: 'Мы свяжемся с вами в течение 15 минут в рабочее время для подтверждения записи.',
      uz: 'Ish vaqtida 15 daqiqa ichida qabulni tasdiqlash uchun bog‘lanamiz.',
      en: 'We will contact you within 15 minutes during working hours to confirm.',
    },
    closeButton: { ru: 'Понятно', uz: 'Tushunarli', en: 'Got it' },
  },
};
