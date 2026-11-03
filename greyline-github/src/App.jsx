import React, { useEffect, useRef, useState } from 'react';
import GameScreen from './components/GameScreen.jsx';
import Rulebook from './components/Rulebook.jsx';
import Settings from './components/Settings.jsx';
import {
  BriefingScreen, DayEndScreen, EndingScreen, FinalChoiceScreen, TitleScreen,
} from './components/Screens.jsx';
import { CAMPAIGN_DAYS, SAVE_KEY, SETTINGS_KEY } from './game/data.js';
import {
  applyDailyFamily, createNewSave, evaluateDecision, generateDayEntrants,
  getEnding, getFamilyStatus,
} from './game/engine.js';
import {
  askPerson, createConversation, createFingerprintDocument, interrogatePerson,
} from './game/dialogue.js';
import { playSound, setAudioEnabled } from './game/audio.js';

const DAY_DURATION = 360;
const DEFAULT_SETTINGS = { sound: true, textScale: 100, deskScale: 100, animations: true };
const freshDayStats = () => ({ processed: 0, correct: 0, mistakes: 0, extra: 0, decisions: [] });

function loadSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (parsed?.version === 1 && parsed.day >= 1 && parsed.day <= CAMPAIGN_DAYS && Array.isArray(parsed.family)) return parsed;
  } catch { /* Ignore damaged or unavailable saves. */ }
  return null;
}
function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; } catch { return DEFAULT_SETTINGS; }
}

export default function App() {
  const [storedSave, setStoredSave] = useState(loadSave);
  const [save, setSave] = useState(() => loadSave() || createNewSave());
  const [screen, setScreen] = useState('title');
  const [modal, setModal] = useState(null);
  const [settings, setSettings] = useState(loadSettings);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dayStats, setDayStats] = useState(freshDayStats);
  const [elapsed, setElapsed] = useState(0);
  const [closing, setClosing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mismatches, setMismatches] = useState(new Set());
  const [compareMessage, setCompareMessage] = useState(null);
  const [lastMismatch, setLastMismatch] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [bribeAccepted, setBribeAccepted] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [askedTopics, setAskedTopics] = useState(new Set());
  const [fingerprintOffer, setFingerprintOffer] = useState(false);
  const [supplementalDocs, setSupplementalDocs] = useState([]);
  const [report, setReport] = useState(null);
  const [care, setCare] = useState({ food: true, heat: true, medicine: true });
  const [nightChoice, setNightChoice] = useState(null);
  const closingRef = useRef(false);
  const advanceTimer = useRef(null);

  const current = queue[currentIndex];
  const sound = settings.sound;

  const persist = (value) => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(value)); } catch { /* Storage is optional. */ }
    setStoredSave(value);
  };
  const updateSettings = (patch) => setSettings((currentSettings) => ({ ...currentSettings, ...patch }));

  useEffect(() => {
    setAudioEnabled(settings.sound);
    document.documentElement.style.setProperty('--text-scale', settings.textScale / 100);
    document.documentElement.classList.toggle('reduce-motion', !settings.animations);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Optional setting. */ }
  }, [settings]);

  useEffect(() => {
    if (['briefing', 'dayEnd', 'finalChoice', 'ending'].includes(screen)) persist(save);
  }, [screen, save]);

  useEffect(() => {
    if (!current || screen !== 'playing') return;
    setConversation(createConversation(current));
    setAskedTopics(new Set());
    setLastMismatch(null);
    setFingerprintOffer(false);
    setSupplementalDocs([]);
    playSound('step');
  }, [current?.id, screen]);

  useEffect(() => {
    if (screen !== 'playing' || paused || modal || resolution || closingRef.current) return undefined;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        const next = Math.min(DAY_DURATION, value + 1);
        if (next >= DAY_DURATION) { closingRef.current = true; setClosing(true); }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen, paused, modal, resolution]);

  const clearAdvance = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  };
  useEffect(() => () => clearAdvance(), []);

  const resetInspection = () => {
    setSelected(null);
    setCompareMessage(null);
    setMismatches(new Set());
    setLastMismatch(null);
  };

  const startShift = () => {
    clearAdvance();
    setQueue(generateDayEntrants(save.day));
    setCurrentIndex(0);
    setDayStats(freshDayStats());
    setElapsed(0);
    setClosing(false);
    closingRef.current = false;
    setPaused(false);
    setInspectMode(false);
    setBookOpen(false);
    resetInspection();
    setResolution(null);
    setBribeAccepted(false);
    setNightChoice(null);
    setCare({ food: true, heat: true, medicine: true });
    setScreen('playing');
    playSound('open');
  };

  const newCampaign = (skipConfirm = false) => {
    if (!skipConfirm && storedSave && !window.confirm('開始新戰役會覆蓋目前的自動存檔。確定繼續嗎？')) return;
    clearAdvance();
    const fresh = createNewSave();
    setSave(fresh);
    persist(fresh);
    setScreen('briefing');
    setModal(null);
    playSound('open');
  };
  const continueCampaign = () => {
    const loaded = loadSave() || storedSave || createNewSave();
    setSave(loaded);
    setScreen(loaded.completed && loaded.ending ? 'ending' : 'briefing');
    playSound('open');
  };
  const returnTitle = () => {
    if (screen === 'playing' && !window.confirm('返回標題會放棄今天尚未結算的進度，確定嗎？')) return;
    clearAdvance();
    setModal(null);
    setPaused(false);
    setResolution(null);
    setScreen('title');
    setStoredSave(loadSave());
  };

  const toggleSound = () => updateSettings({ sound: !sound });
  const openRules = () => {
    if (screen === 'playing') setBookOpen((value) => !value);
    else setModal('rules');
    playSound('paper');
  };
  const openManual = () => { setModal('manual'); playSound('paper'); };

  const toggleInspect = () => {
    setInspectMode((value) => !value);
    setSelected(null);
    setCompareMessage(null);
    playSound('click');
  };

  const handleInspect = (field) => {
    if (!selected) {
      setSelected(field);
      setCompareMessage({ type: '', text: `已選「${field.label}」，請選另一個同類欄位。` });
      playSound('click');
      return;
    }
    if (selected.uid === field.uid) { setSelected(null); setCompareMessage(null); return; }
    if (selected.key !== field.key) {
      setSelected(field);
      setCompareMessage({ type: 'warning', text: `「${selected.label}」與「${field.label}」不是同類欄位，無法直接比對。` });
      playSound('error');
      return;
    }
    const normalize = (value) => String(value).trim().replaceAll(' ', '').toUpperCase();
    const different = normalize(selected.value) !== normalize(field.value);
    if (different) {
      setMismatches((old) => new Set([...old, selected.uid, field.uid]));
      setLastMismatch({ key: selected.key, label: field.label, first: selected, second: field });
      setCompareMessage({ type: 'different', text: `矛盾：兩處「${field.label}」數值不同。現在可以到對話紙盤問。` });
      playSound('error');
    } else {
      setLastMismatch(null);
      setCompareMessage({ type: 'same', text: `一致：兩處「${field.label}」數值相同。這不代表其他規定也合格。` });
      playSound('approve');
    }
    setSelected(null);
  };

  const handleAsk = (topic) => {
    if (!current || askedTopics.has(topic) || resolution) return;
    setConversation((lines) => [...lines, ...askPerson(current, topic)]);
    setAskedTopics((topics) => new Set([...topics, topic]));
    playSound('click');
  };
  const handleInterrogate = () => {
    if (!current || !lastMismatch) return;
    const result = interrogatePerson(current, lastMismatch);
    setConversation((lines) => [...lines, ...result.lines]);
    setFingerprintOffer(result.canFingerprint);
    setCompareMessage({ type: 'warning', text: result.canFingerprint ? '當事人已回應。你可以進一步採集指紋複核身分。' : '盤問已記入對話紙。口供不會自動改變文件的有效性。' });
    setLastMismatch(null);
    playSound('open');
  };
  const handleFingerprint = () => {
    if (!current || supplementalDocs.some((doc) => doc.type === 'fingerprint')) return;
    const document = createFingerprintDocument(current);
    setSupplementalDocs((docs) => [...docs, document]);
    setConversation((lines) => [...lines, { id: `fingerprint-${Date.now()}`, speaker: 'officer', text: `中央身分紀錄已回傳：兩組指紋${document.result}。`, field: null }]);
    setFingerprintOffer(false);
    playSound('paper');
  };

  const finishDay = (stats) => {
    const gross = stats.processed * 5;
    const penalty = Math.max(0, stats.mistakes - 2) * 10;
    const income = gross + stats.extra - penalty;
    setSave((previous) => ({ ...previous, money: previous.money + income }));
    setReport({ ...stats, gross, penalty, income, day: save.day });
    setResolution(null);
    setScreen('dayEnd');
    setCare({ food: true, heat: true, medicine: true });
    setNightChoice(null);
    playSound('coin');
  };
  const advance = (stats) => {
    advanceTimer.current = null;
    if (currentIndex >= queue.length - 1 || closingRef.current) { finishDay(stats); return; }
    setCurrentIndex((value) => value + 1);
    setResolution(null);
    setBribeAccepted(false);
    resetInspection();
    playSound('paper');
  };

  const handleDecision = (action) => {
    if (!current || resolution || paused || modal) return;
    const result = evaluateDecision(current, action, save.day);
    const mistakeNumber = dayStats.mistakes + (result.correct ? 0 : 1);
    const nextStats = {
      ...dayStats,
      processed: dayStats.processed + 1,
      correct: dayStats.correct + (result.correct ? 1 : 0),
      mistakes: mistakeNumber,
      extra: dayStats.extra + (bribeAccepted ? current.bribe : 0),
      decisions: [...dayStats.decisions, { id: current.id, action, correct: result.correct }],
    };
    setDayStats(nextStats);
    setSave((previous) => {
      const flags = { ...previous.flags };
      const effects = current.special?.[action === 'detain' ? 'deny' : action] || {};
      Object.entries(effects).forEach(([key, value]) => { flags[key] = (flags[key] || 0) + value; });
      if (bribeAccepted) flags.bribes = (flags.bribes || 0) + 1;
      return {
        ...previous,
        flags,
        stats: {
          ...previous.stats,
          processed: previous.stats.processed + 1,
          correct: previous.stats.correct + (result.correct ? 1 : 0),
          mistakes: previous.stats.mistakes + (result.correct ? 0 : 1),
          approved: previous.stats.approved + (action === 'approve' ? 1 : 0),
          denied: previous.stats.denied + (action !== 'approve' ? 1 : 0),
          detained: (previous.stats.detained || 0) + (action === 'detain' ? 1 : 0),
        },
        history: [...previous.history, { day: save.day, name: current.name, specialKey: current.specialKey, action, correct: result.correct }],
      };
    });
    setResolution({ action, result, mistakeNumber });
    setSelected(null);
    setLastMismatch(null);
    playSound('stamp');
    window.setTimeout(() => playSound(result.correct ? 'approve' : 'error'), 280);
    clearAdvance();
    advanceTimer.current = window.setTimeout(() => advance(nextStats), 2000);
  };

  const acceptBribe = () => {
    if (!current?.bribe || bribeAccepted) return;
    setBribeAccepted(true);
    playSound('coin');
  };
  const applyNightChoice = (option) => {
    if (nightChoice) return;
    setSave((previous) => {
      const flags = { ...previous.flags };
      Object.entries(option.flags || {}).forEach(([key, value]) => { flags[key] = (flags[key] || 0) + value; });
      const family = previous.family.map((member) => {
        if (member.health <= 0) return member;
        let health = member.health;
        if (option.target === member.id) health += option.health || 0;
        if (option.familyHealth) health += option.familyHealth;
        health = Math.max(0, Math.min(100, health));
        return { ...member, health, status: getFamilyStatus(health) };
      });
      return { ...previous, flags, family, money: previous.money + (option.money || 0) - (option.cost || 0) };
    });
    setNightChoice(option);
    playSound(option.money ? 'coin' : 'click');
  };
  const finalizeDay = (total) => {
    const nextFamily = applyDailyFamily(save.family, care);
    const next = { ...save, family: nextFamily, money: save.money - total };
    if (save.day >= CAMPAIGN_DAYS) { setSave(next); setScreen('finalChoice'); }
    else { next.day = save.day + 1; setSave(next); setScreen('briefing'); }
    playSound('open');
  };
  const chooseEnding = (choice) => {
    const next = { ...save, flags: { ...save.flags } };
    if (choice === 'ticket' && !next.flags.ticket) next.money -= 90;
    next.ending = getEnding(next, choice);
    next.completed = true;
    setSave(next);
    persist(next);
    setScreen('ending');
    playSound(next.ending.tone === 'bad' ? 'error' : 'approve');
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (modal) setModal(null);
        else if (screen === 'playing') setPaused((value) => !value);
        return;
      }
      if (screen !== 'playing' || modal) return;
      if (event.key.toLowerCase() === 'r') { event.preventDefault(); openRules(); return; }
      if (paused || resolution) return;
      if (event.key.toLowerCase() === 'q') { event.preventDefault(); toggleInspect(); }
      if (event.key.toLowerCase() === 'a') { event.preventDefault(); handleDecision('approve'); }
      if (event.key.toLowerCase() === 'd') { event.preventDefault(); handleDecision('deny'); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, modal, paused, resolution, current, selected, inspectMode, dayStats, bribeAccepted, save, bookOpen]);

  const transcriptProps = {
    conversation, onAsk: handleAsk, askedTopics, lastMismatch, onInterrogate: handleInterrogate,
    fingerprintOffer, onFingerprint: handleFingerprint,
    fingerprintCreated: supplementalDocs.some((doc) => doc.type === 'fingerprint'),
  };

  return <>
    {screen === 'title' && <TitleScreen {...{ storedSave, sound }} onNew={() => newCampaign(false)} onContinue={continueCampaign} onManual={openManual} onToggleSound={toggleSound} onOpenSettings={() => setModal('settings')} />}
    {screen === 'briefing' && <BriefingScreen save={save} onStart={startShift} onManual={openManual} onTitle={returnTitle} />}
    {screen === 'playing' && current && <GameScreen
      {...{
        save, current, currentIndex, queueLength: queue.length, elapsed, duration: DAY_DURATION,
        closing, dayStats, inspectMode, selected, mismatches, compareMessage, resolution,
        bribeAccepted, paused, sound, supplementalDocs, deskScale: settings.deskScale,
        bookOpen, transcriptProps, lastMismatch,
      }}
      onInspect={handleInspect} onToggleInspect={toggleInspect} onDecision={handleDecision}
      onAcceptBribe={acceptBribe} onOpenRules={openRules} onCloseBook={() => setBookOpen(false)} onExit={returnTitle}
      onTogglePause={() => setPaused((value) => !value)} onToggleSound={toggleSound} onOpenSettings={() => setModal('settings')}
    />}
    {screen === 'dayEnd' && report && <DayEndScreen {...{ save, report, care, setCare, nightChoice }} onNightChoice={applyNightChoice} onFinalize={finalizeDay} />}
    {screen === 'finalChoice' && <FinalChoiceScreen save={save} onChoose={chooseEnding} />}
    {screen === 'ending' && save.ending && <EndingScreen save={save} onRestart={() => newCampaign(true)} onTitle={returnTitle} />}
    {(modal === 'rules' || modal === 'manual') && <Rulebook day={save.day} initialTab={modal === 'manual' ? 'basics' : 'rules'} onClose={() => setModal(null)} />}
    {modal === 'settings' && <Settings settings={settings} onChange={updateSettings} onClose={() => setModal(null)} />}
  </>;
}
