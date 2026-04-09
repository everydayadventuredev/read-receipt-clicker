// ═══════════════════════════════════════════════
// Reply Trap — emotionally manipulative messages
// that tempt the player to "reply" (clicking = penalty)
// ═══════════════════════════════════════════════

export const REPLY_TRAPS = [
  // Family guilt
  { msg: '媽媽住院了，你能回個電話嗎', emoji: '🏥', category: 'family' },
  { msg: '爸爸說他很想你，你多久沒回家了', emoji: '👴', category: 'family' },
  { msg: '奶奶學會用手機了，第一則訊息就傳給你', emoji: '👵', category: 'family' },
  { msg: '家裡的狗一直看著門口等你回來', emoji: '🐕', category: 'family' },

  // Ex guilt
  { msg: '我覺得你不在乎我了...算了', emoji: '😢', category: 'ex' },
  { msg: '這是我最後一次找你了', emoji: '💔', category: 'ex' },
  { msg: '我看到你在線上欸', emoji: '👀', category: 'ex' },
  { msg: '你是不是把我封鎖了', emoji: '😰', category: 'ex' },
  { msg: '我夢到你了，醒來發現你還是沒回', emoji: '🌙', category: 'ex' },

  // Friend manipulation
  { msg: '大家都到了就差你，你到底來不來', emoji: '🎉', category: 'friend' },
  { msg: '我只跟你說，我最近過得很不好...', emoji: '😞', category: 'friend' },
  { msg: '你是不是不把我當朋友了', emoji: '🥺', category: 'friend' },
  { msg: '幫我一個忙好不好，拜託', emoji: '🙏', category: 'friend' },

  // Work pressure
  { msg: '老闆：「明天的報告你做好了嗎？」', emoji: '😱', category: 'work' },
  { msg: 'HR：「請立即回覆，否則視同放棄」', emoji: '⚠️', category: 'work' },
  { msg: '同事：「你不回我就幫你回老闆了喔」', emoji: '💼', category: 'work' },

  // Existential
  { msg: '如果你現在不回，以後就沒機會了', emoji: '⏳', category: 'existential' },
  { msg: '你知道嗎，有些訊息錯過了就是一輩子', emoji: '🕊️', category: 'existential' },
  { msg: '「已讀不回」這四個字，傷過多少人', emoji: '💭', category: 'existential' },
];

// ═══════════════════════════════════════════════
// Guilt System — negative events triggered by high guilt
// ═══════════════════════════════════════════════

export const GUILT_EVENTS = [
  { name: '良心發現', emoji: '😔', desc: '罪惡感湧上心頭', effect: 'prodDebuff', mult: 0.7, duration: 15 },
  { name: '前任的眼淚', emoji: '😭', desc: '你聽到了哭聲', effect: 'prodDebuff', mult: 0.6, duration: 10 },
  { name: '媽媽的嘆息', emoji: '😮‍💨', desc: '「我沒生氣，就是有點失望」', effect: 'prodDebuff', mult: 0.5, duration: 8 },
  { name: '社交噩夢', emoji: '😱', desc: '夢到所有人同時已讀你', effect: 'loseReads', mult: 0.05 },
  { name: '被動攻擊', emoji: '🙂', desc: '「沒事，我習慣了」', effect: 'prodDebuff', mult: 0.8, duration: 20 },
  { name: '群組公審', emoji: '👥', desc: '所有人開始討論你為什麼不回', effect: 'prodDebuff', mult: 0.4, duration: 5 },
];

// ═══════════════════════════════════════════════
// Guilt Relief — ways to reduce guilt
// ═══════════════════════════════════════════════

export const GUILT_RELIEF = [
  {
    id: 'relief1', name: '發貼圖', emoji: '🎉',
    desc: '最低成本的社交行為',
    guiltReduce: 400, cooldown: 30,
    cost: 0,
  },
  {
    id: 'relief2', name: '轉發長輩圖', emoji: '🌅',
    desc: '「早安，今天也要加油喔」',
    guiltReduce: 800, cooldown: 60,
    cost: 0,
  },
  {
    id: 'relief3', name: '按讚', emoji: '👍',
    desc: '用一個動作假裝你在乎',
    guiltReduce: 200, cooldown: 15,
    cost: 0,
  },
  {
    id: 'relief4', name: '生日快樂罐頭訊息', emoji: '🎂',
    desc: '每年一次的交情維護',
    guiltReduce: 1500, cooldown: 120,
    cost: 0,
  },
];

// Guilt thresholds
export const GUILT_THRESHOLDS = {
  low: 500,        // guilt events start appearing
  medium: 2000,    // events more frequent + reply traps more frequent
  high: 5000,      // intense guilt phase
  transcend: 10000, // 冷漠大師 — guilt becomes a buff
};
