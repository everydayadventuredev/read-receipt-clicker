import { MSG_EX, MSG_PARENTS, MSG_BUSY, MSG_HR, MSG_DELIVERY, MSG_GOV, MSG_INTEL } from './messages.js';

export const BUILDINGS = [
  {
    id: 'ex', name: '前任', emoji: '💔', color: '#f43f5e',
    baseCost: 15, baseProd: 1, desc: '已讀極快，從不回覆',
    messages: MSG_EX,
    milestones: {
      1: '僱用了一個前任。這段關係終於有了價值。',
      5: '5個前任。已讀是一種療癒。',
      10: '10個前任。感情生活真豐富。',
      25: '25個。這不是後宮，是已讀工廠。',
      50: '50位。他們組了工會。',
      100: '100位。超過某些小國人口。',
    },
  },
  {
    id: 'par', name: '爸媽', emoji: '👨‍👩‍👧', color: '#f59e0b',
    baseCost: 100, baseProd: 3, desc: '穩定但慢，偶爾叫你穿外套',
    messages: MSG_PARENTS,
    milestones: {
      1: '爸媽加入。還是會問你吃飯沒。',
      5: '5對爸媽。每天5次「穿外套」。',
      10: '10對。全世界最被關心的人。',
      25: '25對。衣櫃被外套塞滿。',
      50: '50對。聯合國來電詢問。',
    },
  },
  {
    id: 'bsy', name: '忙朋友', emoji: '🏃', color: '#10b981',
    baseCost: 500, baseProd: 10, desc: '產能波動，有時消失再爆發',
    messages: MSG_BUSY,
    milestones: {
      1: '他說「改天約」。不會有改天。',
      5: '5個。約會成功率0%。',
      10: '10個。群組「改天約」從未使用。',
      25: '成立了「明天再說股份有限公司」。',
      50: '終於約成——但你在忙。',
    },
  },
  {
    id: 'hr', name: '公司HR', emoji: '💼', color: '#6366f1',
    baseCost: 3000, baseProd: 50, desc: '已讀所有意見，永不改變',
    messages: MSG_HR,
    unlockAt: 2000,
    milestones: {
      1: 'HR已讀你的建議。「轉達相關部門」。',
      10: '公司前所未有地「重視員工聲音」。',
      25: '已讀10萬則意見。改變0件事。',
    },
  },
  {
    id: 'del', name: '外送客服', emoji: '🛵', color: '#06b6d4',
    baseCost: 15000, baseProd: 200, desc: '永遠在「為您查詢中」',
    messages: MSG_DELIVERY,
    unlockAt: 10000,
    milestones: {
      1: '客服已上線。您的已讀很重要。',
      10: '10位客服。都說一模一樣的話。',
      25: '等待時間預計：永恆。',
    },
  },
  {
    id: 'gov', name: '政府承辦', emoji: '🏛️', color: '#8b5cf6',
    baseCost: 80000, baseProd: 800, desc: '流程需6-8個月',
    messages: MSG_GOV,
    unlockAt: 50000,
    milestones: {
      1: '已讀申請通過初審。複審3-5工作天。',
      10: '公文速度提升0.3%，創歷史新高。',
      25: '他們開始已讀自己發的公文。無限迴圈。',
    },
  },
  {
    id: 'int', name: '情報機構', emoji: '🕵️', color: '#ec4899',
    baseCost: 400000, baseProd: 3600, desc: '此建築已被列為機密',
    messages: MSG_INTEL,
    unlockAt: 250000,
    milestones: {
      1: '此建築的存在已被列為機密。',
      10: '你的已讀被14國情報機構監控。',
      25: '已讀行為被重新分類為「戰略武器」。',
    },
  },
];

export const INITIAL_UNLOCKED = new Set(['ex', 'par', 'bsy']);
export const UNLOCK_THRESHOLDS = { hr: 2000, del: 10000, gov: 50000, int: 250000 };
