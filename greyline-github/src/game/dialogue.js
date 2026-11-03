const PERSONALITIES = ['沉穩', '疲憊', '急躁', '友善', '緊張', '閃爍'];

const pick = (seed, list, offset = 0) => list[Math.abs(seed + offset * 17) % list.length];
const line = (speaker, text, field = null, extra = {}) => ({
  id: `${speaker}-${Math.random().toString(36).slice(2, 9)}`,
  speaker,
  text,
  field,
  ...extra,
});
const fact = (key, value, label) => ({ key, value: String(value), label });

export function getPersonality(person) {
  if (person.specialKey && ['bribe', 'official', 'diplomat'].includes(person.specialKey)) return '閃爍';
  if (person.specialKey && ['refugee', 'doctor', 'farewell'].includes(person.specialKey)) return '疲憊';
  return PERSONALITIES[person.appearanceId % PERSONALITIES.length];
}

const PURPOSE_LINES = {
  觀光: [
    '我想看看灰港的舊城，只是單純觀光。',
    '旅行手冊說這裡的北塔值得一看，所以我來觀光。',
    '我排了幾天假，入境目的就是觀光。',
    '我只是旅客，打算看看城市，不會工作。',
  ],
  探親: [
    '我來探望住在城裡的親人，目的是探親。',
    '家裡有人住在灰港，我這次只為探親。',
    '我來看家人，沒有其他入境目的。',
    '這趟是私人探親行程，文件上應該也一樣。',
  ],
  工作: [
    '我已經找到工作，這次入境就是為了工作。',
    '雇主在城裡等我，我來工作，不是旅遊。',
    '我的入境目的是工作，合約已經談好了。',
    '我來履行工作合約，希望文件都齊了。',
  ],
  過境: [
    '灰港不是目的地，我只是過境。',
    '我會從另一個口岸離開，這裡只是過境。',
    '我來轉車，入境目的只有過境。',
    '我不會久留，只是經過維德拉。',
  ],
  採訪: [
    '我是記者，這次入境是為了採訪。',
    '我來採訪灰港正在發生的事，這是工作的一部分。',
    '我的目的是新聞採訪，不是觀光。',
    '媒體機構派我來採訪，資料都在文件裡。',
  ],
  外交: [
    '我代表外交使節團，入境目的是外交。',
    '這是官方行程，我以外交身分入境。',
    '我來參加代表團會議，目的是外交。',
    '我的派遣單位可以證明，這是外交任務。',
  ],
  返家: [
    '我是本國公民，這次只是回家。',
    '我家就在灰港，不需要旅行理由。',
    '我回自己的住所，目的就是返家。',
  ],
};

const DURATION_LINES = [
  '我預計停留 {days} 天，行程已經安排好了。',
  '這次會待 {days} 天，不會多留。',
  '停留時間是 {days} 天，離境車票也照這個日期買。',
  '{days} 天。這點我記得很清楚。',
  '總共 {days} 天，和許可上的數字應該相同。',
  '我只打算待 {days} 天，時間一到就離開。',
];

const GREETINGS = {
  沉穩: ['晚安。我們按程序來吧。', '文件我已經整理好了。', '你好，檢查官。'],
  疲憊: ['我排了一整夜……總算輪到我了。', '可以快一點嗎？我已經站很久了。', '抱歉，我有點累，但文件都在。'],
  急躁: ['總算。後面的人還一直往前擠。', '我希望不會再被要求補什麼紙。', '直接說你需要什麼吧。'],
  友善: ['你好，今天天氣真糟，不是嗎？', '辛苦了。希望我的文件能讓你省點時間。', '晚安，檢查官。'],
  緊張: ['我……我第一次經過這個口岸。', '如果少了什麼，請直接告訴我。', '我不太懂流程，請多包涵。'],
  閃爍: ['我想這不會花太多時間。', '你看起來很忙，我們可以簡單一點。', '應該只是例行檢查吧？'],
};

export function createConversation(person) {
  const personality = getPersonality(person);
  const seed = person.appearanceId;
  const lines = [
    line('officer', '下一位。請把文件放入收件槽。'),
    line('entrant', person.special?.dialogue || pick(seed, GREETINGS[personality], 1)),
    line('entrant', pick(seed, PURPOSE_LINES[person.purpose] || PURPOSE_LINES.返家, 2), fact('purpose', person.purpose, '口述目的')),
  ];
  if (person.nationality !== '維德拉') {
    lines.push(line('entrant', pick(seed, DURATION_LINES, 3).replace('{days}', person.days), fact('days', `${person.days} 天`, '口述停留')));
  } else {
    lines.push(line('entrant', pick(seed, [
      '我的東西不多，只想快點回家。',
      '這次回來後，我暫時不會再出境。',
      '家裡還有人在等我。',
    ], 4)));
  }
  if (person.injectedViolation && ['閃爍', '緊張'].includes(personality)) {
    lines.push(line('entrant', pick(seed, [
      '有問題嗎？我覺得這些文件看起來很好。',
      '你還需要什麼？我不希望耽誤後面的人。',
      '我回答得夠清楚了嗎？',
    ], 5)));
  }
  return lines;
}

export function askPerson(person, topic) {
  const seed = person.appearanceId;
  const docs = person.documents;
  const questions = {
    purpose: '再說一次，你入境的目的是什麼？',
    duration: '你打算在境內停留多久？',
    identity: '報出你的姓名與護照號碼。',
    work: '你的雇主是誰？工作證明在哪裡？',
    health: '你何時接種灰熱病疫苗？',
    belongings: '行李裡有沒有武器、藥品或其他申報物？',
    origin: '你從哪裡來？護照在哪裡簽發？',
  };
  let response;
  let field = null;
  const additionalLines = [];
  if (topic === 'purpose') {
    response = pick(seed, [
      `我已經說過了，是${person.purpose}。這就是答案。`,
      `我的目的只有${person.purpose}，你可以再核對一次。`,
      `為什麼要重問？我來${person.purpose}。`,
    ], 1);
    field = fact('purpose', person.purpose, '口述目的');
  } else if (topic === 'duration') {
    response = person.nationality === '維德拉'
      ? '我回本國住所，沒有預定離境日期。'
      : pick(seed, [
        `${person.days} 天。除非發生意外，否則不會改變。`,
        `我會停留 ${person.days} 天，這是最後的答案。`,
        `行程表寫得很清楚，就是 ${person.days} 天。`,
      ], 2);
    if (person.nationality !== '維德拉') field = fact('days', `${person.days} 天`, '口述停留');
  } else if (topic === 'identity') {
    response = pick(seed, [
      `我的名字是 ${person.name}。`,
      `我叫 ${person.name}，請照護照拼字記錄。`,
      `姓名是 ${person.name}。`,
    ], 3);
    field = fact('name', person.name, '口述姓名');
    additionalLines.push(line('entrant', pick(seed, [
      `護照號碼是 ${person.passportNo}。`,
      `號碼則是 ${person.passportNo}，請別抄錯。`,
      `我的護照號碼為 ${person.passportNo}。`,
    ], 6), fact('passportNo', person.passportNo, '口述護照號碼')));
  } else if (topic === 'work') {
    const employer = docs.work?.employer;
    response = person.purpose !== '工作'
      ? `我不是來工作的，我的目的是${person.purpose}。`
      : employer
        ? pick(seed, [`雇主是${employer}，工作證就在文件裡。`, `${employer}錄用我，合約和工作證都帶了。`], 4)
        : pick(seed, ['雇主說證明可以抵達後再補……我以為他們已經處理好了。', '我有工作，但那份藍色工作證好像不在袋子裡。'], 4);
    if (employer) field = fact('employer', employer, '口述雇主');
  } else if (topic === 'health') {
    response = docs.vaccine
      ? `我接種的是 ${docs.vaccine.vaccine} 疫苗。`
      : '我記得打過疫苗，但證明可能放在另一個袋子。';
    if (docs.vaccine) {
      field = fact('vaccine', docs.vaccine.vaccine, '口述疫苗');
      additionalLines.push(line('entrant', `接種日期是 ${docs.vaccine.date}，證明上也有。`, fact('date', docs.vaccine.date, '口述接種日期')));
    }
  } else if (topic === 'belongings') {
    const declaration = docs.declaration;
    response = declaration
      ? declaration.contraband === '無'
        ? '只有衣物和私人用品，沒有需要申報的危險物。'
        : `我申報的是${declaration.items}。我以為如實寫出來就可以帶。`
      : '我沒有看見申報單，所以不知道要填什麼。行李裡沒有危險物。';
    if (declaration) {
      field = fact('contraband', declaration.contraband, '口述違禁品');
      if (declaration.contraband !== '無') additionalLines.push(line('entrant', `申報品項是${declaration.items}，我沒有藏起來。`, fact('items', declaration.items, '口述申報品項')));
    }
  } else if (topic === 'origin') {
    response = `我從${person.nationality}過來。`;
    field = fact('nationality', person.nationality, '口述國籍');
    additionalLines.push(line('entrant', `這本護照是在${docs.passport.issuer}簽發的。`, fact('issuer', docs.passport.issuer, '口述簽發城市')));
  } else {
    response = '我不知道你還想問什麼。';
  }
  return [line('officer', questions[topic] || '請再說明一次。'), line('entrant', response, field), ...additionalLines];
}

export function interrogatePerson(person, mismatch) {
  const key = mismatch.key;
  const personality = getPersonality(person);
  const questions = {
    name: '這兩處姓名並不相同。哪一個才是你的真名？',
    passportNo: '護照號碼對不起來。你怎麼解釋？',
    purpose: '你的口述目的與許可內容不同。真正目的是什麼？',
    days: '你說的停留天數與文件不同。到底會待多久？',
    photo: '照片與你本人的特徵不一致。這真的是你的護照嗎？',
    employer: '雇主名稱與工作證不同。你到底受雇於誰？',
    vaccine: '疫苗資料與證明不同。你實際接種的是哪一種？',
    contraband: '你的說法與申報內容不同。行李裡到底有什麼？',
    issuer: '簽發城市資料不一致。這本護照從哪裡取得？',
    nationality: '國籍資料前後不同。你持有哪一國護照？',
    expiry: '這兩個有效期限不同。哪一個日期才正確？',
    signature: '簽名資料不一致。這是你親自簽的嗎？',
  };
  const responses = {
    name: [
      '其中一份使用的是舊姓……我沒有想到這也算問題。',
      '那是翻譯時寫錯了。兩個名字其實都是我。',
      '我不知道為什麼不同，文件都是仲介交給我的。',
    ],
    passportNo: [
      '也許是印刷瑕疵，最後一碼本來就很模糊。',
      '我抄的時候可能看錯了，但護照本身是真的。',
      '號碼不一樣嗎？我沒有注意，真的沒有。',
    ],
    purpose: [
      '許可上的目的寫錯了，我剛才說的才是真的。',
      '申請時行程還沒確定，後來才改變目的。',
      '觀光、探親或工作有那麼大的差別嗎？我只是想進去。',
    ],
    days: [
      '我可能會提早離開，所以口供與許可才會不同。',
      '我記錯天數了，但這應該不是故意欺騙。',
      '車票還沒買，我只知道自己大概會待多久。',
    ],
    photo: [
      '那是很多年前拍的照片，人總會改變。',
      '我後來剃了鬍子，也換了髮型，但的確是我。',
      '照片本來就不是很清楚，你不能只憑這個懷疑我。',
    ],
    employer: ['公司最近改名了，舊文件還沒換。', '那是承包商的名稱，真正雇主是另一間。', '我只和仲介談過，不確定正式名稱。'],
    vaccine: ['我只知道打了針，沒有問醫生疫苗名稱。', '診所拿錯證明了嗎？我真的有接種。', '日期也許是補登的，但疫苗是真的。'],
    contraband: ['那些是私人用品，我不知道也算違禁品。', '我忘記行李裡還有那個東西。', '我如實申報了，為什麼還要盤問？'],
    issuer: ['護照是家人替我申請的，我不知道城市有問題。', '那個辦公室已經搬走了，所以名單上找不到。', '仲介說這個簽發地比較快，我沒有懷疑。'],
    nationality: ['我有雙重國籍，才會把資料說混。', '出生地與國籍不一樣，我一直以為可以這樣填。', '你應該以護照為準，不是我剛才的話。'],
    expiry: ['我把年份看錯了，以為還有很長時間。', '其中一張是舊文件，我忘記拿出來。', '日期都是承辦人員寫的，我不清楚。'],
    signature: ['我可能匆忙中簽錯了位置。', '有人替我填表，但內容是我同意的。', '只是忘了簽名，我現在可以補。'],
  };
  let response = pick(person.appearanceId, responses[key] || [
    '我不知道為什麼會不一致，但事情不是你想的那樣。',
    '那只是文書錯誤，沒有必要為難我。',
    '我已經解釋過了，請相信我的說法。',
  ], 5);
  if (personality === '閃爍') {
    response = pick(person.appearanceId, [
      response,
      '你一定要在這裡為難一個旅客嗎？也許我們能用別的方式處理。',
      '文件是我買……我是說，是我請人代辦的。細節我不清楚。',
    ], 9);
  }
  return {
    lines: [line('officer', questions[key] || `關於「${mismatch.label}」，資料有矛盾。請解釋。`, null, { interrogation: true }), line('entrant', response, null, { interrogation: true })],
    canFingerprint: key === 'photo' && person.day >= 3,
  };
}

export function createFingerprintDocument(person) {
  const matches = person.documents.passport.photoId === person.appearanceId;
  return {
    id: `${person.id}-fingerprint`,
    type: 'fingerprint',
    label: '指紋複核單',
    name: person.name,
    passportNo: person.passportNo,
    result: matches ? '相符' : '不相符',
    sampleSeed: person.appearanceId,
    recordSeed: person.documents.passport.photoId,
  };
}
