import { useState, useEffect, useRef, useCallback } from 'react';

import { BUILDINGS, UNLOCK_THRESHOLDS } from './game/buildings.js';
import { UPGRADES } from './game/upgrades.js';
import { MILESTONES } from './game/milestones.js';
import { ACHIEVEMENTS } from './game/achievements.js';
import { GOLDEN_COOKIES } from './game/events.js';
import { MSG_GENERIC } from './game/messages.js';

import { fmt, pk, buildingCostN } from './utils/format.js';
import { saveGame, loadGame, buildInitialOwned, calcOfflineEarnings } from './utils/save.js';
import { playClick, playBuy, playUpgrade, playMilestone, playGoldenCookie, playPrestige, toggleMute } from './audio/SoundManager.js';

import CheckIcon from './ui/CheckIcon.jsx';
import ClickArea from './ui/ClickArea.jsx';
import BuildingList from './ui/BuildingList.jsx';
import UpgradeRow from './ui/UpgradeRow.jsx';
import GoldenCookie from './ui/GoldenCookie.jsx';
import PrestigeBar from './ui/PrestigeBar.jsx';
import Ticker from './ui/Ticker.jsx';
import { StatsPanel, LogPanel, AchievementsPanel } from './ui/Panels.jsx';

function initState() {
  const saved = loadGame();
  if (saved) return { ...saved, _offline: true };
  return {
    reads: 0,
    allTime: 0,
    owned: buildInitialOwned(),
    boughtUpgrades: new Set(),
    prestigeCount: 0,
    prestigePower: 0,
    seenMilestones: new Set(),
    unlockedAchievements: new Set(),
    unlockedBuildings: new Set(['ex', 'par', 'bsy']),
    _offline: false,
  };
}

export default function App() {
  const init = initState();

  const [reads,       setReads]       = useState(init.reads);
  const [allTime,     setAllTime]     = useState(init.allTime);
  const [owned,       setOwned]       = useState(init.owned);
  const [boughtUpgrades, setBoughtUpgrades] = useState(init.boughtUpgrades);
  const [prestigeCount,  setPrestigeCount]  = useState(init.prestigeCount);
  const [prestigePower,  setPrestigePower]  = useState(init.prestigePower);
  const [seenMilestones, setSeenMilestones] = useState(init.seenMilestones);
  const [unlockedAchievements, setUnlockedAchievements] = useState(init.unlockedAchievements);
  const [unlockedBuildings, setUnlockedBuildings] = useState(init.unlockedBuildings);

  const [message,    setMessage]    = useState(pk(MSG_GENERIC));
  const [isRead,     setIsRead]     = useState(false);
  const [floats,     setFloats]     = useState([]);
  const [popAnim,    setPopAnim]    = useState(false);
  const [toasts,     setToasts]     = useState([]);
  const [goldenCookie, setGoldenCookie] = useState(null);
  const [gcPos,      setGcPos]      = useState({ x: 50, y: 30 });
  const [newBuildings, setNewBuildings] = useState(new Set());
  const [log,        setLog]        = useState([]);
  const [recentMsgs, setRecentMsgs] = useState([]);
  const [started,    setStarted]    = useState(false);
  const [showHint,   setShowHint]   = useState(true);
  const [buyN,       setBuyN]       = useState(1);
  const [tempMult,   setTempMult]   = useState(1);
  const [mutedUI,    setMutedUI]    = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(null);
  const [prodPerSec, setProdPerSec] = useState(0);

  const idRef      = useRef(0);
  const readsRef   = useRef(reads);
  const allTimeRef = useRef(allTime);
  const psRef      = useRef(0);
  const ownedRef   = useRef(owned);
  const boughtRef  = useRef(boughtUpgrades);

  useEffect(() => { readsRef.current   = reads;   }, [reads]);
  useEffect(() => { allTimeRef.current = allTime; }, [allTime]);
  useEffect(() => { ownedRef.current   = owned;   }, [owned]);
  useEffect(() => { boughtRef.current  = boughtUpgrades; }, [boughtUpgrades]);

  const prestigeMult   = 1 + prestigePower * 0.1;
  const prestigeEarned = Math.floor(Math.sqrt(allTime / 500000));

  // Production per second
  useEffect(() => {
    let p = 0;
    BUILDINGS.forEach(b => {
      let m = 1;
      UPGRADES.forEach(u => {
        if (u.type === 'm' && u.target === b.id && boughtUpgrades.has(u.id)) m *= u.bonus;
      });
      p += b.baseProd * (owned[b.id] ?? 0) * m;
    });
    const total = p * prestigeMult * tempMult;
    setProdPerSec(total);
    psRef.current = total;
  }, [owned, boughtUpgrades, prestigeMult, tempMult]);

  const calcClickPower = useCallback(() => {
    let bonus = 1, pct = 0;
    UPGRADES.forEach(u => {
      if (!boughtRef.current.has(u.id)) return;
      if (u.type === 'ck') bonus += u.bonus;
      if (u.type === 'cp') pct  += u.bonus;
    });
    return Math.floor((bonus + psRef.current * pct) * prestigeMult);
  }, [prestigeMult]);

  // Production tick
  useEffect(() => {
    if (prodPerSec <= 0) return;
    const iv = setInterval(() => {
      const d = psRef.current / 20;
      setReads(r => r + d);
      setAllTime(a => a + d);
    }, 50);
    return () => clearInterval(iv);
  }, [prodPerSec]);

  // Autosave every 30 s
  useEffect(() => {
    const iv = setInterval(() => {
      saveGame({ reads: readsRef.current, allTime: allTimeRef.current, owned: ownedRef.current, boughtUpgrades: boughtRef.current, prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings });
    }, 30000);
    return () => clearInterval(iv);
  }, [prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings]);

  // Save on tab hide
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') {
        saveGame({ reads: readsRef.current, allTime: allTimeRef.current, owned: ownedRef.current, boughtUpgrades: boughtRef.current, prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings });
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings]);

  // Offline earnings on first load
  useEffect(() => {
    if (!init._offline) return;
    const saved = loadGame();
    if (!saved?.savedAt) return;
    let p = 0;
    BUILDINGS.forEach(b => {
      let m = 1;
      UPGRADES.forEach(u => {
        if (u.type === 'm' && u.target === b.id && saved.boughtUpgrades.has(u.id)) m *= u.bonus;
      });
      p += b.baseProd * (saved.owned[b.id] ?? 0) * m;
    });
    const offlineProd = p * (1 + (saved.prestigePower ?? 0) * 0.1);
    const earned = calcOfflineEarnings(saved.savedAt, offlineProd);
    if (earned > 10) {
      setReads(r => r + earned);
      setAllTime(a => a + earned);
      const elapsed = Math.round((Date.now() - saved.savedAt) / 1000);
      const mins = Math.floor(elapsed / 60);
      setOfflineBanner(`💤 離線 ${mins} 分鐘，獲得 +${fmt(earned)} 已讀！`);
      setTimeout(() => setOfflineBanner(null), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Building unlocks
  useEffect(() => {
    Object.entries(UNLOCK_THRESHOLDS).forEach(([id, threshold]) => {
      if (allTime >= threshold && !unlockedBuildings.has(id)) {
        setUnlockedBuildings(prev => new Set([...prev, id]));
        setNewBuildings(prev => new Set([...prev, id]));
        const b = BUILDINGS.find(x => x.id === id);
        if (b) addToast(`🔓 解鎖：${b.emoji} ${b.name}！`);
      }
    });
  }, [allTime, unlockedBuildings]);

  // Milestones
  useEffect(() => {
    MILESTONES.forEach(([t, m]) => {
      if (allTime >= t && !seenMilestones.has(t)) {
        setSeenMilestones(prev => new Set([...prev, t]));
        addToast(`🏆 ${m}`);
        playMilestone();
      }
    });
  }, [allTime, seenMilestones]);

  // Achievements
  useEffect(() => {
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements.has(a.id) && a.req(allTime, owned, prestigeCount, prodPerSec)) {
        setUnlockedAchievements(prev => new Set([...prev, a.id]));
        addToast(`🎖️ 成就解鎖：${a.icon} ${a.name}`);
        playMilestone();
      }
    });
  }, [allTime, owned, prestigeCount, prodPerSec, unlockedAchievements]);

  // Golden cookie spawner
  useEffect(() => {
    let t;
    const spawn = () => {
      t = setTimeout(() => {
        if (allTimeRef.current > 50) {
          const pool = GOLDEN_COOKIES.filter(e => !e.minAt || allTimeRef.current >= e.minAt);
          const g = pk(pool);
          setGoldenCookie(g);
          setGcPos({ x: 8 + Math.random() * 75, y: 10 + Math.random() * 60 });
        }
        spawn();
      }, 20000 + Math.random() * 35000);
    };
    spawn();
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hide hint after first click
  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setShowHint(false), 800);
      return () => clearTimeout(t);
    }
  }, [started]);

  function addToast(m) {
    const id = idRef.current++;
    setToasts(t => [...t, { id, m }]);
    setLog(l => [{ id, m }, ...l].slice(0, 50));
  }

  function nextMessage() {
    const pool = [...MSG_GENERIC];
    BUILDINGS.forEach(b => {
      const c = ownedRef.current[b.id] ?? 0;
      if (c > 0 && b.messages) {
        for (let i = 0; i < Math.min(c, 5); i++) pool.push(pk(b.messages));
      }
    });
    return pk(pool);
  }

  const handleClick = useCallback((e) => {
    if (isRead) return;
    if (!started) setStarted(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ?? (e.touches?.[0]?.clientX ?? rect.left + rect.width / 2);
    const y = e.clientY ?? (e.touches?.[0]?.clientY ?? rect.top + rect.height / 2);
    const power = calcClickPower();

    setIsRead(true);
    setReads(r => r + power);
    setAllTime(a => a + power);
    setPopAnim(true);
    setTimeout(() => setPopAnim(false), 180);

    const fid = idRef.current++;
    setFloats(f => [...f, { id: fid, x, y, text: power > 1 ? `+${fmt(power)}` : '+1' }]);
    setRecentMsgs(prev => [message, ...prev].slice(0, 5));
    playClick();

    setTimeout(() => {
      setIsRead(false);
      setMessage(nextMessage());
    }, 200);
  }, [isRead, started, message, calcClickPower]);

  const handleGoldenCookie = useCallback(() => {
    if (!goldenCookie) return;
    playGoldenCookie();
    const gc = goldenCookie;
    setGoldenCookie(null);

    if (gc.type === 'mult') {
      setTempMult(2);
      addToast(`🚀 ${gc.toast}`);
      setTimeout(() => setTempMult(1), gc.dur * 1000);
    } else if (gc.type === 'mult5') {
      setTempMult(5);
      addToast(`🔥 ${gc.toast}`);
      setTimeout(() => setTempMult(1), gc.dur * 1000);
    } else {
      const bonus = Math.max(20, Math.floor(psRef.current * gc.mult));
      setReads(r => r + bonus);
      setAllTime(a => a + bonus);
      addToast(`${gc.emoji} ${gc.toast} +${fmt(bonus)}`);
    }
  }, [goldenCookie]);

  const handleBuy = useCallback((b, n) => {
    const count = ownedRef.current[b.id] ?? 0;
    const cost = buildingCostN(b, count, n);
    if (readsRef.current < cost) return;

    const newCount = count + n;
    setReads(r => r - cost);
    setOwned(o => ({ ...o, [b.id]: newCount }));
    setNewBuildings(prev => { const s = new Set(prev); s.delete(b.id); return s; });
    for (let i = count + 1; i <= newCount; i++) {
      if (b.milestones?.[i]) addToast(`${b.emoji} ${b.milestones[i]}`);
    }
    playBuy();
  }, []);

  const handleBuyUpgrade = useCallback((u) => {
    if (readsRef.current < u.cost || boughtRef.current.has(u.id)) return;
    setReads(r => r - u.cost);
    setBoughtUpgrades(s => new Set([...s, u.id]));
    addToast(`⬆️ ${u.name}！${u.desc}`);
    playUpgrade();
  }, []);

  const handlePrestige = useCallback(() => {
    if (prestigeEarned < 1) return;
    playPrestige();
    setPrestigePower(p => p + prestigeEarned);
    setPrestigeCount(c => c + 1);
    setReads(0);
    setAllTime(0);
    setOwned(buildInitialOwned());
    setBoughtUpgrades(new Set());
    setUnlockedBuildings(new Set(['ex', 'par', 'bsy']));
    setNewBuildings(new Set());
    setSeenMilestones(new Set());
    setRecentMsgs([]);
    setTempMult(1);
    addToast(`🌀 Inbox Zero！+${prestigeEarned}已讀之力。第${prestigeCount + 1}次覺醒。`);
  }, [prestigeEarned, prestigeCount]);

  const upgradeStates = UPGRADES.map(u => {
    if (boughtUpgrades.has(u.id)) return { ...u, state: 'done' };
    const ok =
      (!u.req.allTime  || allTime >= u.req.allTime) &&
      (!u.req.building || (owned[u.req.building] ?? 0) >= u.req.count);
    if (!ok) return { ...u, state: 'lock' };
    return { ...u, state: reads >= u.cost ? 'buy' : 'wait' };
  }).filter(u => u.state !== 'lock');

  return (
    <div style={{
      minHeight: '100vh', background: '#f8f9fb', color: '#1e293b',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans TC',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fu  { 0% { opacity:1;transform:translateY(0) scale(1) } 100% { opacity:0;transform:translateY(-60px) scale(1.3) } }
        @keyframes pu  { 0%,100% { transform:scale(1);opacity:1 } 50% { transform:scale(1.4);opacity:.5 } }
        @keyframes ci  { 0% { opacity:0;transform:scale(.3) } 60% { transform:scale(1.1) } 100% { opacity:1;transform:scale(1) } }
        @keyframes pn  { 0%,100% { transform:scale(1) } 50% { transform:scale(1.06) } }
        @keyframes ti  { 0% { opacity:0;transform:translateX(-50%) translateY(-20px) scale(.9) } 100% { opacity:1;transform:translateX(-50%) translateY(0) scale(1) } }
        @keyframes ib  { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
        @keyframes hf  { 0% { opacity:.8 } 80% { opacity:.8 } 100% { opacity:0 } }
        @keyframes wg  { 0%,100% { transform:rotate(0) } 25% { transform:rotate(-6deg) } 75% { transform:rotate(6deg) } }
        @keyframes si  { 0% { opacity:0;transform:translateY(8px) } 100% { opacity:1;transform:translateY(0) } }
        @keyframes gcf { 0% { opacity:0;transform:scale(.5) } 10% { opacity:1;transform:scale(1) } 85% { opacity:.8 } 100% { opacity:0;transform:scale(.3) } }
        * { box-sizing:border-box; margin:0; padding:0 }
        button { font-family:inherit; cursor:pointer }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(167,139,250,.2); border-radius:3px }
        button:active { transform:scale(.96)!important }
        @media(min-width:1024px) {
          .game-layout { flex-direction:row!important }
          .section-left   { width:25%!important; border-right:1px solid #e2e8f0 }
          .section-center { width:45%!important; border-right:1px solid #e2e8f0 }
          .section-right  { width:30%!important }
        }
        @media(min-width:768px) and (max-width:1023px) {
          .game-layout { flex-direction:row!important; flex-wrap:wrap }
          .section-left   { width:35%!important; border-right:1px solid #e2e8f0 }
          .section-center { width:65%!important }
          .section-right  { width:100%!important; border-top:1px solid #e2e8f0 }
        }
      `}</style>

      {/* Ambient glow — very faint on light bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 25% 15%, rgba(167,139,250,.04) 0%, transparent 50%), radial-gradient(ellipse at 75% 85%, rgba(163,230,53,.03) 0%, transparent 50%)' }} />

      {/* Floating +N texts */}
      {floats.map(f => (
        <div key={f.id}
          style={{
            position: 'fixed', left: f.x - 18, top: f.y - 22,
            pointerEvents: 'none', fontWeight: 800, fontSize: 21,
            color: '#65a30d',
            textShadow: '0 0 8px rgba(101,163,13,.2), 0 1px 2px rgba(255,255,255,.8)',
            animation: 'fu .85s ease-out forwards', zIndex: 200,
            fontFamily: "'JetBrains Mono',monospace",
          }}
          onAnimationEnd={() => setFloats(fs => fs.filter(x => x.id !== f.id))}
        >{f.text}</div>
      ))}

      {/* Toast */}
      {toasts.slice(-1).map(t => (
        <div key={t.id}
          style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,.95)',
            color: '#1e293b', padding: '14px 24px', borderRadius: 20, fontSize: 13,
            boxShadow: '0 8px 40px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.04)',
            zIndex: 300, maxWidth: '90vw', textAlign: 'center',
            animation: 'ti .3s cubic-bezier(.4,0,.2,1)',
            border: '1px solid #e2e8f0', lineHeight: 1.5,
          }}
          onAnimationEnd={() => { setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), 3000); }}
        >{t.m}</div>
      ))}

      {/* Offline banner */}
      {offlineBanner && (
        <div style={{
          position: 'fixed', top: 65, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(240,253,244,.9)', border: '1px solid #bbf7d0',
          borderRadius: 16, padding: '10px 20px', fontSize: 13,
          color: '#65a30d', fontWeight: 700, zIndex: 200,
          boxShadow: '0 4px 24px rgba(101,163,13,.08)',
        }}>
          {offlineBanner}
        </div>
      )}

      {/* Golden Cookie */}
      <GoldenCookie gc={goldenCookie} pos={gcPos} onClick={handleGoldenCookie} />

      {/* Temp mult indicator */}
      {tempMult > 1 && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(245,240,255,.9)', border: '1px solid rgba(167,139,250,.25)',
          borderRadius: 14, padding: '6px 16px', fontSize: 12,
          color: '#7c3aed', fontWeight: 700, zIndex: 200,
          fontFamily: "'JetBrains Mono',monospace",
          boxShadow: '0 4px 20px rgba(139,92,246,.08)',
        }}>
          🔥 x{tempMult} 產能加成中
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexShrink: 0,
        background: 'rgba(255,255,255,.8)',
        borderBottom: '1px solid #e2e8f0',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 12,
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(139,92,246,.25)',
          }}>
            <CheckIcon size={16} color="#fff" />
          </div>
          <span style={{
            fontSize: 15, fontWeight: 800, color: '#1e293b',
            letterSpacing: 3,
            fontFamily: "'JetBrains Mono',monospace",
          }}>已讀</span>
          {prestigePower > 0 && (
            <span style={{
              fontSize: 11, color: '#7c3aed',
              background: 'rgba(167,139,250,.08)',
              padding: '3px 10px', borderRadius: 10,
              fontFamily: "'JetBrains Mono',monospace",
              border: '1px solid rgba(167,139,250,.15)',
            }}>✦{prestigePower}</span>
          )}
        </div>
        <button
          onClick={() => { const m = toggleMute(); setMutedUI(m); }}
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 12, padding: '6px 12px',
            color: '#64748b', fontSize: 13,
          }}
        >{mutedUI ? '🔇' : '🔊'}</button>
      </div>

      {/* ── THREE-COLUMN LAYOUT ── */}
      <div className="game-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT — Click area + Stats */}
        <div className="section-left" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '20px 16px 16px',
          position: 'relative', flexShrink: 0,
          overflowY: 'auto',
        }}>
          {/* Big counter */}
          <div style={{
            fontSize: 52, fontWeight: 900,
            fontFamily: "'JetBrains Mono',monospace", color: '#1e293b',
            animation: popAnim ? 'pn .18s ease-out' : 'none',
            letterSpacing: -3, lineHeight: 1,
          }}>
            {fmt(reads)}
          </div>

          {/* CPS subtitle */}
          <div style={{
            fontSize: 13, color: '#94a3b8',
            fontFamily: "'JetBrains Mono',monospace",
            marginTop: 6, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <CheckIcon size={12} color="#94a3b8" />
            {prodPerSec > 0 ? `${fmt(prodPerSec)}/秒` : '點擊開始已讀'}
          </div>

          <PrestigeBar allTime={allTime} prestigeEarned={prestigeEarned} onPrestige={handlePrestige} />

          <div style={{ marginTop: 16, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ClickArea
              message={message}
              isRead={isRead}
              isFirstClick={showHint && !started}
              popAnim={popAnim}
              recentMessages={recentMsgs}
              onClick={handleClick}
            />
          </div>

          {/* Stats — always visible */}
          <div style={{ width: '100%', marginTop: 16 }}>
            <StatsPanel reads={reads} allTime={allTime} prodPerSec={prodPerSec} clickPower={calcClickPower()} owned={owned} seenMilestones={seenMilestones} prestigeCount={prestigeCount} prestigePower={prestigePower} boughtUpgrades={boughtUpgrades} />
          </div>
        </div>

        {/* CENTER — Buildings Store */}
        <div className="section-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <BuildingList
            buildings={BUILDINGS}
            owned={owned}
            reads={reads}
            unlockedBuildings={unlockedBuildings}
            newBuildings={newBuildings}
            buyN={buyN}
            onBuy={handleBuy}
            setBuyN={setBuyN}
          />
        </div>

        {/* RIGHT — Upgrades + Achievements + Log */}
        <div className="section-right" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {/* Upgrades */}
          <div style={{ flexShrink: 0 }}>
            {upgradeStates.length > 0 && (
              <UpgradeRow upgrades={upgradeStates} reads={reads} onBuy={handleBuyUpgrade} />
            )}
          </div>

          {/* Achievements + Log — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
            <AchievementsPanel unlockedAchievements={unlockedAchievements} />
            <LogPanel log={log} />
          </div>
        </div>
      </div>

      <Ticker allTime={allTime} />
    </div>
  );
}
