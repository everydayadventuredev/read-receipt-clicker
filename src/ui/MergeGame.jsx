import { useState, useRef } from 'react';
import { GIFT_TIERS, getTier, EXPAND_COSTS, BASE_GRID, GRID_SIZE } from '../game/merge.js';
import { fmt } from '../utils/format.js';

/**
 * Single merge cell — supports click-to-select merge flow.
 */
function MergeCell({ item, index, gridSize, selected, onSelect, pendingGifts, onPlace }) {
  const isLocked = index >= gridSize;

  if (isLocked) {
    return (
      <div style={{
        background: 'rgba(148,163,184,.06)',
        border: '1px dashed rgba(148,163,184,.2)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.4, fontSize: 14,
      }}>
        🔒
      </div>
    );
  }

  if (!item) {
    return (
      <button
        onClick={() => {
          if (selected !== null) {
            onSelect(index); // move/merge target
          } else if (pendingGifts > 0) {
            onPlace(index);
          }
        }}
        style={{
          background: selected !== null
            ? 'rgba(99,102,241,.08)'
            : pendingGifts > 0
              ? 'rgba(139,69,19,.04)'
              : 'rgba(148,163,184,.03)',
          border: selected !== null
            ? '2px dashed rgba(99,102,241,.3)'
            : '1px dashed rgba(148,163,184,.15)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: (selected !== null || pendingGifts > 0) ? 'pointer' : 'default',
          fontSize: 16, color: '#d4a574',
          transition: 'all .15s',
        }}
      >
        {pendingGifts > 0 && selected === null ? '+' : ''}
      </button>
    );
  }

  const tier = getTier(item.tier);
  const isSelected = selected === index;

  return (
    <button
      onClick={() => onSelect(index)}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${tier.color}20, ${tier.color}10)`
          : `linear-gradient(135deg, ${tier.color}08, ${tier.color}04)`,
        border: isSelected
          ? `2px solid ${tier.color}60`
          : `1px solid ${tier.color}20`,
        borderRadius: 8,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all .15s',
        transform: isSelected ? 'scale(1.05)' : 'none',
        boxShadow: isSelected ? `0 0 12px ${tier.color}30` : 'none',
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>{tier.emoji}</span>
      <span style={{
        fontSize: 8, fontWeight: 700, color: tier.color,
        marginTop: 2,
      }}>
        {tier.name}
      </span>
    </button>
  );
}

/**
 * Visitor event overlay.
 */
function VisitorBanner({ activeVisitor }) {
  if (!activeVisitor) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '8px 12px',
      background: 'rgba(239,68,68,.1)',
      borderBottom: '1px solid rgba(239,68,68,.2)',
      display: 'flex', alignItems: 'center', gap: 8,
      zIndex: 10,
      animation: 'slideIn .3s ease-out',
    }}>
      <span style={{ fontSize: 24 }}>{activeVisitor.visitor.emoji}</span>
      <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
        {activeVisitor.visitor.message}
        <span style={{ color: '#94a3b8', marginLeft: 4 }}>
          (拿走了 {activeVisitor.stolenCount} 個)
        </span>
      </span>
    </div>
  );
}

/**
 * Merge event toast.
 */
function MergeToast({ event, resultTier, onDone }) {
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
      position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
      padding: '6px 16px', borderRadius: 8,
      background: event === 'critical' ? 'rgba(168,85,247,.9)' : 'rgba(16,185,129,.9)',
      color: '#fff', fontSize: 12, fontWeight: 700,
      whiteSpace: 'nowrap', zIndex: 20,
      animation: 'slideIn .3s ease-out',
      pointerEvents: 'none',
    }}>
      {msg}
    </div>
  );
}

/**
 * Active merge buffs bar.
 */
function MergeBuffBar({ activeBuffs }) {
  const [now, setNow] = useState(Date.now());

  useState(() => {
    if (activeBuffs.length === 0) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  });

  const live = activeBuffs.filter(b => b.expiresAt > now);
  if (live.length === 0) return null;

  return (
    <div style={{
      padding: '4px 8px', display: 'flex', gap: 4, flexWrap: 'wrap',
      borderTop: '1px solid #f1f5f9',
    }}>
      {live.map((b, i) => {
        const tier = getTier(b.tier);
        const remaining = Math.max(0, Math.floor((b.expiresAt - now) / 1000));
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 4,
            background: `${tier.color}10`,
            fontSize: 10, color: tier.color, fontWeight: 600,
          }}>
            <span style={{ fontSize: 12 }}>{tier.emoji}</span>
            <span>×{b.mult}</span>
            <span style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#94a3b8',
            }}>{min}:{String(sec).padStart(2, '0')}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MergeGame — main component for 伴手禮合成.
 */
export default function MergeGame({ mergeState, parCount, reads, onPlace, onMerge, onMove, onExpand }) {
  const [selected, setSelected] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const eventTimer = useRef(null);

  if (!mergeState) return null;

  const { grid, gridSize, pendingGifts, activeVisitor, highestTier, totalMerges, activeBuffs } = mergeState;

  const handleSelect = (index) => {
    if (selected === null) {
      // Select this cell
      if (grid[index]) setSelected(index);
      return;
    }

    // Already have a selection
    const src = grid[selected];
    const tgt = grid[index];

    if (index === selected) {
      // Deselect
      setSelected(null);
      return;
    }

    if (!tgt) {
      // Move to empty cell
      onMove(selected, index);
      setSelected(null);
      return;
    }

    if (src && tgt && src.tier === tgt.tier) {
      // Merge!
      const result = onMerge(selected, index);
      if (result) {
        if (result.event !== 'normal') {
          setLastEvent({ event: result.event, resultTier: result.resultTier });
          clearTimeout(eventTimer.current);
          eventTimer.current = setTimeout(() => setLastEvent(null), 2000);
        }
      }
      setSelected(null);
      return;
    }

    // Different tier — select the new one instead
    setSelected(index);
  };

  // Expand cost
  const expandIdx = gridSize - BASE_GRID;
  const expandCost = expandIdx < (GRID_SIZE - BASE_GRID) ? (EXPAND_COSTS[expandIdx] ?? null) : null;
  const canExpand = expandCost !== null && reads >= expandCost;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minHeight: 0,
      position: 'relative',
    }}>
      {/* Visitor banner */}
      <VisitorBanner activeVisitor={activeVisitor} />

      {/* Header */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🎁</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>伴手禮合成</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#f59e0b',
            fontFamily: "'JetBrains Mono',monospace",
          }}>
            📦 {pendingGifts}
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>
            合成 {totalMerges}次
          </span>
        </div>
      </div>

      {/* Tier guide — compact */}
      <div style={{
        padding: '4px 12px', display: 'flex', gap: 3, flexShrink: 0,
        borderBottom: '1px solid #f1f5f9', alignItems: 'center',
        overflowX: 'auto',
      }}>
        {GIFT_TIERS.map((t, i) => (
          <div key={t.tier} style={{
            display: 'flex', alignItems: 'center', gap: 2,
            opacity: t.tier <= highestTier + 1 ? 1 : 0.3,
          }}>
            <span style={{ fontSize: 14 }}>{t.emoji}</span>
            {i < GIFT_TIERS.length - 1 && (
              <span style={{ fontSize: 9, color: '#cbd5e1' }}>→</span>
            )}
          </div>
        ))}
      </div>

      {/* 4×4 Grid */}
      <div style={{
        flex: 1, padding: 8,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        gap: 4,
        minHeight: 0,
      }}>
        {grid.map((item, i) => (
          <MergeCell
            key={i}
            item={item}
            index={i}
            gridSize={gridSize}
            selected={selected}
            onSelect={handleSelect}
            pendingGifts={pendingGifts}
            onPlace={onPlace}
          />
        ))}
      </div>

      {/* Merge event toast */}
      {lastEvent && (
        <MergeToast event={lastEvent.event} resultTier={lastEvent.resultTier} />
      )}

      {/* Active buffs */}
      <MergeBuffBar activeBuffs={activeBuffs ?? []} />

      {/* Footer — expand + hint */}
      <div style={{
        padding: '6px 12px', flexShrink: 0,
        borderTop: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic' }}>
          點選兩個相同禮物來合成
        </span>
        {expandCost !== null && (
          <button
            onClick={() => canExpand && onExpand()}
            disabled={!canExpand}
            style={{
              padding: '3px 8px', fontSize: 10, fontWeight: 700,
              color: canExpand ? '#f59e0b' : '#cbd5e1',
              background: canExpand ? 'rgba(245,158,11,.08)' : '#f8fafc',
              border: `1px solid ${canExpand ? 'rgba(245,158,11,.25)' : '#e2e8f0'}`,
              borderRadius: 6, cursor: canExpand ? 'pointer' : 'default',
            }}
          >
            +1格 {fmt(expandCost)}
          </button>
        )}
      </div>
    </div>
  );
}
