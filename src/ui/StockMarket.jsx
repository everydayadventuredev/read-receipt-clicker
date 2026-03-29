import React, { useState, useEffect, useRef } from 'react';
import { CHANNELS, getPortfolioValue, getTotalCostBasis, getPriceScale } from '../game/stockMarket.js';
import { fmt } from '../utils/format.js';

/**
 * Compact Sparkline for grid cards.
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

/**
 * Compact channel card — fits in 2×3 grid.
 */
function ChannelCard({ channel, price, prevPrice, history, holdings, costBasis, canBuy, onBuy, onSell, priceScale }) {
  const [flash, setFlash] = useState(null);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price > prevPriceRef.current) setFlash('up');
    else if (price < prevPriceRef.current) setFlash('down');
    prevPriceRef.current = price;
    const t = setTimeout(() => setFlash(null), 400);
    return () => clearTimeout(t);
  }, [price]);

  const change = prevPrice ? ((price - prevPrice) / prevPrice * 100) : 0;
  const changeColor = change > 0.5 ? '#10b981' : change < -0.5 ? '#ef4444' : '#94a3b8';
  const sparkColor = change >= 0 ? '#10b981' : '#ef4444';

  const scaledPrice = price * (priceScale ?? 1);
  const profit = holdings > 0 ? (holdings * scaledPrice) - costBasis : 0;

  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: 10,
      border: '1px solid #e8eaed',
      transition: 'background .3s',
      background: flash === 'up' ? 'rgba(16,185,129,.06)'
        : flash === 'down' ? 'rgba(239,68,68,.06)'
        : 'rgba(255,255,255,.6)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {/* Row 1: emoji + name + price */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 22 }}>{channel.emoji}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{channel.name}</span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 20, fontWeight: 800, color: '#1e293b',
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {fmt(Math.round(price * (priceScale ?? 1)))}
        </span>
      </div>

      {/* Row 2: sparkline + change */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Sparkline data={history} color={sparkColor} />
        <span style={{
          fontSize: 13, fontWeight: 600, color: changeColor,
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </span>
        {holdings > 0 && (
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: profit >= 0 ? '#10b981' : '#ef4444',
            fontFamily: "'JetBrains Mono',monospace",
            marginLeft: 'auto',
          }}>
            {holdings}股 {profit >= 0 ? '▲' : '▼'}{fmt(Math.abs(Math.round(profit)))}
          </span>
        )}
      </div>

      {/* Row 3: buy/sell buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onBuy}
          disabled={!canBuy}
          style={{
            flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 700,
            color: !canBuy ? '#cbd5e1' : '#10b981',
            background: !canBuy ? '#f8fafc' : 'rgba(16,185,129,.08)',
            border: `1px solid ${!canBuy ? '#e2e8f0' : 'rgba(16,185,129,.25)'}`,
            borderRadius: 6, cursor: !canBuy ? 'default' : 'pointer',
          }}
        >買入</button>
        <button
          onClick={onSell}
          disabled={holdings <= 0}
          style={{
            flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 700,
            color: holdings <= 0 ? '#cbd5e1' : '#ef4444',
            background: holdings <= 0 ? '#f8fafc' : 'rgba(239,68,68,.06)',
            border: `1px solid ${holdings <= 0 ? '#e2e8f0' : 'rgba(239,68,68,.25)'}`,
            borderRadius: 6, cursor: holdings <= 0 ? 'default' : 'pointer',
          }}
        >賣出</button>
      </div>
    </div>
  );
}

/**
 * StockMarket — Feed 操盤手 compact 2×3 grid layout.
 */
export default function StockMarket({ marketState, algoCount, reads, prodPerSec, onBuy, onSell, onBuyAll, onSellAll }) {
  const portfolioValue = getPortfolioValue(marketState, prodPerSec);
  const totalCost = getTotalCostBasis(marketState);
  const priceScale = getPriceScale(prodPerSec);
  const totalProfit = portfolioValue - totalCost;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden', minHeight: 0,
    }}>
      {/* Header — compact */}
      <div style={{
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>📈</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>Feed 操盤手</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#4338ca',
            fontFamily: "'JetBrains Mono',monospace",
          }}>
            {fmt(Math.round(portfolioValue))}
          </span>
          {totalCost > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: totalProfit >= 0 ? '#10b981' : '#ef4444',
              fontFamily: "'JetBrains Mono',monospace",
            }}>
              {totalProfit >= 0 ? '+' : ''}{fmt(Math.round(totalProfit))}
            </span>
          )}
          {onBuyAll && (
            <button onClick={onBuyAll} style={{
              padding: '2px 8px', fontSize: 11, fontWeight: 700,
              color: '#10b981', background: 'rgba(16,185,129,.08)',
              border: '1px solid rgba(16,185,129,.2)', borderRadius: 6, cursor: 'pointer',
            }}>全買</button>
          )}
          {onSellAll && (
            <button onClick={onSellAll} style={{
              padding: '2px 8px', fontSize: 11, fontWeight: 700,
              color: '#ef4444', background: 'rgba(239,68,68,.06)',
              border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, cursor: 'pointer',
            }}>全賣</button>
          )}
        </div>
      </div>

      {/* 2×3 Channel Grid */}
      <div style={{
        flex: 1, overflowY: 'auto', minHeight: 0,
        padding: '8px',
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 6, alignContent: 'start',
      }}>
        {CHANNELS.map(ch => {
          const price = marketState.prices[ch.id] ?? ch.basePrice;
          const history = marketState.history[ch.id] ?? [ch.basePrice];
          const prevPrice = history.length >= 2 ? history[history.length - 2] : price;
          const holdings = marketState.holdings[ch.id] ?? 0;
          const basis = marketState.costBasis?.[ch.id] ?? 0;
          return (
            <ChannelCard key={ch.id} channel={ch} price={price} prevPrice={prevPrice}
              history={history} holdings={holdings} costBasis={basis} priceScale={priceScale}
              canBuy={reads >= Math.round(price * priceScale)} onBuy={() => onBuy(ch.id)} onSell={() => onSell(ch.id)} />
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 12px', flexShrink: 0,
        borderTop: '1px solid #f1f5f9',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
      }}>
        低買高賣 · 賣出 = 按當前價格換回已讀
      </div>
    </div>
  );
}
