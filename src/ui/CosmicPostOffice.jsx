import { useState, useEffect, useRef, useCallback } from 'react';

const PLANETS = [
  { id: 'mars',    name: '火星', emoji: '🔴', color: '#ef4444', keywords: ['🔴','❤️','🌶️','♦️'] },
  { id: 'neptune', name: '海王', emoji: '🔵', color: '#3b82f6', keywords: ['🔵','💙','🫐','🫧'] },
  { id: 'saturn',  name: '土星', emoji: '🪐', color: '#f59e0b', keywords: ['🪐','⭐','✨','⚡'] },
  { id: 'alien',   name: '仙女座', emoji: '👽', color: '#a855f7', keywords: ['👽','🛸','🌌','∴∵'] },
];

const MESSAGES = [
  { text: '❤️ 來自宇宙的愛', planet: 'mars' },
  { text: '💙 深海訊號收到', planet: 'neptune' },
  { text: '✨ 星環共振確認', planet: 'saturn' },
  { text: '👽 ∴∵ 宇宙密語', planet: 'alien' },
  { text: '🔴 太陽風暴警報', planet: 'mars' },
  { text: '🔵 冰封海洋深處', planet: 'neptune' },
  { text: '🪐 環帶探測完畢', planet: 'saturn' },
  { text: '🛸 跨維度通訊開啟', planet: 'alien' },
  { text: '♦️ 火山熔岩訊號', planet: 'mars' },
  { text: '🫧 液態金屬反饋', planet: 'neptune' },
  { text: '⭐ 引力場穩定', planet: 'saturn' },
  { text: '🌌 暗物質已讀確認', planet: 'alien' },
  { text: '🌶️ 紅巨星爆發警報', planet: 'mars' },
  { text: '🫐 磁場迴流記錄', planet: 'neptune' },
  { text: '⚡ 閃電風暴資料', planet: 'saturn' },
  { text: '∴∵∴ 費米悖論解答', planet: 'alien' },
];

const ROUND_DURATION = 20;
const SPAWN_INTERVAL = 2200;
const COOLDOWN = 8;

export default function CosmicPostOffice({ perSecond, onEarn, alienCount, onCollapse }) {
  const [phase, setPhase] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [sorted, setSorted] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [earned, setEarned] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [totalSorted, setTotalSorted] = useState(0);
  const [bestRound, setBestRound] = useState(0);
  const [dragId, setDragId] = useState(null);
  const sortedRef = useRef(0);
  const missedRef = useRef(0);
  const spawnRef = useRef(null);
  const timerRef = useRef(null);
  const cooldownRef = useRef(null);
  const msgIdRef = useRef(0);

  const finishRound = useCallback(() => {
    clearInterval(spawnRef.current);
    clearInterval(timerRef.current);
    const s = sortedRef.current;
    const m = missedRef.current;
    const accuracy = s + m > 0 ? s / (s + m) : 0;
    const bonus = Math.max(1, Math.floor(perSecond * s * accuracy * 0.8));
    setEarned(bonus);
    setBestRound(prev => Math.max(prev, s));
    setTotalSorted(prev => prev + s);
    if (onEarn) onEarn(bonus);
    setPhase('result');
    setCooldown(COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(cooldownRef.current); setPhase('idle'); return 0; }
        return c - 1;
      });
    }, 1000);
  }, [perSecond, onEarn]);

  const spawnMessage = useCallback(() => {
    const tmpl = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const id = ++msgIdRef.current;
    setMessages(prev => [...prev, { ...tmpl, id, x: 15 + Math.random() * 65 }]);
    // Auto-expire after 5s
    setTimeout(() => {
      setMessages(prev => {
        const had = prev.find(m => m.id === id);
        if (had) {
          missedRef.current += 1;
          setMissed(v => v + 1);
        }
        return prev.filter(m => m.id !== id);
      });
    }, 5000);
  }, []);

  const startRound = useCallback(() => {
    sortedRef.current = 0;
    missedRef.current = 0;
    msgIdRef.current = 0;
    setSorted(0);
    setMissed(0);
    setMessages([]);
    setTimeLeft(ROUND_DURATION);
    setPhase('active');
    spawnMessage();
    spawnRef.current = setInterval(spawnMessage, SPAWN_INTERVAL);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { finishRound(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [spawnMessage, finishRound]);

  useEffect(() => () => {
    clearInterval(spawnRef.current);
    clearInterval(timerRef.current);
    clearInterval(cooldownRef.current);
  }, []);

  const handleSort = useCallback((msgId, planetId) => {
    setMessages(prev => {
      const msg = prev.find(m => m.id === msgId);
      if (!msg) return prev;
      if (msg.planet === planetId) {
        sortedRef.current += 1;
        setSorted(v => v + 1);
      } else {
        missedRef.current += 1;
        setMissed(v => v + 1);
      }
      return prev.filter(m => m.id !== msgId);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(168,85,247,.06)',
        borderBottom: '1px solid rgba(168,85,247,.15)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>📬</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 14, color: '#1e293b',
          }}>宇宙郵局</span>
          {bestRound > 0 && (
            <span style={{
              fontSize: 11, color: '#a855f7', fontWeight: 600,
              background: 'rgba(168,85,247,.08)',
              borderRadius: 6, padding: '2px 6px',
            }}>
              最佳 {bestRound} 封
            </span>
          )}
        </div>
        <button onClick={onCollapse} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#94a3b8', fontWeight: 600, padding: '2px 6px',
        }}>▲ 收合</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {/* Stats */}
        <div style={{
          display: 'flex', gap: 12, padding: '6px 14px',
          background: 'rgba(168,85,247,.03)',
          borderBottom: '1px solid rgba(168,85,247,.08)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>總分類: <b style={{ color: '#a855f7' }}>{totalSorted}</b></span>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>外星通訊: <b style={{ color: '#a855f7' }}>{alienCount}</b></span>
          {phase === 'active' && (
            <>
              <span style={{ fontSize: 11, color: '#10b981' }}>✓ {sorted}</span>
              <span style={{ fontSize: 11, color: '#ef4444' }}>✗ {missed}</span>
              <span style={{ fontSize: 11, color: timeLeft <= 5 ? '#ef4444' : '#94a3b8', marginLeft: 'auto' }}>⏱ {timeLeft}s</span>
            </>
          )}
        </div>

        {phase === 'idle' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20,
          }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>📬🪐👽🛸</div>
            <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 1.5, maxWidth: 280 }}>
              把落下的星際訊息<br />
              拖拉到正確的星球收件匣！<br />
              <span style={{ color: '#a855f7', fontWeight: 600 }}>看表情符號判斷目的地</span>
            </div>
            <button onClick={startRound} style={{
              background: 'linear-gradient(135deg, #a855f7, #9333ea)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '10px 28px', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(168,85,247,.3)',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              開始分揀 ▶
            </button>
          </div>
        )}

        {phase === 'active' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
            {/* Message field */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  draggable
                  onDragStart={() => setDragId(msg.id)}
                  onDragEnd={() => setDragId(null)}
                  style={{
                    position: 'absolute',
                    left: `${msg.x}%`,
                    top: '20%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    border: '1.5px solid rgba(168,85,247,.2)',
                    borderRadius: 10, padding: '6px 12px',
                    cursor: 'grab',
                    boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 13, fontWeight: 600,
                    color: '#1e293b',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    animation: 'cosmic-fall 5s linear forwards',
                    zIndex: dragId === msg.id ? 10 : 1,
                  }}
                >
                  {msg.text}
                </div>
              ))}
              <style>{`
                @keyframes cosmic-fall {
                  0% { top: 5%; opacity: 1; }
                  80% { opacity: 1; }
                  100% { top: 65%; opacity: 0; }
                }
              `}</style>
            </div>

            {/* Planet bins */}
            <div style={{
              display: 'flex', gap: 6, padding: '8px 10px',
              borderTop: '1px solid rgba(168,85,247,.12)',
              flexShrink: 0,
              background: 'rgba(168,85,247,.03)',
            }}>
              {PLANETS.map(planet => (
                <div
                  key={planet.id}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (dragId) handleSort(dragId, planet.id);
                    setDragId(null);
                  }}
                  style={{
                    flex: 1, textAlign: 'center',
                    padding: '8px 4px',
                    border: `2px dashed ${planet.color}33`,
                    borderRadius: 10,
                    background: `${planet.color}08`,
                    cursor: 'default',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ fontSize: 20 }}>{planet.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: planet.color, marginTop: 2 }}>
                    {planet.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 36 }}>📬</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#a855f7' }}>
              分揀 {sorted} 封
            </div>
            {missed > 0 && <div style={{ fontSize: 13, color: '#ef4444' }}>✗ 漏失 {missed} 封</div>}
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 20, fontWeight: 700, color: '#10b981',
            }}>
              +{earned.toLocaleString()} 已讀
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>冷卻中... {cooldown}s</div>
          </div>
        )}
      </div>
    </div>
  );
}
