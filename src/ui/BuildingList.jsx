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
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                title={b.desc}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '6px 10px',
                  background: '#fff',
                  border: isNew
                    ? `1px solid ${b.color}44`
                    : canAfford
                      ? '1px solid rgba(99,102,241,.2)'
                      : '1px solid #e2e8f0',
                  borderRadius: 8,
                  opacity: canAfford ? 1 : 0.4,
                  transition: 'all .15s',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: canAfford ? 'pointer' : 'default',
                  animation: isNew ? 'si .4s ease-out' : 'none',
                  boxShadow: lastBought === b.id
                    ? '0 0 0 2px rgba(217,119,6,.3)'
                    : hovered === b.id && canAfford
                      ? '0 2px 8px rgba(0,0,0,.08)'
                      : 'none',
                  transform: lastBought === b.id ? 'scale(1.01)' : 'none',
                }}
              >
                {/* Left accent bar */}
                {hasAny && (
                  <div style={{
                    position: 'absolute', left: 0, top: 4, bottom: 4,
                    width: 3, borderRadius: 3,
                    background: b.color,
                  }} />
                )}

                {/* Watermark icon */}
                {BUILDING_ICONS[b.id] && (
                  <div style={{
                    position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)',
                    opacity: hasAny ? 0.08 : 0.03,
                    pointerEvents: 'none',
                  }}>
                    {(() => { const Icon = BUILDING_ICONS[b.id]; return <Icon size={36} color={b.color} />; })()}
                  </div>
                )}

                {/* NEW badge */}
                {isNew && (
                  <div style={{
                    position: 'absolute', top: 3, right: 6,
                    background: b.color, color: '#fff', fontSize: 8, fontWeight: 800,
                    padding: '1px 5px', borderRadius: 4, zIndex: 2,
                  }}>NEW</div>
                )}

                {/* Name */}
                <span style={{
                  color: '#1e293b', fontWeight: 700, fontSize: 13,
                  minWidth: 65, position: 'relative', zIndex: 1,
                  paddingLeft: hasAny ? 4 : 0,
                }}>{b.name}</span>

                {/* Cost */}
                <span style={{
                  color: canAfford ? '#b45309' : '#cbd5e1',
                  fontSize: 11, fontWeight: 700,
                  fontFamily: "'JetBrains Mono',monospace",
                  minWidth: 60, position: 'relative', zIndex: 1,
                }}>
                  {fmt(cost)}{buyN > 1 ? `(×${buyN})` : ''}
                </span>

                {/* Spacer */}
                <span style={{ flex: 1 }} />

                {/* Prod rate */}
                <span style={{
                  color: '#94a3b8', fontSize: 10,
                  fontFamily: "'JetBrains Mono',monospace",
                  position: 'relative', zIndex: 1,
                }}>
                  {hasAny ? `${fmt(prodRate)}/s` : `+${fmt(b.baseProd)}/s`}
                </span>

                {/* Count badge */}
                <span style={{
                  color: hasAny ? '#059669' : '#94a3b8',
                  fontSize: 11, fontFamily: "'JetBrains Mono',monospace",
                  background: hasAny ? '#fffbeb' : '#f8fafc',
                  padding: '1px 6px', borderRadius: 6,
                  border: hasAny ? '1px solid #fde68a' : '1px solid #e2e8f0',
                  minWidth: 30, textAlign: 'center',
                  position: 'relative', zIndex: 1,
                }}>×{count}</span>
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
