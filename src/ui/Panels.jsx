import { useState } from 'react';
import { ACHIEVEMENTS } from '../game/achievements.js';
import { MILESTONES } from '../game/milestones.js';
import { UPGRADES } from '../game/upgrades.js';
import { fmt } from '../utils/format.js';

export function StatsPanel({ reads, allTime, prodPerSec, clickPower, owned, seenMilestones, prestigeCount, prestigePower, boughtUpgrades }) {
  const totalOwned = Object.values(owned).reduce((a, b) => a + b, 0);
  const rows = [
    ['生涯已讀', fmt(allTime),    '#4f46e5'],
    ['產能/秒',  fmt(prodPerSec), '#b45309'],
    ['點擊力',   fmt(clickPower), '#4f46e5'],
    ['已讀大師', totalOwned,       '#1e293b'],
    ['里程碑',   `${seenMilestones.size}/${MILESTONES.length}`, '#f59e0b'],
    ['重生',     `${prestigeCount}次`, '#ec4899'],
    ['已讀之力', `✦${prestigePower}`, '#4f46e5'],
    ['升級',     `${boughtUpgrades.size}/${UPGRADES.length}`, '#b45309'],
  ];

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {rows.map(([label, value, color]) => (
          <div key={label} style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '8px 14px', minWidth: 85,
            textAlign: 'center', flex: '1 0 auto',
            boxShadow: '0 1px 2px rgba(0,0,0,.04)',
          }}>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 0.5 }}>{label}</div>
            <div style={{
              fontSize: 14, fontWeight: 800, color,
              fontFamily: "'JetBrains Mono',monospace", marginTop: 2,
            }}>{value}</div>
          </div>
        ))}
      </div>
      {allTime === 0 && (
        <div style={{ color: '#94a3b8', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
          點擊左邊的訊息開始累積數據
        </div>
      )}
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

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
      {ACHIEVEMENTS.map(a => {
        const done = unlockedAchievements.has(a.id);
        return (
          <div
            key={a.id}
            onMouseEnter={() => setHoveredId(a.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: 'relative',
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: done ? 14 : 11,
              background: done ? 'rgba(217,119,6,.06)' : '#f1f5f9',
              border: done ? '1px solid rgba(217,119,6,.15)' : '1px solid #e2e8f0',
              opacity: done ? 1 : 0.4,
              cursor: 'default',
              transition: 'all .15s',
            }}
          >
            {done ? a.icon : '?'}
            {hoveredId === a.id && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%',
                transform: 'translateX(-50%)', marginBottom: 4,
                background: 'rgba(30,41,59,.9)', color: '#fff',
                padding: '4px 8px', borderRadius: 6,
                fontSize: 10, whiteSpace: 'nowrap', zIndex: 50,
                pointerEvents: 'none',
              }}>
                {done ? a.name : a.desc}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
