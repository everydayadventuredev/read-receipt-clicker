/**
 * HeroBackground — Cookie Clicker-style dynamic background
 *
 * Uses a TWO-LAYER "permeation" approach instead of hard tier cuts:
 *   - Layer 1 (base): current tier, always opacity 1
 *   - Layer 2 (overlay): next tier, fades in as allTime progresses
 *
 * progress = (allTime - tierStart) / (nextTierStart - tierStart)
 * overlayOpacity = easeInOut(progress)
 *
 * Result: smooth "grow into" transition, never a sudden switch.
 *
 * Tiers 0-3 use ChatGPT-generated PNG artwork.
 * Tiers 4-6 use inline SVG (cosmic/quantum/divine).
 */

import tier0Img from '../assets/images/bg-tier0.png';
import tier1Img from '../assets/images/bg-tier1.png';
import tier2Img from '../assets/images/bg-tier2.png';
import tier3Img from '../assets/images/bg-tier3.png';

const IMG_STYLE = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };

const W = 400;
const H = 900;
const SVG_STYLE = { width: '100%', height: '100%', display: 'block' };

// allTime thresholds that define where each tier STARTS blending in
// Matches the updated UNLOCK_THRESHOLDS from buildings.js
const TIER_THRESHOLDS = [
  0,               // Tier 0 — default chat
  4_000,           // Tier 1 — Corporate (hr unlocks)
  150_000,         // Tier 2 — Government (gov unlocks)
  3_000_000,       // Tier 3 — Digital (algo unlocks)
  80_000_000,      // Tier 4 — Cosmic (alien unlocks)
  2_000_000_000,   // Tier 5 — Quantum (quantum unlocks)
  100_000_000_000, // Tier 6 — Divine (god unlocks)
];

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Returns { baseTier, nextTier, overlayOpacity }
 * baseTier: the "current" fully opaque background tier (0–6)
 * nextTier: the tier blending in from above (1–6, capped)
 * overlayOpacity: 0..1 eased
 */
function getTierInfo(allTime) {
  const at = allTime ?? 0;
  let baseTier = 0;
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (at >= TIER_THRESHOLDS[i]) {
      baseTier = i;
      break;
    }
  }

  const nextTier = Math.min(6, baseTier + 1);
  const rangeStart = TIER_THRESHOLDS[baseTier];
  const rangeEnd   = TIER_THRESHOLDS[nextTier] ?? rangeStart;

  const rawProgress = rangeEnd <= rangeStart
    ? 1
    : Math.min(1, Math.max(0, (at - rangeStart) / (rangeEnd - rangeStart)));

  return {
    baseTier,
    nextTier,
    overlayOpacity: easeInOut(rawProgress),
  };
}

// ─── TIER 0-3: ChatGPT-generated artwork ───
function Tier0() { return <img src={tier0Img} style={IMG_STYLE} alt="" />; }
function Tier1() { return <img src={tier1Img} style={IMG_STYLE} alt="" />; }
function Tier2() { return <img src={tier2Img} style={IMG_STYLE} alt="" />; }
function Tier3() { return <img src={tier3Img} style={IMG_STYLE} alt="" />; }

// ─── TIER 4: Cosmic / Space ───
function Tier4() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={SVG_STYLE}>
      <rect width={W} height={H} fill="#0c0a1f" opacity={0.4} />
      {Array.from({ length: 80 }, (_, i) => {
        const x = (i * 23 + 7) % W;
        const y = (i * 31 + 13) % H;
        const big = i % 8 === 0;
        return <circle key={`s${i}`} cx={x} cy={y} r={big ? 2.5 : 1}
          fill="#fff" opacity={big ? 0.8 : 0.4} />;
      })}
      {[
        { cx: 100, cy: 200, r: 80, fill: '#7c3aed' },
        { cx: 300, cy: 500, r: 60, fill: '#06b6d4' },
        { cx: 200, cy: 750, r: 70, fill: '#8b5cf6' },
      ].map((n, i) => (
        <circle key={`nb${i}`} cx={n.cx} cy={n.cy} r={n.r} fill={n.fill} opacity={0.15} />
      ))}
      {[
        { cx: 80, cy: 150, r: 25, fill: '#c084fc' },
        { cx: 320, cy: 400, r: 18, fill: '#22d3ee' },
        { cx: 150, cy: 650, r: 30, fill: '#a78bfa' },
      ].map((p, i) => (
        <g key={`pl${i}`}>
          <circle cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={0.5} />
          <ellipse cx={p.cx} cy={p.cy} rx={p.r * 1.6} ry={p.r * 0.3}
            fill="none" stroke={p.fill} strokeWidth={1.5} opacity={0.3}
            transform={`rotate(${-20 + i * 15} ${p.cx} ${p.cy})`} />
          <circle cx={p.cx - p.r * 0.3} cy={p.cy - p.r * 0.3} r={p.r * 0.25}
            fill="#fff" opacity={0.2} />
        </g>
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const x = 30 + (i * 89) % 340;
        const y = 80 + (i * 193) % 720;
        return (
          <g key={`sat${i}`}>
            <rect x={x} y={y} width={16} height={2} fill="#94a3b8" opacity={0.5} />
            <rect x={x + 3} y={y - 4} width={10} height={4} fill="#cbd5e1" opacity={0.4} />
            <rect x={x + 7} y={y + 2} width={2} height={12} fill="#64748b" opacity={0.4} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── TIER 5: Quantum ───
function Tier5() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={SVG_STYLE}>
      <rect width={W} height={H} fill="#042f2e" opacity={0.35} />
      {Array.from({ length: 6 }, (_, wave) => {
        const baseY = 80 + wave * 140;
        const points = Array.from({ length: W / 4 }, (_, i) => {
          const x = i * 4;
          const y = baseY + Math.sin(x * 0.06 + wave) * 25;
          return `${x},${y}`;
        }).join(' ');
        return <polyline key={`wf${wave}`} points={points}
          fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.4} />;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const cx = 40 + (i * 67) % 330;
        const cy = 60 + (i * 109) % 780;
        return (
          <g key={`at${i}`}>
            <circle cx={cx} cy={cy} r={4} fill="#fbbf24" opacity={0.6} />
            {[0, 60, 120].map(angle => (
              <ellipse key={angle} cx={cx} cy={cy} rx={20} ry={8}
                fill="none" stroke="#22d3ee" strokeWidth={1} opacity={0.35}
                transform={`rotate(${angle} ${cx} ${cy})`} />
            ))}
            {[0, 120, 240].map((angle, j) => {
              const a = (angle + i * 30) * Math.PI / 180;
              return <circle key={j}
                cx={cx + Math.cos(a) * 20} cy={cy + Math.sin(a) * 8}
                r={3} fill="#22d3ee" opacity={0.5} />;
            })}
          </g>
        );
      })}
      {Array.from({ length: 15 }, (_, i) => {
        const x = (i * 43 + 17) % W;
        const y = (i * 71 + 29) % H;
        const len = 20 + (i % 4) * 10;
        const angle = (i * 37) % 360;
        const rad = angle * Math.PI / 180;
        return <line key={`pt${i}`}
          x1={x} y1={y} x2={x + Math.cos(rad) * len} y2={y + Math.sin(rad) * len}
          stroke="#5eead4" strokeWidth={1.5} opacity={0.3} strokeLinecap="round" />;
      })}
    </svg>
  );
}

// ─── TIER 6: Divine ───
function Tier6() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={SVG_STYLE}>
      <rect width={W} height={H} fill="#1a1520" opacity={0.3} />
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const cx = W / 2, cy = H / 3;
        return <line key={`ray${i}`}
          x1={cx} y1={cy}
          x2={cx + Math.cos(angle) * 400} y2={cy + Math.sin(angle) * 400}
          stroke="#fbbf24" strokeWidth={2.5} opacity={0.25} />;
      })}
      {[
        { x: 20, y: 100 }, { x: 200, y: 60 }, { x: 100, y: 350 },
        { x: 280, y: 250 }, { x: 50, y: 550 }, { x: 250, y: 500 },
        { x: 150, y: 700 }, { x: 300, y: 650 },
      ].map((c, i) => (
        <g key={`cl${i}`}>
          <rect x={c.x} y={c.y} width={80} height={25} rx={12} fill="#fff" opacity={0.25} />
          <rect x={c.x + 15} y={c.y - 10} width={50} height={20} rx={10} fill="#fff" opacity={0.2} />
          <rect x={c.x + 30} y={c.y - 18} width={30} height={16} rx={8} fill="#fff" opacity={0.15} />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const cx = 40 + (i * 67) % 330;
        const cy = 80 + (i * 127) % 740;
        return (
          <g key={`halo${i}`}>
            <circle cx={cx} cy={cy} r={20} fill="none" stroke="#fbbf24" strokeWidth={2.5} opacity={0.4} />
            <circle cx={cx} cy={cy} r={12} fill="#fef3c7" opacity={0.2} />
            <circle cx={cx} cy={cy} r={5} fill="#fbbf24" opacity={0.35} />
            <circle cx={cx} cy={cy} r={2} fill="#1a1520" opacity={0.5} />
          </g>
        );
      })}
      {Array.from({ length: 40 }, (_, i) => {
        const x = (i * 29 + 11) % W;
        const y = (i * 41 + 17) % H;
        return <circle key={`gp${i}`} cx={x} cy={y} r={1.5 + (i % 3)}
          fill="#fbbf24" opacity={0.3 + (i % 4) * 0.1} />;
      })}
    </svg>
  );
}

const TIERS = [Tier0, Tier1, Tier2, Tier3, Tier4, Tier5, Tier6];

export default function HeroBackground({ owned: _owned, allTime }) {
  const { baseTier, nextTier, overlayOpacity } = getTierInfo(allTime);

  const BaseTier = TIERS[baseTier];
  const NextTier = TIERS[nextTier];
  const showOverlay = nextTier !== baseTier && overlayOpacity > 0;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none', zIndex: 0,
    }}>
      {/* Base tier — always fully visible */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <BaseTier />
      </div>

      {/* Next tier — permeates in with easeInOut opacity */}
      {showOverlay && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: overlayOpacity,
          transition: 'opacity 1.5s ease',
        }}>
          <NextTier />
        </div>
      )}
    </div>
  );
}
