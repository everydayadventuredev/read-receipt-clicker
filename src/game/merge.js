/**
 * 伴手禮合成 (Gift Merge) Mini-Game
 * Tied to the 爸媽 (par) building.
 *
 * "每次回家都要帶伴手禮。爸媽嘴上說不用，但你知道他們會跟鄰居炫耀。"
 *
 * 4×4 merge grid. Combine gifts to create higher-tier gifts.
 * Random elements: critical merge (skip tier), surprise items, failures.
 * Relative visitors (阿姨/舅舅) randomly appear and steal low-tier items.
 */

// ═══════════════════════════════════════════════
// GIFT TIERS
// ═══════════════════════════════════════════════

export const GIFT_TIERS = [
  { tier: 1, name: '水果',     emoji: '🍎', color: '#94a3b8', buffMult: 1.05, desc: '路邊買的' },
  { tier: 2, name: '甜點',     emoji: '🧁', color: '#10b981', buffMult: 1.10, desc: '巷口那家' },
  { tier: 3, name: '禮盒',     emoji: '🎁', color: '#3b82f6', buffMult: 1.20, desc: '包裝精美' },
  { tier: 4, name: '紅包',     emoji: '🧧', color: '#dc2626', buffMult: 1.40, desc: '最實在的' },
  { tier: 5, name: '名牌包',   emoji: '👜', color: '#7c3aed', buffMult: 1.80, desc: '媽媽的最愛' },
  { tier: 6, name: '帝王蟹',   emoji: '🦀', color: '#f97316', buffMult: 2.50, desc: '全家族炫耀' },
  { tier: 7, name: '黃金擺件', emoji: '🏆', color: '#eab308', buffMult: 4.00, desc: '傳家之寶' },
];

export function getTier(tierNum) {
  return GIFT_TIERS.find(t => t.tier === tierNum) ?? GIFT_TIERS[0];
}

// ═══════════════════════════════════════════════
// VISITOR (親戚) EVENTS
// ═══════════════════════════════════════════════

export const VISITORS = [
  { id: 'aunt',  name: '阿姨',   emoji: '👩', stealMaxTier: 2, message: '阿姨：「這個我帶走囉～」' },
  { id: 'uncle', name: '舅舅',   emoji: '👨', stealMaxTier: 3, message: '舅舅：「不錯嘛，借我嚐嚐」' },
  { id: 'granny', name: '奶奶', emoji: '👵', stealMaxTier: 1, message: '奶奶：「這個給隔壁王太太」' },
  { id: 'cousin', name: '表哥', emoji: '🧑', stealMaxTier: 2, message: '表哥：「正好缺個伴手禮」' },
];

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════

export const GRID_SIZE       = 16;      // 4×4
export const BASE_GRID       = 9;       // start with 3×3 = 9 usable cells
export const GIFT_INTERVAL   = 30000;   // new gift every 30s per par building
export const MAX_TIER        = 7;
export const VISITOR_CHANCE  = 0.08;    // 8% per tick to trigger visitor
export const CRIT_CHANCE     = 0.15;    // 15% chance to skip a tier on merge
export const FAIL_CHANCE     = 0.10;    // 10% chance merge produces surprise item instead
export const EXPAND_COSTS    = [500, 2000, 8000, 50000, 200000, 1000000, 5000000]; // cost to expand grid by 1

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════

/**
 * Create initial merge state.
 */
export function createMergeState() {
  return {
    grid: new Array(GRID_SIZE).fill(null),  // null or { tier: number }
    gridSize: BASE_GRID,                     // how many cells are usable
    lastGiftTick: Date.now(),
    pendingGifts: 2,                         // start with 2 gifts to place
    activeVisitor: null,                     // { visitor, stolenSlots, expiresAt } or null
    totalMerges: 0,
    highestTier: 0,
    activeBuffs: [],                         // [{ tier, mult, expiresAt }]
  };
}

// ═══════════════════════════════════════════════
// TICK
// ═══════════════════════════════════════════════

/**
 * Tick function — called every 3s.
 * Generates new gifts, handles visitor events, expires buffs.
 */
export function tickMerge(state, parCount, now = Date.now()) {
  if (!state) return createMergeState();

  let newPending = state.pendingGifts;
  let newLastTick = state.lastGiftTick;
  let newVisitor = state.activeVisitor;
  let newGrid = state.grid;
  let changed = false;

  // 1. Generate new gifts
  const elapsed = now - (state.lastGiftTick ?? now);
  if (elapsed >= GIFT_INTERVAL && parCount > 0) {
    const giftsToAdd = Math.floor(elapsed / GIFT_INTERVAL) * Math.max(1, Math.floor(parCount / 3));
    newPending = Math.min(16, newPending + giftsToAdd);
    newLastTick = state.lastGiftTick + Math.floor(elapsed / GIFT_INTERVAL) * GIFT_INTERVAL;
    changed = true;
  }

  // 2. Visitor logic
  if (newVisitor) {
    if (now >= newVisitor.expiresAt) {
      newVisitor = null;
      changed = true;
    }
  } else if (Math.random() < VISITOR_CHANCE && countItems(state.grid) >= 3) {
    // Maybe spawn a visitor
    const visitor = VISITORS[Math.floor(Math.random() * VISITORS.length)];
    const stealable = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      if (newGrid[i] && newGrid[i].tier <= visitor.stealMaxTier) {
        stealable.push(i);
      }
    }
    if (stealable.length > 0) {
      // Steal 1-2 items
      const toSteal = stealable.slice(0, Math.min(2, stealable.length));
      newGrid = [...newGrid];
      for (const idx of toSteal) {
        newGrid[idx] = null;
      }
      newVisitor = {
        visitor,
        stolenCount: toSteal.length,
        expiresAt: now + 5000, // show message for 5s
      };
      changed = true;
    }
  }

  // 3. Expire buffs
  const newBuffs = state.activeBuffs.filter(b => b.expiresAt > now);
  const buffsChanged = newBuffs.length !== state.activeBuffs.length;

  if (!changed && !buffsChanged) return state;

  return {
    ...state,
    grid: newGrid,
    pendingGifts: newPending,
    lastGiftTick: newLastTick,
    activeVisitor: newVisitor,
    activeBuffs: newBuffs,
  };
}

// ═══════════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════════

/**
 * Place a new tier-1 gift on an empty cell.
 */
export function placeGift(state, slotIndex) {
  if (!state || state.pendingGifts <= 0) return null;
  if (slotIndex < 0 || slotIndex >= state.gridSize) return null;
  if (state.grid[slotIndex] !== null) return null;

  const newGrid = [...state.grid];
  newGrid[slotIndex] = { tier: 1 };

  return {
    newState: {
      ...state,
      grid: newGrid,
      pendingGifts: state.pendingGifts - 1,
    },
  };
}

/**
 * Merge two adjacent same-tier gifts.
 * source → target. Source cell becomes empty, target becomes tier+1.
 * Random events: crit (skip tier), fail (surprise), normal.
 */
export function mergeGifts(state, sourceIdx, targetIdx, now = Date.now()) {
  if (!state) return null;
  const src = state.grid[sourceIdx];
  const tgt = state.grid[targetIdx];
  if (!src || !tgt) return null;
  if (src.tier !== tgt.tier) return null;
  if (src.tier >= MAX_TIER) return null;

  const newGrid = [...state.grid];
  let resultTier = src.tier + 1;
  let event = 'normal';

  // Random merge events
  const roll = Math.random();
  if (roll < CRIT_CHANCE && resultTier < MAX_TIER) {
    // Critical merge — skip a tier!
    resultTier = Math.min(MAX_TIER, resultTier + 1);
    event = 'critical';
  } else if (roll < CRIT_CHANCE + FAIL_CHANCE) {
    // Surprise — same tier but get a buff immediately
    event = 'surprise';
  }

  newGrid[sourceIdx] = null;
  newGrid[targetIdx] = { tier: resultTier };

  const newHighest = Math.max(state.highestTier, resultTier);

  // Surprise event gives immediate buff
  let newBuffs = state.activeBuffs;
  if (event === 'surprise') {
    const tier = getTier(resultTier);
    newBuffs = [...newBuffs, {
      tier: resultTier,
      mult: tier.buffMult,
      expiresAt: now + 5 * 60 * 1000, // 5 min buff
    }];
  }

  // Tier 6+ merge triggers special buff
  if (resultTier >= 6) {
    const tier = getTier(resultTier);
    newBuffs = [...newBuffs, {
      tier: resultTier,
      mult: tier.buffMult,
      expiresAt: now + 10 * 60 * 1000, // 10 min buff
    }];
  }

  return {
    newState: {
      ...state,
      grid: newGrid,
      totalMerges: state.totalMerges + 1,
      highestTier: newHighest,
      activeBuffs: newBuffs,
    },
    event,
    resultTier,
  };
}

/**
 * Move a gift from one cell to another empty cell.
 */
export function moveGift(state, fromIdx, toIdx) {
  if (!state) return null;
  if (fromIdx === toIdx) return null;
  if (toIdx < 0 || toIdx >= state.gridSize) return null;
  if (!state.grid[fromIdx]) return null;
  if (state.grid[toIdx] !== null) return null;

  const newGrid = [...state.grid];
  newGrid[toIdx] = newGrid[fromIdx];
  newGrid[fromIdx] = null;

  return { ...state, grid: newGrid };
}

/**
 * Expand the grid by 1 cell. Costs reads.
 * Returns { newState, cost } or null.
 */
export function expandGrid(state, currentReads) {
  if (!state) return null;
  if (state.gridSize >= GRID_SIZE) return null;

  const expandIdx = state.gridSize - BASE_GRID;
  const cost = EXPAND_COSTS[expandIdx] ?? 999999999;
  if (currentReads < cost) return null;

  return {
    newState: {
      ...state,
      gridSize: state.gridSize + 1,
    },
    cost,
    reason: '你的已讀讓阿姨生氣了，決定不再來拜訪',
  };
}

// ═══════════════════════════════════════════════
// BUFF CALCULATIONS
// ═══════════════════════════════════════════════

/**
 * Get combined buff multiplier from active merge buffs.
 */
export function getMergeBuffMult(state, now = Date.now()) {
  if (!state || !state.activeBuffs) return 1;
  let mult = 1;
  for (const b of state.activeBuffs) {
    if (b.expiresAt > now) mult *= b.mult;
  }
  return mult;
}

/**
 * Get permanent bonus from highest tier reached.
 * Each tier above 3 gives +2% permanent.
 */
export function getMergePermMult(state) {
  if (!state) return 1;
  const bonus = Math.max(0, state.highestTier - 3) * 0.02;
  return 1 + bonus;
}

/**
 * Reset merge state on prestige. Keeps highestTier for permanent bonus.
 */
export function resetMerge(state) {
  if (!state) return createMergeState();
  return {
    ...createMergeState(),
    highestTier: state.highestTier,
  };
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

function countItems(grid) {
  return grid.filter(x => x !== null).length;
}
