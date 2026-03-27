import { useState } from 'react';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';
import CheckIcon from './CheckIcon.jsx';

export default function UpgradeRow({ upgrades, reads, onBuy }) {
  const doneCount = upgrades.filter(u => u.state === 'done').length;

  // Sort: buy first, wait second, done last
  const sorted = [...upgrades].sort((a, b) => {
    const order = { buy: 0, wait: 1, done: 2 };
    return (order[a.state] ?? 1) - (order[b.state] ?? 1);
  });

  return (
    <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
      {/* Section header */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        升級
        <span style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
          color: '#94a3b8',
        }}>{doneCount}/{upgrades.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sorted.map(u => {
          const isDone = u.state === 'done';
          const canBuy = u.state === 'buy';
          const isWait = u.state === 'wait';
          const buildingName = u.req?.building ? BUILDINGS.find(b => b.id === u.req.building)?.name : null;

          if (isDone) {
            // Compact done row
            return (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 8px', borderRadius: 8,
                background: '#f8fafc', opacity: 0.5,
                fontSize: 11, color: '#94a3b8',
              }}>
                <CheckIcon size={10} color="#059669" />
                <span>{u.emoji}</span>
                <span>{u.name}</span>
              </div>
            );
          }

          // Buyable or waiting card
          return (
            <button
              key={u.id}
              onClick={() => canBuy && onBuy(u)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: canBuy ? '#fff' : '#f8fafc',
                border: canBuy ? '1px solid rgba(99,102,241,.25)' : '1px solid #e2e8f0',
                boxShadow: canBuy ? '0 1px 3px rgba(99,102,241,.06)' : 'none',
                opacity: isWait ? 0.55 : 1,
                cursor: canBuy ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'all .15s',
                fontFamily: 'inherit',
              }}
            >
              {/* Emoji */}
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{u.emoji}</span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{u.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    fontFamily: "'JetBrains Mono',monospace",
                    color: canBuy ? '#b45309' : '#cbd5e1',
                  }}>{fmt(u.cost)}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{u.desc}</div>
                {isWait && (
                  <div style={{
                    fontSize: 10, color: '#f59e0b', marginTop: 3,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>
                    還差 {fmt(u.cost - reads)}
                    {buildingName && u.req?.count && ` · 需 ${buildingName} ×${u.req.count}`}
                  </div>
                )}
                {canBuy && buildingName && u.req?.count && (
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>
                    需 {buildingName} ×{u.req.count}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
