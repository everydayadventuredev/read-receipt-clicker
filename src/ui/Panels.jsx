import { useState } from 'react';
import { ACHIEVEMENTS } from '../game/achievements.js';
import { MILESTONES } from '../game/milestones.js';
import { UPGRADES } from '../game/upgrades.js';
import { fmt } from '../utils/format.js';

export function StatsPanel({ reads, allTime, prodPerSec, clickPower, owned, seenMilestones, prestigeCount, prestigePower, boughtUpgrades }) {
  const totalOwned = Object.values(owned).reduce((a, b) => a + b, 0);
  const left = [
    ['生涯', fmt(allTime), '#4f46e5'],
    ['產能', `${fmt(prodPerSec)}/s`, '#b45309'],
    ['點擊', fmt(clickPower), '#4f46e5'],
    ['大師', totalOwned, '#1e293b'],
  ];
  const right = [
    ['里程', `${seenMilestones.size}/${MILESTONES.length}`, '#f59e0b'],
    ['重生', `${prestigeCount}次`, '#ec4899'],
    ['✦力', prestigePower, '#4f46e5'],
    ['升級', `${boughtUpgrades.size}/${UPGRADES.length}`, '#b45309'],
  ];

  const renderCol = (items) => items.map(([label, value, color]) => (
    <div key={label} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '2px 0',
    }}>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: 700, color,
        fontFamily: "'JetBrains Mono',monospace",
      }}>{value}</span>
    </div>
  ));

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px',
      padding: '6px 8px',
      background: 'rgba(255,255,255,.6)',
      borderRadius: 8, border: '1px solid #e2e8f0',
    }}>
      <div>{renderCol(left)}</div>
      <div>{renderCol(right)}</div>
    </div>
  );
}

export function LogPanel({ log }) {
  return (
    <div style={{ padding: '12px 0', maxHeight: 200, overflowY: 'auto' }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>紀錄</div>
      {log.length === 0
        ? <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>開始已讀就會有紀錄出現</div>
        : log.map((l, i) => (
          <div key={l.id} style={{
            fontSize: 12, color: '#64748b',
            padding: '5px 0',
            borderBottom: i < log.length - 1 ? '1px solid #f1f5f9' : 'none',
            lineHeight: 1.5,
          }}>{l.m}</div>
        ))
      }
    </div>
  );
}

export function AchievementBadges({ unlockedAchievements }) {
  const [hoveredId, setHoveredId] = useState(null);
  const unlocked = ACHIEVEMENTS.filter(a => unlockedAchievements.has(a.id));
  const lockedCount = ACHIEVEMENTS.length - unlocked.length;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
      {unlocked.map(a => (
        <div
          key={a.id}
          onMouseEnter={() => setHoveredId(a.id)}
          onMouseLeave={() => setHoveredId(null)}
          style={{
            position: 'relative',
            width: 24, height: 24, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
            background: 'rgba(217,119,6,.06)',
            border: '1px solid rgba(217,119,6,.15)',
            cursor: 'default',
          }}
        >
          {a.icon}
          {hoveredId === a.id && (
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%',
              transform: 'translateX(-50%)', marginBottom: 4,
              background: 'rgba(30,41,59,.9)', color: '#fff',
              padding: '3px 7px', borderRadius: 5,
              fontSize: 10, whiteSpace: 'nowrap', zIndex: 50,
              pointerEvents: 'none',
            }}>
              {a.name}
            </div>
          )}
        </div>
      ))}
      {lockedCount > 0 && (
        <span style={{
          fontSize: 10, color: '#94a3b8',
          fontFamily: "'JetBrains Mono',monospace",
          padding: '2px 6px',
        }}>+{lockedCount}</span>
      )}
    </div>
  );
}
