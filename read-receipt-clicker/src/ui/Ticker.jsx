import { useState, useEffect, useRef } from 'react';
import { TICKER_TIERS } from '../game/ticker.js';
import { pk } from '../utils/format.js';

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

export default function Ticker({ allTime, logEntries = [] }) {
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
      padding: '10px 16px',
      background: 'rgba(255,255,255,.85)',
      borderBottom: '1px solid var(--border)',
      minHeight: 52,
      display: 'flex', alignItems: 'center',
      flexShrink: 0, gap: 10,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle bottom accent instead of left bar */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 0, height: 2,
        background: `linear-gradient(90deg, ${display.color}40, transparent)`,
        transition: 'background .3s',
        borderRadius: 1,
      }} />

      {/* Icon prefix */}
      <span style={{
        fontSize: 16, flexShrink: 0,
        opacity: 0.7,
        transition: 'opacity .3s',
      }}>{display.isEvent ? '' : '📰'}</span>

      {/* Message text */}
      <span style={{
        color: display.isEvent ? 'var(--text)' : 'var(--text-secondary)',
        fontSize: 14,
        fontWeight: display.isEvent ? 600 : 500,
        transition: 'opacity .3s, color .3s',
        opacity: visible ? 1 : 0,
        lineHeight: 1.4,
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{display.text}</span>
    </div>
  );
}
