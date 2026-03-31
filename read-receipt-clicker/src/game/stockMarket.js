/**
 * Stock Market Mini-Game — "已讀期貨"
 * Tied to the 社群演算法 (algo) building.
 *
 * Content channels have fluctuating "reach rates" (prices).
 * Players invest reads as "futures" — lock reads for 15 minutes,
 * choose risk level. Returns based on price changes during lock.
 */

export const CHANNELS = [
  { id: 'meme',   name: '迷因', emoji: '😂', basePrice: 50,  modeWeights: { stable: 1, rising: 2, falling: 2, chaotic: 5 } },
  { id: 'cat',    name: '貓貓', emoji: '🐱', basePrice: 30,  modeWeights: { stable: 5, rising: 3, falling: 1, chaotic: 1 } },
  { id: 'news',   name: '新聞', emoji: '📰', basePrice: 80,  modeWeights: { stable: 2, rising: 3, falling: 3, chaotic: 2 } },
  { id: 'gossip', name: '八卦', emoji: '💬', basePrice: 40,  modeWeights: { stable: 1, rising: 2, falling: 2, chaotic: 5 } },
  { id: 'food',   name: '美食', emoji: '🍜', basePrice: 60,  modeWeights: { stable: 3, rising: 2, falling: 2, chaotic: 3 } },
  { id: 'know',   name: '知識', emoji: '📚', basePrice: 100, modeWeights: { stable: 7, rising: 2, falling: 1, chaotic: 0 } },
];

const MODE_PARAMS = {
  stable:  { base: 0,      vol: 0.03 },
  rising:  { base: 0.012,  vol: 0.02 },
  falling: { base: -0.012, vol: 0.02 },
  chaotic: { base: 0,      vol: 0.08 },
};

const MODES = ['stable', 'rising', 'falling', 'chaotic'];
const HISTORY_LEN = 30;
const MODE_SWITCH_MIN = 15; // ticks (30s at 2s/tick)
const MODE_SWITCH_MAX = 45; // ticks (90s)

function pickWeightedMode(weights) {
  const total = MODES.reduce((s, m) => s + (weights[m] ?? 1), 0);
  let r = Math.random() * total;
  for (const m of MODES) {
    r -= (weights[m] ?? 1);
    if (r <= 0) return m;
  }
  return 'stable';
}

/**
 * Create initial market state.
 */
export function createMarketState() {
  const prices = {};
  const holdings = {};
  const costBasis = {}; // total spent per channel (for profit tracking)
  const history = {};
  const modes = {};
  const modeTimers = {};

  for (const ch of CHANNELS) {
    prices[ch.id] = ch.basePrice;
    holdings[ch.id] = 0;
    costBasis[ch.id] = 0;
    history[ch.id] = [ch.basePrice];
    modes[ch.id] = 'stable';
    modeTimers[ch.id] = MODE_SWITCH_MIN + Math.floor(Math.random() * (MODE_SWITCH_MAX - MODE_SWITCH_MIN));
  }

  return { prices, holdings, costBasis, history, modes, modeTimers, futures: [] };
}

/**
 * Pure tick function — updates prices & modes for all channels.
 * Called every 2 seconds.
 */
export function tickMarket(state) {
  const newPrices = { ...state.prices };
  const newHistory = {};
  const newModes = { ...state.modes };
  const newTimers = { ...state.modeTimers };

  for (const ch of CHANNELS) {
    // Decrement mode timer, switch if expired
    newTimers[ch.id] = (newTimers[ch.id] ?? 1) - 1;
    if (newTimers[ch.id] <= 0) {
      newModes[ch.id] = pickWeightedMode(ch.modeWeights);
      newTimers[ch.id] = MODE_SWITCH_MIN + Math.floor(Math.random() * (MODE_SWITCH_MAX - MODE_SWITCH_MIN));
    }

    // Apply price change
    const mode = newModes[ch.id];
    const { base, vol } = MODE_PARAMS[mode];
    const delta = base + (Math.random() - 0.5) * vol;
    let price = (state.prices[ch.id] ?? ch.basePrice) * (1 + delta);

    // Clamp
    const floor = ch.basePrice * 0.15;
    const ceil = ch.basePrice * 6;
    price = Math.max(floor, Math.min(ceil, price));

    newPrices[ch.id] = price;

    // Update history (keep last HISTORY_LEN entries)
    const prev = state.history[ch.id] ?? [ch.basePrice];
    const next = [...prev, price];
    newHistory[ch.id] = next.length > HISTORY_LEN ? next.slice(-HISTORY_LEN) : next;
  }

  return {
    ...state,
    prices: newPrices,
    history: newHistory,
    modes: newModes,
    modeTimers: newTimers,
  };
}

/**
 * Get the price scale multiplier based on production.
 * Uses exponential scaling so stocks stay expensive relative to income
 * at every stage of the game.
 *
 * Formula: 10^((log10(prodPerSec) - 2) × 0.9)
 * At 100/s   → ×1      (base prices)
 * At 10K/s   → ×630
 * At 1M/s    → ×400K
 * At 1T/s    → ×10^9
 * At 10^42/s → ×10^36  (late game, 1 share ≈ a few seconds of production)
 */
export function getPriceScale(prodPerSec) {
  if (prodPerSec <= 0) return 1;
  const logPs = Math.log10(prodPerSec + 1);
  if (logPs <= 2) return 1; // ≤ 100/s: base prices
  return Math.pow(10, (logPs - 2) * 0.9);
}

/**
 * Get the actual price of a channel (base price × scale).
 */
export function getScaledPrice(state, channelId, prodPerSec = 0) {
  const base = state?.prices?.[channelId];
  if (base == null) return 0;
  return Math.round(base * getPriceScale(prodPerSec));
}

/**
 * Buy 1 share of a channel. No holding limit.
 * Price scales with production to stay relevant.
 * Returns { newState, cost } or null if can't afford.
 */
export function buyShare(state, channelId, currentReads, prodPerSec = 0) {
  const price = getScaledPrice(state, channelId, prodPerSec);
  if (price == null || price <= 0) return null;
  if (currentReads < price) return null;

  return {
    newState: {
      ...state,
      holdings: {
        ...state.holdings,
        [channelId]: (state.holdings[channelId] ?? 0) + 1,
      },
      costBasis: {
        ...state.costBasis,
        [channelId]: (state.costBasis[channelId] ?? 0) + price,
      },
    },
    cost: price,
  };
}

/**
 * Sell 1 share of a channel.
 * Returns { newState, revenue } or null if no holdings.
 */
export function sellShare(state, channelId, prodPerSec = 0) {
  if ((state.holdings[channelId] ?? 0) <= 0) return null;
  const price = getScaledPrice(state, channelId, prodPerSec);
  const holdCount = state.holdings[channelId];
  // Reduce cost basis proportionally
  const avgCost = (state.costBasis[channelId] ?? 0) / holdCount;

  return {
    newState: {
      ...state,
      holdings: {
        ...state.holdings,
        [channelId]: holdCount - 1,
      },
      costBasis: {
        ...state.costBasis,
        [channelId]: Math.max(0, (state.costBasis[channelId] ?? 0) - avgCost),
      },
    },
    revenue: price,
  };
}

/**
 * Calculate total portfolio value (holdings × current prices).
 */
export function getPortfolioValue(state, prodPerSec = 0) {
  let total = 0;
  const scale = getPriceScale(prodPerSec);
  for (const ch of CHANNELS) {
    total += (state.holdings[ch.id] ?? 0) * Math.round((state.prices[ch.id] ?? ch.basePrice) * scale);
  }
  return total;
}

/**
 * Calculate total cost basis.
 */
export function getTotalCostBasis(state) {
  if (!state.costBasis) return 0;
  let total = 0;
  for (const ch of CHANNELS) {
    total += (state.costBasis[ch.id] ?? 0);
  }
  return total;
}

/**
 * Reset holdings and cost basis to 0 (used on prestige). Keeps prices/history running.
 * Also forfeits all active futures.
 */
export function resetHoldings(state) {
  const holdings = {};
  const costBasis = {};
  for (const ch of CHANNELS) {
    holdings[ch.id] = 0;
    costBasis[ch.id] = 0;
  }
  return { ...state, holdings, costBasis, futures: [] };
}

// ═══════════════════════════════════════════════
// FUTURES SYSTEM — "已讀期貨"
// ═══════════════════════════════════════════════

const FUTURES_DURATION = 15 * 60 * 1000; // 15 minutes
const MAX_FUTURES = 3; // max concurrent futures

const RISK_LEVELS = {
  safe:       { label: '穩健', minMult: 0.9, maxMult: 1.2 },
  aggressive: { label: '積極', minMult: 0.5, maxMult: 1.8 },
};

export { RISK_LEVELS, FUTURES_DURATION, MAX_FUTURES };

/**
 * Invest reads as a futures contract.
 * @param {object} state - market state
 * @param {string} channelId - which channel to bet on
 * @param {number} amount - reads to invest
 * @param {string} riskLevel - 'safe' | 'aggressive'
 * @returns {{ newState, cost }} or null if can't invest
 */
export function investFutures(state, channelId, amount, riskLevel, now = Date.now()) {
  const futures = state.futures ?? [];
  if (futures.length >= MAX_FUTURES) return null;
  if (!RISK_LEVELS[riskLevel]) return null;
  if (amount <= 0) return null;

  const price = state.prices[channelId];
  if (price == null) return null;

  const future = {
    id: `f_${now}_${channelId}`,
    channelId,
    amount,
    riskLevel,
    investedAt: now,
    maturesAt: now + FUTURES_DURATION,
    investPrice: price,
  };

  return {
    newState: {
      ...state,
      futures: [...futures, future],
    },
    cost: amount,
  };
}

/**
 * Collect a matured future.
 * Returns { newState, payout } or null if not matured.
 */
export function collectFuture(state, futureId, now = Date.now()) {
  const futures = state.futures ?? [];
  const idx = futures.findIndex(f => f.id === futureId);
  if (idx < 0) return null;

  const future = futures[idx];
  if (future.maturesAt > now) return null;

  // Calculate return based on price change
  const currentPrice = state.prices[future.channelId];
  const priceRatio = currentPrice / future.investPrice;
  const risk = RISK_LEVELS[future.riskLevel];

  // Map price ratio to payout multiplier within risk bounds
  // Price doubled → max multiplier; price halved → min multiplier
  const normalized = Math.max(0, Math.min(2, priceRatio)); // clamp 0-2
  const t = normalized / 2; // 0-1
  const mult = risk.minMult + t * (risk.maxMult - risk.minMult);
  const payout = Math.round(future.amount * mult);

  const newFutures = [...futures];
  newFutures.splice(idx, 1);

  return {
    newState: { ...state, futures: newFutures },
    payout,
    mult,
  };
}

/**
 * Get active futures list.
 */
export function getActiveFutures(state) {
  return state.futures ?? [];
}
