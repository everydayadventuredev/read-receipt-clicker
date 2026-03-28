import { useState, useEffect } from 'react';
import { FLOWERS, SERIES, RARITY, GROWTH_TIME, WILT_TIME, getFieldCount, getFlowerById } from '../game/garden.js';

/**
 * Format remaining time as "Xh Xm" or "Xm Xs".
 */
function fmtTime(ms) {
  if (ms <= 0) return '就緒';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

/**
 * Single garden plot cell.
 */
function PlotCell({ slot, index, fieldCount, seeds, onPlant, onHarvest, onClear }) {
  const [now, setNow] = useState(Date.now());

  // Update timer every second for growing/mature cells
  useEffect(() => {
    if (!slot || slot.wilted) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [slot]);

  const isLocked = index >= fieldCount;

  // Locked cell
  if (isLocked) {
    return (
      <div style={{
        background: 'rgba(148,163,184,.06)',
        border: '1px dashed rgba(148,163,184,.2)',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.4, fontSize: 20,
      }}>
        🔒
      </div>
    );
  }

  // Empty cell
  if (!slot) {
    return (
      <button
        onClick={() => seeds > 0 && onPlant(index)}
        style={{
          background: seeds > 0 ? 'rgba(139,69,19,.06)' : 'rgba(148,163,184,.04)',
          border: seeds > 0 ? '1px dashed rgba(139,69,19,.3)' : '1px dashed rgba(148,163,184,.15)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: seeds > 0 ? 'pointer' : 'default',
          fontSize: 14, color: '#a3856a',
          transition: 'all .2s',
          flexDirection: 'column', gap: 2,
        }}
      >
        {seeds > 0 && <span style={{ fontSize: 28 }}>🌱</span>}
        {seeds > 0 && <span style={{ fontSize: 11, fontWeight: 600 }}>點擊播種</span>}
      </button>
    );
  }

  // Wilted
  if (slot.wilted) {
    const flower = getFlowerById(slot.flowerId);
    return (
      <button
        onClick={() => onClear(index)}
        style={{
          background: 'rgba(148,163,184,.06)',
          border: '1px solid rgba(148,163,184,.15)',
          borderRadius: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', opacity: 0.5,
          filter: 'grayscale(1)',
        }}
      >
        <span style={{ fontSize: 36 }}>{flower?.emoji ?? '🍂'}</span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>枯萎</span>
      </button>
    );
  }

  // Growing (no flower assigned yet)
  if (!slot.flowerId) {
    const remaining = GROWTH_TIME - (now - slot.plantedAt);
    const progress = Math.min(100, ((now - slot.plantedAt) / GROWTH_TIME) * 100);
    return (
      <div style={{
        background: 'rgba(34,197,94,.06)',
        border: '1px solid rgba(34,197,94,.2)',
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <span style={{ fontSize: 36, animation: 'breathe 2s ease-in-out infinite' }}>🌱</span>
        <span style={{
          fontSize: 13, color: '#22c55e', fontWeight: 600,
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {fmtTime(remaining)}
        </span>
        {/* Progress bar at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'rgba(34,197,94,.15)',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: '#22c55e', transition: 'width 1s linear',
          }} />
        </div>
      </div>
    );
  }

  // Mature — harvestable!
  const flower = getFlowerById(slot.flowerId);
  const rarity = RARITY[flower?.rarity ?? 'common'];
  const wiltRemaining = WILT_TIME - (now - slot.maturedAt);
  const urgency = wiltRemaining < 60 * 60 * 1000; // < 1 hour

  return (
    <button
      onClick={() => onHarvest(index)}
      style={{
        background: `linear-gradient(135deg, ${rarity.color}10, ${rarity.color}05)`,
        border: `2px solid ${rarity.color}40`,
        borderRadius: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        animation: 'glowPulse 2s ease-in-out infinite',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 44 }}>{flower?.emoji ?? '🌸'}</span>
      <span style={{
        fontSize: 12, fontWeight: 700, color: rarity.color,
        textTransform: 'uppercase',
      }}>
        {rarity.label}
      </span>
      {/* Wilt timer */}
      <span style={{
        fontSize: 11, color: urgency ? '#ef4444' : '#94a3b8',
        fontFamily: "'JetBrains Mono',monospace",
        fontWeight: urgency ? 700 : 400,
      }}>
        {fmtTime(wiltRemaining)}
      </span>
    </button>
  );
}

/**
 * Collection / 圖鑑 view.
 */
function CollectionView({ collection, completedSeries }) {
  const totalDiscovered = Object.keys(collection).length;

  return (
    <div style={{ padding: '8px 12px', overflowY: 'auto', flex: 1 }}>
      <div style={{
        fontSize: 12, color: '#64748b', marginBottom: 8,
        fontFamily: "'JetBrains Mono',monospace",
      }}>
        已發現 {totalDiscovered}/{FLOWERS.length} 種花
      </div>

      {SERIES.map(series => {
        const isComplete = completedSeries.includes(series.id);
        return (
          <div key={series.id} style={{
            marginBottom: 12,
            padding: '8px 10px',
            background: isComplete ? 'rgba(245,158,11,.05)' : 'rgba(148,163,184,.03)',
            border: isComplete ? '1px solid rgba(245,158,11,.2)' : '1px solid #f1f5f9',
            borderRadius: 10,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#1e293b',
              marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{series.emoji}</span>
              <span>{series.name}</span>
              {isComplete && <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 800 }}>✨ ×1.05 永久</span>}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>{series.desc}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {series.flowerIds.map(fid => {
                const flower = getFlowerById(fid);
                const found = collection[fid];
                const rarity = RARITY[flower?.rarity ?? 'common'];
                return (
                  <div key={fid} style={{
                    width: 56, padding: '4px 2px',
                    borderRadius: 6,
                    background: found ? `${rarity.color}10` : 'rgba(148,163,184,.05)',
                    border: found ? `1px solid ${rarity.color}30` : '1px dashed rgba(148,163,184,.2)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20 }}>{found ? flower.emoji : '❓'}</div>
                    <div style={{
                      fontSize: 8, fontWeight: 600,
                      color: found ? rarity.color : '#cbd5e1',
                      marginTop: 2,
                    }}>
                      {found ? flower.name : '???'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Active buff bar.
 */
function BuffBar({ activeBuffs }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (activeBuffs.length === 0) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [activeBuffs.length]);

  const live = activeBuffs.filter(b => b.expiresAt > now);
  if (live.length === 0) return null;

  return (
    <div style={{
      padding: '4px 8px', display: 'flex', gap: 4, flexWrap: 'wrap',
      borderTop: '1px solid #f1f5f9',
    }}>
      {live.map((b, i) => {
        const flower = getFlowerById(b.flowerId);
        const remaining = b.expiresAt - now;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 4,
            background: 'rgba(99,102,241,.06)',
            fontSize: 12, color: '#6366f1', fontWeight: 600,
          }}>
            <span style={{ fontSize: 14 }}>{flower?.emoji ?? '🌸'}</span>
            <span>×{b.mult}</span>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#94a3b8',
            }}>{fmtTime(remaining)}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Garden — main component for 放下花園.
 */
export default function Garden({ gardenState, exCount, onPlant, onHarvest, onClearWilted }) {
  const [showCollection, setShowCollection] = useState(false);

  if (!gardenState) return null;

  const fieldCount = getFieldCount(exCount);
  const { slots, seeds, collection, completedSeries, activeBuffs } = gardenState;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minHeight: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🌱</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>放下花園</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#22c55e',
            fontFamily: "'JetBrains Mono',monospace",
          }}>
            🌰 {seeds}
          </span>
          <button
            onClick={() => setShowCollection(!showCollection)}
            style={{
              padding: '3px 8px', fontSize: 11, fontWeight: 700,
              background: showCollection ? 'rgba(99,102,241,.1)' : 'rgba(148,163,184,.08)',
              border: showCollection ? '1px solid rgba(99,102,241,.3)' : '1px solid #e2e8f0',
              borderRadius: 6, cursor: 'pointer',
              color: showCollection ? '#6366f1' : '#64748b',
            }}
          >
            📖 {Object.keys(collection).length}/{FLOWERS.length}
          </button>
        </div>
      </div>

      {/* Body */}
      {showCollection ? (
        <CollectionView collection={collection} completedSeries={completedSeries} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* 4×4 Grid */}
          <div style={{
            flex: 1, padding: 8,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 6,
            maxHeight: 'min(50vh, 400px)',
            minHeight: 0,
          }}>
            {slots.map((slot, i) => (
              <PlotCell
                key={i}
                slot={slot}
                index={i}
                fieldCount={fieldCount}
                seeds={seeds}
                onPlant={onPlant}
                onHarvest={onHarvest}
                onClear={onClearWilted}
              />
            ))}
          </div>

          {/* Active buffs */}
          <BuffBar activeBuffs={activeBuffs ?? []} />

          {/* Footer quote */}
          <div style={{
            padding: '8px 12px', flexShrink: 0,
            borderTop: '1px solid #f1f5f9',
            fontSize: 12, color: '#94a3b8', textAlign: 'center',
            fontStyle: 'italic',
          }}>
            「每次想點開對話的時候，就種一棵樹吧。」
          </div>
        </div>
      )}
    </div>
  );
}
