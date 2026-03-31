import React, { useState, useEffect } from 'react';
import { CHANNELS, getPriceScale, RISK_LEVELS, MAX_FUTURES, FUTURES_DURATION } from '../game/stockMarket.js';
import { fmt } from '../utils/format.js';
import GameIcon, { getStockIcon } from './GameIcon.jsx';

/**
 * Compact Sparkline for channel cards.
 */
function Sparkline({ data, color, width = 80, height = 28 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color}
        strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function fmtTime(ms) {
  if (ms <= 0) return '已到期';
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Channel card for futures — shows price trend, invest button.
 */
function ChannelCard({ channel, price, history, priceScale, onInvest, disabled }) {
  const prevPrice = history.length >= 2 ? history[history.length - 2] : price;
  const change = prevPrice ? ((price - prevPrice) / prevPrice * 100) : 0;
  const sparkColor = change >= 0 ? 'var(--success)' : 'var(--error)';
  const changeColor = change > 0.5 ? 'var(--success)' : change < -0.5 ? 'var(--error)' : 'var(--text-muted)';

  return (
    <div style={{
      padding: '8px 12px', borderRadius: 10,
      border: '1px solid #e8eaed',
      background: 'rgba(255,255,255,.6)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {getStockIcon(channel.id)
          ? <GameIcon src={getStockIcon(channel.id)} size={18} color="#64748b" />
          : <span style={{ fontSize: 18 }}>{channel.emoji}</span>
        }
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{channel.name}</span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 12, fontWeight: 600, color: changeColor,
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkline data={history} color={sparkColor} width={60} height={22} />
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onInvest(channel.id)}
          disabled={disabled}
          style={{
            padding: '4px 12px', fontSize: 11, fontWeight: 700,
            color: disabled ? 'var(--text-disabled)' : '#6366f1',
            background: disabled ? '#f8fafc' : 'rgba(99,102,241,.08)',
            border: `1px solid ${disabled ? 'var(--border)' : 'rgba(99,102,241,.2)'}`,
            borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
          }}
        >投資</button>
      </div>
    </div>
  );
}

/**
 * Active future card — shows countdown and expected return.
 */
function FutureCard({ future, currentPrice, priceScale, onCollect }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (future.maturesAt <= Date.now()) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [future.maturesAt]);

  const channel = CHANNELS.find(c => c.id === future.channelId);
  const risk = RISK_LEVELS[future.riskLevel];
  const remaining = Math.max(0, future.maturesAt - now);
  const matured = remaining <= 0;
  const progress = Math.min(100, ((now - future.investedAt) / FUTURES_DURATION) * 100);

  // Preview current return
  const priceRatio = currentPrice / future.investPrice;
  const normalized = Math.max(0, Math.min(2, priceRatio));
  const t = normalized / 2;
  const previewMult = risk.minMult + t * (risk.maxMult - risk.minMult);
  const previewPayout = Math.round(future.amount * previewMult);
  const profit = previewPayout - future.amount;

  return (
    <div style={{
      padding: '10px 14px', borderRadius: 12,
      animation: matured ? 'futureMatured 2s ease-in-out infinite' : undefined,
      background: matured
        ? 'linear-gradient(135deg, rgba(16,185,129,.08), rgba(16,185,129,.03))'
        : 'rgba(99,102,241,.04)',
      border: matured
        ? '1.5px solid rgba(16,185,129,.25)'
        : '1px solid rgba(99,102,241,.12)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{channel?.emoji ?? '📊'}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{channel?.name}</span>
        <span style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 6,
          background: future.riskLevel === 'aggressive' ? 'rgba(239,68,68,.08)' : 'rgba(16,185,129,.08)',
          color: future.riskLevel === 'aggressive' ? '#ef4444' : '#10b981',
          fontWeight: 700,
        }}>{risk.label}</span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text)',
          fontFamily: "'JetBrains Mono',monospace",
        }}>{fmt(future.amount)}</span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4, borderRadius: 2,
        background: 'rgba(148,163,184,.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: matured ? '#10b981' : '#6366f1',
          width: `${progress}%`,
          transition: 'width 1s linear',
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 12, color: 'var(--text-muted)',
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {matured ? '✅ 到期' : fmtTime(remaining)}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: profit >= 0 ? 'var(--success)' : 'var(--error)',
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          ×{previewMult.toFixed(2)} ({profit >= 0 ? '+' : ''}{fmt(profit)})
        </span>
        {matured && (
          <button onClick={() => onCollect(future.id)} style={{
            padding: '4px 14px', fontSize: 12, fontWeight: 800,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', border: 'none', borderRadius: 8,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,.3)',
          }}>
            收取 {fmt(previewPayout)}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * StockMarket — 已讀期貨 futures-based UI.
 */
export default function StockMarket({ marketState, algoCount, reads, prodPerSec, onInvest, onCollect, onCollapse }) {
  const [investModal, setInvestModal] = useState(null); // { channelId } | null
  const [investAmount, setInvestAmount] = useState('');
  const [investRisk, setInvestRisk] = useState('safe');

  const priceScale = getPriceScale(prodPerSec);
  const futures = marketState.futures ?? [];
  const canInvest = futures.length < MAX_FUTURES;

  const handleInvest = (channelId) => {
    setInvestModal({ channelId });
    setInvestAmount(Math.floor(reads * 0.1).toString());
    setInvestRisk('safe');
  };

  const confirmInvest = () => {
    if (!investModal) return;
    const amount = parseInt(investAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > reads) return;
    onInvest(investModal.channelId, amount, investRisk);
    setInvestModal(null);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minHeight: 0,
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {onCollapse && (
            <button onClick={onCollapse} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: 'var(--text-muted)', padding: '2px 4px', lineHeight: 1,
            }} title="收合">▲</button>
          )}
          <span style={{ fontSize: 18 }}>📈</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>已讀期貨</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono',monospace",
          }}>
            {futures.length}/{MAX_FUTURES} 合約
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', minHeight: 0,
        padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {/* Active futures */}
        {futures.length > 0 && (
          <div>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
              padding: '4px 6px', marginBottom: 4,
            }}>進行中的期貨</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {futures.map(f => (
                <FutureCard
                  key={f.id}
                  future={f}
                  currentPrice={marketState.prices[f.channelId] ?? 1}
                  priceScale={priceScale}
                  onCollect={onCollect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Channel grid — pick one to invest */}
        <div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
            padding: '4px 6px', marginBottom: 4,
          }}>頻道行情</div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
          }}>
            {CHANNELS.map(ch => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                price={marketState.prices[ch.id] ?? ch.basePrice}
                history={marketState.history[ch.id] ?? [ch.basePrice]}
                priceScale={priceScale}
                onInvest={handleInvest}
                disabled={!canInvest}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 12px', flexShrink: 0,
        borderTop: '1px solid var(--surface-hover)',
        fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
      }}>
        鎖定已讀 15 分鐘 · 價格漲跌決定回報
      </div>

      {/* Invest modal */}
      {investModal && (() => {
        const ch = CHANNELS.find(c => c.id === investModal.channelId);
        return (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }} onClick={() => setInvestModal(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 20, padding: '20px 24px',
              boxShadow: '0 8px 40px rgba(0,0,0,.15)',
              maxWidth: 320, width: '90%',
              animation: 'modalSlideUp 0.25s ease-out',
            }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 32 }}>{ch?.emoji}</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  投資 {ch?.name} 期貨
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  鎖定 15 分鐘，到期後依價格變化結算
                </div>
              </div>

              {/* Amount input */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  投資金額（可用：{fmt(Math.floor(reads))}）
                </div>
                <input
                  type="number"
                  value={investAmount}
                  onChange={e => setInvestAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', fontSize: 16, fontWeight: 700,
                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                    fontFamily: "'JetBrains Mono',monospace",
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[0.1, 0.25, 0.5].map(pct => (
                    <button key={pct} onClick={() => setInvestAmount(Math.floor(reads * pct).toString())}
                      style={{
                        flex: 1, padding: '4px', fontSize: 11, fontWeight: 700,
                        background: 'rgba(99,102,241,.06)', color: '#6366f1',
                        border: '1px solid rgba(99,102,241,.15)', borderRadius: 6, cursor: 'pointer',
                      }}>
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk level */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  風險等級
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setInvestRisk('safe')} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 12,
                    background: investRisk === 'safe' ? 'rgba(16,185,129,.1)' : '#fafafa',
                    border: investRisk === 'safe' ? '2px solid #10b981' : '1.5px solid #e2e8f0',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>穩健</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>×0.9 ~ ×1.2</div>
                  </button>
                  <button onClick={() => setInvestRisk('aggressive')} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 12,
                    background: investRisk === 'aggressive' ? 'rgba(239,68,68,.08)' : '#fafafa',
                    border: investRisk === 'aggressive' ? '2px solid #ef4444' : '1.5px solid #e2e8f0',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>積極</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>×0.5 ~ ×1.8</div>
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <button onClick={confirmInvest}
                disabled={!investAmount || parseInt(investAmount, 10) <= 0 || parseInt(investAmount, 10) > reads}
                style={{
                  width: '100%', padding: '12px', fontSize: 15, fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff', border: 'none', borderRadius: 12,
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,.3)',
                  opacity: (!investAmount || parseInt(investAmount, 10) <= 0 || parseInt(investAmount, 10) > reads) ? 0.5 : 1,
                }}>
                確認投資
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
