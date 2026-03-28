import { fmt } from '../utils/format.js';

export default function PrestigeBar({ allTime, prestigeEarned, prestigeCount = 0, onPrestige }) {
  const progress = Math.min(100, (allTime / 500000) * 100);
  const canPrestige = prestigeEarned >= 1;
  const isComplete = progress >= 100;
  const isHigh = progress >= 80;
  const isMid = progress >= 50;

  // Determine bar gradient
  let barGradient = 'linear-gradient(90deg, #6366f1, #4338ca)';
  if (isComplete) {
    barGradient = 'linear-gradient(90deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6, #ef4444)';
  }

  // Determine bar glow
  let barShadow = progress > 5 ? '0 0 8px rgba(99,102,241,.4)' : 'none';
  if (isComplete) {
    barShadow = '0 0 16px rgba(99,102,241,.6), 0 0 32px rgba(139,92,246,.3)';
  } else if (isHigh) {
    barShadow = '0 0 12px rgba(99,102,241,.5), 0 0 20px rgba(99,102,241,.2)';
  } else if (isMid) {
    barShadow = '0 0 10px rgba(99,102,241,.35)';
  }

  return (
    <>
      <style>{`
        @keyframes barPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,.5), 0 0 20px rgba(99,102,241,.2); }
          50% { box-shadow: 0 0 16px rgba(99,102,241,.7), 0 0 28px rgba(99,102,241,.35); }
        }
        @keyframes rainbowBreath {
          0%, 100% { box-shadow: 0 0 16px rgba(99,102,241,.6), 0 0 32px rgba(139,92,246,.3); background-size: 200% 100%; }
          50% { box-shadow: 0 0 24px rgba(139,92,246,.8), 0 0 48px rgba(99,102,241,.4); background-size: 300% 100%; }
        }
        @keyframes cardPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 1px 3px rgba(0,0,0,.06); }
          50% { transform: scale(1.01); box-shadow: 0 2px 16px rgba(99,102,241,.15); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes prestigePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
      <div style={{
        width: '100%', maxWidth: 300, marginTop: 12,
        background: '#fff',
        borderRadius: 16, padding: '10px 14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        animation: isComplete ? 'cardPulse 2s ease-in-out infinite' : 'none',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11, marginBottom: 6,
        }}>
          <span style={{
            color: '#64748b', fontFamily: "'JetBrains Mono',monospace",
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            🌀 Inbox Zero
            {canPrestige && (
              <span style={{
                color: '#4f46e5', background: 'rgba(99,102,241,.08)',
                padding: '1px 6px', borderRadius: 6, fontSize: 10,
                animation: 'prestigePulse 2s ease-in-out infinite',
              }}>+✦{prestigeEarned}</span>
            )}
          </span>
          <span>
            {canPrestige
              ? <button onClick={onPrestige} style={{
                  background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '4px 14px', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(99,102,241,.3)',
                  transition: 'all .15s',
                  animation: 'pu 2s ease-in-out infinite',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Shimmer overlay */}
                  <span style={{
                    position: 'absolute',
                    top: 0, left: '-100%',
                    width: '60%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                  重生
                </button>
              : <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
                  需{fmt(500000)}已讀
                </span>
            }
          </span>
        </div>
        <div style={{
          height: 4, background: '#f1f5f9',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            background: barGradient,
            backgroundSize: isComplete ? '200% 100%' : '100% 100%',
            borderRadius: 4,
            transition: 'width .3s cubic-bezier(.4,0,.2,1)',
            width: `${progress}%`,
            boxShadow: barShadow,
            animation: isComplete
              ? 'rainbowBreath 2s ease-in-out infinite'
              : isHigh
                ? 'barPulse 1.5s ease-in-out infinite'
                : 'none',
          }} />
        </div>
      </div>
    </>
  );
}
