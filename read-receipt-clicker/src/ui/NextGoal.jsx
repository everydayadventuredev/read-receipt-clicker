/**
 * NextGoal — "下一個目標" indicator.
 *
 * Finds the nearest unlock target from 3 sources and shows the cheapest one:
 *  1. Next building unlock (allTime threshold)
 *  2. Next building purchase unlock (if player owns none yet of a visible building)
 *  3. Next upgrade threshold
 *
 * Shows a subtle progress bar so the player always knows what to aim for.
 */
import { UNLOCK_THRESHOLDS, BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';

function findNextGoal({ allTime, reads, owned, unlockedBuildings, buildingsList }) {
  const candidates = [];

  // 1. Nearest building allTime unlock
  for (const [id, threshold] of Object.entries(UNLOCK_THRESHOLDS)) {
    if (unlockedBuildings.has(id)) continue;
    if (allTime >= threshold) continue;
    const b = buildingsList.find(x => x.id === id);
    if (!b) continue;
    candidates.push({
      kind: 'unlock',
      label: `解鎖 ${b.emoji} ${b.name}`,
      current: allTime,
      target: threshold,
      progress: allTime / threshold,
      color: b.color,
    });
  }

  // 2. First-purchase for visible-but-unbought buildings
  for (const b of buildingsList) {
    if (!unlockedBuildings.has(b.id)) continue;
    if ((owned[b.id] ?? 0) > 0) continue;
    candidates.push({
      kind: 'buy-first',
      label: `首購 ${b.emoji} ${b.name}`,
      current: reads,
      target: b.baseCost,
      progress: reads / b.baseCost,
      color: b.color,
    });
  }

  if (candidates.length === 0) return null;

  // Sort by progress (closest to completion first)
  candidates.sort((a, b) => b.progress - a.progress);
  return candidates[0];
}

export default function NextGoal({ allTime, reads, owned, unlockedBuildings, buildingsList = BUILDINGS }) {
  const goal = findNextGoal({ allTime, reads, owned, unlockedBuildings, buildingsList });
  if (!goal) return null;

  const pct = Math.min(100, Math.max(0, goal.progress * 100));
  const color = goal.color || '#3b82f6';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      padding: '6px 10px',
      background: 'rgba(15,23,42,.04)',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      gap: 4,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
      }}>
        <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          下一個目標
        </span>
        <span style={{
          color: 'var(--text-secondary)',
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 9,
        }}>
          {fmt(Math.floor(goal.current))} / {fmt(goal.target)}
        </span>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700, color: 'var(--text)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {goal.label}
      </div>
      <div style={{
        height: 3, borderRadius: 2,
        background: 'rgba(0,0,0,.06)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color,
          transition: 'width .4s ease-out',
        }} />
      </div>
    </div>
  );
}
