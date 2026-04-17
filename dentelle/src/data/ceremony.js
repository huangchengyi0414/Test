// Dentelle — 典禮內容資料
// 替換這支檔案即可更新整個簡報內容
export const ceremonyMeta = {
  title: 'Cérémonie de la Blouse Blanche',
  titleHan: '牙醫白袍典禮',
  subtitle: 'Dentelle',
  subtitleHan: '蕾絲',
  date: 'Anno MMXXVI',
  className: '牙醫學系 白袍典禮'
};

export const hallNotes = {
  overline: 'Avant la cérémonie',
  title: '典禮開始前',
  notes: [
    { fr: 'Silence', han: '請將手機調整為靜音或震動' },
    { fr: 'Respect', han: '典禮進行中請勿隨意走動' },
    { fr: 'Photographie', han: '攝影請保持安靜，勿影響受袍流程' },
    { fr: 'Ordre', han: '受袍依序依房間順序進行，請依指引入座' },
    { fr: 'Serment', han: '全體誓詞時請起立、共同朗誦' }
  ]
};

export const blessings = [
  {
    teacher: '教授 甲',
    role: 'Doyen',
    fr: 'La dentelle, c\u2019est la patience.',
    han: '一針一線，醫者如織。願你以細膩為刃，以耐心為光。'
  },
  {
    teacher: '教授 乙',
    role: 'Professeur',
    fr: 'Chaque dent, une histoire.',
    han: '每一顆牙齒都有它的故事。請用心聆聽每一位病人。'
  },
  {
    teacher: '教授 丙',
    role: 'Professeur',
    fr: 'Le pissenlit vole loin.',
    han: '如蒲公英般，把溫柔帶到需要的角落。'
  },
  {
    teacher: '教授 丁',
    role: 'Professeur',
    fr: 'Soyez lumi\u00e8re.',
    han: '願你在黑暗處成為一束光。'
  }
];

const placeholderStudents = (prefix, count) =>
  Array.from({ length: count }, (_, i) => ({
    name: `${prefix} 學生${i + 1}`,
    latin: `Candidat ${i + 1}`
  }));

export const rooms = [
  {
    index: 1,
    name: 'Chambre I',
    han: '第一受袍廳',
    teacher: { name: '教授 甲', role: 'Maître de cérémonie' },
    students: placeholderStudents('一', 5)
  },
  {
    index: 2,
    name: 'Chambre II',
    han: '第二受袍廳',
    teacher: { name: '教授 乙', role: 'Maître de cérémonie' },
    students: placeholderStudents('二', 5)
  },
  {
    index: 3,
    name: 'Chambre III',
    han: '第三受袍廳',
    teacher: { name: '教授 丙', role: 'Maître de cérémonie' },
    students: placeholderStudents('三', 4)
  },
  {
    index: 4,
    name: 'Chambre IV',
    han: '第四受袍廳',
    teacher: { name: '教授 丁', role: 'Maître de cérémonie' },
    students: placeholderStudents('四', 5)
  }
];

export const oath = {
  overline: 'Le Serment',
  title: '牙醫師誓詞',
  paragraphs: [
    '余謹以至誠，於此鄭重宣誓：',
    '願以畢生奉獻於牙醫專業，以病人之福祉為首要之念。',
    '願恪守醫學倫理，維護醫師之榮譽與聖潔傳統。',
    '願不因種族、宗教、國籍、政黨或社會地位，而有所差別。',
    '願以至誠守護每一位病患之健康，以細膩之手、溫柔之心，行救助之事。',
    '此誓——'
  ]
};

export const groupPhoto = {
  overline: 'Photo de groupe',
  title: '大合照',
  subtitle: '願我們都成為彼此生命裡的那束光',
  date: ceremonyMeta.date
};

export const reveal = {
  overline: 'La révélation',
  han: '原來，我們一直在這裡。',
  fr: 'Toute notre cérémonie, à l\u2019intérieur d\u2019une seule dent.'
};
