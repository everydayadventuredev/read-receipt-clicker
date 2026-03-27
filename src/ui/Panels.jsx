import { ACHIEVEMENTS } from '../game/achievements.js';
import { MILESTONES } from '../game/milestones.js';
import { UPGRADES } from '../game/upgrades.js';
import { fmt } from '../utils/format.js';

export function StatsPanel({ reads, allTime, prodPerSec, clickPower, owned, seenMilestones, prestigeCount, prestigePower, boughtUpgrades }) {
  const totalOwned = Object.values(owned).reduce((a, b) => a + b, 0);
  const rows = [
    ['生涯已讀', fmt(allTime),    '#7c3aed'],
    ['產能/秒',  fmt(prodPerSec), '#65a30d'],
    ['點擊力',   fmt(clickPower), '#7c3aed'],
    ['已讀大師', totalOwned,       '#1e293b'],
    ['里程碑',   `${seenMilestones.size}/${MILESTONES.length}`, '#f59e0b'],
    ['重生',     `${prestigeCount}次`, '#ec4899'],
    ['已讀之力', `✦${prestigePower}`, '#7c3aed'],
    ['升級',     `${boughtUpgrades.size}/${UPGRADES.length}`, '#65a30d'],
  ];

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {rows.map(([label, value, color]) => (
          <div key={label} style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14, padding: '8px 14px', minWidth: 85,
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
        ? <div style={{ fontSize: 13, color: '#94a3b8' }}>還沒有紀錄⋯</div>
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

export function AchievementsPanel({ unlockedAchievements }) {
  const doneCount = ACHIEVEMENTS.filter(a => unlockedAchievements.has(a.id)).length;

  return (
    <div style={{ padding: '12px 0', maxHeight: 220, overflowY: 'auto' }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>成就 <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>{doneCount}/{ACHIEVEMENTS.length}</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
        {ACHIEVEMENTS.map(a => {
          const done = unlockedAchievements.has(a.id);
          return (
            <div key={a.id} style={{
              background: done
                ? 'linear-gradient(135deg, rgba(163,230,53,.04), rgba(167,139,250,.03))'
                : '#f8fafc',
              border: `1px solid ${done ? 'rgba(163,230,53,.12)' : '#e2e8f0'}`,
              borderRadius: 16, padding: '10px 12px',
              opacity: done ? 1 : 0.35,
              transition: 'all .2s',
            }}>
              <div style={{ fontSize: 20, marginBottom: 3 }}>{done ? a.icon : '❓'}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: done ? '#1e293b' : '#cbd5e1' }}>
                {done ? a.name : '???'}
              </div>
              <div style={{ fontSize: 10, color: done ? '#64748b' : '#cbd5e1', marginTop: 2 }}>
                {done ? a.desc : '繼續探索...'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
