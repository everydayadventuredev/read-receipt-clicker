export const UPGRADES = [
  // ═══════════════════════════════════════════════
  // CLICK UPGRADES — early game
  // ═══════════════════════════════════════════════
  { id: 'c1', name: '指尖覺醒',   desc: '點擊+1',       type: 'ck', bonus: 1,    cost: 100,    req: { allTime: 50 },           emoji: '👆' },
  { id: 'c2', name: '雙重已讀',   desc: '點擊+3',       type: 'ck', bonus: 3,    cost: 1000,   req: { allTime: 500 },          emoji: '✌️' },
  { id: 'c3', name: '已讀連擊',   desc: '點擊+10',      type: 'ck', bonus: 10,   cost: 10000,  req: { allTime: 5000 },         emoji: '⚡' },
  { id: 'c4', name: '已讀風暴',   desc: '點擊+50',      type: 'ck', bonus: 50,   cost: 100000, req: { allTime: 50000 },        emoji: '🌪️' },

  // CLICK % UPGRADES — early-mid game
  { id: 'p1', name: '效率已讀術', desc: '點擊+1%產能',  type: 'cp', bonus: 0.01, cost: 5000,   req: { allTime: 2000 },         emoji: '📈' },
  { id: 'p2', name: '高效已讀術', desc: '點擊+3%產能',  type: 'cp', bonus: 0.03, cost: 50000,  req: { allTime: 20000 },        emoji: '📈' },
  { id: 'p3', name: '極效已讀術', desc: '點擊+5%產能',  type: 'cp', bonus: 0.05, cost: 500000, req: { allTime: 200000 },       emoji: '📈' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 前任 (ex)
  // baseCost=15, tiers at 1/5/15/25/50/100
  // ═══════════════════════════════════════════════
  { id: 'e1',  name: '冷漠的力量',     desc: '前任×2 — 你的冷淡讓前任更努力已讀你', type: 'm', target: 'ex', bonus: 2, cost: 150,        req: { building: 'ex', count: 1 },   emoji: '💔' },
  { id: 'e2',  name: '已讀不回大師',   desc: '前任×2 — 不回覆是一種藝術', type: 'm', target: 'ex', bonus: 2, cost: 1500,       req: { building: 'ex', count: 5 },   emoji: '💔' },
  { id: 'e3',  name: '前任軍團',       desc: '前任×2 — 他們組了工會，但還是不敢回覆', type: 'm', target: 'ex', bonus: 2, cost: 15000,      req: { building: 'ex', count: 15 },  emoji: '💔' },
  { id: 'e4',  name: '數位斯德哥爾摩', desc: '前任×2 — 被已讀久了竟然開始享受', type: 'm', target: 'ex', bonus: 2, cost: 150000,     req: { building: 'ex', count: 25 },  emoji: '💔' },
  { id: 'e5',  name: '前任文明',       desc: '前任×2 — 前任們建立了自己的社會制度', type: 'm', target: 'ex', bonus: 2, cost: 1500000,    req: { building: 'ex', count: 50 },  emoji: '💔' },
  { id: 'e6',  name: '前任宇宙',       desc: '前任×2 — 你的前任比星星還多', type: 'm', target: 'ex', bonus: 2, cost: 15000000,   req: { building: 'ex', count: 100 }, emoji: '💔' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 爸媽 (par)
  // baseCost=100
  // ═══════════════════════════════════════════════
  { id: 'p_1', name: '外套加持',       desc: '爸媽×2 — 「外面冷穿外套」的力量是無限的', type: 'm', target: 'par', bonus: 2, cost: 1000,       req: { building: 'par', count: 1 },   emoji: '🧥' },
  { id: 'p_2', name: '養生文轟炸',     desc: '爸媽×2 — 每天收到的養生文可以繞地球三圈', type: 'm', target: 'par', bonus: 2, cost: 10000,      req: { building: 'par', count: 5 },   emoji: '📰' },
  { id: 'p_3', name: '親情勒索2.0',    desc: '爸媽×2 — 「你都不回訊息是不是不要我們了」', type: 'm', target: 'par', bonus: 2, cost: 100000,     req: { building: 'par', count: 15 },  emoji: '❤️' },
  { id: 'p_4', name: '長輩圖核彈',     desc: '爸媽×2 — 早安圖的解析度突破了4K', type: 'm', target: 'par', bonus: 2, cost: 1000000,    req: { building: 'par', count: 25 },  emoji: '💣' },
  { id: 'p_5', name: '全家都已讀',     desc: '爸媽×2 — 連狗都學會已讀了', type: 'm', target: 'par', bonus: 2, cost: 10000000,   req: { building: 'par', count: 50 },  emoji: '👨‍👩‍👧‍👦' },
  { id: 'p_6', name: '祖宗十八代已讀', desc: '爸媽×2 — 連祖先牌位都顯示已讀', type: 'm', target: 'par', bonus: 2, cost: 100000000,  req: { building: 'par', count: 100 }, emoji: '🏛️' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 忙朋友 (bsy)
  // baseCost=500
  // ═══════════════════════════════════════════════
  { id: 'b1', name: '改天約加速器',   desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 5000,        req: { building: 'bsy', count: 1 },   emoji: '📅' },
  { id: 'b2', name: '爽約專業化',     desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 50000,       req: { building: 'bsy', count: 5 },   emoji: '💨' },
  { id: 'b3', name: '忙碌量子化',     desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 500000,      req: { building: 'bsy', count: 15 },  emoji: '⚛️' },
  { id: 'b4', name: '友情蒸發器',     desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 5000000,     req: { building: 'bsy', count: 25 },  emoji: '💀' },
  { id: 'b5', name: '社交恐懼症候群', desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 50000000,    req: { building: 'bsy', count: 50 },  emoji: '😱' },
  { id: 'b6', name: '孤獨的終極形態', desc: '忙朋友x2', type: 'm', target: 'bsy', bonus: 2, cost: 500000000,   req: { building: 'bsy', count: 100 }, emoji: '🕳️' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 公司HR (hr)
  // baseCost=3000
  // ═══════════════════════════════════════════════
  { id: 'h1', name: '官方回覆範本',   desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 30000,       req: { building: 'hr', count: 1 },   emoji: '📋' },
  { id: 'h2', name: '企業文化洗腦',   desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 300000,      req: { building: 'hr', count: 5 },   emoji: '🧠' },
  { id: 'h3', name: '資本主義的溫度', desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 3000000,     req: { building: 'hr', count: 15 },  emoji: '🌡️' },
  { id: 'h4', name: '績效改善計畫',   desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 30000000,    req: { building: 'hr', count: 25 },  emoji: '📉' },
  { id: 'h5', name: '無薪假量產線',   desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 300000000,   req: { building: 'hr', count: 50 },  emoji: '🏭' },
  { id: 'h6', name: '勞基法黑洞',     desc: 'HRx2', type: 'm', target: 'hr', bonus: 2, cost: 3000000000,  req: { building: 'hr', count: 100 }, emoji: '⚖️' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 外送客服 (del)
  // baseCost=15000
  // ═══════════════════════════════════════════════
  { id: 'd1', name: '罐頭回覆優化',     desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 150000,       req: { building: 'del', count: 1 },   emoji: '🥫' },
  { id: 'd2', name: '自動道歉系統',     desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 1500000,      req: { building: 'del', count: 5 },   emoji: '🤖' },
  { id: 'd3', name: '餐點量子疊加態',   desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 15000000,     req: { building: 'del', count: 15 },  emoji: '🍔' },
  { id: 'd4', name: '客訴黑洞吸收器',   desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 150000000,    req: { building: 'del', count: 25 },  emoji: '🕳️' },
  { id: 'd5', name: '差評湮滅引擎',     desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 1500000000,   req: { building: 'del', count: 50 },  emoji: '💥' },
  { id: 'd6', name: '外送員已超越時空',  desc: '外送x2', type: 'm', target: 'del', bonus: 2, cost: 15000000000,  req: { building: 'del', count: 100 }, emoji: '🚀' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 政府承辦 (gov)
  // baseCost=80000
  // ═══════════════════════════════════════════════
  { id: 'g1', name: '電子化公文',   desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 800000,        req: { building: 'gov', count: 1 },   emoji: '📄' },
  { id: 'g2', name: '蓋章自動化',   desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 8000000,       req: { building: 'gov', count: 5 },   emoji: '🔏' },
  { id: 'g3', name: '民主已讀',     desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 80000000,      req: { building: 'gov', count: 15 },  emoji: '🗳️' },
  { id: 'g4', name: '公務員永生術', desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 800000000,     req: { building: 'gov', count: 25 },  emoji: '🧟' },
  { id: 'g5', name: '行政效率悖論', desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 8000000000,    req: { building: 'gov', count: 50 },  emoji: '🔄' },
  { id: 'g6', name: '國家級已讀',   desc: '承辦x2', type: 'm', target: 'gov', bonus: 2, cost: 80000000000,   req: { building: 'gov', count: 100 }, emoji: '🏛️' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 情報機構 (int)
  // baseCost=400000
  // ═══════════════════════════════════════════════
  { id: 'i1', name: '機密解碼器',     desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 4000000,        req: { building: 'int', count: 1 },   emoji: '🔓' },
  { id: 'i2', name: '全球監控網',     desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 40000000,       req: { building: 'int', count: 5 },   emoji: '🌐' },
  { id: 'i3', name: '思想已讀計畫',   desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 400000000,      req: { building: 'int', count: 15 },  emoji: '🧠' },
  { id: 'i4', name: '隱私？那是什麼', desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 4000000000,     req: { building: 'int', count: 25 },  emoji: '👁️' },
  { id: 'i5', name: '歐威爾認證',     desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 40000000000,    req: { building: 'int', count: 50 },  emoji: '📕' },
  { id: 'i6', name: '全人類已讀監控', desc: '情報x2', type: 'm', target: 'int', bonus: 2, cost: 400000000000,   req: { building: 'int', count: 100 }, emoji: '🛰️' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 社群演算法 (algo)
  // baseCost=2000000
  // ═══════════════════════════════════════════════
  { id: 'al1', name: '精準推送',       desc: '演算法x2', type: 'm', target: 'algo', bonus: 2, cost: 20000000,       req: { building: 'algo', count: 1 },   emoji: '🎯' },
  { id: 'al2', name: '病毒式傳播',     desc: '演算法x2', type: 'm', target: 'algo', bonus: 2, cost: 200000000,      req: { building: 'algo', count: 5 },   emoji: '🦠' },
  { id: 'al3', name: '多巴胺綁架術',   desc: '演算法x2', type: 'm', target: 'algo', bonus: 2, cost: 2000000000,     req: { building: 'algo', count: 15 },  emoji: '💉' },
  { id: 'al4', name: '注意力收割機',   desc: '演算法x2', type: 'm', target: 'algo', bonus: 2, cost: 20000000000,    req: { building: 'algo', count: 25 },  emoji: '🌾' },
  { id: 'al5', name: '自由意志已過期', desc: '演算法x2', type: 'm', target: 'algo', bonus: 2, cost: 200000000000,   req: { building: 'algo', count: 50 },  emoji: '🔗' },
  { id: 'al6', name: '演算法即上帝',   desc: '演算法x2', type: 'm', target: 'algo', bonus: 2, cost: 2000000000000,  req: { building: 'algo', count: 100 }, emoji: '👑' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — AI客服 (ai)
  // baseCost=10000000
  // ═══════════════════════════════════════════════
  { id: 'ai1', name: '深度學習',       desc: 'AIx2', type: 'm', target: 'ai', bonus: 2, cost: 100000000,       req: { building: 'ai', count: 1 },   emoji: '🧠' },
  { id: 'ai2', name: 'AGI覺醒',        desc: 'AIx2', type: 'm', target: 'ai', bonus: 2, cost: 1000000000,      req: { building: 'ai', count: 5 },   emoji: '💡' },
  { id: 'ai3', name: '圖靈測試粉碎者', desc: 'AIx2', type: 'm', target: 'ai', bonus: 2, cost: 10000000000,     req: { building: 'ai', count: 15 },  emoji: '🤖' },
  { id: 'ai4', name: 'AI比你更懂你',   desc: 'AIx2', type: 'm', target: 'ai', bonus: 2, cost: 100000000000,    req: { building: 'ai', count: 25 },  emoji: '🪞' },
  { id: 'ai5', name: '矽基生命宣言',   desc: 'AIx2', type: 'm', target: 'ai', bonus: 2, cost: 1000000000000,   req: { building: 'ai', count: 50 },  emoji: '🔬' },
  { id: 'ai6', name: '人類已被已讀',   desc: 'AIx2', type: 'm', target: 'ai', bonus: 2, cost: 10000000000000,  req: { building: 'ai', count: 100 }, emoji: '☠️' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 外星通訊 (alien)
  // baseCost=50000000
  // ═══════════════════════════════════════════════
  { id: 'x1', name: '星際翻譯機',     desc: '外星x2', type: 'm', target: 'alien', bonus: 2, cost: 500000000,       req: { building: 'alien', count: 1 },   emoji: '🛸' },
  { id: 'x2', name: '蟲洞加速器',     desc: '外星x2', type: 'm', target: 'alien', bonus: 2, cost: 5000000000,      req: { building: 'alien', count: 5 },   emoji: '🌀' },
  { id: 'x3', name: '費米悖論解答者', desc: '外星x2', type: 'm', target: 'alien', bonus: 2, cost: 50000000000,     req: { building: 'alien', count: 15 },  emoji: '🔭' },
  { id: 'x4', name: '銀河已讀聯盟',   desc: '外星x2', type: 'm', target: 'alien', bonus: 2, cost: 500000000000,    req: { building: 'alien', count: 25 },  emoji: '🌌' },
  { id: 'x5', name: '暗物質通訊網',   desc: '外星x2', type: 'm', target: 'alien', bonus: 2, cost: 5000000000000,   req: { building: 'alien', count: 50 },  emoji: '🌑' },
  { id: 'x6', name: '宇宙已讀不回你', desc: '外星x2', type: 'm', target: 'alien', bonus: 2, cost: 50000000000000,  req: { building: 'alien', count: 100 }, emoji: '🪐' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 時間迴圈 (time)
  // baseCost=250000000
  // ═══════════════════════════════════════════════
  { id: 't1', name: '時空折疊',       desc: '迴圈x2', type: 'm', target: 'time', bonus: 2, cost: 2500000000,       req: { building: 'time', count: 1 },   emoji: '🕰️' },
  { id: 't2', name: '永恆已讀',       desc: '迴圈x2', type: 'm', target: 'time', bonus: 2, cost: 25000000000,      req: { building: 'time', count: 5 },   emoji: '♾️' },
  { id: 't3', name: '因果律已讀',     desc: '迴圈x2', type: 'm', target: 'time', bonus: 2, cost: 250000000000,     req: { building: 'time', count: 15 },  emoji: '🔮' },
  { id: 't4', name: '平行宇宙全已讀', desc: '迴圈x2', type: 'm', target: 'time', bonus: 2, cost: 2500000000000,    req: { building: 'time', count: 25 },  emoji: '🌊' },
  { id: 't5', name: '熵的已讀通知',   desc: '迴圈x2', type: 'm', target: 'time', bonus: 2, cost: 25000000000000,   req: { building: 'time', count: 50 },  emoji: '🌡️' },
  { id: 't6', name: '存在本身即已讀', desc: '迴圈x2', type: 'm', target: 'time', bonus: 2, cost: 250000000000000,  req: { building: 'time', count: 100 }, emoji: '🌟' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 量子已讀 (quantum)
  // baseCost=1500000000
  // ═══════════════════════════════════════════════
  { id: 'q1', name: '波函數坍縮',     desc: '量子x2', type: 'm', target: 'quantum', bonus: 2, cost: 15000000000,       req: { building: 'quantum', count: 1 },   emoji: '⚛️' },
  { id: 'q2', name: '量子隧穿已讀',   desc: '量子x2', type: 'm', target: 'quantum', bonus: 2, cost: 150000000000,      req: { building: 'quantum', count: 5 },   emoji: '🌊' },
  { id: 'q3', name: '海森堡已讀原理', desc: '量子x2', type: 'm', target: 'quantum', bonus: 2, cost: 1500000000000,     req: { building: 'quantum', count: 15 },  emoji: '🔬' },
  { id: 'q4', name: '量子霸權',       desc: '量子x2', type: 'm', target: 'quantum', bonus: 2, cost: 15000000000000,    req: { building: 'quantum', count: 25 },  emoji: '👑' },
  { id: 'q5', name: '多重宇宙已讀',   desc: '量子x2', type: 'm', target: 'quantum', bonus: 2, cost: 150000000000000,   req: { building: 'quantum', count: 50 },  emoji: '🌌' },
  { id: 'q6', name: '量子不朽',       desc: '量子x2', type: 'm', target: 'quantum', bonus: 2, cost: 1500000000000000,  req: { building: 'quantum', count: 100 }, emoji: '💎' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 虛空已讀 (void)
  // baseCost=10000000000
  // ═══════════════════════════════════════════════
  { id: 'v1', name: '深淵凝視',       desc: '虛空x2', type: 'm', target: 'void', bonus: 2, cost: 100000000000,        req: { building: 'void', count: 1 },   emoji: '🕳️' },
  { id: 'v2', name: '存在的已讀',     desc: '虛空x2', type: 'm', target: 'void', bonus: 2, cost: 1000000000000,       req: { building: 'void', count: 5 },   emoji: '🌑' },
  { id: 'v3', name: '尼采的回覆',     desc: '虛空x2', type: 'm', target: 'void', bonus: 2, cost: 10000000000000,      req: { building: 'void', count: 15 },  emoji: '📖' },
  { id: 'v4', name: '虛無主義宣言',   desc: '虛空x2', type: 'm', target: 'void', bonus: 2, cost: 100000000000000,     req: { building: 'void', count: 25 },  emoji: '📜' },
  { id: 'v5', name: '熵的勝利',       desc: '虛空x2', type: 'm', target: 'void', bonus: 2, cost: 1000000000000000,    req: { building: 'void', count: 50 },  emoji: '🌡️' },
  { id: 'v6', name: '萬物歸於已讀',   desc: '虛空x2', type: 'm', target: 'void', bonus: 2, cost: 10000000000000000,   req: { building: 'void', count: 100 }, emoji: '💀' },

  // ═══════════════════════════════════════════════
  // BUILDING TIER UPGRADES — 神之已讀 (god)
  // baseCost=100000000000
  // ═══════════════════════════════════════════════
  { id: 'gd1', name: '神諭解碼',       desc: '神x2', type: 'm', target: 'god', bonus: 2, cost: 1000000000000,         req: { building: 'god', count: 1 },   emoji: '👁️' },
  { id: 'gd2', name: '十誡之已讀',     desc: '神x2', type: 'm', target: 'god', bonus: 2, cost: 10000000000000,        req: { building: 'god', count: 5 },   emoji: '📋' },
  { id: 'gd3', name: '創世紀改寫',     desc: '神x2', type: 'm', target: 'god', bonus: 2, cost: 100000000000000,       req: { building: 'god', count: 15 },  emoji: '✨' },
  { id: 'gd4', name: '全知全已讀',     desc: '神x2', type: 'm', target: 'god', bonus: 2, cost: 1000000000000000,      req: { building: 'god', count: 25 },  emoji: '🔮' },
  { id: 'gd5', name: '啟示錄的最後一讀', desc: '神x2', type: 'm', target: 'god', bonus: 2, cost: 10000000000000000,   req: { building: 'god', count: 50 },  emoji: '🌋' },
  { id: 'gd6', name: '超越神性的已讀', desc: '神x2', type: 'm', target: 'god', bonus: 2, cost: 100000000000000000,    req: { building: 'god', count: 100 }, emoji: '🪐' },

  // ═══════════════════════════════════════════════
  // LATE-GAME CLICK UPGRADES
  // ═══════════════════════════════════════════════
  { id: 'c5', name: '已讀核爆',     desc: '點擊+500',    type: 'ck', bonus: 500,    cost: 5000000,       req: { allTime: 2000000 },      emoji: '☢️' },
  { id: 'c6', name: '已讀奇點',     desc: '點擊+5000',   type: 'ck', bonus: 5000,   cost: 50000000,      req: { allTime: 20000000 },     emoji: '🔮' },
  { id: 'c7', name: '已讀暗能量',   desc: '點擊+50000',  type: 'ck', bonus: 50000,  cost: 500000000,     req: { allTime: 200000000 },    emoji: '🌑' },
  { id: 'c8', name: '已讀大爆炸',   desc: '點擊+500000', type: 'ck', bonus: 500000, cost: 5000000000,    req: { allTime: 2000000000 },   emoji: '💫' },
  { id: 'c9', name: '指尖超新星',   desc: '點擊+5000000',type: 'ck', bonus: 5000000,cost: 50000000000,   req: { allTime: 20000000000 },  emoji: '✨' },

  { id: 'p4', name: '終極已讀術',   desc: '點擊+10%產能', type: 'cp', bonus: 0.10, cost: 10000000,    req: { allTime: 5000000 },      emoji: '📈' },
  { id: 'p5', name: '超越已讀術',   desc: '點擊+15%產能', type: 'cp', bonus: 0.15, cost: 500000000,   req: { allTime: 200000000 },    emoji: '📊' },
  { id: 'p6', name: '無限已讀術',   desc: '點擊+20%產能', type: 'cp', bonus: 0.20, cost: 50000000000, req: { allTime: 20000000000 },  emoji: '🚀' },

  // ═══════════════════════════════════════════════
  // CROSS-BUILDING GLOBAL UPGRADES (type: 'g')
  // bonus is a multiplier applied to ALL buildings
  // req.buildings is an array of {id, count} conditions (ALL must be met)
  // ═══════════════════════════════════════════════
  {
    id: 'gb1', name: '已讀即正義',     desc: '全建築x1.1 — 前任100+爸媽50',
    type: 'g', bonus: 1.1, cost: 500000, emoji: '⚖️',
    req: { buildings: [{ id: 'ex', count: 100 }, { id: 'par', count: 50 }] },
  },
  {
    id: 'gb2', name: '社會化冷漠',     desc: '全建築x1.1 — 忙朋友50+HR25',
    type: 'g', bonus: 1.1, cost: 5000000, emoji: '🧊',
    req: { buildings: [{ id: 'bsy', count: 50 }, { id: 'hr', count: 25 }] },
  },
  {
    id: 'gb3', name: '無人回覆協議',   desc: '全建築x1.15 — 外送50+政府25',
    type: 'g', bonus: 1.15, cost: 50000000, emoji: '📵',
    req: { buildings: [{ id: 'del', count: 50 }, { id: 'gov', count: 25 }] },
  },
  {
    id: 'gb4', name: '全球靜音模式',   desc: '全建築x1.15 — 情報25+演算法25',
    type: 'g', bonus: 1.15, cost: 500000000, emoji: '🔇',
    req: { buildings: [{ id: 'int', count: 25 }, { id: 'algo', count: 25 }] },
  },
  {
    id: 'gb5', name: '後人類溝通障礙', desc: '全建築x1.2 — AI50+外星25',
    type: 'g', bonus: 1.2, cost: 5000000000, emoji: '🧬',
    req: { buildings: [{ id: 'ai', count: 50 }, { id: 'alien', count: 25 }] },
  },
  {
    id: 'gb6', name: '時間已讀悖論',   desc: '全建築x1.2 — 時間迴圈25+前任100',
    type: 'g', bonus: 1.2, cost: 50000000000, emoji: '⏳',
    req: { buildings: [{ id: 'time', count: 25 }, { id: 'ex', count: 100 }] },
  },
  {
    id: 'gb7', name: '萬物皆已讀',     desc: '全建築x1.25 — 六種建築各50',
    type: 'g', bonus: 1.25, cost: 500000000000, emoji: '🌍',
    req: { buildings: [
      { id: 'ex', count: 50 }, { id: 'par', count: 50 }, { id: 'bsy', count: 50 },
      { id: 'hr', count: 50 }, { id: 'del', count: 50 }, { id: 'gov', count: 50 },
    ] },
  },
  {
    id: 'gb8', name: '寂靜的終局',     desc: '全建築x1.3 — 九種建築各50',
    type: 'g', bonus: 1.3, cost: 5000000000000, emoji: '🕸️',
    req: { buildings: [
      { id: 'ex', count: 50 }, { id: 'par', count: 50 }, { id: 'bsy', count: 50 },
      { id: 'hr', count: 50 }, { id: 'del', count: 50 }, { id: 'gov', count: 50 },
      { id: 'int', count: 50 }, { id: 'algo', count: 50 }, { id: 'ai', count: 50 },
    ] },
  },
  {
    id: 'gb9', name: '熱寂：最後的已讀', desc: '全建築x1.5 — 全部建築各100',
    type: 'g', bonus: 1.5, cost: 100000000000000, emoji: '🌌',
    req: { buildings: [
      { id: 'ex', count: 100 }, { id: 'par', count: 100 }, { id: 'bsy', count: 100 },
      { id: 'hr', count: 100 }, { id: 'del', count: 100 }, { id: 'gov', count: 100 },
      { id: 'int', count: 100 }, { id: 'algo', count: 100 }, { id: 'ai', count: 100 },
      { id: 'alien', count: 100 }, { id: 'time', count: 100 },
    ] },
  },

  // ═══════════════════════════════════════════════
  // GOLDEN COOKIE UPGRADES — unlock & enhance random events
  // type: 'gc' — handled specially in App.jsx
  // ═══════════════════════════════════════════════
  {
    id: 'gc1', name: '命運的通知',
    desc: '解鎖金色事件。因為你值得被命運已讀。',
    type: 'gc', bonus: 'unlock', cost: 1000, emoji: '🍪',
    req: { allTime: 500 },
  },
  {
    id: 'gc2', name: '幸運加速器',
    desc: '金色事件出現頻率+30%。你的運氣也被已讀了。',
    type: 'gc', bonus: 'freq', cost: 50000, emoji: '🍀',
    req: { allTime: 25000 },
  },
  {
    id: 'gc3', name: '黃金觸控',
    desc: '金色事件倍率+1。手指碰到的都變成已讀。',
    type: 'gc', bonus: 'power', cost: 500000, emoji: '✨',
    req: { allTime: 250000 },
  },
  {
    id: 'gc4', name: '幸運餅乾工廠',
    desc: '金色事件持續時間+50%。工廠24小時輪班製造幸運。',
    type: 'gc', bonus: 'duration', cost: 5000000, emoji: '🏭',
    req: { allTime: 2500000 },
  },
  {
    id: 'gc5', name: '宇宙彩券中獎',
    desc: '解鎖×10超稀有金色事件。你的人品終於被看見了。',
    type: 'gc', bonus: 'mega', cost: 100000000, emoji: '🎰',
    req: { allTime: 50000000 },
  },
];
