import { useState, useEffect, useRef } from 'react';
import { TICKER_TIERS } from '../game/ticker.js';
import { pk } from '../utils/format.js';

export default function Ticker({ allTime }) {
  const [current, setCurrent] = useState('');
  const [visible, setVisible] = useState(true);
  const poolRef = useRef([]);

  useEffect(() => {
    poolRef.current = TICKER_TIERS.filter(t => allTime >= t.minAt).flatMap(t => t.messages);
  }, [allTime]);

  useEffect(() => {
    const pool = TICKER_TIERS.flatMap(t => t.messages);
    poolRef.current = pool;
    setCurrent(pk(pool) || '');

    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(pk(poolRef.current) || '');
        setVisible(true);
      }, 300);
    }, 5500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      padding: '10px 16px',
      background: 'rgba(255,255,255,.8)',
      borderTop: '1px solid #e2e8f0',
      minHeight: 40,
      display: 'flex', alignItems: 'center',
      flexShrink: 0, gap: 8,
    }}>
      <span style={{
        fontSize: 13, flexShrink: 0,
        opacity: 0.5,
      }}>📰</span>
      <span style={{
        color: '#94a3b8', fontSize: 12,
        transition: 'opacity .3s',
        opacity: visible ? 0.7 : 0,
        lineHeight: 1.4,
        fontStyle: 'italic',
      }}>{current}</span>
    </div>
  );
}
