/**
 * Generate 8-bit pixel art SVG banners for each building.
 * Run with: node scripts/generate-banners.js
 */
import { writeFileSync } from 'fs';

const W = 800; // banner width
const H = 72;  // banner height
const P = 8;   // pixel size

function rect(x, y, w, h, fill, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`;
}

function px(col, row, fill, size = P) {
  return rect(col * P, row * P, size, size, fill);
}

// Helper: row of pixels
function pxRow(startCol, row, count, fill) {
  return Array.from({ length: count }, (_, i) => px(startCol + i, row, fill)).join('');
}

// Helper: simple building/structure
function pixelBuilding(x, y, w, h, wallColor, roofColor, windowColor) {
  let s = '';
  // Roof
  for (let i = 0; i < 2; i++) {
    s += rect(x * P - (2 - i) * P, (y - i) * P, (w + (2 - i) * 2) * P, P, roofColor);
  }
  // Walls
  s += rect(x * P, y * P, w * P, h * P, wallColor);
  // Windows
  if (w >= 4) {
    s += rect((x + 1) * P, (y + 1) * P, P, P, windowColor);
    s += rect((x + w - 2) * P, (y + 1) * P, P, P, windowColor);
  }
  return s;
}

function wrap(inner, bgColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bgColor}"/>
${inner}
</svg>`;
}

// ════════════════════════════════════════
// 1. 前任 (Ex) — rainy night, broken hearts, phone screens
// ════════════════════════════════════════
function bannerEx() {
  let s = '';
  // Dark gradient sky
  s += rect(0, 0, W, H * 0.7, '#1a1a2e');
  s += rect(0, H * 0.7, W, H * 0.3, '#16213e');
  // Rain drops
  for (let i = 0; i < 30; i++) {
    const x = (i * 27 + 5) % W;
    const y = (i * 17 + 3) % (H - 8);
    s += rect(x, y, 2, 6, '#4a90d9', 0.4);
  }
  // Broken hearts scattered
  const heartPositions = [60, 180, 320, 480, 620, 740];
  heartPositions.forEach((x, i) => {
    const y = 8 + (i % 3) * 16;
    // Left half of heart
    s += px(x / P, y / P, '#ff6b6b', P);
    s += px(x / P + 1, y / P, '#ff6b6b', P);
    s += px(x / P, y / P + 1, '#ff6b6b', P);
    // Right half (separated = broken)
    s += px(x / P + 3, y / P, '#ff6b6b', P);
    s += px(x / P + 4, y / P, '#ff6b6b', P);
    s += px(x / P + 4, y / P + 1, '#ff6b6b', P);
    // Crack
    s += px(x / P + 2, y / P + 1, '#1a1a2e', P);
  });
  // Phone screens glowing
  for (let i = 0; i < 4; i++) {
    const x = 100 + i * 180;
    s += rect(x, 40, 16, 24, '#2d3436');
    s += rect(x + 2, 42, 12, 16, '#74b9ff', 0.6);
    s += rect(x + 4, 46, 8, 2, '#dfe6e9', 0.5); // "已讀" text line
  }
  return wrap(s, '#1a1a2e');
}

// ════════════════════════════════════════
// 2. 爸媽 (Parents) — warm kitchen, food, house
// ════════════════════════════════════════
function bannerPar() {
  let s = '';
  // Warm sky
  s += rect(0, 0, W, 40, '#ffeaa7');
  s += rect(0, 40, W, 32, '#fab1a0');
  // Sun
  s += rect(700, 4, 24, 24, '#fdcb6e');
  s += rect(696, 8, 32, 16, '#fdcb6e');
  s += rect(704, 0, 16, 32, '#fdcb6e');
  // Houses
  for (let i = 0; i < 5; i++) {
    const x = 20 + i * 160;
    // House body
    s += rect(x, 32, 48, 32, '#e17055');
    // Roof
    s += rect(x - 8, 24, 64, 8, '#d63031');
    s += rect(x, 16, 48, 8, '#d63031');
    // Door
    s += rect(x + 18, 48, 12, 16, '#6c5ce7');
    // Windows
    s += rect(x + 4, 36, 10, 10, '#74b9ff');
    s += rect(x + 34, 36, 10, 10, '#74b9ff');
  }
  // Food items (bowls)
  for (let i = 0; i < 3; i++) {
    const x = 130 + i * 200;
    s += rect(x, 56, 24, 4, '#fff');
    s += rect(x + 4, 52, 16, 4, '#ffeaa7');
    s += rect(x + 8, 48, 8, 4, '#e17055', 0.6); // steam
  }
  return wrap(s, '#ffeaa7');
}

// ════════════════════════════════════════
// 3. 忙朋友 (Busy Friend) — running figures, clocks
// ════════════════════════════════════════
function bannerBsy() {
  let s = '';
  s += rect(0, 56, W, 16, '#00b894');
  // Running pixel figures at different positions
  for (let i = 0; i < 6; i++) {
    const x = 30 + i * 130;
    const y = 32 + (i % 2) * 8;
    // Head
    s += rect(x + 4, y - 16, 8, 8, '#00cec9');
    // Body
    s += rect(x + 4, y - 8, 8, 12, '#00b894');
    // Legs (running pose)
    s += rect(x, y + 4, 4, 8, '#00b894');
    s += rect(x + 12, y, 4, 8, '#00b894');
    // Arms
    s += rect(x, y - 6, 4, 4, '#00cec9');
    s += rect(x + 12, y - 8, 4, 4, '#00cec9');
    // Speed lines
    s += rect(x - 12, y - 4, 8, 2, '#55efc4', 0.5);
    s += rect(x - 16, y + 2, 12, 2, '#55efc4', 0.3);
  }
  // Clocks
  for (let i = 0; i < 4; i++) {
    const x = 80 + i * 200;
    s += rect(x, 4, 16, 16, '#fdcb6e');
    s += rect(x + 2, 6, 12, 12, '#ffeaa7');
    s += rect(x + 7, 8, 2, 6, '#2d3436'); // hand
    s += rect(x + 7, 10, 4, 2, '#2d3436'); // hand
  }
  return wrap(s, '#dfe6e9');
}

// ════════════════════════════════════════
// 4. 公司HR (Company HR) — office cubicles, documents
// ════════════════════════════════════════
function bannerHr() {
  let s = '';
  // Floor
  s += rect(0, 56, W, 16, '#636e72');
  // Cubicle dividers
  for (let i = 0; i < 8; i++) {
    const x = i * 100;
    s += rect(x, 16, 4, 40, '#b2bec3');
    // Desk
    s += rect(x + 4, 40, 92, 4, '#dfe6e9');
    // Monitor
    s += rect(x + 30, 20, 20, 16, '#2d3436');
    s += rect(x + 32, 22, 16, 12, '#74b9ff', 0.7);
    // Chair
    s += rect(x + 50, 44, 12, 12, '#6c5ce7');
    // Papers
    s += rect(x + 10, 42, 8, 10, '#fff');
    s += rect(x + 12, 44, 4, 2, '#b2bec3');
    s += rect(x + 12, 48, 4, 2, '#b2bec3');
  }
  return wrap(s, '#dfe6e9');
}

// ════════════════════════════════════════
// 5. 外送客服 (Delivery) — scooters, packages, streets
// ════════════════════════════════════════
function bannerDel() {
  let s = '';
  // Road
  s += rect(0, 48, W, 24, '#636e72');
  s += rect(0, 56, W, 4, '#fdcb6e', 0.5); // road line (dashed)
  for (let i = 0; i < 20; i++) {
    s += rect(i * 40 + 20, 56, 20, 4, '#636e72'); // gaps in line
  }
  // Scooters
  for (let i = 0; i < 5; i++) {
    const x = 40 + i * 160;
    // Wheels
    s += rect(x, 52, 12, 12, '#2d3436');
    s += rect(x + 24, 52, 12, 12, '#2d3436');
    // Body
    s += rect(x + 4, 40, 28, 12, '#00cec9');
    // Package on back
    s += rect(x + 24, 28, 16, 12, '#e17055');
    s += rect(x + 26, 30, 12, 2, '#fff', 0.5);
    // Rider
    s += rect(x + 8, 24, 8, 16, '#0984e3');
    s += rect(x + 8, 16, 8, 8, '#ffeaa7');
  }
  return wrap(s, '#81ecec');
}

// ════════════════════════════════════════
// 6. 政府承辦 (Government) — grand building, columns, stamps
// ════════════════════════════════════════
function bannerGov() {
  let s = '';
  // Ground
  s += rect(0, 60, W, 12, '#636e72');
  // Government buildings
  for (let i = 0; i < 3; i++) {
    const x = 50 + i * 280;
    // Pediment (triangle roof)
    s += rect(x + 16, 8, 80, 8, '#b2bec3');
    s += rect(x + 24, 0, 64, 8, '#b2bec3');
    s += rect(x + 32, -4, 48, 8, '#dfe6e9');
    // Columns
    for (let c = 0; c < 5; c++) {
      s += rect(x + 16 + c * 20, 16, 8, 44, '#dfe6e9');
    }
    // Base
    s += rect(x + 8, 56, 96, 4, '#b2bec3');
    // Door
    s += rect(x + 44, 36, 24, 24, '#6c5ce7');
  }
  // Stamps floating
  for (let i = 0; i < 6; i++) {
    const x = 10 + i * 140;
    s += rect(x, 20 + (i % 3) * 12, 16, 16, '#d63031', 0.3);
    s += rect(x + 4, 24 + (i % 3) * 12, 8, 8, '#ff7675', 0.4);
  }
  return wrap(s, '#dfe6e9');
}

// ════════════════════════════════════════
// 7. 情報機構 (Intelligence) — dark, cameras, binary
// ════════════════════════════════════════
function bannerInt() {
  let s = '';
  // Binary rain (like Matrix)
  for (let i = 0; i < 50; i++) {
    const x = (i * 17 + 3) % W;
    const y = (i * 23 + 7) % H;
    const char = i % 2 === 0 ? '0' : '1';
    s += `<text x="${x}" y="${y}" fill="#00ff41" opacity="0.15" font-family="monospace" font-size="10">${char}</text>`;
  }
  // Surveillance cameras
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 160;
    // Mount
    s += rect(x, 0, 4, 16, '#636e72');
    // Camera body
    s += rect(x - 8, 16, 20, 12, '#2d3436');
    // Lens
    s += rect(x + 12, 20, 8, 4, '#ff7675');
    // Red light
    s += rect(x + 14, 18, 4, 4, '#ff0000', 0.8);
  }
  // Eye
  s += rect(360, 40, 40, 20, '#00ff41', 0.15);
  s += rect(370, 44, 20, 12, '#00ff41', 0.2);
  s += rect(376, 48, 8, 4, '#00ff41', 0.3);
  return wrap(s, '#0a0a0a');
}

// ════════════════════════════════════════
// 8. 社群演算法 (Algorithm) — phones, likes, feeds
// ════════════════════════════════════════
function bannerAlgo() {
  let s = '';
  // Phones in a grid
  for (let i = 0; i < 7; i++) {
    const x = 20 + i * 115;
    const y = 8;
    // Phone body
    s += rect(x, y, 24, 48, '#2d3436');
    s += rect(x + 2, y + 4, 20, 36, '#74b9ff', 0.3);
    // Feed content lines
    s += rect(x + 4, y + 8, 16, 3, '#dfe6e9', 0.5);
    s += rect(x + 4, y + 14, 12, 3, '#dfe6e9', 0.3);
    s += rect(x + 4, y + 20, 14, 3, '#dfe6e9', 0.4);
    // Heart/like
    s += rect(x + 14, y + 28, 6, 6, '#ff6b6b', 0.6);
    // Notification badge
    s += rect(x + 18, y, 8, 8, '#ff6b6b');
  }
  // Network lines connecting phones
  for (let i = 0; i < 6; i++) {
    const x1 = 44 + i * 115;
    const x2 = x1 + 91;
    s += `<line x1="${x1}" y1="32" x2="${x2}" y2="32" stroke="#6c5ce7" stroke-width="1" opacity="0.2"/>`;
  }
  return wrap(s, '#2d3436');
}

// ════════════════════════════════════════
// 9. AI客服 (AI) — robots, circuits, servers
// ════════════════════════════════════════
function bannerAi() {
  let s = '';
  // Circuit board traces
  for (let i = 0; i < 15; i++) {
    const x = i * 56;
    s += rect(x, 32, 40, 2, '#00cec9', 0.2);
    s += rect(x + 38, 16, 2, 18, '#00cec9', 0.2);
    // Nodes
    s += rect(x + 36, 14, 6, 6, '#00cec9', 0.3);
  }
  // Robots
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 160;
    // Head
    s += rect(x, 8, 24, 20, '#636e72');
    // Eyes
    s += rect(x + 4, 12, 6, 6, '#00ff41');
    s += rect(x + 14, 12, 6, 6, '#00ff41');
    // Body
    s += rect(x - 4, 28, 32, 24, '#636e72');
    // Chest light
    s += rect(x + 8, 34, 8, 8, '#0984e3', 0.6);
    // Antenna
    s += rect(x + 10, 0, 4, 8, '#b2bec3');
    s += rect(x + 8, 0, 8, 4, '#fdcb6e');
  }
  return wrap(s, '#1a1a2e');
}

// ════════════════════════════════════════
// 10. 外星通訊 (Alien) — space, stars, satellite dishes
// ════════════════════════════════════════
function bannerAlien() {
  let s = '';
  // Stars
  for (let i = 0; i < 40; i++) {
    const x = (i * 23 + 7) % W;
    const y = (i * 17 + 3) % H;
    const size = i % 3 === 0 ? 3 : 2;
    s += rect(x, y, size, size, '#fff', 0.4 + (i % 4) * 0.15);
  }
  // Satellite dishes
  for (let i = 0; i < 4; i++) {
    const x = 80 + i * 200;
    // Dish
    s += rect(x, 24, 32, 4, '#b2bec3');
    s += rect(x + 4, 20, 24, 4, '#dfe6e9');
    // Pole
    s += rect(x + 14, 28, 4, 24, '#636e72');
    // Base
    s += rect(x + 6, 52, 20, 8, '#636e72');
    // Signal waves
    for (let w = 0; w < 3; w++) {
      s += rect(x + 32 + w * 8, 16 - w * 4, 4, 2, '#74b9ff', 0.4 - w * 0.1);
    }
  }
  // UFO
  s += rect(500, 8, 40, 8, '#b2bec3');
  s += rect(490, 16, 60, 4, '#dfe6e9');
  s += rect(510, 20, 20, 4, '#fdcb6e', 0.5); // beam
  s += rect(508, 24, 24, 4, '#fdcb6e', 0.3);
  return wrap(s, '#0a0a2e');
}

// ════════════════════════════════════════
// 11. 時間迴圈 (Time Loop) — clocks, spirals, paradox
// ════════════════════════════════════════
function bannerTime() {
  let s = '';
  // Clocks at various sizes
  const clocks = [[60,8,32], [200,16,24], [340,4,28], [500,12,20], [640,8,32], [760,20,16]];
  clocks.forEach(([x, y, size]) => {
    // Clock face
    s += rect(x, y, size, size, '#fdcb6e', 0.3);
    s += rect(x + 2, y + 2, size - 4, size - 4, '#ffeaa7', 0.4);
    // Hands
    s += rect(x + size/2 - 1, y + 4, 2, size/2 - 2, '#2d3436', 0.6);
    s += rect(x + size/2, y + size/2, size/3, 2, '#d63031', 0.6);
  });
  // Spiral/loop lines
  for (let i = 0; i < 3; i++) {
    const cx = 150 + i * 280;
    for (let a = 0; a < 12; a++) {
      const r = 8 + a * 2;
      const angle = a * 0.6;
      const px = cx + Math.cos(angle) * r;
      const py = 36 + Math.sin(angle) * r;
      s += rect(px, py, 3, 3, '#6c5ce7', 0.3);
    }
  }
  return wrap(s, '#2d3436');
}

// ════════════════════════════════════════
// 12. 量子已讀 (Quantum) — atoms, particles, waves
// ════════════════════════════════════════
function bannerQuantum() {
  let s = '';
  // Wave functions
  for (let x = 0; x < W; x += 4) {
    const y1 = 36 + Math.sin(x * 0.03) * 16;
    const y2 = 36 + Math.sin(x * 0.05 + 2) * 12;
    s += rect(x, y1, 3, 2, '#a29bfe', 0.3);
    s += rect(x, y2, 2, 2, '#fd79a8', 0.2);
  }
  // Atoms
  for (let i = 0; i < 4; i++) {
    const cx = 100 + i * 200;
    const cy = 36;
    // Nucleus
    s += rect(cx - 4, cy - 4, 8, 8, '#fdcb6e', 0.6);
    // Orbits (simplified as dots)
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 20;
      const py = cy + Math.sin(angle) * 12;
      s += rect(px, py, 4, 4, '#74b9ff', 0.4);
    }
  }
  return wrap(s, '#1a1a2e');
}

// ════════════════════════════════════════
// 13. 虛空已讀 (Void) — darkness, abyss, distortion
// ════════════════════════════════════════
function bannerVoid() {
  let s = '';
  // Concentric void circles
  for (let i = 0; i < 3; i++) {
    const cx = 200 + i * 250;
    for (let r = 1; r < 6; r++) {
      for (let a = 0; a < 16; a++) {
        const angle = (a / 16) * Math.PI * 2 + i;
        const px = cx + Math.cos(angle) * r * 8;
        const py = 36 + Math.sin(angle) * r * 5;
        const opacity = 0.1 + (6 - r) * 0.05;
        s += rect(px, py, 3, 3, '#6c5ce7', opacity);
      }
    }
    // Center void
    s += rect(cx - 4, 32, 8, 8, '#000', 0.8);
  }
  // Distortion lines
  for (let i = 0; i < 20; i++) {
    const x = (i * 41 + 7) % W;
    const y1 = 10 + Math.random() * 52;
    s += rect(x, y1, 2, 4 + i % 6, '#6c5ce7', 0.1);
  }
  return wrap(s, '#050510');
}

// ════════════════════════════════════════
// 14. 神之已讀 (God) — divine golden light, clouds, halos
// ════════════════════════════════════════
function bannerGod() {
  let s = '';
  // Golden light rays from center
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const x1 = 400 + Math.cos(angle) * 20;
    const y1 = 36 + Math.sin(angle) * 10;
    const x2 = 400 + Math.cos(angle) * 300;
    const y2 = 36 + Math.sin(angle) * 100;
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fdcb6e" stroke-width="2" opacity="0.15"/>`;
  }
  // Clouds
  const clouds = [[80, 12], [300, 8], [550, 16], [720, 10]];
  clouds.forEach(([x, y]) => {
    s += rect(x, y, 48, 16, '#fff', 0.3);
    s += rect(x + 8, y - 8, 32, 12, '#fff', 0.25);
    s += rect(x + 16, y - 12, 16, 8, '#fff', 0.2);
  });
  // Central halo/eye
  s += rect(384, 20, 32, 32, '#fdcb6e', 0.4);
  s += rect(388, 24, 24, 24, '#ffeaa7', 0.5);
  s += rect(394, 30, 12, 12, '#fff', 0.6);
  s += rect(398, 34, 4, 4, '#2d3436', 0.8); // pupil
  return wrap(s, '#1a1520');
}

// ════════════════════════════════════════
// Generate all banners
// ════════════════════════════════════════
const banners = {
  ex:      bannerEx(),
  par:     bannerPar(),
  bsy:     bannerBsy(),
  hr:      bannerHr(),
  del:     bannerDel(),
  gov:     bannerGov(),
  int:     bannerInt(),
  algo:    bannerAlgo(),
  ai:      bannerAi(),
  alien:   bannerAlien(),
  time:    bannerTime(),
  quantum: bannerQuantum(),
  void:    bannerVoid(),
  god:     bannerGod(),
};

const outDir = 'public/icons/banners';
for (const [id, svg] of Object.entries(banners)) {
  writeFileSync(`${outDir}/${id}.svg`, svg);
  console.log(`✓ ${id}.svg`);
}
console.log(`\nDone! Generated ${Object.keys(banners).length} banners.`);
