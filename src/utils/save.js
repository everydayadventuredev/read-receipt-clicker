import { BUILDINGS } from '../game/buildings.js';

const SAVE_KEY = 'rrc_save_v1';

export function buildInitialOwned() {
  return Object.fromEntries(BUILDINGS.map(b => [b.id, 0]));
}

export function saveGame(state) {
  try {
    const data = {
      reads: state.reads,
      allTime: state.allTime,
      owned: state.owned,
      boughtUpgrades: [...state.boughtUpgrades],
      prestigeCount: state.prestigeCount,
      prestigePower: state.prestigePower,
      seenMilestones: [...state.seenMilestones],
      unlockedAchievements: [...state.unlockedAchievements],
      unlockedBuildings: [...state.unlockedBuildings],
      boughtPrestige: [...(state.boughtPrestige ?? [])],
      activeSynergies: [...(state.activeSynergies ?? [])],
      completedChains: [...(state.completedChains ?? [])],
      eventChainBuffs: state.eventChainBuffs ?? {},
      stormCount: state.stormCount ?? 0,
      stormPerfect: state.stormPerfect ?? 0,
      guilt: state.guilt ?? 0,
      coldMaster: state.coldMaster ?? false,
      marketState: state.marketState ? {
        prices: state.marketState.prices,
        holdings: state.marketState.holdings,
        costBasis: state.marketState.costBasis,
        history: state.marketState.history,
        modes: state.marketState.modes,
        modeTimers: state.marketState.modeTimers,
      } : null,
      gardenState: state.gardenState ? {
        slots: state.gardenState.slots,
        seeds: state.gardenState.seeds,
        lastSeedTick: state.gardenState.lastSeedTick,
        collection: state.gardenState.collection,
        completedSeries: state.gardenState.completedSeries,
        activeBuffs: state.gardenState.activeBuffs,
      } : null,
      mergeState: state.mergeState ? {
        grid: state.mergeState.grid,
        gridSize: state.mergeState.gridSize,
        lastGiftTick: state.mergeState.lastGiftTick,
        pendingGifts: state.mergeState.pendingGifts,
        totalMerges: state.mergeState.totalMerges,
        highestTier: state.mergeState.highestTier,
        activeBuffs: state.mergeState.activeBuffs,
      } : null,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      reads: data.reads ?? 0,
      allTime: data.allTime ?? 0,
      owned: data.owned ?? buildInitialOwned(),
      boughtUpgrades: new Set(data.boughtUpgrades ?? []),
      prestigeCount: data.prestigeCount ?? 0,
      prestigePower: data.prestigePower ?? 0,
      seenMilestones: new Set(data.seenMilestones ?? []),
      unlockedAchievements: new Set(data.unlockedAchievements ?? []),
      unlockedBuildings: new Set(data.unlockedBuildings ?? ['ex', 'par', 'bsy']),
      boughtPrestige: new Set(data.boughtPrestige ?? []),
      activeSynergies: new Set(data.activeSynergies ?? []),
      completedChains: new Set(data.completedChains ?? []),
      eventChainBuffs: data.eventChainBuffs ?? {},
      stormCount: data.stormCount ?? 0,
      stormPerfect: data.stormPerfect ?? 0,
      guilt: data.guilt ?? 0,
      coldMaster: data.coldMaster ?? false,
      marketState: data.marketState ?? null,
      gardenState: data.gardenState ?? null,
      mergeState: data.mergeState ?? null,
      savedAt: data.savedAt ?? null,
    };
  } catch (e) {
    console.warn('Load failed:', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

/** Returns offline earnings based on time elapsed and production per second */
export function calcOfflineEarnings(savedAt, productionPerSec) {
  if (!savedAt || productionPerSec <= 0) return 0;
  const elapsed = Math.max(0, (Date.now() - savedAt) / 1000); // seconds
  const cappedElapsed = Math.min(elapsed, 8 * 3600); // cap at 8 hours
  return Math.floor(cappedElapsed * productionPerSec * 0.5); // 50% offline efficiency
}
