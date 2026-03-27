export const UPGRADES = [
  // Click upgrades
  { id: 'c1', name: '指尖覺醒',   desc: '點擊+1',       type: 'ck', bonus: 1,    cost: 100,    req: { allTime: 50 },           emoji: '👆' },
  { id: 'c2', name: '雙重已讀',   desc: '點擊+3',       type: 'ck', bonus: 3,    cost: 1000,   req: { allTime: 500 },          emoji: '✌️' },
  { id: 'c3', name: '已讀連擊',   desc: '點擊+10',      type: 'ck', bonus: 10,   cost: 10000,  req: { allTime: 5000 },         emoji: '⚡' },
  { id: 'c4', name: '已讀風暴',   desc: '點擊+50',      type: 'ck', bonus: 50,   cost: 100000, req: { allTime: 50000 },        emoji: '🌪️' },
  // Click % upgrades
  { id: 'p1', name: '效率已讀術', desc: '點擊+1%產能',  type: 'cp', bonus: 0.01, cost: 5000,   req: { allTime: 2000 },         emoji: '📈' },
  { id: 'p2', name: '高效已讀術', desc: '點擊+3%產能',  type: 'cp', bonus: 0.03, cost: 50000,  req: { allTime: 20000 },        emoji: '📈' },
  { id: 'p3', name: '極效已讀術', desc: '點擊+5%產能',  type: 'cp', bonus: 0.05, cost: 500000, req: { allTime: 200000 },       emoji: '📈' },
  // Building multipliers — ex
  { id: 'e1', name: '冷漠的力量',   desc: '前任x2', type: 'm', target: 'ex', bonus: 2, cost: 150,    req: { building: 'ex', count: 1 },  emoji: '💔' },
  { id: 'e2', name: '已讀不回大師', desc: '前任x2', type: 'm', target: 'ex', bonus: 2, cost: 1500,   req: { building: 'ex', count: 5 },  emoji: '💔' },
  { id: 'e3', name: '前任軍團',     desc: '前任x2', type: 'm', target: 'ex', bonus: 2, cost: 15000,  req: { building: 'ex', count: 10 }, emoji: '💔' },
  { id: 'e4', name: '前任帝國',     desc: '前任x3', type: 'm', target: 'ex', bonus: 3, cost: 150000, req: { building: 'ex', count: 25 }, emoji: '💔' },
  // par
  { id: 'p_1', name: '外套加持',   desc: '爸媽x2', type: 'm', target: 'par', bonus: 2, cost: 1000,   req: { building: 'par', count: 1 },  emoji: '🧥' },
  { id: 'p_2', name: '養生文轟炸', desc: '爸媽x2', type: 'm', target: 'par', bonus: 2, cost: 10000,  req: { building: 'par', count: 5 },  emoji: '📰' },
  { id: 'p_3', name: '親情的重量', desc: '爸媽x3', type: 'm', target: 'par', bonus: 3, cost: 100000, req: { building: 'par', count: 10 }, emoji: '❤️' },
  // bsy
  { id: 'b1', name: '改天約加速器', desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 5000,   req: { building: 'bsy', count: 1 },  emoji: '📅' },
  { id: 'b2', name: '爽約專業化',   desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 50000,  req: { building: 'bsy', count: 5 },  emoji: '💨' },
  { id: 'b3', name: '忙碌量子化',   desc: '忙朋友x3', type: 'm', target: 'bsy', bonus: 3, cost: 500000, req: { building: 'bsy', count: 10 }, emoji: '⚛️' },
  // hr
  { id: 'h1', name: '官方回覆範本', desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 30000,  req: { building: 'hr', count: 1 }, emoji: '📋' },
  { id: 'h2', name: '企業文化洗腦', desc: 'HRx3', type: 'm', target: 'hr', bonus: 3, cost: 300000, req: { building: 'hr', count: 5 }, emoji: '🧠' },
  // del
  { id: 'd1', name: '罐頭回覆優化', desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 150000,  req: { building: 'del', count: 1 }, emoji: '🥫' },
  { id: 'd2', name: '自動道歉系統', desc: '外送x3', type: 'm', target: 'del', bonus: 3, cost: 1500000, req: { building: 'del', count: 5 }, emoji: '🤖' },
  // gov
  { id: 'g1', name: '電子化公文', desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 800000,  req: { building: 'gov', count: 1 }, emoji: '📄' },
  { id: 'g2', name: '蓋章自動化', desc: '承辦x3', type: 'm', target: 'gov', bonus: 3, cost: 8000000, req: { building: 'gov', count: 5 }, emoji: '🔏' },
  // int
  { id: 'i1', name: '機密解碼器', desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 4000000,  req: { building: 'int', count: 1 }, emoji: '🔓' },
  { id: 'i2', name: '全球監控網', desc: '情報x3', type: 'm', target: 'int', bonus: 3, cost: 40000000, req: { building: 'int', count: 5 }, emoji: '🌐' },
];
