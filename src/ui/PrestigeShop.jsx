import { useState, useRef, useEffect } from 'react';
import { PRESTIGE_UPGRADES } from '../game/prestige.js';

export default function PrestigeShop({ prestigePower, boughtPrestige, onBuy }) {
  const [hovered, setHovered] = useState(null);
  const [justBought, setJustBought] = useState(new Set());
  const prevBoughtRef = useRef(new Set());

  // Detect newly purchased upgrades for smooth transition
  useEffect(() => {
    const newlyBought = new Set();
    boughtPrestige.forEach(id => {
      if (!prevBoughtRef.current.has(id)) {
        newlyBought.add(id);
      }
    });
    if (newlyBought.size > 0) {
      setJustBought(newlyBought);
      const timer = setTimeout(() => setJustBought(new Set()), 700);
      prevBoughtRef.current = new Set(boughtPrestige);
      return () => clearTimeout(timer);
    }
    prevBoughtRef.current = new Set(boughtPrestige);
  }, [boughtPrestige]);

  if (!PRESTIGE_UPGRADES.length) {
    return (
      <div style={{
        textAlign: 'center', color: 'var(--text-muted)',
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
      {/* Header with prominent balance */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10, padding: '0 2px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
          ✦ 已讀之力商店
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, fontWeight: 700, color: 'var(--purple-text)',
          background: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.12))',
          padding: '3px 10px', borderRadius: 10,
          border: '1px solid rgba(99,102,241,.2)',
          letterSpacing: 0.5,
          textShadow: '0 0 8px rgba(99,102,241,.15)',
        }}>
          ✦ {prestigePower}
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
          const wasJustBought = justBought.has(up.id);

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
                  ? '1px solid var(--border)'
                  : canBuy
                    ? '1.5px solid #6366f1'
                    : '1px solid var(--border)',
                borderRadius: 12,
                padding: '10px 10px 8px',
                cursor: canBuy ? 'pointer' : 'default',
                opacity: bought ? 0.55 : canBuy ? 1 : 0.7,
                boxShadow: isHovered
                  ? '0 2px 8px rgba(99,102,241,.15)'
                  : '0 1px 3px rgba(0,0,0,.04)',
                transition: 'all .3s ease',
                transform: isHovered ? 'translateY(-1px)' : 'none',
                userSelect: 'none',
                ...(canBuy ? { animation: 'prestigeGlowPulse 2.5s ease-in-out infinite' } : {}),
                ...(wasJustBought ? { animation: 'fadeToGray .7s ease-out forwards' } : {}),
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
                fontSize: 13, fontWeight: 700, color: 'var(--text)',
                marginBottom: 2, lineHeight: 1.3,
              }}>
                {up.name}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 11, color: 'var(--text-secondary)',
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
                  <span style={{ color: 'var(--purple-text)' }}>
                    ✦{up.cost}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>
                    ✦{up.cost}
                    <span style={{
                      marginLeft: 4, fontSize: 10,
                      fontWeight: 400, color: 'var(--amber-text)',
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
