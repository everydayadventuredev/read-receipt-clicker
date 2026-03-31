import { useState, useEffect, useRef } from 'react';
import { GIFT_TIERS, getTier, EXPAND_COSTS, BASE_GRID, GRID_SIZE } from '../game/merge.js';
import { fmt } from '../utils/format.js';
import GameIcon, { getGiftIcon } from './GameIcon.jsx';

/**
 * App-icon style merge cell — rounded square with shadow like iOS icons.
 */
function MergeCell({ item, index, gridSize, selected, selectedTier, onSelect, pendingGifts, onPlace, placeCost, reads }) {
  const isLocked = index >= gridSize;

  const iconBase = {
    borderRadius: '22%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s',
    position: 'relative', overflow: 'hidden',
  };

  // Locked
  if (isLocked) {
    return (
      <div style={{
        ...iconBase,
        background: 'rgba(148,163,184,.04)',
        border: '1px solid rgba(148,163,184,.06)',
        opacity: 0.25,
      }}>
        <span style={{ fontSize: 16, opacity: 0.5 }}>🔒</span>
      </div>
    );
  }

  // Empty — place gift
  if (!item) {
    const canPlace = pendingGifts > 0 && selected === null;
    const isTarget = selected !== null; // can move here
    return (
      <button
        onClick={() => {
          if (selected !== null) onSelect(index);
          else if (canPlace) onPlace(index);
        }}
        style={{
          ...iconBase,
          background: isTarget
            ? 'rgba(99,102,241,.06)'
            : canPlace
              ? 'rgba(245,158,11,.04)'
              : 'rgba(148,163,184,.02)',
          border: isTarget
            ? '2px dashed rgba(99,102,241,.25)'
            : canPlace
              ? '1.5px dashed rgba(245,158,11,.2)'
              : '1px dashed rgba(148,163,184,.08)',
          cursor: (isTarget || canPlace) ? 'pointer' : 'default',
        }}
      >
        {canPlace && <>
          <span style={{ fontSize: 20, opacity: 0.5 }}>📦</span>
          <span style={{
            fontSize: 9, fontWeight: 700, marginTop: 2,
            color: reads >= (placeCost ?? 0) ? 'var(--amber-text)' : '#ef4444',
            fontFamily: "'JetBrains Mono',monospace",
          }}>{fmt(placeCost ?? 0)}</span>
        </>}
      </button>
    );
  }

  const tier = getTier(item.tier);
  const isSelected = selected === index;
  const isMatch = selected !== null && selected !== index && selectedTier === item.tier;

  return (
    <button
      onClick={() => onSelect(index)}
      style={{
        ...iconBase,
        background: `linear-gradient(145deg, ${tier.color}18, ${tier.color}08)`,
        border: isSelected
          ? `2.5px solid ${tier.color}70`
          : isMatch
            ? `2px solid ${tier.color}50`
            : `1px solid ${tier.color}15`,
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.08)' : isMatch ? 'scale(1.02)' : 'none',
        boxShadow: isSelected
          ? `0 6px 20px ${tier.color}25, 0 0 0 3px ${tier.color}15`
          : isMatch
            ? `0 2px 12px ${tier.color}15`
            : `0 2px 8px ${tier.color}08`,
        animation: isMatch ? 'glowPulse 1.5s ease-in-out infinite' : isSelected ? 'none' : 'none',
      }}
    >
      {getGiftIcon(tier.tier)
        ? <GameIcon src={getGiftIcon(tier.tier)} size={40} color={tier.color} />
        : <span style={{ fontSize: 40, lineHeight: 1 }}>{tier.emoji}</span>
      }
      <span style={{
        fontSize: 10, fontWeight: 700, color: tier.color,
        marginTop: 3, letterSpacing: 0.3,
      }}>
        {tier.name}
      </span>
      {/* Tier badge */}
      <div style={{
        position: 'absolute', top: 4, right: 4,
        width: 16, height: 16, borderRadius: '50%',
        background: tier.color, color: '#fff',
        fontSize: 9, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 1px 4px ${tier.color}40`,
      }}>{item.tier}</div>
    </button>
  );
}

/**
 * Merge event toast.
 */
function MergeToast({ event, resultTier }) {
  if (!event) return null;
  const tier = getTier(resultTier);
  const messages = {
    critical: `✨ 大成功！直接跳到 ${tier.emoji} ${tier.name}！`,
    surprise: `🎉 意外驚喜！額外獲得 ×${tier.buffMult} buff！`,
    normal: null,
  };
  const msg = messages[event];
  if (!msg) return null;

  return (
    <div style={{
      position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
      padding: '8px 20px', borderRadius: 14,
      background: event === 'critical' ? 'rgba(168,85,247,.92)' : 'rgba(16,185,129,.92)',
      color: '#fff', fontSize: 13, fontWeight: 700,
      whiteSpace: 'nowrap', zIndex: 20,
      animation: 'slideIn .3s ease-out',
      pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,.15)',
    }}>
      {msg}
    </div>
  );
}

/**
 * Active merge buffs.
 */
function MergeBuffBar({ activeBuffs }) {
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
        const tier = getTier(b.tier);
        const remaining = Math.max(0, Math.floor((b.expiresAt - now) / 1000));
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 10,
            background: `${tier.color}08`,
            border: `1px solid ${tier.color}15`,
            fontSize: 12, color: tier.color, fontWeight: 600,
          }}>
            {getGiftIcon(tier.tier)
              ? <GameIcon src={getGiftIcon(tier.tier)} size={14} color={tier.color} />
              : <span style={{ fontSize: 14 }}>{tier.emoji}</span>
            }
            <span>×{b.mult}</span>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'var(--text-muted)',
            }}>{min}:{String(sec).padStart(2, '0')}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MergeGame — App Store icon grid style.
 */
export default function MergeGame({ mergeState, parCount, reads, onPlace, placeCost, onMerge, onMove, onExpand, onCollapse, onSendGift, resonanceState }) {
  const [selected, setSelected] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const eventTimer = useRef(null);

  if (!mergeState) return null;

  const { grid, gridSize, pendingGifts, activeVisitor, highestTier, totalMerges, activeBuffs } = mergeState;

  const handleSelect = (index) => {
    if (selected === null) {
      if (grid[index]) setSelected(index);
      return;
    }
    const src = grid[selected];
    const tgt = grid[index];

    if (index === selected) { setSelected(null); return; }

    if (!tgt) {
      onMove(selected, index);
      setSelected(null);
      return;
    }

    if (src && tgt && src.tier === tgt.tier) {
      const result = onMerge(selected, index);
      if (result && result.event !== 'normal') {
        setLastEvent({ event: result.event, resultTier: result.resultTier });
        clearTimeout(eventTimer.current);
        eventTimer.current = setTimeout(() => setLastEvent(null), 2000);
      }
      setSelected(null);
      return;
    }

    setSelected(index);
  };

  const expandIdx = gridSize - BASE_GRID;
  const expandCost = expandIdx < (GRID_SIZE - BASE_GRID) ? (EXPAND_COSTS[expandIdx] ?? null) : null;
  const canExpand = expandCost !== null && reads >= expandCost;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minHeight: 0,
      background: 'linear-gradient(180deg, rgba(245,158,11,.02), rgba(220,38,38,.02))',
      position: 'relative',
    }}>
      {/* Visitor banner — inline */}
      {activeVisitor && (
        <div style={{
          padding: '8px 14px', flexShrink: 0,
          background: 'rgba(239,68,68,.06)',
          borderBottom: '1px solid rgba(239,68,68,.12)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideIn .3s ease-out',
        }}>
          <span style={{ fontSize: 22 }}>{activeVisitor.visitor.emoji}</span>
          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
            {activeVisitor.visitor.message}
            <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
              (拿走了 {activeVisitor.stolenCount} 個)
            </span>
          </span>
        </div>
      )}

      {/* Header — app store feel */}
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
              fontSize: 13, color: 'var(--text-muted)', padding: '2px 4px', lineHeight: 1,
            }} title="收合">▲</button>
          )}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(245,158,11,.3)',
          }}>
            <span style={{ fontSize: 14 }}>🎁</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>伴手禮合成</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>合成 {totalMerges} 次</div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 10,
          background: 'rgba(245,158,11,.08)',
          border: '1px solid rgba(245,158,11,.15)',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#f59e0b',
            fontFamily: "'JetBrains Mono',monospace",
          }}>
            📦 {pendingGifts}
          </span>
        </div>
      </div>

      {/* Tier progression bar */}
      <div style={{
        padding: '6px 14px', display: 'flex', gap: 4, flexShrink: 0,
        borderBottom: '1px solid rgba(148,163,184,.08)',
        alignItems: 'center', overflowX: 'auto',
      }}>
        {GIFT_TIERS.map((t, i) => (
          <div key={t.tier} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            opacity: t.tier <= highestTier + 1 ? 1 : 0.25,
            transition: 'opacity .3s',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '22%',
              background: t.tier <= highestTier
                ? `linear-gradient(135deg, ${t.color}20, ${t.color}10)`
                : 'rgba(148,163,184,.05)',
              border: t.tier <= highestTier ? `1.5px solid ${t.color}30` : '1px solid rgba(148,163,184,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>
              {t.emoji}
            </div>
            {i < GIFT_TIERS.length - 1 && (
              <span style={{ fontSize: 10, color: 'var(--text-disabled)' }}>→</span>
            )}
          </div>
        ))}
      </div>

      {/* 4×4 App Icon Grid */}
      <div style={{
        padding: 10,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridAutoRows: 'minmax(80px, 110px)',
        gap: 8,
        alignContent: 'start',
      }}>
        {grid.map((item, i) => (
          <MergeCell
            key={i}
            item={item}
            index={i}
            gridSize={gridSize}
            selected={selected}
            selectedTier={selected !== null && grid[selected] ? grid[selected].tier : null}
            onSelect={handleSelect}
            pendingGifts={pendingGifts}
            onPlace={onPlace}
            placeCost={placeCost}
            reads={reads}
          />
        ))}
      </div>

      {/* Merge event toast */}
      {lastEvent && (
        <MergeToast event={lastEvent.event} resultTier={lastEvent.resultTier} />
      )}

      {/* Active buffs */}
      <MergeBuffBar activeBuffs={activeBuffs ?? []} />

      {/* Send gift bar — shown when a gift is selected */}
      {selected !== null && grid[selected] && onSendGift && (
        <div style={{
          padding: '8px 14px', flexShrink: 0,
          background: 'linear-gradient(90deg, rgba(245,158,11,.06), rgba(220,38,38,.04))',
          borderTop: '1px solid rgba(245,158,11,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            送出 {getTier(grid[selected].tier).emoji} {getTier(grid[selected].tier).name}
            <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
              → ×{({ 1: 1.2, 2: 1.5, 3: 2.0, 4: 2.5, 5: 3.5, 6: 4.0, 7: 5.0 })[grid[selected].tier] ?? 1.2} 產能 5分鐘
            </span>
            {resonanceState && !resonanceState.consumed && (
              <span style={{ color: '#f59e0b', fontWeight: 700, marginLeft: 4 }}>
                ⚛️ ×{resonanceState.mult}
              </span>
            )}
          </div>
          <button onClick={() => {
            onSendGift(selected);
            setSelected(null);
          }} style={{
            padding: '5px 16px', fontSize: 13, fontWeight: 800,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff', border: 'none', borderRadius: 10,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,.3)',
          }}>
            🎁 送出
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '6px 14px', flexShrink: 0,
        borderTop: '1px solid rgba(148,163,184,.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          點選兩個相同禮物來合成
        </span>
        {expandCost !== null && (
          <button
            onClick={() => canExpand && onExpand()}
            disabled={!canExpand}
            style={{
              padding: '5px 12px', fontSize: 12, fontWeight: 700,
              color: canExpand ? '#f59e0b' : 'var(--text-disabled)',
              background: canExpand ? 'rgba(245,158,11,.08)' : '#f8fafc',
              border: `1px solid ${canExpand ? 'rgba(245,158,11,.25)' : '#e2e8f0'}`,
              borderRadius: 10, cursor: canExpand ? 'pointer' : 'default',
            }}
          >
            +1格 {fmt(expandCost)}
          </button>
        )}
      </div>
    </div>
  );
}
