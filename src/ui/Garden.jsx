import { useState, useEffect, useRef } from 'react';
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
 * Inline SVG soil/field background for each plot cell.
 */
function FieldBg({ state }) {
  // state: 'empty' | 'growing' | 'mature' | 'wilted' | 'locked'
  const soilColor = state === 'wilted' ? '#9e9e9e' : '#8B6C42';
  const grassColor = state === 'locked' ? '#c8c8c8' : '#7ec87e';
  const rowOpacity = state === 'locked' ? 0.15 : state === 'wilted' ? 0.25 : 0.5;
  return (
    <svg viewBox="0 0 120 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {/* Grass base */}
      <rect width={120} height={100} fill={grassColor} opacity={state === 'locked' ? 0.06 : 0.12} />
      {/* Soil rows */}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <rect x={8} y={18 + i * 22} width={104} height={6} rx={3} fill={soilColor} opacity={rowOpacity * 0.6} />
          <rect x={8} y={21 + i * 22} width={104} height={3} rx={1.5} fill={soilColor} opacity={rowOpacity * 0.3} />
        </g>
      ))}
      {/* Growing sprouts */}
      {(state === 'growing' || state === 'mature') && Array.from({ length: 5 }, (_, i) => (
        <g key={`sp${i}`}>
          <rect x={18 + i * 22} y={state === 'mature' ? 10 : 14} width={2} height={state === 'mature' ? 12 : 8}
            fill="#22c55e" opacity={0.4} />
          {state === 'mature' && (
            <circle cx={19 + i * 22} cy={8} r={4} fill="#ec4899" opacity={0.35} />
          )}
        </g>
      ))}
      {/* Fence posts on edges */}
      <rect x={0} y={0} width={2} height={100} fill="#A67C00" opacity={rowOpacity * 0.3} />
      <rect x={118} y={0} width={2} height={100} fill="#A67C00" opacity={rowOpacity * 0.3} />
    </svg>
  );
}

/**
 * Farm-style plot cell — each cell looks like a patch of farmland.
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
    borderRadius: 12,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s',
    position: 'relative', overflow: 'hidden',
    minHeight: 90,
  };

  // Locked
  if (isLocked) {
    return (
      <div style={{
        ...cellBase,
        background: 'rgba(148,163,184,.03)',
        border: '1.5px dashed rgba(148,163,184,.18)',
      }}>
        <FieldBg state="locked" />
        <span style={{ fontSize: 12, color: '#cbd5e1', opacity: 0.5, zIndex: 1 }}>🔒</span>
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
            ? 'linear-gradient(180deg, #f0fdf4, #dcfce7)'
            : '#fafafa',
          border: canPlant ? '2px dashed #86efac' : '1.5px dashed #d4d4d4',
          cursor: canPlant ? 'pointer' : 'default',
        }}
      >
        <FieldBg state="empty" />
        {canPlant && <div style={{ zIndex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 24, opacity: 0.7 }}>🌱</span>
          <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, marginTop: 2 }}>播種</div>
        </div>}
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
          background: 'linear-gradient(180deg, #f5f5f4, #e7e5e4)',
          border: '1.5px solid #d6d3d1',
          cursor: 'pointer',
        }}
      >
        <FieldBg state="wilted" />
        <div style={{ zIndex: 1, textAlign: 'center', filter: 'grayscale(0.6)', opacity: 0.6 }}>
          {flower && getFlowerIcon(flower.id)
            ? <GameIcon src={getFlowerIcon(flower.id)} size={32} color="#94a3b8" />
            : <span style={{ fontSize: 32 }}>{flower?.emoji ?? '🍂'}</span>
          }
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>枯萎了</div>
        </div>
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
        background: `linear-gradient(180deg, #ecfdf5 ${100 - progress}%, #bbf7d0 100%)`,
        border: '1.5px solid #86efac',
      }}>
        <FieldBg state="growing" />
        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <GameIcon src={UI_ICON_MAP.seed} size={28} color="#22c55e" style={{ animation: 'breathe 3s ease-in-out infinite' }} />
          <div style={{
            fontSize: 12, color: '#16a34a', fontWeight: 800,
            fontFamily: "'JetBrains Mono',monospace", marginTop: 3,
          }}>
            {fmtTime(remaining)}
          </div>
        </div>
        {/* Progress ring */}
        <svg style={{ position: 'absolute', inset: 4, opacity: 0.15, zIndex: 0 }} viewBox="0 0 100 100">
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
        background: `linear-gradient(135deg, ${rarity.color}20, ${rarity.color}10)`,
        border: `2px solid ${rarity.color}50`,
        cursor: 'pointer',
        animation: 'glowPulse 2s ease-in-out infinite',
        boxShadow: `0 4px 20px ${rarity.color}15`,
      }}
    >
      <FieldBg state="mature" />
      <div style={{ zIndex: 1, textAlign: 'center' }}>
        {flower && getFlowerIcon(flower.id)
          ? <GameIcon src={getFlowerIcon(flower.id)} size={40} color={rarity.color} />
          : <span style={{ fontSize: 40 }}>{flower?.emoji ?? '🌸'}</span>
        }
        <div style={{
          fontSize: 11, fontWeight: 800, color: rarity.color,
          letterSpacing: 0.5, marginTop: 2,
        }}>
          {rarity.label}
        </div>
        <div style={{
          fontSize: 10, color: urgency ? '#ef4444' : '#78716c',
          fontFamily: "'JetBrains Mono',monospace",
          fontWeight: urgency ? 700 : 500,
        }}>
          {fmtTime(wiltRemaining)}
        </div>
      </div>
      {/* Rarity glow dot */}
      <div style={{
        position: 'absolute', top: 6, right: 6, zIndex: 1,
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
export default function Garden({ gardenState, exCount, onPlant, onHarvest, onClearWilted, onCollapse }) {
  const [showCollection, setShowCollection] = useState(false);
  const [newFlowerFlash, setNewFlowerFlash] = useState(null); // { name, emoji, color, label }
  const prevCollectionSizeRef = useRef(0);

  // Detect new flower discoveries — must be before early return
  const collectionIds = gardenState ? Object.keys(gardenState.collection) : [];
  useEffect(() => {
    if (!gardenState) return;
    const ids = Object.keys(gardenState.collection);
    if (ids.length > prevCollectionSizeRef.current && ids.length > 0) {
      const newestId = ids[ids.length - 1];
      const flower = getFlowerById(newestId);
      if (flower) {
        const rarity = RARITY[flower.rarity ?? 'common'];
        setNewFlowerFlash({ name: flower.name, emoji: flower.emoji, color: rarity.color, label: rarity.label });
        const t = setTimeout(() => setNewFlowerFlash(null), 3000);
        prevCollectionSizeRef.current = ids.length;
        return () => clearTimeout(t);
      }
    }
    prevCollectionSizeRef.current = ids.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionIds.length]);

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
          {onCollapse && (
            <button onClick={onCollapse} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#94a3b8', padding: '2px 4px',
              lineHeight: 1,
            }} title="收合">▲</button>
          )}
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
            title={showCollection ? '返回花田' : '查看花圃圖鑑'}
            style={{
              padding: '4px 12px', fontSize: 12, fontWeight: 700,
              background: showCollection ? 'rgba(99,102,241,.12)' : 'rgba(148,163,184,.08)',
              border: showCollection ? '1.5px solid rgba(99,102,241,.3)' : '1.5px solid rgba(148,163,184,.2)',
              borderRadius: 10, cursor: 'pointer',
              color: showCollection ? '#6366f1' : '#64748b',
              display: 'flex', alignItems: 'center', gap: 4,
              boxShadow: showCollection ? '0 0 0 2px rgba(99,102,241,.1)' : 'none',
              transition: 'all .15s',
            }}
          >
            📖 <span>{Object.keys(collection).length}/{FLOWERS.length}</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>{showCollection ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {showCollection ? (
        <CollectionView collection={collection} completedSeries={completedSeries} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
          {/* New flower discovery flash */}
          {newFlowerFlash && (
            <div style={{
              position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
              zIndex: 50, pointerEvents: 'none',
              background: `linear-gradient(135deg, ${newFlowerFlash.color}18, ${newFlowerFlash.color}0a)`,
              border: `1.5px solid ${newFlowerFlash.color}50`,
              borderRadius: 14, padding: '8px 18px',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: `0 4px 24px ${newFlowerFlash.color}25`,
              animation: 'si .3s ease-out',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 28 }}>{newFlowerFlash.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: newFlowerFlash.color }}>
                  新發現！
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
                  {newFlowerFlash.name}
                  <span style={{
                    marginLeft: 5, fontSize: 10, fontWeight: 600,
                    color: newFlowerFlash.color,
                  }}>{newFlowerFlash.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Inspirational quote — shown when no active buffs / top of grid */}
          <div style={{
            padding: '8px 16px 4px', flexShrink: 0,
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: 12, color: '#94a3b8',
              fontStyle: 'italic', letterSpacing: 0.4,
              lineHeight: 1.6,
            }}>
              「每次想點開對話的時候，就種一棵樹吧。」
            </span>
          </div>

          {/* Grid — always display full rows with locked cells filling gaps */}
          {(() => {
            const cols = Math.min(4, fieldCount);
            const displayCount = Math.ceil(fieldCount / cols) * cols;
            return (
              <div style={{
                padding: '4px 10px 10px',
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridAutoRows: 'minmax(90px, 120px)',
                gap: 6,
              }}>
                {slots.slice(0, displayCount).map((slot, i) => (
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
            );
          })()}

          {/* Active buffs */}
          <BuffBar activeBuffs={activeBuffs ?? []} />
        </div>
      )}
    </div>
  );
}
