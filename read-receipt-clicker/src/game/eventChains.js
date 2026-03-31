// Conditional event chains — story-driven one-time events
// Each chain has phases that play out over time

export const EVENT_CHAINS = [
  {
    id: 'ec1',
    name: '前任工會危機',
    triggerReq: { building: 'ex', count: 25 },
    phases: [
      {
        toast: '⚠️ 前任們組工會了！「我們要求更好的已讀待遇！」',
        effect: { type: 'buildingDebuff', target: 'ex', mult: 0.5 },
        duration: 60,
      },
      {
        // Player chooses at end of phase 1
        choice: true,
        options: [
          {
            label: '協商',
            emoji: '🤝',
            desc: '和平解決，產能恢復',
            toast: '🤝 工會滿意了。「這次先放過你。」',
            effect: { type: 'clearDebuff' },
          },
          {
            label: '已讀工會訊息',
            emoji: '💀',
            desc: '產能x3持續30秒，之後恢復',
            toast: '💀 你已讀了工會訊息。憤怒轉化為超級產能！',
            effect: { type: 'buildingBuff', target: 'ex', mult: 3, duration: 30 },
          },
        ],
      },
    ],
    reward: {
      toast: '🏆 前任危機結束。前任永久產能+10%',
      effect: { type: 'permanentBuildingBuff', target: 'ex', mult: 1.1 },
    },
  },
  {
    id: 'ec2',
    name: 'HR審計風暴',
    triggerReq: { building: 'hr', count: 10 },
    phases: [
      {
        toast: '📋 HR發起內部審計！「所有部門效率需要重新評估」',
        effect: { type: 'globalDebuff', mult: 0.8 },
        duration: 30,
      },
    ],
    reward: {
      toast: '📊 審計結束！解鎖「績效改善計畫」— 全域產能永久+15%',
      effect: { type: 'permanentGlobalBuff', mult: 1.15 },
    },
  },
  {
    id: 'ec3',
    name: '外送大亂鬥',
    triggerReq: { building: 'del', count: 15 },
    phases: [
      {
        toast: '🛵 外送平台大戰開打！客服全員出動已讀投訴！',
        effect: { type: 'buildingBuff', target: 'del', mult: 3 },
        duration: 45,
      },
    ],
    reward: {
      toast: '🏆 外送大戰結束。外送客服永久產能+20%',
      effect: { type: 'permanentBuildingBuff', target: 'del', mult: 1.2 },
    },
  },
  {
    id: 'ec4',
    name: '政府數位轉型',
    triggerReq: { building: 'gov', count: 10 },
    phases: [
      {
        toast: '💻 政府宣布數位轉型！「未來公文全面電子化...3-5年後」',
        effect: { type: 'globalDebuff', mult: 0.9 },
        duration: 40,
      },
      {
        choice: true,
        options: [
          {
            label: '配合轉型',
            emoji: '📱',
            desc: '忍耐陣痛，長期收益',
            toast: '📱 你配合了轉型。未來一片光明。',
            effect: { type: 'permanentBuildingBuff', target: 'gov', mult: 1.3 },
          },
          {
            label: '堅持紙本',
            emoji: '📄',
            desc: '立即恢復，加小獎勵',
            toast: '📄 「還是紙本踏實。」全域產能恢復並小幅加成。',
            effect: { type: 'permanentGlobalBuff', mult: 1.05 },
          },
        ],
      },
    ],
    reward: {
      toast: '🏛️ 數位轉型告一段落。',
      effect: { type: 'none' },
    },
  },
];
