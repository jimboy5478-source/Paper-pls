import React, { useState } from 'react';
import { BookOpen, Building2, FileWarning, Info, X } from 'lucide-react';
import { COUNTRIES, getActiveRules, getDayConfig, getWantedList, RULES } from '../game/data.js';

export default function Rulebook({ day, onClose, initialTab = 'rules' }) {
  const [tab, setTab] = useState(initialTab);
  const config = getDayConfig(day);
  const active = getActiveRules(day);
  const wanted = getWantedList(day);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="邊境值勤手冊" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rulebook-modal">
        <div className="rulebook-binding" />
        <header className="rulebook-header">
          <div><span className="eyebrow">維德拉共和國・邊境管理局</span><h2>值勤手冊</h2></div>
          <div className="handbook-date">生效日期<br /><b>{config.date}</b></div>
          <button className="icon-button dark" onClick={onClose} aria-label="關閉手冊"><X size={20} /></button>
        </header>
        <nav className="rulebook-tabs">
          <button className={tab === 'rules' ? 'active' : ''} onClick={() => setTab('rules')}><BookOpen size={16} /> 現行規定 <span>{active.length}</span></button>
          <button className={tab === 'countries' ? 'active' : ''} onClick={() => setTab('countries')}><Building2 size={16} /> 國家資料</button>
          <button className={tab === 'wanted' ? 'active' : ''} onClick={() => setTab('wanted')}><FileWarning size={16} /> 通緝公告</button>
          <button className={tab === 'basics' ? 'active' : ''} onClick={() => setTab('basics')}><Info size={16} /> 操作方式</button>
        </nav>
        <div className="rulebook-pages">
          {tab === 'rules' && (
            <div className="rules-page">
              <div className="paper-heading"><span>第七檢查站</span><h3>現行入境規定</h3><p>以下規定逐日累積，舊規定仍然有效。</p></div>
              <div className="rules-list-full">
                {active.map((key) => {
                  const rule = RULES[key];
                  const isNew = config.add.includes(key);
                  return <article className={`rule-entry ${isNew ? 'new' : ''}`} key={key}>
                    <div className="rule-index">{rule.icon}</div>
                    <div><h4>{rule.title} {isNew && <span>今日新增</span>}</h4><p>{rule.detail}</p></div>
                  </article>;
                })}
              </div>
              <div className="rulebook-footer">錯誤判定前兩次僅警告，第三次起每次扣薪 10 克朗。</div>
            </div>
          )}
          {tab === 'countries' && (
            <div className="countries-page">
              <div className="paper-heading"><span>內政部附件 8-B</span><h3>國家與認可簽發城市</h3><p>只有下列城市簽發的護照獲得承認。</p></div>
              <div className="country-grid">
                {Object.entries(COUNTRIES).map(([name, country]) => <article className="country-entry" key={name}>
                  <div className="country-passport" style={{ background: country.color }}><b>{country.code}</b><span>PASSPORT</span></div>
                  <div><h4>{country.name}</h4><p>簽發代碼：{country.code}</p><ul>{country.issuers.map((city) => <li key={city}>{city}</li>)}</ul></div>
                </article>)}
              </div>
              <div className="country-notes"><b>補充命令</b><p>紅砂區：自 11 月 6 日起停止入境。</p><p>塞恩籍：自 11 月 12 日起停止入境（外交人員除外）。</p><p>停留上限：自 11 月 13 日起，觀光 14 天、過境 3 天。</p></div>
            </div>
          )}
          {tab === 'wanted' && (
            <div className="wanted-page">
              <div className="paper-heading"><span>安全局・機密等級 C</span><h3>邊境通緝公告</h3><p>姓名或護照號碼任一相符，即須拒絕入境。</p></div>
              {wanted.length ? <div className="wanted-list">{wanted.map((person, i) => <article className="wanted-card" key={person.passportNo}>
                <div className="wanted-number">0{i + 1}</div><span className="wanted-label">通緝 / WANTED</span>
                <h4>{person.name}</h4><div className="wanted-passport">{person.passportNo}</div><p>{person.note}</p>
                <div className="wanted-stamp">拒絕入境</div>
              </article>)}</div> : <div className="empty-notice">目前沒有生效中的通緝公告。<br />此頁將於 11 月 9 日啟用。</div>}
              <p className="classified-note">不得向入境者透露公告內容。違者依國家安全法辦理。</p>
            </div>
          )}
          {tab === 'basics' && (
            <div className="basics-page">
              <div className="paper-heading"><span>新進人員訓練</span><h3>窗口操作方式</h3><p>你的決定會影響薪水、家人與故事走向。</p></div>
              <div className="tutorial-grid">
                <article><b>01</b><h4>取出文件</h4><p>入境者會把文件遞入收件槽。請逐一拖到工作桌，點擊文件可置頂；手冊、公告與對話紙也能整理。</p></article>
                <article><b>02</b><h4>比對文件與口供</h4><p>按 <kbd>Q</kbd> 後點擊兩個同類欄位，也可選擇對話紙上的句子。姓名、目的、天數與照片都能交叉核對。</p></article>
                <article><b>03</b><h4>盤問與複核</h4><p>發現矛盾後，對話紙會出現盤問按鈕。照片爭議可採集指紋；通緝犯與違禁品持有人可執行拘留。</p></article>
                <article><b>04</b><h4>桌面手冊</h4><p>按 <kbd>R</kbd> 翻開桌面手冊，拖到文件旁邊一起查看。桌面手冊展開時，值勤時鐘仍會繼續。</p></article>
                <article><b>05</b><h4>判定與薪水</h4><p>按 <kbd>A</kbd> 核准、<kbd>D</kbd> 拒絕。每處理一人獲得 5 克朗，同日第三次錯誤起每次扣 10 克朗。</p></article>
                <article><b>06</b><h4>顯示與家庭</h4><p>設定可調整文字、工作台縮放與動畫。每日結束後，記得支付租金並照顧家人的食物、暖氣與藥品需求。</p></article>
              </div>
              <div className="keyboard-row"><span><kbd>Q</kbd> 比對</span><span><kbd>A</kbd> 核准</span><kbd>D</kbd><span>拒絕</span><span><kbd>R</kbd> 手冊</span><span><kbd>Esc</kbd> 暫停</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
