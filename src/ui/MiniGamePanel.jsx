import React from 'react';
import { MINIGAME_REGISTRY, getUnlockedMinigames } from '../game/minigames.js';
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

  // Storm cooldown state
  const stormCooldownEnd = buffState?.stormCooldownEnd ?? 0;
  const stormOnCooldown = stormCooldownEnd > Date.now();

  // Force re-render for cooldown countdown
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    if (!stormOnCooldown) return;
    const iv = setInterval(() => forceUpdate(n => n + 1), 1000);
    return () => clearInterval(iv);
  }, [stormOnCooldown]);

  const stormCooldownSecs = stormOnCooldown ? Math.max(0, Math.ceil((stormCooldownEnd - Date.now()) / 1000)) : 0;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: 0, overflowY: 'auto',
    }}>
      {/* Storm trigger bar */}
      {unlocked.length > 0 && (
        <div style={{
          padding: '8px 14px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(99,102,241,.04), rgba(99,102,241,.02))',
          borderBottom: '1px solid rgba(99,102,241,.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🌪️</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>已讀風暴</span>
          </div>
          {stormActive ? (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', animation: 'pulse 1s infinite' }}>進行中...</span>
          ) : stormOnCooldown ? (
            <span style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              {Math.floor(stormCooldownSecs / 60)}:{String(stormCooldownSecs % 60).padStart(2, '0')}
            </span>
          ) : (
            <button onClick={onStartStorm} style={{
              padding: '4px 14px', fontSize: 12, fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,.3)',
            }}>
              啟動 ▶
            </button>
          )}
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
