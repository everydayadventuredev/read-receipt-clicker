import { useState } from 'react';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';
import CheckIcon from './CheckIcon.jsx';

export default function UpgradeRow({ upgrades, reads, onBuy }) {
  const [hov, setHov] = useState(null);
  const doneCount = upgrades.filter(u => u.state === 'done').length;

  return (
    <div style={{
      padding: '10px 16px 8px',
      flexShrink: 0,
    }}>
      {/* Section header */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 13 }}>⬆</span> 升級
        <span style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
          color: '#94a3b8',
        }}>{doneCount}/{upgrades.length}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
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
                  ? '#f0fdf4'
                  : u.state === 'buy'
                    ? '#fff'
                    : '#f8fafc',
                border: u.state === 'done'
                  ? '1px solid #bbf7d0'
                  : u.state === 'buy'
                    ? '1px solid rgba(167,139,250,.3)'
                    : '1px solid #e2e8f0',
                opacity: u.state === 'done' ? 0.5 : u.state === 'buy' ? 1 : 0.3,
                boxShadow: u.state === 'buy' ? '0 1px 4px rgba(139,92,246,.08)' : 'none',
                transition: 'all .2s cubic-bezier(.4,0,.2,1)',
                flexShrink: 0,
                cursor: u.state === 'buy' ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              {u.state === 'done' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon size={13} color="#65a30d" />
                </div>
              )}
              <span style={{ opacity: u.state === 'done' ? 0.2 : 1 }}>{u.emoji}</span>
            </button>

            {/* Tooltip */}
            {hov === u.id && (
              <div style={{
                position: 'absolute', bottom: '115%', left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16, padding: '10px 14px', minWidth: 155,
                zIndex: 100, fontSize: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,.12)',
                pointerEvents: 'none', whiteSpace: 'nowrap',
              }}>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{u.name}</div>
                <div style={{ color: '#64748b', marginTop: 2 }}>{u.desc}</div>
                {u.state === 'buy' && (
                  <div style={{
                    color: '#65a30d', marginTop: 4,
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
                  <div style={{ color: '#94a3b8', marginTop: 2, fontSize: 10 }}>
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
