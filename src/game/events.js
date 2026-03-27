export const GOLDEN_COOKIES = [
  { label: '對方正在輸入',  emoji: '💬', mult: 10, toast: '截胡了！',           type: 'add' },
  { label: '超長語音',      emoji: '🎤', mult: 15, toast: '47分鐘語音快轉聽完！', type: 'add' },
  { label: '群組炸彈',      emoji: '💣', mult: 20, toast: '200則瞬間清空！',     type: 'add' },
  { label: '老闆深夜訊息',  emoji: '😱', mult: 25, toast: '恐懼轉化為能量！',   type: 'add',  minAt: 5000 },
  { label: '前任正在輸入',  emoji: '💔', mult: 12, toast: '又刪掉了。情緒補償！', type: 'add' },
  { label: '已讀加速',      emoji: '🚀', mult: 0,  toast: '全域產能x2持續30秒！', type: 'mult',  dur: 30, minAt: 5000 },
  { label: '瘋狂已讀',      emoji: '🔥', mult: 0,  toast: '全域產能x5持續10秒！', type: 'mult5', dur: 10, minAt: 5000 },
  { label: '你確定不回嗎？', emoji: '👀', mult: 30, toast: '已讀之力大幅提升！', type: 'add',  minAt: 10000 },
];
