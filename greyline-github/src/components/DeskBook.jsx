import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Building2, ChevronLeft, ChevronRight, FileWarning, Info, X } from 'lucide-react';
import { COUNTRIES, getActiveRules, getDayConfig, getWantedList, RULES } from '../game/data.js';

export default function DeskBook({ day, open, onOpen, onClose }) {
  const [tab, setTab] = useState('rules');
  const [page, setPage] = useState(0);
  const config = getDayConfig(day);
  const active = getActiveRules(day);
  const wanted = getWantedList(day);
  useEffect(() => {
    if (open) {
      setTab('rules');
      setPage(Math.max(0, Math.floor((active.length - config.add.length) / 4)));
    }
  }, [day, open]);

  const pages = useMemo(() => {
    if (tab === 'rules') return Array.from({ length: Math.ceil(active.length / 4) }, (_, i) => active.slice(i * 4, i * 4 + 4));
    if (tab === 'countries') return Array.from({ length: 3 }, (_, i) => Object.entries(COUNTRIES).slice(i * 2, i * 2 + 2));
    if (tab === 'wanted') return [wanted];
    return [[]];
  }, [tab, active, wanted]);
  const currentPage = Math.min(page, Math.max(0, pages.length - 1));
  const changeTab = (value) => { setTab(value); setPage(0); };

  if (!open) return <button className="closed-handbook" onClick={onOpen} aria-label="打開桌面值勤手冊">
    <div className="book-cover-emblem">VD</div><span>邊境管理局</span><h3>值勤<br />手冊</h3><p>第七檢查站・1994</p><div className="book-cover-tabs"><i /><i /><i /></div><small><BookOpen size={12} /> 點擊翻閱</small>
  </button>;

  const rules = tab === 'rules' ? pages[currentPage] || [] : [];
  const countries = tab === 'countries' ? pages[currentPage] || [] : [];
  return <div className="open-handbook">
    <div className="desk-book-header" data-drag-handle><span><BookOpen size={13} /> 值勤手冊・{config.date}</span><button className="desk-book-close" onClick={onClose} aria-label="關閉桌面手冊"><X size={14} /></button></div>
    <nav className="desk-book-tabs">
      <button className={tab === 'rules' ? 'active' : ''} onClick={() => changeTab('rules')}><BookOpen size={12} /> 規定</button>
      <button className={tab === 'countries' ? 'active' : ''} onClick={() => changeTab('countries')}><Building2 size={12} /> 國家</button>
      <button className={tab === 'wanted' ? 'active' : ''} onClick={() => changeTab('wanted')}><FileWarning size={12} /> 通緝</button>
      <button className={tab === 'basics' ? 'active' : ''} onClick={() => changeTab('basics')}><Info size={12} /> 操作</button>
    </nav>
    <div className="desk-book-spread">
      <div className="book-spine-shadow" />
      {tab === 'rules' && <>
        <section className="book-page left">{rules.slice(0, 2).map((key) => <Rule key={key} ruleKey={key} isNew={config.add.includes(key)} />)}<PageNumber number={currentPage * 2 + 1} /></section>
        <section className="book-page right">{rules.slice(2, 4).map((key) => <Rule key={key} ruleKey={key} isNew={config.add.includes(key)} />)}{rules.length < 3 && <div className="book-empty-note">其餘頁面尚未填入新命令。</div>}<PageNumber number={currentPage * 2 + 2} /></section>
      </>}
      {tab === 'countries' && <>
        <section className="book-page left">{countries[0] && <Country entry={countries[0]} />}<PageNumber number={currentPage * 2 + 1} /></section>
        <section className="book-page right">{countries[1] && <Country entry={countries[1]} />}<div className="book-country-note">紅砂區：11 月 6 日起封鎖<br />塞恩籍：11 月 12 日起封鎖<br />外交人員依特別規定處理</div><PageNumber number={currentPage * 2 + 2} /></section>
      </>}
      {tab === 'wanted' && <>
        <section className="book-page left">{wanted[0] ? <Wanted person={wanted[0]} /> : <div className="book-empty-note">11 月 9 日前無通緝公告。</div>}<PageNumber number={1} /></section>
        <section className="book-page right">{wanted[1] ? <Wanted person={wanted[1]} /> : <div className="book-empty-note">姓名或號碼任一相符，即須拒絕。</div>}<PageNumber number={2} /></section>
      </>}
      {tab === 'basics' && <>
        <section className="book-page left"><h4>窗口操作</h4><ol className="book-help-list"><li>將收件槽內的文件拖至桌面。</li><li>按 Q 後點擊兩項同類資料。</li><li>口供與文件矛盾時可盤問。</li><li>照片爭議可進一步採集指紋。</li></ol><PageNumber number={1} /></section>
        <section className="book-page right"><h4>快捷鍵</h4><div className="book-shortcuts"><span><kbd>Q</kbd> 比對</span><span><kbd>A</kbd> 核准</span><span><kbd>D</kbd> 拒絕</span><span><kbd>R</kbd> 手冊</span><span><kbd>Esc</kbd> 暫停</span></div><p className="book-fineprint">手冊留在桌面時，時鐘仍會繼續。把文件拖到書頁旁邊即可同時查驗。</p><PageNumber number={2} /></section>
      </>}
    </div>
    <div className="desk-book-footer"><button disabled={currentPage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}><ChevronLeft size={14} /> 上一頁</button><span>{currentPage + 1} / {Math.max(1, pages.length)}</span><button disabled={currentPage >= pages.length - 1} onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))}>下一頁 <ChevronRight size={14} /></button></div>
  </div>;
}

function Rule({ ruleKey, isNew }) {
  const rule = RULES[ruleKey];
  return <article className="desk-rule"><span>{rule.icon}</span><div><h4>{rule.title}{isNew && <b>新</b>}</h4><p>{rule.detail}</p></div></article>;
}
function Country({ entry: [name, country] }) {
  return <article className="desk-country"><div className="desk-country-passport" style={{ background: country.color }}><b>{country.code}</b><span>PASSPORT</span></div><h4>{country.name}</h4><p>認可簽發城市</p><ul>{country.issuers.map((city) => <li key={city}>{city}</li>)}</ul></article>;
}
function Wanted({ person }) {
  return <article className="desk-wanted"><span>通緝 / WANTED</span><h3>{person.name}</h3><b>{person.passportNo}</b><p>{person.note}</p><i>拒絕入境</i></article>;
}
function PageNumber({ number }) { return <span className="book-page-number">— {number} —</span>; }
