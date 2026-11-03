export type Language = 'ru' | 'uz' | 'en';

export interface ServiceItem {
  id: string;
  category: string;
  name: Record<Language, string>;
  priceUzs: string;
  priceUsd?: string;
  duration: string;
  description: Record<Language, string>;
  badge?: Record<Language, string>;
  highlight?: boolean;
}

export interface Doctor {
  id: string;
  name: Record<Language, string>;
  role: Record<Language, string>;
  experienceYears: number;
  credentials: Record<Language, string>;
  initials: string;
  color: string;
}

export const CATEGORIES = [
  { id: 'all', label: { ru: 'Все', uz: 'Barchasi', en: 'All' } },
  { id: 'brackets', label: { ru: 'Брекеты', uz: 'Breketlar', en: 'Braces' } },
  { id: 'aligners', label: { ru: 'Элайнеры', uz: 'Elaynerlar', en: 'Aligners' } },
  { id: 'implants', label: { ru: 'Импланты', uz: 'Implantlar', en: 'Implants' } },
  { id: 'veneers', label: { ru: 'Виниры', uz: 'Vinirlar', en: 'Veneers' } },
  { id: 'whitening', label: { ru: 'Отбеливание', uz: 'Oqartirish', en: 'Whitening' } },
  { id: 'therapy', label: { ru: 'Терапия', uz: 'Terapiya', en: 'Therapy' } },
  { id: 'pediatric', label: { ru: 'Детям', uz: 'Bolalarga', en: 'Pediatric' } },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'consultation-3d',
    category: 'all',
    name: {
      ru: 'Консультация главврача + 3D-снимок (КТ)',
      uz: "Bosh shifokor ko'rigi + 3D-rentgen (KT)",
      en: 'Chief Doctor Exam + 3D CT Scan',
    },
    priceUzs: '0 сум (вместо 350 000 сум)',
    priceUsd: 'FREE',
    duration: '30-45 мин',
    description: {
      ru: 'Компьютерная томография всей челюсти на аппарате Vatech и очный консилиум ведущих врачей.',
      uz: "Vatech apparatida butun jag' 3D-tomografiyasi va yetakchi mutaxassislar konsultatsiyasi.",
      en: 'Full jaw 3D CT scan using Vatech scanner + comprehensive consultation with senior doctors.',
    },
    badge: { ru: 'АКЦИЯ 0 СУМ', uz: 'AKSIYA 0 SO\'M', en: 'FREE OFFER' },
    highlight: true,
  },
  {
    id: 'damon-q2',
    category: 'brackets',
    name: {
      ru: 'Брекеты Damon Q2 металлические (США)',
      uz: 'Damon Q2 metall breketlari (AQSh)',
      en: 'Damon Q2 Metal Braces (USA)',
    },
    priceUzs: 'от 7 500 000 сум / челюсть',
    priceUsd: '$600',
    duration: '12-18 мес',
    description: {
      ru: 'Самолигирующая система №1 в мире. Быстрое выравнивание без удаления здоровых зубов.',
      uz: "Dunyodagi 1-raqamli o'zi ligirlanuvchi tizim. Tish sug'urmasdan tez tekislash.",
      en: 'World #1 self-ligating system. Fast alignment without unnecessary tooth extractions.',
    },
    badge: { ru: 'ХИТ', uz: 'MASHHUR', en: 'TOP' },
  },
  {
    id: 'damon-clear',
    category: 'brackets',
    name: {
      ru: 'Брекеты Damon Clear сапфировые (США)',
      uz: 'Damon Clear sapfir breketlari (AQSh)',
      en: 'Damon Clear Aesthetic Braces',
    },
    priceUzs: 'от 11 000 000 сум / челюсть',
    priceUsd: '$880',
    duration: '12-18 мес',
    description: {
      ru: 'Прозрачные эстетические замочки, незаметные на зубах при улыбке и общении.',
      uz: 'Shaffof estetik qulflar, jilmayganda va suhbatda mutlaqo sezilmaydi.',
      en: 'Transparent aesthetic brackets that blend with natural tooth enamel.',
    },
  },
  {
    id: 'spark-aligners',
    category: 'aligners',
    name: {
      ru: 'Элайнеры Spark / 3D Smile (полный курс)',
      uz: "Spark / 3D Smile elaynerlari (to'liq kurs)",
      en: 'Spark / 3D Smile Clear Aligners',
    },
    priceUzs: 'от 15 000 000 сум',
    priceUsd: '$1,200 - $2,800',
    duration: '6-14 мес',
    description: {
      ru: 'Невидимые съемные каппы. 3D-моделирование финальной улыбки до начала лечения.',
      uz: 'Ko\'rinmas yechiladigan kapalar. Davolashdan oldin tabassumni kompyuterda ko\'rish.',
      en: 'Invisible removable aligners with 3D digital smile simulation before starting.',
    },
    badge: { ru: 'ПРЕМИУМ', uz: 'PREMIUM', en: 'PREMIUM' },
  },
  {
    id: 'osstem-implant',
    category: 'implants',
    name: {
      ru: 'Имплант Osstem под ключ (Южная Корея)',
      uz: 'Osstem implanti o\'rnatish bilan (Janubiy Koreya)',
      en: 'Osstem Implant All-Inclusive (Korea)',
    },
    priceUzs: 'от 4 200 000 сум',
    priceUsd: '$330',
    duration: '1 визит (30 мин)',
    description: {
      ru: 'Приживаемость 98.8%. Надежная титановая основа с пожизненной заводской гарантией.',
      uz: 'Ildiz otishi 98.8%. Umrbod zavod kafolatiga ega ishonchli titan tizim.',
      en: '98.8% success rate with lifetime manufacturer warranty. Most trusted in the CIS.',
    },
    badge: { ru: 'ТОП ВЫБОР', uz: 'ENG MA\'QUL', en: 'BEST VALUE' },
  },
  {
    id: 'straumann-implant',
    category: 'implants',
    name: {
      ru: 'Имплант Straumann SLActive (Швейцария)',
      uz: 'Straumann SLActive Shveytsariya implanti',
      en: 'Straumann SLActive Implant (Switzerland)',
    },
    priceUzs: 'от 8 500 000 сум',
    priceUsd: '$670',
    duration: '1 визит (30 мин)',
    description: {
      ru: 'Швейцарский эталон №1 в мире. Ускоренное приживление за 3-4 недели даже при диабете.',
      uz: 'Dunyoda 1-o\'rindagi Shveytsariya tizimi. 3-4 haftada ildiz otadi, qandli diabetda ham mos.',
      en: 'World-renowned Swiss benchmark. Accelerated 3-4 week osseointegration.',
    },
    badge: { ru: 'ЛЮКС', uz: 'LYUKS', en: 'LUXURY' },
  },
  {
    id: 'emax-veneers',
    category: 'veneers',
    name: {
      ru: 'Керамические виниры E.max (Германия)',
      uz: 'E.max keramika vinirlari (Germaniya)',
      en: 'E.max Ceramic Veneers (Germany)',
    },
    priceUzs: 'от 2 800 000 сум / зуб',
    priceUsd: '$220',
    duration: '2-3 визита',
    description: {
      ru: 'Ультратонкие (0.3 мм). Натуральная прозрачность, не темнеют от кофе и служат 15+ лет.',
      uz: 'O\'ta yupqa (0.3 mm). Qahva va choydan aslo qoraymaydi, 15+ yil xizmat qiladi.',
      en: 'Ultra-thin 0.3mm ceramic. Stain-resistant, natural translucency with 15+ years lifespan.',
    },
  },
  {
    id: 'zoom-whitening',
    category: 'whitening',
    name: {
      ru: 'Отбеливание Beyond Polus / Zoom 4',
      uz: 'Beyond Polus / Zoom 4 tish oqartirish',
      en: 'Beyond Polus / Zoom 4 Teeth Whitening',
    },
    priceUzs: '2 200 000 сум (обе челюсти)',
    priceUsd: '$175',
    duration: '45 мин',
    description: {
      ru: 'Осветление на 6-8 тонов за 1 сеанс. Технология холодного света без боли и повреждения эмали.',
      uz: '1 seansda 6-8 tongacha oqartirish. Sovuq nur texnologiyasi — og\'riqsiz va xavfsiz.',
      en: '6-8 shades lighter in 45 minutes. Cold light technology ensures zero sensitivity.',
    },
  },
  {
    id: 'hygiene-complex',
    category: 'therapy',
    name: {
      ru: 'Комплексная гигиена AirFlow + ультразвук',
      uz: 'Kompleks tish tozalash AirFlow + ultratovush',
      en: 'Full Hygiene Cleaning (AirFlow + Ultrasound)',
    },
    priceUzs: '550 000 сум',
    priceUsd: '$45',
    duration: '40 мин',
    description: {
      ru: 'Снятие зубного камня, удаление пигментного налета от чая и сигарет, фторирование.',
      uz: 'Tish toshlari va dog\'larni to\'liq tozalash, emalni mustahkamlash.',
      en: 'Full removal of tartar and tea/tobacco stains, followed by enamel remineralization.',
    },
  },
  {
    id: 'pediatric-gentle',
    category: 'pediatric',
    name: {
      ru: 'Бережное лечение молочных зубов',
      uz: 'Bolalar sut tishlarini og\'riqsiz davolash',
      en: 'Gentle Pediatric Dental Care',
    },
    priceUzs: 'от 250 000 сум',
    priceUsd: '$20',
    duration: '30 мин',
    description: {
      ru: 'Игровой формат без слез и боли, мультфильмы, вкусная анестезия и подарки деткам.',
      uz: 'Qo\'rquvsiz va o\'yin tarzida davolash, multfilmlar, yoqimli muzlatkichlar va sovg\'alar.',
      en: 'Playful care without tears, cartoon screens, fruit-flavored numbing gels and prizes.',
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
      ru: 'Главный врач, челюстно-лицевой хирург, имплантолог',
      uz: 'Bosh shifokor, jag\'-yuz jarrohi, implantolog',
      en: 'Chief Medical Officer, Maxillofacial Surgeon',
    },
    experienceYears: 16,
    credentials: {
      ru: 'Член ITI, стажировки в Швейцарии и Германии. 4 500+ установленных имплантов.',
      uz: 'ITI a\'zosi, Shveytsariya va Germaniyada malaka oshirgan. 4 500+ implantlar.',
      en: 'ITI member, trained in Switzerland & Germany. 4,500+ successful implants.',
    },
    initials: 'СК',
    color: 'bg-[#1B4332] text-white',
  },
  {
    id: 'usmanova',
    name: {
      ru: 'Д-р Мадина Усманова',
      uz: 'Dr. Madina Usmonova',
      en: 'Dr. Madina Usmanova',
    },
    role: {
      ru: 'Ведущий ортодонт (брекеты Damon, элайнеры Spark)',
      uz: 'Yetakchi ortodont (Damon breketlari, Spark elaynerlari)',
      en: 'Senior Orthodontist (Damon Braces, Spark Aligners)',
    },
    experienceYears: 11,
    credentials: {
      ru: 'Сертифицированный эксперт Ormco. 1 300+ исправленных улыбок.',
      uz: 'Ormco xalqaro sertifikati egasi. 1 300+ chiroyli tabassumlar.',
      en: 'Certified Ormco specialist. 1,300+ transformed smiles.',
    },
    initials: 'МУ',
    color: 'bg-[#2E383F] text-white',
  },
  {
    id: 'rahimov',
    name: {
      ru: 'Д-р Тимур Рахимов',
      uz: 'Dr. Timur Rahimov',
      en: 'Dr. Timur Rakhimov',
    },
    role: {
      ru: 'Стоматолог-ортопед, мастер виниров E.max',
      uz: 'Ortoped-stomatolog, E.max vinirlari ustasi',
      en: 'Prosthodontist, E.max Veneers Master',
    },
    experienceYears: 13,
    credentials: {
      ru: 'Эксперт Digital Smile Design, безупречная эстетика голливудской улыбки.',
      uz: 'Digital Smile Design mutaxassisi, mukammal estetik tabassum.',
      en: 'Digital Smile Design expert, natural aesthetics and long-lasting veneers.',
    },
    initials: 'ТР',
    color: 'bg-[#4A4743] text-white',
  },
  {
    id: 'ahmedova',
    name: {
      ru: 'Д-р Нилуфар Ахмедова',
      uz: 'Dr. Nilufar Ahmedova',
      en: 'Dr. Nilufar Akhmedova',
    },
    role: {
      ru: 'Детский врач-стоматолог, терапевт',
      uz: 'Bolalar shifokori, terapevt',
      en: 'Pediatric Dentist, General Practitioner',
    },
    experienceYears: 8,
    credentials: {
      ru: 'Психологическая адаптация боязливых деток, лечение без страха.',
      uz: 'Eng qo\'rqoq bolajonlar bilan ham tez do\'stlashadi, mehr bilan davolaydi.',
      en: 'Psychological adaptation for kids, painless and friendly dentistry.',
    },
    initials: 'НА',
    color: 'bg-[#3A453C] text-white',
  },
];
