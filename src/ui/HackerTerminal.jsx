import { useState, useEffect, useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>[]{}';
const COOLDOWN = 10;

function scramble(len) {
  return Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

function makeSequence(length) {
  // A sequence is a set of clickable "nodes" numbered 1..length at random positions
  const nodes = [];
  for (let i = 0; i < length; i++) {
    nodes.push({
      id: i + 1,
      x: 10 + Math.random() * 75,
      y: 15 + Math.random() * 60,
      label: scramble(4 + Math.floor(Math.random() * 4)),
      revealed: false,
    });
  }
  return nodes;
}

export default function HackerTerminal({ perSecond, onEarn, hkrCount, onCollapse }) {
  const [phase, setPhase] = useState('idle'); // idle | active | result | cooldown
  const [nodes, setNodes] = useState([]);
  const [nextTarget, setNextTarget] = useState(1);
  const [chain, setChain] = useState(0);
  const [earned, setEarned] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [totalChains, setTotalChains] = useState(0);
  const [bestChain, setBestChain] = useState(0);
  const [log, setLog] = useState([]);
  const cooldownRef = useRef(null);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const startRound = useCallback(() => {
    const seqLen = Math.min(5 + Math.floor(hkrCount / 10), 10);
    setNodes(makeSequence(seqLen));
    setNextTarget(1);
    setChain(0);
    setTimeLeft(15);
    setLog([{ text: '> 入侵序列已啟動...', color: '#22c55e' }]);
    setPhase('active');
  }, [hkrCount]);

  const finishRound = useCallback((finalChain) => {
    clearInterval(timerRef.current);
    const bonus = Math.max(1, Math.floor(perSecond * finalChain * 0.5));
    setEarned(bonus);
    setBestChain(prev => Math.max(prev, finalChain));
    setTotalChains(prev => prev + 1);
    if (onEarn) onEarn(bonus);
    setPhase('result');
    setCooldown(COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) { clearInterval(cooldownRef.current); setPhase('idle'); return 0; }
        return c - 1;
      });
    }, 1000);
  }, [perSecond, onEarn]);

  // Countdown timer
  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setPhase('timeout');
          clearInterval(timerRef.current);
          // finish with whatever chain we have
          setNodes(prev => {
            const final = prev.filter(n => n.revealed).length;
            finishRound(final);
            return prev;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    clearInterval(cooldownRef.current);
    clearInterval(timerRef.current);
  }, []);

  const handleNodeClick = useCallback((node) => {
    if (phase !== 'active' || node.revealed) return;
    if (node.id !== nextTarget) {
      // Wrong node — add error log
      setLog(prev => [...prev.slice(-4), { text: `> ERROR: 序列錯誤，重置中...`, color: '#ef4444' }]);
      // Reset revealed but keep chain score at what was achieved
      const achieved = nextTarget - 1;
      finishRound(achieved);
      return;
    }
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, revealed: true } : n));
    setNextTarget(t => t + 1);
    setChain(c => c + 1);
    setLog(prev => [...prev.slice(-4), {
      text: `> NODE_${node.id} 已解鎖 [${node.label}]`,
      color: '#22c55e',
    }]);

    if (node.id === nodes.length) {
      // Completed all nodes!
      finishRound(nodes.length);
    }
  }, [phase, nextTarget, nodes, finishRound]);

  const chainColor = chain >= 8 ? '#f59e0b' : chain >= 5 ? '#10b981' : '#22c55e';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(0,0,0,.85)',
        borderBottom: '1px solid rgba(34,197,94,.2)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>💻</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, fontSize: 14, color: '#22c55e',
          }}>駭客終端</span>
          {bestChain > 0 && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: '#22c55e', fontWeight: 600,
              background: 'rgba(34,197,94,.1)',
              borderRadius: 4, padding: '2px 6px',
            }}>
              最長鏈 ×{bestChain}
            </span>
          )}
        </div>
        <button
          onClick={onCollapse}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#22c55e', fontWeight: 600,
            padding: '2px 6px', fontFamily: "'JetBrains Mono',monospace",
          }}
        >▲ 收合</button>
      </div>

      {/* Terminal body */}
      <div style={{
        flex: 1, background: 'rgba(0,5,0,.92)',
        display: 'flex', flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Stats */}
        <div style={{
          display: 'flex', gap: 12, padding: '8px 14px',
          borderBottom: '1px solid rgba(34,197,94,.1)',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#22c55e' }}>
            完成序列: <span style={{ fontWeight: 700 }}>{totalChains}</span>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#22c55e' }}>
            駭客: <span style={{ fontWeight: 700 }}>{hkrCount}</span>
          </div>
          {phase === 'active' && (
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: timeLeft <= 5 ? '#ef4444' : '#22c55e', marginLeft: 'auto' }}>
              ⏱ {timeLeft}s
            </div>
          )}
        </div>

        {phase === 'idle' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              color: '#22c55e', fontSize: 13, textAlign: 'center',
              lineHeight: 1.7,
            }}>
              {'>'} 按順序點擊加密節點<br />
              {'>'} 全部解鎖即可獲得最大獎勵<br />
              {'>'} 點錯順序會提前結束
            </div>
            <button
              onClick={startRound}
              style={{
                background: 'transparent',
                border: '1px solid #22c55e',
                color: '#22c55e',
                borderRadius: 6, padding: '8px 24px',
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 13, cursor: 'pointer',
              }}
            >
              {'> INITIATE_HACK'}
            </button>
          </div>
        )}

        {phase === 'active' && (
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            {/* Log panel */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 60, padding: '4px 10px',
              borderTop: '1px solid rgba(34,197,94,.1)',
              overflow: 'hidden',
            }}>
              {log.map((l, i) => (
                <div key={i} style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 10, color: l.color, lineHeight: 1.4,
                }}>{l.text}</div>
              ))}
            </div>

            {/* Node field */}
            <div style={{ position: 'absolute', inset: '0 0 68px 0' }}>
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%,-50%)',
                    cursor: node.revealed ? 'default' : 'pointer',
                    border: `1.5px solid ${node.revealed ? '#22c55e' : node.id === nextTarget ? '#f59e0b' : 'rgba(34,197,94,.35)'}`,
                    borderRadius: 6,
                    padding: '4px 8px',
                    background: node.revealed ? 'rgba(34,197,94,.15)' : 'rgba(0,5,0,.8)',
                    color: node.revealed ? '#22c55e' : node.id === nextTarget ? '#f59e0b' : 'rgba(34,197,94,.5)',
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 11, fontWeight: 700,
                    transition: 'all .15s',
                    boxShadow: node.id === nextTarget && !node.revealed
                      ? '0 0 10px rgba(245,158,11,.4)' : 'none',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: node.id === nextTarget ? 2 : 1,
                  }}
                >
                  {node.revealed ? `✓ NODE_${node.id}` : `[${node.id}] ${node.label}`}
                </div>
              ))}
              {/* Chain counter */}
              <div style={{
                position: 'absolute', top: 8, right: 10,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 20, fontWeight: 800, color: chainColor,
                textShadow: `0 0 10px ${chainColor}`,
              }}>
                ×{chain}
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              color: '#22c55e', fontSize: 28, fontWeight: 800,
            }}>
              鏈 ×{chain}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              color: '#f59e0b', fontSize: 20, fontWeight: 700,
            }}>
              +{earned.toLocaleString()} 已讀
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono',monospace",
              color: 'rgba(34,197,94,.5)', fontSize: 11,
            }}>
              {'>'} 冷卻 {cooldown}s
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
