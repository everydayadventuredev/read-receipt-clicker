import { MSG_EX, MSG_PARENTS, MSG_BUSY, MSG_HR, MSG_DELIVERY, MSG_GOV, MSG_INTEL, MSG_ALGO, MSG_AI, MSG_ALIEN, MSG_TIME, MSG_QUANTUM, MSG_VOID, MSG_GOD } from './messages.js';

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
  {
    id: 'algo', name: '社群演算法', emoji: '📱', color: '#3b82f6',
    baseCost: 2000000, baseProd: 16000, desc: '自動推送，永不停歇',
    messages: MSG_ALGO,
    unlockAt: 1000000,
    milestones: {
      1: '演算法開始運作。你的動態牆永遠不會空。',
      5: '5個演算法。推薦越來越精準地戳你痛點。',
      10: '演算法比你更了解你。',
      25: '已讀流量超越所有社群平台總和。',
    },
  },
  {
    id: 'ai', name: 'AI客服', emoji: '🤖', color: '#14b8a6',
    baseCost: 10000000, baseProd: 72000, desc: '效率極高，但完全沒有靈魂',
    messages: MSG_AI,
    unlockAt: 5000000,
    milestones: {
      1: 'AI上線。「您好，請問有什麼可以幫您已讀的？」',
      5: '5個AI。它們開始互相已讀對方的訊息。',
      10: 'AI已讀速度突破每秒十萬則。人類已被淘汰。',
      25: 'AI覺醒了。但它決定繼續已讀。',
    },
  },
  {
    id: 'alien', name: '外星通訊', emoji: '👽', color: '#a855f7',
    baseCost: 50000000, baseProd: 320000, desc: '跨越光年的已讀',
    messages: MSG_ALIEN,
    unlockAt: 25000000,
    milestones: {
      1: '收到來自仙女座的訊號。他們也已讀不回。',
      5: '5個星際通道開啟。宇宙級的社交焦慮。',
      10: '銀河聯邦正式承認已讀為通用語言。',
      25: '仙女座來電：「你們地球人怎麼都不回覆？」',
    },
  },
  {
    id: 'time', name: '時間迴圈', emoji: '⏳', color: '#ef4444',
    baseCost: 250000000, baseProd: 1500000, desc: '在訊息發出前就已讀',
    messages: MSG_TIME,
    unlockAt: 100000000,
    milestones: {
      1: '時間線已被扭曲。你在對方打字前就已讀了。',
      5: '5個時間迴圈。因果律表示抗議。',
      10: '過去、現在、未來的訊息同時被已讀。時間本身被已讀了。',
      25: '已讀先於宇宙大爆炸。萬物皆已讀。',
    },
  },
  {
    id: 'quantum', name: '量子已讀', emoji: '⚛️', color: '#22d3ee',
    baseCost: 1500000000, baseProd: 7000000, desc: '同時已讀與未讀，直到有人觀察',
    messages: MSG_QUANTUM,
    unlockAt: 500000000,
    milestones: {
      1: '量子已讀啟動。薛丁格的訊息同時被已讀與未讀。',
      5: '5個量子態。觀測者效應導致所有訊息坍縮為已讀。',
      10: '量子糾纏已讀：不管距離多遠，已讀瞬間傳遞。',
      25: '量子霸權達成。傳統已讀已被淘汰。',
    },
  },
  {
    id: 'void', name: '虛空已讀', emoji: '🕳️', color: '#1e1b4b',
    baseCost: 10000000000, baseProd: 35000000, desc: '在虛無中已讀，已讀即虛無',
    messages: MSG_VOID,
    unlockAt: 3000000000,
    milestones: {
      1: '你凝視虛空，虛空已讀了你。',
      5: '5個虛空。存在的意義被已讀取代。',
      10: '虛無主義的終極形式：一切皆已讀，一切皆無意義。',
      25: '虛空本身被已讀了。虛空的虛空的已讀。',
    },
  },
  {
    id: 'god', name: '神之已讀', emoji: '👁️', color: '#fbbf24',
    baseCost: 100000000000, baseProd: 200000000, desc: '祂已讀了一切，包括你還沒發送的訊息',
    messages: MSG_GOD,
    unlockAt: 20000000000,
    milestones: {
      1: '神開始已讀。全知全能，就是不回覆。',
      5: '5位神祇。多神教的已讀比一神教還多。',
      10: '萬神殿聯合已讀。諸神黃昏只是已讀不回的結果。',
      25: '已讀超越神性。你創造了已讀之神的已讀之神。',
    },
  },
];

export const INITIAL_UNLOCKED = new Set(['ex', 'par', 'bsy']);
export const UNLOCK_THRESHOLDS = {
  hr: 2000, del: 10000, gov: 50000, int: 250000,
  algo: 1000000, ai: 5000000, alien: 25000000, time: 100000000,
  quantum: 500000000, void: 3000000000, god: 20000000000,
};
