import { useState, useEffect, useRef } from 'react';
import { TICKER_TIERS } from '../game/ticker.js';
import { pk, fmt } from '../utils/format.js';

/**
 * Unified news-style ticker that merges:
 * 1. Event messages (achievements, unlocks, upgrades, guilt events)
 * 2. Lore/news messages (from TICKER_TIERS, filtered by allTime)
 *
 * Shows one message at a time with fade transitions.
 * Events interrupt lore rotation and display for at least 3 seconds.
 */

function getEventColor(msg) {
  if (msg.includes('成就') || msg.includes('🎖️')) return '#f59e0b';
  if (msg.includes('解鎖') || msg.includes('🔓')) return '#10b981';
  if (msg.includes('Synergy') || msg.includes('🔗')) return '#8b5cf6';
  if (msg.includes('罪惡') || msg.includes('😔') || msg.includes('😭') || msg.includes('💸')) return '#ef4444';
  if (msg.includes('升級') || msg.includes('⬆️')) return '#3b82f6';
  return '#6366f1';
}

export default function Ticker({ allTime, logEntries = [], stats }) {
  const [display, setDisplay] = useState({ text: '', color: '#6366f1', isEvent: false });
  const [visible, setVisible] = useState(true);
  const poolRef = useRef([]);
  const eventQueueRef = useRef([]);
  const lastLogLenRef = useRef(0);
  const busyRef = useRef(false);

  // Update lore pool when allTime changes
  useEffect(() => {
    poolRef.current = TICKER_TIERS.filter(t => allTime >= t.minAt).flatMap(t => t.messages);
    if (poolRef.current.length === 0) {
      poolRef.current = TICKER_TIERS[0].messages;
    }
  }, [allTime]);

  // Detect new log entries and queue them
  useEffect(() => {
    if (logEntries.length > lastLogLenRef.current) {
      const newEntries = logEntries.slice(0, logEntries.length - lastLogLenRef.current);
      newEntries.forEach(entry => {
        eventQueueRef.current.push(entry.m);
      });
    }
    lastLogLenRef.current = logEntries.length;
  }, [logEntries]);

  // Show a message with fade transition
  const showMessage = (text, isEvent) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setVisible(false);
    setTimeout(() => {
      const color = isEvent ? getEventColor(text) : '#6366f1';
      setDisplay({ text, color, isEvent });
      setVisible(true);
      busyRef.current = false;
    }, 300);
  };

  // Initialize with a lore message
  useEffect(() => {
    const pool = TICKER_TIERS.flatMap(t => t.messages);
    poolRef.current = pool;
    const initial = pk(pool) || '';
    setDisplay({ text: initial, color: '#6366f1', isEvent: false });
  }, []);

  // Main rotation interval
  useEffect(() => {
    const iv = setInterval(() => {
      // Priority: event queue first, then random lore
      if (eventQueueRef.current.length > 0) {
        const msg = eventQueueRef.current.shift();
        showMessage(msg, true);
      } else {
        const lore = pk(poolRef.current);
        if (lore) showMessage(lore, false);
      }
    }, 5500);

    // Also check for events more frequently (every 1.5s)
    const eventCheck = setInterval(() => {
      if (eventQueueRef.current.length > 0 && !busyRef.current) {
        const msg = eventQueueRef.current.shift();
        showMessage(msg, true);
      }
    }, 1500);

    return () => { clearInterval(iv); clearInterval(eventCheck); };
  }, []);

  return (
    <div style={{
      padding: '12px 16px',
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fef9c3 100%)',
      borderBottom: '2px solid #d97706',
      minHeight: 64,
      display: 'flex', alignItems: 'center',
      flexShrink: 0, gap: 10,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6), 0 2px 4px rgba(0,0,0,.06)',
    }}>
      {/* Bulletin board texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 8px, #92400e 8px, #92400e 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, #92400e 8px, #92400e 9px)',
        pointerEvents: 'none',
      }} />
      {/* Pin decorations */}
      <div style={{
        position: 'absolute', top: 4, left: 10,
        width: 8, height: 8, borderRadius: '50%',
        background: '#ef4444', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      }} />
      <div style={{
        position: 'absolute', top: 4, right: 10,
        width: 8, height: 8, borderRadius: '50%',
        background: '#3b82f6', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
      }} />

      {/* Icon prefix */}
      <span style={{
        fontSize: 18, flexShrink: 0,
        filter: display.isEvent ? 'none' : 'grayscale(0.3)',
      }}>{display.isEvent ? '📌' : '📰'}</span>

      {/* Message + stats column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Message text */}
        <span style={{
          color: display.isEvent ? '#92400e' : '#78350f',
          fontSize: 14,
          fontWeight: display.isEvent ? 700 : 500,
          transition: 'opacity .3s, color .3s',
          opacity: visible ? 1 : 0,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          letterSpacing: 0.3,
        }}>{display.text}</span>

        {/* Stats strip */}
        {stats && stats.allTime > 0 && (
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            fontSize: 10, fontFamily: "'JetBrains Mono',monospace",
            color: '#92400e', opacity: 0.7,
          }}>
            <span>生涯 {fmt(stats.allTime)}</span>
            <span>·</span>
            <span>產能 {fmt(stats.prodPerSec)}/s</span>
            <span>·</span>
            <span>建築 {stats.totalBuildings}</span>
            <span>·</span>
            <span>升級 {stats.upgrades}/{stats.totalUpgrades}</span>
            {stats.prestigeCount > 0 && (<>
              <span>·</span>
              <span>重生 {stats.prestigeCount}次</span>
              <span>·</span>
              <span>✦{stats.prestigePower}</span>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}
