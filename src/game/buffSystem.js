/**
 * Unified Buff System
 *
 * All mini-games feed buffs into a single state. Buffs from the same source
 * stack additively (capped per source). Across sources, they multiply.
 *
 * Sources: storm, quantum, garden, merge
 * Special: quantumResonance — modifies the NEXT medium-game (garden/merge) buff.
 */

let _nextId = 1;

// Per-source caps
const SOURCE_CAPS = {
  storm:  1.8,
  garden: 1.8,
  merge:  1.5,
  market: 1.5,
};

export function createBuffState() {
  return {
    activeBuffs: [],        // [{ id, source, mult, expiresAt, scope }]
    quantumResonance: null,  // { mult, consumed, earnedAt } | null
    stormCooldownEnd: 0,
    quantumCooldownEnd: 0,
  };
}

/**
 * Add a buff to the state.
 * @param {object} state - current buff state
 * @param {{ source: string, mult: number, expiresAt: number, scope?: string }} buff
 * @returns {object} new state
 */
export function addBuff(state, buff) {
  const id = `buff_${_nextId++}`;
  return {
    ...state,
    activeBuffs: [...state.activeBuffs, { ...buff, id, scope: buff.scope ?? 'global' }],
  };
}

/**
 * Remove expired buffs.
 */
export function expireBuffs(state, now = Date.now()) {
  const live = state.activeBuffs.filter(b => b.expiresAt > now);
  if (live.length === state.activeBuffs.length) return state;
  return { ...state, activeBuffs: live };
}

/**
 * Set quantum resonance (from QuantumLab).
 */
export function setResonance(state, mult) {
  return {
    ...state,
    quantumResonance: { mult, consumed: false, earnedAt: Date.now() },
  };
}

/**
 * Consume quantum resonance (when a medium-game uses it).
 * Returns [newState, multiplier]. If no resonance, returns [state, 1].
 */
export function consumeResonance(state) {
  if (!state.quantumResonance || state.quantumResonance.consumed) {
    return [state, 1];
  }
  const mult = state.quantumResonance.mult;
  return [
    { ...state, quantumResonance: { ...state.quantumResonance, consumed: true } },
    mult,
  ];
}

/**
 * Compute total buff multiplier for production.
 * Within each source: additive (sum of bonus, capped).
 * Across sources: multiplicative.
 */
export function getBuffMultiplier(state, now = Date.now()) {
  const live = state.activeBuffs.filter(b => b.expiresAt > now && b.scope === 'global');

  // Group by source
  const bySource = {};
  for (const b of live) {
    if (!bySource[b.source]) bySource[b.source] = 0;
    bySource[b.source] += (b.mult - 1);
  }

  // Apply caps and multiply across sources
  let total = 1;
  for (const [source, bonus] of Object.entries(bySource)) {
    const cap = SOURCE_CAPS[source] ?? 5.0;
    total *= Math.min(cap, 1 + bonus);
  }

  return total;
}

/**
 * Get individual source multiplier (for UI display).
 */
export function getSourceMult(state, source, now = Date.now()) {
  const live = state.activeBuffs.filter(b => b.expiresAt > now && b.scope === 'global' && b.source === source);
  let bonus = 0;
  for (const b of live) bonus += (b.mult - 1);
  const cap = SOURCE_CAPS[source] ?? 5.0;
  return Math.min(cap, 1 + bonus);
}

/**
 * Get all active buffs (for UI).
 */
export function getActiveBuffs(state, now = Date.now()) {
  return state.activeBuffs.filter(b => b.expiresAt > now);
}
