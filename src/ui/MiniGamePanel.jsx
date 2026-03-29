import React from 'react';
import { MINIGAME_REGISTRY, getUnlockedMinigames } from '../game/minigames.js';
import StockMarket from './StockMarket.jsx';
import Garden from './Garden.jsx';
import MergeGame from './MergeGame.jsx';
import { GardenBanner, StockBanner, MergeBanner } from './SectionBanners.jsx';

/**
 * Generic mini-game container for the middle column.
 * Shows a tab bar of available mini-games (tied to buildings),
 * and renders the active mini-game component.
 */
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
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 }}>
            子系統
          </div>
          <div style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5, maxWidth: 260 }}>
            建築達到特定等級後，將解鎖專屬子系統玩法
          </div>
          <div style={{ fontSize: 10, color: '#d1d5db', fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>
            即將推出...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: 0, overflow: 'hidden',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 2, padding: '6px 12px 0',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>
        {allEntries.map(mg => {
          const isUnlocked = (owned[mg.buildingId] ?? 0) >= mg.unlockCount;
          const isActive = activeMiniGame === mg.buildingId;

          return (
            <button
              key={mg.buildingId}
              onClick={() => isUnlocked && setActiveMiniGame(mg.buildingId)}
              disabled={!isUnlocked}
              style={{
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: isActive ? 700 : 500,
                color: isUnlocked ? (isActive ? '#4338ca' : '#64748b') : '#cbd5e1',
                background: isActive ? 'rgba(99,102,241,.06)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: isUnlocked ? 'pointer' : 'default',
                transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 4,
                opacity: isUnlocked ? 1 : 0.5,
              }}
            >
              <span>{mg.emoji}</span>
              <span>{mg.name}</span>
              {!isUnlocked && <span style={{ fontSize: 10 }}>🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Mini-game body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        {/* Section background */}
        {activeMiniGame === 'ex' && <GardenBanner />}
        {activeMiniGame === 'algo' && <StockBanner />}
        {activeMiniGame === 'par' && <MergeBanner />}
        {activeMiniGame === 'par' && mergeState && (
          <MergeGame
            mergeState={mergeState}
            parCount={owned.par ?? 0}
            reads={reads}
            onPlace={onPlaceGift}
            placeCost={giftPlaceCost}
            onMerge={onMergeGifts}
            onMove={onMoveGift}
            onExpand={onExpandGrid}
          />
        )}
        {activeMiniGame === 'ex' && gardenState && (
          <Garden
            gardenState={gardenState}
            exCount={owned.ex ?? 0}
            onPlant={onPlant}
            onHarvest={onHarvest}
            onClearWilted={onClearWilted}
          />
        )}
        {activeMiniGame === 'algo' && marketState && (
          <StockMarket
            marketState={marketState}
            algoCount={owned.algo ?? 0}
            reads={reads}
            prodPerSec={prodPerSec ?? 0}
            onBuy={onBuyShare}
            onSell={onSellShare}
            onBuyAll={onBuyAllShares}
            onSellAll={onSellAllShares}
          />
        )}
      </div>
    </div>
  );
}
