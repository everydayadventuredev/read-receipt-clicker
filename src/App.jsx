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
import { StatsPanel, LogPanel, AchievementBadges } from './ui/Panels.jsx';
import { HeaderBanner, TickerBanner, CounterBanner, ChatBanner, UpgradeBanner } from './ui/SectionBanners.jsx';

import { createMarketState, tickMarket, buyShare, sellShare, resetHoldings } from './game/stockMarket.js';
import { createGardenState, tickGarden, plantSeed, harvestFlower, clearWilted, getGardenBuffMult, getGardenExBuffMult, getSeriesBonusMult, resetGarden } from './game/garden.js';
import { createMergeState, tickMerge, placeGift, mergeGifts, moveGift, expandGrid, getMergeBuffMult, getMergePermMult, resetMerge, getTier as getMergeTier } from './game/merge.js';

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
  const [tempMult,   setTempMult]   = useState(1);
  const [tempMultExpiry, setTempMultExpiry] = useState(0); // timestamp when tempMult expires
  const [mutedUI,    setMutedUI]    = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(null);
  const [prodPerSec, setProdPerSec] = useState(0);
  const [showPrestigeShop, setShowPrestigeShop] = useState(false);
  const [marketState,      setMarketState]      = useState(() => init.marketState ?? createMarketState());
  const [gardenState,      setGardenState]      = useState(() => init.gardenState ?? createGardenState());
  const [mergeState,       setMergeState]       = useState(() => init.mergeState ?? createMergeState());
  const [activeMiniGame,   setActiveMiniGame]   = useState(null);

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

  // Auto-expire tempMult
  useEffect(() => {
    if (tempMultExpiry <= 0 || tempMult <= 1) return;
    const remaining = tempMultExpiry - Date.now();
    if (remaining <= 0) { setTempMult(1); return; }
    const t = setTimeout(() => setTempMult(1), remaining);
    return () => clearTimeout(t);
  }, [tempMultExpiry, tempMult]);



  const prestigeMult   = 1 + prestigePower * 0.1;
  // Prestige bonus for earned ✦
  const prestigeBonusMult = (boughtPrestige.has('ps27') ? 2.0 : boughtPrestige.has('ps9') ? 1.5 : 1);
  const prestigeEarned = Math.floor(Math.sqrt(allTime / 50000) * prestigeBonusMult);

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
      // Upgrade multipliers (building-specific + global)
      UPGRADES.forEach(u => {
        if (!boughtUpgrades.has(u.id)) return;
        if (u.type === 'm' && u.target === b.id) m *= u.bonus;
        if (u.type === 'g') m *= u.bonus;
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
      // Garden ex-scope buff (only for 前任)
      if (b.id === 'ex') m *= getGardenExBuffMult(gardenState);
      p += b.baseProd * (owned[b.id] ?? 0) * m;
    });
    const coldMasterMult = coldMaster ? 1.5 : 1;
    const gardenBuff = getGardenBuffMult(gardenState);
    const gardenSeries = getSeriesBonusMult(gardenState);
    const mergeBuff = getMergeBuffMult(mergeState);
    const mergePerm = getMergePermMult(mergeState);
    const total = p * prestigeMult * prestigeGlobalMult * chainGlobalBuff * tempMult * coldMasterMult * gardenBuff * gardenSeries * mergeBuff * mergePerm;
    setProdPerSec(total);
    psRef.current = total;
  }, [owned, boughtUpgrades, prestigeMult, prestigeGlobalMult, chainGlobalBuff, tempMult, boughtPrestige, eventChainBuffs, gardenState, mergeState]);

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

  // Garden tick — every 3s when ex >= 1
  useEffect(() => {
    if ((owned.ex ?? 0) < 1) return;
    const iv = setInterval(() => {
      setGardenState(prev => tickGarden(prev, ownedRef.current.ex ?? 0));
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
      stormCount, stormPerfect, guilt, coldMaster, marketState, gardenState, mergeState,
    });
  }, [prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings, boughtPrestige, activeSynergies, completedChains, eventChainBuffs, stormCount, stormPerfect, guilt, coldMaster, marketState, gardenState, mergeState]);

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
  const gcFreqMult = (boughtPrestige.has('ps5') ? 0.7 : 1) * (boughtUpgrades.has('gc2') ? 0.7 : 1);
  const gcDurMult = boughtUpgrades.has('gc4') ? 1.5 : 1;
  useEffect(() => {
    if (!hasGoldenCookie) return;
    let t;
    const spawn = () => {
      t = setTimeout(() => {
        const pool = GOLDEN_COOKIES.filter(e => !e.minAt || allTimeRef.current >= e.minAt);
        // Add mega event if gc5 unlocked
        if (boughtRef.current.has('gc5') && Math.random() < 0.08) {
          setGoldenCookie({ type: 'mult5', mult: 10, dur: 5, toast: '宇宙彩券頭獎！×10 已讀！', minAt: 0 });
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
    setGuilt(g => g + 1);
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

    const durMult = boughtUpgrades.has('gc4') ? 1.5 : 1;
    const powerBonus = boughtUpgrades.has('gc3') ? 1 : 0;
    if (gc.type === 'mult') {
      setTempMult(2 + powerBonus);
      setTempMultExpiry(Date.now() + gc.dur * 1000 * durMult);
      addToast(`🚀 ${gc.toast}`);
    } else if (gc.type === 'mult5') {
      setTempMult(5 + powerBonus);
      setTempMultExpiry(Date.now() + gc.dur * 1000 * durMult);
      addToast(`🔥 ${gc.toast}`);
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

  // Stock market handlers
  const handleBuyShare = useCallback((channelId) => {
    const result = buyShare(marketState, channelId, readsRef.current, psRef.current);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => r - result.cost);
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
      setReads(r => r - totalCost);
      addToast(`📈 一口氣買入 ${bought} 股！`);
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
  const handlePlaceGift = useCallback((slotIndex) => {
    const result = placeGift(mergeState, slotIndex);
    if (!result) return;
    setMergeState(result.newState);
  }, [mergeState]);

  const handleMergeGifts = useCallback((srcIdx, tgtIdx) => {
    const result = mergeGifts(mergeState, srcIdx, tgtIdx);
    if (!result) return null;
    setMergeState(result.newState);
    if (result.event === 'critical') {
      const t = getMergeTier(result.resultTier);
      addToast(`✨ 大成功！直接合成出 ${t.emoji} ${t.name}！`);
    } else if (result.event === 'surprise') {
      addToast(`🎉 意外驚喜！獲得額外 buff！`);
    }
    return result;
  }, [mergeState]);

  const handleMoveGift = useCallback((fromIdx, toIdx) => {
    const result = moveGift(mergeState, fromIdx, toIdx);
    if (result) setMergeState(result);
  }, [mergeState]);

  const handleExpandGrid = useCallback(() => {
    const result = expandGrid(mergeState, readsRef.current);
    if (!result) return;
    setMergeState(result.newState);
    setReads(r => r - result.cost);
    addToast(`📦 ${result.reason}`);
  }, [mergeState]);

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
    setMarketState(prev => resetHoldings(prev)); // reset holdings, keep market running
    setGardenState(prev => resetGarden(prev)); // reset slots/seeds/buffs, keep collection
    setMergeState(prev => resetMerge(prev)); // reset grid/gifts, keep highestTier
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
      (!u.req.building || (owned[u.req.building] ?? 0) >= u.req.count) &&
      (!u.req.buildings || u.req.buildings.every(r => (owned[r.id] ?? 0) >= r.count));
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
          .section-hero   { width:25%!important; border-right:1px solid #e2e8f0 }
          .section-middle { width:45%!important; border-right:1px solid #e2e8f0 }
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

      {/* Combo multiplier bar — shows all active boosts */}
      {(() => {
        const gardenBuff = getGardenBuffMult(gardenState);
        const gardenExBuff = getGardenExBuffMult(gardenState);
        const mergeBuff = getMergeBuffMult(mergeState);
        const boosts = [];
        if (tempMult > 1) boosts.push({ icon: '🔥', label: `×${tempMult}`, color: '#6366f1', sub: tempMultExpiry > 0 ? `${Math.max(0, Math.ceil((tempMultExpiry - Date.now()) / 1000))}s` : '' });
        if (gardenBuff > 1) boosts.push({ icon: '🌸', label: `×${gardenBuff.toFixed(1)}`, color: '#22c55e', sub: '全局' });
        if (gardenExBuff > 1) boosts.push({ icon: '💔', label: `×${gardenExBuff.toFixed(1)}`, color: '#f43f5e', sub: '前任' });
        if (mergeBuff > 1) boosts.push({ icon: '🎁', label: `×${mergeBuff.toFixed(1)}`, color: '#f59e0b', sub: '合成' });
        if (coldMaster) boosts.push({ icon: '🧊', label: '×1.5', color: '#06b6d4', sub: '冷漠' });
        const totalCombo = tempMult * gardenBuff * mergeBuff * (coldMaster ? 1.5 : 1);
        if (boosts.length === 0) return null;
        return (
          <div style={{
            position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(99,102,241,.15)',
            borderRadius: 14, padding: '5px 12px', zIndex: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,.06)',
          }}>
            {boosts.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '2px 8px', borderRadius: 8,
                background: `${b.color}10`, border: `1px solid ${b.color}20`,
              }}>
                <span style={{ fontSize: 12 }}>{b.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.color, fontFamily: "'JetBrains Mono',monospace" }}>{b.label}</span>
                {b.sub && <span style={{ fontSize: 9, color: '#94a3b8' }}>{b.sub}</span>}
              </div>
            ))}
            {boosts.length >= 2 && (
              <div style={{
                padding: '2px 8px', borderRadius: 8,
                background: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(245,158,11,.1))',
                border: '1px solid rgba(99,102,241,.2)',
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#4338ca', fontFamily: "'JetBrains Mono',monospace" }}>
                  = ×{totalCombo.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        );
      })()}

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
            {/* Phone notch */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 80, height: 22, background: '#1e293b',
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
              fontSize: 10, color: '#64748b', fontWeight: 600,
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
                  {prodPerSec > 0 ? `${fmt(prodPerSec)}/秒` : '對方正在輸入...'}
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
                fontSize: 14, color: '#94a3b8', marginTop: 4,
                fontFamily: "'JetBrains Mono',monospace",
              }}>
                <CheckIcon size={11} color="#94a3b8" /> {prodPerSec > 0 ? `${fmt(prodPerSec)}/秒` : '點擊開始已讀'}
              </span>
              {allTime > 0 && (
                <span style={{
                  fontSize: 10, color: '#cbd5e1', marginTop: 2,
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  生涯 {fmt(allTime)} · 大師 {Object.values(owned).reduce((s, v) => s + v, 0)} · 升級 {boughtUpgrades.size}/{UPGRADES.length}
                </span>
              )}
            </button>

          {/* Guilt indicator — always visible, between CPS and ClickArea */}
          <div style={{
            width: '100%', marginBottom: 10,
            padding: '8px 10px', borderRadius: 10,
            background: guilt < 50 ? 'rgba(148,163,184,.03)'
              : coldMaster ? 'rgba(20,184,166,.06)'
              : guiltLevel === 'high' ? 'rgba(239,68,68,.05)'
              : guiltLevel === 'medium' ? 'rgba(245,158,11,.04)'
              : 'rgba(99,102,241,.03)',
            border: `1px solid ${guilt < 50 ? 'rgba(148,163,184,.1)'
              : coldMaster ? 'rgba(20,184,166,.15)'
              : guiltLevel === 'high' ? 'rgba(239,68,68,.15)'
              : guiltLevel === 'medium' ? 'rgba(245,158,11,.1)'
              : 'rgba(99,102,241,.08)'}`,
            transition: 'all .5s',
            animation: guiltLevel === 'high' ? 'guiltShake 0.5s ease-in-out infinite' : 'none',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: guilt >= 50 ? 4 : 0,
            }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
                color: guilt < 50 ? '#cbd5e1'
                  : coldMaster ? '#14b8a6'
                  : guiltLevel === 'high' ? '#ef4444'
                  : guiltLevel === 'medium' ? '#f59e0b'
                  : '#94a3b8',
              }}>
                {guilt < 50 ? '😶 罪惡感尚未覺醒' : coldMaster ? '🧊 冷漠大師' : '😔 罪惡感'}
              </span>
              <span style={{ flex: 1 }} />
              {guilt >= 50 && (
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
            {guilt >= 50 && (
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
                            fontSize: 13, padding: '4px 10px', borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            background: onCooldown ? '#f1f5f9' : '#fff',
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
                background: '#1e293b', opacity: 0.2,
              }} />
            </div>
          </div>{/* end phone frame */}
        </div>

        {/* MIDDLE — Ticker + Mini-Game */}
        <div className="section-middle" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

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
            prodPerSec={prodPerSec}
            gardenState={gardenState}
            onPlant={handlePlantSeed}
            onHarvest={handleHarvestFlower}
            onClearWilted={handleClearWilted}
            mergeState={mergeState}
            reads={reads}
            onPlaceGift={handlePlaceGift}
            onMergeGifts={handleMergeGifts}
            onMoveGift={handleMoveGift}
            onExpandGrid={handleExpandGrid}
          />

        </div>

        {/* RIGHT — Header + Store: Upgrades + Buildings */}
        <div className="section-store" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Header bar — now inside right column */}
          <div style={{
            padding: '8px 12px', display: 'flex', alignItems: 'center',
            flexShrink: 0, gap: 8,
            borderBottom: '1px solid #e2e8f0',
            background: 'rgba(255,255,255,.6)',
            position: 'relative',
          }}>
            <HeaderBanner />
            {/* Logo */}
            <div style={{
              width: 24, height: 24, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #4338ca)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CheckIcon size={12} color="#fff" />
            </div>
            <span style={{
              fontSize: 13, fontWeight: 800, color: '#1e293b',
              letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace",
            }}>已讀</span>
            {prestigePower > 0 && (
              <span style={{
                fontSize: 9, color: '#4f46e5',
                background: 'rgba(99,102,241,.08)',
                padding: '1px 6px', borderRadius: 6,
                fontFamily: "'JetBrains Mono',monospace",
                border: '1px solid rgba(99,102,241,.15)',
              }}>✦{prestigePower}</span>
            )}
            <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>
              {unlockedAchievements.length}/{103}⭐
            </span>
            <div style={{ flex: 1 }} />
            {prestigeCount > 0 && (
              <button onClick={() => setShowPrestigeShop(true)} style={{
                background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)',
                borderRadius: 6, padding: '3px 8px', color: '#4f46e5',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'JetBrains Mono',monospace",
              }}>✦商店</button>
            )}
            {prestigeEarned >= 1 && (
              <button onClick={handlePrestige} style={{
                background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                color: '#fff', border: 'none', borderRadius: 6,
                padding: '3px 10px', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,.3)',
              }}>重生 +✦{prestigeEarned}</button>
            )}
            <button onClick={() => { const m = toggleMute(); setMutedUI(m); }} style={{
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 6, padding: '3px 8px', color: '#64748b', fontSize: 12,
            }}>{mutedUI ? '🔇' : '🔊'}</button>
          </div>

          {/* Upgrades — compact, capped height */}
          <div style={{
            maxHeight: '25%', overflowY: 'auto', flexShrink: 0,
            borderBottom: '2px solid #e2e8f0',
            background: 'rgba(99,102,241,.02)',
            position: 'relative', overflow: 'hidden',
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
                  setReads(r => r - totalCost);
                  setBoughtUpgrades(s => {
                    const next = new Set(s);
                    bought.forEach(u => next.add(u.id));
                    return next;
                  });
                  addToast(`⬆️ 一口氣升級 ${bought.length} 個！`);
                }
              }} compact />
            ) : (
              <div style={{ padding: '8px 12px', fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
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
              <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>✦ 已讀之力商店</div>
              <button
                onClick={() => setShowPrestigeShop(false)}
                style={{
                  background: '#f1f5f9', border: '1px solid #e2e8f0',
                  borderRadius: 8, padding: '4px 12px', fontSize: 12,
                  cursor: 'pointer', color: '#64748b', fontFamily: 'inherit',
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

      {/* Ticker removed — replaced by top marquee */}
    </div>
  );
}
