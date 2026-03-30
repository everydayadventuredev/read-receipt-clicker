import { useState, useEffect, useRef, useCallback } from 'react';

const PHRASES = [
  '已讀不回', '請問有空嗎', '收到請回覆', '在嗎在嗎', '記得穿外套',
  '改天再約', '你還好嗎', '謝謝你的訊息', '明天截止', '抱歉剛在忙',
  '隨時都可以', '歡迎聯繫我', '請耐心等候', '感謝您的回覆', '我在路上',
  '大家都很忙', '這樣說不對', '已讀全宇宙', '社群演算法推薦', '量子糾纏已讀',
  'read receipt', 'seen but ignored', 'typing indicator gone',
];

const COOLDOWN = 8; // seconds between rounds

function getRandPhrase() {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

export default function TypeSprint({ perSecond, onEarn, infCount, onCollapse }) {
  const [phase, setPhase] = useState('idle'); // idle | typing | result | cooldown
  const [phrase, setPhrase] = useState('');
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [earned, setEarned] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalSprints, setTotalSprints] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const inputRef = useRef(null);
  const cooldownRef = useRef(null);

  const startRound = useCallback(() => {
    const p = getRandPhrase();
    setPhrase(p);
    setTyped('');
    setPhase('typing');
    setStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleInput = useCallback((e) => {
    if (phase !== 'typing') return;
    const val = e.target.value;
    setTyped(val);

    if (val === phrase) {
      const elapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      const words = phrase.length / 5;
      const calculatedWpm = Math.round(words / elapsed);
      const acc = 100; // matched perfectly
      const bonus = Math.max(1, Math.floor(perSecond * (calculatedWpm / 40)));

      setWpm(calculatedWpm);
      setAccuracy(acc);
      setEarned(bonus);
      setBestWpm(prev => Math.max(prev, calculatedWpm));
      setTotalSprints(prev => prev + 1);
      if (onEarn) onEarn(bonus);
      setPhase('result');

      // Start cooldown
      setCooldown(COOLDOWN);
      cooldownRef.current = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) {
            clearInterval(cooldownRef.current);
            setPhase('idle');
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
  }, [phase, phrase, startTime, perSecond, onEarn]);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // Character-by-character coloring
  const renderPhrase = () => {
    return phrase.split('').map((ch, i) => {
      let color = '#94a3b8'; // untyped
      if (i < typed.length) {
        color = typed[i] === ch ? '#10b981' : '#ef4444'; // correct/wrong
      }
      return (
        <span key={i} style={{ color, transition: 'color .08s' }}>{ch}</span>
      );
    });
  };

  const wpmColor = wpm >= 100 ? '#f59e0b' : wpm >= 60 ? '#10b981' : '#6366f1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(249,115,22,.06)',
        borderBottom: '1px solid rgba(249,115,22,.12)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⌨️</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 14, color: '#1e293b',
          }}>打字衝刺</span>
          {bestWpm > 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: '#f97316', fontWeight: 600,
              background: 'rgba(249,115,22,.08)',
              borderRadius: 6, padding: '2px 6px',
            }}>
              最佳 {bestWpm} WPM
            </span>
          )}
        </div>
        <button
          onClick={onCollapse}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#94a3b8', fontWeight: 600,
            padding: '2px 6px',
          }}
        >▲ 收合</button>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 20, gap: 16,
      }}>
        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 16, width: '100%', justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(249,115,22,.06)', borderRadius: 10,
            padding: '6px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>衝刺次數</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f97316', fontFamily: "'JetBrains Mono',monospace" }}>
              {totalSprints}
            </div>
          </div>
          <div style={{
            background: 'rgba(16,185,129,.06)', borderRadius: 10,
            padding: '6px 14px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>網紅數</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', fontFamily: "'JetBrains Mono',monospace" }}>
              {infCount}
            </div>
          </div>
        </div>

        {/* Phase: idle */}
        {phase === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>
              快速打出短語，打得越快獎勵越多！<br />
              100 WPM = 2.5× 加成
            </div>
            <button
              onClick={startRound}
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '10px 28px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(249,115,22,.3)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              開始衝刺 ▶
            </button>
          </div>
        )}

        {/* Phase: typing */}
        {phase === 'typing' && (
          <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 22, fontWeight: 700, letterSpacing: 2,
              marginBottom: 12, lineHeight: 1.4,
              background: 'rgba(249,115,22,.05)',
              borderRadius: 10, padding: '10px 16px',
            }}>
              {renderPhrase()}
            </div>
            <input
              ref={inputRef}
              value={typed}
              onChange={handleInput}
              placeholder="在這裡打字..."
              style={{
                width: '100%', padding: '10px 14px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16, borderRadius: 10,
                border: '2px solid rgba(249,115,22,.3)',
                outline: 'none', textAlign: 'center',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
              打出上方短語即可完成
            </div>
          </div>
        )}

        {/* Phase: result */}
        {phase === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 36, fontWeight: 800,
              color: wpmColor,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {wpm} WPM
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {wpm >= 100 ? '🔥 神速！' : wpm >= 60 ? '⚡ 不錯！' : '👍 繼續練習！'}
            </div>
            <div style={{
              marginTop: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20, fontWeight: 700, color: '#10b981',
            }}>
              +{earned.toLocaleString()} 已讀
            </div>
            <div style={{
              marginTop: 8, fontSize: 12, color: '#94a3b8',
            }}>
              冷卻中... {cooldown}s
            </div>
          </div>
        )}

        {/* Phase: cooldown (same as result but no earned showing) */}
        {phase === 'cooldown' && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            冷卻中... {cooldown}s
          </div>
        )}
      </div>
    </div>
  );
}
