import { useState } from 'react';
import { ACHIEVEMENTS, getAchievementBonus } from '../game/achievements.js';
import { BUILDINGS } from '../game/buildings.js';
import { fmt } from '../utils/format.js';

/* ── Category definitions ── */

const CATEGORIES = [
  {
    id: 'alltime',
    label: '里程碑',
    icon: '🏆',
    filter: a => ['a1','a2','a3','a4','a5','a6','a14','at1','at2','at3','at4','at5','at6'].includes(a.id),
    sort: (a, b) => {
      // Sort by the threshold in the req function (ascending)
      const thresholds = { a1: 1, a2: 100, a3: 1e3, a4: 1e4, a5: 1e5, a6: 1e6, a14: 1e7, at1: 5e7, at2: 1e8, at3: 5e8, at4: 1e9, at5: 1e10, at6: 1e11 };
      return (thresholds[a.id] ?? 0) - (thresholds[b.id] ?? 0);
    },
  },
  {
    id: 'buildings',
    label: '建築收藏',
    icon: '🏰',
    filter: a => {
      // Building achievements: ids that start with a building id or are building-related
      const buildingIds = BUILDINGS.map(b => b.id);
      return buildingIds.some(bid => a.id.startsWith(bid)) ||
             ['a7','a8','a9','a13','a15','a16','a17','ex1','par1','bsy1'].includes(a.id);
    },
  },
  {
    id: 'speed',
    label: '速度',
    icon: '⚡',
    filter: a => ['a12','a18','a19','sp1','sp2','sp3'].includes(a.id),
  },
  {
    id: 'prestige',
    label: '重生',
    icon: '🌀',
    filter: a => ['a10','a11','a20','a21','pr1','a22'].includes(a.id),
  },
  {
    id: 'upgrades',
    label: '升級',
    icon: '🔧',
    filter: a => ['up1','a30','a31','up2','up3','up4'].includes(a.id),
  },
  {
    id: 'synergy',
    label: '綜效',
    icon: '🔗',
    filter: a => ['a23','a24','a25'].includes(a.id),
  },
  {
    id: 'events',
    label: '事件鏈',
    icon: '🎬',
    filter: a => ['a26','a27'].includes(a.id),
  },
  {
    id: 'minigame',
    label: '小遊戲',
    icon: '🎮',
    filter: a => ['a28','a29'].includes(a.id),
  },
  {
    id: 'hidden',
    label: '隱藏',
    icon: '🔮',
    filter: a => a.hidden === true,
  },
];

/* ── Category Section ── */

function CategorySection({ cat, achievements, unlockedAchievements, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const items = achievements.filter(cat.filter);
  if (cat.sort) items.sort(cat.sort);
  const unlocked = items.filter(a => unlockedAchievements.has(a.id));
  const total = cat.id === 'hidden' ? '?' : items.length;
  const count = unlocked.length;
  const allDone = cat.id !== 'hidden' && count === items.length;
  const hasBonus = unlocked.some(a => a.bonus);
  const categoryBonus = unlocked.reduce((s, a) => s + (a.bonus ?? 0), 0);

  return (
    <div style={{
      borderRadius: 8,
      border: allDone ? '1px solid rgba(16,185,129,.2)' : '1px solid var(--border-light)',
      background: allDone ? 'rgba(16,185,129,.03)' : 'rgba(255,255,255,.5)',
      overflow: 'hidden',
    }}>
      {/* Header — clickable toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 10px', border: 'none', background: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          minHeight: 40,
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>{cat.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', flex: 1 }}>
          {cat.label}
        </span>
        {hasBonus && categoryBonus > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--success)',
            fontFamily: "'JetBrains Mono',monospace",
          }}>+{(categoryBonus * 100).toFixed(0)}%</span>
        )}
        <span style={{
          fontSize: 11, fontWeight: 600, color: allDone ? 'var(--success)' : 'var(--text-muted)',
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {count}/{total}
        </span>
        <span style={{
          fontSize: 10, color: 'var(--text-muted)',
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform .15s',
        }}>▼</span>
      </button>

      {/* Progress bar — always visible */}
      {cat.id !== 'hidden' && (
        <div style={{
          height: 3, margin: '0 10px 6px',
          background: 'rgba(0,0,0,.04)', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${items.length > 0 ? (count / items.length) * 100 : 0}%`,
            background: allDone
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, var(--purple), var(--purple-dark))',
            transition: 'width .5s',
          }} />
        </div>
      )}

      {/* Achievement grid — collapsed by default */}
      {open && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: cat.id === 'buildings' ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 4, padding: '4px 8px 8px',
        }}>
          {items.map(a => {
            const done = unlockedAchievements.has(a.id);
            const isHidden = a.hidden && !done;

            return (
              <div
                key={a.id}
                title={done ? `${a.name}\n${a.desc}${a.bonus ? `\n+${(a.bonus * 100).toFixed(0)}% 產能` : ''}` : isHidden ? '???' : a.desc}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 7px', borderRadius: 6,
                  background: done ? 'rgba(217,119,6,.06)' : 'rgba(0,0,0,.02)',
                  border: done ? '1px solid rgba(217,119,6,.15)' : '1px solid transparent',
                  opacity: done ? 1 : 0.45,
                  transition: 'all .2s',
                }}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {isHidden ? '❓' : a.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: done ? 'var(--text)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {isHidden ? '???' : a.name}
                  </div>
                  {a.bonus && done && (
                    <div style={{
                      fontSize: 9, fontWeight: 700, color: 'var(--success)',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}>+{(a.bonus * 100).toFixed(0)}%</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Panel ── */

export default function MilestonePanel({ unlockedAchievements, allTime }) {
  const [expanded, setExpanded] = useState(true);
  const totalBonus = getAchievementBonus(unlockedAchievements);
  const unlockedCount = unlockedAchievements.size;
  const visibleTotal = ACHIEVEMENTS.filter(a => !a.hidden).length;
  const hiddenUnlocked = ACHIEVEMENTS.filter(a => a.hidden && unlockedAchievements.has(a.id)).length;
  const hiddenTotal = ACHIEVEMENTS.filter(a => a.hidden).length;

  // Find next allTime milestone to show progress
  const allTimeThresholds = [1, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 5e7, 1e8, 5e8, 1e9, 1e10, 1e11];
  const nextThreshold = allTimeThresholds.find(t => allTime < t);
  const prevThreshold = allTimeThresholds[allTimeThresholds.indexOf(nextThreshold) - 1] ?? 0;
  const progressToNext = nextThreshold
    ? Math.min(100, ((allTime - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(255,255,255,.4)',
    }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', border: 'none', background: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          minHeight: 44,
        }}
      >
        <span style={{ fontSize: 16 }}>🎖️</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
          成就
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {unlockedCount}/{visibleTotal}{hiddenUnlocked > 0 ? ` +${hiddenUnlocked}` : ''}
        </span>
        <div style={{ flex: 1 }} />
        {totalBonus > 0 && (
          <span style={{
            fontSize: 12, fontWeight: 800, color: 'var(--success)',
            fontFamily: "'JetBrains Mono',monospace",
            background: 'rgba(16,185,129,.08)',
            padding: '2px 8px', borderRadius: 6,
            border: '1px solid rgba(16,185,129,.15)',
          }}>
            +{(totalBonus * 100).toFixed(0)}% 產能
          </span>
        )}
        <span style={{
          fontSize: 12, color: 'var(--text-muted)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform .15s',
        }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Next milestone progress */}
          {nextThreshold && (
            <div style={{
              padding: '6px 10px', borderRadius: 8,
              background: 'rgba(99,102,241,.04)',
              border: '1px solid rgba(99,102,241,.1)',
              marginBottom: 4,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  下個里程碑
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--purple-text)',
                  fontFamily: "'JetBrains Mono',monospace",
                }}>
                  {fmt(allTime)} / {fmt(nextThreshold)}
                </span>
              </div>
              <div style={{
                height: 6, background: 'rgba(0,0,0,.06)', borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${progressToNext}%`,
                  background: 'linear-gradient(90deg, var(--purple), var(--purple-dark))',
                  transition: 'width .5s',
                }} />
              </div>
            </div>
          )}

          {/* Category sections */}
          {CATEGORIES.map(cat => (
            <CategorySection
              key={cat.id}
              cat={cat}
              achievements={ACHIEVEMENTS}
              unlockedAchievements={unlockedAchievements}
              defaultOpen={cat.id === 'alltime'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
