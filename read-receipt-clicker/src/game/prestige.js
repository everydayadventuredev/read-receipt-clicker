// Prestige Shop — permanent upgrades bought with ✦已讀之力
export const PRESTIGE_UPGRADES = [
  // --- Tier 1: Basics (cost 2-4) ---
  {
    id: 'ps1', name: '快速啟動', desc: '重生後自帶100已讀',
    cost: 2, emoji: '🚀',
    effect: { type: 'startBonus', value: 100 },
  },
  {
    id: 'ps2', name: '前任記憶', desc: '前任產能永久+50%',
    cost: 3, emoji: '💔',
    effect: { type: 'buildingMult', target: 'ex', value: 1.5 },
  },
  {
    id: 'ps3', name: '爸媽的祝福', desc: '爸媽產能永久+50%',
    cost: 3, emoji: '🙏',
    effect: { type: 'buildingMult', target: 'par', value: 1.5 },
  },
  {
    id: 'ps4', name: '社交殘影', desc: '忙朋友產能永久+50%',
    cost: 4, emoji: '👻',
    effect: { type: 'buildingMult', target: 'bsy', value: 1.5 },
  },
  {
    id: 'ps6', name: '點擊回憶', desc: '點擊力基礎+5',
    cost: 4, emoji: '👆',
    effect: { type: 'clickBonus', value: 5 },
  },

  // --- Tier 2: Mid-range (cost 5-8) ---
  {
    id: 'ps5', name: '黃金體質', desc: '金色事件出現頻率+30%',
    cost: 5, emoji: '✨',
    effect: { type: 'goldenFreq', value: 0.3 },
  },
  {
    id: 'ps7', name: '加速解鎖', desc: '建築解鎖門檻-20%',
    cost: 6, emoji: '🔓',
    effect: { type: 'unlockDiscount', value: 0.2 },
  },
  {
    id: 'ps11', name: '冷漠光環', desc: '所有建築成本-10%',
    cost: 5, emoji: '😐',
    effect: { type: 'costDiscount', value: 0.1 },
  },
  {
    id: 'ps12', name: '批量已讀', desc: '點擊力x2',
    cost: 6, emoji: '📑',
    effect: { type: 'clickMult', value: 2 },
  },
  {
    id: 'ps13', name: '數位冷漠症', desc: '已讀速度+25%，回覆慾望-100%',
    cost: 5, emoji: '🧊',
    effect: { type: 'globalMult', value: 1.25 },
  },
  {
    id: 'ps14', name: '演算法調教', desc: '社群演算法產能永久+50%',
    cost: 6, emoji: '📱',
    effect: { type: 'buildingMult', target: 'algo', value: 1.5 },
  },
  {
    id: 'ps15', name: 'AI訓練資料', desc: 'AI客服產能永久+50%',
    cost: 7, emoji: '🧠',
    effect: { type: 'buildingMult', target: 'ai', value: 1.5 },
  },

  // --- Tier 3: Advanced (cost 8-15) ---
  {
    id: 'ps8', name: '已讀光環', desc: '全域產能+100%',
    cost: 8, emoji: '💫',
    effect: { type: 'globalMult', value: 2 },
  },
  {
    id: 'ps16', name: '離線加速', desc: '離線收益+50%',
    cost: 8, emoji: '😴',
    effect: { type: 'offlineBonus', value: 0.5 },
  },
  {
    id: 'ps17', name: '已讀風暴加速', desc: '已讀風暴出現頻率+50%',
    cost: 8, emoji: '⛈️',
    effect: { type: 'stormFreq', value: 0.5 },
  },
  {
    id: 'ps18', name: '星際外交', desc: '外星通訊產能永久+50%',
    cost: 9, emoji: '🛸',
    effect: { type: 'buildingMult', target: 'alien', value: 1.5 },
  },
  {
    id: 'ps19', name: '時空扭曲', desc: '時間迴圈產能永久+50%',
    cost: 10, emoji: '🌀',
    effect: { type: 'buildingMult', target: 'time', value: 1.5 },
  },
  {
    id: 'ps9', name: '深層已讀', desc: '重生獲得的✦+50%',
    cost: 10, emoji: '🔮',
    effect: { type: 'prestigeBonus', value: 0.5 },
  },
  {
    id: 'ps20', name: '已讀量子糾纏', desc: '量子已讀產能永久+50%',
    cost: 12, emoji: '⚛️',
    effect: { type: 'buildingMult', target: 'quantum', value: 1.5 },
  },

  // --- Tier 4: Late game (cost 15-30) ---
  {
    id: 'ps10', name: '永恆已讀', desc: '全域產能再+200%',
    cost: 15, emoji: '♾️',
    effect: { type: 'globalMult', value: 3 },
  },
  {
    id: 'ps21', name: '虛空共鳴', desc: '虛空已讀產能永久+50%',
    cost: 15, emoji: '🕳️',
    effect: { type: 'buildingMult', target: 'void', value: 1.5 },
  },
  {
    id: 'ps22', name: '神諭解讀', desc: '神之已讀產能永久+50%',
    cost: 18, emoji: '👁️',
    effect: { type: 'buildingMult', target: 'god', value: 1.5 },
  },
  {
    id: 'ps23', name: '已讀連鎖反應', desc: '點擊力x3',
    cost: 20, emoji: '💥',
    effect: { type: 'clickMult', value: 3 },
  },
  {
    id: 'ps24', name: '超級冷漠', desc: '所有建築成本-20%',
    cost: 22, emoji: '🥶',
    effect: { type: 'costDiscount', value: 0.2 },
  },
  {
    id: 'ps25', name: '永恆離線', desc: '離線收益再+100%',
    cost: 25, emoji: '🌙',
    effect: { type: 'offlineBonus', value: 1.0 },
  },

  // --- Tier 5: End game (cost 30-50) ---
  {
    id: 'ps26', name: '已讀奇點', desc: '全域產能x5。已讀密度突破臨界值',
    cost: 30, emoji: '🌌',
    effect: { type: 'globalMult', value: 5 },
  },
  {
    id: 'ps27', name: '萬物已讀', desc: '重生獲得的✦+100%',
    cost: 35, emoji: '🌠',
    effect: { type: 'prestigeBonus', value: 1.0 },
  },
  {
    id: 'ps28', name: '終極冷漠', desc: '全域產能x10。你已超越回覆的概念',
    cost: 50, emoji: '🪐',
    effect: { type: 'globalMult', value: 10 },
  },
];
