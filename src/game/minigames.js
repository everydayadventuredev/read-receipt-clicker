/**
 * Mini-Game Registry
 * Each building can have an associated mini-game sub-system.
 * Add new entries here to register future mini-games.
 */
export const MINIGAME_REGISTRY = [
  {
    buildingId: 'ex',
    name: '放下花園',
    emoji: '🌱',
    unlockCount: 1,
  },
  {
    buildingId: 'algo',
    name: 'Feed 操盤手',
    emoji: '📈',
    unlockCount: 1,
  },
  {
    buildingId: 'par',
    name: '伴手禮合成',
    emoji: '🎁',
    unlockCount: 1,
  },
  // Future mini-games:
];

/**
 * Returns mini-games that are unlocked based on current ownership.
 */
export function getUnlockedMinigames(owned) {
  return MINIGAME_REGISTRY.filter(
    mg => (owned[mg.buildingId] ?? 0) >= mg.unlockCount
  );
}
