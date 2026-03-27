import { fmt } from '../utils/format.js';

export default function PrestigeBar({ allTime, prestigeEarned, onPrestige }) {
  const progress = Math.min(100, (allTime / 500000) * 100);

  return (
    <div style={{
      width: '100%', maxWidth: 300, marginTop: 12,
      background: 'rgba(255,255,255,.03)',
      borderRadius: 16, padding: '10px 14px',
      border: '1px solid rgba(255,255,255,.04)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, marginBottom: 6,
      }}>
        <span style={{
          color: '#9ca3af', fontFamily: "'JetBrains Mono',monospace",
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          🌀 Inbox Zero
          {prestigeEarned >= 1 && (
            <span style={{
              color: '#c4b5fd', background: 'rgba(167,139,250,.1)',
              padding: '1px 6px', borderRadius: 6, fontSize: 10,
            }}>+✦{prestigeEarned}</span>
          )}
        </span>
        <span>
          {prestigeEarned >= 1
            ? <button onClick={onPrestige} style={{
                background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                color: '#fff', border: 'none', borderRadius: 10,
                padding: '4px 14px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(139,92,246,.3)',
                transition: 'all .15s',
              }}>重生</button>
            : <span style={{ color: '#4b5563', fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>
                需{fmt(500000)}已讀
              </span>
          }
        </span>
      </div>
      <div style={{
        height: 4, background: 'rgba(255,255,255,.04)',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: progress >= 100
            ? 'linear-gradient(90deg, #a78bfa, #a3e635)'
            : 'linear-gradient(90deg, #a78bfa, #818cf8)',
          borderRadius: 4,
          transition: 'width .3s cubic-bezier(.4,0,.2,1)',
          width: `${progress}%`,
          boxShadow: progress > 5 ? '0 0 8px rgba(167,139,250,.4)' : 'none',
        }} />
      </div>
    </div>
  );
}
