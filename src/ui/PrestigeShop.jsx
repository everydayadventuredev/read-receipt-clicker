import { useState } from 'react';
import { PRESTIGE_UPGRADES } from '../game/prestige.js';

export default function PrestigeShop({ prestigePower, boughtPrestige, onBuy }) {
  const [hovered, setHovered] = useState(null);

  if (!PRESTIGE_UPGRADES.length) {
    return (
      <div style={{
        textAlign: 'center', color: '#94a3b8',
        fontSize: 13, padding: '32px 16px',
      }}>
        尚無可用的已讀之力升級
      </div>
    );
  }

  const sorted = [...PRESTIGE_UPGRADES].sort((a, b) => {
    const aBought = boughtPrestige.has(a.id);
    const bBought = boughtPrestige.has(b.id);
    if (aBought !== bBought) return aBought ? 1 : -1;
    const aAfford = prestigePower >= a.cost;
    const bAfford = prestigePower >= b.cost;
    if (aAfford !== bAfford) return aAfford ? -1 : 1;
    return a.cost - b.cost;
  });

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10, padding: '0 2px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
          ✦ 已讀之力商店
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, fontWeight: 600, color: '#4f46e5',
          background: 'rgba(99,102,241,.08)',
          padding: '2px 8px', borderRadius: 8,
        }}>
          ✦{prestigePower}
        </span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 8,
      }}>
        {sorted.map((up) => {
          const bought = boughtPrestige.has(up.id);
          const canBuy = !bought && prestigePower >= up.cost;
          const deficit = !bought ? up.cost - prestigePower : 0;
          const isHovered = hovered === up.id && canBuy;

          return (
            <div
              key={up.id}
              onClick={() => canBuy && onBuy(up)}
              onMouseEnter={() => setHovered(up.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                position: 'relative',
                background: bought
                  ? '#f8fafc'
                  : isHovered
                    ? '#eef2ff'
                    : '#fff',
                border: bought
                  ? '1px solid #e2e8f0'
                  : canBuy
                    ? '1.5px solid #6366f1'
                    : '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '10px 10px 8px',
                cursor: canBuy ? 'pointer' : 'default',
                opacity: bought ? 0.55 : canBuy ? 1 : 0.7,
                boxShadow: isHovered
                  ? '0 2px 8px rgba(99,102,241,.15)'
                  : '0 1px 3px rgba(0,0,0,.04)',
                transition: 'all .15s',
                transform: isHovered ? 'translateY(-1px)' : 'none',
                userSelect: 'none',
              }}
            >
              {/* Bought badge */}
              {bought && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  fontSize: 10, color: '#16a34a',
                  display: 'flex', alignItems: 'center', gap: 2,
                }}>
                  <span style={{ fontSize: 12 }}>✓</span>
                  <span>已購買</span>
                </div>
              )}

              {/* Emoji */}
              <div style={{ fontSize: 24, lineHeight: 1, marginBottom: 4 }}>
                {up.emoji}
              </div>

              {/* Name */}
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#1e293b',
                marginBottom: 2, lineHeight: 1.3,
              }}>
                {up.name}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 11, color: '#64748b',
                lineHeight: 1.35, marginBottom: 6,
              }}>
                {up.desc}
              </div>

              {/* Cost / Status */}
              <div style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}>
                {bought ? null : canBuy ? (
                  <span style={{ color: '#4f46e5' }}>
                    ✦{up.cost}
                  </span>
                ) : (
                  <span style={{ color: '#94a3b8' }}>
                    ✦{up.cost}
                    <span style={{
                      marginLeft: 4, fontSize: 10,
                      fontWeight: 400, color: '#b45309',
                    }}>
                      還差 ✦{deficit}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
