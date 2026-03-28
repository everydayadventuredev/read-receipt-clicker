/**
 * 放下花園 (Letting Go Garden) Mini-Game
 * Tied to the 前任 (ex) building.
 *
 * "前任離開前說：每次想點開對話的時候，就種一棵樹吧。"
 *
 * Plant seeds → wait 2 hours → random flower (gacha) → harvest for buff.
 * Collection/圖鑑 system with series completion bonuses.
 */

// ═══════════════════════════════════════════════
// RARITY SYSTEM
// ═══════════════════════════════════════════════

export const RARITY = {
  common:    { id: 'common',    label: '普通', color: '#94a3b8', weight: 55 },
  good:      { id: 'good',      label: '優良', color: '#10b981', weight: 25 },
  rare:      { id: 'rare',      label: '稀有', color: '#3b82f6', weight: 13 },
  epic:      { id: 'epic',      label: '史詩', color: '#a855f7', weight: 5 },
  legendary: { id: 'legendary', label: '傳說', color: '#f59e0b', weight: 2 },
};

// ═══════════════════════════════════════════════
// FLOWER DEFINITIONS — 20 flowers, 4 series × 5
// ═══════════════════════════════════════════════

export const FLOWERS = [
  // ── 遺忘之花 (Flowers of Forgetting) ──
  { id: 'f01', name: '勿忘我',     emoji: '💜', rarity: 'common',    series: 'forget', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f02', name: '枯萎玫瑰',   emoji: '🥀', rarity: 'common',    series: 'forget', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f03', name: '紙花',       emoji: '🌼', rarity: 'good',      series: 'forget', buffMult: 1.25, buffDuration: 60*60*1000,  scope: 'ex' },
  { id: 'f04', name: '水晶淚',     emoji: '💧', rarity: 'rare',      series: 'forget', buffMult: 1.50, buffDuration: 2*60*60*1000, scope: 'ex' },
  { id: 'f05', name: '虛空蘭',     emoji: '🕳️', rarity: 'legendary', series: 'forget', buffMult: 3.00, buffDuration: 60*60*1000,  scope: 'global' },

  // ── 釋懷之花 (Flowers of Release) ──
  { id: 'f06', name: '蒲公英',     emoji: '🌾', rarity: 'common',    series: 'release', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f07', name: '野花',       emoji: '🌻', rarity: 'common',    series: 'release', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f08', name: '夕陽百合',   emoji: '🌅', rarity: 'good',      series: 'release', buffMult: 1.25, buffDuration: 60*60*1000,  scope: 'ex' },
  { id: 'f09', name: '月見草',     emoji: '🌙', rarity: 'rare',      series: 'release', buffMult: 1.50, buffDuration: 2*60*60*1000, scope: 'ex' },
  { id: 'f10', name: '鳳凰花',     emoji: '🔥', rarity: 'epic',      series: 'release', buffMult: 2.00, buffDuration: 3*60*60*1000, scope: 'global' },

  // ── 新生之花 (Flowers of Rebirth) ──
  { id: 'f11', name: '嫩芽',       emoji: '🌱', rarity: 'common',    series: 'rebirth', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f12', name: '幸運草',     emoji: '🍀', rarity: 'common',    series: 'rebirth', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f13', name: '竹子',       emoji: '🎋', rarity: 'good',      series: 'rebirth', buffMult: 1.25, buffDuration: 60*60*1000,  scope: 'ex' },
  { id: 'f14', name: '櫻花',       emoji: '🌸', rarity: 'rare',      series: 'rebirth', buffMult: 1.50, buffDuration: 2*60*60*1000, scope: 'ex' },
  { id: 'f15', name: '金蓮',       emoji: '🪷', rarity: 'epic',      series: 'rebirth', buffMult: 2.00, buffDuration: 3*60*60*1000, scope: 'global' },

  // ── 永恆之花 (Flowers of Eternity) ──
  { id: 'f16', name: '苔蘚',       emoji: '🪨', rarity: 'common',    series: 'eternal', buffMult: 1.10, buffDuration: 30*60*1000,  scope: 'ex' },
  { id: 'f17', name: '常春藤',     emoji: '🌿', rarity: 'good',      series: 'eternal', buffMult: 1.25, buffDuration: 60*60*1000,  scope: 'ex' },
  { id: 'f18', name: '星花',       emoji: '⭐', rarity: 'good',      series: 'eternal', buffMult: 1.25, buffDuration: 60*60*1000,  scope: 'ex' },
  { id: 'f19', name: '極光玫瑰',   emoji: '🌈', rarity: 'rare',      series: 'eternal', buffMult: 1.50, buffDuration: 2*60*60*1000, scope: 'ex' },
  { id: 'f20', name: '宇宙櫻',     emoji: '🌌', rarity: 'legendary', series: 'eternal', buffMult: 3.00, buffDuration: 60*60*1000,  scope: 'global' },
];

export const SERIES = [
  { id: 'forget',  name: '遺忘之花', emoji: '🌫️', desc: '放下過去的執念',     flowerIds: ['f01','f02','f03','f04','f05'] },
  { id: 'release', name: '釋懷之花', emoji: '🍃', desc: '讓風帶走不甘',       flowerIds: ['f06','f07','f08','f09','f10'] },
  { id: 'rebirth', name: '新生之花', emoji: '🌅', desc: '從灰燼中重新綻放',   flowerIds: ['f11','f12','f13','f14','f15'] },
  { id: 'eternal', name: '永恆之花', emoji: '✨', desc: '超越時間的花語',      flowerIds: ['f16','f17','f18','f19','f20'] },
];

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════

export const GROWTH_TIME    = 2 * 60 * 60 * 1000;     // 2 hours
export const WILT_TIME      = 6 * 60 * 60 * 1000;   // 6 hours after maturity
export const SEED_INTERVAL  = 10 * 60 * 1000;        // 10 minutes per ex building
export const MAX_SEEDS      = 32;
export const GRID_SIZE      = 16;                     // 4×4
export const SERIES_BONUS   = 1.05;                   // per completed series

// ═══════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════

const FLOWER_BY_ID = {};
for (const f of FLOWERS) FLOWER_BY_ID[f.id] = f;

const FLOWERS_BY_RARITY = {};
for (const f of FLOWERS) {
  if (!FLOWERS_BY_RARITY[f.rarity]) FLOWERS_BY_RARITY[f.rarity] = [];
  FLOWERS_BY_RARITY[f.rarity].push(f);
}

export function getFlowerById(id) {
  return FLOWER_BY_ID[id] ?? null;
}

/**
 * Roll a random flower using weighted rarity.
 */
function rollFlower() {
  const totalWeight = Object.values(RARITY).reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * totalWeight;

  let pickedRarity = 'common';
  for (const r of Object.values(RARITY)) {
    roll -= r.weight;
    if (roll <= 0) { pickedRarity = r.id; break; }
  }

  const pool = FLOWERS_BY_RARITY[pickedRarity] ?? FLOWERS_BY_RARITY.common;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Calculate unlocked field count from ex building count.
 */
export function getFieldCount(exCount) {
  return Math.min(8, Math.max(1, Math.floor(exCount / 3)));
}

// ═══════════════════════════════════════════════
// STATE MANAGEMENT (Pure Functions)
// ═══════════════════════════════════════════════

/**
 * Create initial garden state.
 */
export function createGardenState() {
  return {
    slots: new Array(GRID_SIZE).fill(null),
    seeds: 3, // start with 3 seeds as tutorial
    lastSeedTick: Date.now(),
    collection: {},       // { flowerId: true } — persists through prestige
    completedSeries: [],  // series IDs — persists through prestige
    activeBuffs: [],      // [{ flowerId, mult, scope, expiresAt }]
  };
}

/**
 * Tick function — called every 3s from App.jsx.
 * Generates seeds, matures flowers, wilts old flowers, expires buffs.
 */
export function tickGarden(state, exCount, now = Date.now()) {
  if (!state) return createGardenState();

  let newSeeds = state.seeds;
  let newLastSeedTick = state.lastSeedTick;
  const newSlots = [...state.slots];
  let changed = false;

  // 1. Generate seeds based on elapsed time
  const elapsed = now - (state.lastSeedTick ?? now);
  if (elapsed >= SEED_INTERVAL && exCount > 0) {
    const seedsToAdd = Math.floor(elapsed / SEED_INTERVAL) * exCount;
    newSeeds = Math.min(MAX_SEEDS, newSeeds + seedsToAdd);
    newLastSeedTick = state.lastSeedTick + Math.floor(elapsed / SEED_INTERVAL) * SEED_INTERVAL;
    changed = true;
  }

  // 2. Check each slot for maturity / wilting
  for (let i = 0; i < GRID_SIZE; i++) {
    const slot = newSlots[i];
    if (!slot || slot.wilted) continue;

    // Growing → mature (assign random flower)
    if (!slot.flowerId && (now - slot.plantedAt) >= GROWTH_TIME) {
      const flower = rollFlower();
      newSlots[i] = { ...slot, flowerId: flower.id, maturedAt: now };
      changed = true;
    }

    // Mature → wilted
    if (slot.flowerId && slot.maturedAt && !slot.wilted) {
      if ((now - slot.maturedAt) >= WILT_TIME) {
        newSlots[i] = { ...slot, wilted: true };
        changed = true;
      }
    }
  }

  // 3. Expire active buffs
  const newBuffs = state.activeBuffs.filter(b => b.expiresAt > now);
  const buffsChanged = newBuffs.length !== state.activeBuffs.length;

  if (!changed && !buffsChanged) return state; // no changes

  return {
    ...state,
    slots: newSlots,
    seeds: newSeeds,
    lastSeedTick: newLastSeedTick,
    activeBuffs: newBuffs,
  };
}

/**
 * Plant a seed in a specific slot.
 */
export function plantSeed(state, slotIndex, now = Date.now()) {
  if (!state || state.seeds <= 0) return null;
  if (slotIndex < 0 || slotIndex >= GRID_SIZE) return null;

  const slot = state.slots[slotIndex];
  // Can plant in empty or wilted slots
  if (slot && !slot.wilted) return null;

  const newSlots = [...state.slots];
  newSlots[slotIndex] = { plantedAt: now };

  return {
    newState: {
      ...state,
      slots: newSlots,
      seeds: state.seeds - 1,
    },
  };
}

/**
 * Harvest a mature flower.
 * Returns { newState, flower, buff } or null.
 */
export function harvestFlower(state, slotIndex, now = Date.now()) {
  if (!state) return null;
  const slot = state.slots[slotIndex];
  if (!slot || !slot.flowerId || slot.wilted) return null;

  const flower = getFlowerById(slot.flowerId);
  if (!flower) return null;

  // Create buff
  const buff = {
    flowerId: flower.id,
    mult: flower.buffMult,
    scope: flower.scope,
    expiresAt: now + flower.buffDuration,
  };

  // Update collection
  const isNew = !state.collection[flower.id];
  const newCollection = isNew
    ? { ...state.collection, [flower.id]: true }
    : state.collection;

  // Check series completion
  let newCompletedSeries = state.completedSeries;
  if (isNew) {
    for (const series of SERIES) {
      if (newCompletedSeries.includes(series.id)) continue;
      const allFound = series.flowerIds.every(fid => newCollection[fid]);
      if (allFound) {
        newCompletedSeries = [...newCompletedSeries, series.id];
      }
    }
  }

  // Clear slot
  const newSlots = [...state.slots];
  newSlots[slotIndex] = null;

  return {
    newState: {
      ...state,
      slots: newSlots,
      collection: newCollection,
      completedSeries: newCompletedSeries,
      activeBuffs: [...state.activeBuffs, buff],
    },
    flower,
    buff,
    isNew,
  };
}

/**
 * Clear a wilted flower slot.
 */
export function clearWilted(state, slotIndex) {
  if (!state) return null;
  const slot = state.slots[slotIndex];
  if (!slot || !slot.wilted) return null;

  const newSlots = [...state.slots];
  newSlots[slotIndex] = null;

  return { ...state, slots: newSlots };
}

// ═══════════════════════════════════════════════
// BUFF CALCULATIONS
// ═══════════════════════════════════════════════

/**
 * Get combined multiplier from active buffs (non-expired).
 * scope can be 'ex' (only ex building) or 'global' (all).
 * For production calc: call with scope='global' for global line,
 * and additionally apply scope='ex' buffs to the ex building.
 */
/**
 * Get combined multiplier from active buffs.
 * ADDITIVE stacking with cap to prevent number explosion.
 * e.g., 3 buffs of ×1.1 = 1 + 0.1 + 0.1 + 0.1 = 1.3x (not 1.1^3 = 1.33x)
 * Capped at 3.0x total.
 */
export function getGardenBuffMult(state, now = Date.now()) {
  if (!state || !state.activeBuffs) return 1;
  let bonus = 0;
  for (const b of state.activeBuffs) {
    if (b.expiresAt > now) {
      bonus += (b.mult - 1); // additive: ×1.5 contributes +0.5
    }
  }
  return Math.min(3.0, 1 + bonus); // cap at 3x
}

/**
 * Get permanent series completion multiplier.
 */
export function getSeriesBonusMult(state) {
  if (!state || !state.completedSeries) return 1;
  return Math.pow(SERIES_BONUS, state.completedSeries.length);
}

/**
 * Reset garden on prestige. Keeps collection + completedSeries.
 */
export function resetGarden(state) {
  if (!state) return createGardenState();
  return {
    ...createGardenState(),
    collection: state.collection,
    completedSeries: state.completedSeries,
  };
}
