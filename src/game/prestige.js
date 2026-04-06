// Skill Tree — permanent upgrades bought with ✦已讀之力
// Replaces the old flat PRESTIGE_UPGRADES array with a prerequisite-based tree.

/** Return all effects for a node (handles single `effect` or multi `effects`). */
export function getNodeEffects(node) {
  return node.effects || [node.effect];
}

// ─── Branch definitions ───
export const BRANCHES = {
  root:       { id: 'root',       name: '已讀覺醒',   emoji: '🌱', order: 0 },
  production: { id: 'production', name: '冷漠生產線', emoji: '⚙️', order: 1 },
  click:      { id: 'click',      name: '手動已讀術', emoji: '👆', order: 2 },
  event:      { id: 'event',      name: '命運之輪',   emoji: '🎲', order: 3 },
  meta:       { id: 'meta',       name: '超維已讀',   emoji: '🔮', order: 4 },
};

// ─── Skill Tree Nodes (34 total, ~956✦) ───
export const SKILL_TREE_NODES = [
  // ── ROOT 已讀覺醒 (4 nodes, 6✦) ──
  {
    id: 'st-r1', name: '快速啟動', desc: '重生後自帶100已讀',
    cost: 1, emoji: '🚀', branch: 'root', tier: 1, requires: [],
    effect: { type: 'startBonus', value: 100 },
  },
  {
    id: 'st-r2', name: '已讀殘影', desc: '全域產能+10%',
    cost: 1, emoji: '👻', branch: 'root', tier: 1, requires: [],
    effect: { type: 'globalMult', value: 1.10 },
  },
  {
    id: 'st-r3', name: '冷漠直覺', desc: '建築成本-5%',
    cost: 2, emoji: '🧊', branch: 'root', tier: 1, requires: ['st-r1'],
    effect: { type: 'costDiscount', value: 0.05 },
  },
  {
    id: 'st-r4', name: '分支覺醒', desc: '全域產能再+10%',
    cost: 2, emoji: '🌀', branch: 'root', tier: 1, requires: ['st-r2'],
    effect: { type: 'globalMult', value: 1.10 },
  },

  // ── PRODUCTION 冷漠生產線 (8 nodes, 199✦) ──
  {
    id: 'st-p1', name: '前任記憶', desc: '前任產能永久+50%',
    cost: 3, emoji: '💔', branch: 'production', tier: 2, requires: ['st-r4'],
    effect: { type: 'buildingMult', target: 'ex', value: 1.5 },
  },
  {
    id: 'st-p2', name: '社交殘影', desc: '忙朋友產能永久+50%',
    cost: 3, emoji: '📱', branch: 'production', tier: 2, requires: ['st-r4'],
    effect: { type: 'buildingMult', target: 'bsy', value: 1.5 },
  },
  {
    id: 'st-p3', name: '爸媽祝福', desc: '爸媽產能永久+50%',
    cost: 5, emoji: '🙏', branch: 'production', tier: 2, requires: ['st-p1'],
    effect: { type: 'buildingMult', target: 'par', value: 1.5 },
  },
  {
    id: 'st-p4', name: '職場冷漠', desc: '公司HR、前輩產能+50%',
    cost: 5, emoji: '💼', branch: 'production', tier: 2, requires: ['st-p2'],
    effects: [
      { type: 'buildingMult', target: 'hr', value: 1.5 },
      { type: 'buildingMult', target: 'sen', value: 1.5 },
    ],
  },
  {
    id: 'st-p5', name: '數位冷漠症', desc: '全域產能×1.25',
    cost: 12, emoji: '🖥️', branch: 'production', tier: 3, requires: ['st-p3', 'st-p4'],
    effect: { type: 'globalMult', value: 1.25 },
  },
  {
    id: 'st-p6', name: '演算法調教', desc: '演算法、網紅產能+50%',
    cost: 15, emoji: '📊', branch: 'production', tier: 3, requires: ['st-p5'],
    effects: [
      { type: 'buildingMult', target: 'algo', value: 1.5 },
      { type: 'buildingMult', target: 'inf', value: 1.5 },
    ],
  },
  {
    id: 'st-p7', name: 'AI覺醒', desc: 'AI客服、外送、記者產能+50%',
    cost: 36, emoji: '🧠', branch: 'production', tier: 4, requires: ['st-p6'],
    effects: [
      { type: 'buildingMult', target: 'ai', value: 1.5 },
      { type: 'buildingMult', target: 'del', value: 1.5 },
      { type: 'buildingMult', target: 'rep', value: 1.5 },
    ],
  },
  {
    id: 'st-p8', name: '永恆已讀', desc: '全域產能×2。你的冷漠已成傳說',
    cost: 120, emoji: '♾️', branch: 'production', tier: 5, requires: ['st-p7'],
    effect: { type: 'globalMult', value: 2.0 },
  },

  // ── CLICK 手動已讀術 (8 nodes, 211✦) ──
  {
    id: 'st-c1', name: '點擊回憶', desc: '點擊力基礎+5',
    cost: 3, emoji: '👆', branch: 'click', tier: 2, requires: ['st-r3'],
    effect: { type: 'clickBonus', value: 5 },
  },
  {
    id: 'st-c2', name: '批量已讀', desc: '點擊力×1.5',
    cost: 4, emoji: '📑', branch: 'click', tier: 2, requires: ['st-r3'],
    effect: { type: 'clickMult', value: 1.5 },
  },
  {
    id: 'st-c3', name: '情報手段', desc: '情報販子產能+50%',
    cost: 5, emoji: '🕵️', branch: 'click', tier: 2, requires: ['st-c1'],
    effect: { type: 'buildingMult', target: 'int', value: 1.5 },
  },
  {
    id: 'st-c4', name: '駭客入侵', desc: '駭客產能+50%',
    cost: 8, emoji: '💻', branch: 'click', tier: 3, requires: ['st-c2'],
    effect: { type: 'buildingMult', target: 'hkr', value: 1.5 },
  },
  {
    id: 'st-c5', name: '已讀連鎖', desc: '點擊力×2',
    cost: 12, emoji: '⚡', branch: 'click', tier: 3, requires: ['st-c3', 'st-c4'],
    effect: { type: 'clickMult', value: 2.0 },
  },
  {
    id: 'st-c6', name: '政府已讀', desc: '政府、意識蜂巢產能+50%',
    cost: 15, emoji: '🏛️', branch: 'click', tier: 3, requires: ['st-c5'],
    effects: [
      { type: 'buildingMult', target: 'gov', value: 1.5 },
      { type: 'buildingMult', target: 'hive', value: 1.5 },
    ],
  },
  {
    id: 'st-c7', name: '超級冷漠', desc: '所有建築成本-15%',
    cost: 30, emoji: '🥶', branch: 'click', tier: 4, requires: ['st-c5'],
    effect: { type: 'costDiscount', value: 0.15 },
  },
  {
    id: 'st-c8', name: '已讀連鎖反應', desc: '點擊力×3。指尖已讀風暴',
    cost: 134, emoji: '💥', branch: 'click', tier: 5, requires: ['st-c7'],
    effect: { type: 'clickMult', value: 3.0 },
  },

  // ── EVENT 命運之輪 (8 nodes, 199✦) ──
  {
    id: 'st-e1', name: '黃金體質', desc: '金色事件頻率+20%',
    cost: 3, emoji: '✨', branch: 'event', tier: 2, requires: ['st-r4'],
    effect: { type: 'goldenFreq', value: 0.20 },
  },
  {
    id: 'st-e2', name: '離線加速', desc: '離線收益+30%',
    cost: 4, emoji: '😴', branch: 'event', tier: 2, requires: ['st-r3'],
    effect: { type: 'offlineBonus', value: 0.30 },
  },
  {
    id: 'st-e3', name: '風暴預感', desc: '已讀風暴頻率+30%',
    cost: 8, emoji: '🌧️', branch: 'event', tier: 3, requires: ['st-e1'],
    effect: { type: 'stormFreq', value: 0.30 },
  },
  {
    id: 'st-e4', name: '加速解鎖', desc: '建築解鎖門檻-15%',
    cost: 8, emoji: '🔓', branch: 'event', tier: 3, requires: ['st-e2'],
    effect: { type: 'unlockDiscount', value: 0.15 },
  },
  {
    id: 'st-e5', name: '黃金時代', desc: '金色事件頻率再+30%',
    cost: 12, emoji: '🌟', branch: 'event', tier: 3, requires: ['st-e3'],
    effect: { type: 'goldenFreq', value: 0.30 },
  },
  {
    id: 'st-e6', name: '永恆離線', desc: '離線收益再+70%',
    cost: 15, emoji: '🌙', branch: 'event', tier: 3, requires: ['st-e4'],
    effect: { type: 'offlineBonus', value: 0.70 },
  },
  {
    id: 'st-e7', name: '風暴主宰', desc: '已讀風暴頻率+50%',
    cost: 30, emoji: '⛈️', branch: 'event', tier: 4, requires: ['st-e5'],
    effect: { type: 'stormFreq', value: 0.50 },
  },
  {
    id: 'st-e8', name: '命運操控', desc: '金色+40%、風暴+30%。命運盡在掌握',
    cost: 119, emoji: '🎰', branch: 'event', tier: 5, requires: ['st-e7', 'st-e6'],
    effects: [
      { type: 'goldenFreq', value: 0.40 },
      { type: 'stormFreq', value: 0.30 },
    ],
  },

  // ── META 超維已讀 (6 nodes, 341✦) ──
  {
    id: 'st-m1', name: '深層已讀', desc: '重生獲得的✦+50%',
    cost: 10, emoji: '🔮', branch: 'meta', tier: 3, requires: ['st-r4'],
    effect: { type: 'prestigeBonus', value: 0.5 },
  },
  {
    id: 'st-m2', name: '星際外交', desc: '外星通訊、平行自我產能+50%',
    cost: 15, emoji: '🛸', branch: 'meta', tier: 3, requires: ['st-m1'],
    effects: [
      { type: 'buildingMult', target: 'alien', value: 1.5 },
      { type: 'buildingMult', target: 'par2', value: 1.5 },
    ],
  },
  {
    id: 'st-m3', name: '時空扭曲', desc: '時間迴圈、量子已讀產能+50%',
    cost: 28, emoji: '⏳', branch: 'meta', tier: 4, requires: ['st-m2'],
    effects: [
      { type: 'buildingMult', target: 'time', value: 1.5 },
      { type: 'buildingMult', target: 'quantum', value: 1.5 },
    ],
  },
  {
    id: 'st-m4', name: '虛空共鳴', desc: '虛空已讀產能+50%',
    cost: 30, emoji: '🕳️', branch: 'meta', tier: 4, requires: ['st-m3'],
    effect: { type: 'buildingMult', target: 'void', value: 1.5 },
  },
  {
    id: 'st-m5', name: '神諭解讀', desc: '神之已讀產能+50%',
    cost: 38, emoji: '👁️', branch: 'meta', tier: 4, requires: ['st-m4'],
    effect: { type: 'buildingMult', target: 'god', value: 1.5 },
  },
  {
    id: 'st-m6', name: '萬物已讀', desc: '✦+100%、全域×1.5。萬物皆已讀',
    cost: 220, emoji: '🌌', branch: 'meta', tier: 5, requires: ['st-m5'],
    effects: [
      { type: 'prestigeBonus', value: 1.0 },
      { type: 'globalMult', value: 1.5 },
    ],
  },
];

// Backward-compatible alias — App.jsx imports PRESTIGE_UPGRADES
export const PRESTIGE_UPGRADES = SKILL_TREE_NODES;

// ─── Capstone Mutual Exclusion ───
// Buying one T5 capstone locks its rival. Forces build identity.
export const CAPSTONE_EXCLUSIONS = {
  'st-p8': 'st-c8',  // Production capstone locks Click capstone
  'st-c8': 'st-p8',  // Click capstone locks Production capstone
  'st-e8': 'st-m6',  // Event capstone locks Meta capstone
  'st-m6': 'st-e8',  // Meta capstone locks Event capstone
};

/**
 * Check if a node is locked by a rival capstone.
 * Returns the rival node ID if locked, null otherwise.
 */
export function getCapstoneBlocker(nodeId, boughtPrestige) {
  const rival = CAPSTONE_EXCLUSIONS[nodeId];
  if (!rival) return null;
  return boughtPrestige.has(rival) ? rival : null;
}

// ─── Legacy ID mapping for save migration ───
export const LEGACY_ID_MAP = {
  'ps1':  'st-r1',  // 快速啟動
  'ps2':  'st-p1',  // 前任記憶
  'ps3':  'st-p3',  // 爸媽祝福
  'ps4':  'st-p2',  // 社交殘影
  'ps6':  'st-c1',  // 點擊回憶
  'ps5':  'st-e1',  // 黃金體質
  'ps7':  'st-e4',  // 加速解鎖
  'ps11': 'st-r3',  // 冷漠光環 → 冷漠直覺
  'ps12': 'st-c2',  // 批量已讀
  'ps13': 'st-r4',  // 數位冷漠症 → 分支覺醒
  'ps14': 'st-p6',  // 演算法調教
  'ps15': 'st-p7',  // AI訓練資料 → AI覺醒
  'ps8':  'st-p5',  // 已讀光環 → 數位冷漠症
  'ps16': 'st-e2',  // 離線加速
  'ps17': 'st-e3',  // 風暴預感
  'ps18': 'st-m2',  // 星際外交
  'ps19': 'st-m3',  // 時空扭曲
  'ps9':  'st-m1',  // 深層已讀
  'ps20': 'st-m3',  // 量子糾纏 → 合併到時空扭曲
  'ps10': 'st-p8',  // 永恆已讀
  'ps21': 'st-m4',  // 虛空共鳴
  'ps22': 'st-m5',  // 神諭解讀
  'ps23': 'st-c5',  // 已讀連鎖反應 → 已讀連鎖
  'ps24': 'st-c7',  // 超級冷漠
  'ps25': 'st-e6',  // 永恆離線
  'ps26': 'st-p8',  // 已讀奇點 → 合併到永恆已讀
  'ps27': 'st-m6',  // 萬物已讀
  'ps28': 'st-p8',  // 終極冷漠 → 合併到永恆已讀
};
