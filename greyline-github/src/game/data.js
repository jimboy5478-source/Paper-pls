export const HOME_COUNTRY = '維德拉';
export const CAMPAIGN_DAYS = 15;
export const SAVE_KEY = 'greyline-save-v1';
export const SETTINGS_KEY = 'greyline-settings-v1';

export const COUNTRIES = {
  維德拉: { code: 'VD', name: '維德拉共和國', short: '維德拉', color: '#68735c', issuers: ['灰港', '首都區', '河西'] },
  塞恩: { code: 'SE', name: '塞恩共和國', short: '塞恩', color: '#476c78', issuers: ['塞恩市', '白灣', '洛恩'] },
  奧斯特: { code: 'OS', name: '奧斯特聯邦', short: '奧斯特', color: '#526b51', issuers: ['奧斯特', '北原', '維克'] },
  卡爾曼: { code: 'KA', name: '卡爾曼人民國', short: '卡爾曼', color: '#83544b', issuers: ['卡爾曼', '紅砂', '東關'] },
  米洛瓦: { code: 'MI', name: '米洛瓦公國', short: '米洛瓦', color: '#6d5f78', issuers: ['米洛瓦', '山湖'] },
};

export const RULES = {
  expiry: {
    title: '護照效期', short: '護照不得過期', icon: '01',
    detail: '所有入境者必須出示護照。護照有效期限不得早於今日日期；逾期護照一律拒絕入境。',
  },
  photo: {
    title: '本人身分', short: '核對護照照片', icon: '02',
    detail: '護照照片必須與窗口前的入境者一致。注意髮型、臉型、鬍鬚與其他外觀特徵。',
  },
  permit: {
    title: '入境許可', short: '外國人須附入境許可', icon: '03',
    detail: '所有非維德拉籍入境者必須附有效的入境許可。許可逾期視同無效。本國公民不受此限。',
  },
  matching: {
    title: '資料一致', short: '姓名與護照號碼須一致', icon: '04',
    detail: '所有文件上的姓名與護照號碼必須完全一致。任何拼字或號碼差異都視為文件無效。',
  },
  purpose: {
    title: '入境目的', short: '目的與停留天數須相符', icon: '05',
    detail: '入境者口述的目的與停留天數，必須與入境許可記載一致。本國公民不需核對此項。',
  },
  work: {
    title: '工作管制', short: '工作者須附工作證', icon: '06',
    detail: '以工作為目的入境者，必須另外出示有效工作證。工作證姓名、護照號碼與效期均須核對。',
  },
  region: {
    title: '疫區封鎖', short: '拒絕紅砂區居民', icon: '07',
    detail: '因紅砂區灰熱病疫情，護照籍貫標示為「紅砂區」者，無論國籍與其他文件為何，一律拒絕。',
  },
  vaccine: {
    title: '防疫規定', short: '須附兩年內 N-4 疫苗證明', icon: '08',
    detail: '所有入境者必須出示 N-4 灰熱病疫苗證明。接種日期不得早於今日前兩年，其他疫苗無效。',
  },
  issuer: {
    title: '簽發機關', short: '核對各國有效簽發城市', icon: '09',
    detail: '護照簽發城市必須列於該國核准名單。請查閱手冊的「國家資料」；未列名城市代表護照來源有問題。',
  },
  wanted: {
    title: '通緝公告', short: '拒絕通緝名單上的人', icon: '10',
    detail: '核對每日通緝公告。姓名或護照號碼任一項相符，即須拒絕入境。公告會保留至戰役結束。',
  },
  seal: {
    title: '官方印記', short: '許可須有藍色圓形部章', icon: '11',
    detail: '入境許可必須蓋有外交部藍色圓章。紅色三角章、缺章或褪色影印章均視為偽造。',
  },
  diplomat: {
    title: '外交人員', short: '外交官改驗外交通行狀', icon: '12',
    detail: '口述目的為「外交」者，不須一般入境許可，但必須出示有效外交通行狀。其他身分與資料規則仍適用。',
  },
  nationality: {
    title: '外交制裁', short: '拒絕塞恩籍入境者', icon: '13',
    detail: '即日起暫停塞恩共和國公民入境。即使持有完整文件，也必須拒絕。外交人員不在此限。',
  },
  stay: {
    title: '停留上限', short: '觀光 14 天、過境 3 天', icon: '14',
    detail: '觀光入境不得超過 14 天，過境不得超過 3 天。許可與口述天數即使一致，超過上限仍須拒絕。',
  },
  press: {
    title: '媒體管制', short: '採訪者須附新聞通行證', icon: '15',
    detail: '以採訪為目的入境者，必須另外出示有效新聞通行證。一般入境許可不能取代新聞通行證。',
  },
  declaration: {
    title: '安檢申報', short: '須附已簽名且無違禁品申報單', icon: '16',
    detail: '所有入境者必須提交安檢申報單。申報單須有本人簽名，且不得勾選攜帶武器、爆裂物或未申報藥品。',
  },
};

const baseWanted = [
  { name: '白榆', passportNo: 'KA-770194', note: '涉嫌散播顛覆刊物' },
  { name: '維克・德拉', passportNo: 'OS-551820', note: '涉嫌襲擊邊防人員' },
];

export const DAYS = [
  {
    day: 1, date: '1994.11.01', title: '新崗位', chapter: '第一章・灰港',
    headline: '勞動部：每一份正確判定，都是國家的基石。',
    story: '你被分配至灰港第七檢查站。窗外下著冷雨，家人的新居還需要租金。長官說，這是一份簡單的工作。',
    directive: '先從護照開始。檢查有效期限，並確認照片上的人就在眼前。',
    add: ['expiry', 'photo'], weather: '冷雨', rent: 22,
  },
  {
    day: 2, date: '1994.11.02', title: '紙上的邊界', chapter: '第一章・灰港',
    headline: '邊境管理局：外國旅客量上升，許可查驗即刻實施。',
    story: '隊伍比昨天更長。有人只帶著護照，也有人抱著整疊希望。你不能只看他們的臉。',
    directive: '非本國籍者必須額外出示有效入境許可。',
    add: ['permit'], weather: '陰', rent: 22,
    special: { index: 3, key: 'sister', name: '米菈・沃德', nationality: '塞恩', violation: 'missingPermit', dialogue: '是我，米菈。許可還沒核發……但孩子還在灰港等我。你會讓我過去吧？', approve: { humanity: 2 }, deny: { loyalty: 1 } },
  },
  {
    day: 3, date: '1994.11.03', title: '一字之差', chapter: '第一章・灰港',
    headline: '灰港郵報：偽造文件案件增加，官員呼籲加強查驗。',
    story: '昨晚母親咳了很久。今天的文件看起來都一樣，直到你開始逐字閱讀。',
    directive: '不同文件上的姓名與護照號碼必須完全一致。',
    add: ['matching'], weather: '陰', rent: 22,
  },
  {
    day: 4, date: '1994.11.04', title: '停留的理由', chapter: '第一章・灰港',
    headline: '交通部：短期旅客須明確申報目的與停留期限。',
    story: '有人說只待三天，文件卻寫三個月。有人說來探親，許可上卻蓋著工作。理由也是文件的一部分。',
    directive: '比對入境者的口述與許可上的目的、天數。',
    add: ['purpose'], weather: '冷雨', rent: 22,
    special: { index: 2, key: 'refugee', name: '莉娜・索娃', nationality: '卡爾曼', violation: 'missingPermit', dialogue: '我們的村子已經沒有了。我知道少了一張紙……但請別讓孩子再回到那裡。', approve: { humanity: 2 }, deny: { loyalty: 1 } },
  },
  {
    day: 5, date: '1994.11.05', title: '勞動之名', chapter: '第二章・齒輪',
    headline: '勞動部：保障本國就業，外籍勞工採許可制度。',
    story: '工廠的煙在遠處升起。每個人都說自己能工作，但不是每個人都有資格留下。',
    directive: '目的為工作的入境者，必須另外出示有效工作證。',
    add: ['work'], weather: '霧', rent: 24,
    special: { index: 4, key: 'bribe', name: '羅恩・費特', nationality: '奧斯特', violation: 'expiredPassport', bribe: 25, dialogue: '長官，一點小意思。護照日期而已，沒人會注意。你把章蓋下去，這些就是你的。', approve: { humanity: -1 }, deny: { loyalty: 1 } },
  },
  {
    day: 6, date: '1994.11.06', title: '紅砂疫區', chapter: '第二章・齒輪',
    headline: '衛生部：紅砂區出現群聚感染，邊境即時封鎖。',
    story: '防疫人員在窗邊噴灑消毒水。一個陌生人昨晚把紙條塞進你的口袋：「有人會用灰鴿這個名字。」',
    directive: '護照籍貫為紅砂區者，一律拒絕入境。',
    add: ['region'], weather: '霧', rent: 24,
    special: { index: 3, key: 'greydove', name: '灰鴿', nationality: '卡爾曼', violation: 'bannedRegion', dialogue: '別管我的籍貫。牆裡還有人等著這批藥。讓我過去，之後會有人告訴你下一步。', approve: { resistance: 2, humanity: 1 }, deny: { loyalty: 1 } },
  },
  {
    day: 7, date: '1994.11.07', title: '無色熱病', chapter: '第二章・齒輪',
    headline: '衛生部：N-4 疫苗可有效預防灰熱病，接種證明列為必要文件。',
    story: '疫苗證明成了另一道邊界。真正生病的人，往往排不到那一針。',
    directive: '所有人須出示兩年內接種的 N-4 疫苗證明。',
    add: ['vaccine'], weather: '冷雨', rent: 24,
    special: { index: 5, key: 'doctor', name: '艾達・羅文', nationality: '米洛瓦', violation: 'expiredVaccine', dialogue: '我把自己的疫苗讓給了病人。證明早幾天過期……對面的診所還缺醫生。', approve: { humanity: 2 }, deny: { loyalty: 1 } },
  },
  {
    day: 8, date: '1994.11.08', title: '城市之名', chapter: '第二章・齒輪',
    headline: '內政部：公布各國認可簽發城市，杜絕幽靈護照。',
    story: '一個不存在的城市，足以讓整本身分變成謊言。手冊變厚了，窗口的時間卻沒有變多。',
    directive: '查閱國家資料，核對護照簽發城市。',
    add: ['issuer'], weather: '晴冷', rent: 24,
    special: { index: 4, key: 'journalist', name: '伊凡・梅爾', nationality: '奧斯特', violation: 'invalidIssuer', dialogue: '簽發城市是假的，護照號碼是真的。我的底片也是真的。如果灰港的真相出不去，這裡的人會一直被遺忘。', approve: { humanity: 1, resistance: 1 }, deny: { loyalty: 1 } },
  },
  {
    day: 9, date: '1994.11.09', title: '紅色公告', chapter: '第三章・名單',
    headline: '安全局：兩名危險分子可能試圖穿越灰港邊境。',
    story: '通緝公告貼上窗框。第一個名字是「白榆」，但你知道，名字有時只是政府寫下的罪名。',
    directive: '姓名或護照號碼與通緝公告相符者，必須拒絕。',
    add: ['wanted'], wanted: baseWanted, weather: '陰', rent: 26,
    special: { index: 2, key: 'whiteelm', name: '白榆', nationality: '卡爾曼', violation: 'wanted', dialogue: '名單上寫我散播顛覆刊物。其實那只是失蹤者的名字。你可以服從公告，也可以讓真相入境。', approve: { resistance: 2, humanity: 1 }, deny: { loyalty: 2 } },
  },
  {
    day: 10, date: '1994.11.10', title: '印記', chapter: '第三章・名單',
    headline: '外交部：全面更換藍色圓形部章，舊式許可不得使用。',
    story: '印章代表權力，也代表一枚印章能被複製。今天起，連藍色的深淺都必須懷疑。',
    directive: '入境許可須有藍色圓形外交部章。紅色三角章無效。',
    add: ['seal'], wanted: baseWanted, weather: '雪', rent: 26,
    special: { index: 5, key: 'official', name: '赫斯・維恩', nationality: '米洛瓦', violation: 'forgedSeal', bribe: 35, dialogue: '這枚章只是顏色不對。我和你的副署長很熟——讓我過去，對你的考績也有好處。', approve: { loyalty: 1 }, deny: { humanity: 0 } },
  },
  {
    day: 11, date: '1994.11.11', title: '豁免權', chapter: '第三章・名單',
    headline: '外交部：持有效外交通行狀者，適用新的入境查驗程序。',
    story: '黑色轎車停在門外。外交人員不再排隊，但你仍然得決定，誰的特權是真的。',
    directive: '外交人員改驗外交通行狀，不需一般入境許可。',
    add: ['diplomat'], wanted: baseWanted, weather: '雪', rent: 26,
    special: { index: 3, key: 'diplomat', name: '奧托・塞林', nationality: '奧斯特', purpose: '外交', violation: 'missingDiplomatic', dialogue: '我的通行狀正在補發。你知道外交禮遇意味著什麼，不是嗎？別讓小事變成國際事件。', approve: { loyalty: 1 }, deny: { humanity: 0 } },
  },
  {
    day: 12, date: '1994.11.12', title: '封鎖線', chapter: '第四章・裂縫',
    headline: '緊急命令：因邊境衝突，即時停止塞恩籍人士入境。',
    story: '沒有調查，也沒有期限。一個國籍在一夜之間成了錯誤。隊伍裡有人還不知道這則新聞。',
    directive: '拒絕所有塞恩籍入境者；外交人員除外。',
    add: ['nationality'], wanted: baseWanted, weather: '大雪', rent: 28,
    special: { index: 4, key: 'aidworker', name: '諾拉・賽恩', nationality: '塞恩', violation: 'bannedNationality', dialogue: '我是救援人員。對面還有十七個人等著這車藥。我的國家做了什麼，不代表我該被他們懲罰。', approve: { humanity: 2, resistance: 1 }, deny: { loyalty: 1 } },
  },
  {
    day: 13, date: '1994.11.13', title: '期限之外', chapter: '第四章・裂縫',
    headline: '觀光局：落實短期停留上限，逾期申請將加重裁罰。',
    story: '十四天可以是一次旅行，也可以是一場告別。規則只承認前者。',
    directive: '觀光最多 14 天，過境最多 3 天。',
    add: ['stay'], wanted: baseWanted, weather: '雪', rent: 28,
    special: { index: 2, key: 'farewell', name: '米蘭・諾瓦', nationality: '米洛瓦', purpose: '觀光', violation: 'overstay', dialogue: '我父親大概撐不過這個月。我申請了二十一天，只想陪他走完。天數多了七天，真的那麼重要嗎？', approve: { humanity: 2 }, deny: { loyalty: 1 } },
  },
  {
    day: 14, date: '1994.11.14', title: '沉默的版面', chapter: '第四章・裂縫',
    headline: '文化部：境外媒體採訪須事先申請，違者依法驅離。',
    story: '報紙上的字越來越少。你開始明白，拒絕一個人，也可能是在刪除一段尚未發生的報導。',
    directive: '採訪目的者須另外出示有效新聞通行證。',
    add: ['press'], wanted: baseWanted, weather: '陰', rent: 28,
    special: { index: 5, key: 'reporter', name: '瑟拉・芬奇', nationality: '奧斯特', purpose: '採訪', violation: 'missingPressPass', dialogue: '我的申請被退了三次。灰鴿說你也許會聽完。讓我進去，明天的頭版就不會只剩官方聲明。', approve: { resistance: 2, humanity: 1 }, deny: { loyalty: 1 } },
  },
  {
    day: 15, date: '1994.11.15', title: '最後一班', chapter: '終章・灰線',
    headline: '緊急公告：灰港今晚實施管制，所有人員須完成安檢申報。',
    story: '城裡整夜有車聲。長官要求你值完這班，灰鴿則留下一句話：「最後一個人，決定你最後站在哪一邊。」',
    directive: '所有人須附已簽名的安檢申報單，不得攜帶違禁品。',
    add: ['declaration'], wanted: baseWanted, weather: '暴風雪', rent: 30,
    special: { index: 6, key: 'courier', name: '黎恩・柯特', nationality: '塞恩', purpose: '外交', violation: 'wanted', dialogue: '箱子裡是這座檢查站十五天的原始紀錄。名單、罰單、被送走的人。讓我過去，午夜後會有人來接你和家人。', approve: { resistance: 3, humanity: 2 }, deny: { loyalty: 3 } },
  },
];

export const PURPOSES = ['觀光', '探親', '工作', '過境'];
export const ALL_PURPOSES = ['觀光', '探親', '工作', '過境', '採訪', '外交'];

export const DEFAULT_FAMILY = [
  { id: 'spouse', name: '伊菈', relation: '伴侶', health: 88, status: '健康' },
  { id: 'son', name: '米洛', relation: '兒子', health: 92, status: '健康' },
  { id: 'mother', name: '葉娜', relation: '母親', health: 72, status: '健康' },
];

export const INITIAL_SAVE = {
  version: 1,
  day: 1,
  money: 65,
  family: DEFAULT_FAMILY,
  flags: { loyalty: 0, humanity: 0, resistance: 0, bribes: 0 },
  stats: { correct: 0, mistakes: 0, approved: 0, denied: 0, processed: 0 },
  history: [],
  completed: false,
  ending: null,
};

export const NIGHT_EVENTS = {
  3: {
    title: '廚房裡的咳嗽聲',
    text: '母親的咳嗽比昨天嚴重。藥房還開著，但這個月的租金也快要到期。',
    options: [
      { id: 'medicine', label: '買一瓶止咳藥', detail: '支付 12 克朗，母親健康 +22', cost: 12, target: 'mother', health: 22 },
      { id: 'wait', label: '先讓她休息', detail: '不花錢，但明天仍是未知數', health: 0 },
    ],
  },
  6: {
    title: '沒有署名的紙條',
    text: '灰鴿離開後，你在抽屜發現一張紙條：「不要相信他們的名單。」窗外正有巡邏隊經過。',
    options: [
      { id: 'burn', label: '把紙條燒掉', detail: '抵抗組織信任 +1', flags: { resistance: 1 } },
      { id: 'report', label: '交給夜班軍官', detail: '國家忠誠 +1，獎金 8 克朗', flags: { loyalty: 1 }, money: 8 },
    ],
  },
  10: {
    title: '長官的加班通知',
    text: '鄰站缺少人手。你可以再去值四小時夜班，但伊菈已經好幾天沒好好睡過。',
    options: [
      { id: 'work', label: '接受夜班', detail: '獲得 22 克朗，所有家人健康 -5', money: 22, familyHealth: -5 },
      { id: 'home', label: '回家吃晚餐', detail: '所有家人健康 +4', familyHealth: 4 },
    ],
  },
  13: {
    title: '北方的車票',
    text: '地下售票員說，戰役結束後會有一班不靠站的貨車。他可以替你的家人保留位置，但要先付訂金。',
    options: [
      { id: 'ticket', label: '支付車票訂金', detail: '支付 35 克朗，解鎖一個撤離選項', cost: 35, flags: { ticket: 1 } },
      { id: 'decline', label: '現在還不能走', detail: '保留積蓄，繼續等待', flags: {} },
    ],
  },
};

export function getDayConfig(day) {
  return DAYS[Math.max(0, Math.min(DAYS.length - 1, day - 1))];
}

export function getActiveRules(day) {
  return RULES ? Object.keys(RULES).filter((key) => DAYS.slice(0, day).some((d) => d.add.includes(key))) : [];
}

export function getWantedList(day) {
  return day >= 9 ? baseWanted : [];
}
