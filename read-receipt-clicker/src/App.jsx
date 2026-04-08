import { useState, useEffect, useRef, useCallback } from 'react';

import { BUILDINGS, UNLOCK_THRESHOLDS } from './game/buildings.js';
import { UPGRADES } from './game/upgrades.js';
import { MILESTONES } from './game/milestones.js';
import { ACHIEVEMENTS, getAchievementBonus } from './game/achievements.js';
import { GOLDEN_COOKIES } from './game/events.js';
import { MSG_GENERIC } from './game/messages.js';
import { PRESTIGE_UPGRADES, getNodeEffects, getCapstoneBlocker } from './game/prestige.js';
import { SYNERGIES, getActiveSynergies, getSynergyMult } from './game/synergies.js';
import { EVENT_CHAINS } from './game/eventChains.js';
import { REPLY_TRAPS, GUILT_EVENTS, GUILT_RELIEF, GUILT_THRESHOLDS } from './game/guilt.js';

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
import ReplyTrap from './ui/ReplyTrap.jsx';
import Ticker from './ui/Ticker.jsx';
import MiniGamePanel from './ui/MiniGamePanel.jsx';
import MilestonePanel from './ui/MilestonePanel.jsx';
import HeroBackground from './ui/HeroBackground.jsx';
import { StatsPanel, LogPanel, AchievementBadges } from './ui/Panels.jsx';
import { HeaderBanner, TickerBanner, CounterBanner, ChatBanner, UpgradeBanner } from './ui/SectionBanners.jsx';

import { createMarketState, tickMarket, buyShare, sellShare, resetHoldings, investFutures, collectFuture } from './game/stockMarket.js';
import { createGardenState, tickGarden, plantSeed, harvestFlower, clearWilted, getGardenExBuffMult, getSeriesBonusMult, resetGarden } from './game/garden.js';
import { createMergeState, tickMerge, placeGift, mergeGifts, moveGift, expandGrid, getMergePermMult, resetMerge, getTier as getMergeTier } from './game/merge.js';
import { createBuffState, addBuff, expireBuffs, setResonance, consumeResonance, getBuffMultiplier, getActiveBuffs } from './game/buffSystem.js';

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
  const [guilt,            setGuilt]            = useState(init.guilt ?? 0);
  const [replyTrap,        setReplyTrap]        = useState(null);
  const [guiltCooldowns,   setGuiltCooldowns]   = useState({});
  const [coldMaster,       setColdMaster]       = useState(init.coldMaster ?? false);

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
  const [particles,  setParticles]  = useState([]);
  const [prestigeAnim, setPrestigeAnim] = useState(null); // null | 'wipe' | 'fadeOut'
  // ── Fever (已讀狂潮) state ──
  const [fever, setFever] = useState(null); // null | { startedAt, duration, clicks, combo, earned }
  const [tempMult,   setTempMult]   = useState(1);
  const [tempMultExpiry, setTempMultExpiry] = useState(0); // timestamp when tempMult expires
  const [mutedUI,    setMutedUI]    = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(null);
  const [prodPerSec, setProdPerSec] = useState(0);
  const [showPrestigeShop, setShowPrestigeShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [marketState,      setMarketState]      = useState(() => {
    const def = createMarketState();
    const saved = init.marketState;
    if (!saved) return def;
    return {
      prices: saved.prices ?? def.prices,
      holdings: saved.holdings ?? def.holdings,
      costBasis: saved.costBasis ?? def.costBasis,
      history: saved.history ?? def.history,
      modes: saved.modes ?? def.modes,
      modeTimers: saved.modeTimers ?? def.modeTimers,
    };
  });
  const [gardenState,      setGardenState]      = useState(() => init.gardenState ?? createGardenState());
  const [mergeState,       setMergeState]       = useState(() => init.mergeState ?? createMergeState());
  const [buffState,        setBuffState]        = useState(() => init.buffState ?? createBuffState());
  const [activeMiniGame,   setActiveMiniGame]   = useState(null);
  const [cheatMode,        setCheatMode]        = useState(false);
  const cheatBufRef = useRef('');

  const idRef      = useRef(0);
  const readsRef   = useRef(reads);
  const allTimeRef = useRef(allTime);
  const psRef      = useRef(0);
  const ownedRef   = useRef(owned);
  const boughtRef  = useRef(boughtUpgrades);
  const tempMultRef = useRef(tempMult);
  const costDiscountRef = useRef(0);
  const gameRootRef = useRef(null);
  const feverRef = useRef(null); // current fever state for interval reads
  const feverTimerRef = useRef(null);

  // Screen shake utility
  const triggerShake = useCallback((strong = false) => {
    const el = gameRootRef.current;
    if (!el) return;
    el.classList.remove('shake', 'shake-strong');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add(strong ? 'shake-strong' : 'shake');
  }, []);

  // Cheat mode: type "iddqd" anywhere to toggle
  useEffect(() => {
    const handler = (e) => {
      cheatBufRef.current = (cheatBufRef.current + e.key.toLowerCase()).slice(-5);
      if (cheatBufRef.current === 'iddqd') {
        setCheatMode(v => !v);
        cheatBufRef.current = '';
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Spawn click burst particles at (x, y)
  const spawnParticles = useCallback((x, y, count = 6, symbols = ['✓', '✓✓', '✓']) => {
    const ps = Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.8;
      const dist = 30 + Math.random() * 40;
      return {
        id: idRef.current++,
        x, y,
        bx: Math.cos(angle) * dist,
        by: Math.sin(angle) * dist - 10,
        symbol: symbols[i % symbols.length],
        size: 10 + Math.random() * 6,
      };
    });
    setParticles(prev => [...prev, ...ps]);
    setTimeout(() => setParticles(prev => prev.filter(p => !ps.includes(p))), 600);
  }, []);

  // ── Fever (已讀狂潮) system ──
  // Force re-render every 200ms during fever for countdown display
  const [feverTick, setFeverTick] = useState(0);
  useEffect(() => {
    if (!fever || fever.ended) return;
    const iv = setInterval(() => setFeverTick(t => t + 1), 200);
    return () => clearInterval(iv);
  }, [fever?.startedAt, fever?.ended]);

  // Returns fever chance based on active buff count
  const getFeverChance = useCallback(() => {
    const activeCount = getActiveBuffs(buffState).length;
    const base = 0.15;
    // Each active buff adds +0.08 chance (e.g., 2 buffs → 31%)
    return Math.min(0.5, base + activeCount * 0.08);
  }, [buffState]);

  const startFever = useCallback((duration = 6) => {
    if (feverRef.current) return; // already active
    const f = { startedAt: Date.now(), duration: duration * 1000, clicks: 0, combo: 1, earned: 0 };
    feverRef.current = f;
    setFever(f);
    triggerShake(true);
    // Auto-end fever after duration
    if (feverTimerRef.current) clearTimeout(feverTimerRef.current);
    feverTimerRef.current = setTimeout(() => {
      const final = feverRef.current;
      if (!final) return;
      feverRef.current = null;
      // Show result for 2.5s then clear
      setFever({ ...final, ended: true });
      setTimeout(() => setFever(null), 2500);
    }, duration * 1000);
  }, [triggerShake]);

  const handleFeverClick = useCallback((e) => {
    if (!feverRef.current) return;
    const f = feverRef.current;
    const elapsed = Date.now() - f.startedAt;
    if (elapsed >= f.duration) return;

    const newClicks = f.clicks + 1;
    // Combo: every 3 rapid clicks → +1 combo (max 10)
    const newCombo = Math.min(10, 1 + Math.floor(newClicks / 3));
    // Each fever click = combo × 2s of production
    const clickValue = Math.max(1, Math.floor(psRef.current * 2 * newCombo));
    const newEarned = f.earned + clickValue;

    const updated = { ...f, clicks: newClicks, combo: newCombo, earned: newEarned };
    feverRef.current = updated;
    setFever(updated);

    setReads(r => r + clickValue);
    setAllTime(a => a + clickValue);

    // Visual feedback
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ?? (e.touches?.[0]?.clientX ?? rect.left + rect.width / 2);
    const y = e.clientY ?? (e.touches?.[0]?.clientY ?? rect.top + rect.height / 2);
    const fid = idRef.current++;
    setFloats(fl => [...fl, { id: fid, x, y, text: `×${newCombo} +${fmt(clickValue)}` }]);
    if (newCombo > f.combo) triggerShake();
  }, [triggerShake]);

  useEffect(() => { readsRef.current   = reads;   }, [reads]);
  useEffect(() => { allTimeRef.current = allTime; }, [allTime]);
  useEffect(() => { ownedRef.current   = owned;   }, [owned]);
  useEffect(() => { boughtRef.current  = boughtUpgrades; }, [boughtUpgrades]);
  useEffect(() => { tempMultRef.current = tempMult; }, [tempMult]);
  // Auto-expire tempMult
  useEffect(() => {
    if (tempMultExpiry <= 0 || tempMult <= 1) return;
    const remaining = tempMultExpiry - Date.now();
    if (remaining <= 0) { setTempMult(1); return; }
    const t = setTimeout(() => setTempMult(1), remaining);
    return () => clearTimeout(t);
  }, [tempMultExpiry, tempMult]);



  const prestigeMult   = 1 + prestigePower * 0.05;
  // Prestige bonus for earned ✦ (additive stacking, data-driven)
  let prestigeBonusMult = 1;
  PRESTIGE_UPGRADES.forEach(u => {
    if (!boughtPrestige.has(u.id)) return;
    getNodeEffects(u).forEach(e => { if (e.type === 'prestigeBonus') prestigeBonusMult += e.value; });
  });
  const prestigeEarned = Math.floor(1.5 * Math.log(1 + allTime / 2000000) * prestigeBonusMult);

  // Global mult from prestige upgrades (multi-effect aware)
  let prestigeGlobalMult = 1;
  PRESTIGE_UPGRADES.forEach(u => {
    if (!boughtPrestige.has(u.id)) return;
    getNodeEffects(u).forEach(e => { if (e.type === 'globalMult') prestigeGlobalMult *= e.value; });
  });

  // Cost discount from prestige upgrades (multi-effect aware)
  let costDiscount = 0;
  PRESTIGE_UPGRADES.forEach(u => {
    if (!boughtPrestige.has(u.id)) return;
    getNodeEffects(u).forEach(e => { if (e.type === 'costDiscount') costDiscount += e.value; });
  });
  useEffect(() => { costDiscountRef.current = costDiscount; }, [costDiscount]);

  // Event chain buff multipliers
  const chainGlobalBuff = eventChainBuffs._global ?? 1;

  // Production per second
  useEffect(() => {
    let p = 0;
    BUILDINGS.forEach(b => {
      let m = 1;
      // Upgrade multipliers (building-specific + global)
      UPGRADES.forEach(u => {
        if (!boughtUpgrades.has(u.id)) return;
        if (u.type === 'm' && u.target === b.id) m *= u.bonus;
        if (u.type === 'g') m *= u.bonus;
      });
      // Synergy multipliers
      m *= getSynergyMult(owned, b.id);
      // Prestige building-specific multipliers (multi-effect aware)
      PRESTIGE_UPGRADES.forEach(u => {
        if (!boughtPrestige.has(u.id)) return;
        getNodeEffects(u).forEach(e => {
          if (e.type === 'buildingMult' && e.target === b.id) m *= e.value;
        });
      });
      // Event chain permanent building buffs
      if (eventChainBuffs[b.id]) m *= eventChainBuffs[b.id];
      // Garden ex-scope buff (only for 前任)
      if (b.id === 'ex') m *= getGardenExBuffMult(gardenState);
      p += b.baseProd * (owned[b.id] ?? 0) * m;
    });
    const coldMasterMult = coldMaster ? 1.5 : 1;
    // Guilt penalty — real production impact
    const guiltPenalty = coldMaster ? 1 // cold master bypasses penalty
      : guilt >= GUILT_THRESHOLDS.high ? 0.4
      : guilt >= GUILT_THRESHOLDS.medium ? 0.7
      : guilt >= GUILT_THRESHOLDS.low ? 0.9
      : 1;
    const unifiedBuff = getBuffMultiplier(buffState);
    const gardenSeries = getSeriesBonusMult(gardenState);
    const mergePerm = getMergePermMult(mergeState);
    // Achievement permanent bonus (survives prestige)
    const achievementMult = 1 + getAchievementBonus(unlockedAchievements);
    const total = p * prestigeMult * prestigeGlobalMult * chainGlobalBuff * tempMult * coldMasterMult * guiltPenalty * unifiedBuff * gardenSeries * mergePerm * achievementMult;
    setProdPerSec(total);
    psRef.current = total;
  }, [owned, boughtUpgrades, prestigeMult, prestigeGlobalMult, chainGlobalBuff, tempMult, boughtPrestige, eventChainBuffs, buffState, gardenState, mergeState, guilt, coldMaster, unlockedAchievements]);

  const calcClickPower = useCallback(() => {
    let bonus = 1, pct = 0;
    UPGRADES.forEach(u => {
      if (!boughtRef.current.has(u.id)) return;
      if (u.type === 'ck') bonus += u.bonus;
      if (u.type === 'cp') pct  += u.bonus;
    });
    // Prestige click bonus + multiplier (multi-effect aware)
    let prestigeClickBonus = 0;
    let prestigeClickMult = 1;
    PRESTIGE_UPGRADES.forEach(u => {
      if (!boughtPrestige.has(u.id)) return;
      getNodeEffects(u).forEach(e => {
        if (e.type === 'clickBonus') prestigeClickBonus += e.value;
        if (e.type === 'clickMult') prestigeClickMult *= e.value;
      });
    });
    return Math.floor((bonus + prestigeClickBonus + psRef.current * pct) * prestigeMult * tempMultRef.current * prestigeClickMult);
  }, [prestigeMult, boughtPrestige]);

  // Production tick
  useEffect(() => {
    if (prodPerSec <= 0) return;
    const iv = setInterval(() => {
      const d = psRef.current / 20;
      setReads(r => r + d);
      setAllTime(a => a + d);
      setGuilt(g => g + d * 0.01); // guilt accumulates slowly from production
    }, 50);
    return () => clearInterval(iv);
  }, [prodPerSec]);

  // Stock market tick — every 2s when algo >= 1
  useEffect(() => {
    if ((owned.algo ?? 0) < 1) return;
    const iv = setInterval(() => {
      setMarketState(prev => tickMarket(prev));
    }, 2000);
    return () => clearInterval(iv);
  }, [(owned.algo ?? 0) >= 1]);

  // Cross-system: merge highestTier ref for garden tick
  const mergeHighestTierRef = useRef(mergeState.highestTier ?? 0);
  useEffect(() => { mergeHighestTierRef.current = mergeState.highestTier ?? 0; }, [mergeState.highestTier]);

  // Garden tick — every 3s when ex >= 1
  // Cross-system: merge highestTier boosts seed generation speed
  useEffect(() => {
    if ((owned.ex ?? 0) < 1) return;
    const iv = setInterval(() => {
      const seedSpeedMult = 1 + Math.max(0, mergeHighestTierRef.current - 2) * 0.25;
      setGardenState(prev => tickGarden(prev, ownedRef.current.ex ?? 0, Date.now(), { seedSpeedMult }));
    }, 3000);
    return () => clearInterval(iv);
  }, [(owned.ex ?? 0) >= 1]);

  // Merge tick — every 3s when par >= 1
  useEffect(() => {
    if ((owned.par ?? 0) < 1) return;
    const iv = setInterval(() => {
      setMergeState(prev => tickMerge(prev, ownedRef.current.par ?? 0));
    }, 3000);
    return () => clearInterval(iv);
  }, [(owned.par ?? 0) >= 1]);

  const saveState = useCallback(() => {
    saveGame({
      reads: readsRef.current, allTime: allTimeRef.current, owned: ownedRef.current,
      boughtUpgrades: boughtRef.current, prestigeCount, prestigePower,
      seenMilestones, unlockedAchievements, unlockedBuildings,
      boughtPrestige, activeSynergies, completedChains, eventChainBuffs,
      stormCount, stormPerfect, guilt, coldMaster, marketState, gardenState, mergeState, buffState,
    });
  }, [prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings, boughtPrestige, activeSynergies, completedChains, eventChainBuffs, stormCount, stormPerfect, guilt, coldMaster, marketState, gardenState, mergeState, buffState]);

  // Autosave every 30 s
  useEffect(() => {
    const iv = setInterval(saveState, 30000);
    return () => clearInterval(iv);
  }, [saveState]);

  // Tab title — show production rate
  useEffect(() => {
    const iv = setInterval(() => {
      const ps = psRef.current;
      if (ps > 0) {
        document.title = `已讀 | ${fmt(ps)}/s`;
      } else {
        document.title = '已讀';
      }
    }, 2000);
    return () => clearInterval(iv);
  }, []);

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
        if (!saved.boughtUpgrades.has(u.id)) return;
        if (u.type === 'm' && u.target === b.id) m *= u.bonus;
        if (u.type === 'g') m *= u.bonus;
      });
      p += b.baseProd * (saved.owned[b.id] ?? 0) * m;
    });
    let offlineBonusTotal = 0;
    PRESTIGE_UPGRADES.forEach(u => {
      if (!saved.boughtPrestige.has(u.id)) return;
      getNodeEffects(u).forEach(e => { if (e.type === 'offlineBonus') offlineBonusTotal += e.value; });
    });
    const offlineProd = p * (1 + (saved.prestigePower ?? 0) * 0.05) * (1 + offlineBonusTotal);
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
  let unlockDiscountTotal = 0;
  PRESTIGE_UPGRADES.forEach(u => {
    if (!boughtPrestige.has(u.id)) return;
    getNodeEffects(u).forEach(e => { if (e.type === 'unlockDiscount') unlockDiscountTotal += e.value; });
  });
  const unlockDiscount = 1 - unlockDiscountTotal;
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
    flowersCollected: gardenState ? Object.keys(gardenState.collection ?? {}).length : 0,
    highestMergeTier: mergeState?.highestTier ?? 0,
    gridExpansions: mergeState ? Math.max(0, (mergeState.gridSize ?? 9) - 9) : 0,
    wiltedFlowers: gardenState?.totalWilted ?? 0,
    stockLoss: 0, // tracked manually if needed later
    idleMinutes: 0, // tracked manually if needed later
  };
  useEffect(() => {
    ACHIEVEMENTS.forEach(a => {
      if (!unlockedAchievements.has(a.id) && a.req(allTime, owned, prestigeCount, prodPerSec, achievementExtra)) {
        setUnlockedAchievements(prev => new Set([...prev, a.id]));
        addToast(`🎖️ 成就解鎖：${a.icon} ${a.name}`);
        playMilestone();
      }
    });
  }, [allTime, owned, prestigeCount, prodPerSec, unlockedAchievements, activeSynergies.size, completedChains.size, boughtPrestige.size, stormCount, stormPerfect, boughtUpgrades.size, gardenState, mergeState]);

  // Golden cookie spawner — gated behind gc1 upgrade
  const hasGoldenCookie = boughtUpgrades.has('gc1');
  let goldenFreqBonus = 0;
  PRESTIGE_UPGRADES.forEach(u => {
    if (!boughtPrestige.has(u.id)) return;
    getNodeEffects(u).forEach(e => { if (e.type === 'goldenFreq') goldenFreqBonus += e.value; });
  });
  const gcFreqMult = (1 - goldenFreqBonus) * (boughtUpgrades.has('gc2') ? 0.7 : 1);
  const gcDurMult = boughtUpgrades.has('gc4') ? 1.5 : 1;
  useEffect(() => {
    if (!hasGoldenCookie) return;
    let t;
    const spawn = () => {
      t = setTimeout(() => {
        const pool = GOLDEN_COOKIES.filter(e => !e.minAt || allTimeRef.current >= e.minAt);
        // Add mega event if gc5 unlocked
        if (boughtRef.current.has('gc5') && Math.random() < 0.08) {
          setGoldenCookie({ type: 'mult5', mult: 5, dur: 5, toast: '宇宙彩券頭獎！×5 已讀！', minAt: 0 });
        } else {
          const g = pk(pool);
          setGoldenCookie(g);
        }
        setGcPos({ x: 8 + Math.random() * 75, y: 10 + Math.random() * 60 });
        spawn();
      }, (20000 + Math.random() * 35000) * gcFreqMult);
    };
    spawn();
    return () => clearTimeout(t);
  }, [hasGoldenCookie, gcFreqMult]);

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

  // ReadStorm — player-initiated, buff output
  const handleStartStorm = useCallback(() => {
    const now = Date.now();
    if (buffState.stormCooldownEnd > now || stormActive) return;
    setStormActive(true);
  }, [buffState.stormCooldownEnd, stormActive]);

  const handleStormComplete = useCallback((popRatio) => {
    setStormActive(false);
    setStormCount(c => c + 1);
    // Performance-based buff
    let mult, duration;
    if (popRatio >= 0.9) { mult = 3.0; duration = 90; }
    else if (popRatio >= 0.7) { mult = 2.0; duration = 60; }
    else if (popRatio >= 0.5) { mult = 1.5; duration = 60; }
    else { mult = 1.2; duration = 30; }
    setBuffState(prev => {
      const withBuff = addBuff(prev, { source: 'storm', mult, expiresAt: Date.now() + duration * 1000 });
      let stormFreqBonus = 0;
      PRESTIGE_UPGRADES.forEach(u => {
        if (!boughtPrestige.has(u.id)) return;
        getNodeEffects(u).forEach(e => { if (e.type === 'stormFreq') stormFreqBonus += e.value; });
      });
      return { ...withBuff, stormCooldownEnd: Date.now() + 180000 * (1 - stormFreqBonus) };
    });
    addToast(`🌪️ 已讀風暴！×${mult} 產能 ${duration}s`);
  }, []);

  const handleStormPerfect = useCallback(() => {
    setStormPerfect(p => p + 1);
  }, []);

  // Legacy mini-game earn handler (no longer used by redesigned games, kept for compatibility)
  const handleMiniGameEarn = useCallback((amount) => {
    setReads(r => r + amount);
    setAllTime(a => a + amount);
  }, []);

  // QuantumLab — resonance output
  const handleQuantumResonance = useCallback((mult) => {
    setBuffState(prev => ({
      ...setResonance(prev, mult),
      quantumCooldownEnd: Date.now() + 300000, // 5 min cooldown
    }));
    const label = mult >= 2.0 ? '完美！' : mult >= 1.3 ? '不錯！' : '失誤...';
    addToast(`⚛️ 量子共振 ×${mult} ${label}`);
  }, []);

  // Garden harvest with choice — burst or sustained
  const handleGardenHarvestChoice = useCallback((slotIndex, choiceType) => {
    setGardenState(prev => {
      const result = harvestFlower(prev, slotIndex);
      if (!result) return prev;
      // Determine buff from choice
      let baseMult, duration;
      if (choiceType === 'burst') { baseMult = 3.0; duration = 120; }
      else { baseMult = 1.3; duration = 1800; }
      // Apply quantum resonance
      setBuffState(bs => {
        const [afterRes, resMult] = consumeResonance(bs);
        const finalMult = baseMult * resMult;
        return addBuff(afterRes, { source: 'garden', mult: finalMult, expiresAt: Date.now() + duration * 1000 });
      });
      const label = choiceType === 'burst' ? '猛爆' : '細水長流';
      addToast(`🌸 ${label}收成！`);
      return result.newState;
    });
  }, []);

  // Merge send gift — consume gift for buff
  const handleSendGift = useCallback((slotIndex) => {
    setMergeState(prev => {
      const item = prev.grid[slotIndex];
      if (!item) return prev;
      const tier = getMergeTier(item.tier);
      // Buff multiplier by tier
      const tierMults = { 1: 1.2, 2: 1.5, 3: 2.0, 4: 2.5, 5: 3.5, 6: 4.0, 7: 5.0 };
      const baseMult = tierMults[item.tier] ?? 1.2;
      // Apply quantum resonance
      setBuffState(bs => {
        const [afterRes, resMult] = consumeResonance(bs);
        const finalMult = baseMult * resMult;
        return addBuff(afterRes, { source: 'merge', mult: finalMult, expiresAt: Date.now() + 300000 });
      });
      addToast(`🎁 送出 ${tier.emoji} ${tier.name}！`);
      // Remove gift from grid
      const newGrid = [...prev.grid];
      newGrid[slotIndex] = null;
      return { ...prev, grid: newGrid };
    });
  }, []);

  // Expire buffs periodically
  useEffect(() => {
    const iv = setInterval(() => {
      setBuffState(prev => expireBuffs(prev));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // ═══ GUILT SYSTEM ═══

  // Guilt level for buff/debuff
  const guiltLevel = guilt >= GUILT_THRESHOLDS.transcend ? 'transcend'
    : guilt >= GUILT_THRESHOLDS.high ? 'high'
    : guilt >= GUILT_THRESHOLDS.medium ? 'medium'
    : guilt >= GUILT_THRESHOLDS.low ? 'low'
    : 'none';

  // Cold Master: transcended guilt = permanent buff
  useEffect(() => {
    if (guiltLevel === 'transcend' && !coldMaster) {
      setColdMaster(true);
      addToast('🧊 冷漠大師覺醒！罪惡感已超越人類極限。全域產能+50%');
      playMilestone();
    }
  }, [guiltLevel, coldMaster]);

  // Guilt negative event spawner
  useEffect(() => {
    if (guiltLevel === 'none' || guiltLevel === 'transcend') return;
    const freq = guiltLevel === 'high' ? 15000 : guiltLevel === 'medium' ? 30000 : 60000;
    let t;
    const spawn = () => {
      t = setTimeout(() => {
        if (Math.random() < 0.4) {
          const evt = pk(GUILT_EVENTS);
          addToast(`${evt.emoji} ${evt.name}：${evt.desc}`);
          if (evt.effect === 'prodDebuff') {
            setTempMult(prev => prev * evt.mult);
            setTimeout(() => setTempMult(1), (evt.duration ?? 10) * 1000);
          } else if (evt.effect === 'loseReads') {
            const loss = Math.floor(readsRef.current * evt.mult);
            setReads(r => Math.max(0, r - loss));
            addToast(`💸 失去 ${fmt(loss)} 已讀...`);
          }
        }
        spawn();
      }, freq + Math.random() * freq);
    };
    spawn();
    return () => clearTimeout(t);
  }, [guiltLevel]);

  // Reply Trap spawner — more frequent at higher guilt
  useEffect(() => {
    if (guilt < 100) return; // don't spawn traps before guilt builds a bit
    const baseInterval = guiltLevel === 'high' ? 25000 : guiltLevel === 'medium' ? 45000 : 80000;
    let t;
    const spawn = () => {
      t = setTimeout(() => {
        if (!replyTrap && psRef.current > 0) {
          setReplyTrap(pk(REPLY_TRAPS));
        }
        spawn();
      }, baseInterval + Math.random() * baseInterval);
    };
    spawn();
    return () => clearTimeout(t);
  }, [guiltLevel, replyTrap]);

  // Reply trap handlers
  const handleReply = useCallback(() => {
    // Player fell for the trap — penalty!
    const loss = Math.floor(readsRef.current * 0.1);
    setReads(r => Math.max(0, r - loss));
    setGuilt(g => Math.max(0, g - 200)); // replying does reduce guilt
    addToast(`💬 你回覆了...失去 ${fmt(loss)} 已讀。但罪惡感降低了一些。`);
    setReplyTrap(null);
  }, []);

  const handleIgnore = useCallback(() => {
    // Player resisted — reward!
    const bonus = Math.max(50, Math.floor(psRef.current * 5));
    setReads(r => r + bonus);
    setAllTime(a => a + bonus);
    setGuilt(g => g + 50); // ignoring increases guilt
    addToast(`😐 已讀不回。冷漠獎勵 +${fmt(bonus)}。但罪惡感上升了...`);
    setReplyTrap(null);
  }, []);

  // Guilt relief handler
  const handleGuiltRelief = useCallback((relief) => {
    const now = Date.now();
    if (guiltCooldowns[relief.id] && now < guiltCooldowns[relief.id]) return;
    setGuilt(g => Math.max(0, g - relief.guiltReduce));
    setGuiltCooldowns(prev => ({ ...prev, [relief.id]: now + relief.cooldown * 1000 }));
    addToast(`${relief.emoji} ${relief.name}！罪惡感 -${relief.guiltReduce}`);
  }, [guiltCooldowns]);

  // Prestige shop buy handler
  const handleBuyPrestige = useCallback((u) => {
    if (prestigePower < u.cost || boughtPrestige.has(u.id)) return;
    // Check prerequisites
    if (u.requires?.length && !u.requires.every(req => boughtPrestige.has(req))) return;
    // Check capstone mutual exclusion
    const blocker = getCapstoneBlocker(u.id, boughtPrestige);
    if (blocker) {
      const rival = PRESTIGE_UPGRADES.find(n => n.id === blocker);
      addToast(`🔒 已選擇 ${rival?.name ?? '對立天賦'}，無法購買此天賦`);
      return;
    }
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
    if (!started) setStarted(true);

    // During fever, bypass isRead cooldown — allow rapid clicking
    if (feverRef.current && !feverRef.current.ended) {
      handleFeverClick(e);
      playClick();
      setPopAnim(true);
      setTimeout(() => setPopAnim(false), 80);
      return;
    }

    if (isRead) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX ?? (e.touches?.[0]?.clientX ?? rect.left + rect.width / 2);
    const y = e.clientY ?? (e.touches?.[0]?.clientY ?? rect.top + rect.height / 2);
    const power = calcClickPower();

    setIsRead(true);
    setReads(r => r + power);
    setAllTime(a => a + power);
    setGuilt(g => g + 0.5);
    setPopAnim(true);
    setTimeout(() => setPopAnim(false), 180);

    const fid = idRef.current++;
    setFloats(f => [...f, { id: fid, x, y, text: power > 1 ? `+${fmt(power)}` : '+1' }]);
    spawnParticles(x, y, 5);
    setRecentMsgs(prev => [message, ...prev].slice(0, 5));
    playClick();

    setTimeout(() => {
      setIsRead(false);
      setMessage(nextMessage());
    }, 200);
  }, [isRead, started, message, calcClickPower, handleFeverClick]);

  const handleGoldenCookie = useCallback((e) => {
    if (!goldenCookie) return;
    playGoldenCookie();
    const gc = goldenCookie;
    setGoldenCookie(null);

    // Explosion particles at click position
    const cx = e?.clientX ?? window.innerWidth / 2;
    const cy = e?.clientY ?? window.innerHeight / 3;
    spawnParticles(cx, cy, 10, ['✦', '★', '✧', '⭐', '✨']);
    triggerShake(gc.type === 'mult5');

    // ── Fever chance: roll for 已讀狂潮 ──
    const feverChance = getFeverChance();
    if (!feverRef.current && Math.random() < feverChance) {
      // Fever duration: 5-8s, longer if mult event
      const feverDur = gc.type === 'mult5' ? 8 : gc.type === 'mult' ? 7 : 6;
      startFever(feverDur);
      addToast(`🔥 已讀狂潮！${feverDur} 秒內瘋狂點擊！`);
      // Still apply the normal event effect too — but it stacks with fever
    }

    const durMult = boughtUpgrades.has('gc4') ? 1.5 : 1;
    const powerBonus = boughtUpgrades.has('gc3') ? 1 : 0;
    if (gc.type === 'mult') {
      setTempMult(2 + powerBonus);
      setTempMultExpiry(Date.now() + gc.dur * 1000 * durMult);
      addToast(`🚀 ${gc.toast}`);
    } else if (gc.type === 'mult5') {
      setTempMult(4 + powerBonus);
      setTempMultExpiry(Date.now() + gc.dur * 1000 * durMult);
      addToast(`🔥 ${gc.toast}`);
    } else {
      const bonus = Math.max(20, Math.floor(psRef.current * gc.mult));
      setReads(r => r + bonus);
      setAllTime(a => a + bonus);
      addToast(`${gc.emoji} ${gc.toast} +${fmt(bonus)}`);
    }
  }, [goldenCookie, spawnParticles, triggerShake, getFeverChance, startFever]);

  const handleBuy = useCallback((b, n) => {
    const count = ownedRef.current[b.id] ?? 0;
    const cost = buildingCostN(b, count, n, costDiscountRef.current);
    if (readsRef.current < cost) return;

    const newCount = count + n;
    setReads(r => Math.max(0, r - cost));
    setOwned(o => ({ ...o, [b.id]: newCount }));
    setNewBuildings(prev => { const s = new Set(prev); s.delete(b.id); return s; });
    for (let i = count + 1; i <= newCount; i++) {
      if (b.milestones?.[i]) { addToast(`${b.emoji} ${b.milestones[i]}`); triggerShake(true); }
    }
    triggerShake();
    playBuy();
  }, [triggerShake]);

  const handleBuyUpgrade = useCallback((u) => {
    if (readsRef.current < u.cost || boughtRef.current.has(u.id)) return;
    setReads(r => Math.max(0, r - u.cost));
    setBoughtUpgrades(s => new Set([...s, u.id]));
    addToast(`⬆️ ${u.name}！${u.desc}`);
    playUpgrade();
  }, []);

  // Stock market handlers
  const handleBuyShare = useCallback((channelId) => {
    const result = buyShare(marketState, channelId, readsRef.current, psRef.current);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => Math.max(0, r - result.cost));
  }, [marketState]);

  const handleSellShare = useCallback((channelId) => {
    const result = sellShare(marketState, channelId, psRef.current);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => r + result.revenue);
  }, [marketState]);

  const handleBuyAllShares = useCallback(() => {
    let state = marketState;
    let totalCost = 0;
    let bought = 0;
    const maxPerChannel = 100; // Cap per click to prevent infinite loop
    for (const ch of ['meme','cat','news','gossip','food','know']) {
      for (let i = 0; i < maxPerChannel; i++) {
        const result = buyShare(state, ch, readsRef.current - totalCost, psRef.current);
        if (!result) break;
        state = result.newState;
        totalCost += result.cost;
        bought++;
      }
    }
    if (bought > 0) {
      setMarketState(state);
      setReads(r => Math.max(0, r - totalCost));
      addToast(`📈 一口氣買入 ${bought} 股，花費 ${fmt(totalCost)}`);
    }
  }, [marketState]);

  const handleSellAllShares = useCallback(() => {
    let state = marketState;
    let totalRevenue = 0;
    let sold = 0;
    for (const ch of ['meme','cat','news','gossip','food','know']) {
      let result = sellShare(state, ch, psRef.current);
      while (result) {
        state = result.newState;
        totalRevenue += result.revenue;
        sold++;
        result = sellShare(state, ch, psRef.current);
      }
    }
    if (sold > 0) {
      setMarketState(state);
      setReads(r => r + totalRevenue);
      addToast(`📉 全部賣出 ${sold} 股，回收 ${fmt(Math.round(totalRevenue))}！`);
    }
  }, [marketState]);

  // ── Futures handlers ──
  const handleInvestFutures = useCallback((channelId, amount, riskLevel) => {
    const result = investFutures(marketState, channelId, amount, riskLevel);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => Math.max(0, r - result.cost));
    const riskLabel = riskLevel === 'aggressive' ? '積極' : '穩健';
    addToast(`📈 投資 ${fmt(amount)} 已讀期貨（${riskLabel}）`);
  }, [marketState]);

  const handleCollectFuture = useCallback((futureId) => {
    const result = collectFuture(marketState, futureId);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => r + result.payout);
    const profitLabel = result.payout > 0
      ? `回收 ${fmt(result.payout)}（×${result.mult.toFixed(2)}）`
      : '期貨到期';
    addToast(`📊 ${profitLabel}`);
    // Cross-system: profitable futures grant a temporary global production buff
    if (result.mult > 1.0) {
      const buffMult = 1 + (result.mult - 1) * 0.5; // half the profit ratio as buff
      const duration = 5 * 60 * 1000; // 5 minutes
      setBuffState(prev => addBuff(prev, {
        source: 'market',
        mult: Math.min(1.5, buffMult),
        scope: 'global',
        expiresAt: Date.now() + duration,
        label: '投資收益',
        emoji: '📈',
      }));
      addToast(`📈 投資收益 buff！生產 ×${Math.min(1.5, buffMult).toFixed(2)} 持續 5 分鐘`);
    }
  }, [marketState]);

  // ── Garden handlers ──
  const handlePlantSeed = useCallback((slotIndex) => {
    const result = plantSeed(gardenState, slotIndex);
    if (!result) return;
    setGardenState(result.newState);
  }, [gardenState]);

  const handleHarvestFlower = useCallback((slotIndex) => {
    const result = harvestFlower(gardenState, slotIndex);
    if (!result) return;
    setGardenState(result.newState);
    const tag = result.isNew ? '（新發現！）' : '';
    addToast(`${result.flower.emoji} 收穫了${result.flower.name}！${tag} 生產 ×${result.buff.mult} ${Math.round((result.buff.expiresAt - Date.now()) / 60000)}分鐘`);
  }, [gardenState]);

  const handleClearWilted = useCallback((slotIndex) => {
    const result = clearWilted(gardenState, slotIndex);
    if (result) setGardenState(result);
  }, [gardenState]);

  // ── Merge handlers ──
  const getGiftPlaceCost = useCallback(() => {
    // Gift placement costs 2% of current reads (min 10, scales with economy)
    return Math.max(10, Math.floor(readsRef.current * 0.02));
  }, []);

  const handlePlaceGift = useCallback((slotIndex) => {
    const cost = getGiftPlaceCost();
    if (readsRef.current < cost) {
      addToast(`💸 需要 ${fmt(cost)} 已讀來放置禮物`);
      return;
    }
    const result = placeGift(mergeState, slotIndex);
    if (!result) return;
    setMergeState(result.newState);
    setReads(r => Math.max(0, r - cost));
  }, [mergeState]);

  const handleMergeGifts = useCallback((srcIdx, tgtIdx) => {
    // Cross-system: garden completedSeries boosts crit chance (+5% per series)
    const critBonus = (gardenState.completedSeries?.length ?? 0) * 0.05;
    // Cross-system: garden epic/legendary buff active → merge fail immunity
    const hasEpicBuff = (gardenState.activeBuffs ?? []).some(
      b => b.expiresAt > Date.now() && b.mult >= 2.0
    );
    const result = mergeGifts(mergeState, srcIdx, tgtIdx, Date.now(), { critBonus, noFail: hasEpicBuff });
    if (!result) return null;
    setMergeState(result.newState);
    if (result.event === 'critical') {
      const t = getMergeTier(result.resultTier);
      addToast(`✨ 大成功！直接合成出 ${t.emoji} ${t.name}！`);
    } else if (result.event === 'surprise') {
      addToast(`🎉 意外驚喜！獲得額外 buff！`);
    }
    return result;
  }, [mergeState, gardenState]);

  const handleMoveGift = useCallback((fromIdx, toIdx) => {
    const result = moveGift(mergeState, fromIdx, toIdx);
    if (result) setMergeState(result);
  }, [mergeState]);

  const handleExpandGrid = useCallback(() => {
    const result = expandGrid(mergeState, readsRef.current);
    if (!result) return;
    setMergeState(result.newState);
    setReads(r => Math.max(0, r - result.cost));
    addToast(`📦 ${result.reason}`);
  }, [mergeState]);

  const handlePrestige = useCallback(() => {
    if (prestigeEarned < 1) return;
    playPrestige();
    triggerShake(true);

    // Start ceremony animation
    setPrestigeAnim('wipe');

    // Delay the actual reset to let the animation play
    setTimeout(() => {
      let startBonus = 0;
      boughtPrestige.forEach(id => {
        const node = PRESTIGE_UPGRADES.find(u => u.id === id);
        if (node) getNodeEffects(node).forEach(e => { if (e.type === 'startBonus') startBonus += e.value; });
      });
      setPrestigePower(p => p + prestigeEarned);
      setPrestigeCount(c => c + 1);
      setReads(startBonus);
      setAllTime(0);
      setOwned(buildInitialOwned());
      setBoughtUpgrades(new Set());
      setUnlockedBuildings(new Set(['ex', 'par', 'bsy']));
      setNewBuildings(new Set());
      setMarketState(prev => resetHoldings(prev));
      setGardenState(prev => resetGarden(prev));
      setMergeState(prev => resetMerge(prev));
      setBuffState(createBuffState());
      setSeenMilestones(new Set());
      setRecentMsgs([]);
      setTempMult(1);
      setActiveChain(null);
      setChainChoice(null);
      addToast(`🌀 Inbox Zero！+${prestigeEarned}已讀之力。第${prestigeCount + 1}次覺醒。${startBonus > 0 ? ` 快速啟動+${startBonus}！` : ''}`);

      // Fade out the overlay
      setPrestigeAnim('fadeOut');
      setTimeout(() => setPrestigeAnim(null), 800);
    }, 1200);
  }, [prestigeEarned, prestigeCount, boughtPrestige, triggerShake]);

  const upgradeStates = UPGRADES.map(u => {
    if (boughtUpgrades.has(u.id)) return { ...u, state: 'done' };
    const ok =
      (!u.req.allTime  || allTime >= u.req.allTime) &&
      (!u.req.building || (owned[u.req.building] ?? 0) >= u.req.count) &&
      (!u.req.buildings || u.req.buildings.every(r => (owned[r.id] ?? 0) >= r.count));
    if (!ok) return { ...u, state: 'lock' };
    return { ...u, state: reads >= u.cost ? 'buy' : 'wait' };
  }).filter(u => u.state !== 'lock');

  return (
    <div ref={gameRootRef} style={{
      height: '100vh', background: 'var(--bg)', color: 'var(--text)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans TC',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Noto+Sans+TC:wght@300;400;500;700;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fu  { 0% { opacity:1;transform:translateY(0) scale(1) rotate(0deg) } 30% { opacity:1;transform:translateY(-20px) scale(1.4) } 100% { opacity:0;transform:translateY(-70px) scale(0.8) } }
        @keyframes pu  { 0%,100% { transform:scale(1);opacity:1 } 50% { transform:scale(1.4);opacity:.5 } }
        @keyframes ci  { 0% { opacity:0;transform:scale(.3) } 60% { transform:scale(1.1) } 100% { opacity:1;transform:scale(1) } }
        @keyframes pn  { 0% { transform:scale(1) } 40% { transform:scale(1.12) } 100% { transform:scale(1) } }
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
        @keyframes marquee { 0% { transform:translateX(0) } 100% { transform:translateX(-50%) } }
        @keyframes guiltShake { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-1px) } 75% { transform:translateX(1px) } }
        @media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:0.01ms!important; animation-iteration-count:1!important; transition-duration:0.01ms!important } }
        * { box-sizing:border-box; margin:0; padding:0 }
        button { font-family:inherit; cursor:pointer }
        ::-webkit-scrollbar { width:3px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,.15); border-radius:3px }
        button:active { transform:scale(.96)!important }
        @media(min-width:768px) {
          .game-layout { flex-direction:row!important }
          .section-hero   { width:30%!important; border-right:2px solid #e2e8f0 }
          .section-middle { width:40%!important; border-right:2px solid #e2e8f0 }
          .section-store  { width:30%!important }
        }
      `}</style>

      {/* Ambient background — floating checkmarks + gradient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 25% 15%, rgba(99,102,241,.08) 0%, transparent 50%), radial-gradient(ellipse at 75% 85%, rgba(217,119,6,.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(99,102,241,.03) 0%, transparent 70%)',
      }}>
        {/* Floating tick particles — 3 layers: ✓✓, ✓, 已讀 */}
        {Array.from({ length: 24 }, (_, i) => {
          const symbols = ['✓✓', '✓', '✓', '已讀', '✓✓', '✓'];
          const sym = symbols[i % symbols.length];
          const isBlue = i % 3 !== 2;
          const baseOpacity = sym === '已讀' ? 0.04 : 0.09;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 4.2 + 1.5) % 100}%`,
              fontSize: sym === '已讀' ? 9 : (8 + (i % 5) * 3),
              color: isBlue ? `rgba(99,102,241,${baseOpacity})` : `rgba(217,119,6,${baseOpacity - 0.02})`,
              animation: `bgfloat ${14 + (i % 7) * 3}s linear infinite`,
              animationDelay: `${-(i * 1.8) % 20}s`,
              fontFamily: "'JetBrains Mono',monospace",
              fontWeight: 800,
              letterSpacing: sym === '✓✓' ? -1 : 0,
            }}>{sym}</div>
          );
        })}
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          animation: 'bgpulse 8s ease-in-out infinite',
        }} />
        {/* Diagonal line texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(99,102,241,.012) 40px, rgba(99,102,241,.012) 41px)',
        }} />
      </div>

      {/* Floating +N texts */}
      {floats.map(f => (
        <div key={f.id}
          style={{
            position: 'fixed', left: f.x - 18, top: f.y - 22,
            pointerEvents: 'none', fontWeight: 800, fontSize: 21,
            color: 'var(--amber-text)',
            textShadow: '0 0 8px rgba(180,83,9,.2), 0 1px 2px rgba(255,255,255,.8)',
            animation: 'fu .85s ease-out forwards', zIndex: 200,
            fontFamily: "'JetBrains Mono',monospace",
          }}
          onAnimationEnd={() => setFloats(fs => fs.filter(x => x.id !== f.id))}
        >{f.text}</div>
      ))}

      {/* Click burst particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: p.x, top: p.y,
          pointerEvents: 'none', zIndex: 201,
          fontSize: p.size,
          color: '#6366f1',
          fontWeight: 800,
          fontFamily: "'JetBrains Mono',monospace",
          textShadow: '0 0 6px rgba(99,102,241,.3)',
          animation: 'clickBurst .5s ease-out forwards',
          '--bx': `${p.bx}px`,
          '--by': `${p.by}px`,
        }}>{p.symbol}</div>
      ))}

      {/* Fever (已讀狂潮) overlay */}
      {fever && !fever.ended && (() => {
        const elapsed = Date.now() - fever.startedAt;
        const remaining = Math.max(0, Math.ceil((fever.duration - elapsed) / 1000));
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 400, pointerEvents: 'none',
            animation: 'feverPulse 0.5s ease-in-out infinite',
            border: '3px solid rgba(239,68,68,.6)',
            borderRadius: 0,
          }}>
            {/* Top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: 16, padding: '10px 0',
              background: 'linear-gradient(180deg, rgba(239,68,68,.85) 0%, transparent 100%)',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>
                🔥 已讀狂潮
              </span>
              <span style={{
                color: '#fef2f2', fontSize: 28, fontWeight: 900,
                fontFamily: "'JetBrains Mono', monospace",
                animation: 'feverCountdown 1s ease-out',
                key: remaining,
              }}>
                {remaining}s
              </span>
              <span style={{
                color: '#fbbf24', fontSize: 16, fontWeight: 700,
                animation: fever.combo > 1 ? 'feverComboUp 0.3s ease-out' : undefined,
              }}>
                ×{fever.combo} combo
              </span>
            </div>
            {/* Time bar */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
              background: 'rgba(239,68,68,.2)',
            }}>
              <div style={{
                height: '100%', background: '#ef4444',
                animation: `feverBarShrink ${fever.duration / 1000}s linear forwards`,
              }} />
            </div>
            {/* Click counter */}
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              color: '#fff', fontSize: 13, fontWeight: 600,
              background: 'rgba(0,0,0,.5)', padding: '6px 16px', borderRadius: 20,
            }}>
              {fever.clicks} 次點擊 · +{fmt(fever.earned)}
            </div>
          </div>
        );
      })()}

      {/* Fever result overlay */}
      {fever?.ended && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 450, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(0,0,0,.8)', borderRadius: 20, padding: '28px 40px',
            textAlign: 'center', color: '#fff',
            animation: 'feverResultEnter 0.5s ease-out forwards',
            border: '2px solid rgba(239,68,68,.4)',
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>🔥 狂潮結束！</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', marginBottom: 12 }}>
              {(fever.duration / 1000).toFixed(0)} 秒內 {fever.clicks} 次點擊
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>
              最高 ×{fever.combo} combo
            </div>
            <div style={{ fontSize: 18, color: '#34d399' }}>
              +{fmt(fever.earned)} 已讀
            </div>
          </div>
        </div>
      )}

      {/* Prestige ceremony overlay */}
      {prestigeAnim && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: prestigeAnim === 'wipe' ? 'prestigeWipe 1s ease-out forwards'
            : 'prestigeFadeOut 0.8s ease-in forwards',
        }}>
          <div style={{
            fontSize: 60, fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 40px rgba(99,102,241,.6), 0 0 80px rgba(99,102,241,.3)',
            fontFamily: "'Space Grotesk','JetBrains Mono',monospace",
            animation: 'prestigeText 1.8s ease-out forwards',
          }}>
            ✦ INBOX ZERO
          </div>
          <div style={{
            fontSize: 18, color: 'rgba(255,255,255,.7)', marginTop: 12,
            fontFamily: "'Noto Sans TC',sans-serif",
            animation: 'prestigeText 1.8s ease-out 0.3s forwards',
            opacity: 0,
          }}>
            +{prestigeEarned}已讀之力 · 第{prestigeCount + 1}次覺醒
          </div>
        </div>
      )}

      {/* Toast */}
      {toasts.slice(-1).map(t => (
        <div key={t.id}
          style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,.95)',
            color: 'var(--text)', padding: '14px 24px', borderRadius: 12, fontSize: 13,
            boxShadow: '0 8px 40px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.04)',
            zIndex: 300, maxWidth: '90vw', textAlign: 'center',
            animation: 'ti .3s cubic-bezier(.4,0,.2,1)',
            border: '1px solid var(--border)', lineHeight: 1.5,
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
          color: 'var(--amber-text)', fontWeight: 700, zIndex: 200,
          boxShadow: '0 4px 24px rgba(217,119,6,.08)',
        }}>
          {offlineBanner}
        </div>
      )}

      {/* Golden Cookie */}
      <GoldenCookie gc={goldenCookie} pos={gcPos} onClick={handleGoldenCookie} />

      {/* Combo multiplier chips — moved to left panel */}

      {/* Header and Ticker moved into columns per Figma layout */}

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="game-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT — Phone-style container */}
        <div className="section-hero" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          position: 'relative', flexShrink: 0, overflow: 'hidden',
        }}>
          {/* Dynamic progression background — changes with building tiers */}
          <HeroBackground owned={owned} allTime={allTime} />
          {/* Phone frame */}
          <div style={{
            width: '100%', maxWidth: 340, flex: 1,
            display: 'flex', flexDirection: 'column',
            borderRadius: 28,
            border: '3px solid #1e293b',
            background: '#fff',
            boxShadow: '0 8px 40px rgba(0,0,0,.12), inset 0 0 0 1px rgba(255,255,255,.8)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Phone wallpaper — subtle teal gradient */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
              background: 'linear-gradient(180deg, rgba(13,148,136,.03) 0%, transparent 40%, rgba(99,102,241,.02) 100%)',
            }} />
            {/* Phone notch */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 80, height: 22, background: 'var(--text)',
              borderRadius: '0 0 14px 14px', zIndex: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#374151', border: '1.5px solid #4b5563',
                position: 'absolute', right: 14, top: 6,
              }} />
            </div>

            {/* Status bar */}
            <div style={{
              padding: '6px 16px', paddingTop: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600,
              fontFamily: "'JetBrains Mono',monospace",
              background: 'rgba(248,250,252,.95)',
              flexShrink: 0,
            }}>
              <span>{new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}</span>
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 9 }}>📶</span>
                <span style={{ fontSize: 9 }}>🔋</span>
              </span>
            </div>

            {/* App header — 已讀收件匣 */}
            <div onClick={handleClick} style={{
              background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer', flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, color: '#fff' }}>●</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>已讀收件匣</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.7)' }}>
                  對方正在輸入...
                </div>
              </div>
              <div style={{ flex: 1 }} />
              {unlockedAchievements.length > 0 && (
                <div style={{
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                  borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>{unlockedAchievements.length}</div>
              )}
            </div>

            {/* Subtle chat wallpaper inside phone */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
              {Array.from({ length: 20 }, (_, i) => (
                <g key={i}>
                  <rect x={30 + (i % 5) * 80} y={60 + Math.floor(i / 5) * 180} width={50 + (i % 3) * 20} height={14} rx={7} fill="#6366f1" />
                  <rect x={200 + (i % 4) * 40} y={120 + Math.floor(i / 4) * 160} width={40 + (i % 2) * 30} height={14} rx={7} fill="#94a3b8" />
                </g>
              ))}
            </svg>

            {/* Counter — center of phone screen, clickable */}
            <button
              onClick={handleClick}
              style={{
                padding: '8px 0 4px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {(() => {
                const counterColor = reads >= 1e12 ? '#7c3aed'
                  : reads >= 1e9 ? '#b45309'
                  : reads >= 1e6 ? '#4f46e5'
                  : '#1e293b';
                const counterGlow = reads >= 1e9
                  ? `0 0 30px ${counterColor}22, 0 0 60px ${counterColor}11`
                  : 'none';
                return (
                  <span style={{
                    fontSize: 80, fontWeight: 900,
                    fontFamily: "'Space Grotesk','JetBrains Mono',monospace",
                    color: counterColor,
                    animation: popAnim ? 'pn .18s ease-out' : 'none',
                    letterSpacing: -3, lineHeight: 1,
                    textShadow: counterGlow,
                    transition: 'color .5s, text-shadow .5s',
                  }}>
                    {fmt(reads)}
                  </span>
                );
              })()}
              <span style={{
                fontSize: 14, color: 'var(--text-muted)', marginTop: 4,
                fontFamily: "'JetBrains Mono',monospace",
              }}>
                <CheckIcon size={11} color="#94a3b8" /> {prodPerSec > 0 ? `${fmt(prodPerSec)}/秒` : '點擊開始已讀'}
              </span>
              {allTime > 0 && (
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)', marginTop: 2,
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  生涯 {fmt(allTime)} · 建築 {Object.values(owned).reduce((s, v) => s + v, 0)} · 升級 {boughtUpgrades.size}/{UPGRADES.length}
                </span>
              )}
            </button>

          {/* Boost chips moved to mini-game panel buff bar */}

          {/* Guilt indicator — always visible, between CPS and ClickArea */}
          <div style={{
            width: '100%', marginBottom: 10,
            padding: '8px 10px', borderRadius: 10,
            background: guilt < 200 ? 'rgba(148,163,184,.03)'
              : coldMaster ? 'rgba(20,184,166,.06)'
              : guiltLevel === 'high' ? 'rgba(239,68,68,.05)'
              : guiltLevel === 'medium' ? 'rgba(245,158,11,.04)'
              : 'rgba(99,102,241,.03)',
            border: `1px solid ${guilt < 200 ? 'rgba(148,163,184,.1)'
              : coldMaster ? 'rgba(20,184,166,.15)'
              : guiltLevel === 'high' ? 'rgba(239,68,68,.15)'
              : guiltLevel === 'medium' ? 'rgba(245,158,11,.1)'
              : 'rgba(99,102,241,.08)'}`,
            transition: 'all .5s',
            animation: guiltLevel === 'high' ? 'guiltShake 0.5s ease-in-out infinite' : 'none',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: guilt >= 200 ? 4 : 0,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
                color: guilt < 200 ? '#cbd5e1'
                  : coldMaster ? '#14b8a6'
                  : guiltLevel === 'high' ? '#ef4444'
                  : guiltLevel === 'medium' ? '#f59e0b'
                  : '#94a3b8',
              }}>
                {guilt < 200 ? '😶 罪惡感尚未覺醒' : coldMaster ? '🧊 冷漠大師' : '😔 罪惡感'}
              </span>
              {/* Show penalty clearly */}
              {guilt >= 200 && !coldMaster && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 6px', borderRadius: 4,
                  background: guiltLevel === 'high' ? 'rgba(239,68,68,.15)' : guiltLevel === 'medium' ? 'rgba(245,158,11,.12)' : 'rgba(99,102,241,.08)',
                  color: guiltLevel === 'high' ? '#ef4444' : guiltLevel === 'medium' ? '#f59e0b' : '#6366f1',
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  產能 {guiltLevel === 'high' ? '-60%' : guiltLevel === 'medium' ? '-30%' : '-10%'}
                </span>
              )}
              <span style={{ flex: 1 }} />
              {guilt >= 200 && (
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  fontFamily: "'JetBrains Mono',monospace",
                  color: coldMaster ? '#14b8a6'
                    : guiltLevel === 'high' ? '#ef4444'
                    : guiltLevel === 'medium' ? '#f59e0b'
                    : '#6366f1',
                }}>
                  {coldMaster ? '∞' : Math.floor(guilt)}
                </span>
              )}
            </div>
            {guilt >= 200 && (
              <>
                <div style={{
                  height: 4, background: 'rgba(0,0,0,.05)', borderRadius: 3,
                  overflow: 'hidden', marginBottom: coldMaster ? 0 : 6,
                }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    transition: 'width .3s, background .5s',
                    width: coldMaster ? '100%' : `${Math.min(100, (guilt / GUILT_THRESHOLDS.transcend) * 100)}%`,
                    background: coldMaster ? 'linear-gradient(90deg, #14b8a6, #06b6d4)'
                      : guiltLevel === 'high' ? 'linear-gradient(90deg, #ef4444, #f97316)'
                      : guiltLevel === 'medium' ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #6366f1, #818cf8)',
                    boxShadow: guiltLevel === 'high' ? '0 0 8px rgba(239,68,68,.4)' : 'none',
                  }} />
                </div>
                {!coldMaster && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {GUILT_RELIEF.map(r => {
                      const now = Date.now();
                      const onCooldown = guiltCooldowns[r.id] && now < guiltCooldowns[r.id];
                      const cdLeft = onCooldown ? Math.ceil((guiltCooldowns[r.id] - now) / 1000) : 0;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleGuiltRelief(r)}
                          disabled={onCooldown || guilt < 10}
                          title={`${r.name}：${r.desc}（-${r.guiltReduce}罪惡感）`}
                          style={{
                            fontSize: 14, padding: '8px 12px', borderRadius: 8, minHeight: 44,
                            border: '1px solid var(--border)',
                            background: onCooldown ? 'var(--surface-hover)' : 'var(--surface)',
                            cursor: onCooldown ? 'default' : 'pointer',
                            opacity: onCooldown ? 0.35 : 1,
                            fontFamily: 'inherit', transition: 'all .15s',
                            boxShadow: !onCooldown && guilt > 200 ? '0 1px 4px rgba(0,0,0,.06)' : 'none',
                          }}
                        >
                          {r.emoji}{onCooldown ? ` ${cdLeft}s` : ''}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

            {/* ClickArea — chat messages inside phone */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
              <ClickArea
                message={message}
                isRead={isRead}
                isFirstClick={showHint && !started}
                popAnim={popAnim}
                recentMessages={recentMsgs}
                onClick={handleClick}
                guilt={guilt}
                guiltLevel={guiltLevel}
              />
            </div>

            {/* Phone home indicator */}
            <div style={{
              padding: '6px 0', display: 'flex', justifyContent: 'center',
              flexShrink: 0, background: '#fff',
            }}>
              <div style={{
                width: 100, height: 4, borderRadius: 2,
                background: 'var(--text)', opacity: 0.2,
              }} />
            </div>
          </div>{/* end phone frame */}
        </div>

        {/* MIDDLE — Ticker + Mini-Game */}
        <div className="section-middle" style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
          background: 'linear-gradient(180deg, rgba(99,102,241,.02) 0%, rgba(99,102,241,.01) 100%)',
        }}>

          {/* Ticker — news/events at top of middle column */}
          <Ticker allTime={allTime} logEntries={log} />

          {/* Mini-Game panel — building sub-systems */}
          <MiniGamePanel
            owned={owned}
            activeMiniGame={activeMiniGame}
            setActiveMiniGame={setActiveMiniGame}
            marketState={marketState}
            reads={reads}
            onBuyShare={handleBuyShare}
            onSellShare={handleSellShare}
            onBuyAllShares={handleBuyAllShares}
            onSellAllShares={handleSellAllShares}
            onInvestFutures={handleInvestFutures}
            onCollectFuture={handleCollectFuture}
            prodPerSec={prodPerSec}
            gardenState={gardenState}
            onPlant={handlePlantSeed}
            onHarvest={handleHarvestFlower}
            onClearWilted={handleClearWilted}
            mergeState={mergeState}
            reads={reads}
            onPlaceGift={handlePlaceGift}
            giftPlaceCost={getGiftPlaceCost()}
            onMergeGifts={handleMergeGifts}
            onMoveGift={handleMoveGift}
            onExpandGrid={handleExpandGrid}
            onMiniGameEarn={handleMiniGameEarn}
            buffState={buffState}
            onStartStorm={handleStartStorm}
            onStormComplete={handleStormComplete}
            onStormPerfect={handleStormPerfect}
            stormActive={stormActive}
            onQuantumResonance={handleQuantumResonance}
            onGardenHarvestChoice={handleGardenHarvestChoice}
            onSendGift={handleSendGift}
          />

        </div>

        {/* RIGHT — Header + Store: Upgrades + Buildings */}
        <div className="section-store" style={{
          display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0,
          background: 'linear-gradient(180deg, rgba(245,158,11,.02) 0%, rgba(245,158,11,.01) 100%)',
        }}>

          {/* Header bar — now inside right column */}
          <div style={{
            padding: '8px 12px', display: 'flex', alignItems: 'center',
            flexShrink: 0, gap: 8,
            borderBottom: '1px solid var(--border)',
            background: 'rgba(255,255,255,.6)',
            position: 'relative',
          }}>
            <HeaderBanner />
            {/* Logo */}
            <div style={{
              width: 24, height: 24, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CheckIcon size={12} color="#fff" />
            </div>
            <span style={{
              fontSize: 13, fontWeight: 800, color: 'var(--text)',
              letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace",
            }}>已讀</span>
            {prestigePower > 0 && (
              <span style={{
                fontSize: 9, color: 'var(--purple-text)',
                background: 'rgba(99,102,241,.08)',
                padding: '1px 6px', borderRadius: 6,
                fontFamily: "'JetBrains Mono',monospace",
                border: '1px solid rgba(99,102,241,.15)',
              }}>✦{prestigePower}</span>
            )}
            <button onClick={() => setShowAchievements(true)} style={{
              fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono',monospace",
              background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.15)',
              borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
              minHeight: 44, fontWeight: 600,
            }}>
              {unlockedAchievements.size}/{ACHIEVEMENTS.filter(a => !a.hidden).length}⭐
            </button>
            <div style={{ flex: 1 }} />
            {prestigeCount > 0 && (
              <button onClick={() => setShowPrestigeShop(true)} style={{
                background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)',
                borderRadius: 6, padding: '8px 12px', color: 'var(--purple-text)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'JetBrains Mono',monospace", minHeight: 44,
              }}>✦商店</button>
            )}
            {prestigeEarned >= 1 && (
              <button onClick={handlePrestige} style={{
                background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))',
                color: 'var(--text-on-dark)', border: 'none', borderRadius: 6,
                padding: '8px 12px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,.3)', minHeight: 44,
              }}>重生 +✦{prestigeEarned}</button>
            )}
            <button onClick={() => { const m = toggleMute(); setMutedUI(m); }} style={{
              background: 'var(--surface-hover)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 12px', color: 'var(--text-secondary)', fontSize: 14,
              minWidth: 44, minHeight: 44, cursor: 'pointer',
            }}>{mutedUI ? '🔇' : '🔊'}</button>
          </div>

          {/* Upgrades — compact, capped height */}
          <div style={{
            maxHeight: '25%', overflowY: 'auto', flexShrink: 0,
            borderBottom: '2px solid var(--border)',
            background: 'rgba(99,102,241,.02)',
            position: 'relative', overflowX: 'hidden',
          }}>
            <UpgradeBanner />
            {upgradeStates.length > 0 ? (
              <UpgradeRow upgrades={upgradeStates} reads={reads} onBuy={handleBuyUpgrade} onBuyAll={() => {
                // Buy all affordable upgrades, tracking remaining reads
                let remaining = readsRef.current;
                const toBuy = upgradeStates.filter(u => u.state === 'buy').sort((a, b) => a.cost - b.cost);
                const bought = [];
                for (const u of toBuy) {
                  if (remaining >= u.cost && !boughtRef.current.has(u.id)) {
                    remaining -= u.cost;
                    bought.push(u);
                  }
                }
                if (bought.length > 0) {
                  const totalCost = bought.reduce((s, u) => s + u.cost, 0);
                  setReads(r => Math.max(0, r - totalCost));
                  setBoughtUpgrades(s => {
                    const next = new Set(s);
                    bought.forEach(u => next.add(u.id));
                    return next;
                  });
                  addToast(`⬆️ 一口氣升級 ${bought.length} 個！`);
                }
              }} compact />
            ) : (
              <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                繼續已讀就會解鎖升級
              </div>
            )}
          </div>

          {/* Buildings — fills remaining space, single column */}
          <BuildingList
            buildings={BUILDINGS}
            owned={owned}
            reads={reads}
            allTime={allTime}
            unlockedBuildings={unlockedBuildings}
            newBuildings={newBuildings}
            buyN={buyN}
            onBuy={handleBuy}
            setBuyN={setBuyN}
            singleColumn
            costDiscount={costDiscount}
          />
        </div>
      </div>

      {/* Prestige Shop Modal */}
      {showPrestigeShop && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowPrestigeShop(false); }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '20px 24px',
            maxWidth: 500, width: '90vw', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>✦ 已讀之力商店</div>
              <button
                onClick={() => setShowPrestigeShop(false)}
                style={{
                  background: 'var(--surface-hover)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13,
                  cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'inherit',
                  minHeight: 44,
                }}
              >關閉</button>
            </div>
            <PrestigeShop
              prestigePower={prestigePower}
              boughtPrestige={boughtPrestige}
              onBuy={handleBuyPrestige}
            />
          </div>
        </div>
      )}

      {/* Achievement Panel Modal */}
      {showAchievements && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowAchievements(false); }}>
          <div style={{
            background: '#fff', borderRadius: 16,
            maxWidth: 560, width: '92vw', maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,.15)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px 0',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1,
              borderRadius: '16px 16px 0 0',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>🎖️ 成就總覽</div>
              <button
                onClick={() => setShowAchievements(false)}
                style={{
                  background: 'var(--surface-hover)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13,
                  cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'inherit',
                  minHeight: 44,
                }}
              >關閉</button>
            </div>
            <MilestonePanel unlockedAchievements={unlockedAchievements} allTime={allTime} />
          </div>
        </div>
      )}

      {/* Read Storm mini-game */}
      <ReadStorm
        active={stormActive}
        perSecond={prodPerSec}
        onComplete={handleStormComplete}
        onPerfect={handleStormPerfect}
      />

      {/* Reply Trap */}
      <ReplyTrap trap={replyTrap} onReply={handleReply} onIgnore={handleIgnore} />

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
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              ⚡ {chainChoice.chain.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>選擇你的應對方式：</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chainChoice.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleChainChoice(opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', borderRadius: 12,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--purple)'; e.target.style.background = '#f0f0ff'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg)'; }}
                >
                  <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticker removed — replaced by top marquee */}

      {/* Hidden cheat panel — type "iddqd" to toggle */}
      {cheatMode && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
          background: 'rgba(0,0,0,.92)', color: '#0f0', padding: '12px 16px',
          fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
        }}>
          <span style={{ color: '#f00', fontWeight: 700 }}>CHEAT</span>
          <button onClick={() => { setReads(r => r + 1e6); setAllTime(a => a + 1e6); }} style={cheatBtnStyle}>+1M已讀</button>
          <button onClick={() => { setReads(r => r + 1e9); setAllTime(a => a + 1e9); }} style={cheatBtnStyle}>+1B已讀</button>
          <button onClick={() => { setReads(r => r + 1e12); setAllTime(a => a + 1e12); }} style={cheatBtnStyle}>+1T已讀</button>
          <button onClick={() => setPrestigePower(p => p + 10)} style={cheatBtnStyle}>+10✦</button>
          <button onClick={() => setPrestigePower(p => p + 100)} style={cheatBtnStyle}>+100✦</button>
          <button onClick={() => setPrestigePower(p => p + 500)} style={cheatBtnStyle}>+500✦</button>
          <input
            type="number"
            placeholder="自訂已讀數"
            style={{
              background: '#111', color: '#0f0', border: '1px solid #0f0',
              padding: '4px 8px', borderRadius: 4, width: 120, fontSize: 12,
              fontFamily: "'JetBrains Mono',monospace",
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = Number(e.target.value);
                if (v > 0) { setReads(v); setAllTime(v); e.target.value = ''; }
              }
            }}
          />
          <span style={{ color: '#666', fontSize: 10 }}>reads={fmt(reads)} allTime={fmt(allTime)} ✦={prestigePower} ps={fmt(prodPerSec)}/s</span>
          <button onClick={() => setCheatMode(false)} style={{ ...cheatBtnStyle, color: '#f00', borderColor: '#f00' }}>關閉</button>
        </div>
      )}
    </div>
  );
}

const cheatBtnStyle = {
  background: 'transparent', color: '#0f0', border: '1px solid #0f0',
  borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11,
  fontFamily: "'JetBrains Mono',monospace",
};
