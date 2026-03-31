import React, { useState, useEffect } from 'react';
import { MINIGAME_REGISTRY, getUnlockedMinigames } from '../game/minigames.js';
import { getBuffMultiplier, getActiveBuffs, getSourceMult } from '../game/buffSystem.js';
import StockMarket from './StockMarket.jsx';
import Garden from './Garden.jsx';
import MergeGame from './MergeGame.jsx';
import QuantumLab from './QuantumLab.jsx';
import { GardenBanner, StockBanner, MergeBanner, QuantumBanner } from './SectionBanners.jsx';

/**
 * MiniGamePanel — horizontal collapsible accordion layout.
 * Each mini-game is a section with a header bar that toggles open/close.
 */
const BUILDING_NAMES = {
  ex: '前任', par: '忙朋友', algo: '社群演算法', quantum: '量子已讀',
};

// Mini-game section summaries shown when collapsed
const SECTION_SUMMARY = {
  ex: (gardenState) => {
    if (!gardenState) return '';
    const growing = gardenState.slots.filter(s => s && !s.ready && !s.wilted).length;
    const ready = gardenState.slots.filter(s => s?.ready).length;
    const collected = Object.keys(gardenState.collection).length;
    const parts = [];
    if (ready > 0) parts.push(`${ready} 可收`);
    if (growing > 0) parts.push(`${growing} 成長中`);
    parts.push(`圖鑑 ${collected}/20`);
    return parts.join(' · ');
  },
  par: (mergeState) => {
    if (!mergeState) return '';
    const items = mergeState.grid?.flat().filter(Boolean).length ?? 0;
    return items > 0 ? `${items} 個禮物` : '放置禮物開始合成';
  },
  algo: (marketState, prodPerSec) => {
    if (!marketState?.holdings) return '';
    const total = Object.values(marketState.holdings).reduce((s, v) => s + v, 0);
    return total > 0 ? `持有 ${total} 股` : '低買高賣';
  },
};

// Theme colors for each mini-game
const SECTION_THEMES = {
  ex:      { bg: 'linear-gradient(90deg, rgba(34,197,94,.06), rgba(34,197,94,.02))',   accent: '#22c55e' },
  par:     { bg: 'linear-gradient(90deg, rgba(249,115,22,.06), rgba(249,115,22,.02))',  accent: '#f97316' },
  algo:    { bg: 'linear-gradient(90deg, rgba(99,102,241,.06), rgba(99,102,241,.02))',  accent: '#6366f1' },
  quantum: { bg: 'linear-gradient(90deg, rgba(34,211,238,.06), rgba(34,211,238,.02))',  accent: '#22d3ee' },
};

function SectionHeader({ mg, isUnlocked, currentCount, onToggle, summary }) {
  const theme = SECTION_THEMES[mg.buildingId] ?? SECTION_THEMES.algo;

  // Always collapsed view — when open, the component's own header handles collapse
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        background: isUnlocked ? theme.bg : 'rgba(148,163,184,.03)',
        border: 'none',
        borderBottom: '1px solid #f1f5f9',
        borderLeft: isUnlocked ? `3px solid ${theme.accent}` : '3px solid transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all .15s',
        opacity: isUnlocked ? 1 : 0.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: 20 }}>{mg.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text)',
        }}>
          {mg.name}
        </div>
        {isUnlocked && summary && (
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
            marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {summary}
          </div>
        )}
        {!isUnlocked && (
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginTop: 1,
          }}>
            🔒 需要 {mg.unlockCount} 個{BUILDING_NAMES[mg.buildingId] ?? mg.buildingId}（目前 {currentCount}）
          </div>
        )}
      </div>
      {isUnlocked && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>▼</span>
      )}
    </button>
  );
}

export default function MiniGamePanel({
  owned,
  activeMiniGame,
  setActiveMiniGame,
  // Stock market props
  marketState,
  reads,
  onBuyShare,
  onSellShare,
  onBuyAllShares,
  onSellAllShares,
  prodPerSec,
  // Garden props
  gardenState,
  onPlant,
  onHarvest,
  onClearWilted,
  // Merge props
  mergeState,
  giftPlaceCost,
  onPlaceGift,
  onMergeGifts,
  onMoveGift,
  onExpandGrid,
  // New mini-game callbacks
  onMiniGameEarn,
  // Futures props
  onInvestFutures,
  onCollectFuture,
  // Buff system props
  buffState,
  onStartStorm,
  onStormComplete,
  onStormPerfect,
  stormActive,
  onQuantumResonance,
  onGardenHarvestChoice,
  onSendGift,
}) {
  const unlocked = getUnlockedMinigames(owned);
  const allEntries = MINIGAME_REGISTRY;

  // Auto-select first unlocked if none active
  React.useEffect(() => {
    if (!activeMiniGame && unlocked.length > 0) {
      setActiveMiniGame(unlocked[0].buildingId);
    }
  }, [unlocked.length]);

  // Cooldown & buff state (must be before early return to satisfy Rules of Hooks)
  const now = Date.now();
  const stormCooldownEnd = buffState?.stormCooldownEnd ?? 0;
  const quantumCooldownEnd = buffState?.quantumCooldownEnd ?? 0;
  const stormOnCooldown = stormCooldownEnd > now;
  const quantumOnCooldown = quantumCooldownEnd > now;
  const resonance = buffState?.quantumResonance;
  const hasResonance = resonance && !resonance.consumed;
  const liveBuffs = buffState ? getActiveBuffs(buffState) : [];
  const totalMult = buffState ? getBuffMultiplier(buffState) : 1;

  // Force re-render every second for countdowns
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const hasTimers = stormOnCooldown || quantumOnCooldown || liveBuffs.length > 0;
    if (!hasTimers) return;
    const iv = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(iv);
  }, [stormOnCooldown, quantumOnCooldown, liveBuffs.length]);

  // Nothing unlocked → placeholder
  if (unlocked.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 16, minHeight: 0,
      }}>
        <div style={{
          width: '100%', maxWidth: 440, flex: 1,
          background: 'rgba(99,102,241,.02)',
          border: '1px dashed rgba(99,102,241,.15)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(99,102,241,1) 20px, rgba(99,102,241,1) 21px)',
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: 32, opacity: 0.3 }}>🔮</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>
            子系統
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-disabled)', textAlign: 'center', lineHeight: 1.5, maxWidth: 260 }}>
            建築達到特定等級後，將解鎖專屬子系統玩法
          </div>
          <div style={{ fontSize: 10, color: '#d1d5db', fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>
            即將推出...
          </div>
        </div>
      </div>
    );
  }

  // Build summary for each mini-game
  const summaries = {
    ex: SECTION_SUMMARY.ex(gardenState),
    par: SECTION_SUMMARY.par(mergeState),
    algo: SECTION_SUMMARY.algo(marketState, prodPerSec),
  };

  const fmtCd = (end) => {
    const s = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Source info for buff pills
  const SOURCE_INFO = {
    storm:  { icon: '🌪️', color: '#6366f1', label: '風暴' },
    garden: { icon: '🌸', color: '#22c55e', label: '花園' },
    merge:  { icon: '🎁', color: '#f59e0b', label: '合成' },
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: 0, overflowY: 'auto',
    }}>
      {/* ═══ Buff Bar ═══ */}
      {unlocked.length > 0 && (
        <div style={{ flexShrink: 0, borderBottom: '1px solid rgba(148,163,184,.1)' }}>
          {/* Row 1: Active buffs + total multiplier */}
          {(liveBuffs.length > 0 || hasResonance) && (
            <div style={{
              padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
              background: totalMult > 1
                ? `linear-gradient(90deg, rgba(99,102,241,.03), rgba(245,158,11,.03))`
                : 'transparent',
            }}>
              {/* Active buff pills */}
              {liveBuffs.filter(b => b.scope === 'global').map((b, i) => {
                const info = SOURCE_INFO[b.source] ?? { icon: '✨', color: '#8b5cf6', label: b.source };
                const remaining = Math.max(0, Math.ceil((b.expiresAt - Date.now()) / 1000));
                const isExpiring = remaining <= 10;
                return (
                  <div key={b.id ?? i} style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    padding: '3px 8px', borderRadius: 8,
                    background: `${info.color}10`,
                    border: `1px solid ${info.color}25`,
                    animation: isExpiring ? 'buffExpire 0.5s ease-in-out infinite' : undefined,
                  }}>
                    <span style={{ fontSize: 11 }}>{info.icon}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: info.color,
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>×{b.mult.toFixed(1)}</span>
                    <span style={{
                      fontSize: 9, color: isExpiring ? '#ef4444' : 'var(--text-muted)',
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: isExpiring ? 700 : 500,
                    }}>{remaining}s</span>
                  </div>
                );
              })}

              {/* Quantum resonance indicator */}
              {hasResonance && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '3px 8px', borderRadius: 8,
                  background: resonance.mult >= 1.3
                    ? 'linear-gradient(135deg, rgba(245,158,11,.12), rgba(245,158,11,.06))'
                    : 'rgba(239,68,68,.08)',
                  border: resonance.mult >= 1.3
                    ? '1px solid rgba(245,158,11,.3)'
                    : '1px solid rgba(239,68,68,.2)',
                  animation: 'resonancePulse 2s ease-in-out infinite',
                }}>
                  <span style={{ fontSize: 11 }}>⚛️</span>
                  <span style={{
                    fontSize: 11, fontWeight: 800,
                    color: resonance.mult >= 1.3 ? '#f59e0b' : '#ef4444',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>×{resonance.mult}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>待用</span>
                </div>
              )}

              {/* Total multiplier badge */}
              {totalMult > 1 && (
                <div style={{
                  marginLeft: 'auto',
                  padding: '3px 10px', borderRadius: 8,
                  background: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(245,158,11,.1))',
                  border: '1px solid rgba(99,102,241,.2)',
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 800,
                    background: 'linear-gradient(135deg, #6366f1, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>
                    合計 ×{totalMult.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Row 2: Action buttons — Storm + Quantum cooldowns */}
          <div style={{
            padding: '6px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {/* Storm trigger */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, flex: 1,
            }}>
              <span style={{ fontSize: 14 }}>🌪️</span>
              {stormActive ? (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#6366f1',
                  animation: 'stormActivePulse 1s ease-in-out infinite',
                }}>進行中...</span>
              ) : stormOnCooldown ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 40, height: 4, borderRadius: 2,
                    background: 'rgba(99,102,241,.1)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: '#6366f1',
                      width: `${Math.max(0, 100 - ((stormCooldownEnd - Date.now()) / 180000) * 100)}%`,
                      transition: 'width 1s linear',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>{fmtCd(stormCooldownEnd)}</span>
                </div>
              ) : (
                <button onClick={onStartStorm} style={{
                  padding: '3px 12px', fontSize: 11, fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: 'pointer', boxShadow: '0 2px 6px rgba(99,102,241,.25)',
                  animation: 'readyGlow 2s ease-in-out infinite',
                }}>
                  啟動 ▶
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 16, background: 'rgba(148,163,184,.12)' }} />

            {/* Quantum cooldown indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, flex: 1,
            }}>
              <span style={{ fontSize: 14 }}>⚛️</span>
              {quantumOnCooldown ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 40, height: 4, borderRadius: 2,
                    background: 'rgba(34,211,238,.1)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: '#22d3ee',
                      width: `${Math.max(0, 100 - ((quantumCooldownEnd - Date.now()) / 300000) * 100)}%`,
                      transition: 'width 1s linear',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>{fmtCd(quantumCooldownEnd)}</span>
                </div>
              ) : (
                <span style={{
                  fontSize: 10, fontWeight: 600, color: '#22d3ee',
                }}>就緒</span>
              )}
            </div>

            {/* Futures count */}
            {marketState?.futures?.length > 0 && (
              <>
                <div style={{ width: 1, height: 16, background: 'rgba(148,163,184,.12)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>📈</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#6366f1',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>{marketState.futures.length} 合約</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {allEntries.map(mg => {
        const isUnlocked = (owned[mg.buildingId] ?? 0) >= mg.unlockCount;
        const isOpen = activeMiniGame === mg.buildingId && isUnlocked;
        const currentCount = owned[mg.buildingId] ?? 0;

        const collapseHandler = () => setActiveMiniGame(null);

        return (
          <div key={mg.buildingId} style={{
            display: 'flex', flexDirection: 'column',
            ...(isOpen ? { flex: 1, minHeight: 0 } : {}),
          }}>
            {/* Only show collapsed header when NOT open — the component's own header handles collapse */}
            {!isOpen && (
              <SectionHeader
                mg={mg}
                isUnlocked={isUnlocked}
                isOpen={false}
                currentCount={currentCount}
                summary={summaries[mg.buildingId]}
                onToggle={() => {
                  if (isUnlocked) {
                    setActiveMiniGame(mg.buildingId);
                  }
                }}
              />
            )}

            {/* Content area — only shown when open */}
            {isOpen && (
              <div style={{
                flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                minHeight: 0, position: 'relative',
                borderBottom: '1px solid #e2e8f0',
              }}>
                {/* Section background */}
                {mg.buildingId === 'ex' && <GardenBanner />}
                {mg.buildingId === 'algo' && <StockBanner />}
                {mg.buildingId === 'par' && <MergeBanner />}
                {mg.buildingId === 'quantum' && <QuantumBanner />}

                {mg.buildingId === 'par' && mergeState && (
                  <MergeGame
                    mergeState={mergeState}
                    parCount={owned.par ?? 0}
                    reads={reads}
                    onPlace={onPlaceGift}
                    placeCost={giftPlaceCost}
                    onMerge={onMergeGifts}
                    onMove={onMoveGift}
                    onExpand={onExpandGrid}
                    onCollapse={collapseHandler}
                    onSendGift={onSendGift}
                    resonanceState={buffState?.quantumResonance}
                  />
                )}
                {mg.buildingId === 'ex' && gardenState && (
                  <Garden
                    gardenState={gardenState}
                    exCount={owned.ex ?? 0}
                    onPlant={onPlant}
                    onHarvest={onHarvest}
                    onClearWilted={onClearWilted}
                    onCollapse={collapseHandler}
                    onHarvestChoice={onGardenHarvestChoice}
                    resonanceState={buffState?.quantumResonance}
                  />
                )}
                {mg.buildingId === 'algo' && marketState && (
                  <StockMarket
                    marketState={marketState}
                    algoCount={owned.algo ?? 0}
                    reads={reads}
                    prodPerSec={prodPerSec ?? 0}
                    onInvest={onInvestFutures}
                    onCollect={onCollectFuture}
                    onCollapse={collapseHandler}
                  />
                )}
                {mg.buildingId === 'quantum' && (
                  <QuantumLab
                    quantumCount={owned.quantum ?? 0}
                    onResonance={onQuantumResonance}
                    onCollapse={collapseHandler}
                    cooldownEnd={buffState?.quantumCooldownEnd ?? 0}
                    resonanceState={buffState?.quantumResonance}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
