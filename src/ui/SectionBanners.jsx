/**
 * SectionBanners — subtle 8-bit pixel art backgrounds for each UI section.
 * These are atmospheric and low-opacity so they don't overwhelm content.
 */

const W = 800;

// ══════════════════════════════════════
// HEADER — pixel skyline with antennas and signal towers
// ══════════════════════════════════════
export function HeaderBanner() {
  return (
    <svg viewBox={`0 0 ${W} 48`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08, pointerEvents: 'none' }}>
      {/* City skyline silhouette */}
      {[0, 80, 140, 220, 300, 380, 440, 520, 600, 680, 740].map((x, i) => {
        const h = 12 + (i * 7 + 5) % 20;
        return <rect key={i} x={x} y={48 - h} width={40 + (i % 3) * 12} height={h} fill="#1e293b" />;
      })}
      {/* Antennas */}
      {[60, 200, 400, 560, 720].map((x, i) => (
        <g key={`a${i}`}>
          <rect x={x} y={8 + i * 3} width={2} height={20} fill="#1e293b" />
          <rect x={x - 3} y={6 + i * 3} width={8} height={3} fill="#1e293b" />
          {/* Signal waves */}
          <rect x={x + 6} y={8 + i * 3} width={4} height={1.5} fill="#6366f1" opacity={0.5} />
          <rect x={x + 12} y={6 + i * 3} width={3} height={1.5} fill="#6366f1" opacity={0.3} />
        </g>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// TICKER — news desk with scrolling tape
// ══════════════════════════════════════
export function TickerBanner() {
  return (
    <svg viewBox={`0 0 ${W} 32`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
      {/* Ticker tape lines */}
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 42} y={14} width={28} height={3} rx={1} fill="#f59e0b" />
      ))}
      {/* Dots between segments */}
      {Array.from({ length: 19 }, (_, i) => (
        <rect key={`d${i}`} x={i * 42 + 32} y={15} width={3} height={3} rx={1.5} fill="#f59e0b" opacity={0.5} />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// COUNTER — phone screen with notifications
// ══════════════════════════════════════
export function CounterBanner() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
      {/* Giant phone outline */}
      <rect x={80} y={20} width={240} height={260} rx={16} fill="none" stroke="#6366f1" strokeWidth={3} />
      <rect x={160} y={268} width={80} height={4} rx={2} fill="#6366f1" />
      {/* Notification badges */}
      {[
        [120, 60, 160, 24], [120, 92, 140, 24], [120, 124, 180, 24],
        [120, 156, 120, 24], [120, 188, 160, 24], [120, 220, 140, 24],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx={6} fill="#6366f1" opacity={0.15} />
          <rect x={x + 8} y={y + 6} width={w * 0.6} height={3} fill="#6366f1" opacity={0.2} />
          <rect x={x + 8} y={y + 13} width={w * 0.4} height={3} fill="#6366f1" opacity={0.15} />
          {/* Red badge */}
          {i % 2 === 0 && <rect x={x + w - 12} y={y + 4} width={10} height={10} rx={5} fill="#ef4444" opacity={0.3} />}
        </g>
      ))}
      {/* Check marks (已讀) */}
      {[90, 150, 210].map((y, i) => (
        <g key={`ck${i}`} opacity={0.2}>
          <rect x={290} y={y} width={8} height={2} fill="#10b981" transform={`rotate(-45 ${294} ${y + 1})`} />
          <rect x={290} y={y} width={14} height={2} fill="#10b981" transform={`rotate(35 ${290} ${y + 1})`} />
        </g>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// CHAT AREA — message bubbles pattern
// ══════════════════════════════════════
export function ChatBanner() {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, pointerEvents: 'none' }}>
      {/* Scattered chat bubbles */}
      {[
        [40, 30, 120, true], [200, 60, 100, false], [60, 120, 140, true],
        [180, 160, 80, false], [30, 220, 160, true], [200, 250, 120, false],
        [50, 310, 100, true], [190, 340, 140, false],
      ].map(([x, y, w, left], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={28} rx={14} fill={left ? '#10b981' : '#6366f1'} />
          <rect x={x + 12} y={y + 8} width={w * 0.6} height={3} fill="#fff" opacity={0.3} />
          <rect x={x + 12} y={y + 15} width={w * 0.4} height={3} fill="#fff" opacity={0.2} />
          {/* Tail */}
          {left
            ? <rect x={x - 4} y={y + 20} width={8} height={8} fill="#10b981" />
            : <rect x={x + w - 4} y={y + 20} width={8} height={8} fill="#6366f1" />
          }
        </g>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// GARDEN — greenhouse with soil rows and sun
// ══════════════════════════════════════
export function GardenBanner() {
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
      {/* Greenhouse frame */}
      <rect x={20} y={20} width={W - 40} height={560} rx={8} fill="none" stroke="#22c55e" strokeWidth={2} />
      {/* Arch roof */}
      <rect x={20} y={20} width={W - 40} height={40} fill="#22c55e" opacity={0.1} />
      {/* Soil rows */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={40} y={80 + i * 65} width={W - 80} height={8} fill="#8B4513" opacity={0.2} />
          {/* Small sprouts */}
          {Array.from({ length: 6 }, (_, j) => (
            <g key={j}>
              <rect x={80 + j * 120} y={72 + i * 65} width={2} height={8} fill="#22c55e" opacity={0.3} />
              <rect x={76 + j * 120} y={68 + i * 65} width={10} height={4} rx={2} fill="#22c55e" opacity={0.2} />
            </g>
          ))}
        </g>
      ))}
      {/* Sun */}
      <rect x={700} y={30} width={40} height={40} rx={20} fill="#fdcb6e" opacity={0.15} />
      {/* Sun rays */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return <line key={i} x1={720} y1={50} x2={720 + Math.cos(angle) * 40} y2={50 + Math.sin(angle) * 40}
          stroke="#fdcb6e" strokeWidth={1.5} opacity={0.1} />;
      })}
      {/* Water drops */}
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={`w${i}`} x={60 + i * 50} y={40 + (i * 37) % 500} width={2} height={5} fill="#60a5fa" opacity={0.15} />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// STOCK MARKET — trading screens and charts
// ══════════════════════════════════════
export function StockBanner() {
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
      {/* Monitor grid */}
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 4 }, (_, col) => {
          const x = 30 + col * 190;
          const y = 20 + row * 95;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width={170} height={75} rx={4} fill="#1e293b" opacity={0.3} />
              <rect x={x + 4} y={y + 4} width={162} height={50} fill="#0f172a" opacity={0.2} />
              {/* Chart line */}
              <polyline
                points={Array.from({ length: 8 }, (_, i) => {
                  const px = x + 8 + i * 20;
                  const py = y + 30 + Math.sin((row + col + i) * 1.2) * 15;
                  return `${px},${py}`;
                }).join(' ')}
                fill="none" stroke={col % 2 === 0 ? '#10b981' : '#ef4444'} strokeWidth={1.5} opacity={0.3}
              />
              {/* Price text placeholder */}
              <rect x={x + 8} y={y + 58} width={40} height={4} fill="#94a3b8" opacity={0.2} />
            </g>
          );
        })
      )}
    </svg>
  );
}

// ══════════════════════════════════════
// MERGE — gift workshop with conveyor belt
// ══════════════════════════════════════
export function MergeBanner() {
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
      {/* Conveyor belts */}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <rect x={20} y={60 + i * 140} width={W - 40} height={8} fill="#78909c" opacity={0.3} />
          {/* Rollers */}
          {Array.from({ length: 12 }, (_, j) => (
            <rect key={j} x={40 + j * 62} y={62 + i * 140} width={4} height={4} rx={2} fill="#546e7a" opacity={0.4} />
          ))}
          {/* Gift boxes on belt */}
          {Array.from({ length: 5 }, (_, j) => {
            const x = 60 + j * 150;
            const size = 16 + (j % 3) * 6;
            return (
              <g key={`g${j}`}>
                <rect x={x} y={60 + i * 140 - size} width={size} height={size} rx={2}
                  fill={['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'][j % 5]} opacity={0.2} />
                {/* Ribbon */}
                <rect x={x + size / 2 - 1} y={60 + i * 140 - size} width={2} height={size} fill="#fff" opacity={0.15} />
                <rect x={x} y={60 + i * 140 - size / 2 - 1} width={size} height={2} fill="#fff" opacity={0.15} />
              </g>
            );
          })}
        </g>
      ))}
      {/* Stars / sparkles */}
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={`s${i}`} x={(i * 43 + 17) % W} y={(i * 67 + 23) % 600}
          width={3} height={3} fill="#fbbf24" opacity={0.15}
          transform={`rotate(45 ${(i * 43 + 17) % W + 1.5} ${(i * 67 + 23) % 600 + 1.5})`} />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// UPGRADE — workshop/lab bench
// ══════════════════════════════════════
export function UpgradeBanner() {
  return (
    <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none' }}>
      {/* Workbench */}
      <rect x={10} y={240} width={780} height={8} fill="#8B4513" opacity={0.3} />
      {/* Shelves */}
      {[60, 140, 220].map((y, i) => (
        <g key={i}>
          <rect x={10} y={y} width={780} height={3} fill="#a1887f" opacity={0.2} />
          {/* Items on shelf */}
          {Array.from({ length: 8 }, (_, j) => {
            const x = 30 + j * 96;
            const shapes = ['rect', 'tall', 'wide'];
            const shape = shapes[(i + j) % 3];
            return (
              <g key={j}>
                {shape === 'rect' && <rect x={x} y={y - 16} width={14} height={16} rx={2}
                  fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][j % 4]} opacity={0.2} />}
                {shape === 'tall' && <rect x={x + 2} y={y - 24} width={10} height={24} rx={2}
                  fill={['#8b5cf6', '#06b6d4', '#f97316', '#ec4899'][j % 4]} opacity={0.2} />}
                {shape === 'wide' && <rect x={x - 4} y={y - 12} width={22} height={12} rx={2}
                  fill={['#3b82f6', '#22c55e', '#eab308', '#dc2626'][j % 4]} opacity={0.15} />}
              </g>
            );
          })}
        </g>
      ))}
      {/* Gears */}
      {[100, 400, 700].map((cx, i) => (
        <g key={`gear${i}`} opacity={0.1}>
          {Array.from({ length: 8 }, (_, t) => {
            const angle = (t / 8) * Math.PI * 2;
            return <rect key={t} x={cx + Math.cos(angle) * 20 - 3} y={40 + Math.sin(angle) * 20 - 3}
              width={6} height={6} fill="#6366f1" />;
          })}
          <rect x={cx - 8} y={32} width={16} height={16} rx={8} fill="#6366f1" />
        </g>
      ))}
    </svg>
  );
}
