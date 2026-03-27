import { ACHIEVEMENTS } from '../game/achievements.js';
import { MILESTONES } from '../game/milestones.js';
import { UPGRADES } from '../game/upgrades.js';
import { fmt } from '../utils/format.js';

const panelBase = {
  padding: '14px 16px',
  background: 'rgba(255,255,255,.02)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,.03)',
  animation: 'si .25s cubic-bezier(.4,0,.2,1)',
};

export function StatsPanel({ reads, allTime, prodPerSec, clickPower, owned, seenMilestones, prestigeCount, prestigePower, boughtUpgrades }) {
  const totalOwned = Object.values(owned).reduce((a, b) => a + b, 0);
  const rows = [
    ['生涯已讀', fmt(allTime),    '#c4b5fd'],
    ['產能/秒',  fmt(prodPerSec), '#a3e635'],
    ['點擊力',   fmt(clickPower), '#c4b5fd'],
    ['已讀大師', totalOwned,       '#e2e8f0'],
    ['里程碑',   `${seenMilestones.size}/${MILESTONES.length}`, '#f59e0b'],
    ['重生',     `${prestigeCount}次`, '#ec4899'],
    ['已讀之力', `✦${prestigePower}`, '#c4b5fd'],
    ['升級',     `${boughtUpgrades.size}/${UPGRADES.length}`, '#a3e635'],
  ];

  return (
    <div style={panelBase}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {rows.map(([label, value, color]) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.04)',
            borderRadius: 14, padding: '8px 14px', minWidth: 85,
            textAlign: 'center', flex: '1 0 auto',
          }}>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: 0.5 }}>{label}</div>
            <div style={{
              fontSize: 14, fontWeight: 800, color,
              fontFamily: "'JetBrains Mono',monospace", marginTop: 2,
            }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LogPanel({ log }) {
  return (
    <div style={{ ...panelBase, maxHeight: 200, overflowY: 'auto' }}>
      {log.length === 0
        ? <div style={{ fontSize: 13, color: '#374151' }}>還沒有紀錄⋯</div>
        : log.map((l, i) => (
          <div key={l.id} style={{
            fontSize: 12, color: '#9ca3af',
            padding: '5px 0',
            borderBottom: i < log.length - 1 ? '1px solid rgba(255,255,255,.02)' : 'none',
            lineHeight: 1.5,
          }}>{l.m}</div>
        ))
      }
    </div>
  );
}

export function AchievementsPanel({ unlockedAchievements }) {
  return (
    <div style={{ ...panelBase, maxHeight: 220, overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
        {ACHIEVEMENTS.map(a => {
          const done = unlockedAchievements.has(a.id);
          return (
            <div key={a.id} style={{
              background: done
                ? 'linear-gradient(135deg, rgba(163,230,53,.06), rgba(139,92,246,.04))'
                : 'rgba(255,255,255,.02)',
              border: `1px solid ${done ? 'rgba(163,230,53,.15)' : 'rgba(255,255,255,.03)'}`,
              borderRadius: 16, padding: '10px 12px',
              opacity: done ? 1 : 0.35,
              transition: 'all .2s',
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{done ? a.icon : '❓'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: done ? '#e2e8f0' : '#374151' }}>
                {done ? a.name : '???'}
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
                {done ? a.desc : '繼續探索...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
