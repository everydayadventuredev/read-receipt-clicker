import { useState } from 'react';
import { fmt, buildingCostN } from '../utils/format.js';
import { BUILDING_ICONS } from './PixelIcons.jsx';

/**
 * Cookie Clicker-style horizontal building bar.
 * Info on the left, emoji crowd fills remaining space to the right.
 */
function BuildingBar({ b, count, cost, prodRate, canAfford, buyN, isNew, onBuy, lastBought, hovered, onHover, onLeave }) {
  const hasAny = count > 0;
  const Icon = BUILDING_ICONS[b.id];

  return (
    <button
      onClick={() => { onBuy(); }}
      disabled={!canAfford}
      onMouseEnter={() => canAfford && onHover()}
      onMouseLeave={onLeave}
      style={{
        display: 'flex', alignItems: 'stretch',
        width: '100%', padding: 0, height: hasAny ? 72 : 48,
        background: `linear-gradient(90deg, ${b.color}${hasAny ? '08' : '03'}, ${b.color}${hasAny ? '04' : '01'})`,
        border: isNew ? `1px solid ${b.color}55`
          : canAfford ? `1px solid ${b.color}18`
          : '1px solid #eef0f2',
        borderRadius: 6,
        opacity: canAfford ? 1 : 0.5,
        transition: 'all .15s',
        textAlign: 'left', position: 'relative', overflow: 'hidden',
        cursor: canAfford ? 'pointer' : 'default',
        animation: isNew ? 'si .4s ease-out' : 'none',
        boxShadow: lastBought ? `0 0 0 2px ${b.color}44`
          : hovered && canAfford ? `0 2px 10px ${b.color}12` : 'none',
        transform: lastBought ? 'scale(1.005)' : 'none',
      }}
    >
      {/* Left info area */}
      <div style={{
        width: 170, flexShrink: 0, padding: '6px 10px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        zIndex: 1, position: 'relative',
        background: `linear-gradient(90deg, ${b.color}${hasAny ? '10' : '05'}, transparent)`,
      }}>
        <span style={{
          fontSize: 16, fontWeight: 800, color: '#1e293b', lineHeight: 1.2,
        }}>{b.name}</span>
        <span style={{
          fontSize: 11, color: '#64748b', lineHeight: 1.2, marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{b.desc}</span>
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: canAfford ? '#b45309' : '#94a3b8',
          fontFamily: "'JetBrains Mono',monospace",
          marginTop: 2,
        }}>
          {fmt(cost)}{buyN > 1 ? ` ×${buyN}` : ''}
          <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
            {hasAny ? `${fmt(prodRate)}/s` : `+${fmt(b.baseProd)}/s`}
          </span>
        </div>
      </div>

      {/* Emoji crowd — fills remaining space horizontally */}
      {hasAny && (
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          overflow: 'hidden', padding: '2px 0',
          gap: 0, flexWrap: 'wrap', alignContent: 'center',
        }}>
          {Array.from({ length: Math.min(count, 40) }, (_, i) => (
            <span key={i} style={{
              fontSize: count > 20 ? 18 : count > 10 ? 22 : 26,
              lineHeight: 1,
              opacity: 0.6 + (i / Math.min(count, 40)) * 0.35,
              transform: `rotate(${(i * 13 + i * i * 2) % 24 - 12}deg)`,
              flexShrink: 0,
            }}>
              {b.emoji}
            </span>
          ))}
        </div>
      )}

      {/* Count badge — right side */}
      <div style={{
        width: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: hasAny ? 24 : 14, fontWeight: 900,
        color: hasAny ? b.color : '#cbd5e1',
        fontFamily: "'Space Grotesk','JetBrains Mono',monospace",
        opacity: hasAny ? 0.9 : 0.4,
        zIndex: 1,
      }}>
        {count}
      </div>

      {/* Affordability progress bar */}
      {!canAfford && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'rgba(0,0,0,.04)',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (count > 0 ? 0 : 1) * 100)}%`,
            background: `${b.color}60`,
            transition: 'width .5s',
          }} />
        </div>
      )}

      {/* NEW badge */}
      {isNew && (
        <div style={{
          position: 'absolute', top: 1, right: 40,
          background: b.color, color: '#fff', fontSize: 7, fontWeight: 800,
          padding: '0 4px', borderRadius: 3, zIndex: 2,
        }}>NEW</div>
      )}
    </button>
  );
}

export default function BuildingList({ buildings, owned, reads, allTime, unlockedBuildings, newBuildings, buyN, onBuy, setBuyN, singleColumn = false }) {
  const [lastBought, setLastBought] = useState(null);
  const [hovered, setHovered] = useState(null);

  const visibleBuildings = buildings.filter(b => unlockedBuildings.has(b.id));
  const lockedBuildings = buildings.filter(b => !unlockedBuildings.has(b.id));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
      {/* Header with bulk buy */}
      <div style={{
        padding: '4px 8px 2px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{
          fontSize: 10, color: '#64748b', fontWeight: 600,
          letterSpacing: 1, textTransform: 'uppercase',
        }}>已讀大師</div>
        <div style={{
          display: 'flex', gap: 2,
          background: '#f1f5f9', borderRadius: 6, padding: 1,
          border: '1px solid #e2e8f0',
        }}>
          {[1, 10, 100].map(n => (
            <button
              key={n}
              onClick={() => setBuyN(n)}
              style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 4, border: 'none',
                background: buyN === n ? 'linear-gradient(135deg, #6366f1, #4338ca)' : 'transparent',
                color: buyN === n ? '#fff' : '#94a3b8',
                fontWeight: 700, fontFamily: "'JetBrains Mono',monospace",
                cursor: 'pointer',
              }}
            >×{n}</button>
          ))}
        </div>
      </div>

      {/* Building list — scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px 4px', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Unlocked buildings — horizontal bars */}
          {visibleBuildings.map(b => {
            const count = owned[b.id] ?? 0;
            const cost = buildingCostN(b, count, buyN);
            const canAfford = reads >= cost;
            const isNew = newBuildings.has(b.id);
            const prodRate = b.baseProd * count;

            return (
              <BuildingBar
                key={b.id}
                b={b}
                count={count}
                cost={cost}
                prodRate={prodRate}
                canAfford={canAfford}
                buyN={buyN}
                isNew={isNew}
                onBuy={() => { onBuy(b, buyN); setLastBought(b.id); setTimeout(() => setLastBought(null), 400); }}
                lastBought={lastBought === b.id}
                hovered={hovered === b.id}
                onHover={() => setHovered(b.id)}
                onLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Locked buildings — minimal single-line */}
          {lockedBuildings.map(b => {
            const unlockAt = b.unlockAt ?? 0;
            const unlockPct = unlockAt > 0 ? Math.min(100, ((allTime ?? 0) / unlockAt) * 100) : 100;

            return (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', height: 22,
                opacity: 0.4, fontSize: 10, color: '#94a3b8',
              }}>
                <span style={{ fontSize: 8 }}>🔒</span>
                <span style={{ fontWeight: 600, minWidth: 50 }}>{b.name}</span>
                <div style={{ flex: 1, height: 2, background: 'rgba(148,163,184,.15)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${unlockPct}%`, background: 'rgba(148,163,184,.35)', borderRadius: 2, transition: 'width .5s' }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8 }}>{fmt(unlockAt)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
