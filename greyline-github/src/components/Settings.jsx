import React from 'react';
import { Maximize2, RotateCcw, Settings2, Sparkles, Type, Volume2, X } from 'lucide-react';

export default function Settings({ settings, onChange, onClose }) {
  return <div className="modal-backdrop settings-backdrop" role="dialog" aria-modal="true" aria-label="遊戲設定" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="settings-modal">
      <header><div className="settings-heading-icon"><Settings2 size={22} /></div><div><span className="eyebrow">TERMINAL PREFERENCES</span><h2>顯示與操作設定</h2></div><button className="icon-button" onClick={onClose} aria-label="關閉設定"><X size={19} /></button></header>
      <div className="settings-body">
        <div className="setting-row">
          <div className="setting-icon"><Type size={20} /></div>
          <div className="setting-copy"><b>文字大小</b><span>同時調整文件、對話與介面文字，不影響戰役內容。</span></div>
          <output>{settings.textScale}%</output>
          <input aria-label="文字大小" type="range" min="90" max="140" step="5" value={settings.textScale} onChange={(e) => onChange({ textScale: Number(e.target.value) })} />
          <div className="range-labels"><span>較小</span><span>標準</span><span>較大</span></div>
        </div>
        <div className="setting-row">
          <div className="setting-icon"><Maximize2 size={20} /></div>
          <div className="setting-copy"><b>工作台縮放</b><span>調整桌面上的文件、對話紙、手冊與公告大小。</span></div>
          <output>{settings.deskScale}%</output>
          <input aria-label="工作台縮放" type="range" min="75" max="130" step="5" value={settings.deskScale} onChange={(e) => onChange({ deskScale: Number(e.target.value) })} />
          <div className="range-labels"><span>更多空間</span><span>標準</span><span>放大檢視</span></div>
        </div>
        <div className="setting-toggle-row"><div className="setting-icon"><Volume2 size={20} /></div><div><b>聲音效果</b><span>腳步、遞件、蓋章、紙張與提示音。</span></div><button className={`toggle-switch ${settings.sound ? 'on' : ''}`} role="switch" aria-checked={settings.sound} onClick={() => onChange({ sound: !settings.sound })}><i /></button></div>
        <div className="setting-toggle-row"><div className="setting-icon"><Sparkles size={20} /></div><div><b>人物與遞件動畫</b><span>關閉後會立即完成入站、離站與紙張移動。</span></div><button className={`toggle-switch ${settings.animations ? 'on' : ''}`} role="switch" aria-checked={settings.animations} onClick={() => onChange({ animations: !settings.animations })}><i /></button></div>
        <div className="settings-preview"><span>預覽</span><div className="preview-passport"><b>維德拉共和國</b><p>護照號碼 VD-104827</p><small>有效期限 1997.10.21</small></div><div className="preview-transcript"><b>入境者</b><p>「我預計停留十四天，和許可一樣。」</p></div></div>
      </div>
      <footer><button className="text-button light" onClick={() => onChange({ textScale: 100, deskScale: 100, sound: true, animations: true })}><RotateCcw size={14} /> 恢復預設值</button><button className="primary-button compact" onClick={onClose}>完成設定</button></footer>
    </section>
  </div>;
}
