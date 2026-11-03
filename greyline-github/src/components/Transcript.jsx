import React, { useEffect, useRef } from 'react';
import { Fingerprint, MessageSquareWarning, ScrollText } from 'lucide-react';

const TOPICS = [
  ['purpose', '問目的'], ['duration', '問停留'], ['identity', '問身分'],
  ['work', '問雇主'], ['health', '問疫苗'], ['origin', '問來歷'], ['belongings', '問行李'],
];

export default function Transcript({
  person, conversation, inspectMode, selected, mismatches, onInspect, onAsk, askedTopics,
  lastMismatch, onInterrogate, fingerprintOffer, onFingerprint, fingerprintCreated,
}) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversation.length]);
  const availableTopics = TOPICS.filter(([topic]) => {
    if (topic === 'work') return person.day >= 5 && person.purpose === '工作';
    if (topic === 'health') return person.day >= 7;
    if (topic === 'origin') return person.day >= 8;
    if (topic === 'belongings') return person.day >= 15;
    return true;
  });
  const selectLine = (item) => {
    if (!inspectMode || !item.field) return;
    onInspect({
      uid: `transcript:${item.id}`,
      docId: 'transcript',
      key: item.field.key,
      value: String(item.field.value),
      label: item.field.label,
    });
  };
  return <div className="transcript-paper">
    <div className="transcript-header" data-drag-handle><div><ScrollText size={14} /><span>窗口對話紀錄</span></div><b>FORM B-07</b></div>
    <div className="transcript-meta"><span>申請人 #{String(person.index + 1).padStart(3, '0')}</span><span>1994.11.{String(person.day).padStart(2, '0')}</span></div>
    <div className="transcript-question-bar">
      {availableTopics.map(([topic, label]) => <button key={topic} disabled={askedTopics.has(topic)} onClick={() => onAsk(topic)}>{askedTopics.has(topic) ? '✓ ' : ''}{label}</button>)}
    </div>
    <div className="transcript-lines" ref={scrollRef}>
      {conversation.map((item) => {
        const uid = `transcript:${item.id}`;
        const inspectable = Boolean(item.field);
        return <div
          key={item.id}
          className={`transcript-line ${item.speaker} ${item.interrogation ? 'interrogation' : ''} ${inspectable && inspectMode ? 'inspectable' : ''} ${selected?.uid === uid ? 'selected' : ''} ${mismatches.has(uid) ? 'mismatch' : ''}`}
          onClick={() => selectLine(item)}
          role={inspectable && inspectMode ? 'button' : undefined}
          tabIndex={inspectable && inspectMode ? 0 : undefined}
          title={inspectable ? (inspectMode ? `比對：${item.field.label}` : '此句含有可比對資料') : undefined}
        >
          <span className="speaker-label">{item.speaker === 'officer' ? '邊境官' : '入境者'}</span>
          <p>{item.text}</p>
          {item.field && <small>可比對・{item.field.label}</small>}
        </div>;
      })}
    </div>
    {lastMismatch && <button className="interrogate-button" onClick={onInterrogate}><MessageSquareWarning size={15} /><span>盤問「{lastMismatch.label}」矛盾</span></button>}
    {fingerprintOffer && !fingerprintCreated && <button className="fingerprint-button" onClick={onFingerprint}><Fingerprint size={15} /> 採集指紋並調閱中央紀錄</button>}
    <div className="transcript-footer"><span>記錄員：VD-07</span><span>第 {conversation.length} 句</span></div>
  </div>;
}
