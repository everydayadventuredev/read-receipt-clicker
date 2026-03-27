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

export function AchievementsPanel({ unlockedAchievements }) {
  const doneCount = ACHIEVEMENTS.filter(a => unlockedAchievements.has(a.id)).length;
  const unlocked = ACHIEVEMENTS.filter(a => unlockedAchievements.has(a.id));
  const locked = ACHIEVEMENTS.filter(a => !unlockedAchievements.has(a.id));

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
      }}>成就 <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10 }}>{doneCount}/{ACHIEVEMENTS.length}</span></div>

      {/* Unlocked achievements — expanded cards */}
      {unlocked.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {unlocked.map(a => (
            <div key={a.id} style={{
              background: 'linear-gradient(135deg, rgba(217,119,6,.04), rgba(99,102,241,.03))',
              border: '1px solid rgba(217,119,6,.12)',
              borderRadius: 10, padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{a.name}</div>
                <div style={{ fontSize: 10, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warm intro when no achievements unlocked */}
      {doneCount === 0 && (
        <div style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic', marginBottom: 8 }}>
          持續已讀就能解鎖成就
        </div>
      )}

      {/* Locked achievements — compact icon row */}
      {locked.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {locked.map(a => (
            <div key={a.id} style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: '#cbd5e1', opacity: 0.6,
            }}>?</div>
          ))}
        </div>
      )}
    </div>
  );
}
