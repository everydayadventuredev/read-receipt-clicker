import { useState, useRef, useEffect } from 'react';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';
import CheckIcon from './CheckIcon.jsx';

export default function UpgradeRow({ upgrades, reads, onBuy, onBuyAll, compact = false }) {
  const doneCount = upgrades.filter(u => u.state === 'done').length;
  const seenRef = useRef(new Set());
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    const freshIds = new Set();
    upgrades.forEach(u => {
      if ((u.state === 'buy' || u.state === 'wait') && !seenRef.current.has(u.id)) {
        freshIds.add(u.id);
        seenRef.current.add(u.id);
      }
    });
    if (freshIds.size > 0) {
      setNewIds(prev => {
        const merged = new Set(prev);
        freshIds.forEach(id => merged.add(id));
        return merged;
      });
      const timer = setTimeout(() => {
        setNewIds(prev => {
          const next = new Set(prev);
          freshIds.forEach(id => next.delete(id));
          return next;
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [upgrades]);

  const sorted = [...upgrades].sort((a, b) => {
    const order = { buy: 0, wait: 1, done: 2 };
    return (order[a.state] ?? 1) - (order[b.state] ?? 1);
  });

  const activeItems = compact ? sorted.filter(u => u.state !== 'done') : sorted;

  // Compact mode: 2-column grid of pills
  if (compact) {
    return (
      <div style={{ padding: '8px 10px 6px', flexShrink: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: '#4f46e5',
          marginBottom: 6, letterSpacing: 0.5,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 4px',
        }}>
          ⚡ 升級
          <span style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 12,
            color: '#94a3b8', fontWeight: 500,
          }}>{doneCount}/{upgrades.length}</span>
          <div style={{ flex: 1 }} />
          {activeItems.some(u => u.state === 'buy') && onBuyAll && (
            <button
              onClick={onBuyAll}
              style={{
                padding: '2px 8px', fontSize: 11, fontWeight: 700,
                color: '#10b981', background: 'rgba(16,185,129,.08)',
                border: '1px solid rgba(16,185,129,.2)',
                borderRadius: 6, cursor: 'pointer',
              }}
            >
              全買
            </button>
          )}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 4,
        }}>
          {activeItems.map(u => {
            const canBuy = u.state === 'buy';
            const isWait = u.state === 'wait';
            return (
              <button
                key={u.id}
                onClick={() => canBuy && onBuy(u)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 8,
                  background: canBuy ? 'linear-gradient(135deg, rgba(99,102,241,.04), rgba(168,85,247,.04))' : '#f8fafc',
                  border: canBuy ? '1px solid rgba(99,102,241,.2)' : '1px solid #e8eaed',
                  opacity: isWait ? 0.5 : 1,
                  cursor: canBuy ? 'pointer' : 'default',
                  textAlign: 'left', fontFamily: 'inherit',
                  transition: 'all .15s',
                  ...(canBuy ? { animation: 'glowPulse 2.5s ease-in-out infinite' } : {}),
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{u.emoji}</span>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#1e293b',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{u.name}</div>
                  <div style={{
                    fontSize: 11, color: canBuy ? '#6366f1' : '#94a3b8', fontWeight: 600,
                  }}>{u.desc}</div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: canBuy ? '#b45309' : '#cbd5e1',
                  fontFamily: "'JetBrains Mono',monospace",
                  flexShrink: 0,
                }}>{fmt(u.cost)}</span>
              </button>
            );
          })}
        </div>

        {doneCount > 0 && (
          <div style={{
            marginTop: 4, padding: '4px 10px',
            fontSize: 12, color: '#94a3b8', opacity: 0.6,
          }}>
            ✓ {doneCount}/{upgrades.length}
          </div>
        )}
      </div>
    );
  }

  // Non-compact mode (unused in current layout but preserved)
  return (
    <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        升級
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#94a3b8' }}>
          {doneCount}/{upgrades.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sorted.map(u => {
          const isDone = u.state === 'done';
          const canBuy = u.state === 'buy';
          const isWait = u.state === 'wait';
          const buildingName = u.req?.building ? BUILDINGS.find(b => b.id === u.req.building)?.name : null;

          if (isDone) {
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

          return (
            <button
              key={u.id}
              onClick={() => canBuy && onBuy(u)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: canBuy ? '#fff' : '#f8fafc',
                border: canBuy ? '1px solid rgba(99,102,241,.25)' : '1px solid #e2e8f0',
                opacity: isWait ? 0.55 : 1,
                cursor: canBuy ? 'pointer' : 'default',
                textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{u.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{u.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: canBuy ? '#b45309' : '#cbd5e1' }}>{fmt(u.cost)}</span>
                </div>
                <div style={{ fontSize: 12, color: canBuy ? '#6366f1' : '#94a3b8', marginTop: 2, fontWeight: 600 }}>{u.desc}</div>
                {isWait && buildingName && (
                  <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>
                    還差 {fmt(u.cost - reads)} · 需 {buildingName} ×{u.req.count}
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
