import { useState, useEffect, useRef, useCallback } from 'react';

import { BUILDINGS, UNLOCK_THRESHOLDS } from './game/buildings.js';
import { UPGRADES } from './game/upgrades.js';
import { MILESTONES } from './game/milestones.js';
import { ACHIEVEMENTS } from './game/achievements.js';
import { GOLDEN_COOKIES } from './game/events.js';
import { MSG_GENERIC } from './game/messages.js';
import { PRESTIGE_UPGRADES } from './game/prestige.js';
import { SYNERGIES, getActiveSynergies, getSynergyMult } from './game/synergies.js';
import { EVENT_CHAINS } from './game/eventChains.js';

import { fmt, pk, buildingCostN } from './utils/format.js';
import { saveGame, loadGame, buildInitialOwned, calcOfflineEarnings } from './utils/save.js';
import { playClick, playBuy, playUpgrade, playMilestone, playGoldenCookie, playPrestige, toggleMute } from './audio/SoundManager.js';

import CheckIcon from './ui/CheckIcon.jsx';
import ClickArea from './ui/ClickArea.jsx';
import BuildingList from './ui/BuildingList.jsx';
import UpgradeRow from './ui/UpgradeRow.jsx';
import GoldenCookie from './ui/GoldenCookie.jsx';
import PrestigeBar from './ui/PrestigeBar.jsx';
import PrestigeShop from './ui/PrestigeShop.jsx';
import ReadStorm from './ui/ReadStorm.jsx';
import Ticker from './ui/Ticker.jsx';
import { StatsPanel, LogPanel, AchievementBadges } from './ui/Panels.jsx';

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
    boughtPrestige: new Set(),
    activeSynergies: new Set(),
    completedChains: new Set(),
    eventChainBuffs: {},
    stormCount: 0,
    stormPerfect: 0,
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
  const [boughtPrestige,   setBoughtPrestige]   = useState(init.boughtPrestige);
  const [activeSynergies,  setActiveSynergies]  = useState(init.activeSynergies);
  const [completedChains,  setCompletedChains]  = useState(init.completedChains);
  const [eventChainBuffs,  setEventChainBuffs]  = useState(init.eventChainBuffs);
  const [stormCount,       setStormCount]       = useState(init.stormCount);
  const [stormPerfect,     setStormPerfect]     = useState(init.stormPerfect);
  const [activeChain,      setActiveChain]      = useState(null);
  const [chainChoice,      setChainChoice]      = useState(null);
  const [stormActive,      setStormActive]      = useState(false);

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
  const [storeTab,   setStoreTab]   = useState('build');

  const idRef      = useRef(0);
  const readsRef   = useRef(reads);
  const allTimeRef = useRef(allTime);
  const psRef      = useRef(0);
  const ownedRef   = useRef(owned);
  const boughtRef  = useRef(boughtUpgrades);
  const tempMultRef = useRef(tempMult);

  useEffect(() => { readsRef.current   = reads;   }, [reads]);
  useEffect(() => { allTimeRef.current = allTime; }, [allTime]);
  useEffect(() => { ownedRef.current   = owned;   }, [owned]);
  useEffect(() => { boughtRef.current  = boughtUpgrades; }, [boughtUpgrades]);
  useEffect(() => { tempMultRef.current = tempMult; }, [tempMult]);

  const prestigeMult   = 1 + prestigePower * 0.1;
  // Prestige bonus for earned ✦
  const prestigeBonusMult = boughtPrestige.has('ps9')
    ? 1.5 : 1;
  const prestigeEarned = Math.floor(Math.sqrt(allTime / 500000) * prestigeBonusMult);

  // Global mult from prestige upgrades
  const prestigeGlobalMult = PRESTIGE_UPGRADES
    .filter(u => boughtPrestige.has(u.id) && u.effect.type === 'globalMult')
    .reduce((acc, u) => acc * u.effect.value, 1);

  // Event chain buff multipliers
  const chainGlobalBuff = eventChainBuffs._global ?? 1;

  // Production per second
  useEffect(() => {
    let p = 0;
    BUILDINGS.forEach(b => {
      let m = 1;
      // Upgrade multipliers
      UPGRADES.forEach(u => {
        if (u.type === 'm' && u.target === b.id && boughtUpgrades.has(u.id)) m *= u.bonus;
      });
      // Synergy multipliers
      m *= getSynergyMult(owned, b.id);
      // Prestige building-specific multipliers
      PRESTIGE_UPGRADES.forEach(u => {
        if (boughtPrestige.has(u.id) && u.effect.type === 'buildingMult' && u.effect.target === b.id) {
          m *= u.effect.value;
        }
      });
      // Event chain permanent building buffs
      if (eventChainBuffs[b.id]) m *= eventChainBuffs[b.id];
      p += b.baseProd * (owned[b.id] ?? 0) * m;
    });
    const total = p * prestigeMult * prestigeGlobalMult * chainGlobalBuff * tempMult;
    setProdPerSec(total);
    psRef.current = total;
  }, [owned, boughtUpgrades, prestigeMult, prestigeGlobalMult, chainGlobalBuff, tempMult, boughtPrestige, eventChainBuffs]);

  const calcClickPower = useCallback(() => {
    let bonus = 1, pct = 0;
    UPGRADES.forEach(u => {
      if (!boughtRef.current.has(u.id)) return;
      if (u.type === 'ck') bonus += u.bonus;
      if (u.type === 'cp') pct  += u.bonus;
    });
    // Prestige click bonus
    const prestigeClickBonus = PRESTIGE_UPGRADES
      .filter(u => boughtPrestige.has(u.id) && u.effect.type === 'clickBonus')
      .reduce((acc, u) => acc + u.effect.value, 0);
    return Math.floor((bonus + prestigeClickBonus + psRef.current * pct) * prestigeMult * tempMultRef.current);
  }, [prestigeMult, boughtPrestige]);

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

  const saveState = useCallback(() => {
    saveGame({
      reads: readsRef.current, allTime: allTimeRef.current, owned: ownedRef.current,
      boughtUpgrades: boughtRef.current, prestigeCount, prestigePower,
      seenMilestones, unlockedAchievements, unlockedBuildings,
      boughtPrestige, activeSynergies, completedChains, eventChainBuffs,
      stormCount, stormPerfect,
    });
  }, [prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings, boughtPrestige, activeSynergies, completedChains, eventChainBuffs, stormCount, stormPerfect]);

  // Autosave every 30 s
  useEffect(() => {
    const iv = setInterval(saveState, 30000);
    return () => clearInterval(iv);
  }, [saveState]);

  // Save on tab hide
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') saveState(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [saveState]);

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
  const unlockDiscount = boughtPrestige.has('ps7') ? 0.8 : 1;
  useEffect(() => {
    Object.entries(UNLOCK_THRESHOLDS).forEach(([id, rawThreshold]) => {
      const threshold = Math.floor(rawThreshold * unlockDiscount);
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

  // Achievements — pass extra context for new achievement types
  const achievementExtra = {
    synergies: activeSynergies.size,
    completedChains: completedChains.size,
    boughtPrestige: boughtPrestige.size,
    stormCount,
    stormPerfect,
    boughtUpgrades: boughtUpgrades.size,
  };
  useEffect(() => {
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements.has(a.id) && a.req(allTime, owned, prestigeCount, prodPerSec, achievementExtra)) {
        setUnlockedAchievements(prev => new Set([...prev, a.id]));
        addToast(`🎖️ 成就解鎖：${a.icon} ${a.name}`);
        playMilestone();
      }
    });
  }, [allTime, owned, prestigeCount, prodPerSec, unlockedAchievements, activeSynergies.size, completedChains.size, boughtPrestige.size, stormCount, stormPerfect, boughtUpgrades.size]);

  // Golden cookie spawner (respects prestige golden freq boost)
  const goldenFreqMult = boughtPrestige.has('ps5') ? 0.7 : 1; // 30% faster = 70% of interval
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
      }, (20000 + Math.random() * 35000) * goldenFreqMult);
    };
    spawn();
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldenFreqMult]);

  // Synergy detection
  useEffect(() => {
    const active = getActiveSynergies(owned);
    active.forEach(syn => {
      if (!activeSynergies.has(syn.id)) {
        setActiveSynergies(prev => new Set([...prev, syn.id]));
        addToast(`🔗 Synergy啟動：${syn.emoji} ${syn.name} — ${syn.toast}`);
        playMilestone();
      }
    });
  }, [owned, activeSynergies]);

  // Event chain trigger detection
  useEffect(() => {
    if (activeChain) return; // one at a time
    EVENT_CHAINS.forEach(chain => {
      if (completedChains.has(chain.id)) return;
      const { building, count } = chain.triggerReq;
      if ((owned[building] ?? 0) >= count) {
        // Trigger this chain
        setActiveChain({ ...chain, phase: 0, startTime: Date.now() });
        const phase = chain.phases[0];
        addToast(phase.toast);
        // Apply debuff/buff
        if (phase.effect.type === 'buildingDebuff') {
          setTempMult(prev => prev * phase.effect.mult);
        } else if (phase.effect.type === 'globalDebuff') {
          setTempMult(prev => prev * phase.effect.mult);
        } else if (phase.effect.type === 'buildingBuff') {
          setTempMult(prev => prev * phase.effect.mult);
        }
        // Schedule phase end
        if (phase.duration) {
          setTimeout(() => {
            setTempMult(1);
            const nextPhase = chain.phases[1];
            if (nextPhase?.choice) {
              setChainChoice({ chain, options: nextPhase.options });
            } else {
              // Complete the chain
              finishChain(chain);
            }
          }, phase.duration * 1000);
        }
      }
    });
  }, [owned, completedChains, activeChain]);

  function finishChain(chain) {
    setActiveChain(null);
    setChainChoice(null);
    setCompletedChains(prev => new Set([...prev, chain.id]));
    const reward = chain.reward;
    addToast(reward.toast);
    if (reward.effect.type === 'permanentBuildingBuff') {
      setEventChainBuffs(prev => ({
        ...prev,
        [reward.effect.target]: (prev[reward.effect.target] ?? 1) * reward.effect.mult,
      }));
    } else if (reward.effect.type === 'permanentGlobalBuff') {
      setEventChainBuffs(prev => ({
        ...prev,
        _global: (prev._global ?? 1) * reward.effect.mult,
      }));
    }
    playMilestone();
  }

  const handleChainChoice = useCallback((option) => {
    if (!chainChoice) return;
    addToast(option.toast);
    if (option.effect.type === 'permanentBuildingBuff') {
      setEventChainBuffs(prev => ({
        ...prev,
        [option.effect.target]: (prev[option.effect.target] ?? 1) * option.effect.mult,
      }));
    } else if (option.effect.type === 'permanentGlobalBuff') {
      setEventChainBuffs(prev => ({
        ...prev,
        _global: (prev._global ?? 1) * option.effect.mult,
      }));
    } else if (option.effect.type === 'buildingBuff') {
      setTempMult(option.effect.mult);
      setTimeout(() => {
        setTempMult(1);
        finishChain(chainChoice.chain);
      }, (option.effect.duration ?? 30) * 1000);
      setChainChoice(null);
      return;
    }
    finishChain(chainChoice.chain);
  }, [chainChoice]);

  // Read Storm spawner — every 5-10 minutes
  useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        if (psRef.current > 0 && !stormActive) {
          setStormActive(true);
        }
        schedule();
      }, (300 + Math.random() * 300) * 1000); // 5-10 min
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const handleStormComplete = useCallback((earned) => {
    setStormActive(false);
    setStormCount(c => c + 1);
    if (earned > 0) {
      setReads(r => r + earned);
      setAllTime(a => a + earned);
      addToast(`🌪️ 已讀風暴結束！獲得 +${fmt(earned)} 已讀`);
    }
  }, []);

  const handleStormPerfect = useCallback(() => {
    setStormPerfect(p => p + 1);
  }, []);

  // Prestige shop buy handler
  const handleBuyPrestige = useCallback((u) => {
    if (prestigePower < u.cost || boughtPrestige.has(u.id)) return;
    setPrestigePower(p => p - u.cost);
    setBoughtPrestige(s => new Set([...s, u.id]));
    addToast(`✦ ${u.emoji} ${u.name}！${u.desc}`);
    playUpgrade();
  }, [prestigePower, boughtPrestige]);

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
    const startBonus = boughtPrestige.has('ps1') ? 100 : 0;
    setPrestigePower(p => p + prestigeEarned);
    setPrestigeCount(c => c + 1);
    setReads(startBonus);
    setAllTime(0);
    setOwned(buildInitialOwned());
    setBoughtUpgrades(new Set());
    setUnlockedBuildings(new Set(['ex', 'par', 'bsy']));
    setNewBuildings(new Set());
    setSeenMilestones(new Set());
    setRecentMsgs([]);
    setTempMult(1);
    setActiveChain(null);
    setChainChoice(null);
    // Note: boughtPrestige, activeSynergies, completedChains, eventChainBuffs persist across prestige
    addToast(`🌀 Inbox Zero！+${prestigeEarned}已讀之力。第${prestigeCount + 1}次覺醒。${startBonus > 0 ? ` 快速啟動+${startBonus}！` : ''}`);
  }, [prestigeEarned, prestigeCount, boughtPrestige]);

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
      height: '100vh', background: '#f8f9fb', color: '#1e293b',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans TC',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Noto+Sans+TC:wght@300;400;500;700;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
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
        @keyframes glow { 0%,100% { box-shadow: 0 0 8px rgba(99,102,241,.2) } 50% { box-shadow: 0 0 20px rgba(99,102,241,.4), 0 0 40px rgba(99,102,241,.15) } }
        @keyframes tp { 0% { transform:scaleX(1) } 100% { transform:scaleX(0) } }
        @keyframes ba { 0%,100% { transform:translateY(0);opacity:.6 } 50% { transform:translateY(6px);opacity:1 } }
        @keyframes bgfloat { 0% { transform:translateY(100vh) rotate(0deg);opacity:0 } 10% { opacity:1 } 90% { opacity:1 } 100% { transform:translateY(-20px) rotate(360deg);opacity:0 } }
        @keyframes bgpulse { 0%,100% { opacity:.03 } 50% { opacity:.07 } }
        @media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:0.01ms!important; animation-iteration-count:1!important; transition-duration:0.01ms!important } }
        * { box-sizing:border-box; margin:0; padding:0 }
        button { font-family:inherit; cursor:pointer }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.15); border-radius:3px }
        button:active { transform:scale(.96)!important }
        @media(min-width:768px) {
          .game-layout { flex-direction:row!important }
          .section-hero  { width:30%!important; border-right:1px solid #e2e8f0 }
          .section-store { width:70%!important }
        }
      `}</style>

      {/* Ambient background — floating checkmarks + gradient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 25% 15%, rgba(99,102,241,.06) 0%, transparent 50%), radial-gradient(ellipse at 75% 85%, rgba(217,119,6,.04) 0%, transparent 50%)',
      }}>
        {/* Floating ✓✓ particles */}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 8.3 + 3) % 100}%`,
            fontSize: 10 + (i % 3) * 4,
            color: i % 2 === 0 ? 'rgba(99,102,241,.06)' : 'rgba(217,119,6,.05)',
            animation: `bgfloat ${18 + (i % 5) * 4}s linear infinite`,
            animationDelay: `${-i * 2.5}s`,
            fontFamily: "'JetBrains Mono',monospace",
            fontWeight: 800,
          }}>✓✓</div>
        ))}
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          animation: 'bgpulse 8s ease-in-out infinite',
        }} />
      </div>

      {/* Floating +N texts */}
      {floats.map(f => (
        <div key={f.id}
          style={{
            position: 'fixed', left: f.x - 18, top: f.y - 22,
            pointerEvents: 'none', fontWeight: 800, fontSize: 21,
            color: '#b45309',
            textShadow: '0 0 8px rgba(180,83,9,.2), 0 1px 2px rgba(255,255,255,.8)',
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
            color: '#1e293b', padding: '14px 24px', borderRadius: 12, fontSize: 13,
            boxShadow: '0 8px 40px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.04)',
            zIndex: 300, maxWidth: '90vw', textAlign: 'center',
            animation: 'ti .3s cubic-bezier(.4,0,.2,1)',
            border: '1px solid #e2e8f0', lineHeight: 1.5,
            overflow: 'hidden',
          }}
          onAnimationEnd={() => { setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), 3000); }}
        >
          {t.m}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, #6366f1, #4338ca)',
            borderRadius: '0 0 12px 12px',
            animation: 'tp 3s linear forwards',
            transformOrigin: 'left',
          }} />
        </div>
      ))}

      {/* Offline banner */}
      {offlineBanner && (
        <div style={{
          position: 'fixed', top: 65, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,251,235,.9)', border: '1px solid #fde68a',
          borderRadius: 16, padding: '10px 20px', fontSize: 13,
          color: '#b45309', fontWeight: 700, zIndex: 200,
          boxShadow: '0 4px 24px rgba(217,119,6,.08)',
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
          background: 'rgba(245,240,255,.9)', border: '1px solid rgba(99,102,241,.25)',
          borderRadius: 14, padding: '6px 16px', fontSize: 12,
          color: '#4f46e5', fontWeight: 700, zIndex: 200,
          fontFamily: "'JetBrains Mono',monospace",
          boxShadow: '0 4px 20px rgba(99,102,241,.08)',
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
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(99,102,241,.25)',
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
              fontSize: 11, color: '#4f46e5',
              background: 'rgba(99,102,241,.08)',
              padding: '3px 10px', borderRadius: 10,
              fontFamily: "'JetBrains Mono',monospace",
              border: '1px solid rgba(99,102,241,.15)',
            }}>✦{prestigePower}</span>
          )}
        </div>
        <button
          onClick={() => { const m = toggleMute(); setMutedUI(m); }}
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '8px 14px',
            color: '#64748b', fontSize: 14,
          }}
        >{mutedUI ? '🔇' : '🔊'}</button>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="game-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT — Hero counter + Click + Stats */}
        <div className="section-hero" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 14px 12px',
          position: 'relative', flexShrink: 0,
          overflowY: 'auto',
        }}>
          {/* Hero counter — the star of the show */}
          <div style={{
            fontSize: 68, fontWeight: 900,
            fontFamily: "'Space Grotesk','JetBrains Mono',monospace", color: '#1e293b',
            animation: popAnim ? 'pn .18s ease-out' : 'none',
            letterSpacing: -3, lineHeight: 1,
            marginBottom: 4,
          }}>
            {fmt(reads)}
          </div>

          {/* CPS subtitle */}
          <div style={{
            fontSize: 16, color: '#94a3b8',
            fontFamily: "'JetBrains Mono',monospace",
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <CheckIcon size={13} color="#94a3b8" />
            {prodPerSec > 0 ? `${fmt(prodPerSec)}/秒` : '點擊開始已讀'}
          </div>

          <PrestigeBar allTime={allTime} prestigeEarned={prestigeEarned} onPrestige={handlePrestige} />

          <div style={{ marginTop: 10, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ClickArea
              message={message}
              isRead={isRead}
              isFirstClick={showHint && !started}
              popAnim={popAnim}
              recentMessages={recentMsgs}
              onClick={handleClick}
            />
          </div>

          {/* Compact stats row */}
          <div style={{ width: '100%', marginTop: 10 }}>
            <StatsPanel reads={reads} allTime={allTime} prodPerSec={prodPerSec} clickPower={calcClickPower()} owned={owned} seenMilestones={seenMilestones} prestigeCount={prestigeCount} prestigePower={prestigePower} boughtUpgrades={boughtUpgrades} />
          </div>

          {/* Achievement badges */}
          <div style={{ width: '100%', marginTop: 8 }}>
            <div style={{
              fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 6,
            }}>成就 {unlockedAchievements.size}/{ACHIEVEMENTS.length}</div>
            <AchievementBadges unlockedAchievements={unlockedAchievements} />
          </div>
        </div>

        {/* RIGHT — Tabbed Store (Buildings / Upgrades) + Log */}
        <div className="section-store" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex', padding: '8px 12px 0', gap: 4, flexShrink: 0,
          }}>
            {[
              { id: 'build', label: '建築', count: Object.values(owned).reduce((a, b) => a + b, 0) },
              { id: 'upgrade', label: '升級', count: `${boughtUpgrades.size}/${UPGRADES.length}` },
              ...(prestigeCount > 0 ? [{ id: 'prestige', label: '✦商店', count: `${boughtPrestige.size}/${PRESTIGE_UPGRADES.length}` }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStoreTab(tab.id)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: '10px 10px 0 0',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: storeTab === tab.id ? '#fff' : 'transparent',
                  color: storeTab === tab.id ? '#1e293b' : '#94a3b8',
                  borderBottom: storeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all .15s',
                  fontFamily: 'inherit',
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: 6, fontSize: 10,
                  fontFamily: "'JetBrains Mono',monospace",
                  color: storeTab === tab.id ? '#6366f1' : '#cbd5e1',
                }}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {storeTab === 'build' ? (
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
            ) : storeTab === 'upgrade' ? (
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {upgradeStates.length > 0 ? (
                  <UpgradeRow upgrades={upgradeStates} reads={reads} onBuy={handleBuyUpgrade} />
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>
                    繼續已讀就會解鎖更多升級
                  </div>
                )}
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <PrestigeShop
                  prestigePower={prestigePower}
                  boughtPrestige={boughtPrestige}
                  onBuy={handleBuyPrestige}
                />
              </div>
            )}
          </div>

          {/* Compact log footer */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '6px 12px', flexShrink: 0,
            maxHeight: 80, overflowY: 'auto',
            background: 'rgba(248,250,251,.8)',
          }}>
            <div style={{
              fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5,
              textTransform: 'uppercase', marginBottom: 2,
            }}>紀錄</div>
            {log.length === 0
              ? <div style={{ fontSize: 10, color: '#cbd5e1', fontStyle: 'italic' }}>事件會出現在這裡</div>
              : log.slice(-3).map(l => (
                <div key={l.id} style={{
                  fontSize: 10, color: '#64748b', padding: '1px 0',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{l.m}</div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Read Storm mini-game */}
      <ReadStorm
        active={stormActive}
        perSecond={prodPerSec}
        onComplete={(earned) => {
          handleStormComplete(earned);
          // Check if it was a perfect (ReadStorm internally tracks this via its own callback)
        }}
        onPerfect={handleStormPerfect}
      />

      {/* Event Chain choice overlay */}
      {chainChoice && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px 28px',
            maxWidth: 400, width: '90vw',
            boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
              ⚡ {chainChoice.chain.name}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>選擇你的應對方式：</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chainChoice.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChainChoice(opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderRadius: 12,
                    background: '#f8f9fb', border: '1px solid #e2e8f0',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = '#6366f1'; e.target.style.background = '#f0f0ff'; }}
                  onMouseLeave={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8f9fb'; }}
                >
                  <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Ticker allTime={allTime} />
    </div>
  );
}
