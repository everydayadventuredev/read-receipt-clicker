import { useState } from 'react';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';
import CheckIcon from './CheckIcon.jsx';

export default function UpgradeRow({ upgrades, reads, onBuy }) {
  const [hov, setHov] = useState(null);

  return (
    <div style={{
      padding: '10px 16px 8px',
      borderBottom: '1px solid rgba(255,255,255,.03)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 3 }}>
        {upgrades.map(u => (
          <div key={u.id} style={{ position: 'relative' }}>
            <button
              onClick={() => u.state === 'buy' && onBuy(u)}
              onMouseEnter={() => setHov(u.id)}
              onMouseLeave={() => setHov(null)}
              onTouchStart={() => setHov(u.id)}
              onTouchEnd={() => { if (u.state === 'buy') onBuy(u); setTimeout(() => setHov(null), 2000); }}
              style={{
                width: 40, height: 40, borderRadius: 14, fontSize: 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: u.state === 'done'
                  ? 'rgba(163,230,53,.06)'
                  : u.state === 'buy'
                    ? 'linear-gradient(135deg, rgba(139,92,246,.15), rgba(99,102,241,.1))'
                    : 'rgba(255,255,255,.02)',
                border: u.state === 'done'
                  ? '1px solid rgba(163,230,53,.15)'
                  : u.state === 'buy'
                    ? '1px solid rgba(167,139,250,.25)'
                    : '1px solid rgba(255,255,255,.04)',
                opacity: u.state === 'done' ? 0.35 : u.state === 'buy' ? 1 : 0.2,
                transition: 'all .2s cubic-bezier(.4,0,.2,1)',
                flexShrink: 0,
                cursor: u.state === 'buy' ? 'pointer' : 'default',
                position: 'relative',
                backdropFilter: 'blur(8px)',
              }}
            >
              {u.state === 'done' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon size={13} color="#a3e635" />
                </div>
              )}
              <span style={{ opacity: u.state === 'done' ? 0.2 : 1 }}>{u.emoji}</span>
            </button>

            {/* Tooltip */}
            {hov === u.id && (
              <div style={{
                position: 'absolute', bottom: '115%', left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15,15,25,.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(167,139,250,.15)',
                borderRadius: 16, padding: '10px 14px', minWidth: 155,
                zIndex: 100, fontSize: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,.6)',
                pointerEvents: 'none', whiteSpace: 'nowrap',
              }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{u.name}</div>
                <div style={{ color: '#9ca3af', marginTop: 2 }}>{u.desc}</div>
                {u.state === 'buy' && (
                  <div style={{
                    color: '#a3e635', marginTop: 4,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11,
                  }}>✉ {fmt(u.cost)} — 可購買！</div>
                )}
                {u.state === 'wait' && (
                  <div style={{
                    color: '#f59e0b', marginTop: 4,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11,
                  }}>✉ {fmt(u.cost)} — 還差 {fmt(u.cost - reads)}</div>
                )}
                {u.req?.building && u.state !== 'done' && (
                  <div style={{ color: '#6b7280', marginTop: 2, fontSize: 10 }}>
                    需要 {BUILDINGS.find(b => b.id === u.req.building)?.name} ×{u.req.count}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
