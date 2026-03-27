import { BUILDINGS } from './buildings.js';

export const ACHIEVEMENTS = [
  { id: 'a1',  name: '初次已讀',   desc: '已讀第1則訊息',         icon: '🐣', req: (at)            => at >= 1 },
  { id: 'a2',  name: '百則大師',   desc: '累計已讀100則',         icon: '💯', req: (at)            => at >= 100 },
  { id: 'a3',  name: '千則俱樂部', desc: '累計已讀1,000則',       icon: '🏅', req: (at)            => at >= 1000 },
  { id: 'a4',  name: '萬則傳說',   desc: '累計已讀10,000則',      icon: '🌟', req: (at)            => at >= 10000 },
  { id: 'a5',  name: '十萬已讀王', desc: '累計已讀100,000則',     icon: '👑', req: (at)            => at >= 100000 },
  { id: 'a6',  name: '百萬已讀神', desc: '累計已讀1,000,000則',   icon: '🔱', req: (at)            => at >= 1000000 },
  { id: 'a7',  name: '前任收藏家', desc: '僱用10個前任',          icon: '💔', req: (at, ow)        => ow.ex >= 10 },
  { id: 'a8',  name: '孝順模擬器', desc: '僱用10對爸媽',          icon: '🥺', req: (at, ow)        => ow.par >= 10 },
  { id: 'a9',  name: '社交蒸發',   desc: '僱用25個忙朋友',        icon: '💨', req: (at, ow)        => ow.bsy >= 25 },
  { id: 'a10', name: '已讀不回之神', desc: '達成首次Inbox Zero',  icon: '🌀', req: (at, ow, pc)    => pc >= 1 },
  { id: 'a11', name: '時空旅人',   desc: '重生3次',               icon: '⏳', req: (at, ow, pc)    => pc >= 3 },
  { id: 'a12', name: '速讀者',     desc: '每秒產能超過1,000',     icon: '⚡', req: (at, ow, pc, ps) => ps >= 1000 },
  { id: 'a13', name: '已讀帝國',   desc: '同時擁有所有7種建築',   icon: '🏰', req: (at, ow)        => BUILDINGS.every(b => ow[b.id] > 0) },
];
