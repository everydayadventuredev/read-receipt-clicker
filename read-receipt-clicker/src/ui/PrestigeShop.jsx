import { useState, useRef, useEffect } from 'react';
import { SKILL_TREE_NODES, BRANCHES, getCapstoneBlocker } from '../game/prestige.js';

const branchList = Object.values(BRANCHES).sort((a, b) => a.order - b.order);

function getNodesByBranch(branch) {
  return SKILL_TREE_NODES.filter(n => n.branch === branch);
}

function getNodeState(node, boughtPrestige, prestigePower) {
  if (boughtPrestige.has(node.id)) return 'bought';
  // Check capstone mutual exclusion
  if (getCapstoneBlocker(node.id, boughtPrestige)) return 'excluded';
  const prereqsMet = !node.requires?.length || node.requires.every(r => boughtPrestige.has(r));
  if (!prereqsMet) return 'locked';
  if (prestigePower >= node.cost) return 'available';
  return 'unaffordable';
}

export default function PrestigeShop({ prestigePower, boughtPrestige, onBuy }) {
  const [activeBranch, setActiveBranch] = useState('root');
  const [justBought, setJustBought] = useState(new Set());
  const prevBoughtRef = useRef(new Set());

  // Detect newly purchased for animation
  useEffect(() => {
    const newlyBought = new Set();
    boughtPrestige.forEach(id => {
      if (!prevBoughtRef.current.has(id)) newlyBought.add(id);
    });
    if (newlyBought.size > 0) {
      setJustBought(newlyBought);
      const t = setTimeout(() => setJustBought(new Set()), 700);
      prevBoughtRef.current = new Set(boughtPrestige);
      return () => clearTimeout(t);
    }
    prevBoughtRef.current = new Set(boughtPrestige);
  }, [boughtPrestige]);

  const branchNodes = getNodesByBranch(activeBranch);
  const tiers = [...new Set(branchNodes.map(n => n.tier))].sort((a, b) => a - b);

  return (
    <div style={{ padding: '8px 0' }}>
      <style>{`
        @keyframes skillGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(99,102,241,.2), inset 0 0 6px rgba(99,102,241,.05); }
          50% { box-shadow: 0 0 14px rgba(99,102,241,.35), inset 0 0 10px rgba(99,102,241,.1); }
        }
        @keyframes skillBuy {
          0% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.55; }
        }
      `}</style>

      {/* Balance */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8, padding: '0 2px',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
          ✦ 已讀天賦樹
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14, fontWeight: 700, color: 'var(--purple-text)',
          background: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.12))',
          padding: '3px 10px', borderRadius: 10,
          border: '1px solid rgba(99,102,241,.2)',
        }}>
          ✦ {prestigePower}
        </span>
      </div>

      {/* Branch tabs */}
      <div style={{
        display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 6,
        marginBottom: 8, WebkitOverflowScrolling: 'touch',
      }}>
        {branchList.map(br => {
          const nodes = getNodesByBranch(br.id);
          const bought = nodes.filter(n => boughtPrestige.has(n.id)).length;
          const isActive = activeBranch === br.id;
          return (
            <button
              key={br.id}
              onClick={() => setActiveBranch(br.id)}
              style={{
                flexShrink: 0,
                padding: '5px 10px', borderRadius: 8, border: 'none',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, #6366f1, #4338ca)'
                  : 'var(--surface-hover)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {br.emoji} {br.name}
              <span style={{
                marginLeft: 4, fontSize: 10, opacity: 0.8,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {bought}/{nodes.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tier rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tiers.map(tier => {
          const tierNodes = branchNodes.filter(n => n.tier === tier);
          return (
            <div key={tier}>
              {/* Tier label */}
              <div style={{
                fontSize: 9, color: 'var(--text-muted)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: 1,
                marginBottom: 4, paddingLeft: 2,
              }}>
                Tier {tier}
              </div>

              {/* Nodes in this tier */}
              <div style={{
                display: 'flex', gap: 6, flexWrap: 'wrap',
              }}>
                {tierNodes.map(node => {
                  const state = getNodeState(node, boughtPrestige, prestigePower);
                  const wasJustBought = justBought.has(node.id);

                  // Prerequisite names for locked tooltip
                  const missingPrereqs = (node.requires || [])
                    .filter(r => !boughtPrestige.has(r))
                    .map(r => SKILL_TREE_NODES.find(n => n.id === r)?.name || r);

                  // Rival name for excluded state
                  const rivalId = getCapstoneBlocker(node.id, boughtPrestige);
                  const rivalName = rivalId ? (SKILL_TREE_NODES.find(n => n.id === rivalId)?.name || '對立天賦') : null;

                  return (
                    <div
                      key={node.id}
                      onClick={() => state === 'available' && onBuy(node)}
                      style={{
                        flex: '1 1 0',
                        minWidth: 90, maxWidth: 160,
                        position: 'relative',
                        background: state === 'bought' ? '#f0fdf4'
                          : state === 'excluded' ? '#fef2f2'
                          : state === 'available' ? '#fafaff'
                          : '#fafafa',
                        border: state === 'bought' ? '1.5px solid #86efac'
                          : state === 'excluded' ? '1.5px solid #fca5a5'
                          : state === 'available' ? '1.5px solid #6366f1'
                          : state === 'unaffordable' ? '1px solid #e2e8f0'
                          : '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '8px 8px 6px',
                        cursor: state === 'available' ? 'pointer' : 'default',
                        opacity: state === 'locked' ? 0.35
                          : state === 'excluded' ? 0.4
                          : state === 'unaffordable' ? 0.65
                          : state === 'bought' ? 0.7
                          : 1,
                        transition: 'all .2s',
                        userSelect: 'none',
                        animation: state === 'available' ? 'skillGlow 2.5s ease-in-out infinite'
                          : wasJustBought ? 'skillBuy .5s ease-out forwards'
                          : 'none',
                      }}
                    >
                      {/* Bought check */}
                      {state === 'bought' && (
                        <div style={{
                          position: 'absolute', top: 4, right: 6,
                          fontSize: 11, color: '#16a34a', fontWeight: 700,
                        }}>✓</div>
                      )}

                      {/* Lock icon */}
                      {(state === 'locked' || state === 'excluded') && (
                        <div style={{
                          position: 'absolute', top: 4, right: 6,
                          fontSize: 10, color: state === 'excluded' ? '#ef4444' : '#94a3b8',
                        }}>{state === 'excluded' ? '⛔' : '🔒'}</div>
                      )}

                      {/* Emoji + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{node.emoji}</span>
                        <span style={{
                          fontSize: 12, fontWeight: 700, color: 'var(--text)',
                          lineHeight: 1.2,
                        }}>{node.name}</span>
                      </div>

                      {/* Description */}
                      <div style={{
                        fontSize: 10, color: 'var(--text-secondary)',
                        lineHeight: 1.3, marginBottom: 4,
                      }}>
                        {node.desc}
                      </div>

                      {/* Cost / Status */}
                      <div style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}>
                        {state === 'bought' ? null
                          : state === 'available' ? (
                            <span style={{ color: 'var(--purple-text)' }}>✦{node.cost}</span>
                          ) : state === 'excluded' ? (
                            <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 400 }}>
                              已選: {rivalName}
                            </span>
                          ) : state === 'locked' ? (
                            <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 400 }}>
                              需要: {missingPrereqs.join(', ')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>
                              ✦{node.cost}
                              <span style={{ marginLeft: 3, fontSize: 9, color: 'var(--amber-text)' }}>
                                差{node.cost - prestigePower}
                              </span>
                            </span>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total progress */}
      <div style={{
        marginTop: 10, padding: '6px 0', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10, color: 'var(--text-muted)',
      }}>
        <span>
          總進度: {SKILL_TREE_NODES.filter(n => boughtPrestige.has(n.id)).length}/{SKILL_TREE_NODES.length}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          已花費 ✦{SKILL_TREE_NODES.filter(n => boughtPrestige.has(n.id)).reduce((s, n) => s + n.cost, 0)}
        </span>
      </div>
    </div>
  );
}
