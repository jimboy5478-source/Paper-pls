import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Fingerprint, Move, ScanSearch } from 'lucide-react';
import { COUNTRIES, getDayConfig, RULES } from '../game/data.js';
import Portrait from './Portrait.jsx';
import DeskBook from './DeskBook.jsx';
import Transcript from './Transcript.jsx';

function Field({ doc, field, label, value, children, inspectMode, selected, mismatches, onInspect, wide = false }) {
  const uid = `${doc.id || doc.type}:${field}`;
  const isSelected = selected?.uid === uid;
  const isMismatch = mismatches?.has(uid);
  const handleClick = (event) => {
    if (!inspectMode) return;
    event.stopPropagation();
    onInspect({ uid, docId: doc.id || doc.type, key: field, value: String(value ?? ''), label });
  };
  return <div
    className={`doc-field ${wide ? 'wide' : ''} ${inspectMode ? 'inspectable' : ''} ${isSelected ? 'selected' : ''} ${isMismatch ? 'mismatch' : ''}`}
    onClick={handleClick}
    role={inspectMode ? 'button' : undefined}
    tabIndex={inspectMode ? 0 : undefined}
    onKeyDown={(event) => { if (inspectMode && (event.key === 'Enter' || event.key === ' ')) handleClick(event); }}
    title={inspectMode ? `比對欄位：${label}` : undefined}
  >
    <span className="doc-label">{label}</span>
    {children || <span className="doc-value">{value}</span>}
  </div>;
}

function OfficialSeal({ type = 'blue-round', small = false }) {
  if (type === 'red-triangle') return <div className={`official-seal red-triangle ${small ? 'small' : ''}`}><span>外 交</span></div>;
  return <div className={`official-seal blue-round ${small ? 'small' : ''}`}><span>外交部<br />VD</span></div>;
}

function FingerprintPattern({ seed, label }) {
  const offset = Math.abs(seed) % 7;
  return <div className="fingerprint-pattern"><svg viewBox="0 0 90 105" aria-label={label}>
    {Array.from({ length: 9 }).map((_, i) => {
      const pad = 5 + i * 4;
      const sway = ((seed >> (i % 12)) % 5) - 2;
      return <path key={i} d={`M${45 + sway} ${4 + pad / 2} C${12 + pad} ${8 + pad} ${7 + pad} ${42 + pad} ${14 + pad} ${76 - pad / 3} C${19 + pad} ${98 - pad} ${70 - pad} ${101 - pad} ${77 - pad} ${75 - pad / 2} C${84 - pad} ${42 + pad} ${77 - pad} ${12 + pad} ${45 + sway} ${4 + pad / 2}`} fill="none" stroke="#303b39" strokeWidth="1.5" opacity={0.58 + i * .035} transform={`translate(${offset - 3} 0)`} />;
    })}
    <path d="M42 25h6v52h-6z" stroke="#303b39" strokeWidth="1" opacity=".35" />
  </svg><span>{label}</span></div>;
}

function DocumentContent({ doc, ...props }) {
  const common = { doc, ...props };
  if (doc.type === 'passport') {
    const country = COUNTRIES[doc.nationality];
    return <div className="passport-content" style={{ '--passport-color': country?.color || '#62594d' }}>
      <div className="document-watermark">{country?.code}</div>
      <div className="passport-top"><span>{country?.name}</span><b>PASSPORT</b></div>
      <div className="passport-grid">
        <Field {...common} field="photo" label="照片" value={doc.photoId}><Portrait seed={doc.photoId} sex={doc.sex} className="passport-photo" label="護照持有人照片" /></Field>
        <div className="passport-primary">
          <Field {...common} field="name" label="姓名 / NAME" value={doc.name} />
          <Field {...common} field="passportNo" label="護照號碼 / NO." value={doc.passportNo} />
          <Field {...common} field="nationality" label="國籍" value={doc.nationality} />
          <Field {...common} field="sex" label="性別" value={doc.sex} />
        </div>
      </div>
      <div className="passport-bottom">
        <Field {...common} field="dob" label="出生日期" value={doc.dob} />
        <Field {...common} field="expiry" label="有效期限" value={doc.expiry} />
        <Field {...common} field="issuer" label="簽發城市" value={doc.issuer} />
        <Field {...common} field="region" label="籍貫" value={doc.region} />
      </div>
      <div className="machine-code">P&lt;{country?.code}{doc.passportNo.replace('-', '')}&lt;&lt;{doc.name.length}1{doc.expiry.slice(2).replaceAll('.', '')}&lt;&lt;</div>
    </div>;
  }
  if (doc.type === 'permit') return <div className="permit-content paper-lines">
    <div className="document-watermark">VD</div><div className="doc-emblem">VD</div><h3>入境許可</h3><p className="doc-subtitle">ENTRY AUTHORIZATION</p><div className="doc-number">No. {doc.permitId}</div>
    <Field {...common} field="name" label="持有人" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide />
    <div className="two-fields"><Field {...common} field="purpose" label="入境目的" value={doc.purpose} /><Field {...common} field="days" label="停留天數" value={`${doc.days} 天`} /></div>
    <Field {...common} field="expiry" label="許可有效期限" value={doc.expiry} wide /><Field {...common} field="seal" label="外交部核章" value={doc.seal}><OfficialSeal type={doc.seal} /></Field>
    <p className="fine-print">持此許可者仍須遵守維德拉共和國全部邊境規定。</p>
  </div>;
  if (doc.type === 'work') return <div className="work-content"><div className="doc-stripe">勞動部・外籍工作許可</div><h3>工作證</h3><p className="doc-subtitle">LABOR PERMIT</p>
    <Field {...common} field="name" label="姓名" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide /><Field {...common} field="employer" label="核准雇主" value={doc.employer} wide /><Field {...common} field="expiry" label="有效期限" value={doc.expiry} wide /><div className="doc-barcode" /></div>;
  if (doc.type === 'vaccine') return <div className="vaccine-content"><div className="medical-cross">+</div><h3>國際防疫證明</h3><p className="doc-subtitle">灰熱病疫苗接種紀錄</p>
    <Field {...common} field="name" label="接種者" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide /><div className="two-fields"><Field {...common} field="vaccine" label="疫苗" value={doc.vaccine} /><Field {...common} field="date" label="接種日期" value={doc.date} /></div><Field {...common} field="clinic" label="接種機關" value={doc.clinic} wide /><div className="medical-stamp">衛生<br />認證</div></div>;
  if (doc.type === 'diplomatic') return <div className="diplomatic-content"><div className="diplomatic-seal">✦</div><h3>外交通行狀</h3><p className="doc-subtitle">DIPLOMATIC LAISSEZ-PASSER</p>
    <Field {...common} field="name" label="持有人" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide /><Field {...common} field="nationality" label="派遣國" value={doc.nationality} wide /><Field {...common} field="mission" label="代表單位" value={doc.mission} wide /><Field {...common} field="expiry" label="有效期限" value={doc.expiry} wide /><OfficialSeal small /></div>;
  if (doc.type === 'press') return <div className="press-content"><div className="doc-stripe">文化部・境外媒體</div><h3>新聞通行證</h3><p className="doc-subtitle">PRESS CREDENTIAL</p>
    <Field {...common} field="name" label="記者姓名" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide /><Field {...common} field="agency" label="媒體機構" value={doc.agency} wide /><Field {...common} field="expiry" label="有效期限" value={doc.expiry} wide /><div className="press-mark">PRESS</div></div>;
  if (doc.type === 'fingerprint') return <div className="fingerprint-content"><div className="doc-stripe">安全局・中央身分紀錄</div><h3>指紋複核單</h3><p className="doc-subtitle">IDENTITY VERIFICATION</p>
    <Field {...common} field="name" label="受驗人" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide />
    <div className="fingerprint-pair"><FingerprintPattern seed={doc.sampleSeed} label="窗口採集" /><FingerprintPattern seed={doc.recordSeed} label="中央紀錄" /></div>
    <div className={`fingerprint-result ${doc.result === '相符' ? 'match' : 'mismatch'}`}>複核結果：{doc.result}</div></div>;
  return <div className="declaration-content paper-lines"><div className="doc-emblem">VD</div><h3>安檢申報單</h3><p className="doc-subtitle">SECURITY DECLARATION · FORM 15-C</p>
    <Field {...common} field="name" label="申報人" value={doc.name} wide /><Field {...common} field="passportNo" label="護照號碼" value={doc.passportNo} wide />
    <Field {...common} field="contraband" label="武器／爆裂物／未申報藥品" value={doc.contraband} wide><span className={`declaration-check ${doc.contraband === '有' ? 'danger' : ''}`}>[{doc.contraband === '有' ? ' ' : '✓'}] 無　[{doc.contraband === '有' ? '✓' : ' '}] 有</span></Field>
    {doc.contraband === '有' && <Field {...common} field="items" label="品項" value={doc.items} wide />}
    <Field {...common} field="signature" label="本人簽名" value={doc.signed ? doc.signature : ''} wide><span className={`signature ${!doc.signed ? 'unsigned' : ''}`}>{doc.signed ? doc.signature : '（未簽名）'}</span></Field>
    <p className="fine-print">本人聲明以上申報屬實，並同意接受邊防人員檢查。</p></div>;
}

const DOC_SIZE = {
  passport: [282, 338], permit: [268, 348], work: [254, 296], vaccine: [260, 290],
  diplomatic: [264, 338], press: [254, 304], declaration: [280, 340], fingerprint: [282, 348],
  transcript: [338, 458], handbook: [126, 168], bulletin: [226, 202],
};

function Bulletin({ day }) {
  const config = getDayConfig(day);
  return <div className="desk-bulletin"><div className="bulletin-pin" /><span>邊境管理局・每日命令</span><h3>{config.title}</h3><p>{config.directive}</p><div className="bulletin-rules">{config.add.map((key) => <b key={key}>{RULES[key].short}</b>)}</div><small>{config.date}</small></div>;
}

export default function Documents(props) {
  const {
    person, supplementalDocs = [], inspectMode, selected, mismatches, onInspect, resolution,
    deskScale = 100, bookOpen, onOpenBook, onCloseBook, transcriptProps,
  } = props;
  const deskRef = useRef(null);
  const dragRef = useRef(null);
  const docs = [...Object.values(person.documents), ...supplementalDocs];
  const scale = deskScale / 100;
  const items = [
    ...docs.map((doc) => ({ id: doc.id, kind: 'document', doc })),
    { id: 'transcript', kind: 'transcript' }, { id: 'bulletin', kind: 'bulletin' }, { id: 'handbook', kind: 'handbook' },
  ];
  const [positions, setPositions] = useState({});
  const [order, setOrder] = useState([]);
  const [movedIds, setMovedIds] = useState(new Set());

  const itemSize = (item) => item.id === 'handbook' && bookOpen ? [548, 454] : DOC_SIZE[item.id === 'transcript' || item.id === 'bulletin' || item.id === 'handbook' ? item.id : item.doc?.type] || [260, 300];
  const defaultPosition = (item, index, width, height) => {
    if (item.kind === 'document') return { x: 18 + index * 7, y: 84 + index * 9 };
    if (item.id === 'transcript') return { x: Math.max(310, width - 365), y: Math.max(220, height - 485) };
    if (item.id === 'bulletin') return { x: Math.max(350, width - 405), y: 28 };
    if (item.id === 'handbook') return bookOpen ? { x: Math.max(20, width - 570), y: 35 } : { x: Math.max(250, width - 150), y: 35 };
    return { x: 20, y: 20 };
  };

  useLayoutEffect(() => {
    const rect = deskRef.current?.getBoundingClientRect();
    const freshPositions = Object.fromEntries(items.map((item, index) => [item.id, defaultPosition(item, index, rect?.width || 800, rect?.height || 700)]));
    setPositions(freshPositions);
    setOrder(items.map((item) => item.id));
    setMovedIds(new Set());
  }, [person.id]);

  useEffect(() => {
    const rect = deskRef.current?.getBoundingClientRect();
    setPositions((current) => {
      const next = { ...current };
      items.forEach((item, index) => { if (!next[item.id]) next[item.id] = defaultPosition(item, index, rect?.width || 800, rect?.height || 700); });
      return next;
    });
    if (bookOpen && rect) {
      setPositions((current) => ({
        ...current,
        handbook: {
          x: Math.max(8, Math.min(current.handbook?.x ?? rect.width - 570, rect.width - 548 * scale - 8)),
          y: Math.max(8, Math.min(current.handbook?.y ?? 35, rect.height - 120)),
        },
      }));
    }
    setOrder((current) => [...current.filter((id) => items.some((item) => item.id === id)), ...items.filter((item) => !current.includes(item.id)).map((item) => item.id)]);
  }, [docs.length, bookOpen, deskScale]);

  const bringFront = (id) => setOrder((current) => [...current.filter((item) => item !== id), id]);
  const onPointerDown = (event, item) => {
    if (event.button !== 0 || event.target.closest('button, input')) return;
    if (inspectMode && event.target.closest('.doc-field, .transcript-line')) return;
    if ((item.id === 'handbook' && bookOpen) || item.id === 'transcript') {
      if (!event.target.closest('[data-drag-handle]')) return;
    }
    bringFront(item.id);
    const position = positions[item.id];
    if (!position) return;
    dragRef.current = { id: item.id, startX: event.clientX, startY: event.clientY, x: position.x, y: position.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event, item) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== item.id) return;
    const rect = deskRef.current.getBoundingClientRect();
    const [w, h] = itemSize(item);
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5 && !drag.moved) {
      drag.moved = true;
      setMovedIds((current) => new Set([...current, item.id]));
    }
    const x = Math.max(-w * scale * .35, Math.min(drag.x + dx, rect.width - w * scale * .65));
    const y = Math.max(-12, Math.min(drag.y + dy, rect.height - 35));
    setPositions((current) => ({ ...current, [item.id]: { x, y } }));
  };
  const onPointerUp = (event) => {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const inboxCount = docs.filter((doc) => !movedIds.has(doc.id)).length;

  return <div className={`document-desk redesigned-desk ${inspectMode ? 'inspection-active' : ''}`} ref={deskRef} style={{ '--desk-item-scale': scale }}>
    <div className="desk-grain" /><div className="desk-inlay" />
    <div className={`incoming-tray ${inboxCount ? 'has-documents' : ''}`}><ArrowDownToLine size={18} /><div><b>收件槽</b><span>{inboxCount ? `${inboxCount} 份待取文件` : '文件已取'}</span></div><small>拖至工作區</small></div>
    <div className="desk-label"><Move size={13} /> 拖動文件、手冊與對話紙整理桌面</div>
    {inspectMode && <div className="inspection-ribbon"><ScanSearch size={14} /> 比對模式：可選擇文件欄位或對話句子</div>}
    {items.map((item, index) => {
      const position = positions[item.id] || { x: 20, y: 20 };
      const [w, h] = itemSize(item);
      const shared = {
        className: `desk-item ${item.kind === 'document' ? `document document-${item.doc.type} paper-arriving` : `${item.id}-item`} ${item.id === 'handbook' && bookOpen ? 'book-is-open' : ''}`,
        style: { width: w, height: h, left: position.x, top: position.y, zIndex: order.indexOf(item.id) + 4, '--item-index': index },
        onPointerDown: (event) => onPointerDown(event, item), onPointerMove: (event) => onPointerMove(event, item), onPointerUp, onPointerCancel: onPointerUp,
      };
      if (item.kind === 'document') return <article key={item.id} {...shared}><DocumentContent doc={item.doc} inspectMode={inspectMode} selected={selected} mismatches={mismatches} onInspect={onInspect} /></article>;
      if (item.id === 'transcript') return <article key={item.id} {...shared}><Transcript person={person} {...transcriptProps} {...{ inspectMode, selected, mismatches, onInspect }} /></article>;
      if (item.id === 'bulletin') return <article key={item.id} {...shared}><Bulletin day={person.day} /></article>;
      return <article key={item.id} {...shared}><DeskBook day={person.day} open={bookOpen} onOpen={() => { bringFront('handbook'); onOpenBook(); }} onClose={onCloseBook} /></article>;
    })}
    {resolution && <div className={`desk-stamp ${resolution.action}`}><span>{resolution.action === 'approve' ? '核准入境' : resolution.action === 'deny' ? '拒絕入境' : '拘留候審'}</span><b>灰港第七檢查站</b></div>}
    {resolution && <div className={`physical-decision-slip ${resolution.result.correct ? 'correct' : 'wrong'}`}>
      <div className="slip-teeth" /><span>{resolution.result.correct ? '窗口處理回執' : '維德拉邊境管理局・督察通知'}</span><h3>{resolution.result.correct ? '判定正確' : `判定錯誤・第 ${resolution.mistakeNumber} 次`}</h3><p>{resolution.result.correct ? (resolution.action === 'approve' ? '文件符合規定，准許入境。' : resolution.result.message) : resolution.result.message}</p><div><b>{resolution.result.correct ? '薪資 +5' : resolution.mistakeNumber > 2 ? '扣薪 −10' : '警告・暫不扣薪'}</b><small>{getDayConfig(person.day).date}</small></div>
    </div>}
  </div>;
}
