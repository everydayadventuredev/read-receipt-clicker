import { useState, useEffect } from 'react';
import { FLOWERS, SERIES, RARITY, GROWTH_TIME, WILT_TIME, getFieldCount, getFlowerById } from '../game/garden.js';
import GameIcon, { getFlowerIcon, UI_ICON_MAP } from './GameIcon.jsx';

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
 * Widget-style plot cell — iOS widget aesthetic.
 */
function PlotCell({ slot, index, fieldCount, seeds, onPlant, onHarvest, onClear }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!slot || slot.wilted) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [slot]);

  const isLocked = index >= fieldCount;
  const cellBase = {
    borderRadius: 16,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s',
    position: 'relative', overflow: 'hidden',
  };

  // Locked
  if (isLocked) {
    return (
      <div style={{
        ...cellBase,
        background: 'rgba(148,163,184,.04)',
        border: '1px solid rgba(148,163,184,.08)',
        opacity: 0.3,
      }}>
        <span style={{ fontSize: 16, opacity: 0.5 }}>🔒</span>
      </div>
    );
  }

  // Empty — plantable
  if (!slot) {
    const canPlant = seeds > 0;
    return (
      <button
        onClick={() => canPlant && onPlant(index)}
        style={{
          ...cellBase,
          background: canPlant
            ? 'linear-gradient(135deg, rgba(34,197,94,.06), rgba(34,197,94,.02))'
            : 'rgba(148,163,184,.03)',
          border: canPlant ? '1.5px dashed rgba(34,197,94,.3)' : '1px dashed rgba(148,163,184,.12)',
          cursor: canPlant ? 'pointer' : 'default',
        }}
      >
        {canPlant && <>
          <span style={{ fontSize: 24, opacity: 0.6 }}>🌱</span>
          <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, marginTop: 2 }}>播種</span>
        </>}
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
          ...cellBase,
          background: 'rgba(148,163,184,.05)',
          border: '1px solid rgba(148,163,184,.1)',
          cursor: 'pointer', filter: 'grayscale(0.8)', opacity: 0.5,
        }}
      >
        {flower && getFlowerIcon(flower.id)
          ? <GameIcon src={getFlowerIcon(flower.id)} size={32} color="#94a3b8" style={{ filter: 'grayscale(1)' }} />
          : <span style={{ fontSize: 32 }}>{flower?.emoji ?? '🍂'}</span>
        }
        <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>枯萎了</span>
      </button>
    );
  }

  // Growing
  if (!slot.flowerId) {
    const remaining = GROWTH_TIME - (now - slot.plantedAt);
    const progress = Math.min(100, ((now - slot.plantedAt) / GROWTH_TIME) * 100);
    return (
      <div style={{
        ...cellBase,
        background: 'linear-gradient(180deg, rgba(34,197,94,.08), rgba(34,197,94,.02))',
        border: '1px solid rgba(34,197,94,.15)',
      }}>
        <GameIcon src={UI_ICON_MAP.seed} size={28} color="#22c55e" style={{ animation: 'breathe 3s ease-in-out infinite' }} />
        <span style={{
          fontSize: 11, color: '#22c55e', fontWeight: 700,
          fontFamily: "'JetBrains Mono',monospace", marginTop: 3,
        }}>
          {fmtTime(remaining)}
        </span>
        {/* Circular progress ring */}
        <svg style={{ position: 'absolute', inset: 4, opacity: 0.2 }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#22c55e" strokeWidth="2"
            strokeDasharray={`${progress * 2.89} 289`}
            strokeLinecap="round" transform="rotate(-90 50 50)" />
        </svg>
      </div>
    );
  }

  // Mature — harvestable!
  const flower = getFlowerById(slot.flowerId);
  const rarity = RARITY[flower?.rarity ?? 'common'];
  const wiltRemaining = WILT_TIME - (now - slot.maturedAt);
  const urgency = wiltRemaining < 60 * 60 * 1000;

  return (
    <button
      onClick={() => onHarvest(index)}
      style={{
        ...cellBase,
        background: `linear-gradient(135deg, ${rarity.color}12, ${rarity.color}06)`,
        border: `2px solid ${rarity.color}40`,
        cursor: 'pointer',
        animation: 'glowPulse 2s ease-in-out infinite',
        boxShadow: `0 4px 20px ${rarity.color}15`,
      }}
    >
      {flower && getFlowerIcon(flower.id)
        ? <GameIcon src={getFlowerIcon(flower.id)} size={40} color={rarity.color} />
        : <span style={{ fontSize: 40 }}>{flower?.emoji ?? '🌸'}</span>
      }
      <span style={{
        fontSize: 11, fontWeight: 800, color: rarity.color,
        letterSpacing: 0.5, marginTop: 2,
      }}>
        {rarity.label}
      </span>
      <span style={{
        fontSize: 10, color: urgency ? '#ef4444' : '#94a3b8',
        fontFamily: "'JetBrains Mono',monospace",
        fontWeight: urgency ? 700 : 400,
      }}>
        {fmtTime(wiltRemaining)}
      </span>
      {/* Rarity glow dot */}
      <div style={{
        position: 'absolute', top: 6, right: 6,
        width: 8, height: 8, borderRadius: '50%',
        background: rarity.color, opacity: 0.6,
        boxShadow: `0 0 6px ${rarity.color}`,
      }} />
    </button>
  );
}

/**
 * Collection / 圖鑑 view — card grid style.
 */
function CollectionView({ collection, completedSeries }) {
  const totalDiscovered = Object.keys(collection).length;

  return (
    <div style={{ padding: '10px 12px', overflowY: 'auto', flex: 1 }}>
      <div style={{
        fontSize: 13, color: '#64748b', marginBottom: 10,
        fontFamily: "'JetBrains Mono',monospace",
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ fontSize: 16 }}>📖</span>
        已發現 {totalDiscovered}/{FLOWERS.length} 種花
      </div>

      {SERIES.map(series => {
        const isComplete = completedSeries.includes(series.id);
        return (
          <div key={series.id} style={{
            marginBottom: 10,
            padding: '10px 12px',
            background: isComplete
              ? 'linear-gradient(135deg, rgba(245,158,11,.06), rgba(245,158,11,.02))'
              : 'rgba(148,163,184,.02)',
            border: isComplete ? '1.5px solid rgba(245,158,11,.25)' : '1px solid #f1f5f9',
            borderRadius: 14,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: '#1e293b',
              marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>{series.emoji}</span>
              <span>{series.name}</span>
              {isComplete && <span style={{
                fontSize: 10, color: '#f59e0b', fontWeight: 800,
                background: 'rgba(245,158,11,.1)', padding: '2px 6px', borderRadius: 4,
              }}>✨ ×1.05 永久</span>}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{series.desc}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {series.flowerIds.map(fid => {
                const flower = getFlowerById(fid);
                const found = collection[fid];
                const rarity = RARITY[flower?.rarity ?? 'common'];
                return (
                  <div key={fid} style={{
                    width: 60, padding: '6px 2px',
                    borderRadius: 12,
                    background: found ? `${rarity.color}08` : 'rgba(148,163,184,.04)',
                    border: found ? `1.5px solid ${rarity.color}25` : '1px dashed rgba(148,163,184,.15)',
                    textAlign: 'center',
                    transition: 'all .2s',
                  }}>
                    <div style={{ fontSize: 24, display: 'flex', justifyContent: 'center' }}>
                      {found && getFlowerIcon(flower.id)
                        ? <GameIcon src={getFlowerIcon(flower.id)} size={24} color={rarity.color} />
                        : found ? flower.emoji : '❓'
                      }
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 600,
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
 * Active buff pills.
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
      padding: '6px 10px', display: 'flex', gap: 4, flexWrap: 'wrap',
      borderTop: '1px solid rgba(148,163,184,.1)',
    }}>
      {live.map((b, i) => {
        const flower = getFlowerById(b.flowerId);
        const remaining = b.expiresAt - now;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 10,
            background: 'rgba(99,102,241,.06)',
            border: '1px solid rgba(99,102,241,.12)',
            fontSize: 12, color: '#6366f1', fontWeight: 600,
          }}>
            {flower && getFlowerIcon(flower.id)
              ? <GameIcon src={getFlowerIcon(flower.id)} size={14} color="#6366f1" />
              : <span style={{ fontSize: 14 }}>{flower?.emoji ?? '🌸'}</span>
            }
            <span>×{b.mult}</span>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#94a3b8',
            }}>{fmtTime(remaining)}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Garden — iOS Widget style main component.
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
      background: 'linear-gradient(180deg, rgba(34,197,94,.02), rgba(99,102,241,.02))',
    }}>
      {/* Widget header — frosted glass feel */}
      <div style={{
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(148,163,184,.1)',
        flexShrink: 0,
        background: 'rgba(255,255,255,.6)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(34,197,94,.3)',
          }}>
            <GameIcon src={UI_ICON_MAP.seed} size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>放下花園</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{fieldCount} 塊田地</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '4px 10px', borderRadius: 10,
            background: 'rgba(34,197,94,.08)',
            border: '1px solid rgba(34,197,94,.15)',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#22c55e',
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              🌰 {seeds}
            </span>
          </div>
          <button
            onClick={() => setShowCollection(!showCollection)}
            style={{
              padding: '4px 10px', fontSize: 12, fontWeight: 700,
              background: showCollection ? 'rgba(99,102,241,.1)' : 'rgba(148,163,184,.06)',
              border: showCollection ? '1.5px solid rgba(99,102,241,.25)' : '1px solid rgba(148,163,184,.12)',
              borderRadius: 10, cursor: 'pointer',
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
          {/* 4×4 Widget Grid */}
          <div style={{
            flex: 1, padding: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 8,
            maxHeight: 'min(50vh, 420px)',
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

          {/* Footer — widget style */}
          <div style={{
            padding: '6px 14px', flexShrink: 0,
            borderTop: '1px solid rgba(148,163,184,.08)',
            fontSize: 11, color: '#94a3b8', textAlign: 'center',
            fontStyle: 'italic', letterSpacing: 0.3,
          }}>
            「每次想點開對話的時候，就種一棵樹吧。」
          </div>
        </div>
      )}
    </div>
  );
}
