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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}>
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
// GARDEN — vibrant farm landscape
// ══════════════════════════════════════
export function GardenBanner() {
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25, pointerEvents: 'none' }}>
      {/* Sky */}
      <rect width={W} height={200} fill="#87CEEB" opacity={0.3} />
      {/* Ground */}
      <rect y={180} width={W} height={420} fill="#7ec87e" opacity={0.3} />
      {/* Sun */}
      <circle cx={680} cy={50} r={30} fill="#FFD93D" opacity={0.4} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={`sr${i}`} x1={680 + Math.cos(a) * 35} y1={50 + Math.sin(a) * 35}
          x2={680 + Math.cos(a) * 50} y2={50 + Math.sin(a) * 50}
          stroke="#FFD93D" strokeWidth={2.5} opacity={0.3} />;
      })}
      {/* Clouds */}
      {[60, 300, 520].map((cx, i) => (
        <g key={`cl${i}`}>
          <rect x={cx} y={30 + i * 25} width={60} height={20} rx={10} fill="#fff" opacity={0.4} />
          <rect x={cx + 12} y={20 + i * 25} width={36} height={16} rx={8} fill="#fff" opacity={0.35} />
        </g>
      ))}
      {/* Wheat field */}
      <rect x={30} y={200} width={200} height={100} rx={6} fill="#F4D03F" opacity={0.4} />
      <rect x={30} y={200} width={200} height={100} rx={6} fill="none" stroke="#D4AC0D" strokeWidth={1.5} opacity={0.3} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={`wh${i}`}>
          <rect x={42 + i * 16} y={220} width={2} height={22} fill="#B7950B" opacity={0.5} />
          <circle cx={43 + i * 16} cy={216} r={4} fill="#F9E154" opacity={0.45} />
        </g>
      ))}
      {/* Purple flower field */}
      <rect x={260} y={200} width={180} height={100} rx={6} fill="#D7BDE2" opacity={0.35} />
      {Array.from({ length: 15 }, (_, i) => (
        <circle key={`pf${i}`} cx={278 + (i % 5) * 32} cy={225 + Math.floor(i / 5) * 28}
          r={5} fill="#8E44AD" opacity={0.4} />
      ))}
      {/* Pumpkin patch */}
      <rect x={480} y={200} width={150} height={100} rx={6} fill="#F5CBA7" opacity={0.35} />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={`pk${i}`}>
          <circle cx={510 + (i % 3) * 40} cy={240 + Math.floor(i / 3) * 35} r={10} fill="#E67E22" opacity={0.4} />
          <rect x={508 + (i % 3) * 40} y={228 + Math.floor(i / 3) * 35} width={3} height={8} fill="#27AE60" opacity={0.4} />
        </g>
      ))}
      {/* Green rows */}
      <rect x={30} y={330} width={300} height={80} rx={6} fill="#ABEBC6" opacity={0.35} />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={`gr${i}`}>
          <rect x={40} y={340 + i * 14} width={280} height={3} rx={1} fill="#196F3D" opacity={0.25} />
          {Array.from({ length: 10 }, (_, j) => (
            <circle key={j} cx={50 + j * 28} cy={340 + i * 14} r={4} fill="#27AE60" opacity={0.35} />
          ))}
        </g>
      ))}
      {/* Sunflowers */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`sf${i}`}>
          <rect x={370 + i * 30} y={345} width={2} height={28} fill="#27AE60" opacity={0.35} />
          <circle cx={371 + i * 30} cy={340} r={9} fill="#F4D03F" opacity={0.4} />
          <circle cx={371 + i * 30} cy={340} r={4} fill="#8B6914" opacity={0.35} />
        </g>
      ))}
      {/* Fence */}
      {Array.from({ length: 20 }, (_, i) => (
        <g key={`fn${i}`}>
          <rect x={25 + i * 35} y={430} width={4} height={20} fill="#8B6914" opacity={0.35} />
          {i < 19 && <rect x={25 + i * 35} y={436} width={35} height={2.5} fill="#A67C00" opacity={0.3} />}
        </g>
      ))}
      {/* Trees */}
      {[60, 180, 350, 500, 650].map((tx, i) => (
        <g key={`tr${i}`}>
          <rect x={tx - 4} y={470} width={8} height={25} fill="#8B6914" opacity={0.3} />
          <circle cx={tx} cy={462} r={18} fill="#27AE60" opacity={0.3} />
          <circle cx={tx - 8} cy={466} r={12} fill="#2ECC71" opacity={0.25} />
          <circle cx={tx + 9} cy={465} r={14} fill="#1ABC9C" opacity={0.22} />
        </g>
      ))}
      {/* Strawberries */}
      <rect x={30} y={460} width={180} height={60} rx={6} fill="#FADBD8" opacity={0.3} />
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={`sb${i}`} cx={50 + (i % 4) * 42} cy={480 + Math.floor(i / 4) * 25}
          r={6} fill="#E74C3C" opacity={0.35} />
      ))}
      {/* Pond */}
      <ellipse cx={580} cy={510} rx={50} ry={25} fill="#5DADE2" opacity={0.25} />
      <ellipse cx={575} cy={507} rx={20} ry={10} fill="#AED6F1" opacity={0.2} />
    </svg>
  );
}

// ══════════════════════════════════════
// STOCK MARKET — vibrant trading floor
// ══════════════════════════════════════
export function StockBanner() {
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}>
      {/* Dark trading room background */}
      <rect width={W} height={600} fill="#0f172a" opacity={0.15} />
      {/* Monitor wall — 3×4 grid */}
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => {
          const x = 40 + col * 240;
          const y = 20 + row * 145;
          const green = (row + col) % 2 === 0;
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width={220} height={125} rx={6} fill="#1e293b" opacity={0.4} />
              <rect x={x + 6} y={y + 6} width={208} height={85} fill="#0f172a" opacity={0.3} />
              {/* Candlestick chart */}
              {Array.from({ length: 10 }, (_, i) => {
                const cx = x + 16 + i * 20;
                const h = 15 + Math.sin((row * 3 + col + i) * 1.5) * 12;
                const cy = y + 50 - h / 2;
                const up = Math.sin((row + col + i) * 2.1) > 0;
                return (
                  <g key={`c${i}`}>
                    <rect x={cx} y={cy - 5} width={1.5} height={h + 10} fill={up ? '#10b981' : '#ef4444'} opacity={0.4} />
                    <rect x={cx - 3} y={cy} width={8} height={h} fill={up ? '#10b981' : '#ef4444'} opacity={0.35} />
                  </g>
                );
              })}
              {/* Price ticker */}
              <rect x={x + 10} y={y + 98} width={60} height={6} rx={2} fill={green ? '#10b981' : '#ef4444'} opacity={0.3} />
              <rect x={x + 80} y={y + 98} width={40} height={6} rx={2} fill="#94a3b8" opacity={0.2} />
              {/* Volume bars */}
              {Array.from({ length: 10 }, (_, i) => (
                <rect key={`v${i}`} x={x + 150 + i * 6} y={y + 105 - (5 + Math.sin(i + row) * 4)}
                  width={4} height={5 + Math.sin(i + row) * 4} fill="#6366f1" opacity={0.25} />
              ))}
            </g>
          );
        })
      )}
      {/* Ticker tape at bottom */}
      <rect y={580} width={W} height={20} fill="#1e293b" opacity={0.3} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`tk${i}`}>
          <rect x={20 + i * 95} y={584} width={50} height={5} rx={2} fill={i % 2 === 0 ? '#10b981' : '#ef4444'} opacity={0.35} />
          <rect x={75 + i * 95} y={584} width={25} height={5} rx={2} fill="#64748b" opacity={0.2} />
        </g>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// MERGE — vibrant gift workshop
// ══════════════════════════════════════
export function MergeBanner() {
  const giftColors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8B5CF6', '#06b6d4', '#f97316'];
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}>
      {/* Warm workshop background */}
      <rect width={W} height={600} fill="#FEF3C7" opacity={0.15} />
      {/* Wooden shelves */}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={`sh${i}`}>
          <rect x={20} y={40 + i * 115} width={W - 40} height={6} fill="#92400E" opacity={0.25} />
          <rect x={20} y={46 + i * 115} width={W - 40} height={3} fill="#78350F" opacity={0.15} />
          {/* Gifts on shelf */}
          {Array.from({ length: 6 }, (_, j) => {
            const x = 50 + j * 120;
            const size = 20 + (j + i) % 4 * 8;
            const color = giftColors[(i * 3 + j) % giftColors.length];
            return (
              <g key={`g${j}`}>
                <rect x={x} y={40 + i * 115 - size} width={size} height={size} rx={3}
                  fill={color} opacity={0.3} />
                {/* Ribbon cross */}
                <rect x={x + size / 2 - 1.5} y={40 + i * 115 - size} width={3} height={size}
                  fill="#fff" opacity={0.2} />
                <rect x={x} y={40 + i * 115 - size / 2 - 1.5} width={size} height={3}
                  fill="#fff" opacity={0.2} />
                {/* Bow */}
                <circle cx={x + size / 2} cy={40 + i * 115 - size} r={4}
                  fill="#fff" opacity={0.25} />
              </g>
            );
          })}
        </g>
      ))}
      {/* Sparkles scattered */}
      {Array.from({ length: 30 }, (_, i) => {
        const x = (i * 47 + 13) % W;
        const y = (i * 73 + 19) % 600;
        const big = i % 5 === 0;
        return (
          <g key={`sp${i}`}>
            <rect x={x - 1} y={y - (big ? 5 : 3)} width={2} height={big ? 10 : 6}
              fill="#fbbf24" opacity={0.3} />
            <rect x={x - (big ? 5 : 3)} y={y - 1} width={big ? 10 : 6} height={2}
              fill="#fbbf24" opacity={0.3} />
          </g>
        );
      })}
      {/* Conveyor belt at bottom */}
      <rect x={0} y={575} width={W} height={25} fill="#78909c" opacity={0.2} />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={`r${i}`} cx={30 + i * 48} cy={587} r={5} fill="#546e7a" opacity={0.25} />
      ))}
    </svg>
  );
}

// ══════════════════════════════════════
// QUANTUM LAB — physics experiment room
// ══════════════════════════════════════
export function QuantumBanner() {
  return (
    <svg viewBox={`0 0 ${W} 600`} preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}>
      {/* Lab background */}
      <rect width={W} height={600} fill="#ecfeff" opacity={0.15} />
      {/* Probability wave (sine curve) */}
      <path d={`M 0 300 ${Array.from({ length: 40 }, (_, i) => {
        const x = i * 20;
        const y = 300 + Math.sin(i * 0.4) * 80;
        return `L ${x} ${y}`;
      }).join(' ')} L 800 300`}
        fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.2} />
      {/* Second wave */}
      <path d={`M 0 300 ${Array.from({ length: 40 }, (_, i) => {
        const x = i * 20;
        const y = 300 + Math.sin(i * 0.4 + 1.5) * 60;
        return `L ${x} ${y}`;
      }).join(' ')} L 800 300`}
        fill="none" stroke="#6366f1" strokeWidth={1.5} opacity={0.12} />
      {/* Lab equipment — test tubes */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`tt${i}`}>
          <rect x={60 + i * 90} y={440} width={14} height={60} rx={7}
            fill={['#22d3ee', '#6366f1', '#22c55e', '#f59e0b'][i % 4]} opacity={0.12} />
          <circle cx={67 + i * 90} cy={502} r={7} fill={['#22d3ee', '#6366f1', '#22c55e', '#f59e0b'][i % 4]}
            opacity={0.15} />
        </g>
      ))}
      {/* Atom diagrams */}
      {[[150, 150], [550, 200], [400, 450]].map(([cx, cy], i) => (
        <g key={`at${i}`}>
          <circle cx={cx} cy={cy} r={6} fill="#22d3ee" opacity={0.2} />
          <ellipse cx={cx} cy={cy} rx={30} ry={14} fill="none"
            stroke="#22d3ee" strokeWidth={1} opacity={0.15} />
          <ellipse cx={cx} cy={cy} rx={30} ry={14} fill="none"
            stroke="#6366f1" strokeWidth={1} opacity={0.12}
            transform={`rotate(60 ${cx} ${cy})`} />
        </g>
      ))}
      {/* Measurement ruler */}
      <rect x={20} y={290} width={760} height={4} rx={2} fill="#22d3ee" opacity={0.1} />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={`ru${i}`} x={20 + i * 38} y={286} width={1.5} height={12}
          fill="#22d3ee" opacity={0.12} />
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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.22, pointerEvents: 'none' }}>
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
