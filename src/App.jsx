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

import { createMarketState, tickMarket, buyShare, sellShare, resetHoldings } from './game/stockMarket.js';
import { createGardenState, tickGarden, plantSeed, harvestFlower, clearWilted, getGardenBuffMult, getSeriesBonusMult, resetGarden } from './game/garden.js';

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
  const [mutedUI,    setMutedUI]    = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(null);
  const [prodPerSec, setProdPerSec] = useState(0);
  const [showPrestigeShop, setShowPrestigeShop] = useState(false);
  const [marketState,      setMarketState]      = useState(() => init.marketState ?? createMarketState());
  const [gardenState,      setGardenState]      = useState(() => init.gardenState ?? createGardenState());
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
      p += b.baseProd * (owned[b.id] ?? 0) * m;
    });
    const coldMasterMult = coldMaster ? 1.5 : 1;
    const gardenBuff = getGardenBuffMult(gardenState);
    const gardenSeries = getSeriesBonusMult(gardenState);
    const total = p * prestigeMult * prestigeGlobalMult * chainGlobalBuff * tempMult * coldMasterMult * gardenBuff * gardenSeries;
    setProdPerSec(total);
    psRef.current = total;
  }, [owned, boughtUpgrades, prestigeMult, prestigeGlobalMult, chainGlobalBuff, tempMult, boughtPrestige, eventChainBuffs, gardenState]);

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

  const saveState = useCallback(() => {
    saveGame({
      reads: readsRef.current, allTime: allTimeRef.current, owned: ownedRef.current,
      boughtUpgrades: boughtRef.current, prestigeCount, prestigePower,
      seenMilestones, unlockedAchievements, unlockedBuildings,
      boughtPrestige, activeSynergies, completedChains, eventChainBuffs,
      stormCount, stormPerfect, guilt, coldMaster, marketState, gardenState,
    });
  }, [prestigeCount, prestigePower, seenMilestones, unlockedAchievements, unlockedBuildings, boughtPrestige, activeSynergies, completedChains, eventChainBuffs, stormCount, stormPerfect, guilt, coldMaster, marketState, gardenState]);

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

  // Stock market handlers
  const handleBuyShare = useCallback((channelId) => {
    const result = buyShare(marketState, channelId, readsRef.current);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => r - result.cost);
  }, [marketState]);

  const handleSellShare = useCallback((channelId) => {
    const result = sellShare(marketState, channelId);
    if (!result) return;
    setMarketState(result.newState);
    setReads(r => r + result.revenue);
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
        padding: '10px 16px', display: 'flex', alignItems: 'center',
        flexShrink: 0, gap: 10, minHeight: 48,
        background: 'rgba(255,255,255,.8)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(99,102,241,.25)',
          }}>
            <CheckIcon size={14} color="#fff" />
          </div>
          <span style={{
            fontSize: 14, fontWeight: 800, color: '#1e293b',
            letterSpacing: 2,
            fontFamily: "'JetBrains Mono',monospace",
          }}>已讀</span>
          {prestigePower > 0 && (
            <span style={{
              fontSize: 10, color: '#4f46e5',
              background: 'rgba(99,102,241,.08)',
              padding: '2px 8px', borderRadius: 8,
              fontFamily: "'JetBrains Mono',monospace",
              border: '1px solid rgba(99,102,241,.15)',
            }}>✦{prestigePower}</span>
          )}
        </div>

        {/* Achievements — compact in header */}
        <div style={{ flex: 1, overflow: 'hidden', margin: '0 8px' }}>
          <AchievementBadges unlockedAchievements={unlockedAchievements} maxVisible={8} />
        </div>

        {/* Right buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Prestige shop button */}
          {prestigeCount > 0 && (
            <button
              onClick={() => setShowPrestigeShop(true)}
              style={{
                background: 'rgba(99,102,241,.08)',
                border: '1px solid rgba(99,102,241,.2)',
                borderRadius: 8, padding: '5px 10px',
                color: '#4f46e5', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace",
              }}
            >✦商店</button>
          )}
          {/* Prestige button */}
          {prestigeEarned >= 1 && (
            <button
              onClick={handlePrestige}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '5px 12px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(99,102,241,.3)',
              }}
            >
              <span style={{
                position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s ease-in-out infinite', pointerEvents: 'none',
              }} />
              重生 +✦{prestigeEarned}
            </button>
          )}
          {/* Mute button */}
          <button
            onClick={() => { const m = toggleMute(); setMutedUI(m); }}
            style={{
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 8, padding: '5px 10px',
              color: '#64748b', fontSize: 13,
            }}
          >{mutedUI ? '🔇' : '🔊'}</button>
        </div>

        {/* Prestige progress thin bar at header bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: '#e2e8f0',
        }}>
          {(() => {
            const progress = Math.min(100, (allTime / 500000) * 100);
            const isComplete = progress >= 100;
            let barGrad = 'linear-gradient(90deg, #6366f1, #4338ca)';
            if (isComplete) barGrad = 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)';
            return (
              <div style={{
                height: '100%', width: `${progress}%`,
                background: barGrad,
                backgroundSize: isComplete ? '300% 100%' : '100% 100%',
                transition: 'width .3s',
                animation: isComplete ? 'rainbowBreath 2s ease-in-out infinite' : 'none',
                boxShadow: progress >= 50 ? '0 0 8px rgba(99,102,241,.4)' : 'none',
              }} />
            );
          })()}
        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <Ticker allTime={allTime} logEntries={log} />

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="game-layout" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT — Counter + Guilt + Click (3 core blocks only) */}
        <div className="section-hero" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 14px 12px',
          position: 'relative', flexShrink: 0,
        }}>
          {/* Hero counter — the star of the show */}
          {(() => {
            const counterColor = reads >= 1e12 ? '#7c3aed'
              : reads >= 1e9 ? '#b45309'
              : reads >= 1e6 ? '#4f46e5'
              : '#1e293b';
            const counterGlow = reads >= 1e9
              ? `0 0 30px ${counterColor}22, 0 0 60px ${counterColor}11`
              : 'none';
            return (
              <div style={{
                fontSize: 80, fontWeight: 900,
                fontFamily: "'Space Grotesk','JetBrains Mono',monospace",
                color: counterColor,
                animation: popAnim ? 'pn .18s ease-out' : 'none',
                letterSpacing: -4, lineHeight: 1,
                marginBottom: 2,
                textShadow: counterGlow,
                transition: 'color .5s, text-shadow .5s',
              }}>
                {fmt(reads)}
              </div>
            );
          })()}

          {/* CPS subtitle */}
          <div style={{
            fontSize: prodPerSec >= 1e6 ? 18 : 16,
            color: prodPerSec >= 1e6 ? '#b45309' : '#94a3b8',
            fontFamily: "'JetBrains Mono',monospace",
            fontWeight: prodPerSec >= 1e6 ? 700 : 400,
            marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all .3s',
          }}>
            <CheckIcon size={13} color={prodPerSec >= 1e6 ? '#b45309' : '#94a3b8'} />
            {prodPerSec > 0 ? `${fmt(prodPerSec)}/秒` : '點擊開始已讀'}
          </div>

          {/* Compact stats — key info only */}
          {allTime > 0 && (
            <div style={{
              display: 'flex', gap: 8, marginBottom: 8,
              fontSize: 10, color: '#94a3b8',
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              <span>生涯 {fmt(allTime)}</span>
              <span>·</span>
              <span>大師 {Object.values(owned).reduce((s, v) => s + v, 0)}</span>
              <span>·</span>
              <span>升級 {boughtUpgrades.size}/{UPGRADES.length}</span>
            </div>
          )}

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

          {/* ClickArea — the primary interaction, fills remaining space */}
          <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center' }}>
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
        </div>

        {/* MIDDLE — Stats + Mini-Game + Feedback */}
        <div className="section-middle" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Mini-Game panel — building sub-systems */}
          <MiniGamePanel
            owned={owned}
            activeMiniGame={activeMiniGame}
            setActiveMiniGame={setActiveMiniGame}
            marketState={marketState}
            reads={reads}
            onBuyShare={handleBuyShare}
            onSellShare={handleSellShare}
            gardenState={gardenState}
            onPlant={handlePlantSeed}
            onHarvest={handleHarvestFlower}
            onClearWilted={handleClearWilted}
          />

        </div>

        {/* RIGHT — Store: Upgrades + Buildings */}
        <div className="section-store" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* Upgrades — compact, capped height */}
          <div style={{
            maxHeight: '35%', overflowY: 'auto', flexShrink: 0,
            borderBottom: '2px solid #e2e8f0',
            background: 'rgba(99,102,241,.02)',
          }}>
            {upgradeStates.length > 0 ? (
              <UpgradeRow upgrades={upgradeStates} reads={reads} onBuy={handleBuyUpgrade} compact />
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
