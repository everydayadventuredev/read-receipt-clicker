import { useState, useEffect, useRef, useCallback } from 'react';

const WAVE_PERIOD = 2800; // ms for one full oscillation
const COLLAPSE_WINDOW = 0.14; // fraction of range = perfect zone width
const COOLDOWN = 6;

export default function QuantumLab({ perSecond, onEarn, quantumCount, onCollapse }) {
  const [phase, setPhase] = useState('idle'); // idle | wave | collapsed | cooldown
  const [wavePos, setWavePos] = useState(0.5); // 0..1
  const [collapseResult, setCollapseResult] = useState(null); // 'perfect' | 'good' | 'miss'
  const [earned, setEarned] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [totalCollapses, setTotalCollapses] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [superposition, setSuperposition] = useState(false);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const cooldownRef = useRef(null);
  const waveRef = useRef(0.5);

  const startWave = useCallback(() => {
    startTimeRef.current = performance.now();
    setPhase('wave');
    setSuperposition(false);
  }, []);

  // Animate wave
  useEffect(() => {
    if (phase !== 'wave') {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const animate = (now) => {
      const elapsed = now - startTimeRef.current;
      const t = (elapsed % WAVE_PERIOD) / WAVE_PERIOD;
      // Smooth sine wave: 0→1→0 etc
      const pos = 0.5 + 0.45 * Math.sin(t * Math.PI * 2);
      waveRef.current = pos;
      setWavePos(pos);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(cooldownRef.current);
  }, []);

  const collapse = useCallback(() => {
    if (phase !== 'wave') return;
    cancelAnimationFrame(rafRef.current);
    const pos = waveRef.current;
    const center = 0.5;
    const dist = Math.abs(pos - center);

    let result, mult;
    if (dist <= COLLAPSE_WINDOW / 2) {
      result = 'perfect';
      mult = 3;
      setPerfectCount(p => p + 1);
    } else if (dist <= COLLAPSE_WINDOW) {
      result = 'good';
      mult = 1.5;
    } else {
      result = 'miss';
      mult = 0.3;
    }

    const bonus = Math.max(1, Math.floor(perSecond * mult * 2));
    setEarned(bonus);
    setCollapseResult(result);
    setTotalCollapses(t => t + 1);
    if (onEarn && mult > 0.3) onEarn(bonus);
    setPhase('collapsed');

    // Show result briefly then cooldown
    setTimeout(() => {
      setCooldown(COOLDOWN);
      setPhase('cooldown');
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
    }, 1200);
  }, [phase, perSecond, onEarn]);

  const resultColor = collapseResult === 'perfect' ? '#f59e0b'
    : collapseResult === 'good' ? '#10b981' : '#94a3b8';
  const resultLabel = collapseResult === 'perfect' ? '完美坍縮！⚡'
    : collapseResult === 'good' ? '良好坍縮 ✓' : '波函數失焦...';

  // Draw the probability distribution
  const center = 0.5;
  const perfectZone = COLLAPSE_WINDOW / 2;
  const goodZone = COLLAPSE_WINDOW;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(34,211,238,.06)',
        borderBottom: '1px solid rgba(34,211,238,.15)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚛️</span>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 14, color: 'var(--text)',
          }}>量子實驗室</span>
          {perfectCount > 0 && (
            <span style={{
              fontSize: 11, color: '#22d3ee', fontWeight: 600,
              background: 'rgba(34,211,238,.08)',
              borderRadius: 6, padding: '2px 6px',
            }}>
              完美 ×{perfectCount}
            </span>
          )}
        </div>
        <button onClick={onCollapse} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, padding: '2px 6px',
        }}>▲ 收合</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: 16, gap: 12 }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            background: 'rgba(34,211,238,.06)', borderRadius: 10,
            padding: '6px 14px', textAlign: 'center', flex: 1,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>坍縮次數</div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: '#22d3ee',
              fontFamily: "'JetBrains Mono',monospace",
            }}>{totalCollapses}</div>
          </div>
          <div style={{
            background: 'rgba(245,158,11,.06)', borderRadius: 10,
            padding: '6px 14px', textAlign: 'center', flex: 1,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>完美坍縮</div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: '#f59e0b',
              fontFamily: "'JetBrains Mono',monospace",
            }}>{perfectCount}</div>
          </div>
          <div style={{
            background: 'rgba(99,102,241,.06)', borderRadius: 10,
            padding: '6px 14px', textAlign: 'center', flex: 1,
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>量子建築</div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: 'var(--purple)',
              fontFamily: "'JetBrains Mono',monospace",
            }}>{quantumCount}</div>
          </div>
        </div>

        {/* Wave display */}
        {(phase === 'wave' || phase === 'collapsed') && (
          <div style={{ position: 'relative', height: 80 }}>
            {/* Zone backgrounds */}
            <div style={{
              position: 'absolute', inset: '10px 0',
              background: `linear-gradient(90deg,
                transparent ${(center - goodZone) * 100}%,
                rgba(16,185,129,.08) ${(center - goodZone) * 100}%,
                rgba(16,185,129,.08) ${(center - perfectZone) * 100}%,
                rgba(245,158,11,.15) ${(center - perfectZone) * 100}%,
                rgba(245,158,11,.15) ${(center + perfectZone) * 100}%,
                rgba(16,185,129,.08) ${(center + perfectZone) * 100}%,
                rgba(16,185,129,.08) ${(center + goodZone) * 100}%,
                transparent ${(center + goodZone) * 100}%)`,
              borderRadius: 6,
            }} />
            {/* Center line */}
            <div style={{
              position: 'absolute',
              left: `${center * 100}%`,
              top: 6, bottom: 6,
              width: 1,
              background: 'rgba(245,158,11,.4)',
            }} />
            {/* Wave particle */}
            <div style={{
              position: 'absolute',
              left: `${wavePos * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 24, height: 24,
              borderRadius: '50%',
              background: phase === 'collapsed'
                ? (collapseResult === 'perfect' ? '#f59e0b' : collapseResult === 'good' ? '#10b981' : '#94a3b8')
                : '#22d3ee',
              boxShadow: phase === 'wave'
                ? '0 0 12px #22d3ee, 0 0 24px rgba(34,211,238,.4)'
                : undefined,
              transition: phase === 'collapsed' ? 'none' : undefined,
            }} />
            {/* Labels */}
            <div style={{
              position: 'absolute', bottom: -2, left: `${(center - perfectZone) * 100}%`,
              fontSize: 9, color: '#f59e0b', fontWeight: 600,
              transform: 'translateX(-50%)',
            }}>完美</div>
            <div style={{
              position: 'absolute', bottom: -2, left: `${(center + perfectZone) * 100}%`,
              fontSize: 9, color: '#f59e0b', fontWeight: 600,
              transform: 'translateX(-50%)',
            }}>完美</div>
          </div>
        )}

        {/* Action area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {phase === 'idle' && (
            <>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                當量子粒子在<span style={{ color: '#f59e0b', fontWeight: 700 }}>中心完美區域</span>時<br />
                按下坍縮！獲得 <b>×3</b> 獎勵
              </div>
              <button onClick={startWave} style={{
                background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '10px 28px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(34,211,238,.3)',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                啟動波函數 ▶
              </button>
            </>
          )}

          {phase === 'wave' && (
            <button
              onClick={collapse}
              style={{
                background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '14px 40px', fontSize: 20, fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,211,238,.4)',
                fontFamily: "'Space Grotesk', sans-serif",
                animation: 'quantum-pulse 1.2s ease-in-out infinite',
              }}
            >
              ⚡ 坍縮！
            </button>
          )}

          {phase === 'collapsed' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: resultColor }}>
                {resultLabel}
              </div>
              {collapseResult !== 'miss' && (
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 6,
                }}>
                  +{earned.toLocaleString()}
                </div>
              )}
            </div>
          )}

          {phase === 'cooldown' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: resultColor }}>
                {resultLabel}
              </div>
              {collapseResult !== 'miss' && (
                <div style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 4,
                }}>
                  +{earned.toLocaleString()}
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                量子場重置中... {cooldown}s
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes quantum-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(34,211,238,.4); }
          50% { transform: scale(1.04); box-shadow: 0 6px 28px rgba(34,211,238,.6); }
        }
      `}</style>
    </div>
  );
}
