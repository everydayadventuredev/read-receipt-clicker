/**
 * BuildingBanner — dynamic 8-bit pixel art SVG for each building.
 * Count determines how many "units" appear in the scene.
 */

const W = 800;
const H = 72;

function r(x, y, w, h, fill, o) {
  return <rect key={`${x}-${y}-${w}`} x={x} y={y} width={w} height={h} fill={fill} opacity={o ?? 1} />;
}

// ── 前任: rainy night, each unit = a glowing phone in the rain ──
function BannerEx({ count }) {
  const units = Math.min(count, 30);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#1a1a2e" />
      <rect y={52} width={W} height={20} fill="#16213e" />
      {/* Rain */}
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={`rain${i}`} x={(i * 21 + 5) % W} y={(i * 19 + 3) % 60} width={1.5} height={5} fill="#4a90d9" opacity={0.3} />
      ))}
      {/* Each unit = phone screen */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x} y={20} width={14} height={22} rx={2} fill="#2d3436" />
            <rect x={x + 2} y={23} width={10} height={14} fill="#74b9ff" opacity={0.5 + (i % 3) * 0.15} />
            <rect x={x + 3} y={28} width={8} height={1.5} fill="#dfe6e9" opacity={0.6} />
            <rect x={x + 3} y={31} width={5} height={1.5} fill="#dfe6e9" opacity={0.4} />
            {/* Broken heart above some phones */}
            {i % 3 === 0 && <>
              <rect x={x + 2} y={12} width={4} height={4} fill="#ff6b6b" opacity={0.6} />
              <rect x={x + 8} y={12} width={4} height={4} fill="#ff6b6b" opacity={0.6} />
            </>}
          </g>
        );
      })}
    </svg>
  );
}

// ── 爸媽: warm neighborhood, each unit = a house ──
function BannerPar({ count }) {
  const units = Math.min(count, 25);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#ffeaa7" />
      <rect y={50} width={W} height={22} fill="#81c784" />
      {/* Sun */}
      <rect x={720} y={4} width={20} height={20} rx={4} fill="#fdcb6e" />
      {/* Each unit = house */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        const hue = (i * 40 + 10) % 360;
        const roofColor = `hsl(${hue}, 60%, 50%)`;
        const wallColor = `hsl(${hue}, 50%, 65%)`;
        return (
          <g key={i}>
            {/* Roof */}
            <rect x={x - 2} y={30} width={28} height={5} fill={roofColor} />
            <rect x={x + 2} y={26} width={20} height={5} fill={roofColor} />
            {/* Wall */}
            <rect x={x} y={35} width={24} height={15} fill={wallColor} />
            {/* Door */}
            <rect x={x + 9} y={40} width={6} height={10} fill="#5d4037" />
            {/* Window */}
            <rect x={x + 2} y={38} width={5} height={5} fill="#bbdefb" />
            <rect x={x + 17} y={38} width={5} height={5} fill="#bbdefb" />
          </g>
        );
      })}
    </svg>
  );
}

// ── 忙朋友: each unit = running pixel figure ──
function BannerBsy({ count }) {
  const units = Math.min(count, 25);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#e8f5e9" />
      <rect y={54} width={W} height={18} fill="#a5d6a7" />
      {/* Each unit = running figure */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        const y = 28 + (i % 3) * 6;
        const shade = `hsl(${160 + i * 8}, 60%, ${40 + (i % 3) * 10}%)`;
        return (
          <g key={i}>
            <rect x={x + 3} y={y - 10} width={6} height={6} fill={shade} />
            <rect x={x + 3} y={y - 4} width={6} height={10} fill={shade} />
            <rect x={x} y={y + 4} width={3} height={6} fill={shade} />
            <rect x={x + 9} y={y + 2} width={3} height={6} fill={shade} />
            {/* Speed lines */}
            <rect x={x - 8} y={y} width={6} height={1.5} fill={shade} opacity={0.3} />
            <rect x={x - 10} y={y + 4} width={8} height={1.5} fill={shade} opacity={0.2} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 公司HR: each unit = a cubicle with monitor ──
function BannerHr({ count }) {
  const units = Math.min(count, 25);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#eceff1" />
      <rect y={58} width={W} height={14} fill="#90a4ae" />
      {/* Each unit = cubicle */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x} y={18} width={2} height={40} fill="#b0bec5" />
            <rect x={x + 2} y={40} width={22} height={3} fill="#cfd8dc" />
            <rect x={x + 6} y={22} width={14} height={12} fill="#37474f" />
            <rect x={x + 7} y={23} width={12} height={10} fill="#64b5f6" opacity={0.5} />
            <rect x={x + 14} y={44} width={8} height={10} fill="#7e57c2" opacity={0.7} />
            <rect x={x + 3} y={44} width={6} height={8} fill="#fff" opacity={0.6} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 外送客服: road with scooters ──
function BannerDel({ count }) {
  const units = Math.min(count, 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#80deea" />
      <rect y={44} width={W} height={28} fill="#78909c" />
      {/* Road markings */}
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={`rd${i}`} x={i * 42} y={54} width={22} height={3} fill="#ffeb3b" opacity={0.5} />
      ))}
      {/* Each unit = scooter */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x} y={48} width={8} height={8} fill="#37474f" />
            <rect x={x + 18} y={48} width={8} height={8} fill="#37474f" />
            <rect x={x + 2} y={38} width={22} height={10} fill="#00acc1" />
            <rect x={x + 18} y={26} width={10} height={12} fill="#e65100" />
            <rect x={x + 19} y={28} width={8} height={2} fill="#fff" opacity={0.4} />
            <rect x={x + 6} y={24} width={6} height={14} fill="#1565c0" />
            <rect x={x + 6} y={18} width={6} height={6} fill="#ffcc80" />
          </g>
        );
      })}
    </svg>
  );
}

// ── 政府承辦: grand buildings with columns ──
function BannerGov({ count }) {
  const units = Math.min(count, 15);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#e0e0e0" />
      <rect y={58} width={W} height={14} fill="#9e9e9e" />
      {/* Each unit = government building */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x + 8} y={10} width={34} height={5} fill="#bdbdbd" />
            <rect x={x + 14} y={6} width={22} height={5} fill="#bdbdbd" />
            {[0, 1, 2, 3].map(c => (
              <rect key={c} x={x + 10 + c * 10} y={15} width={5} height={43} fill="#e0e0e0" />
            ))}
            <rect x={x + 6} y={54} width={38} height={4} fill="#bdbdbd" />
            <rect x={x + 20} y={36} width={10} height={22} fill="#7e57c2" opacity={0.6} />
            {/* Stamp */}
            {i % 2 === 0 && <rect x={x + 2} y={22} width={8} height={8} rx={4} fill="#c62828" opacity={0.3} />}
          </g>
        );
      })}
    </svg>
  );
}

// ── 情報機構: dark matrix + cameras ──
function BannerInt({ count }) {
  const units = Math.min(count, 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#0a0a0a" />
      {/* Matrix rain */}
      {Array.from({ length: 60 }, (_, i) => (
        <text key={`m${i}`} x={(i * 14 + 3) % W} y={(i * 19 + 7) % H} fill="#00ff41" opacity={0.12} fontSize={8} fontFamily="monospace">
          {i % 2 === 0 ? '0' : '1'}
        </text>
      ))}
      {/* Each unit = surveillance camera */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        const top = i % 2 === 0;
        const y = top ? 0 : 44;
        return (
          <g key={i}>
            <rect x={x + 6} y={top ? 0 : 58} width={3} height={14} fill="#424242" />
            <rect x={x} y={top ? 14 : 44} width={16} height={10} fill="#212121" />
            <rect x={x + 16} y={top ? 18 : 46} width={6} height={3} fill="#c62828" />
            <rect x={x + 18} y={top ? 16 : 44} width={3} height={3} fill="#ff0000" opacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 社群演算法: phone screens + notification network ──
function BannerAlgo({ count }) {
  const units = Math.min(count, 20);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#1a237e" />
      {/* Network grid lines */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`gl${i}`} x1={0} y1={i * 8} x2={W} y2={i * 8} stroke="#283593" strokeWidth={0.5} />
      ))}
      {/* Each unit = phone */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x} y={10} width={18} height={40} rx={2} fill="#263238" />
            <rect x={x + 2} y={14} width={14} height={30} fill="#42a5f5" opacity={0.25} />
            <rect x={x + 3} y={18} width={12} height={2} fill="#e3f2fd" opacity={0.4} />
            <rect x={x + 3} y={22} width={8} height={2} fill="#e3f2fd" opacity={0.3} />
            <rect x={x + 3} y={26} width={10} height={2} fill="#e3f2fd" opacity={0.3} />
            <rect x={x + 9} y={32} width={5} height={5} fill="#ef5350" opacity={0.5} />
            <rect x={x + 14} y={8} width={6} height={6} rx={3} fill="#ef5350" />
            {/* Connection lines to neighbors */}
            {i < units - 1 && (
              <line x1={x + 18} y1={30} x2={x + (W - 40) / Math.max(units, 1)} y2={30}
                stroke="#5c6bc0" strokeWidth={0.5} opacity={0.3} />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── AI客服: robots on circuit board ──
function BannerAi({ count }) {
  const units = Math.min(count, 18);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#1b2631" />
      {/* Circuit traces */}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={`c${i}`}>
          <rect x={i * 68} y={34} width={50} height={1.5} fill="#00bcd4" opacity={0.15} />
          <rect x={i * 68 + 48} y={20} width={1.5} height={16} fill="#00bcd4" opacity={0.15} />
        </g>
      ))}
      {/* Each unit = robot */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x + 4} y={4} width={3} height={6} fill="#78909c" />
            <rect x={x + 3} y={2} width={5} height={3} fill="#fdd835" />
            <rect x={x} y={10} width={16} height={14} fill="#546e7a" />
            <rect x={x + 2} y={13} width={4} height={4} fill="#00e676" />
            <rect x={x + 10} y={13} width={4} height={4} fill="#00e676" />
            <rect x={x - 2} y={24} width={20} height={18} fill="#546e7a" />
            <rect x={x + 5} y={28} width={6} height={6} fill="#0288d1" opacity={0.6} />
            <rect x={x} y={42} width={6} height={10} fill="#455a64" />
            <rect x={x + 10} y={42} width={6} height={10} fill="#455a64" />
          </g>
        );
      })}
    </svg>
  );
}

// ── 外星通訊: space + satellite dishes ──
function BannerAlien({ count }) {
  const units = Math.min(count, 15);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#0d1b2a" />
      {/* Stars */}
      {Array.from({ length: 50 }, (_, i) => (
        <rect key={`s${i}`} x={(i * 17 + 7) % W} y={(i * 13 + 3) % H}
          width={i % 4 === 0 ? 2.5 : 1.5} height={i % 4 === 0 ? 2.5 : 1.5}
          fill="#fff" opacity={0.3 + (i % 5) * 0.1} />
      ))}
      <rect y={56} width={W} height={16} fill="#1b2838" />
      {/* Each unit = satellite dish */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x} y={28} width={24} height={3} fill="#cfd8dc" />
            <rect x={x + 3} y={24} width={18} height={3} fill="#eceff1" />
            <rect x={x + 10} y={31} width={3} height={22} fill="#78909c" />
            <rect x={x + 4} y={53} width={16} height={5} fill="#607d8b" />
            {/* Signal waves */}
            {[0, 1, 2].map(w => (
              <rect key={w} x={x + 24 + w * 6} y={22 - w * 3} width={3} height={1.5}
                fill="#4fc3f7" opacity={0.4 - w * 0.1} />
            ))}
          </g>
        );
      })}
      {/* UFO if count > 5 */}
      {count > 5 && (
        <g>
          <rect x={600} y={8} width={30} height={6} fill="#b0bec5" />
          <rect x={592} y={14} width={46} height={3} fill="#eceff1" />
          <rect x={608} y={17} width={14} height={3} fill="#fdd835" opacity={0.4} />
        </g>
      )}
    </svg>
  );
}

// ── 時間迴圈: purple-teal, clocks + spiral portals ──
function BannerTime({ count }) {
  const units = Math.min(count, 15);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#1a0a2e" />
      {/* Spiral background */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = 15 + i * 1.5;
        return <rect key={`sp${i}`} x={400 + Math.cos(angle) * r} y={36 + Math.sin(angle) * r * 0.5}
          width={3} height={3} fill="#7c4dff" opacity={0.12} />;
      })}
      {/* Each unit = clock */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        const size = 16 + (i % 3) * 4;
        const y = 20 + (i % 2) * 10;
        return (
          <g key={i}>
            <rect x={x} y={y} width={size} height={size} rx={size / 2} fill="#4a148c" opacity={0.5} />
            <rect x={x + 2} y={y + 2} width={size - 4} height={size - 4} rx={(size - 4) / 2} fill="#7c4dff" opacity={0.3} />
            <rect x={x + size / 2 - 1} y={y + 3} width={2} height={size / 2 - 1} fill="#e0e0e0" opacity={0.6} />
            <rect x={x + size / 2} y={y + size / 2} width={size / 3} height={1.5} fill="#ff5252" opacity={0.6} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 量子已讀: deep teal, atoms + wave functions ──
function BannerQuantum({ count }) {
  const units = Math.min(count, 15);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#004d40" />
      {/* Wave function background */}
      {Array.from({ length: W / 3 }, (_, i) => {
        const x = i * 3;
        const y1 = 36 + Math.sin(x * 0.04) * 14;
        return <rect key={`w${i}`} x={x} y={y1} width={2} height={1.5} fill="#80cbc4" opacity={0.2} />;
      })}
      {/* Each unit = atom */}
      {Array.from({ length: units }, (_, i) => {
        const cx = 175 + (i * (W - 235)) / Math.max(units, 1);
        const cy = 30 + (i % 3) * 6;
        return (
          <g key={i}>
            <rect x={cx - 3} y={cy - 3} width={6} height={6} fill="#fdd835" opacity={0.6} />
            {[0, 1, 2, 3, 4, 5].map(a => {
              const angle = (a / 6) * Math.PI * 2 + i;
              return <rect key={a} x={cx + Math.cos(angle) * 14} y={cy + Math.sin(angle) * 8}
                width={3} height={3} fill="#80cbc4" opacity={0.5} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ── 虛空已讀: true black + purple vortexes ──
function BannerVoid({ count }) {
  const units = Math.min(count, 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#050510" />
      {/* Each unit = void portal */}
      {Array.from({ length: units }, (_, i) => {
        const cx = 175 + (i * (W - 235)) / Math.max(units, 1);
        const cy = 36;
        return (
          <g key={i}>
            {[5, 4, 3, 2, 1].map(ring => (
              <g key={ring}>
                {Array.from({ length: 8 }, (_, a) => {
                  const angle = (a / 8) * Math.PI * 2 + i * 0.5;
                  return <rect key={a} x={cx + Math.cos(angle) * ring * 5}
                    y={cy + Math.sin(angle) * ring * 3}
                    width={2.5} height={2.5}
                    fill={ring > 3 ? '#4a148c' : '#7c4dff'}
                    opacity={0.1 + (5 - ring) * 0.08} />;
                })}
              </g>
            ))}
            <rect x={cx - 3} y={cy - 3} width={6} height={6} fill="#000" opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
}

// ── 神之已讀: golden divine, clouds + halos ──
function BannerGod({ count }) {
  const units = Math.min(count, 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width={W} height={H} fill="#1a1520" />
      {/* Light rays from center */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return <line key={`ray${i}`} x1={400} y1={36}
          x2={400 + Math.cos(angle) * 400} y2={36 + Math.sin(angle) * 200}
          stroke="#fdd835" strokeWidth={1.5} opacity={0.08} />;
      })}
      {/* Clouds */}
      {[60, 250, 500, 680].map((x, i) => (
        <g key={`cl${i}`}>
          <rect x={x} y={10 + i * 4} width={40} height={12} rx={4} fill="#fff" opacity={0.15} />
          <rect x={x + 8} y={4 + i * 4} width={24} height={10} rx={4} fill="#fff" opacity={0.1} />
        </g>
      ))}
      {/* Each unit = divine eye/halo */}
      {Array.from({ length: units }, (_, i) => {
        const x = 175 + (i * (W - 235)) / Math.max(units, 1);
        return (
          <g key={i}>
            <rect x={x} y={20} width={20} height={20} rx={10} fill="#fdd835" opacity={0.2} />
            <rect x={x + 4} y={24} width={12} height={12} rx={6} fill="#fff8e1" opacity={0.3} />
            <rect x={x + 7} y={28} width={6} height={6} fill="#fff" opacity={0.5} />
            <rect x={x + 9} y={30} width={2} height={2} fill="#1a1520" />
            {/* Halo ring */}
            <rect x={x - 2} y={16} width={24} height={2} rx={1} fill="#fdd835" opacity={0.3} />
          </g>
        );
      })}
    </svg>
  );
}

const BANNER_MAP = {
  ex: BannerEx,
  par: BannerPar,
  bsy: BannerBsy,
  hr: BannerHr,
  del: BannerDel,
  gov: BannerGov,
  int: BannerInt,
  algo: BannerAlgo,
  ai: BannerAi,
  alien: BannerAlien,
  time: BannerTime,
  quantum: BannerQuantum,
  void: BannerVoid,
  god: BannerGod,
};

export default function BuildingBanner({ buildingId, count }) {
  const Banner = BANNER_MAP[buildingId];
  if (!Banner || count <= 0) return null;
  return <Banner count={count} />;
}
