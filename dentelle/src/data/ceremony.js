// Dentelle — 成功大學牙醫學系 117 級 第四屆授袍典禮
// ----------------------------------------------------------------
// 替換這支檔案即可更新整個簡報內容。未敲定的欄位標 TODO。

export const ceremonyMeta = {
  title: 'DENTELLE',
  subtitleFr: 'Cérémonie de la Blouse Blanche',
  institutionFr: 'NCKU · Faculté de Chirurgie Dentaire',
  institutionHan: '國立成功大學 牙醫學系',
  classLine: '117 級 · 第四屆授袍典禮',
  date: 'Anno MMXXVI',
  hosts: ['劉晏彤', '王羿翔']
};

// ————————————————————————————————————————————————
// 典禮前注意事項（司儀稿原文）
// ————————————————————————————————————————————————
export const hallNotes = {
  overline: 'Avant la cérémonie',
  title: '典禮開始前',
  intro: '為維護典禮品質，請各位貴賓配合以下事項',
  notes: [
    {
      fr: 'Silence',
      han: '請將手機及其他電子設備調整至震動或靜音，典禮進行時請勿隨意走動'
    },
    {
      fr: 'Aucune nourriture',
      han: '講堂內禁止飲食'
    },
    {
      fr: 'Toilettes',
      han: '洗手間位於出口兩側；如需協助請詢問身邊的工作人員'
    },
    {
      fr: 'Photographie',
      han: '授袍過程中為親友拍照，可提前至中間第三排空位進行'
    }
  ]
};

// ————————————————————————————————————————————————
// Dentelle 詞義開場（司儀稿第二段）
// ————————————————————————————————————————————————
export const dentelleIntro = {
  overline: 'Le Sens du Mot',
  title: 'Dentelle 之意',
  paragraphs: [
    '「Dentelle」這個帶有 Den 的法文單字，指的是精細的蕾絲。',
    '在牙醫的世界裡，這份精細，是我們對每一條齦溝、每一處修復的執著。',
    '蕾絲正是由千絲萬縷交織而成的藝術，提醒我們——從最微小的根管系統到全口重建的咬合設計，我們都如同編織蕾絲的工匠，追求無微不至的準確。',
    '而字首的 Den.，正是 Dentistry 的縮寫，也是我們一生的身分，提醒我們所肩負的使命與責任。',
    '今日白袍加身，是一段結合藝術與人文的啟程。'
  ],
  closing: '願同學們以專業與關懷，與未來所有病人織就一段段信任的關係。'
};

// ————————————————————————————————————————————————
// 副院長致詞（開場影片）
// ————————————————————————————————————————————————
export const vicePresidentSpeech = {
  overline: 'Discours d\u2019Ouverture · 開場致詞',
  title: '醫學院副院長致詞',
  speaker: '張育誌',
  speakerTitle: '醫學院副院長',
  videoPlaceholder: true, // 真實 MP4 檔進來後替換
  caption:
    '醫學院的大家長上台致詞，以影片方式呈現'
};

// ————————————————————————————————————————————————
// 3 位授袍前來賓致詞（司儀稿 13:45）
// ————————————————————————————————————————————————
export const dignitarySpeeches = [
  {
    name: '黃則達',
    title: '成大牙醫學系暨口醫部主任',
    role: 'Directeur · 大家長',
    intro:
      '黃主任近年來積極推動系上教學資源與學習環境的優化，無論在設備建置或見習實習的安排上，都投注了大量心力。',
    blessing:
      '期盼為即將進入口醫部見習的學長姐們送上勉勵與祝福。'
  },
  {
    name: '陳永崇',
    title: '成大口醫部贋復補綴科主任',
    role: 'Prosthodontie',
    intro:
      '陳老師擁有深厚的臨床實力與教學經驗，對於固定補綴、局部義齒與全口重建課程的教學無微不至，是牙醫系高年級學生又愛又恨的關鍵人物。',
    blessing:
      '以嚴謹態度與高度熱忱，帶領同學們在補綴的世界中扎實成長。'
  },
  {
    name: '陳畊仲',
    title: '成大口醫部口腔顎面外科主任',
    role: 'Chirurgie Maxillo-Faciale',
    intro:
      '陳老師講課風格深入淺出、風趣又專業，帶領同學們探索複雜的口腔結構與臨床思維。',
    blessing:
      '作為學長姐即將踏入口醫部見習的重要引路人，今天特地為大家準備了勉勵與期許。'
  }
];

// ————————————————————————————————————————————————
// 與會來賓介紹（10 位，含陳木熊）
// ————————————————————————————————————————————————
export const guests = [
  { name: '張雅雯', title: '副院長' },
  { name: '莊淑芬', title: '教授' },
  { name: '吳昱學', title: '教授' },
  { name: '丁羣展', title: '教授' },
  { name: '巫仰哲', title: '教授' },
  { name: '鄭修琦', title: '教授' },
  { name: '林威辰', title: '教授' },
  { name: '張育誌', title: '教授' },
  { name: '張維倫', title: '教授' },
  { name: '陳木熊', title: '教授' }
];

// ————————————————————————————————————————————————
// 師長祝福影片（多段）
// TODO: MP4 檔進來後逐段替換 src
// ————————————————————————————————————————————————
export const blessingVideos = {
  overline: 'Messages des Maîtres · 師長祝福',
  title: '師長的話',
  caption:
    '就讀牙醫系的四年來，學長姐們修習了不少課程、接受了許多師長的指導。今天我們將透過影片看看師長們對即將進入醫院的 117 級學長姐有什麼鼓勵的話。',
  segments: [
    // { src: '/videos/blessing-1.mp4', teacher: 'XXX 老師' }
  ]
};

// ————————————————————————————————————————————————
// 授袍 · 六個房間（司儀稿 14:22 起）
// ————————————————————————————————————————————————
export const rooms = [
  {
    index: 1,
    roman: 'I',
    name: 'Chambre I',
    han: '第一受袍廳',
    timeWindow: '14:25-14:31',
    teacher: {
      name: '黃則達',
      title: '成大牙醫學系暨口醫部主任',
      latin: 'Directeur'
    },
    students: [
      { name: '蔡兆霖', honorific: '學長' },
      { name: '陳由恩', honorific: '學姊' },
      { name: '陳虹儒', honorific: '學姊' },
      { name: '洪梓茗', honorific: '學長' },
      { name: '劉恩郡', honorific: '學長' },
      { name: '許維祥', honorific: '學長' }
    ]
  },
  {
    index: 2,
    roman: 'II',
    name: 'Chambre II',
    han: '第二受袍廳',
    timeWindow: '14:33-14:34',
    teacher: {
      name: '陳畊仲',
      title: '口腔顎面外科主任',
      latin: 'Chirurgie Maxillo-Faciale'
    },
    students: [{ name: '林柏毅', honorific: '學長' }]
  },
  {
    index: 3,
    roman: 'III',
    name: 'Chambre III',
    han: '第三受袍廳',
    timeWindow: '14:36-14:40',
    teacher: {
      name: '陳永崇',
      title: '贋復補綴科主任',
      latin: 'Prosthodontie'
    },
    students: [
      { name: '王碧瑤', honorific: '學姊' },
      { name: '陳智楷', honorific: '學長' },
      { name: '林昕佑', honorific: '學長' },
      { name: '林瑋晨', honorific: '學長' }
    ]
  },
  {
    index: 4,
    roman: 'IV',
    name: 'Chambre IV',
    han: '第四受袍廳',
    timeWindow: '14:42-14:45',
    teacher: {
      name: '丁群展',
      title: '教授',
      latin: 'Professeur'
    },
    students: [
      { name: '林琪錡', honorific: '學姊' },
      { name: '李之為', honorific: '學長' },
      { name: '韓承恩', honorific: '學長' }
    ]
  },
  {
    index: 5,
    roman: 'V',
    name: 'Chambre V',
    han: '第五受袍廳',
    timeWindow: '14:47-14:51',
    teacher: {
      name: '莊淑芬',
      title: '教授',
      latin: 'Professeur'
    },
    students: [
      { name: '萬庭禎', honorific: '學姊' },
      { name: '陳梓瑄', honorific: '學姊' },
      { name: '黃友誠', honorific: '學長' },
      { name: '簡騏', honorific: '學長' }
    ]
  },
  {
    index: 6,
    roman: 'VI',
    name: 'Chambre VI',
    han: '第六受袍廳',
    timeWindow: '14:53-14:56',
    teacher: {
      name: '吳昱學',
      title: '教授',
      latin: 'Professeur'
    },
    students: [
      { name: '羊羿樺', honorific: '學姊' },
      { name: '鍾英弘', honorific: '學長' },
      { name: '黃丞毅', honorific: '學長' }
    ]
  }
];

// ————————————————————————————————————————————————
// 118 級在校生致辭（司儀稿 15:03-15:08）
// ————————————————————————————————————————————————
export const studentSpeech = {
  overline: 'Discours des Cadets · 在校生致辭',
  title: '在校生的祝福',
  representative: { name: '118 級代表', placeholder: true }, // TODO: 姓名
  excerpts: [
    '恭喜學長姐們即將邁入下一個人生階段。',
    '還記得去年的五月白袍典禮嗎？那時，你們在台下默默付出、各司其職、奔波忙碌，親手為學長姐們遞上潔白的白袍。',
    '如今，我們成了當時的你們，懷著同樣真摯的心情，站在這裡，誠摯地獻上我們的祝福。',
    '披上白袍之後，除了代表著學生身分的轉換，也代表著當初年少懵懂的內心，即將轉為醫者助人的一片赤誠。',
    '願你們在風口浪尖上依然勇敢前行——即使跌撞，也不失堅定與從容。'
  ],
  closing:
    '衷心祝福學長姐們在踏入臨床之後，依然不忘初心，一步步成為心中理想的牙醫師。'
};

// ————————————————————————————————————————————————
// 牙醫師誓詞（日內瓦醫師宣言 · Déclaration de Genève）
// 領誓代表：鍾英弘
// ————————————————————————————————————————————————
export const oath = {
  overline: 'Serment de Genève',
  title: '醫師宣誓詞',
  subtitle: '日內瓦宣言 · Déclaration de Genève',
  leader: { name: '鍾英弘', role: '宣誓代表' },
  preface:
    '日內瓦宣言是醫師對於醫學人道主義目標的宣誓。願學長姐能以一份莊重專業的態度面對臨床工作。',
  paragraphs: [
    '余鄭重宣誓：',
    '余願盡余之能力與判斷力以從事醫業；',
    '病家之健康與幸福為余首要顧念；',
    '余必尊重病人所交付予余之秘密，即使病人死後亦然；',
    '余必盡一切可能，維護醫師職業之榮譽與高尚傳統；',
    '余視同僚為兄弟姐妹；',
    '余對病人之責任，不因其年齡、疾病、殘障、信仰、族裔、性別、國籍、政治立場、種族、性取向、社會地位或其他因素而有所不同；',
    '余必以最大的尊重，維護人類生命，自其開始；',
    '即使受到威脅，余亦不運用余之醫學知識違反人道；',
    '余本此誓言，鄭重地、自主地、並以余之人格宣誓。'
  ],
  closing: '此誓。 Je le jure.'
};

// ————————————————————————————————————————————————
// 大合照（投影片到此結束）
// ————————————————————————————————————————————————
export const groupPhoto = {
  overline: 'Photo de Groupe',
  title: '大合照',
  subtitle: '成功大學牙醫學系 第四屆授袍典禮',
  caption: '願我們都成為彼此生命裡的那束光',
  date: ceremonyMeta.date
};

// ————————————————————————————————————————————————
// 揭曉（巨大牙齒建築）
// ————————————————————————————————————————————————
export const reveal = {
  overline: 'La Révélation',
  han: '原來，我們一直在一顆牙裡。',
  fr: 'Toute notre cérémonie, à l\u2019intérieur d\u2019une seule dent.'
};
