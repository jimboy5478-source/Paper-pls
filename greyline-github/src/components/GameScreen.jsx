import React from 'react';
import {
  BookOpen, Check, ChevronRight, CircleDollarSign, Clock3, Coins, FileCheck2,
  Home, Pause, Play, ScanSearch, Settings2, ShieldAlert, Stamp, Volume2, VolumeX, XCircle,
} from 'lucide-react';
import { getActiveRules, getDayConfig, RULES } from '../game/data.js';
import Portrait from './Portrait.jsx';
import Documents from './Documents.jsx';
import TopDownCheckpoint from './TopDownCheckpoint.jsx';

export default function GameScreen(props) {
  const {
    save, current, currentIndex, queueLength, elapsed, duration, closing, dayStats,
    inspectMode, selected, mismatches, compareMessage, onInspect, onToggleInspect,
    onDecision, resolution, bribeAccepted, onAcceptBribe, onOpenRules, onExit,
    paused, onTogglePause, sound, onToggleSound, onOpenSettings,
    supplementalDocs, deskScale, bookOpen, onCloseBook, transcriptProps, lastMismatch,
  } = props;
  const config = getDayConfig(save.day);
  const active = getActiveRules(save.day);
  const totalMinutes = 360 + Math.round((elapsed / duration) * 720);
  const hours = Math.min(18, Math.floor(totalMinutes / 60));
  const minutes = totalMinutes % 60;
  const clock = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const portraitField = () => {
    if (!inspectMode) return;
    onInspect({ uid: 'booth:photo', docId: 'booth', key: 'photo', value: String(current.appearanceId), label: '本人照片' });
  };

  return <main className="game-shell redesigned-game">
    <header className="game-topbar">
      <div className="mini-brand"><div className="mini-emblem">G7</div><div><b>灰線</b><span>GREYLINE</span></div></div>
      <div className="shift-title"><span>{config.chapter}</span><b>第 {save.day} 日・{config.title}</b></div>
      <div className="top-stat clock-stat"><Clock3 size={17} /><div><span>值勤時間</span><b className={closing ? 'closing' : ''}>{clock}{closing ? '・最後一位' : ''}</b></div></div>
      <div className="top-stat"><CircleDollarSign size={17} /><div><span>目前存款</span><b>{save.money} 克朗</b></div></div>
      <div className="top-stat processed-stat"><FileCheck2 size={17} /><div><span>今日進度</span><b>{dayStats.processed} / {queueLength} 人</b></div></div>
      <div className="top-actions">
        <button className={`top-action ${bookOpen ? 'active' : ''}`} onClick={onOpenRules} title="桌面手冊 (R)"><BookOpen size={18} /><span>手冊</span></button>
        <button className="top-action" onClick={onTogglePause} title="暫停 (Esc)">{paused ? <Play size={18} /> : <Pause size={18} />}<span>{paused ? '繼續' : '暫停'}</span></button>
        <button className="top-action icon-only" onClick={onOpenSettings} title="顯示與操作設定"><Settings2 size={18} /></button>
        <button className="top-action icon-only" onClick={onToggleSound} title="聲音開關">{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button className="top-action icon-only" onClick={onExit} title="返回標題"><Home size={18} /></button>
      </div>
      <div className="shift-time-track"><span style={{ width: `${Math.min(100, elapsed / duration * 100)}%` }} /></div>
    </header>

    <div className="game-grid">
      <section className="booth-panel game-panel">
        <div className="panel-caption"><span>邊境站即時監視</span><b>隊列 {String(currentIndex + 1).padStart(2, '0')} / {String(queueLength).padStart(2, '0')}</b></div>
        <TopDownCheckpoint current={current} currentIndex={currentIndex} queueLength={queueLength} weather={config.weather} resolution={resolution} />
        <div className="booth-window-label"><span>窗口 07・正面影像</span><b>{resolution ? '申請人離站中' : '申請人入站'}</b></div>
        <div className={`booth-scene redesigned-booth ${resolution ? 'applicant-leaving' : 'applicant-entering'}`}>
          <div className="booth-sign">灰港檢查站 <span>ENTRY</span></div>
          <div className="booth-lamp"><i /><i /><i /></div>
          <div className="booth-wall-details"><i /><i /><i /></div>
          <button key={current.id} className={`booth-portrait-button ${inspectMode ? 'inspectable' : ''} ${selected?.uid === 'booth:photo' ? 'selected' : ''} ${mismatches.has('booth:photo') ? 'mismatch' : ''}`} onClick={portraitField} title={inspectMode ? '比對本人照片' : '窗口前的入境者'}>
            <Portrait seed={current.appearanceId} sex={current.sex} className="booth-portrait" label="窗口前的入境者" />
          </button>
          {!resolution && <div key={`handoff-${current.id}`} className="handoff-arm" aria-hidden="true"><i /><b /><span /><em /></div>}
          {resolution?.action === 'detain' && <div className="detain-guards"><i /><i /><span>安全局人員進場</span></div>}
          <div className="window-rail" /><div className="window-slot"><span /> 文件遞入處 <span /></div>
        </div>
        <div className="booth-footer"><span>對話與口供記錄在桌面</span><div className="queue-dots">{Array.from({ length: queueLength }).map((_, i) => <i key={i} className={i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''} />)}</div></div>
      </section>

      <section className="desk-panel game-panel">
        <Documents
          person={current} supplementalDocs={supplementalDocs} {...{ inspectMode, selected, mismatches, onInspect, resolution, deskScale, bookOpen, onCloseBook, transcriptProps }}
          onOpenBook={onOpenRules}
        />
        {paused && !resolution && <div className="pause-overlay"><Pause size={32} /><h3>值勤暫停</h3><p>時鐘已停止。按 Esc 或下方按鈕繼續。</p><button className="primary-button compact" onClick={onTogglePause}><Play size={16} /> 繼續值勤</button></div>}
      </section>

      <aside className="control-panel game-panel redesigned-controls">
        <section className="today-directive">
          <div className="panel-caption"><span>窗口操作</span><b>{config.date}</b></div>
          <div className="desk-instruction"><span>01</span><p>從收件槽拖出文件</p><span>02</span><p>比對文件與對話口供</p><span>03</span><p>蓋章或執行拘留</p></div>
          <button className="text-button" onClick={onOpenRules}>翻閱桌面手冊 <ChevronRight size={14} /></button>
        </section>
        <section className="inspection-controls">
          <button className={`inspect-button ${inspectMode ? 'active' : ''}`} onClick={onToggleInspect}><ScanSearch size={19} /><span>{inspectMode ? '離開比對模式' : '交互比對'}</span><kbd>Q</kbd></button>
          <p className={compareMessage?.type || ''}>{compareMessage?.text || (selected ? `已選「${selected.label}」，請選另一個同類欄位。` : '選擇兩個文件欄位，或文件與對話紙上的句子。')}</p>
          {lastMismatch && <div className="interrogate-ready"><ShieldAlert size={14} /><span>已發現矛盾，可到對話紙盤問。</span></div>}
        </section>
        {current.bribe > 0 && !resolution && <button className={`bribe-button ${bribeAccepted ? 'accepted' : ''}`} onClick={onAcceptBribe} disabled={bribeAccepted}>
          <Coins size={17} /><span>{bribeAccepted ? `已收下 ${current.bribe} 克朗` : `收下桌上的 ${current.bribe} 克朗`}</span><small>{bribeAccepted ? '這個決定會留下紀錄' : '額外收入・影響結局'}</small>
        </button>}
        <section className="stamp-controls">
          <div className="section-label"><span>最終判定</span><b>印章已就位</b></div>
          <button className="stamp-button approve" disabled={Boolean(resolution) || paused} onClick={() => onDecision('approve')}><span className="stamp-icon"><Stamp size={22} /></span><span><b>核准入境</b><small>APPROVE</small></span><kbd>A</kbd></button>
          <button className="stamp-button deny" disabled={Boolean(resolution) || paused} onClick={() => onDecision('deny')}><span className="stamp-icon"><XCircle size={22} /></span><span><b>拒絕入境</b><small>DENY</small></span><kbd>D</kbd></button>
          {save.day >= 9 && <button className="stamp-button detain" disabled={Boolean(resolution) || paused} onClick={() => onDecision('detain')}><span className="stamp-icon"><ShieldAlert size={21} /></span><span><b>拘留候審</b><small>通緝犯與違禁品</small></span></button>}
        </section>
        <section className="active-rules-panel">
          <div className="section-label"><span>今日新增</span><button onClick={onOpenRules}>全部 {active.length} 項</button></div>
          <div className="compact-rules">{config.add.map((key) => <div className="new" key={key}><span>{RULES[key].icon}</span><p>{RULES[key].short}</p></div>)}</div>
        </section>
        <section className="shift-score"><div><span>正確</span><b>{dayStats.correct}</b></div><div><span>錯誤</span><b className={dayStats.mistakes > 0 ? 'red' : ''}>{dayStats.mistakes}</b></div><div><span>額外收入</span><b>{dayStats.extra}</b></div></section>
      </aside>
    </div>
    <footer className="game-statusbar"><span><i className="status-light" /> 第七檢查站系統正常</span><span>收件槽 → 工作區 → 比對 → 判定</span><span>手冊與對話紙均可拖動</span><span>每處理一人 +5 克朗</span></footer>
  </main>;
}
