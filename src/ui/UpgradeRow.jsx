import { useState, useRef, useEffect } from 'react';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';
import CheckIcon from './CheckIcon.jsx';

export default function UpgradeRow({ upgrades, reads, onBuy, compact = false }) {
  const doneCount = upgrades.filter(u => u.state === 'done').length;
  const seenRef = useRef(new Set());
  const [newIds, setNewIds] = useState(new Set());

  // Track newly visible (buy/wait) upgrades for slide-in animation
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

  // Sort: buy first, wait second, done last
  const sorted = [...upgrades].sort((a, b) => {
    const order = { buy: 0, wait: 1, done: 2 };
    return (order[a.state] ?? 1) - (order[b.state] ?? 1);
  });

  // In compact mode, separate done items from active items
  const activeItems = compact ? sorted.filter(u => u.state !== 'done') : sorted;

  return (
    <div style={{ padding: compact ? '6px 10px 4px' : '10px 12px 8px', flexShrink: 0 }}>
      {/* Section header */}
      <div style={{
        fontSize: compact ? 10 : 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
        ...(compact ? { padding: '6px 12px 4px' } : {}),
      }}>
        升級
        <span style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
          color: '#94a3b8',
        }}>{doneCount}/{upgrades.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 3 : 4 }}>
        {activeItems.map(u => {
          const isDone = u.state === 'done';
          const canBuy = u.state === 'buy';
          const isWait = u.state === 'wait';
          const isNew = newIds.has(u.id);
          const buildingName = u.req?.building ? BUILDINGS.find(b => b.id === u.req.building)?.name : null;

          if (isDone) {
            // Compact done row (only rendered in non-compact mode)
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
                width: '100%', padding: compact ? '6px 10px' : '10px 12px', borderRadius: 10,
                background: canBuy ? '#fff' : '#f8fafc',
                border: canBuy ? '1px solid rgba(99,102,241,.25)' : '1px solid #e2e8f0',
                opacity: isWait ? 0.55 : 1,
                cursor: canBuy ? 'pointer' : 'default',
                textAlign: 'left',
                transition: 'all .15s',
                fontFamily: 'inherit',
                ...(canBuy ? { animation: 'glowPulse 2.5s ease-in-out infinite' } : {}),
                ...(isNew ? { animation: 'slideIn .4s cubic-bezier(.25,.46,.45,.94) forwards' } : {}),
              }}
            >
              {/* Emoji - larger for visual weight */}
              <span style={{ fontSize: compact ? 16 : 22, lineHeight: 1, flexShrink: 0, marginTop: 0 }}>{u.emoji}</span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: '#1e293b' }}>{u.name}</span>
                  <span style={{
                    fontSize: canBuy ? (compact ? 12 : 13) : 11,
                    fontWeight: canBuy ? 800 : 700,
                    fontFamily: "'JetBrains Mono',monospace",
                    color: canBuy ? '#b45309' : '#cbd5e1',
                    transition: 'font-size .2s ease, font-weight .2s ease',
                  }}>{fmt(u.cost)}</span>
                </div>
                {!compact && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{u.desc}</div>}
                {isWait && (
                  <div style={{
                    fontSize: compact ? 9 : 10, color: '#f59e0b', marginTop: 3,
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

        {/* Compact mode: single summary line for done items */}
        {compact && doneCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 8px', borderRadius: 8,
            background: '#f8fafc', opacity: 0.5,
            fontSize: 11, color: '#94a3b8',
          }}>
            ✓ 已完成 {doneCount}/{upgrades.length}
          </div>
        )}
      </div>
    </div>
  );
}
