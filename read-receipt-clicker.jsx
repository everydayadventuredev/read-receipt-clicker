import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════
// DATA
// ══════════════════════════════════════
const MG=["今晚吃什麼","會議改到三點","收到請回覆","週末有空嗎","好的","等等再說","了解","算了不重要","晚安","早安","OK","嗯","？"];
const ME=["我們需要談談","你變了","我看到你在線上","算了 沒事","你還記得紀念日嗎","生日快樂","你現在幸福嗎","我夢到你了","那首歌讓我想到你","你的頭貼換了","幫我拿回外套","隨便啦","我不在乎了","你開心就好"];
const MP=["記得穿外套","你有沒有吃飯","你姑姑的女兒結婚了","媽媽做了紅燒肉","什麼時候帶對象回來","天氣冷多穿點","爸爸轉了養生文","早點睡","你最近有瘦嗎","隔壁王阿姨的兒子升主管了","你怎麼都不打電話"];
const MB=["抱歉剛剛在忙","改天約！","哈哈哈哈（3hr後）","我等下回你","剛看到！","天啊忘了回你","欸剛在開會","晚點聊！","啊我又忘了","改天約！（第47次）"];
const MH=["感謝您的寶貴意見","我們會轉達相關部門","請填寫回饋表單","公司非常重視您的聲音","此案已進入審查","請參閱手冊第7.3節","請耐心等候"];
const MD=["您的訂單已被接收","外送員正在前往","預計30-45分鐘","感謝耐心等候","您的餐點準備中","如有問題請聯繫客服","祝您用餐愉快"];
const MV=["此案已進入審查","請至臨櫃辦理","承辦人員外出中","您的號碼847號，目前23號","請攜帶雙證件","此表格需主管核章"];
const MI=["[已刪除]","[機密]","████████","此訊息不存在","你沒看到這則","CLASSIFIED","REDACTED"];

const B=[
  {id:"ex",n:"前任",e:"💔",c:"#f43f5e",bc:15,bp:1,d:"已讀極快，從不回覆",m:ME,ms:{1:"僱用了一個前任。這段關係終於有了價值。",5:"5個前任。已讀是一種療癒。",10:"10個前任。感情生活真豐富。",25:"25個。這不是後宮，是已讀工廠。",50:"50位。他們組了工會。",100:"100位。超過某些小國人口。"}},
  {id:"par",n:"爸媽",e:"👨‍👩‍👧",c:"#f59e0b",bc:100,bp:3,d:"穩定但慢，偶爾叫你穿外套",m:MP,ms:{1:"爸媽加入。還是會問你吃飯沒。",5:"5對爸媽。每天5次「穿外套」。",10:"10對。全世界最被關心的人。",25:"25對。衣櫃被外套塞滿。",50:"50對。聯合國來電詢問。"}},
  {id:"bsy",n:"忙朋友",e:"🏃",c:"#10b981",bc:500,bp:10,d:"產能波動，有時消失再爆發",m:MB,ms:{1:"他說「改天約」。不會有改天。",5:"5個。約會成功率0%。",10:"10個。群組「改天約」從未使用。",25:"成立了「明天再說股份有限公司」。",50:"終於約成——但你在忙。"}},
  {id:"hr",n:"公司HR",e:"💼",c:"#6366f1",bc:3e3,bp:50,d:"已讀所有意見，永不改變",m:MH,ms:{1:"HR已讀你的建議。「轉達相關部門」。",10:"公司前所未有地「重視員工聲音」。",25:"已讀10萬則意見。改變0件事。"}},
  {id:"del",n:"外送客服",e:"🛵",c:"#06b6d4",bc:15e3,bp:200,d:"永遠在「為您查詢中」",m:MD,ms:{1:"客服已上線。您的已讀很重要。",10:"10位客服。都說一模一樣的話。",25:"等待時間預計：永恆。"}},
  {id:"gov",n:"政府承辦",e:"🏛️",c:"#8b5cf6",bc:8e4,bp:800,d:"流程需6-8個月",m:MV,ms:{1:"已讀申請通過初審。複審3-5工作天。",10:"公文速度提升0.3%，創歷史新高。",25:"他們開始已讀自己發的公文。無限迴圈。"}},
  {id:"int",n:"情報機構",e:"🕵️",c:"#ec4899",bc:4e5,bp:3600,d:"此建築已被列為機密",m:MI,ms:{1:"此建築的存在已被列為機密。",10:"你的已讀被14國情報機構監控。",25:"已讀行為被重新分類為「戰略武器」。"}},
];

const MS=[[10,"10則。好的開始。"],[50,"50則。大拇指暖機了。"],[100,"100則！社交焦慮減輕。"],[250,"250則。前任注意到了。"],[500,"500則。超越上班族日均量。"],[1e3,"1,000則！超越小型客服中心。"],[2e3,"2,000則。爸媽擔心你手指健康。"],[5e3,"5,000則。前任：終於知道被已讀的感覺了。"],[1e4,"10,000則！聯合國考慮列你為大規模已讀武器。"],[5e4,"50,000則。可填滿圖書館。沒人會讀。"],[1e5,"100,000則！你的已讀影響地球磁場。"],[5e5,"500,000則。平行宇宙的你回了每一則。他沒比較好。"],[1e6,"1,000,000則。一百萬。你還好嗎？"],[5e6,"5,000,000則。宇宙背景輻射出現✓✓圖案。"],[1e7,"10,000,000則。誰已讀了誰？"]];

const ACHIEVEMENTS=[
  {id:"a1",n:"初次已讀",d:"已讀第1則訊息",icon:"🐣",req:t=>t>=1},
  {id:"a2",n:"百則大師",d:"累計已讀100則",icon:"💯",req:t=>t>=100},
  {id:"a3",n:"千則俱樂部",d:"累計已讀1,000則",icon:"🏅",req:t=>t>=1000},
  {id:"a4",n:"萬則傳說",d:"累計已讀10,000則",icon:"🌟",req:t=>t>=10000},
  {id:"a5",n:"十萬已讀王",d:"累計已讀100,000則",icon:"👑",req:t=>t>=100000},
  {id:"a6",n:"百萬已讀神",d:"累計已讀1,000,000則",icon:"🔱",req:t=>t>=1000000},
  {id:"a7",n:"前任收藏家",d:"僱用10個前任",icon:"💔",req:(t,o)=>o.ex>=10},
  {id:"a8",n:"孝順模擬器",d:"僱用10對爸媽",icon:"🥺",req:(t,o)=>o.par>=10},
  {id:"a9",n:"社交蒸發",d:"僱用25個忙朋友",icon:"💨",req:(t,o)=>o.bsy>=25},
  {id:"a10",n:"已讀不回之神",d:"達成首次Inbox Zero",icon:"🌀",req:(t,o,p)=>p>=1},
  {id:"a11",n:"時空旅人",d:"重生3次",icon:"⏳",req:(t,o,p)=>p>=3},
  {id:"a12",n:"速讀者",d:"每秒產能超過1,000",icon:"⚡",req:(t,o,p,ps)=>ps>=1000},
  {id:"a13",n:"已讀帝國",d:"同時擁有所有7種建築",icon:"🏰",req:(t,o)=>B.every(b=>o[b.id]>0)},
];

const TT=[
  {t:0,m:["研究顯示：每天查看手機96次的人比較快樂。樣本數：1","前任對你的已讀速度表示讚賞（但不會告訴你）","爸媽想問你吃飯沒，但你已讀了","你那個忙朋友剛上線了——又離線了","已讀不回是一種藝術，你是大師","你的手指正在創造歷史","你的前任開始懷疑你是機器人","你媽傳了：「長期已讀不回的人有這5個特徵」","你爸問你媽：「他是不是封鎖我們了？」","你的手機通知中心正式投降","你的訊息app開始對你產生斯德哥爾摩症候群","某交友軟體將「擅長已讀」列為個人特質","統計局：你一人拉低全國平均回覆率","你的貓看你瘋狂點擊，眼神充滿判斷","你的已讀速度比心跳快"]},
  {t:500,m:["全球未讀訊息總量首次下降","HR已讀了你的加薪申請。請耐心等候。","外送平台：你的已讀速度比送餐快","有三個前任同時在輸入。沒有一個會送出。","某公司推出「已讀保險」理賠精神損失","某咖啡廳推出「已讀不回」拿鐵。苦的。","新聞快報：全國已讀率創新高，專家直指一人","保險公司考慮為你的大拇指投保","你的客服團隊被評為「最有禮貌的已讀機構」"]},
  {t:3e3,m:["聯合國討論是否將「被已讀」列為人權議題","政府公告：已讀不回將納入勞基法","你的已讀已被收錄進金氏世界紀錄（待審核）","某大學開設「已讀學」碩士，你被聘為客座教授","軍方研究你的已讀技術是否有國防用途","某國央行考慮將✓✓印在鈔票上","世衛組織：已讀不回已成全球流行病"]},
  {t:1e4,m:["NASA偵測到與你的已讀頻率一致的電磁波","時間旅行者從2087年回來：「繼續已讀。」","CERN偵測到新粒子。他們叫它「已讀子」。","某天文台將新小行星命名為「已讀2026」","某AI分析你的模式後：「我理解人類了。他們不想回。」","考古學家在遺跡中發現✓✓符號"]},
  {t:5e4,m:["C-137維度的你也在玩。他比你快。","外星文明：「你們星球那個一直已讀的是什麼？」","螃蟹文明發來求救訊號。你已讀了。","某維度居民全長得像✓✓。他們崇拜你。","有個宇宙的物理常數因你的已讀永久改變了","跨維度倫理委員會：已讀不存在的維度算觀測嗎？"]},
  {t:2e5,m:["第47號訊息被已讀後拒絕消失","某訊息的已讀時間早於發送時間","訊息們議論：是我們被他已讀，還是他被我們已讀？","遊戲開發者也在已讀你的遊玩數據","你覺得你在玩遊戲，但遊戲在觀測你——誰已讀了誰？","訊息們成立自治政府。第一條法律：禁止被已讀。"]},
];

const UP=[
  {id:"c1",n:"指尖覺醒",d:"點擊+1",t:"ck",b:1,cost:100,req:{a:50},e:"👆"},
  {id:"c2",n:"雙重已讀",d:"點擊+3",t:"ck",b:3,cost:1e3,req:{a:500},e:"✌️"},
  {id:"c3",n:"已讀連擊",d:"點擊+10",t:"ck",b:10,cost:1e4,req:{a:5e3},e:"⚡"},
  {id:"c4",n:"已讀風暴",d:"點擊+50",t:"ck",b:50,cost:1e5,req:{a:5e4},e:"🌪️"},
  {id:"p1",n:"效率已讀術",d:"點擊+1%產能",t:"cp",b:.01,cost:5e3,req:{a:2e3},e:"📈"},
  {id:"p2",n:"高效已讀術",d:"點擊+3%產能",t:"cp",b:.03,cost:5e4,req:{a:2e4},e:"📈"},
  {id:"p3",n:"極效已讀術",d:"點擊+5%產能",t:"cp",b:.05,cost:5e5,req:{a:2e5},e:"📈"},
  {id:"e1",n:"冷漠的力量",d:"前任x2",t:"m",tg:"ex",b:2,cost:150,req:{b:"ex",c:1},e:"💔"},
  {id:"e2",n:"已讀不回大師",d:"前任x2",t:"m",tg:"ex",b:2,cost:1500,req:{b:"ex",c:5},e:"💔"},
  {id:"e3",n:"前任軍團",d:"前任x2",t:"m",tg:"ex",b:2,cost:15e3,req:{b:"ex",c:10},e:"💔"},
  {id:"e4",n:"前任帝國",d:"前任x3",t:"m",tg:"ex",b:3,cost:15e4,req:{b:"ex",c:25},e:"💔"},
  {id:"p_1",n:"外套加持",d:"爸媽x2",t:"m",tg:"par",b:2,cost:1e3,req:{b:"par",c:1},e:"🧥"},
  {id:"p_2",n:"養生文轟炸",d:"爸媽x2",t:"m",tg:"par",b:2,cost:1e4,req:{b:"par",c:5},e:"📰"},
  {id:"p_3",n:"親情的重量",d:"爸媽x3",t:"m",tg:"par",b:3,cost:1e5,req:{b:"par",c:10},e:"❤️"},
  {id:"b1",n:"改天約加速器",d:"忙朋友x2",t:"m",tg:"bsy",b:2,cost:5e3,req:{b:"bsy",c:1},e:"📅"},
  {id:"b2",n:"爽約專業化",d:"忙朋友x2",t:"m",tg:"bsy",b:2,cost:5e4,req:{b:"bsy",c:5},e:"💨"},
  {id:"b3",n:"忙碌量子化",d:"忙朋友x3",t:"m",tg:"bsy",b:3,cost:5e5,req:{b:"bsy",c:10},e:"⚛️"},
  {id:"h1",n:"官方回覆範本",d:"HRx2",t:"m",tg:"hr",b:2,cost:3e4,req:{b:"hr",c:1},e:"📋"},
  {id:"h2",n:"企業文化洗腦",d:"HRx3",t:"m",tg:"hr",b:3,cost:3e5,req:{b:"hr",c:5},e:"🧠"},
  {id:"d1",n:"罐頭回覆優化",d:"外送x2",t:"m",tg:"del",b:2,cost:15e4,req:{b:"del",c:1},e:"🥫"},
  {id:"d2",n:"自動道歉系統",d:"外送x3",t:"m",tg:"del",b:3,cost:15e5,req:{b:"del",c:5},e:"🤖"},
  {id:"g1",n:"電子化公文",d:"承辦x2",t:"m",tg:"gov",b:2,cost:8e5,req:{b:"gov",c:1},e:"📄"},
  {id:"g2",n:"蓋章自動化",d:"承辦x3",t:"m",tg:"gov",b:3,cost:8e6,req:{b:"gov",c:5},e:"🔏"},
  {id:"i1",n:"機密解碼器",d:"情報x2",t:"m",tg:"int",b:2,cost:4e6,req:{b:"int",c:1},e:"🔓"},
  {id:"i2",n:"全球監控網",d:"情報x3",t:"m",tg:"int",b:3,cost:4e7,req:{b:"int",c:5},e:"🌐"},
];

const GC=[
  {l:"對方正在輸入",e:"💬",mt:10,toast:"截胡了！",type:"add"},
  {l:"超長語音",e:"🎤",mt:15,toast:"47分鐘語音快轉聽完！",type:"add"},
  {l:"群組炸彈",e:"💣",mt:20,toast:"200則瞬間清空！",type:"add"},
  {l:"老闆深夜訊息",e:"😱",mt:25,toast:"恐懼轉化為能量！",type:"add"},
  {l:"前任正在輸入",e:"💔",mt:12,toast:"又刪掉了。情緒補償！",type:"add"},
  {l:"已讀加速",e:"🚀",mt:0,toast:"全域產能x2持續30秒！",type:"mult",dur:30},
  {l:"瘋狂已讀",e:"🔥",mt:0,toast:"全域產能x5持續10秒！",type:"mult5",dur:10},
  {l:"你確定不回嗎？",e:"👀",mt:30,toast:"已讀之力大幅提升！",type:"add"},
];

// ══════════ HELPERS ══════════
const fmt=n=>{if(n>=1e12)return(n/1e12).toFixed(1)+"兆";if(n>=1e8)return(n/1e8).toFixed(1)+"億";if(n>=1e4)return(n/1e4).toFixed(1)+"萬";if(n>=1e3)return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,",");return Math.floor(n).toString()};
const bc=(b,c)=>Math.floor(b.bc*Math.pow(1.15,c));
const bcN=(b,c,n)=>{let s=0;for(let i=0;i<n;i++)s+=Math.floor(b.bc*Math.pow(1.15,c+i));return s};
const pk=a=>a[Math.floor(Math.random()*a.length)];
const nMS=at=>{for(const[t]of MS){if(at<t)return t}return null};
const CC=({s=16,c="#3b82f6"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L9.1 16 6 12.5"/><path d="M22 6L13.1 16 12 14.5" opacity=".5"/></svg>;

// ══════════ MAIN ══════════
export default function App(){
  const[rd,setRd]=useState(0);
  const[at,setAt]=useState(0);
  const[msg,setMsg]=useState(pk(MG));
  const[ir,setIr]=useState(false);
  const[fl,setFl]=useState([]);
  const[ow,setOw]=useState(Object.fromEntries(B.map(b=>[b.id,0])));
  const[ps,setPs]=useState(0);
  const[pop,setPop]=useState(false);
  const[ts,setTs]=useState([]);
  const[gc,setGc]=useState(null);
  const[gcPos,setGcPos]=useState({x:50,y:30});
  const[sn,setSn]=useState(new Set());
  const[ul,setUl]=useState(new Set(["ex","par","bsy"]));
  const[nb,setNb]=useState(new Set());
  const[pan,setPan]=useState(null);
  const[bo,setBo]=useState(new Set());
  const[lg,setLg]=useState([]);
  const[rc,setRc]=useState([]);
  const[st,setSt]=useState(false);
  const[sh,setSh]=useState(true);
  const[pc,setPc]=useState(0);
  const[pp,setPp]=useState(0);
  const[hov,setHov]=useState(null);
  const[buyN,setBuyN]=useState(1);
  const[achU,setAchU]=useState(new Set());
  const[tempMult,setTempMult]=useState(1);
  const ui=useRef(0);const aR=useRef(0);const pR=useRef(0);
  useEffect(()=>{aR.current=at},[at]);
  useEffect(()=>{pR.current=ps},[ps]);

  const pmult=1+pp*0.1;
  const pe=Math.floor(Math.sqrt(at/5e5));

  // Production
  useEffect(()=>{let p=0;B.forEach(b=>{let m=1;UP.forEach(u=>{if(u.t==="m"&&u.tg===b.id&&bo.has(u.id))m*=u.b});p+=b.bp*ow[b.id]*m});setPs(p*pmult*tempMult)},[ow,bo,pmult,tempMult]);
  useEffect(()=>{if(ps<=0)return;const iv=setInterval(()=>{const d=ps/20;setRd(r=>r+d);setAt(a=>a+d)},50);return()=>clearInterval(iv)},[ps]);
  useEffect(()=>{const th={hr:2e3,del:1e4,gov:5e4,int:25e4};Object.entries(th).forEach(([id,t])=>{if(at>=t&&!ul.has(id)){setUl(p=>new Set([...p,id]));setNb(p=>new Set([...p,id]));const b=B.find(x=>x.id===id);if(b)toast(`🔓 解鎖：${b.e} ${b.n}！`)}})},[at,ul]);
  useEffect(()=>{MS.forEach(([t,m])=>{if(at>=t&&!sn.has(t)){setSn(p=>new Set([...p,t]));toast(`🏆 ${m}`)}})},[at,sn]);
  // Achievements
  useEffect(()=>{ACHIEVEMENTS.forEach(a=>{if(!achU.has(a.id)&&a.req(at,ow,pc,ps)){setAchU(p=>new Set([...p,a.id]));toast(`🎖️ 成就解鎖：${a.icon} ${a.n}`)}})},[at,ow,pc,ps,achU]);
  // GC spawner
  useEffect(()=>{let t;const sp=()=>{t=setTimeout(()=>{if(aR.current>50&&!gc){const pool=GC.filter(e=>{if((e.type==="mult"||e.type==="mult5")&&aR.current<5e3)return false;if(e.l==="你確定不回嗎？"&&aR.current<1e4)return false;return true});const g=pk(pool);setGc(g);setGcPos({x:8+Math.random()*75,y:10+Math.random()*60})}sp()},20e3+Math.random()*35e3)};sp();return()=>clearTimeout(t)},[]);
  useEffect(()=>{if(st){const t=setTimeout(()=>setSh(false),800);return()=>clearTimeout(t)}},[st]);

  function toast(m){const id=ui.current++;setTs(t=>[...t,{id,m}]);setLg(l=>[{id,m},...l].slice(0,50))}

  const cv=useCallback(()=>{let b=1,p=0;UP.forEach(u=>{if(!bo.has(u.id))return;if(u.t==="ck")b+=u.b;if(u.t==="cp")p+=u.b});return Math.floor((b+pR.current*p)*pmult)},[bo,pmult]);

  const nm=useCallback(()=>{const pool=[...MG];B.forEach(b=>{const c=ow[b.id]||0;if(c>0&&b.m)for(let i=0;i<Math.min(c,5);i++)pool.push(pk(b.m))});return pk(pool)},[ow]);

  const hClick=useCallback(e=>{if(ir)return;if(!st)setSt(true);const r=e.currentTarget.getBoundingClientRect();const x=e.clientX||e.touches?.[0]?.clientX||r.left+r.width/2;const y=e.clientY||e.touches?.[0]?.clientY||r.top+r.height/2;const v=cv();setIr(true);setRd(r=>r+v);setAt(a=>a+v);setPop(true);setTimeout(()=>setPop(false),180);const id=ui.current++;setFl(f=>[...f,{id,x,y,t:v>1?`+${fmt(v)}`:"+1"}]);setRc(p=>[msg,...p].slice(0,5));setTimeout(()=>{setIr(false);setMsg(nm())},200)},[ir,nm,st,msg,cv]);

  const clickGC=useCallback(()=>{if(!gc)return;setGc(null);if(gc.type==="mult"){setTempMult(2);toast(`🚀 ${gc.toast}`);setTimeout(()=>setTempMult(1),gc.dur*1000)}
  else if(gc.type==="mult5"){setTempMult(5);toast(`🔥 ${gc.toast}`);setTimeout(()=>setTempMult(1),gc.dur*1000)}
  else{const bonus=Math.max(20,Math.floor(pR.current*gc.mt));setRd(r=>r+bonus);setAt(a=>a+bonus);toast(`${gc.e} ${gc.toast} +${fmt(bonus)}`)}
  },[gc]);

  const buy=useCallback((b,n)=>{const total=bcN(b,ow[b.id],n);if(rd>=total){const nc=ow[b.id]+n;setRd(r=>r-total);setOw(o=>({...o,[b.id]:nc}));setNb(p=>{const s=new Set(p);s.delete(b.id);return s});for(let i=ow[b.id]+1;i<=nc;i++){if(b.ms?.[i])toast(`${b.e} ${b.ms[i]}`)}}
  },[ow,rd]);

  const buyU=useCallback(u=>{if(rd>=u.cost&&!bo.has(u.id)){setRd(r=>r-u.cost);setBo(s=>new Set([...s,u.id]));toast(`⬆️ ${u.n}！${u.d}`)}},[rd,bo]);

  const doP=useCallback(()=>{if(pe<1)return;setPp(p=>p+pe);setPc(c=>c+1);setRd(0);setAt(0);setOw(Object.fromEntries(B.map(b=>[b.id,0])));setBo(new Set());setUl(new Set(["ex","par","bsy"]));setNb(new Set());setSn(new Set());setRc([]);setPan(null);setTempMult(1);toast(`🌀 Inbox Zero！+${pe}已讀之力。第${pc+1}次覺醒。`)},[pe,pc]);

  const upSt=UP.map(u=>{if(bo.has(u.id))return{...u,s:"done"};const ok=(!u.req.a||at>=u.req.a)&&(!u.req.b||ow[u.req.b]>=u.req.c);return ok?{...u,s:rd>=u.cost?"buy":"wait"}:{...u,s:"lock"}});

  return(
    <div style={{minHeight:"100vh",background:"#0c1220",color:"#e2e8f0",display:"flex",flexDirection:"column",fontFamily:"'Noto Sans TC',-apple-system,sans-serif",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fu{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-55px) scale(1.2)}}
        @keyframes pu{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
        @keyframes ci{0%{opacity:0;transform:scale(.3)}60%{transform:scale(1.1)}100%{opacity:1;transform:scale(1)}}
        @keyframes pn{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes ti{0%{opacity:0;transform:translateX(-50%) translateY(-16px) scale(.9)}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
        @keyframes ib{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes hf{0%{opacity:.8}80%{opacity:.8}100%{opacity:0}}
        @keyframes wg{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
        @keyframes si{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:translateY(0)}}
        @keyframes gcf{0%{opacity:0;transform:scale(.5)}10%{opacity:1;transform:scale(1)}85%{opacity:.8}100%{opacity:0;transform:scale(.3)}}
        *{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit;cursor:pointer}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
        button:active{transform:scale(.96)!important}
        @media(min-width:768px){.split{flex-direction:row!important}.left{width:45%!important;border-right:1px solid rgba(255,255,255,.05)}.right{width:55%!important}}
      `}</style>

      {/* BG */}
      <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 30% 20%,rgba(59,130,246,.05) 0%,transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(139,92,246,.04) 0%,transparent 50%)",pointerEvents:"none"}}/>

      {/* Floats */}
      {fl.map(f=><div key={f.id} style={{position:"fixed",left:f.x-18,top:f.y-22,pointerEvents:"none",fontWeight:800,fontSize:20,color:"#34d399",textShadow:"0 0 10px rgba(52,211,153,.4)",animation:"fu .85s ease-out forwards",zIndex:200,fontFamily:"'JetBrains Mono',monospace"}} onAnimationEnd={()=>setFl(fs=>fs.filter(x=>x.id!==f.id))}>{f.t}</div>)}

      {/* Toast */}
      {ts.slice(-1).map(t=><div key={t.id} style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1e293b,#312e81)",color:"#f8fafc",padding:"12px 22px",borderRadius:14,fontSize:13,boxShadow:"0 8px 30px rgba(49,46,129,.4)",zIndex:300,maxWidth:"90vw",textAlign:"center",animation:"ti .3s ease-out",border:"1px solid rgba(255,255,255,.1)",lineHeight:1.5}} onAnimationEnd={()=>{setTimeout(()=>setTs(ts=>ts.filter(x=>x.id!==t.id)),3e3)}}>{t.m}</div>)}

      {/* Golden Cookie — small, random position */}
      {gc&&<div onClick={clickGC} style={{position:"fixed",left:`${gcPos.x}%`,top:`${gcPos.y}%`,width:36,height:36,borderRadius:"50%",background:gc.type==="mult5"?"linear-gradient(135deg,#ef4444,#f59e0b)":gc.type==="mult"?"linear-gradient(135deg,#3b82f6,#8b5cf6)":"linear-gradient(135deg,#f59e0b,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",zIndex:250,boxShadow:`0 0 16px ${gc.type==="mult5"?"rgba(239,68,68,.5)":gc.type==="mult"?"rgba(139,92,246,.5)":"rgba(245,158,11,.5)"}`,animation:"gcf 5s ease-in-out forwards",userSelect:"none",WebkitTapHighlightColor:"transparent"}} onAnimationEnd={()=>setGc(null)}>{gc.e}</div>}

      {/* Temp mult indicator */}
      {tempMult>1&&<div style={{position:"fixed",top:55,left:"50%",transform:"translateX(-50%)",background:"rgba(245,158,11,.15)",border:"1px solid rgba(245,158,11,.3)",borderRadius:10,padding:"4px 14px",fontSize:12,color:"#f59e0b",fontWeight:700,zIndex:200,fontFamily:"'JetBrains Mono',monospace"}}>🔥 x{tempMult} 產能加成中</div>}

      {/* ═══ HEADER ═══ */}
      <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.04)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center"}}><CC s={15} c="#fff"/></div>
          <span style={{fontSize:14,fontWeight:700,color:"#94a3b8",letterSpacing:2,fontFamily:"'JetBrains Mono',monospace"}}>已讀</span>
          {pp>0&&<span style={{fontSize:10,color:"#a78bfa",background:"rgba(139,92,246,.12)",padding:"2px 7px",borderRadius:6,fontFamily:"'JetBrains Mono',monospace"}}>✦{pp}</span>}
        </div>
        <div style={{display:"flex",gap:5}}>
          {[{k:"ach",l:"🎖️",c:"#f59e0b"},{k:"log",l:"📜",c:"#a78bfa"},{k:"stats",l:"📊",c:"#3b82f6"}].map(b=><button key={b.k} onClick={()=>setPan(p=>p===b.k?null:b.k)} style={{background:pan===b.k?b.c+"22":"rgba(255,255,255,.04)",border:`1px solid ${pan===b.k?b.c+"55":"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"5px 10px",color:pan===b.k?b.c:"#6b7280",fontSize:13,transition:"all .15s"}}>{b.l}</button>)}
        </div>
      </div>

      {/* ═══ PANELS ═══ */}
      {pan==="stats"&&<div style={{padding:"12px 14px",background:"rgba(0,0,0,.3)",borderBottom:"1px solid rgba(255,255,255,.04)",animation:"si .2s ease-out"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {[["生涯已讀",fmt(at)],["產能/秒",fmt(ps)],["點擊力",fmt(cv())],["已讀大師",Object.values(ow).reduce((a,b)=>a+b,0)],["里程碑",sn.size+"/"+MS.length],["重生",pc+"次"],["已讀之力","✦"+pp],["升級",bo.size+"/"+UP.length]].map(([k,v],i)=><div key={i} style={{background:"rgba(255,255,255,.03)",borderRadius:8,padding:"6px 10px",minWidth:80,textAlign:"center"}}><div style={{fontSize:9,color:"#6b7280"}}>{k}</div><div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",fontFamily:"'JetBrains Mono',monospace"}}>{v}</div></div>)}
        </div>
      </div>}

      {pan==="log"&&<div style={{padding:"12px 14px",background:"rgba(0,0,0,.3)",borderBottom:"1px solid rgba(255,255,255,.04)",maxHeight:180,overflowY:"auto",animation:"si .2s ease-out"}}>
        {lg.length===0?<div style={{fontSize:12,color:"#4b5563"}}>還沒有紀錄⋯</div>:lg.map((l,i)=><div key={l.id} style={{fontSize:12,color:"#c4b5fd",padding:"4px 0",borderBottom:i<lg.length-1?"1px solid rgba(255,255,255,.03)":"none",lineHeight:1.4}}>{l.m}</div>)}
      </div>}

      {pan==="ach"&&<div style={{padding:"12px 14px",background:"rgba(0,0,0,.3)",borderBottom:"1px solid rgba(255,255,255,.04)",maxHeight:200,overflowY:"auto",animation:"si .2s ease-out"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:6}}>
          {ACHIEVEMENTS.map(a=>{const done=achU.has(a.id);return <div key={a.id} style={{background:done?"rgba(245,158,11,.08)":"rgba(255,255,255,.02)",border:`1px solid ${done?"rgba(245,158,11,.2)":"rgba(255,255,255,.04)"}`,borderRadius:10,padding:"8px 10px",opacity:done?1:.4}}>
            <div style={{fontSize:18,marginBottom:2}}>{done?a.icon:"❓"}</div>
            <div style={{fontSize:11,fontWeight:600,color:done?"#e2e8f0":"#4b5563"}}>{done?a.n:"???"}</div>
            <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{done?a.d:"繼續探索..."}</div>
          </div>})}
        </div>
      </div>}

      {/* ═══ SPLIT LAYOUT ═══ */}
      <div className="split" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>

        {/* LEFT: Click area */}
        <div className="left" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"12px 16px",position:"relative",flexShrink:0}}>
          {/* Counter */}
          <div style={{fontSize:44,fontWeight:900,fontFamily:"'JetBrains Mono',monospace",color:"#f8fafc",textShadow:"0 0 30px rgba(59,130,246,.12)",animation:pop?"pn .18s ease-out":"none",letterSpacing:-2,lineHeight:1}}>{fmt(rd)}</div>
          <div style={{fontSize:12,color:"#6b7280",fontFamily:"'JetBrains Mono',monospace",marginTop:4,display:"flex",alignItems:"center",gap:5}}><CC s={12} c="#6b7280"/>{ps>0?`${fmt(ps)}/秒`:"點擊開始已讀"}</div>

          {/* Prestige progress — always visible */}
          <div style={{width:"100%",maxWidth:280,marginTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4b5563",fontFamily:"'JetBrains Mono',monospace",marginBottom:2}}>
              <span>🌀 Inbox Zero {pe>=1?`(可獲✦${pe})`:""}</span>
              <span>{pe>=1?<button onClick={doP} style={{background:"linear-gradient(135deg,#ec4899,#8b5cf6)",color:"#fff",border:"none",borderRadius:6,padding:"2px 10px",fontSize:10,fontWeight:700}}>重生</button>:`需${fmt(5e5)}已讀`}</span>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",background:"linear-gradient(90deg,#ec4899,#8b5cf6)",borderRadius:3,transition:"width .3s",width:`${Math.min(100,at/5e5*100)}%`}}/>
            </div>
          </div>

          {/* Message bubble */}
          <div onClick={hClick} style={{marginTop:12,cursor:"pointer",WebkitTapHighlightColor:"transparent",userSelect:"none"}}>
            {sh&&!st&&<div style={{textAlign:"center",fontSize:12,color:"#64748b",marginBottom:6,animation:"hf 4s ease-out forwards"}}>👆 點擊訊息來已讀</div>}
            <div style={{position:"relative",background:ir?"linear-gradient(135deg,#1e293b,#334155)":"linear-gradient(145deg,#1e3a5f,#1e40af 40%,#3b82f6)",borderRadius:20,padding:"20px 28px",minWidth:180,maxWidth:280,transition:"all .1s",transform:ir?"scale(.94)":"scale(1)",opacity:ir?.3:1,boxShadow:ir?"none":"0 0 24px rgba(59,130,246,.15),0 6px 24px rgba(0,0,0,.25)",animation:(!st&&!ir)?"ib 2s ease-in-out infinite":"none"}}>
              {!ir&&<div style={{position:"absolute",top:-7,right:-7,minWidth:20,height:20,borderRadius:10,background:"linear-gradient(135deg,#ef4444,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",padding:"0 5px",animation:"pu 1.5s ease-in-out infinite"}}>1</div>}
              <div style={{color:ir?"#64748b":"#f0f4f8",fontSize:15,lineHeight:1.5,fontWeight:500}}>{msg}</div>
              {ir&&<div style={{position:"absolute",bottom:6,right:12,animation:"ci .3s ease-out"}}><CC s={16} c="#3b82f6"/></div>}
            </div>
          </div>

          {/* Recent trail */}
          {rc.length>0&&<div style={{marginTop:6,width:"100%",maxWidth:280}}>
            {rc.slice(0,3).map((m,i)=><div key={i} style={{fontSize:10,color:"#334155",opacity:1-i*.3,padding:"1px 0",display:"flex",alignItems:"center",gap:4,overflow:"hidden"}}><CC s={9} c="#27364b"/><span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m}</span></div>)}
          </div>}
        </div>

        {/* RIGHT: Buildings + Upgrades */}
        <div className="right" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>

          {/* Upgrades row */}
          {upSt.some(u=>u.s!=="lock")&&<div style={{padding:"6px 12px 4px",borderBottom:"1px solid rgba(255,255,255,.04)",flexShrink:0}}>
            <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2}}>
              {upSt.filter(u=>u.s!=="lock").map(u=><div key={u.id} style={{position:"relative"}}>
                <button onClick={()=>u.s==="buy"?buyU(u):null} onMouseEnter={()=>setHov(u.id)} onMouseLeave={()=>setHov(null)} onTouchStart={()=>setHov(u.id)} onTouchEnd={()=>{if(u.s==="buy")buyU(u);setTimeout(()=>setHov(null),2e3)}} style={{width:36,height:36,borderRadius:9,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",background:u.s==="done"?"rgba(52,211,153,.1)":u.s==="buy"?"rgba(59,130,246,.15)":"rgba(255,255,255,.02)",border:`1.5px solid ${u.s==="done"?"#34d39944":u.s==="buy"?"#3b82f655":"rgba(255,255,255,.04)"}`,opacity:u.s==="done"?.4:u.s==="buy"?1:.2,transition:"all .15s",flexShrink:0,cursor:u.s==="buy"?"pointer":"default",position:"relative"}}>
                  {u.s==="done"&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><CC s={12} c="#34d399"/></div>}
                  <span style={{opacity:u.s==="done"?.25:1}}>{u.e}</span>
                </button>
                {hov===u.id&&<div style={{position:"absolute",bottom:"110%",left:"50%",transform:"translateX(-50%)",background:"#1e293b",border:"1px solid rgba(255,255,255,.1)",borderRadius:9,padding:"8px 11px",minWidth:140,zIndex:100,fontSize:11,boxShadow:"0 4px 16px rgba(0,0,0,.5)",pointerEvents:"none",whiteSpace:"nowrap"}}>
                  <div style={{fontWeight:700,color:"#e2e8f0"}}>{u.n}</div>
                  <div style={{color:"#94a3b8",marginTop:1}}>{u.d}</div>
                  {u.s==="buy"&&<div style={{color:"#34d399",marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>✉ {fmt(u.cost)} — 可購買！</div>}
                  {u.s==="wait"&&<div style={{color:"#f59e0b",marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>✉ {fmt(u.cost)} — 還差 {fmt(u.cost-rd)}</div>}
                  {u.req.b&&u.s!=="done"&&<div style={{color:"#6b7280",marginTop:1,fontSize:10}}>需要 {B.find(b=>b.id===u.req.b)?.n} ×{u.req.c}</div>}
                </div>}
              </div>)}
            </div>
          </div>}

          {/* Bulk buy toggle */}
          <div style={{padding:"6px 12px 4px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{fontSize:11,color:"#4b5563",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>👥 已讀大師</div>
            <div style={{display:"flex",gap:3}}>
              {[1,10,100].map(n=><button key={n} onClick={()=>setBuyN(n)} style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:buyN===n?"rgba(59,130,246,.2)":"rgba(255,255,255,.03)",border:`1px solid ${buyN===n?"rgba(59,130,246,.3)":"rgba(255,255,255,.05)"}`,color:buyN===n?"#3b82f6":"#6b7280",fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>×{n}</button>)}
            </div>
          </div>

          {/* Buildings list */}
          <div style={{flex:1,overflowY:"auto",padding:"0 12px 8px",minHeight:0}}>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {B.filter(b=>ul.has(b.id)).map((b,i)=>{
                const ct=bcN(b,ow[b.id],buyN);const can=rd>=ct;const pr=b.bp*ow[b.id];const nw=nb.has(b.id);const wk=ow[b.id]>0;
                return <button key={b.id} onClick={e=>{e.stopPropagation();buy(b,buyN)}} disabled={!can} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",background:can?"rgba(255,255,255,.03)":"rgba(255,255,255,.01)",border:`1px solid ${nw?b.c+"55":can?"rgba(255,255,255,.06)":"rgba(255,255,255,.02)"}`,borderRadius:14,opacity:can?1:.25,transition:"all .15s",textAlign:"left",position:"relative",overflow:"hidden",animation:nw?"si .4s ease-out":"none"}}>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,borderRadius:"14px 0 0 14px",background:wk?b.c:"transparent",opacity:.5}}/>
                  {nw&&<div style={{position:"absolute",top:4,right:6,background:b.c,color:"#fff",fontSize:8,fontWeight:800,padding:"1px 6px",borderRadius:6}}>NEW</div>}
                  <div style={{width:38,height:38,borderRadius:12,background:`${b.c}12`,border:`1px solid ${b.c}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,animation:wk?`wg 3s ease-in-out infinite ${i*.3}s`:"none"}}>{b.e}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{color:"#e2e8f0",fontWeight:700,fontSize:13}}>{b.n}</span>
                      <span style={{color:"#6b7280",fontSize:10,fontFamily:"'JetBrains Mono',monospace",background:"rgba(255,255,255,.04)",padding:"1px 6px",borderRadius:6}}>×{ow[b.id]}</span>
                    </div>
                    <div style={{color:"#4b5563",fontSize:10,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.d}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                      <span style={{color:can?"#34d399":"#374151",fontSize:11,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>✉ {fmt(ct)}{buyN>1?` (×${buyN})`:""}</span>
                      {wk&&<span style={{color:"#4b5563",fontSize:10,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(pr)}/s</span>}
                    </div>
                  </div>
                </button>
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TICKER ═══ */}
      <Tk at={at}/>
    </div>
  );
}

function Tk({at}){
  const[c,setC]=useState("");
  const[f,setF]=useState(true);
  const pool=TT.filter(t=>at>=t.t).flatMap(t=>t.m);
  const pR=useRef(pool);pR.current=pool;
  useEffect(()=>{const n=()=>pk(pR.current)||"";setC(n());const iv=setInterval(()=>{setF(false);setTimeout(()=>{setC(n());setF(true)},300)},5500);return()=>clearInterval(iv)},[]);
  return <div style={{padding:"8px 14px",background:"rgba(0,0,0,.4)",borderTop:"1px solid rgba(255,255,255,.04)",minHeight:36,display:"flex",alignItems:"center",flexShrink:0,gap:6}}>
    <span style={{fontSize:12,flexShrink:0}}>📰</span>
    <span style={{color:"#6b7280",fontSize:11,transition:"opacity .3s",opacity:f?1:0,lineHeight:1.3}}>{c}</span>
  </div>
}
