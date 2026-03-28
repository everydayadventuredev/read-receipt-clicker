// Prestige Shop — permanent upgrades bought with ✦已讀之力
export const PRESTIGE_UPGRADES = [
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
    id: 'ps5', name: '黃金體質', desc: '金色事件出現頻率+30%',
    cost: 5, emoji: '✨',
    effect: { type: 'goldenFreq', value: 0.3 },
  },
  {
    id: 'ps6', name: '點擊回憶', desc: '點擊力基礎+5',
    cost: 4, emoji: '👆',
    effect: { type: 'clickBonus', value: 5 },
  },
  {
    id: 'ps7', name: '加速解鎖', desc: '建築解鎖門檻-20%',
    cost: 6, emoji: '🔓',
    effect: { type: 'unlockDiscount', value: 0.2 },
  },
  {
    id: 'ps8', name: '已讀光環', desc: '全域產能+100%',
    cost: 8, emoji: '💫',
    effect: { type: 'globalMult', value: 2 },
  },
  {
    id: 'ps9', name: '深層已讀', desc: '重生獲得的✦+50%',
    cost: 10, emoji: '🌀',
    effect: { type: 'prestigeBonus', value: 0.5 },
  },
  {
    id: 'ps10', name: '永恆已讀', desc: '全域產能再+200%',
    cost: 15, emoji: '♾️',
    effect: { type: 'globalMult', value: 3 },
  },
];
