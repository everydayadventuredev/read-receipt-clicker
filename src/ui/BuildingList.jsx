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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {buildings.filter(b => unlockedBuildings.has(b.id)).map((b, i) => {
            const count = owned[b.id] ?? 0;
            const cost = buildingCostN(b, count, buyN);
            const canAfford = reads >= cost;
            const isNew = newBuildings.has(b.id);
            const hasAny = count > 0;
            const prodRate = b.baseProd * count;
            const Icon = BUILDING_ICONS[b.id];

            return (
              <button
                key={b.id}
                onClick={() => { onBuy(b, buyN); setLastBought(b.id); setTimeout(() => setLastBought(null), 400); }}
                disabled={!canAfford}
                onMouseEnter={() => canAfford && setHovered(b.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', alignItems: 'stretch',
                  width: '100%', padding: 0,
                  background: `linear-gradient(135deg, ${b.color}${hasAny ? '10' : '04'}, ${b.color}${hasAny ? '05' : '02'})`,
                  border: isNew
                    ? `1px solid ${b.color}55`
                    : canAfford
                      ? `1px solid ${b.color}20`
                      : '1px solid #e8eaed',
                  borderRadius: 10,
                  opacity: canAfford ? 1 : 0.4,
                  transition: 'all .15s',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: canAfford ? 'pointer' : 'default',
                  animation: isNew ? 'si .4s ease-out' : 'none',
                  boxShadow: lastBought === b.id
                    ? `0 0 0 2px ${b.color}44`
                    : hovered === b.id && canAfford
                      ? `0 3px 15px ${b.color}15`
                      : 'none',
                  transform: lastBought === b.id ? 'scale(1.01)' : 'none',
                }}
              >
                {/* Scattered icon crowd background */}
                {hasAny && Icon && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'center',
                    gap: 0, padding: '2px 70px 2px 68px',
                    pointerEvents: 'none', overflow: 'hidden',
                  }}>
                    {Array.from({ length: Math.min(count, 50) }, (_, j) => {
                      const rot = ((j * 13 + 7) % 25) - 12;
                      const opa = 0.03 + Math.min(0.07, count * 0.001);
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

                {/* Left icon area */}
                <div style={{
                  width: 64, minHeight: 64,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${b.color}${hasAny ? '12' : '06'}`,
                  borderRight: `1px solid ${b.color}10`,
                  flexShrink: 0,
                  position: 'relative',
                }}>
                  {Icon ? (
                    <Icon size={36} color={b.color} />
                  ) : (
                    <span style={{ fontSize: 28 }}>{b.emoji}</span>
                  )}
                </div>

                {/* Info column */}
                <div style={{
                  flex: 1, padding: '8px 12px', minWidth: 0,
                  position: 'relative', zIndex: 1,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  {/* Row 1: Name */}
                  <div style={{
                    fontSize: 15, fontWeight: 800, color: '#1e293b',
                    lineHeight: 1.2,
                  }}>{b.name}</div>

                  {/* Row 2: Description — the humor */}
                  <div style={{
                    fontSize: 11, color: '#64748b', marginTop: 2,
                    lineHeight: 1.3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{b.desc}</div>

                  {/* Row 3: Cost + prod rate */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: canAfford ? '#b45309' : '#cbd5e1',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                      {fmt(cost)}{buyN > 1 ? ` (×${buyN})` : ''}
                    </span>
                    <span style={{
                      fontSize: 10, color: '#94a3b8',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>
                      {hasAny ? `${fmt(prodRate)}/s` : `+${fmt(b.baseProd)}/s`}
                    </span>
                  </div>
                </div>

                {/* Right — big count number */}
                <div style={{
                  minWidth: 56, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  paddingRight: 12,
                  position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    fontSize: hasAny ? 28 : 16, fontWeight: 900,
                    color: hasAny ? b.color : '#cbd5e1',
                    fontFamily: "'Space Grotesk','JetBrains Mono',monospace",
                    lineHeight: 1, opacity: hasAny ? 0.8 : 0.4,
                  }}>{count}</div>
                </div>

                {/* NEW badge */}
                {isNew && (
                  <div style={{
                    position: 'absolute', top: 4, right: 8,
                    background: b.color, color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '2px 8px', borderRadius: 6, zIndex: 2,
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
