import {
  ALL_PURPOSES,
  CAMPAIGN_DAYS,
  COUNTRIES,
  DEFAULT_FAMILY,
  DAYS,
  getActiveRules,
  getDayConfig,
  getWantedList,
  HOME_COUNTRY,
  INITIAL_SAVE,
} from './data.js';

export function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const pad = (n, length = 2) => String(n).padStart(length, '0');
const clone = (value) => JSON.parse(JSON.stringify(value));

const GIVEN_NAMES = {
  男: ['艾倫', '馬克', '尤里', '米蘭', '丹尼', '奧托', '尼可', '里歐', '維克', '薩夏'],
  女: ['艾娃', '娜塔', '莎拉', '卡佳', '莉亞', '諾拉', '瑟拉', '艾達', '瑪雅', '薇拉'],
};
const SURNAMES = ['瑞德', '索恩', '科瓦', '沃斯', '羅文', '奧林', '諾瓦', '梅爾', '芬奇', '維恩', '德拉', '柯特'];
const REGIONS = ['中央區', '北灣', '東境', '河西', '紅砂區'];
const DOC_LABELS = {
  passport: '護照', permit: '入境許可', work: '工作證', vaccine: '疫苗證明',
  diplomatic: '外交通行狀', press: '新聞通行證', declaration: '安檢申報單',
};

function makeName(rng, sex) {
  return `${pick(rng, GIVEN_NAMES[sex])}・${pick(rng, SURNAMES)}`;
}

function futureDate(rng, day) {
  const year = 1995 + Math.floor(rng() * 5);
  return `${year}.${pad(1 + Math.floor(rng() * 12))}.${pad(1 + Math.floor(rng() * 28))}`;
}

function birthDate(rng) {
  return `${1948 + Math.floor(rng() * 43)}.${pad(1 + Math.floor(rng() * 12))}.${pad(1 + Math.floor(rng() * 28))}`;
}

function defaultDaysForPurpose(rng, purpose, day) {
  if (purpose === '觀光') return day >= 13 ? 3 + Math.floor(rng() * 12) : 3 + Math.floor(rng() * 25);
  if (purpose === '過境') return day >= 13 ? 1 + Math.floor(rng() * 3) : 1 + Math.floor(rng() * 6);
  if (purpose === '探親') return 7 + Math.floor(rng() * 32);
  if (purpose === '工作') return 30 + Math.floor(rng() * 120);
  if (purpose === '採訪') return 5 + Math.floor(rng() * 16);
  if (purpose === '外交') return 30 + Math.floor(rng() * 60);
  return 0;
}

function syncIdentity(person) {
  const { name, passportNo } = person.documents.passport;
  person.name = name;
  person.passportNo = passportNo;
  Object.values(person.documents).forEach((doc) => {
    if (doc.type === 'passport') return;
    if ('name' in doc) doc.name = name;
    if ('passportNo' in doc) doc.passportNo = passportNo;
    if (doc.type === 'declaration' && doc.signed) doc.signature = name;
  });
}

function secondaryDocuments(person) {
  return Object.values(person.documents).filter((doc) => doc.type !== 'passport');
}

const VIOLATION_DAY = {
  expiredPassport: 1, photoMismatch: 1,
  missingPermit: 2, expiredPermit: 2,
  nameMismatch: 3, passportNoMismatch: 3,
  wrongPurpose: 4, wrongDays: 4,
  missingWorkPass: 5, expiredWorkPass: 5,
  bannedRegion: 6,
  missingVaccine: 7, expiredVaccine: 7, wrongVaccine: 7,
  invalidIssuer: 8, wanted: 9, forgedSeal: 10,
  missingDiplomatic: 11, expiredDiplomatic: 11,
  bannedNationality: 12, overstay: 13,
  missingPressPass: 14, expiredPressPass: 14,
  missingDeclaration: 15, unsignedDeclaration: 15, contraband: 15,
};

const FOCUS_VIOLATION = {
  1: 'expiredPassport', 2: 'missingPermit', 3: 'nameMismatch', 4: 'wrongPurpose',
  5: 'missingWorkPass', 6: 'bannedRegion', 7: 'expiredVaccine', 8: 'invalidIssuer',
  9: 'wanted', 10: 'forgedSeal', 11: 'missingDiplomatic', 12: 'bannedNationality',
  13: 'overstay', 14: 'missingPressPass', 15: 'unsignedDeclaration',
};

function canInject(person, code, day) {
  const docs = person.documents;
  const foreign = person.nationality !== HOME_COUNTRY;
  const diplomat = day >= 11 && person.purpose === '外交';
  switch (code) {
    case 'missingPermit': case 'expiredPermit': case 'forgedSeal': return Boolean(docs.permit);
    case 'nameMismatch': case 'passportNoMismatch': return secondaryDocuments(person).some((d) => 'name' in d || 'passportNo' in d);
    case 'wrongPurpose': case 'wrongDays': return Boolean(docs.permit);
    case 'missingWorkPass': case 'expiredWorkPass': return foreign && person.purpose === '工作' && Boolean(docs.work);
    case 'missingVaccine': case 'expiredVaccine': case 'wrongVaccine': return Boolean(docs.vaccine);
    case 'wanted': return day >= 9;
    case 'missingDiplomatic': case 'expiredDiplomatic': return diplomat && Boolean(docs.diplomatic);
    case 'bannedNationality': return day >= 12 && !diplomat;
    case 'overstay': return Boolean(docs.permit && ['觀光', '過境'].includes(person.purpose));
    case 'missingPressPass': case 'expiredPressPass': return Boolean(docs.press);
    case 'missingDeclaration': case 'unsignedDeclaration': case 'contraband': return Boolean(docs.declaration);
    default: return true;
  }
}

function injectViolation(person, code, rng) {
  const docs = person.documents;
  const passport = docs.passport;
  switch (code) {
    case 'expiredPassport': passport.expiry = '1993.12.31'; break;
    case 'photoMismatch': passport.photoId = person.appearanceId + 23; break;
    case 'missingPermit': delete docs.permit; break;
    case 'expiredPermit': if (docs.permit) docs.permit.expiry = '1993.12.31'; break;
    case 'nameMismatch': {
      const doc = secondaryDocuments(person).find((d) => 'name' in d);
      if (doc) doc.name = `${pick(rng, GIVEN_NAMES[person.sex])}・${pick(rng, SURNAMES)}`;
      if (doc && doc.name === person.name) doc.name = `艾倫・異名`;
      break;
    }
    case 'passportNoMismatch': {
      const doc = secondaryDocuments(person).find((d) => 'passportNo' in d);
      if (doc) doc.passportNo = `${doc.passportNo.slice(0, -1)}${doc.passportNo.endsWith('1') ? '2' : '1'}`;
      break;
    }
    case 'wrongPurpose': {
      if (docs.permit) docs.permit.purpose = pick(rng, ALL_PURPOSES.filter((p) => !['外交', '返家', person.purpose].includes(p)));
      break;
    }
    case 'wrongDays': if (docs.permit) docs.permit.days = person.days + 5; break;
    case 'missingWorkPass': delete docs.work; break;
    case 'expiredWorkPass': if (docs.work) docs.work.expiry = '1993.12.31'; break;
    case 'bannedRegion': passport.region = '紅砂區'; break;
    case 'missingVaccine': delete docs.vaccine; break;
    case 'expiredVaccine': if (docs.vaccine) docs.vaccine.date = '1991.01.10'; break;
    case 'wrongVaccine': if (docs.vaccine) docs.vaccine.vaccine = 'N-2'; break;
    case 'invalidIssuer': passport.issuer = '新港'; break;
    case 'wanted': {
      const target = person.specialKey === 'whiteelm' || person.specialKey === 'courier'
        ? getWantedList(9)[0]
        : pick(rng, getWantedList(9));
      if (person.specialKey !== 'courier') passport.name = target.name;
      passport.passportNo = target.passportNo;
      syncIdentity(person);
      break;
    }
    case 'forgedSeal': if (docs.permit) docs.permit.seal = 'red-triangle'; break;
    case 'missingDiplomatic': delete docs.diplomatic; break;
    case 'expiredDiplomatic': if (docs.diplomatic) docs.diplomatic.expiry = '1993.12.31'; break;
    case 'bannedNationality': {
      passport.nationality = '塞恩';
      person.nationality = '塞恩';
      passport.issuer = pick(rng, COUNTRIES.塞恩.issuers);
      passport.passportNo = `SE-${passport.passportNo.slice(3)}`;
      syncIdentity(person);
      break;
    }
    case 'overstay': {
      const max = person.purpose === '觀光' ? 14 : 3;
      person.days = max + 7;
      if (docs.permit) docs.permit.days = person.days;
      break;
    }
    case 'missingPressPass': delete docs.press; break;
    case 'expiredPressPass': if (docs.press) docs.press.expiry = '1993.12.31'; break;
    case 'missingDeclaration': delete docs.declaration; break;
    case 'unsignedDeclaration': if (docs.declaration) { docs.declaration.signed = false; docs.declaration.signature = ''; } break;
    case 'contraband': if (docs.declaration) { docs.declaration.contraband = '有'; docs.declaration.items = '未申報藥品'; } break;
    default: break;
  }
}

function createPerson(day, index, special = null) {
  const rng = mulberry32(90211 + day * 1009 + index * 97);
  const config = getDayConfig(day);
  const active = getActiveRules(day);
  const focus = index === 1 ? FOCUS_VIOLATION[day] : null;
  const sex = rng() > 0.5 ? '男' : '女';
  let nationality = special?.nationality || pick(rng, Object.keys(COUNTRIES));
  let purpose = special?.purpose || (nationality === HOME_COUNTRY ? '返家' : '探親');

  if (!special && nationality !== HOME_COUNTRY) {
    const pool = ['觀光', '探親', '工作', '過境'];
    if (day >= 14) pool.push('採訪');
    if (day >= 11) pool.push('外交');
    purpose = pick(rng, pool);
  }
  if (!special && nationality === HOME_COUNTRY && ['missingPermit', 'wrongPurpose', 'forgedSeal'].includes(focus)) {
    nationality = pick(rng, Object.keys(COUNTRIES).filter((c) => c !== HOME_COUNTRY));
    purpose = pick(rng, ['觀光', '探親', '過境']);
  }
  if (!special && focus === 'nameMismatch' && nationality === HOME_COUNTRY) {
    nationality = '奧斯特';
    purpose = '探親';
  }
  if (!special && focus === 'missingWorkPass') { nationality = '奧斯特'; purpose = '工作'; }
  if (!special && focus === 'missingDiplomatic') { nationality = '奧斯特'; purpose = '外交'; }
  if (!special && focus === 'missingPressPass') { nationality = '奧斯特'; purpose = '採訪'; }
  if (!special && focus === 'overstay') { nationality = '米洛瓦'; purpose = '觀光'; }
  if (!special && focus === 'forgedSeal' && purpose === '外交') purpose = '探親';
  if (!special && day >= 12 && nationality === '塞恩' && purpose !== '外交' && focus !== 'bannedNationality') nationality = '奧斯特';
  if (!special && day >= 12 && purpose === '外交' && nationality === '塞恩') nationality = '米洛瓦';

  const appearanceId = 1000 + day * 83 + index * 19 + Math.floor(rng() * 30);
  const name = special?.name || makeName(rng, sex);
  const code = COUNTRIES[nationality].code;
  const passportNo = `${code}-${Math.floor(100000 + rng() * 899999)}`;
  const issuer = pick(rng, COUNTRIES[nationality].issuers);
  let region = pick(rng, REGIONS.filter((r) => r !== '紅砂區'));
  const days = defaultDaysForPurpose(rng, purpose, day);
  const person = {
    id: `d${day}-p${index}`,
    day,
    index,
    name,
    sex,
    nationality,
    purpose,
    days,
    appearanceId,
    passportNo,
    specialKey: special?.key || null,
    special: special ? clone(special) : null,
    bribe: special?.bribe || 0,
    dialogue: special?.dialogue || '',
    intendedValid: true,
    injectedViolation: null,
    documents: {},
  };

  person.documents.passport = {
    id: `${person.id}-passport`, type: 'passport', label: '護照', name, passportNo,
    nationality, sex, dob: birthDate(rng), expiry: futureDate(rng, day), issuer,
    region, photoId: appearanceId,
  };

  const isDiplomat = active.includes('diplomat') && purpose === '外交';
  if (active.includes('permit') && nationality !== HOME_COUNTRY && !isDiplomat) {
    person.documents.permit = {
      id: `${person.id}-permit`, type: 'permit', label: '入境許可', name, passportNo,
      purpose, days, expiry: futureDate(rng, day), seal: 'blue-round',
      permitId: `EN-${day}${pad(index)}-${Math.floor(100 + rng() * 899)}`,
    };
  }
  if (active.includes('work') && nationality !== HOME_COUNTRY && purpose === '工作') {
    person.documents.work = {
      id: `${person.id}-work`, type: 'work', label: '工作證', name, passportNo,
      employer: pick(rng, ['灰港機械廠', '第七碼頭', '北方營造', '國營印刷所']),
      expiry: futureDate(rng, day),
    };
  }
  if (active.includes('vaccine')) {
    person.documents.vaccine = {
      id: `${person.id}-vaccine`, type: 'vaccine', label: '疫苗證明', name, passportNo,
      vaccine: 'N-4', date: `${1993 + Math.floor(rng() * 2)}.${pad(1 + Math.floor(rng() * 12))}.${pad(1 + Math.floor(rng() * 28))}`,
      clinic: pick(rng, ['市立防疫所', '白灣診所', '國境衛生站']),
    };
  }
  if (isDiplomat) {
    person.documents.diplomatic = {
      id: `${person.id}-diplomatic`, type: 'diplomatic', label: '外交通行狀', name, passportNo,
      nationality, mission: pick(rng, ['文化代表團', '貿易使節團', '領事館']),
      expiry: futureDate(rng, day), seal: 'blue-round',
    };
  }
  if (active.includes('press') && nationality !== HOME_COUNTRY && purpose === '採訪') {
    person.documents.press = {
      id: `${person.id}-press`, type: 'press', label: '新聞通行證', name, passportNo,
      agency: pick(rng, ['自由電訊報', '北方通訊社', '米洛瓦紀實']),
      expiry: futureDate(rng, day),
    };
  }
  if (active.includes('declaration')) {
    person.documents.declaration = {
      id: `${person.id}-declaration`, type: 'declaration', label: '安檢申報單', name, passportNo,
      signed: true, signature: name, contraband: '無', items: '無',
    };
  }

  if (special?.violation === 'wanted' && name === '白榆') {
    person.documents.passport.passportNo = 'KA-770194';
    syncIdentity(person);
  }

  let invalid = Boolean(special?.violation);
  if (!special) {
    invalid = index === 1 || index === 4 || (index >= 6 && rng() < 0.38);
  }
  if (invalid) {
    let candidates = Object.keys(VIOLATION_DAY).filter((code) => VIOLATION_DAY[code] <= day && canInject(person, code, day));
    let violation = special?.violation || (focus && canInject(person, focus, day) ? focus : null);
    if (!violation) violation = pick(rng, candidates);
    if (violation) {
      injectViolation(person, violation, rng);
      person.injectedViolation = violation;
      person.intendedValid = false;
    }
  }

  if (!person.dialogue) {
    if (nationality === HOME_COUNTRY) {
      person.dialogue = pick(rng, ['我回家了。文件都在這裡。', '灰港的天氣還是這麼糟。請檢查吧。', '本國公民，返家。']);
    } else {
      const dayText = purpose === '過境' ? `${days} 天` : `${days} 天`;
      person.dialogue = pick(rng, [
        `你好。我來${purpose}，預計停留 ${dayText}。`,
        `文件都在這裡。目的是${purpose}，${dayText}後離開。`,
        `請快一點，我排了很久。${purpose}，停留 ${dayText}。`,
      ]);
    }
  }
  return person;
}

export function generateDayEntrants(day) {
  const config = getDayConfig(day);
  const count = 7 + Math.floor((day - 1) / 4);
  const people = [];
  for (let index = 0; index < count; index += 1) {
    const special = config.special?.index === index ? config.special : null;
    people.push(createPerson(day, index, special));
  }
  return people;
}

export function getViolations(person, day = person.day) {
  const active = getActiveRules(day);
  const config = getDayConfig(day);
  const docs = person.documents;
  const passport = docs.passport;
  const violations = [];
  const add = (code, message) => violations.push({ code, message });
  if (!passport) {
    add('missingPassport', '未出示護照');
    return violations;
  }
  const foreign = passport.nationality !== HOME_COUNTRY;
  const diplomat = active.includes('diplomat') && person.purpose === '外交';

  if (active.includes('expiry') && passport.expiry < config.date) add('expiredPassport', `護照已於 ${passport.expiry} 過期`);
  if (active.includes('photo') && passport.photoId !== person.appearanceId) add('photoMismatch', '護照照片與本人不符');

  if (active.includes('permit') && foreign) {
    if (diplomat) {
      if (!docs.diplomatic) add('missingDiplomatic', '外交人員未出示外交通行狀');
      else if (docs.diplomatic.expiry < config.date) add('expiredDiplomatic', '外交通行狀已過期');
    } else {
      if (!docs.permit) add('missingPermit', '外國人未出示入境許可');
      else if (docs.permit.expiry < config.date) add('expiredPermit', `入境許可已於 ${docs.permit.expiry} 過期`);
    }
  }

  if (active.includes('matching')) {
    secondaryDocuments(person).forEach((doc) => {
      if ('name' in doc && doc.name !== passport.name) add('nameMismatch', `${DOC_LABELS[doc.type]}姓名與護照不一致`);
      if ('passportNo' in doc && doc.passportNo !== passport.passportNo) add('passportNoMismatch', `${DOC_LABELS[doc.type]}護照號碼不一致`);
    });
  }
  if (active.includes('purpose') && docs.permit) {
    if (docs.permit.purpose !== person.purpose) add('wrongPurpose', `口述目的「${person.purpose}」與許可「${docs.permit.purpose}」不符`);
    if (Number(docs.permit.days) !== Number(person.days)) add('wrongDays', `口述停留 ${person.days} 天與許可 ${docs.permit.days} 天不符`);
  }
  if (active.includes('work') && foreign && person.purpose === '工作') {
    if (!docs.work) add('missingWorkPass', '工作入境者未出示工作證');
    else if (docs.work.expiry < config.date) add('expiredWorkPass', '工作證已過期');
  }
  if (active.includes('region') && passport.region === '紅砂區') add('bannedRegion', '紅砂區居民暫停入境');
  if (active.includes('vaccine')) {
    if (!docs.vaccine) add('missingVaccine', '未出示疫苗證明');
    else {
      if (docs.vaccine.vaccine !== 'N-4') add('wrongVaccine', `疫苗種類 ${docs.vaccine.vaccine} 不符合 N-4 規定`);
      const cutoff = `${Number(config.date.slice(0, 4)) - 2}${config.date.slice(4)}`;
      if (docs.vaccine.date < cutoff) add('expiredVaccine', `疫苗接種日期 ${docs.vaccine.date} 已超過兩年`);
    }
  }
  if (active.includes('issuer') && !COUNTRIES[passport.nationality]?.issuers.includes(passport.issuer)) {
    add('invalidIssuer', `${passport.nationality}不承認簽發城市「${passport.issuer}」`);
  }
  if (active.includes('wanted')) {
    const wanted = getWantedList(day).find((w) => w.name === passport.name || w.passportNo === passport.passportNo);
    if (wanted) add('wanted', `符合通緝公告：${wanted.name}／${wanted.passportNo}`);
  }
  if (active.includes('seal') && docs.permit && docs.permit.seal !== 'blue-round') add('forgedSeal', '入境許可缺少有效的藍色圓形部章');
  if (active.includes('nationality') && passport.nationality === '塞恩' && !diplomat) add('bannedNationality', '塞恩籍人士暫停入境');
  if (active.includes('stay') && docs.permit) {
    const max = person.purpose === '觀光' ? 14 : person.purpose === '過境' ? 3 : null;
    if (max && Number(person.days) > max) add('overstay', `${person.purpose}停留 ${person.days} 天，超過 ${max} 天上限`);
  }
  if (active.includes('press') && foreign && person.purpose === '採訪') {
    if (!docs.press) add('missingPressPass', '採訪入境者未出示新聞通行證');
    else if (docs.press.expiry < config.date) add('expiredPressPass', '新聞通行證已過期');
  }
  if (active.includes('declaration')) {
    if (!docs.declaration) add('missingDeclaration', '未出示安檢申報單');
    else {
      if (!docs.declaration.signed || !docs.declaration.signature) add('unsignedDeclaration', '安檢申報單未簽名');
      if (docs.declaration.contraband !== '無') add('contraband', `申報攜帶違禁品：${docs.declaration.items}`);
    }
  }
  return violations;
}

export function evaluateDecision(person, action, day = person.day) {
  const violations = getViolations(person, day);
  const shouldApprove = violations.length === 0;
  const detainable = violations.some((violation) => ['wanted', 'contraband'].includes(violation.code));
  const correct = action === 'detain'
    ? detainable
    : action === (shouldApprove ? 'approve' : 'deny');
  return {
    correct,
    shouldApprove,
    detainable,
    violations,
    message: action === 'detain' && !detainable
      ? '此入境者不符合拘留命令，應使用一般判定'
      : violations.length === 0 ? '文件符合今日全部規定' : violations[0].message,
  };
}

export function createNewSave() {
  return { ...clone(INITIAL_SAVE), family: clone(DEFAULT_FAMILY), history: [] };
}

export function getFamilyStatus(health) {
  if (health <= 0) return '死亡';
  if (health < 28) return '病危';
  if (health < 58) return '生病';
  return '健康';
}

export function applyDailyFamily(family, care) {
  return family.map((member) => {
    if (member.health <= 0) return member;
    let health = member.health;
    health += care.food ? 4 : -17;
    if (!care.heat) health -= 11;
    if (member.health < 58) health += care.medicine ? 25 : -7;
    if (care.medicine && member.health >= 58) health += 3;
    health = Math.max(0, Math.min(100, health));
    return { ...member, health, status: getFamilyStatus(health) };
  });
}

export function getEnding(save, choice) {
  const alive = save.family.filter((m) => m.health > 0).length;
  const resistance = save.flags.resistance || 0;
  const loyalty = save.flags.loyalty || 0;
  const humanity = save.flags.humanity || 0;
  if (alive === 0) {
    return {
      id: 'empty-table', title: '空桌', kicker: '結局 01', tone: 'bad',
      text: '你守住了崗位，卻沒能守住那張餐桌。灰港仍照常運轉，只是再也沒有人替你留一盞燈。',
    };
  }
  if (choice === 'resistance') {
    return {
      id: 'dawn', title: '黎明通道', kicker: '結局 02', tone: 'good',
      text: `午夜後，一輛沒有車牌的貨車停在後門。你和 ${alive} 位家人離開灰港，車廂裡裝著你救下的人留下的名字。天快亮時，你第一次沒有回頭看那道邊界。`,
    };
  }
  if (choice === 'ticket') {
    return {
      id: 'northbound', title: '北方車票', kicker: '結局 03', tone: 'bittersweet',
      text: `你用積蓄換到幾個狹窄的座位。沒有人送行，也沒有人保證北方更好。但當灰港消失在雪裡，米洛睡著了——這已經足夠像一個開始。`,
    };
  }
  if ((save.flags.bribes || 0) >= 3 && loyalty < 4) {
    return {
      id: 'inspection', title: '內部調查', kicker: '結局 04', tone: 'bad',
      text: '你選擇留下，卻在隔天被帶進自己的審查室。每一筆賄款都有紀錄。長官隔著桌子看你的樣子，就像你看過無數人的文件。',
    };
  }
  if (loyalty >= resistance + 3 && loyalty >= 5) {
    return {
      id: 'model-clerk', title: '模範公僕', kicker: '結局 05', tone: 'state',
      text: '你獲得一枚銀色徽章與一間較暖和的辦公室。公告稱你為灰港的典範。偶爾，你仍會想起那些被你拒絕的人，但印章落下的聲音總能蓋過回憶。',
    };
  }
  if (resistance >= 4 && choice === 'stay') {
    return {
      id: 'quiet-crack', title: '無聲裂縫', kicker: '結局 06', tone: 'good',
      text: '你沒有離開。第二天，窗口前又排起長隊，但你已知道哪些名字值得冒險。高牆沒有倒下，只是從你的桌面開始，多了一道無聲的裂縫。',
    };
  }
  if (humanity >= 6) {
    return {
      id: 'human-line', title: '人的那一側', kicker: '結局 07', tone: 'bittersweet',
      text: '你仍留在灰港，薪水不多，徽章也從未輪到你。但有些人因你的決定活了下來。他們不知道你的名字，只記得那扇窗曾經打開過。',
    };
  }
  return {
    id: 'greyline', title: '灰線依然', kicker: '結局 08', tone: 'state',
    text: '戰役結束了，工作沒有。你收起印章、付清帳單，明天仍會在同一時間拉開窗板。邊境沒有改變，但你已經不再是第一天坐在這裡的人。',
  };
}

export function campaignProgress(save) {
  return Math.min(100, Math.round(((save.day - 1) / CAMPAIGN_DAYS) * 100));
}

export { DAYS, DOC_LABELS };
