import { BUILDINGS } from './buildings.js';

// req signature: (allTime, owned, prestigeCount, prodPerSec, extra)
// extra = { synergies, completedChains, boughtPrestige, stormPerfect, clickSpeed, boughtUpgrades }

export const ACHIEVEMENTS = [
  // ── Milestone achievements ──
  { id: 'a1',  name: '初次已讀',     desc: '已讀第1則訊息',           icon: '🐣', req: (at) => at >= 1 },
  { id: 'a2',  name: '百則大師',     desc: '累計已讀100則',           icon: '💯', req: (at) => at >= 100 },
  { id: 'a3',  name: '千則俱樂部',   desc: '累計已讀1,000則',         icon: '🏅', req: (at) => at >= 1000 },
  { id: 'a4',  name: '萬則傳說',     desc: '累計已讀10,000則',        icon: '🌟', req: (at) => at >= 10000 },
  { id: 'a5',  name: '十萬已讀王',   desc: '累計已讀100,000則',       icon: '👑', req: (at) => at >= 100000 },
  { id: 'a6',  name: '百萬已讀神',   desc: '累計已讀1,000,000則',     icon: '🔱', req: (at) => at >= 1000000 },
  { id: 'a14', name: '千萬已讀仙',   desc: '累計已讀10,000,000則',    icon: '🏆', req: (at) => at >= 10000000 },

  // ── Building collection ──
  { id: 'a7',  name: '前任收藏家',   desc: '僱用10個前任',            icon: '💔', req: (at, ow) => ow.ex >= 10 },
  { id: 'a8',  name: '孝順模擬器',   desc: '僱用10對爸媽',            icon: '🥺', req: (at, ow) => ow.par >= 10 },
  { id: 'a9',  name: '社交蒸發',     desc: '僱用25個忙朋友',          icon: '💨', req: (at, ow) => ow.bsy >= 25 },
  { id: 'a13', name: '已讀帝國',     desc: '同時擁有所有7種建築',     icon: '🏰', req: (at, ow) => BUILDINGS.every(b => ow[b.id] > 0) },
  { id: 'a15', name: '前任百人斬',   desc: '僱用100個前任',           icon: '🗡️', req: (at, ow) => ow.ex >= 100 },
  { id: 'a16', name: '企業戰士',     desc: '僱用25個公司HR',          icon: '💼', req: (at, ow) => ow.hr >= 25 },
  { id: 'a17', name: '情報總監',     desc: '僱用10個情報機構',        icon: '🕵️', req: (at, ow) => ow.int >= 10 },

  // ── Speed achievements ──
  { id: 'a12', name: '速讀者',       desc: '每秒產能超過1,000',       icon: '⚡', req: (at, ow, pc, ps) => ps >= 1000 },
  { id: 'a18', name: '光速已讀',     desc: '每秒產能超過10,000',      icon: '💨', req: (at, ow, pc, ps) => ps >= 10000 },
  { id: 'a19', name: '已讀黑洞',     desc: '每秒產能超過100,000',     icon: '🕳️', req: (at, ow, pc, ps) => ps >= 100000 },

  // ── Prestige achievements ──
  { id: 'a10', name: '已讀不回之神', desc: '達成首次Inbox Zero',      icon: '🌀', req: (at, ow, pc) => pc >= 1 },
  { id: 'a11', name: '時空旅人',     desc: '重生3次',                 icon: '⏳', req: (at, ow, pc) => pc >= 3 },
  { id: 'a20', name: '輪迴大師',     desc: '重生5次',                 icon: '🔄', req: (at, ow, pc) => pc >= 5 },
  { id: 'a21', name: '超越者',       desc: '重生10次',                icon: '🚀', req: (at, ow, pc) => pc >= 10 },
  { id: 'a22', name: '已讀力收藏家', desc: '購買5個重生升級',         icon: '🛒', req: (at, ow, pc, ps, ex) => ex.boughtPrestige >= 5 },

  // ── Synergy achievements ──
  { id: 'a23', name: '化學反應',     desc: '啟動第一個Synergy',       icon: '⚗️', req: (at, ow, pc, ps, ex) => ex.synergies >= 1 },
  { id: 'a24', name: '連鎖反應',     desc: '啟動3個Synergy',          icon: '🔗', req: (at, ow, pc, ps, ex) => ex.synergies >= 3 },
  { id: 'a25', name: '已讀大統一',   desc: '啟動全部Synergy',         icon: '🌌', req: (at, ow, pc, ps, ex) => ex.synergies >= 5 },

  // ── Event chain achievements ──
  { id: 'a26', name: '危機處理者',   desc: '完成第一個事件鏈',        icon: '🎬', req: (at, ow, pc, ps, ex) => ex.completedChains >= 1 },
  { id: 'a27', name: '劇情通關',     desc: '完成所有事件鏈',          icon: '🎭', req: (at, ow, pc, ps, ex) => ex.completedChains >= 4 },

  // ── Mini-game achievements ──
  { id: 'a28', name: '風暴倖存者',   desc: '完成一次已讀風暴',        icon: '🌪️', req: (at, ow, pc, ps, ex) => ex.stormPerfect >= 0 && ex.stormCount >= 1 },
  { id: 'a29', name: '完美已讀',     desc: '在已讀風暴中全部點完',    icon: '💎', req: (at, ow, pc, ps, ex) => ex.stormPerfect >= 1 },

  // ── Upgrade achievements ──
  { id: 'a30', name: '升級狂人',     desc: '購買15個升級',            icon: '📈', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 15 },
  { id: 'a31', name: '全副武裝',     desc: '購買所有升級',            icon: '🛡️', req: (at, ow, pc, ps, ex) => ex.boughtUpgrades >= 25 },
];
