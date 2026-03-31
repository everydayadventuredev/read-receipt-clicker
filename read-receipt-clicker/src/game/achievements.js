import { BUILDINGS } from './buildings.js';

// req signature: (allTime, owned, prestigeCount, prodPerSec, extra)
// extra = { synergies, completedChains, boughtPrestige, stormPerfect, clickSpeed, boughtUpgrades }

export const ACHIEVEMENTS = [
  // ══════════════════════════════════════════════
  // ── AllTime Milestones (bonus = permanent prod %) ──
  // ══════════════════════════════════════════════
  { id: 'a1',  name: '初次已讀',       desc: '已讀第1則訊息',             icon: '🐣', req: (at) => at >= 1 },
  { id: 'a2',  name: '百則大師',       desc: '累計已讀100則',             icon: '💯', bonus: 0.01, req: (at) => at >= 100 },
  { id: 'a3',  name: '千則俱樂部',     desc: '累計已讀1,000則',           icon: '🏅', bonus: 0.02, req: (at) => at >= 1000 },
  { id: 'a4',  name: '萬則傳說',       desc: '累計已讀10,000則',          icon: '🌟', bonus: 0.03, req: (at) => at >= 10000 },
  { id: 'a5',  name: '十萬已讀王',     desc: '累計已讀100,000則',         icon: '👑', bonus: 0.04, req: (at) => at >= 100000 },
  { id: 'a6',  name: '百萬已讀神',     desc: '累計已讀1,000,000則',       icon: '🔱', bonus: 0.05, req: (at) => at >= 1000000 },
  { id: 'a14', name: '千萬已讀仙',     desc: '累計已讀10,000,000則',      icon: '🏆', bonus: 0.06, req: (at) => at >= 10000000 },
  { id: 'at1', name: '五千萬已讀帝',   desc: '累計已讀50,000,000則',      icon: '⭐', bonus: 0.08, req: (at) => at >= 50000000 },
  { id: 'at2', name: '億則超越者',     desc: '累計已讀100,000,000則',     icon: '🌠', bonus: 0.10, req: (at) => at >= 100000000 },
  { id: 'at3', name: '五億已讀魔王',   desc: '累計已讀500,000,000則',     icon: '😈', bonus: 0.12, req: (at) => at >= 500000000 },
  { id: 'at4', name: '十億已讀真神',   desc: '累計已讀1,000,000,000則',   icon: '🛐', bonus: 0.15, req: (at) => at >= 1000000000 },
  { id: 'at5', name: '百億虛空主宰',   desc: '累計已讀10,000,000,000則',  icon: '🌑', bonus: 0.18, req: (at) => at >= 10000000000 },
  { id: 'at6', name: '千億寂滅者',     desc: '累計已讀100,000,000,000則', icon: '💀', bonus: 0.20, req: (at) => at >= 100000000000 },

  // ══════════════════════════════════════════════
  // ── Building Collection: 前任 (ex) ──
  // ══════════════════════════════════════════════
  { id: 'ex1',  name: '第一滴血',       desc: '僱用1個前任',              icon: '💔', req: (at, ow) => ow.ex >= 1 },
  { id: 'a7',   name: '前任收藏家',     desc: '僱用10個前任',             icon: '💔', req: (at, ow) => ow.ex >= 10 },
  { id: 'ex25', name: '感情回收站',     desc: '僱用25個前任',             icon: '♻️', req: (at, ow) => ow.ex >= 25 },
  { id: 'ex50', name: '前任博覽會',     desc: '僱用50個前任',             icon: '🎪', req: (at, ow) => ow.ex >= 50 },
  { id: 'a15',  name: '前任百人斬',     desc: '僱用100個前任',            icon: '🗡️', req: (at, ow) => ow.ex >= 100 },

  // ── Building Collection: 爸媽 (par) ──
  { id: 'par1',  name: '有人在家嗎',     desc: '僱用1對爸媽',             icon: '👨‍👩‍👧', req: (at, ow) => ow.par >= 1 },
  { id: 'a8',    name: '孝順模擬器',     desc: '僱用10對爸媽',            icon: '🥺', req: (at, ow) => ow.par >= 10 },
  { id: 'par25', name: '外套宇宙',       desc: '僱用25對爸媽',            icon: '🧥', req: (at, ow) => ow.par >= 25 },
  { id: 'par50', name: '全球最多爸媽的人', desc: '僱用50對爸媽',           icon: '👪', req: (at, ow) => ow.par >= 50 },
  { id: 'par100', name: '親情泡沫經濟',  desc: '僱用100對爸媽',           icon: '🫂', req: (at, ow) => ow.par >= 100 },

  // ── Building Collection: 忙朋友 (bsy) ──
  { id: 'bsy1',  name: '「改天約」',      desc: '僱用1個忙朋友',           icon: '🏃', req: (at, ow) => ow.bsy >= 1 },
  { id: 'bsy10', name: '等待戈多',        desc: '僱用10個忙朋友',          icon: '⏰', req: (at, ow) => ow.bsy >= 10 },
  { id: 'a9',    name: '社交蒸發',        desc: '僱用25個忙朋友',          icon: '💨', req: (at, ow) => ow.bsy >= 25 },
  { id: 'bsy50', name: '孤獨美食家',      desc: '僱用50個忙朋友',          icon: '🍜', req: (at, ow) => ow.bsy >= 50 },
  { id: 'bsy100', name: '改天再約股份有限公司', desc: '僱用100個忙朋友',   icon: '🏢', req: (at, ow) => ow.bsy >= 100 },

  // ── Building Collection: 公司HR (hr) ──
  { id: 'hr1',   name: '已轉相關部門',    desc: '僱用1個公司HR',           icon: '💼', req: (at, ow) => ow.hr >= 1 },
  { id: 'hr10',  name: '官僚藝術家',      desc: '僱用10個公司HR',          icon: '📋', req: (at, ow) => ow.hr >= 10 },
  { id: 'a16',   name: '企業戰士',        desc: '僱用25個公司HR',          icon: '💼', req: (at, ow) => ow.hr >= 25 },
  { id: 'hr50',  name: '制度暴君',        desc: '僱用50個公司HR',          icon: '⚖️', req: (at, ow) => ow.hr >= 50 },
  { id: 'hr100', name: '人資帝國永不回覆', desc: '僱用100個公司HR',        icon: '🏛️', req: (at, ow) => ow.hr >= 100 },

  // ── Building Collection: 外送客服 (del) ──
  { id: 'del1',   name: '為您查詢中',     desc: '僱用1個外送客服',         icon: '🛵', req: (at, ow) => ow.del >= 1 },
  { id: 'del10',  name: '永恆等待',       desc: '僱用10個外送客服',        icon: '⏳', req: (at, ow) => ow.del >= 10 },
  { id: 'del25',  name: '客服矩陣',       desc: '僱用25個外送客服',        icon: '🔄', req: (at, ow) => ow.del >= 25 },
  { id: 'del50',  name: '餐點去了平行宇宙', desc: '僱用50個外送客服',      icon: '🌀', req: (at, ow) => ow.del >= 50 },
  { id: 'del100', name: '客訴黑洞',       desc: '僱用100個外送客服',       icon: '🕳️', req: (at, ow) => ow.del >= 100 },

  // ── Building Collection: 政府承辦 (gov) ──
  { id: 'gov1',   name: '請抽號碼牌',     desc: '僱用1個政府承辦',         icon: '🏛️', req: (at, ow) => ow.gov >= 1 },
  { id: 'gov10',  name: '公文迷宮',       desc: '僱用10個政府承辦',        icon: '📄', req: (at, ow) => ow.gov >= 10 },
  { id: 'gov25',  name: '行政黑洞',       desc: '僱用25個政府承辦',        icon: '🌑', req: (at, ow) => ow.gov >= 25 },
  { id: 'gov50',  name: '民主已讀制',     desc: '僱用50個政府承辦',        icon: '🗳️', req: (at, ow) => ow.gov >= 50 },
  { id: 'gov100', name: '全國都在等公文',  desc: '僱用100個政府承辦',      icon: '🇹🇼', req: (at, ow) => ow.gov >= 100 },

  // ── Building Collection: 情報機構 (int) ──
  { id: 'int1',   name: '機密等級：已讀',  desc: '僱用1個情報機構',        icon: '🕵️', req: (at, ow) => ow.int >= 1 },
  { id: 'a17',    name: '情報總監',        desc: '僱用10個情報機構',        icon: '🕵️', req: (at, ow) => ow.int >= 10 },
  { id: 'int25',  name: '全球監控網',      desc: '僱用25個情報機構',        icon: '🛰️', req: (at, ow) => ow.int >= 25 },
  { id: 'int50',  name: '影子政府',        desc: '僱用50個情報機構',        icon: '🌐', req: (at, ow) => ow.int >= 50 },
  { id: 'int100', name: '老大哥在已讀',    desc: '僱用100個情報機構',       icon: '👁️', req: (at, ow) => ow.int >= 100 },

  // ── Building Collection: 社群演算法 (algo) ──
  { id: 'algo1',   name: '推薦開始',       desc: '僱用1個社群演算法',      icon: '📱', req: (at, ow) => ow.algo >= 1 },
  { id: 'algo10',  name: '資訊繭房',       desc: '僱用10個社群演算法',     icon: '🕸️', req: (at, ow) => ow.algo >= 10 },
  { id: 'algo25',  name: '注意力收割機',   desc: '僱用25個社群演算法',     icon: '🧲', req: (at, ow) => ow.algo >= 25 },
  { id: 'algo50',  name: '多巴胺農場主',   desc: '僱用50個社群演算法',     icon: '🧪', req: (at, ow) => ow.algo >= 50 },
  { id: 'algo100', name: '演算法已取代自由意志', desc: '僱用100個社群演算法', icon: '🤯', req: (at, ow) => ow.algo >= 100 },

  // ── Building Collection: AI客服 (ai) ──
  { id: 'ai1',   name: '您好我是小幫手',   desc: '僱用1個AI客服',          icon: '🤖', req: (at, ow) => ow.ai >= 1 },
  { id: 'ai10',  name: 'AI互讀俱樂部',    desc: '僱用10個AI客服',          icon: '🔁', req: (at, ow) => ow.ai >= 10 },
  { id: 'ai25',  name: '圖靈測試？已讀',   desc: '僱用25個AI客服',         icon: '🧠', req: (at, ow) => ow.ai >= 25 },
  { id: 'ai50',  name: '矽基已讀文明',     desc: '僱用50個AI客服',         icon: '💎', req: (at, ow) => ow.ai >= 50 },
  { id: 'ai100', name: '奇點已至',         desc: '僱用100個AI客服',         icon: '☄️', req: (at, ow) => ow.ai >= 100 },

  // ── Building Collection: 外星通訊 (alien) ──
  { id: 'alien1',   name: '宇宙很安靜',     desc: '僱用1個外星通訊',       icon: '👽', req: (at, ow) => ow.alien >= 1 },
  { id: 'alien10',  name: '費米悖論解答',   desc: '僱用10個外星通訊',       icon: '🔭', req: (at, ow) => ow.alien >= 10 },
  { id: 'alien25',  name: '銀河已讀聯邦',   desc: '僱用25個外星通訊',       icon: '🌌', req: (at, ow) => ow.alien >= 25 },
  { id: 'alien50',  name: '跨維度社恐',     desc: '僱用50個外星通訊',       icon: '🛸', req: (at, ow) => ow.alien >= 50 },
  { id: 'alien100', name: '宇宙的盡頭是已讀', desc: '僱用100個外星通訊',    icon: '🌀', req: (at, ow) => ow.alien >= 100 },

  // ── Building Collection: 時間迴圈 (time) ──
  { id: 'time1',   name: '時間悖論',        desc: '僱用1個時間迴圈',        icon: '⏳', req: (at, ow) => ow.time >= 1 },
  { id: 'time10',  name: '因果律抗議中',    desc: '僱用10個時間迴圈',       icon: '🔀', req: (at, ow) => ow.time >= 10 },
  { id: 'time25',  name: '時間管理局崩潰',  desc: '僱用25個時間迴圈',       icon: '💥', req: (at, ow) => ow.time >= 25 },
  { id: 'time50',  name: '因果律崩壞',      desc: '僱用50個時間迴圈',       icon: '🌋', req: (at, ow) => ow.time >= 50 },
  { id: 'time100', name: '已讀先於存在',    desc: '僱用100個時間迴圈',      icon: '♾️', req: (at, ow) => ow.time >= 100 },

  // ── Building Collection: 網紅 (inf) ──
  { id: 'inf1',   name: '第一個粉絲',       desc: '僱用1個網紅',            icon: '📸', req: (at, ow) => (ow.inf ?? 0) >= 1 },
  { id: 'inf10',  name: '流量密碼',         desc: '僱用10個網紅',           icon: '📲', req: (at, ow) => (ow.inf ?? 0) >= 10 },
  { id: 'inf25',  name: '限動大軍',         desc: '僱用25個網紅',           icon: '📱', req: (at, ow) => (ow.inf ?? 0) >= 25 },
  { id: 'inf50',  name: '已讀KOL帝國',      desc: '僱用50個網紅',           icon: '🌟', req: (at, ow) => (ow.inf ?? 0) >= 50 },
  { id: 'inf100', name: '網紅黑洞',         desc: '僱用100個網紅',          icon: '🕳️', req: (at, ow) => (ow.inf ?? 0) >= 100, bonus: 0.02 },

  // ── Building Collection: 前輩 (sen) ──
  { id: 'sen1',   name: '聽我說',           desc: '僱用1個前輩',            icon: '🧓', req: (at, ow) => (ow.sen ?? 0) >= 1 },
  { id: 'sen10',  name: '職場傳承',         desc: '僱用10個前輩',           icon: '🎖️', req: (at, ow) => (ow.sen ?? 0) >= 10 },
  { id: 'sen25',  name: '已讀文化代代傳',   desc: '僱用25個前輩',           icon: '📜', req: (at, ow) => (ow.sen ?? 0) >= 25 },
  { id: 'sen50',  name: '傳說前輩聯盟',     desc: '僱用50個前輩',           icon: '🏅', req: (at, ow) => (ow.sen ?? 0) >= 50 },
  { id: 'sen100', name: '已讀學院派',       desc: '僱用100個前輩',          icon: '🎓', req: (at, ow) => (ow.sen ?? 0) >= 100, bonus: 0.02 },

  // ── Building Collection: 記者 (rep) ──
  { id: 'rep1',   name: '線報已收',         desc: '僱用1個記者',            icon: '📰', req: (at, ow) => (ow.rep ?? 0) >= 1 },
  { id: 'rep10',  name: '媒體大亨',         desc: '僱用10個記者',           icon: '🗞️', req: (at, ow) => (ow.rep ?? 0) >= 10 },
  { id: 'rep25',  name: '已讀無所遁形',     desc: '僱用25個記者',           icon: '🔍', req: (at, ow) => (ow.rep ?? 0) >= 25 },
  { id: 'rep50',  name: '第四權已讀化',     desc: '僱用50個記者',           icon: '📡', req: (at, ow) => (ow.rep ?? 0) >= 50 },
  { id: 'rep100', name: '已讀新聞帝國',     desc: '僱用100個記者',          icon: '🏢', req: (at, ow) => (ow.rep ?? 0) >= 100, bonus: 0.02 },

  // ── Building Collection: 駭客 (hkr) ──
  { id: 'hkr1',   name: '後門開啟',         desc: '僱用1個駭客',            icon: '💻', req: (at, ow) => (ow.hkr ?? 0) >= 1 },
  { id: 'hkr10',  name: '黑帽已讀',         desc: '僱用10個駭客',           icon: '🎩', req: (at, ow) => (ow.hkr ?? 0) >= 10 },
  { id: 'hkr25',  name: '已讀基礎設施入侵', desc: '僱用25個駭客',           icon: '🔓', req: (at, ow) => (ow.hkr ?? 0) >= 25 },
  { id: 'hkr50',  name: '零日已讀漏洞',     desc: '僱用50個駭客',           icon: '🛡️', req: (at, ow) => (ow.hkr ?? 0) >= 50 },
  { id: 'hkr100', name: '已讀網域霸主',     desc: '僱用100個駭客',          icon: '👑', req: (at, ow) => (ow.hkr ?? 0) >= 100, bonus: 0.03 },

  // ── Building Collection: 平行自我 (par2) ──
  { id: 'par21',   name: '鏡中影',          desc: '僱用1個平行自我',        icon: '🪞', req: (at, ow) => (ow.par2 ?? 0) >= 1 },
  { id: 'par210',  name: '多元自我',         desc: '僱用10個平行自我',       icon: '🔮', req: (at, ow) => (ow.par2 ?? 0) >= 10 },
  { id: 'par225',  name: '宇宙自我認知',     desc: '僱用25個平行自我',       icon: '🌐', req: (at, ow) => (ow.par2 ?? 0) >= 25 },
  { id: 'par250',  name: '全宇宙已讀一致',   desc: '僱用50個平行自我',       icon: '✨', req: (at, ow) => (ow.par2 ?? 0) >= 50 },
  { id: 'par2100', name: '已讀多元宇宙主宰', desc: '僱用100個平行自我',      icon: '♾️', req: (at, ow) => (ow.par2 ?? 0) >= 100, bonus: 0.04 },

  // ── Building Collection: 意識蜂巢 (hive) ──
  { id: 'hive1',   name: '融入集體',         desc: '僱用1個意識蜂巢',        icon: '🧠', req: (at, ow) => (ow.hive ?? 0) >= 1 },
  { id: 'hive10',  name: '蜂群思維',         desc: '僱用10個意識蜂巢',       icon: '🐝', req: (at, ow) => (ow.hive ?? 0) >= 10 },
  { id: 'hive25',  name: '集體意識覺醒',     desc: '僱用25個意識蜂巢',       icon: '🌊', req: (at, ow) => (ow.hive ?? 0) >= 25 },
  { id: 'hive50',  name: '神經網路已讀',     desc: '僱用50個意識蜂巢',       icon: '⚡', req: (at, ow) => (ow.hive ?? 0) >= 50 },
  { id: 'hive100', name: '宇宙意識統一已讀', desc: '僱用100個意識蜂巢',      icon: '🌌', req: (at, ow) => (ow.hive ?? 0) >= 100, bonus: 0.05 },

  // ── Building Collection: Special ──
  { id: 'a13', name: '已讀帝國',     desc: '同時擁有所有建築',         icon: '🏰', bonus: 0.05, req: (at, ow) => BUILDINGS.every(b => ow[b.id] > 0) },

  // ══════════════════════════════════════════════
  // ── Speed Achievements (prodPerSec) ──
  // ══════════════════════════════════════════════
  { id: 'a12',  name: '速讀者',         desc: '每秒產能超過1,000',        icon: '⚡', req: (at, ow, pc, ps) => ps >= 1000 },
  { id: 'a18',  name: '光速已讀',       desc: '每秒產能超過10,000',       icon: '💨', req: (at, ow, pc, ps) => ps >= 10000 },
  { id: 'a19',  name: '已讀黑洞',       desc: '每秒產能超過100,000',      icon: '🕳️', req: (at, ow, pc, ps) => ps >= 100000 },
  { id: 'sp1',  name: '量子已讀',       desc: '每秒產能超過1,000,000',    icon: '⚛️', req: (at, ow, pc, ps) => ps >= 1000000 },
  { id: 'sp2',  name: '已讀超新星',     desc: '每秒產能超過10,000,000',   icon: '🌟', req: (at, ow, pc, ps) => ps >= 10000000 },
  { id: 'sp3',  name: '已讀大爆炸',     desc: '每秒產能超過100,000,000',  icon: '💫', req: (at, ow, pc, ps) => ps >= 100000000 },

  // ══════════════════════════════════════════════
  // ── Prestige Achievements ──
  // ══════════════════════════════════════════════
  { id: 'a10', name: '已讀不回之神',   desc: '達成首次Inbox Zero',        icon: '🌀', bonus: 0.05, req: (at, ow, pc) => pc >= 1 },
  { id: 'a11', name: '時空旅人',       desc: '重生3次',                   icon: '⏳', bonus: 0.08, req: (at, ow, pc) => pc >= 3 },
  { id: 'a20', name: '輪迴大師',       desc: '重生5次',                   icon: '🔄', bonus: 0.10, req: (at, ow, pc) => pc >= 5 },
  { id: 'a21', name: '超越者',         desc: '重生10次',                  icon: '🚀', bonus: 0.15, req: (at, ow, pc) => pc >= 10 },
  { id: 'pr1', name: '存在主義危機',   desc: '重生20次',                  icon: '🫠', bonus: 0.20, req: (at, ow, pc) => pc >= 20 },
  { id: 'a22', name: '已讀力收藏家',   desc: '購買5個重生升級',           icon: '🛒', req: (at, ow, pc, ps, ex) => ex.boughtPrestige >= 5 },

  // ══════════════════════════════════════════════
  // ── Upgrade Collection Achievements ──
  // ══════════════════════════════════════════════
  { id: 'up1', name: '小試身手',       desc: '購買10個升級',              icon: '🔧', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 10 },
  { id: 'a30', name: '升級狂人',       desc: '購買15個升級',              icon: '📈', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 15 },
  { id: 'a31', name: '全副武裝',       desc: '購買25個升級',              icon: '🛡️', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 25 },
  { id: 'up2', name: '科技樹滿點',     desc: '購買50個升級',              icon: '🌳', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 50 },
  { id: 'up3', name: '已讀軍火庫',     desc: '購買75個升級',              icon: '🏭', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 75 },
  { id: 'up4', name: '已讀軍備競賽冠軍', desc: '購買100個升級',           icon: '🏆', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 100 },

  // ══════════════════════════════════════════════
  // ── Synergy Achievements ──
  // ══════════════════════════════════════════════
  { id: 'a23', name: '化學反應',       desc: '啟動第一個Synergy',         icon: '⚗️', req: (at, ow, pc, ps, ex) => ex.synergies >= 1 },
  { id: 'a24', name: '連鎖反應',       desc: '啟動3個Synergy',            icon: '🔗', req: (at, ow, pc, ps, ex) => ex.synergies >= 3 },
  { id: 'a25', name: '已讀大統一',     desc: '啟動全部Synergy',           icon: '🌌', req: (at, ow, pc, ps, ex) => ex.synergies >= 8 },

  // ══════════════════════════════════════════════
  // ── Event Chain Achievements ──
  // ══════════════════════════════════════════════
  { id: 'a26', name: '危機處理者',     desc: '完成第一個事件鏈',          icon: '🎬', req: (at, ow, pc, ps, ex) => ex.completedChains >= 1 },
  { id: 'a27', name: '劇情通關',       desc: '完成所有事件鏈',            icon: '🎭', req: (at, ow, pc, ps, ex) => ex.completedChains >= 4 },

  // ══════════════════════════════════════════════
  // ── Mini-game Achievements ──
  // ══════════════════════════════════════════════
  { id: 'a28', name: '風暴倖存者',     desc: '完成一次已讀風暴',          icon: '🌪️', req: (at, ow, pc, ps, ex) => ex.stormPerfect >= 0 && ex.stormCount >= 1 },
  { id: 'a29', name: '完美已讀',       desc: '在已讀風暴中全部點完',      icon: '💎', req: (at, ow, pc, ps, ex) => ex.stormPerfect >= 1 },

  // ══════════════════════════════════════════════
  // ── Hidden / Humorous Achievements ──
  // (hidden: true means desc shows "???" until unlocked)
  // ══════════════════════════════════════════════
  { id: 'dk1', name: '已讀成癮',         desc: '累計已讀超過十億則',       icon: '🧟', req: (at) => at >= 1000000000, hidden: true },
  { id: 'dk2', name: '數位寂寞',         desc: '每種建築都擁有50個以上',   icon: '🥀', req: (at, ow) => BUILDINGS.every(b => ow[b.id] >= 50), hidden: true },
  { id: 'dk3', name: '社交性死亡',       desc: '擁有超過100個前任但0個忙朋友', icon: '☠️', req: (at, ow) => ow.ex >= 100 && ow.bsy === 0, hidden: true },
  { id: 'dk4', name: '讀訊息讀到忘了自己是誰', desc: '重生10次且累計超過1億', icon: '🫥', req: (at, ow, pc) => pc >= 10 && at >= 100000000, hidden: true },
  { id: 'dk5', name: '訊息深淵回望你',   desc: '每秒產能超過一千萬且重生5次以上', icon: '👁️‍🗨️', req: (at, ow, pc, ps) => ps >= 10000000 && pc >= 5, hidden: true },
  { id: 'dk6', name: '虛無主義解鎖',     desc: '擁有100個AI客服但0個爸媽',  icon: '🤖', req: (at, ow) => ow.ai >= 100 && ow.par === 0, hidden: true },
  { id: 'dk7', name: '已讀宇宙的熱寂',   desc: '累計超過千億且擁有全部建築', icon: '🌑', req: (at, ow) => at >= 100000000000 && BUILDINGS.every(b => ow[b.id] > 0), hidden: true },
  { id: 'dk8', name: '薛丁格的已讀',     desc: '同時擁有時間迴圈和外星通訊各25個以上', icon: '🐱', req: (at, ow) => ow.time >= 25 && ow.alien >= 25, hidden: true },

  // ── NEW: Weird / Easter Egg Achievements ──
  { id: 'hm1', name: '手速王',           desc: '1秒內連點10次',            icon: '🏎️', hidden: true, req: (at, ow, pc, ps, ex) => ex.clickSpeed >= 10 },
  { id: 'hm2', name: '全買狂人',         desc: '使用「全買」功能買超過50個升級', icon: '🛒', hidden: true, req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 50 },
  { id: 'hm3', name: '花園殺手',         desc: '讓3朵花枯萎',              icon: '🍂', hidden: true, req: (at, ow, pc, ps, ex) => (ex.wiltedFlowers ?? 0) >= 3 },
  { id: 'hm4', name: '股市韭菜',         desc: '在股市虧損超過10,000',     icon: '📉', hidden: true, req: (at, ow, pc, ps, ex) => (ex.stockLoss ?? 0) >= 10000 },
  { id: 'hm5', name: '阿姨剋星',         desc: '擴充伴手禮格子5次',        icon: '😤', hidden: true, req: (at, ow, pc, ps, ex) => (ex.gridExpansions ?? 0) >= 5 },
  { id: 'hm6', name: '孝順滿分',         desc: '合成出帝王蟹',             icon: '🦀', hidden: true, req: (at, ow, pc, ps, ex) => (ex.highestMergeTier ?? 0) >= 6 },
  { id: 'hm7', name: '傳家之寶',         desc: '合成出黃金擺件',           icon: '🏆', hidden: true, req: (at, ow, pc, ps, ex) => (ex.highestMergeTier ?? 0) >= 7 },
  { id: 'hm8', name: '花之收藏家',       desc: '在花園圖鑑中收集10種花',   icon: '📖', hidden: true, req: (at, ow, pc, ps, ex) => (ex.flowersCollected ?? 0) >= 10 },
  { id: 'hm9', name: '植物學博士',       desc: '在花園圖鑑中收集全部20種花', icon: '🎓', hidden: true, req: (at, ow, pc, ps, ex) => (ex.flowersCollected ?? 0) >= 20 },
  { id: 'hm10', name: '什麼都不做',      desc: '開啟遊戲後等待5分鐘不做任何操作', icon: '🧘', hidden: true, req: (at, ow, pc, ps, ex) => (ex.idleMinutes ?? 0) >= 5 },
];

/**
 * Compute the sum of all permanent production bonus % from unlocked achievements.
 * Returns a multiplier, e.g. 0.15 means +15%.
 * Apply as: baseProd * (1 + getAchievementBonus(unlockedSet))
 */
export function getAchievementBonus(unlockedAchievements) {
  let total = 0;
  for (const id of unlockedAchievements) {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a?.bonus) total += a.bonus;
  }
  return total;
}
