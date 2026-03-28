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
        padding: '8px 12px 6px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{
          fontSize: 11, color: '#64748b', fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>
          已讀大師
        </div>
        <div style={{
          display: 'flex', gap: 2,
          background: '#f1f5f9',
          borderRadius: 8, padding: 2,
          border: '1px solid #e2e8f0',
        }}>
          {[1, 10, 100].map(n => (
            <button
              key={n}
              onClick={() => setBuyN(n)}
              style={{
                fontSize: 10, padding: '5px 10px', borderRadius: 6, border: 'none',
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 6px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {buildings.filter(b => unlockedBuildings.has(b.id)).map((b, i) => {
            const count = owned[b.id] ?? 0;
            const cost = buildingCostN(b, count, buyN);
            const canAfford = reads >= cost;
            const isNew = newBuildings.has(b.id);
            const hasAny = count > 0;
            const prodRate = b.baseProd * count;
            // Background density: opacity increases with count (0.03 → 0.15)
            const densityOpacity = Math.min(0.15, 0.03 + count * 0.003);
            const Icon = BUILDING_ICONS[b.id];

            return (
              <button
                key={b.id}
                onClick={() => { onBuy(b, buyN); setLastBought(b.id); setTimeout(() => setLastBought(null), 400); }}
                disabled={!canAfford}
                onMouseEnter={() => canAfford && setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                title={b.desc}
                style={{
                  display: 'flex', alignItems: 'center',
                  width: '100%', padding: 0,
                  background: `linear-gradient(135deg, ${b.color}${hasAny ? '12' : '04'}, ${b.color}${hasAny ? '06' : '02'})`,
                  border: isNew
                    ? `1px solid ${b.color}55`
                    : canAfford
                      ? `1px solid ${b.color}25`
                      : '1px solid #e8eaed',
                  borderRadius: 8,
                  opacity: canAfford ? 1 : 0.45,
                  transition: 'all .15s',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: canAfford ? 'pointer' : 'default',
                  animation: isNew ? 'si .4s ease-out' : 'none',
                  boxShadow: lastBought === b.id
                    ? `0 0 0 2px ${b.color}44`
                    : hovered === b.id && canAfford
                      ? `0 2px 12px ${b.color}18`
                      : 'none',
                  transform: lastBought === b.id ? 'scale(1.01)' : 'none',
                  minHeight: 54,
                }}
              >
                {/* Scattered icon crowd background — density grows with count */}
                {hasAny && Icon && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'center',
                    gap: 0, padding: '2px 60px 2px 58px',
                    pointerEvents: 'none', overflow: 'hidden',
                  }}>
                    {Array.from({ length: Math.min(count, 40) }, (_, j) => {
                      const rot = ((j * 13 + 7) % 25) - 12;
                      const opa = 0.04 + Math.min(0.08, count * 0.001);
                      return (
                        <span key={j} style={{
                          display: 'inline-flex',
                          transform: `rotate(${rot}deg)`,
                          opacity: opa,
                          flexShrink: 0,
                        }}>
                          <Icon size={14} color={b.color} />
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Left icon area — large, themed */}
                <div style={{
                  width: 54, minHeight: 54,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${b.color}${hasAny ? '15' : '08'}`,
                  borderRight: `1px solid ${b.color}15`,
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  {Icon ? (
                    <Icon size={32} color={b.color} />
                  ) : (
                    <span style={{ fontSize: 24 }}>{b.emoji}</span>
                  )}
                  {/* Mini crowd overlay for high counts */}
                  {count >= 10 && Icon && (
                    <div style={{
                      position: 'absolute', bottom: 2, right: 2,
                      display: 'flex', gap: 0,
                    }}>
                      {Array.from({ length: Math.min(3, Math.floor(count / 10)) }, (_, j) => (
                        <span key={j} style={{ opacity: 0.3 + j * 0.1, display: 'inline-flex' }}>
                          <Icon size={8} color={b.color} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info column */}
                <div style={{
                  flex: 1, padding: '6px 10px', minWidth: 0,
                  position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: '#1e293b',
                    lineHeight: 1.2,
                  }}>{b.name}</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, marginTop: 2,
                    color: canAfford ? '#b45309' : '#cbd5e1',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>
                    {fmt(cost)}{buyN > 1 ? ` (×${buyN})` : ''}
                    <span style={{
                      color: '#94a3b8', fontWeight: 400, marginLeft: 6, fontSize: 10,
                    }}>
                      {hasAny ? `${fmt(prodRate)}/s` : `+${fmt(b.baseProd)}/s`}
                    </span>
                  </div>
                </div>

                {/* Right — big count number (Cookie Clicker style) */}
                <div style={{
                  minWidth: 48, textAlign: 'right', paddingRight: 10,
                  position: 'relative', zIndex: 1,
                }}>
                  {hasAny && (
                    <div style={{
                      fontSize: 22, fontWeight: 900, color: b.color,
                      fontFamily: "'Space Grotesk','JetBrains Mono',monospace",
                      lineHeight: 1, opacity: 0.7,
                    }}>{count}</div>
                  )}
                </div>

                {/* NEW badge */}
                {isNew && (
                  <div style={{
                    position: 'absolute', top: 4, right: 8,
                    background: b.color, color: '#fff', fontSize: 8, fontWeight: 800,
                    padding: '1px 6px', borderRadius: 4, zIndex: 2,
                  }}>NEW</div>
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
