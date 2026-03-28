// Synergy system — cross-building bonuses that auto-activate
export const SYNERGIES = [
  {
    id: 'syn1',
    name: '家庭戲劇',
    desc: '前任+爸媽產能各+50%',
    emoji: '🎭',
    toast: '爸媽：「你怎麼又跟前任聊？」',
    req: { ex: 10, par: 10 },
    effects: [
      { target: 'ex', mult: 1.5 },
      { target: 'par', mult: 1.5 },
    ],
  },
  {
    id: 'syn2',
    name: '社交壓力',
    desc: '忙朋友產能+80%',
    emoji: '😰',
    toast: '朋友推薦你去面試，順便已讀你的訊息',
    req: { bsy: 10, hr: 5 },
    effects: [
      { target: 'bsy', mult: 1.8 },
    ],
  },
  {
    id: 'syn3',
    name: '官僚外包',
    desc: '政府承辦產能+100%',
    emoji: '📦',
    toast: '公文改用外送寄，效率倍增',
    req: { gov: 5, del: 10 },
    effects: [
      { target: 'gov', mult: 2 },
    ],
  },
  {
    id: 'syn4',
    name: '全面監控',
    desc: '全域產能+30%',
    emoji: '📡',
    toast: '每棟建築都被裝了監聽器，已讀效率全面提升',
    req: { ex: 1, par: 1, bsy: 1, hr: 1, del: 1, gov: 1, int: 3 },
    effects: [
      { target: '_global', mult: 1.3 },
    ],
  },
  {
    id: 'syn5',
    name: '已讀宇宙',
    desc: '全域產能x2',
    emoji: '🌌',
    toast: '已讀達到臨界質量，集體意識覺醒',
    req: { ex: 25, par: 25, bsy: 25, hr: 25, del: 25, gov: 25, int: 25 },
    effects: [
      { target: '_global', mult: 2 },
    ],
  },
];

// Check which synergies are active given current owned buildings
export function getActiveSynergies(owned) {
  return SYNERGIES.filter(syn =>
    Object.entries(syn.req).every(([bid, count]) => (owned[bid] ?? 0) >= count)
  );
}

// Get combined synergy multiplier for a specific building
export function getSynergyMult(owned, buildingId) {
  const active = getActiveSynergies(owned);
  let mult = 1;
  for (const syn of active) {
    for (const eff of syn.effects) {
      if (eff.target === buildingId || eff.target === '_global') {
        mult *= eff.mult;
      }
    }
  }
  return mult;
}
