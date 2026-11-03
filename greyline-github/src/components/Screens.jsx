import React from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleDollarSign, Clock3,
  Coins, FileCheck2, Flame, Heart, Home, Moon, Play, RotateCcw, Shield, Stamp,
  ThermometerSun, TrainFront, Users, Volume2, VolumeX, X, Settings2,
} from 'lucide-react';
import checkpointArt from '../assets/greyline-checkpoint.webp';
import { CAMPAIGN_DAYS, getDayConfig, NIGHT_EVENTS, RULES } from '../game/data.js';
import { getFamilyStatus } from '../game/engine.js';

export function GreylineEmblem({ large = false }) {
  return <svg className={`greyline-emblem ${large ? 'large' : ''}`} viewBox="0 0 100 112" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M50 3 91 18v37c0 27-17 45-41 54C26 100 9 82 9 55V18Z" fill="#222b26" stroke="currentColor" strokeWidth="3" />
    <path d="M50 12 81 23v31c0 21-12 36-31 45C31 90 19 75 19 54V23Z" fill="none" stroke="currentColor" strokeWidth="2" opacity=".55" />
    <path d="M31 34h38v7H31zM31 48h38v7H31zM31 62h24v7H31z" fill="currentColor" />
    <path d="M66 58h7v25h-7zM58 75h23v7H58z" fill="currentColor" />
  </svg>;
}

export function TitleScreen({ storedSave, onNew, onContinue, onManual, sound, onToggleSound, onOpenSettings }) {
  const hasSave = Boolean(storedSave);
  return <main className="title-screen">
    <div className="title-weather" /><div className="title-scanlines" />
    <header className="title-header"><div className="title-classification">維德拉共和國・第七檢查站人員終端</div><div className="title-header-actions"><button className="title-sound" onClick={onOpenSettings}><Settings2 size={17} />顯示設定</button><button className="title-sound" onClick={onToggleSound}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}{sound ? '聲音開啟' : '聲音關閉'}</button></div></header>
    <div className="title-landscape redesigned-title-art" aria-hidden="true"><img src={checkpointArt} alt="" /></div>
    <section className="title-content">
      <div className="title-emblem-wrap"><GreylineEmblem large /><span>灰港邊境管理局</span></div>
      <div className="title-kicker"><span /> 原創敘事審查遊戲 <span /></div>
      <h1><span>灰線</span><small>GREYLINE</small></h1>
      <h2>邊境檢查官</h2>
      <p className="title-tagline">每一份文件，都是一個人生。</p>
      <div className="title-menu">
        {hasSave && <button className="menu-button continue" onClick={onContinue}><span className="menu-icon"><Play size={20} /></span><span><b>{storedSave.completed ? '查看戰役結局' : `繼續第 ${storedSave.day} 日`}</b><small>{storedSave.completed ? `已解鎖：${storedSave.ending?.title}` : `${getDayConfig(storedSave.day).title}・存款 ${storedSave.money} 克朗`}</small></span><ChevronRight size={20} /></button>}
        <button className={`menu-button ${!hasSave ? 'continue' : ''}`} onClick={onNew}><span className="menu-icon"><Stamp size={20} /></span><span><b>開始新的戰役</b><small>從 1994 年 11 月 1 日開始值勤</small></span><ChevronRight size={20} /></button>
        <button className="menu-button secondary" onClick={onManual}><span className="menu-icon"><BookOpen size={20} /></span><span><b>值勤手冊與操作</b><small>了解文件比對、蓋章與家庭收支</small></span><ChevronRight size={20} /></button>
      </div>
      <div className="campaign-features"><span><b>15</b> 日完整戰役</span><i /><span><b>8</b> 種命運結局</span><i /><span>自動存檔</span></div>
    </section>
    <footer className="title-footer"><span>灰港・1994</span><span>滑鼠操作／鍵盤快捷鍵</span><span>v2.0 精密桌面版</span></footer>
  </main>;
}

export function BriefingScreen({ save, onStart, onManual, onTitle }) {
  const config = getDayConfig(save.day);
  const alive = save.family.filter((m) => m.health > 0).length;
  return <main className="briefing-screen">
    <div className="briefing-background"><div className="briefing-emblem"><GreylineEmblem /></div></div>
    <header className="briefing-top"><button className="text-button light" onClick={onTitle}><ArrowLeft size={15} /> 返回標題</button><span>邊境管理局・內部值勤通知</span><button className="text-button light" onClick={onManual}><BookOpen size={15} /> 操作手冊</button></header>
    <div className="briefing-wrap">
      <aside className="date-panel">
        <span className="eyebrow">{config.chapter}</span><div className="giant-day">{String(save.day).padStart(2, '0')}</div><h2>值勤日</h2>
        <div className="date-line"><span>日期</span><b>{config.date}</b></div><div className="date-line"><span>時間</span><b>06:00 — 18:00</b></div><div className="date-line"><span>天氣</span><b>{config.weather}</b></div><div className="date-line"><span>地點</span><b>灰港第七檢查站</b></div>
        <div className="chapter-track">{Array.from({ length: CAMPAIGN_DAYS }).map((_, i) => <i key={i} className={i + 1 < save.day ? 'done' : i + 1 === save.day ? 'current' : ''} />)}</div>
        <small>戰役進度 {save.day} / {CAMPAIGN_DAYS}</small>
      </aside>
      <section className="briefing-document">
        <div className="briefing-doc-head"><span>第 7 號命令</span><span>僅限值勤人員閱讀</span></div>
        <div className="briefing-title"><span className="eyebrow">DAILY DIRECTIVE</span><h1>{config.title}</h1><p>{config.story}</p></div>
        <div className="new-directive"><div className="directive-stamp">今日<br />命令</div><div><span>請於本次值勤中確實執行</span><h3>{config.directive}</h3></div></div>
        <div className="new-rules-grid">{config.add.map((key) => <article key={key}><span>{RULES[key].icon}</span><div><h4>{RULES[key].title}<b>新增</b></h4><p>{RULES[key].detail}</p></div></article>)}</div>
        <div className="daily-newspaper"><div className="newspaper-mast">灰港郵報 <span>THE GREYHAVEN POST</span></div><p>{config.headline}</p><small>{config.date}・晚報</small></div>
        <div className="briefing-bottom"><div className="family-mini"><Users size={18} /><span>家中 {alive} 人</span><b>存款 {save.money} 克朗</b></div><button className="primary-button" onClick={onStart}>拉開窗板，開始值勤 <ArrowRight size={18} /></button></div>
      </section>
    </div>
  </main>;
}

export function DayEndScreen({ save, report, care, setCare, nightChoice, onNightChoice, onFinalize }) {
  const config = getDayConfig(save.day);
  const event = NIGHT_EVENTS[save.day];
  const aliveMembers = save.family.filter((m) => m.health > 0);
  const sick = aliveMembers.filter((m) => m.health < 58).length;
  const foodCost = care.food ? aliveMembers.length * 5 : 0;
  const heatCost = care.heat ? (config.weather.includes('雪') ? 12 : config.weather === '冷雨' ? 10 : 8) : 0;
  const medicineCost = care.medicine ? sick * 12 : 0;
  const total = config.rent + foodCost + heatCost + medicineCost;
  const canLeave = !event || nightChoice;
  return <main className="dayend-screen">
    <div className="night-sky"><i /><i /><i /></div>
    <header className="dayend-header"><div><span className="eyebrow">SHIFT COMPLETE・{config.date}</span><h1>第 {save.day} 日值勤結束</h1></div><div className="dayend-balance"><span>目前可用</span><b>{save.money} <small>克朗</small></b></div></header>
    <div className="dayend-grid">
      <section className="shift-report paper-panel">
        <div className="paper-clip" /><div className="paper-heading"><span>第七檢查站・日結表</span><h2>值勤報告</h2></div>
        <div className="report-stats"><div><span>處理人數</span><b>{report.processed}</b></div><div><span>正確判定</span><b className="green">{report.correct}</b></div><div><span>錯誤判定</span><b className="red">{report.mistakes}</b></div></div>
        <div className="payroll-lines"><div><span>基本薪資</span><small>{report.processed} 人 × 5</small><b>+{report.gross}</b></div><div><span>額外收入</span><small>賄款與其他</small><b>+{report.extra}</b></div><div className={report.penalty ? 'deduction' : ''}><span>錯誤扣薪</span><small>前兩次錯誤免罰</small><b>−{report.penalty}</b></div><div className="payroll-total"><span>本日入帳</span><b>+{report.income} 克朗</b></div></div>
        <div className="report-notice">國家感謝你的服務。你的家人也是。</div>
      </section>

      <section className="family-ledger">
        <div className="ledger-heading"><div><span className="eyebrow">公寓 4-B・晚餐後</span><h2>家庭帳本</h2></div><Home size={25} /></div>
        <div className="family-members">{save.family.map((member) => <div className={`family-member ${member.health <= 0 ? 'dead' : member.health < 58 ? 'sick' : ''}`} key={member.id}><div className="family-avatar">{member.name.slice(0, 1)}</div><div><b>{member.name}<small>{member.relation}</small></b><div className="health-track"><i style={{ width: `${member.health}%` }} /></div></div><span>{getFamilyStatus(member.health)}</span></div>)}</div>
        <div className="care-options">
          <div className="care-row mandatory"><div className="care-icon"><Home size={18} /></div><div><b>公寓租金</b><small>每日自動扣款</small></div><span>−{config.rent}</span></div>
          <button className={`care-row ${care.food ? 'selected' : ''}`} onClick={() => setCare((c) => ({ ...c, food: !c.food }))}><div className="care-icon"><UtensilsIcon /></div><div><b>今日食物</b><small>{care.food ? '家人能吃上一頓熱食' : '不購買將損害健康'}</small></div><span>{care.food ? `−${aliveMembers.length * 5}` : '略過'}</span><i className="care-check">{care.food && <Check size={13} />}</i></button>
          <button className={`care-row ${care.heat ? 'selected' : ''}`} onClick={() => setCare((c) => ({ ...c, heat: !c.heat }))}><div className="care-icon"><Flame size={18} /></div><div><b>暖氣與燃料</b><small>{config.weather}・{care.heat ? '公寓保持溫暖' : '寒冷將損害健康'}</small></div><span>{care.heat ? `−${heatCost}` : '略過'}</span><i className="care-check">{care.heat && <Check size={13} />}</i></button>
          <button className={`care-row ${care.medicine ? 'selected' : ''}`} disabled={!sick} onClick={() => setCare((c) => ({ ...c, medicine: !c.medicine }))}><div className="care-icon"><Heart size={18} /></div><div><b>藥品與治療</b><small>{sick ? `${sick} 位家人需要治療` : '目前沒有人需要藥品'}</small></div><span>{sick && care.medicine ? `−${medicineCost}` : sick ? '略過' : '—'}</span><i className="care-check">{care.medicine && sick > 0 && <Check size={13} />}</i></button>
        </div>
      </section>

      <aside className="night-panel">
        {event ? <div className="night-event"><div className="night-event-icon"><Moon size={22} /></div><span className="eyebrow">今晚・你只能選一次</span><h2>{event.title}</h2><p>{event.text}</p><div className="night-options">{event.options.map((option) => <button key={option.id} disabled={Boolean(nightChoice) || (option.cost || 0) > save.money} className={nightChoice?.id === option.id ? 'chosen' : ''} onClick={() => onNightChoice(option)}><div><b>{option.label}</b><small>{option.detail}</small></div>{nightChoice?.id === option.id ? <Check size={18} /> : <ChevronRight size={18} />}</button>)}</div>{nightChoice && <div className="event-resolved">決定已記下：{nightChoice.label}</div>}</div> : <div className="quiet-night"><Moon size={29} /><h2>今晚沒有來訪者</h2><p>遠處偶爾傳來巡邏車的聲音。你還有一點時間，決定這個家今晚需要什麼。</p></div>}
        <div className="ledger-total"><div><span>今晚支出</span><b>−{total} 克朗</b></div><div><span>支出後餘額</span><b className={save.money - total < 0 ? 'red' : ''}>{save.money - total} 克朗</b></div>{save.money - total < 0 && <p>你將欠繳款項。負債可能影響最終命運。</p>}</div>
        <button className="primary-button full" disabled={!canLeave} onClick={() => onFinalize(total)}>{save.day === CAMPAIGN_DAYS ? '度過最後一夜' : `支付並前往第 ${save.day + 1} 日`} <ArrowRight size={18} /></button>
        {!canLeave && <small className="choose-warning">請先完成今晚的事件抉擇</small>}
      </aside>
    </div>
  </main>;
}

function UtensilsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7a3 3 0 0 0 6 0V2M6 2v20M15 2v8h6V2M18 10v12" /></svg>;
}

export function FinalChoiceScreen({ save, onChoose }) {
  const resistanceOpen = (save.flags.resistance || 0) >= 4;
  const hasTicket = Boolean(save.flags.ticket);
  const ticketOpen = hasTicket || save.money >= 90;
  return <main className="final-choice-screen">
    <div className="final-snow" /><div className="final-content"><span className="eyebrow">1994.11.15・23:47</span><h1>午夜之前</h1><p className="final-lead">遠處傳來第一聲爆炸。灰港的電燈接著熄滅。你收起印章，終於不必再替任何人判定——除了你自己。</p>
      <div className="final-status"><span><Users size={16} /> 家人 {save.family.filter((m) => m.health > 0).length} 人</span><span><Coins size={16} /> 存款 {save.money} 克朗</span><span><Shield size={16} /> 組織信任 {save.flags.resistance || 0}</span></div>
      <div className="final-options">
        <button onClick={() => onChoose('stay')}><div className="final-option-icon"><Home size={25} /></div><div><span>選擇一</span><h2>留在灰港</h2><p>鎖上家門，等這一夜過去。無論誰掌權，明天總要有人工作。</p><small>沒有條件・承擔你過去的所有決定</small></div><ArrowRight size={22} /></button>
        <button disabled={!resistanceOpen} onClick={() => onChoose('resistance')}><div className="final-option-icon"><TrainFront size={25} /></div><div><span>選擇二</span><h2>走向黎明通道</h2><p>後門響起三短一長的敲門聲。灰鴿的人來履行承諾。</p><small>{resistanceOpen ? '抵抗組織會保護你與家人撤離' : `需要組織信任 4・目前 ${save.flags.resistance || 0}`}</small></div><ArrowRight size={22} /></button>
        <button disabled={!ticketOpen} onClick={() => onChoose('ticket')}><div className="final-option-icon"><Coins size={25} /></div><div><span>選擇三</span><h2>搭上北方貨車</h2><p>地下售票員還在等。這條路不屬於任何陣營，只屬於付得起代價的人。</p><small>{hasTicket ? '已支付訂金・車位已保留' : ticketOpen ? '支付 90 克朗購買全家車票' : `需要 90 克朗或車票訂金・目前 ${save.money}`}</small></div><ArrowRight size={22} /></button>
      </div><p className="final-note">這是最後的選擇，選定後將結算你的戰役。</p>
    </div>
  </main>;
}

export function EndingScreen({ save, onRestart, onTitle }) {
  const ending = save.ending;
  const total = save.stats.correct + save.stats.mistakes;
  const accuracy = total ? Math.round(save.stats.correct / total * 100) : 0;
  const alive = save.family.filter((m) => m.health > 0).length;
  return <main className={`ending-screen tone-${ending.tone}`}>
    <div className="ending-scanlines" /><div className="ending-border"><i /><i /><i /><i /></div>
    <section className="ending-card"><GreylineEmblem /><span className="ending-kicker">{ending.kicker}・戰役完成</span><h1>{ending.title}</h1><div className="ending-rule" /><p className="ending-text">{ending.text}</p>
      <div className="ending-stats"><div><span>正確率</span><b>{accuracy}%</b></div><div><span>處理人數</span><b>{save.stats.processed}</b></div><div><span>家人幸存</span><b>{alive} / {save.family.length}</b></div><div><span>最終存款</span><b>{save.money}</b></div></div>
      <div className="legacy-tags"><span>人道 {save.flags.humanity || 0}</span><span>忠誠 {save.flags.loyalty || 0}</span><span>抵抗 {save.flags.resistance || 0}</span><span>賄賂 {save.flags.bribes || 0}</span></div>
      <div className="ending-actions"><button className="primary-button" onClick={onRestart}><RotateCcw size={17} /> 再經歷十五天</button><button className="secondary-button" onClick={onTitle}><Home size={17} /> 返回標題</button></div>
      <p className="ending-credit">《灰線：邊境檢查官》・原創敘事審查遊戲<br />感謝你在灰色地帶做出的每一個決定。</p>
    </section>
  </main>;
}
