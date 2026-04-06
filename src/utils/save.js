import { BUILDINGS } from '../game/buildings.js';
import { LEGACY_ID_MAP, SKILL_TREE_NODES } from '../game/prestige.js';

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
      buffState: state.buffState ? {
        activeBuffs: state.buffState.activeBuffs,
        quantumResonance: state.buffState.quantumResonance,
        stormCooldownEnd: state.buffState.stormCooldownEnd,
        quantumCooldownEnd: state.buffState.quantumCooldownEnd,
      } : null,
      marketState: state.marketState ? {
        prices: state.marketState.prices,
        holdings: state.marketState.holdings,
        costBasis: state.marketState.costBasis,
        history: state.marketState.history,
        modes: state.marketState.modes,
        modeTimers: state.marketState.modeTimers,
        futures: state.marketState.futures ?? [],
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

/** Migrate old ps-IDs to new st-IDs, auto-grant prerequisites, refund excess ✦. */
function migratePrestige(rawIds, data) {
  const hasLegacy = rawIds.some(id => id.startsWith('ps'));
  if (!hasLegacy) return new Set(rawIds); // already migrated or fresh

  // Map old IDs to new IDs (deduplicate)
  const mapped = new Set();
  let oldTotalCost = 0;
  for (const id of rawIds) {
    const newId = LEGACY_ID_MAP[id];
    if (newId) {
      mapped.add(newId);
      // Track old cost for refund calc (approximate: use new node cost)
    } else if (id.startsWith('st-')) {
      mapped.add(id); // already new format
    }
  }

  // Auto-grant prerequisites for all owned nodes
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of SKILL_TREE_NODES) {
      if (mapped.has(node.id) && node.requires) {
        for (const req of node.requires) {
          if (!mapped.has(req)) {
            mapped.add(req);
            changed = true;
          }
        }
      }
    }
  }

  // Calculate new total cost and refund difference to prestigePower
  let newTotalCost = 0;
  for (const node of SKILL_TREE_NODES) {
    if (mapped.has(node.id)) newTotalCost += node.cost;
  }
  // Ensure player doesn't go negative — set prestigePower to max(0, old - newCost)
  const currentPower = data.prestigePower ?? 0;
  // Old spent = unknown exactly, so just ensure they keep their current power
  // The auto-granted prereqs are free (generous migration)
  data.prestigePower = currentPower;

  return mapped;
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
      boughtPrestige: migratePrestige(data.boughtPrestige ?? [], data),
      activeSynergies: new Set(data.activeSynergies ?? []),
      completedChains: new Set(data.completedChains ?? []),
      eventChainBuffs: data.eventChainBuffs ?? {},
      stormCount: data.stormCount ?? 0,
      stormPerfect: data.stormPerfect ?? 0,
      guilt: data.guilt ?? 0,
      coldMaster: data.coldMaster ?? false,
      buffState: data.buffState ?? null,
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
