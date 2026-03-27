import { useState } from 'react';
import { fmt, buildingCostN } from '../utils/format.js';
import { BUILDING_ICONS } from './PixelIcons.jsx';

export default function BuildingList({ buildings, owned, reads, unlockedBuildings, newBuildings, buyN, onBuy, setBuyN }) {
  const [lastBought, setLastBought] = useState(null);
  const [hovered, setHovered] = useState(null);

  const visibleBuildings = buildings.filter(b => unlockedBuildings.has(b.id));
  const noneAffordable = visibleBuildings.length > 0 && visibleBuildings.every(b => {
    const count = owned[b.id] ?? 0;
    const cost = buildingCostN(b, count, buyN);
    return reads < cost;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      {/* Header with bulk buy */}
      <div style={{
        padding: '12px 16px 8px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{
          fontSize: 12, color: '#64748b', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 6,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          已讀大師
        </div>
        <div style={{
          display: 'flex', gap: 3,
          background: '#f1f5f9',
          borderRadius: 12, padding: 3,
          border: '1px solid #e2e8f0',
        }}>
          {[1, 10, 100].map(n => (
            <button
              key={n}
              onClick={() => setBuyN(n)}
              style={{
                fontSize: 11, padding: '8px 14px', borderRadius: 10, border: 'none',
                background: buyN === n
                  ? 'linear-gradient(135deg, #6366f1, #4338ca)'
                  : 'transparent',
                color: buyN === n ? '#fff' : '#94a3b8',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono',monospace",
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >×{n}</button>
          ))}
        </div>
      </div>

      {/* Building list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {buildings.filter(b => unlockedBuildings.has(b.id)).map((b, i) => {
            const count = owned[b.id] ?? 0;
            const cost = buildingCostN(b, count, buyN);
            const canAfford = reads >= cost;
            const isNew = newBuildings.has(b.id);
            const hasAny = count > 0;
            const prodRate = b.baseProd * count;

            return (
              <button
                key={b.id}
                onClick={() => { onBuy(b, buyN); setLastBought(b.id); setTimeout(() => setLastBought(null), 400); }}
                disabled={!canAfford}
                onMouseEnter={() => canAfford && setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: hasAny ? '14px 16px 24px' : '14px 16px',
                  background: '#fff',
                  border: isNew
                    ? `1px solid ${b.color}44`
                    : canAfford
                      ? '1px solid rgba(99,102,241,.3)'
                      : '1px solid #e2e8f0',
                  borderRadius: 12,
                  opacity: canAfford ? 1 : 0.45,
                  transition: 'all .2s cubic-bezier(.4,0,.2,1)',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: canAfford ? 'pointer' : 'default',
                  animation: isNew ? 'si .4s ease-out' : 'none',
                  boxShadow: lastBought === b.id
                    ? '0 0 0 3px rgba(217,119,6,.3), 0 1px 3px rgba(0,0,0,.04)'
                    : hovered === b.id && canAfford
                      ? '0 4px 12px rgba(0,0,0,.08)'
                      : '0 1px 3px rgba(0,0,0,.04)',
                  transform: lastBought === b.id
                    ? 'scale(1.02)'
                    : hovered === b.id && canAfford
                      ? 'translateY(-2px)'
                      : 'none',
                }}
              >
                {/* Left accent bar */}
                {hasAny && (
                  <div style={{
                    position: 'absolute', left: 0, top: 8, bottom: 8,
                    width: 3, borderRadius: 3,
                    background: `linear-gradient(180deg, ${b.color}, ${b.color}44)`,
                  }} />
                )}

                {/* NEW badge */}
                {isNew && (
                  <div style={{
                    position: 'absolute', top: 6, right: 10,
                    background: `linear-gradient(135deg, ${b.color}, ${b.color}aa)`,
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '2px 8px', borderRadius: 8,
                    boxShadow: `0 2px 8px ${b.color}33`,
                  }}>NEW</div>
                )}

                {/* Pixel art icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `linear-gradient(135deg, ${b.color}10, ${b.color}08)`,
                  border: `1px solid ${b.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  animation: hasAny ? `wg 3s ease-in-out infinite ${i * 0.3}s` : 'none',
                }}>
                  {BUILDING_ICONS[b.id]
                    ? (() => { const Icon = BUILDING_ICONS[b.id]; return <Icon size={32} color={b.color} />; })()
                    : <span style={{ fontSize: 22 }}>{b.emoji}</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700, fontSize: 14 }}>{b.name}</span>
                    <span style={{
                      color: hasAny ? '#059669' : '#94a3b8',
                      fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                      background: hasAny ? '#fffbeb' : '#f8fafc',
                      padding: '2px 8px', borderRadius: 8,
                      border: hasAny ? '1px solid #fde68a' : '1px solid #e2e8f0',
                    }}>×{count}</span>
                  </div>
                  <div style={{
                    color: '#94a3b8', fontSize: 11, marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{b.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                    <span style={{
                      color: canAfford ? '#b45309' : '#cbd5e1',
                      fontSize: 12, fontWeight: 700,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                      {fmt(cost)}{buyN > 1 ? ` (×${buyN})` : ''}
                    </span>
                    <span style={{
                      color: '#94a3b8', fontSize: 10,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                      {hasAny ? `${fmt(prodRate)}/s` : `+${fmt(b.baseProd)}/s each`}
                    </span>
                  </div>
                </div>

                {/* Mini icon crowd */}
                {hasAny && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 1,
                    background: `${b.color}06`,
                    borderTop: `1px solid ${b.color}08`,
                    borderRadius: '0 0 12px 12px',
                    overflow: 'hidden',
                  }}>
                    {Array.from({ length: Math.min(count, 15) }, (_, j) => {
                      const Icon = BUILDING_ICONS[b.id];
                      const rotation = ((j * 7 + 3) % 11) - 5;
                      return Icon ? (
                        <span key={j} style={{
                          display: 'inline-flex', opacity: 0.5 + (j % 3) * 0.15,
                          transform: `rotate(${rotation}deg)`,
                          flexShrink: 0,
                        }}>
                          <Icon size={12} color={b.color} />
                        </span>
                      ) : null;
                    })}
                    {count > 15 && (
                      <span style={{
                        fontSize: 9, color: b.color, fontWeight: 700, opacity: 0.6,
                        fontFamily: "'JetBrains Mono',monospace",
                        marginLeft: 2,
                      }}>+{count - 15}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
          {reads > 0 && noneAffordable && (
            <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
              繼續點擊，很快就能招募第一個已讀大師
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
