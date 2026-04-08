import { useState, useRef, useEffect } from 'react';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';
import CheckIcon from './CheckIcon.jsx';

const UPGRADE_TIPS = [
  '已讀是一門藝術，升級是修行。',
  '投資效率，永遠不虧。',
  '有時候不回覆，比回覆更有力量。',
  '每一次升級，都是對社交焦慮的勝利。',
  '「我手機壞了」——進階版藉口需要升級。',
  '已讀之道，在於精進。',
  '速度決定一切：越快已讀，越顯冷漠。',
  '省下的表情符號，都是你的資產。',
];

function getEffectLabel(u) {
  if (u.type === 'm' && u.target) {
    const b = BUILDINGS.find(b => b.id === u.target);
    return `${b?.name ?? u.target} ×${u.bonus}`;
  }
  if (u.type === 'g') return `全局產能 ×${u.bonus}`;
  if (u.type === 'ck') return `點擊 +${u.bonus}`;
  if (u.type === 'cp') return `點擊 +${(u.bonus * 100).toFixed(0)}% CPS`;
  return u.desc;
}

/** Extract flavor text after — separator in desc */
function getFlavor(u) {
  if (!u.desc || !u.desc.includes('—')) return null;
  return u.desc.split('—')[1].trim();
}

export default function UpgradeRow({ upgrades, reads, onBuy, onBuyAll, compact = false }) {
  const doneCount = upgrades.filter(u => u.state === 'done').length;
  const seenRef = useRef(new Set());
  const [newIds, setNewIds] = useState(new Set());
  const [hoveredUpgrade, setHoveredUpgrade] = useState(null);

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

  // Compact mode: icon grid with hover tooltips
  if (compact) {
    return (
      <div style={{ padding: '6px 10px', flexShrink: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#4f46e5',
          marginBottom: 4, letterSpacing: 0.5,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 2px',
        }}>
          ⚡ 升級
          <span style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
            color: 'var(--text-muted)', fontWeight: 500,
          }}>{doneCount}/{upgrades.length}</span>
          <div style={{ flex: 1 }} />
          {activeItems.some(u => u.state === 'buy') && onBuyAll && (
            <button
              onClick={onBuyAll}
              style={{
                padding: '4px 8px', fontSize: 10, fontWeight: 700,
                color: '#10b981', background: 'rgba(16,185,129,.08)',
                border: '1px solid rgba(16,185,129,.2)',
                borderRadius: 4, cursor: 'pointer', minHeight: 28,
              }}
            >
              全買
            </button>
          )}
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 3,
        }}>
          {activeItems.map(u => {
            const canBuy = u.state === 'buy';
            const isWait = u.state === 'wait';
            const isHovered = hoveredUpgrade === u.id;
            return (
              <div key={u.id} style={{ position: 'relative' }}>
                <button
                  onClick={() => canBuy && onBuy(u)}
                  onMouseEnter={() => setHoveredUpgrade(u.id)}
                  onMouseLeave={() => setHoveredUpgrade(null)}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, lineHeight: 1,
                    background: canBuy
                      ? 'linear-gradient(135deg, rgba(99,102,241,.08), rgba(168,85,247,.06))'
                      : '#f8fafc',
                    border: canBuy ? '1.5px solid rgba(99,102,241,.3)' : '1px solid #e8eaed',
                    opacity: isWait ? 0.4 : 1,
                    cursor: canBuy ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    transition: 'all .15s',
                    boxShadow: canBuy ? '0 1px 4px rgba(99,102,241,.1)' : 'none',
                    transform: isHovered ? 'scale(1.12)' : 'none',
                    ...(canBuy && !isHovered ? { animation: 'glowPulse 2.5s ease-in-out infinite' } : {}),
                  }}
                >
                  {u.emoji}
                </button>
                {/* Styled tooltip */}
                {isHovered && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: '50%',
                    transform: 'translateX(-50%)', marginBottom: 6,
                    background: 'rgba(15,23,42,.92)', color: '#fff',
                    padding: '8px 12px', borderRadius: 8,
                    fontSize: 11, whiteSpace: 'nowrap', zIndex: 100,
                    pointerEvents: 'none', lineHeight: 1.6,
                    boxShadow: '0 4px 12px rgba(0,0,0,.2)',
                    minWidth: 140,
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{u.name}</div>
                    <div style={{ color: canBuy ? '#a5b4fc' : '#94a3b8', fontWeight: 600 }}>{getEffectLabel(u)}</div>
                    <div style={{
                      color: canBuy ? '#fbbf24' : '#64748b',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 700, marginTop: 2,
                    }}>{fmt(u.cost)} 已讀</div>
                    {/* Arrow */}
                    <div style={{
                      position: 'absolute', top: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0, height: 0,
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: '5px solid rgba(15,23,42,.92)',
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Non-compact mode (unused in current layout but preserved)
  return (
    <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        升級
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-muted)' }}>
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
                fontSize: 11, color: 'var(--text-muted)',
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
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{u.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", color: canBuy ? 'var(--amber-text)' : 'var(--text-disabled)' }}>{fmt(u.cost)}</span>
                </div>
                <div style={{ fontSize: 12, color: canBuy ? '#6366f1' : 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>{u.desc}</div>
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
