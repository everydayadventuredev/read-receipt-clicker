import React from "react";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

const svgStyle = { imageRendering: "pixelated", shapeRendering: "crispEdges" };

/** Darken a hex colour by mixing toward black */
const darken = (hex, amt = 0.35) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((n >> 16) & 0xff) * (1 - amt)));
  const g = Math.max(0, Math.round(((n >> 8) & 0xff) * (1 - amt)));
  const b = Math.max(0, Math.round((n & 0xff) * (1 - amt)));
  return `rgb(${r},${g},${b})`;
};

/** Lighten a hex colour by mixing toward white */
const lighten = (hex, amt = 0.4) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 0xff) + (255 - ((n >> 16) & 0xff)) * amt));
  const g = Math.min(255, Math.round(((n >> 8) & 0xff) + (255 - ((n >> 8) & 0xff)) * amt));
  const b = Math.min(255, Math.round((n & 0xff) + (255 - (n & 0xff)) * amt));
  return `rgb(${r},${g},${b})`;
};

/** Shorthand for a single pixel rect */
const P = (x, y, fill, w = 1, h = 1) => (
  <rect key={`${x}-${y}-${w}`} x={x} y={y} width={w} height={h} fill={fill} />
);

/** Row helper: draws a run of pixels starting at (x,y) */
const Row = (x, y, fill, count = 1) => P(x, y, fill, count, 1);

/* ================================================================== */
/*  32x32 BUILDING ICONS                                               */
/* ================================================================== */

/* ---------- ExIcon  (Broken Heart / 碎心 / 前任) ---------- */
export function ExIcon({ size = 32, color = "#f43f5e" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* left lobe */}
      {Row(6, 8, color, 4)}
      {Row(5, 9, color, 6)}
      {Row(4, 10, color, 7)}
      {Row(4, 11, color, 7)}
      {Row(4, 12, color, 7)}
      {Row(5, 13, color, 6)}
      {Row(6, 14, color, 5)}
      {Row(7, 15, color, 4)}
      {Row(8, 16, color, 3)}
      {Row(9, 17, color, 3)}
      {Row(10, 18, color, 3)}
      {Row(11, 19, color, 2)}
      {Row(12, 20, color, 2)}
      {Row(13, 21, color, 2)}
      {Row(14, 22, color, 1)}
      {/* right lobe */}
      {Row(18, 8, color, 4)}
      {Row(17, 9, color, 6)}
      {Row(17, 10, color, 7)}
      {Row(17, 11, color, 7)}
      {Row(17, 12, color, 7)}
      {Row(17, 13, color, 6)}
      {Row(18, 14, color, 5)}
      {Row(19, 15, color, 4)}
      {Row(19, 16, color, 3)}
      {Row(18, 17, color, 3)}
      {Row(17, 18, color, 3)}
      {Row(17, 19, color, 2)}
      {Row(16, 20, color, 2)}
      {Row(15, 21, color, 2)}
      {Row(15, 22, color, 2)}
      {/* highlight on left lobe */}
      {P(7, 9, l)}
      {P(7, 10, l)}
      {P(6, 10, l)}
      {/* crack – darker jagged line down the middle */}
      {P(14, 9, d)}
      {P(15, 10, d)}
      {P(14, 11, d)}
      {P(15, 12, d)}
      {P(14, 13, d)}
      {P(15, 14, d)}
      {P(14, 15, d)}
      {P(15, 16, d)}
      {P(15, 9, d)}
      {P(16, 10, d)}
      {P(15, 11, d)}
      {P(16, 12, d)}
      {P(16, 13, d)}
      {P(16, 14, d)}
      {P(15, 17, d)}
      {P(16, 18, d)}
      {/* gap between halves */}
      {P(14, 10, "#1e1e2e")}
      {P(15, 13, "#1e1e2e")}
      {P(14, 16, "#1e1e2e")}
      {P(15, 19, "#1e1e2e")}
    </svg>
  );
}

/* ---------- ParIcon  (Phone with notification / 爸媽) ---------- */
export function ParIcon({ size = 32, color = "#8b5cf6" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* phone body */}
      {Row(10, 5, d, 10)}
      {Row(10, 6, d, 1)}{Row(19, 6, d, 1)}{Row(11, 6, color, 8)}
      {Row(10, 7, d, 1)}{Row(19, 7, d, 1)}{Row(11, 7, color, 8)}
      {/* screen area */}
      {Array.from({ length: 14 }, (_, i) => (
        <React.Fragment key={`scr${i}`}>
          {P(10, 8 + i, d)}
          {P(19, 8 + i, d)}
          {Row(11, 8 + i, l, 8)}
        </React.Fragment>
      ))}
      {/* screen inner colour */}
      {Array.from({ length: 12 }, (_, i) =>
        Row(12, 9 + i, "#e0e7ff", 6)
      )}
      {/* lines on screen */}
      {Row(12, 11, "#a5b4fc", 6)}
      {Row(12, 13, "#a5b4fc", 6)}
      {Row(12, 15, "#a5b4fc", 4)}
      {/* bottom of phone */}
      {Row(10, 22, d, 1)}{Row(19, 22, d, 1)}{Row(11, 22, color, 8)}
      {/* home button */}
      {Row(14, 23, d, 2)}
      {Row(10, 23, d, 1)}{Row(19, 23, d, 1)}{Row(11, 23, color, 3)}{Row(16, 23, color, 3)}
      {Row(10, 24, d, 10)}
      {/* notification dot */}
      {Row(20, 5, "#ef4444", 3)}
      {Row(20, 6, "#ef4444", 3)}
      {Row(20, 7, "#ef4444", 3)}
      {/* dot highlight */}
      {P(20, 5, "#fca5a5")}
    </svg>
  );
}

/* ---------- BsyIcon  (Hourglass / 忙朋友) ---------- */
export function BsyIcon({ size = 32, color = "#f59e0b" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* top bar */}
      {Row(9, 5, d, 14)}
      {Row(9, 6, d, 14)}
      {/* top glass */}
      {Row(10, 7, color, 12)}
      {Row(11, 8, l, 10)}
      {Row(11, 9, l, 10)}
      {Row(12, 10, l, 8)}
      {Row(12, 11, color, 8)}
      {Row(13, 12, color, 6)}
      {Row(14, 13, color, 4)}
      {/* neck */}
      {Row(15, 14, d, 2)}
      {Row(15, 15, d, 2)}
      {Row(15, 16, d, 2)}
      {/* bottom glass */}
      {Row(14, 17, color, 4)}
      {Row(13, 18, color, 6)}
      {Row(12, 19, color, 8)}
      {Row(12, 20, l, 8)}
      {Row(11, 21, l, 10)}
      {Row(11, 22, l, 10)}
      {Row(10, 23, color, 12)}
      {/* bottom bar */}
      {Row(9, 24, d, 14)}
      {Row(9, 25, d, 14)}
      {/* sand top pile */}
      {Row(13, 8, color, 6)}
      {Row(14, 9, color, 4)}
      {Row(15, 10, d, 2)}
      {/* sand falling */}
      {P(16, 14, color)}
      {P(16, 15, color)}
      {P(16, 16, color)}
      {/* sand bottom pile */}
      {Row(14, 22, d, 4)}
      {Row(13, 23, d, 6)}
    </svg>
  );
}

/* ---------- HrIcon  (Briefcase / 人資) ---------- */
export function HrIcon({ size = 32, color = "#6366f1" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* handle */}
      {Row(12, 6, d, 8)}
      {P(12, 7, d)}{P(19, 7, d)}
      {P(12, 8, d)}{P(19, 8, d)}
      {/* body top */}
      {Row(5, 9, d, 22)}
      {Row(5, 10, d, 1)}{Row(26, 10, d, 1)}{Row(6, 10, color, 20)}
      {Row(5, 11, d, 1)}{Row(26, 11, d, 1)}{Row(6, 11, color, 20)}
      {Row(5, 12, d, 1)}{Row(26, 12, d, 1)}{Row(6, 12, color, 20)}
      {/* clasp / latch */}
      {Row(14, 12, d, 4)}
      {Row(14, 13, d, 1)}{Row(17, 13, d, 1)}{Row(15, 13, l, 2)}
      {Row(14, 14, d, 4)}
      {/* middle band */}
      {Row(5, 13, d, 1)}{Row(26, 13, d, 1)}{Row(6, 13, color, 8)}{Row(18, 13, color, 8)}
      {Row(5, 14, d, 1)}{Row(26, 14, d, 1)}{Row(6, 14, color, 8)}{Row(18, 14, color, 8)}
      {/* body bottom */}
      {Array.from({ length: 8 }, (_, i) => (
        <React.Fragment key={`bb${i}`}>
          {P(5, 15 + i, d)}
          {P(26, 15 + i, d)}
          {Row(6, 15 + i, color, 20)}
        </React.Fragment>
      ))}
      {/* highlight */}
      {Row(7, 10, l, 3)}
      {Row(7, 11, l, 2)}
      {/* bottom edge */}
      {Row(5, 23, d, 22)}
    </svg>
  );
}

/* ---------- DelIcon  (Delivery scooter / 外送) ---------- */
export function DelIcon({ size = 32, color = "#10b981" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* delivery box */}
      {Row(16, 6, d, 8)}
      {Row(16, 7, d, 1)}{Row(23, 7, d, 1)}{Row(17, 7, color, 6)}
      {Row(16, 8, d, 1)}{Row(23, 8, d, 1)}{Row(17, 8, color, 6)}
      {Row(16, 9, d, 1)}{Row(23, 9, d, 1)}{Row(17, 9, l, 6)}
      {Row(16, 10, d, 1)}{Row(23, 10, d, 1)}{Row(17, 10, color, 6)}
      {Row(16, 11, d, 8)}
      {/* seat */}
      {Row(12, 12, d, 6)}
      {Row(13, 13, d, 4)}
      {/* body / frame */}
      {Row(10, 14, d, 2)}
      {Row(9, 15, d, 3)}
      {Row(8, 16, d, 14)}
      {Row(7, 17, color, 2)}{Row(12, 17, d, 2)}{Row(20, 17, color, 2)}
      {Row(7, 18, color, 2)}{Row(20, 18, color, 2)}
      {/* handlebars */}
      {Row(20, 13, d, 4)}
      {Row(22, 14, d, 2)}
      {Row(22, 15, d, 2)}
      {/* front wheel */}
      {Row(20, 19, d, 4)}
      {Row(19, 20, d, 1)}{Row(23, 20, d, 1)}{Row(20, 20, "#555", 3)}
      {Row(19, 21, d, 1)}{Row(23, 21, d, 1)}{Row(20, 21, "#777", 3)}
      {Row(19, 22, d, 1)}{Row(23, 22, d, 1)}{Row(20, 22, "#555", 3)}
      {Row(20, 23, d, 4)}
      {/* rear wheel */}
      {Row(6, 19, d, 4)}
      {Row(5, 20, d, 1)}{Row(9, 20, d, 1)}{Row(6, 20, "#555", 3)}
      {Row(5, 21, d, 1)}{Row(9, 21, d, 1)}{Row(6, 21, "#777", 3)}
      {Row(5, 22, d, 1)}{Row(9, 22, d, 1)}{Row(6, 22, "#555", 3)}
      {Row(6, 23, d, 4)}
      {/* exhaust */}
      {Row(4, 17, "#888", 2)}
      {Row(3, 16, "#aaa", 1)}
      {/* headlight */}
      {P(24, 16, l)}
      {P(24, 17, l)}
    </svg>
  );
}

/* ---------- GovIcon  (Official envelope / 政府) ---------- */
export function GovIcon({ size = 32, color = "#64748b" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* envelope body */}
      {Row(4, 10, d, 24)}
      {Array.from({ length: 14 }, (_, i) => (
        <React.Fragment key={`env${i}`}>
          {P(4, 11 + i, d)}
          {P(27, 11 + i, d)}
          {Row(5, 11 + i, color, 22)}
        </React.Fragment>
      ))}
      {Row(4, 25, d, 24)}
      {/* flap – top triangle */}
      {Row(4, 10, d, 24)}
      {Row(5, 11, d, 2)}{Row(25, 11, d, 2)}
      {Row(7, 12, d, 2)}{Row(23, 12, d, 2)}
      {Row(9, 13, d, 2)}{Row(21, 13, d, 2)}
      {Row(11, 14, d, 2)}{Row(19, 14, d, 2)}
      {Row(13, 15, d, 2)}{Row(17, 15, d, 2)}
      {Row(15, 16, d, 2)}
      {/* inner flap shading */}
      {Row(7, 11, l, 18)}
      {Row(9, 12, l, 14)}
      {Row(11, 13, l, 10)}
      {Row(13, 14, l, 6)}
      {Row(15, 15, l, 2)}
      {/* stamp */}
      {Row(21, 18, "#dc2626", 4)}
      {Row(21, 19, "#dc2626", 4)}
      {Row(21, 20, "#dc2626", 4)}
      {Row(21, 21, "#dc2626", 4)}
      {/* stamp inner */}
      {Row(22, 19, "#fca5a5", 2)}
      {Row(22, 20, "#fca5a5", 2)}
      {/* address lines */}
      {Row(7, 19, d, 10)}
      {Row(7, 21, d, 8)}
      {Row(7, 23, d, 6)}
    </svg>
  );
}

/* ---------- IntIcon  (Globe / 網路) ---------- */
export function IntIcon({ size = 32, color = "#06b6d4" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={svgStyle}>
      {/* circle outline */}
      {Row(12, 5, d, 8)}
      {Row(10, 6, d, 2)}{Row(20, 6, d, 2)}
      {Row(8, 7, d, 2)}{Row(22, 7, d, 2)}
      {Row(7, 8, d, 1)}{Row(24, 8, d, 1)}
      {Row(6, 9, d, 1)}{Row(25, 9, d, 1)}
      {Row(6, 10, d, 1)}{Row(25, 10, d, 1)}
      {Row(5, 11, d, 1)}{Row(26, 11, d, 1)}
      {Row(5, 12, d, 1)}{Row(26, 12, d, 1)}
      {Array.from({ length: 4 }, (_, i) => (
        <React.Fragment key={`gc${i}`}>
          {P(5, 13 + i, d)}
          {P(26, 13 + i, d)}
        </React.Fragment>
      ))}
      {Row(5, 17, d, 1)}{Row(26, 17, d, 1)}
      {Row(5, 18, d, 1)}{Row(26, 18, d, 1)}
      {Row(5, 19, d, 1)}{Row(26, 19, d, 1)}
      {Row(6, 20, d, 1)}{Row(25, 20, d, 1)}
      {Row(6, 21, d, 1)}{Row(25, 21, d, 1)}
      {Row(7, 22, d, 1)}{Row(24, 22, d, 1)}
      {Row(8, 23, d, 2)}{Row(22, 23, d, 2)}
      {Row(10, 24, d, 2)}{Row(20, 24, d, 2)}
      {Row(12, 25, d, 8)}
      {/* fill */}
      {Row(12, 6, color, 8)}
      {Row(10, 7, color, 12)}
      {Row(8, 8, color, 16)}
      {Row(7, 9, color, 18)}
      {Row(7, 10, color, 18)}
      {Row(6, 11, color, 20)}
      {Row(6, 12, color, 20)}
      {Array.from({ length: 4 }, (_, i) =>
        Row(6, 13 + i, color, 20)
      )}
      {Row(6, 17, color, 20)}
      {Row(6, 18, color, 20)}
      {Row(6, 19, color, 20)}
      {Row(7, 20, color, 18)}
      {Row(7, 21, color, 18)}
      {Row(8, 22, color, 16)}
      {Row(10, 23, color, 12)}
      {Row(12, 24, color, 8)}
      {/* vertical meridian */}
      {Array.from({ length: 18 }, (_, i) => (
        <React.Fragment key={`vm${i}`}>
          {P(15, 6 + i, d)}
          {P(16, 6 + i, d)}
        </React.Fragment>
      ))}
      {/* horizontal equator */}
      {Row(6, 15, d, 20)}
      {/* latitude lines */}
      {Row(8, 10, l, 16)}
      {Row(8, 20, l, 16)}
      {/* curved meridian left */}
      {P(12, 7, d)}{P(11, 9, d)}{P(10, 11, d)}{P(10, 13, d)}
      {P(10, 17, d)}{P(10, 19, d)}{P(11, 21, d)}{P(12, 23, d)}
      {/* curved meridian right */}
      {P(19, 7, d)}{P(20, 9, d)}{P(21, 11, d)}{P(21, 13, d)}
      {P(21, 17, d)}{P(21, 19, d)}{P(20, 21, d)}{P(19, 23, d)}
      {/* highlight */}
      {Row(10, 8, l, 3)}
      {Row(9, 9, l, 2)}
      {P(8, 10, l)}
    </svg>
  );
}

/* ================================================================== */
/*  16x16 UPGRADE ICONS                                                */
/* ================================================================== */

/* ---------- ClickIcon  (Lightning bolt) ---------- */
export function ClickIcon({ size = 16, color = "#facc15" }) {
  const d = darken(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {P(8, 1, color, 2)}
      {P(7, 2, color, 2)}
      {P(6, 3, color, 2)}
      {P(5, 4, color, 2)}
      {P(4, 5, color, 2)}
      {Row(3, 6, color, 6)}
      {Row(3, 7, color, 6)}
      {Row(7, 7, d, 2)}
      {P(7, 8, color, 2)}
      {P(8, 9, color, 2)}
      {P(9, 10, color, 2)}
      {P(8, 11, color, 2)}
      {P(7, 12, color, 2)}
      {P(6, 13, color, 2)}
      {P(5, 14, d)}
      {P(6, 14, color)}
      {/* shadow */}
      {P(9, 2, d)}
      {P(8, 3, d)}
      {P(7, 4, d)}
      {P(6, 5, d)}
      {P(10, 10, d)}
      {P(9, 11, d)}
      {P(8, 12, d)}
      {P(7, 13, d)}
    </svg>
  );
}

/* ---------- PercentIcon  (Up arrow) ---------- */
export function PercentIcon({ size = 16, color = "#22c55e" }) {
  const d = darken(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* arrow tip */}
      {Row(7, 2, color, 2)}
      {Row(6, 3, color, 4)}
      {Row(5, 4, color, 6)}
      {Row(4, 5, color, 8)}
      {Row(3, 6, d, 1)}{Row(4, 6, color, 8)}{Row(12, 6, d, 1)}
      {/* shaft */}
      {Row(6, 7, color, 4)}
      {Row(6, 8, color, 4)}
      {Row(6, 9, color, 4)}
      {Row(6, 10, color, 4)}
      {Row(6, 11, color, 4)}
      {Row(6, 12, color, 4)}
      {Row(6, 13, d, 4)}
      {/* highlights */}
      {P(7, 3, lighten(color))}
      {P(6, 4, lighten(color))}
      {P(7, 7, lighten(color))}
      {P(7, 8, lighten(color))}
    </svg>
  );
}

/* ---------- MultIcon  (Star) ---------- */
export function MultIcon({ size = 16, color = "#f59e0b" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* top spike */}
      {Row(7, 1, color, 2)}
      {Row(7, 2, color, 2)}
      {Row(6, 3, color, 4)}
      {Row(6, 4, color, 4)}
      {/* middle row */}
      {Row(2, 5, color, 12)}
      {Row(3, 6, color, 10)}
      {Row(4, 7, color, 8)}
      {Row(5, 8, color, 6)}
      {/* bottom spikes */}
      {Row(4, 9, color, 3)}{Row(9, 9, color, 3)}
      {Row(3, 10, color, 3)}{Row(10, 10, color, 3)}
      {Row(3, 11, color, 2)}{Row(11, 11, color, 2)}
      {Row(2, 12, color, 2)}{Row(12, 12, color, 2)}
      {/* highlight */}
      {P(7, 3, l)}{P(7, 4, l)}
      {P(7, 5, l)}{P(7, 6, l)}
      {/* shadow on edges */}
      {P(9, 4, d)}{P(13, 5, d)}
      {P(11, 7, d)}{P(12, 10, d)}{P(13, 12, d)}
      {P(10, 8, d)}
    </svg>
  );
}

/* ---------- AlgoIcon  (Phone/Feed / 📱 / 社群演算法) ---------- */
export function AlgoIcon({ size = 16, color = "#3b82f6" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* phone body */}
      {Row(4, 1, d, 8)}
      {Row(4, 2, color, 8)}
      {Row(4, 3, color, 8)}
      {Row(4, 4, color, 8)}
      {/* screen */}
      {Row(5, 5, l, 6)}
      {Row(5, 6, l, 6)}
      {Row(5, 7, l, 6)}
      {Row(5, 8, l, 6)}
      {Row(5, 9, l, 6)}
      {Row(5, 10, l, 6)}
      {/* feed lines on screen */}
      {Row(6, 6, color, 4)}
      {Row(6, 8, color, 3)}
      {Row(6, 10, color, 4)}
      {/* body bottom */}
      {Row(4, 11, color, 8)}
      {Row(4, 12, color, 8)}
      {/* home button */}
      {Row(7, 12, l, 2)}
      {Row(4, 13, d, 8)}
      {/* notification dots */}
      {P(2, 3, color)}{P(13, 3, color)}
      {P(1, 5, color)}{P(14, 5, color)}
      {P(2, 7, color)}{P(13, 7, color)}
    </svg>
  );
}

/* ---------- AiIcon  (Robot / 🤖 / AI客服) ---------- */
export function AiIcon({ size = 16, color = "#14b8a6" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* antenna */}
      {Row(7, 0, color, 2)}
      {Row(6, 1, color, 4)}
      {/* head */}
      {Row(3, 2, d, 10)}
      {Row(3, 3, color, 10)}
      {Row(3, 4, color, 10)}
      {/* eyes */}
      {P(5, 4, l)}{P(6, 4, l)}
      {P(9, 4, l)}{P(10, 4, l)}
      {Row(3, 5, color, 10)}
      {/* mouth */}
      {Row(5, 5, l, 6)}
      {Row(3, 6, d, 10)}
      {/* neck */}
      {Row(6, 7, color, 4)}
      {/* body */}
      {Row(4, 8, d, 8)}
      {Row(4, 9, color, 8)}
      {Row(4, 10, color, 8)}
      {/* chest light */}
      {P(7, 9, l)}{P(8, 9, l)}
      {Row(4, 11, color, 8)}
      {Row(4, 12, d, 8)}
      {/* arms */}
      {P(2, 9, color)}{P(3, 9, color)}
      {P(12, 9, color)}{P(13, 9, color)}
      {P(2, 10, d)}{P(3, 10, color)}
      {P(12, 10, color)}{P(13, 10, d)}
      {/* legs */}
      {Row(5, 13, color, 2)}{Row(9, 13, color, 2)}
      {Row(5, 14, d, 2)}{Row(9, 14, d, 2)}
    </svg>
  );
}

/* ---------- AlienIcon  (UFO / 👽 / 外星通訊) ---------- */
export function AlienIcon({ size = 16, color = "#a855f7" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* dome */}
      {Row(6, 2, l, 4)}
      {Row(5, 3, l, 6)}
      {Row(5, 4, color, 6)}
      {Row(4, 5, color, 8)}
      {/* saucer */}
      {Row(2, 6, d, 12)}
      {Row(1, 7, color, 14)}
      {Row(2, 8, color, 12)}
      {Row(3, 9, d, 10)}
      {/* beam */}
      {P(6, 10, l)}{P(9, 10, l)}
      {P(5, 11, l)}{P(10, 11, l)}
      {P(4, 12, l)}{P(11, 12, l)}
      {P(3, 13, l)}{P(12, 13, l)}
      {/* lights on saucer */}
      {P(4, 7, l)}{P(7, 7, l)}{P(10, 7, l)}
      {/* window highlights */}
      {P(6, 3, lighten(color, 0.6))}
      {P(7, 4, lighten(color, 0.6))}
    </svg>
  );
}

/* ---------- TimeIcon  (Hourglass / ⏳ / 時間迴圈) ---------- */
export function TimeIcon({ size = 16, color = "#ef4444" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* top frame */}
      {Row(3, 1, d, 10)}
      {Row(3, 2, color, 10)}
      {/* top sand */}
      {Row(4, 3, l, 8)}
      {Row(5, 4, l, 6)}
      {Row(5, 5, color, 6)}
      {Row(6, 6, color, 4)}
      {/* neck */}
      {Row(7, 7, color, 2)}
      {Row(7, 8, color, 2)}
      {/* bottom sand */}
      {Row(6, 9, color, 4)}
      {Row(5, 10, color, 6)}
      {Row(5, 11, l, 6)}
      {Row(4, 12, l, 8)}
      {/* bottom frame */}
      {Row(3, 13, color, 10)}
      {Row(3, 14, d, 10)}
      {/* sand grain falling */}
      {P(7, 8, l)}{P(8, 8, l)}
      {/* highlights */}
      {P(4, 3, lighten(color, 0.6))}
      {P(5, 4, lighten(color, 0.6))}
      {/* circular arrow (time loop) */}
      {P(1, 6, color)}{P(2, 5, color)}{P(2, 7, color)}
      {P(13, 9, color)}{P(14, 8, color)}{P(14, 10, color)}
    </svg>
  );
}

/* ---------- QuantumIcon  (⚛️ / 量子已讀) ---------- */
export function QuantumIcon({ size = 16, color = "#22d3ee" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* Atom nucleus */}
      {Row(7, 7, color, 2)}
      {Row(7, 8, color, 2)}
      {P(7, 7, l)}{P(8, 8, d)}
      {/* Orbit 1 — horizontal */}
      {Row(3, 7, color, 3)}{Row(10, 7, color, 3)}
      {Row(3, 8, color, 3)}{Row(10, 8, color, 3)}
      {/* Orbit 2 — diagonal */}
      {P(5, 3, color)}{P(6, 4, color)}{P(6, 5, color)}
      {P(10, 12, color)}{P(9, 11, color)}{P(9, 10, color)}
      {/* Orbit 3 — other diagonal */}
      {P(10, 3, color)}{P(9, 4, color)}{P(9, 5, color)}
      {P(5, 12, color)}{P(6, 11, color)}{P(6, 10, color)}
      {/* Electrons */}
      {P(3, 6, l)}{P(12, 9, l)}
      {P(5, 2, l)}{P(10, 13, l)}
      {P(10, 2, l)}{P(5, 13, l)}
    </svg>
  );
}

/* ---------- VoidIcon  (🕳️ / 虛空已讀) ---------- */
export function VoidIcon({ size = 16, color = "#1e1b4b" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* Outer ring */}
      {Row(5, 1, color, 6)}
      {Row(3, 2, color, 2)}{Row(11, 2, color, 2)}
      {Row(2, 3, color, 1)}{Row(13, 3, color, 1)}
      {Row(1, 5, color, 1)}{Row(14, 5, color, 1)}
      {Row(1, 6, color, 1)}{Row(14, 6, color, 1)}
      {Row(1, 9, color, 1)}{Row(14, 9, color, 1)}
      {Row(1, 10, color, 1)}{Row(14, 10, color, 1)}
      {Row(2, 12, color, 1)}{Row(13, 12, color, 1)}
      {Row(3, 13, color, 2)}{Row(11, 13, color, 2)}
      {Row(5, 14, color, 6)}
      {/* Inner void — dark center */}
      {Row(5, 4, d, 6)}
      {Row(4, 5, d, 8)}
      {Row(3, 6, d, 10)}
      {Row(3, 7, d, 10)}
      {Row(3, 8, d, 10)}
      {Row(3, 9, d, 10)}
      {Row(4, 10, d, 8)}
      {Row(5, 11, d, 6)}
      {/* Event horizon shimmer */}
      {P(5, 3, l)}{P(8, 3, l)}
      {P(3, 7, l)}{P(12, 8, l)}
    </svg>
  );
}

/* ---------- GodIcon  (👁️ / 神之已讀) ---------- */
export function GodIcon({ size = 16, color = "#fbbf24" }) {
  const d = darken(color);
  const l = lighten(color);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" style={svgStyle}>
      {/* Eye shape */}
      {Row(5, 4, color, 6)}
      {Row(3, 5, color, 10)}
      {Row(2, 6, color, 12)}
      {Row(1, 7, color, 14)}
      {Row(2, 8, color, 12)}
      {Row(3, 9, color, 10)}
      {Row(5, 10, color, 6)}
      {/* Iris */}
      {Row(6, 5, d, 4)}
      {Row(5, 6, d, 6)}
      {Row(5, 7, d, 6)}
      {Row(5, 8, d, 6)}
      {Row(6, 9, d, 4)}
      {/* Pupil */}
      {Row(7, 6, '#000', 2)}
      {Row(7, 7, '#000', 2)}
      {Row(7, 8, '#000', 2)}
      {/* Highlight */}
      {P(7, 6, l)}
      {/* Rays */}
      {P(7, 1, color)}{P(8, 1, color)}
      {P(7, 2, l)}{P(8, 2, l)}
      {P(7, 13, color)}{P(8, 13, color)}
      {P(7, 12, l)}{P(8, 12, l)}
      {P(1, 7, color)}{P(14, 7, color)}
    </svg>
  );
}

/* ================================================================== */
/*  EXPORT MAPS                                                        */
/* ================================================================== */

export const BUILDING_ICONS = {
  ex: ExIcon,
  par: ParIcon,
  bsy: BsyIcon,
  hr: HrIcon,
  del: DelIcon,
  gov: GovIcon,
  int: IntIcon,
  algo: AlgoIcon,
  ai: AiIcon,
  alien: AlienIcon,
  time: TimeIcon,
  quantum: QuantumIcon,
  void: VoidIcon,
  god: GodIcon,
};

export const UPGRADE_ICONS = {
  ck: ClickIcon,
  cp: PercentIcon,
  m: MultIcon,
};
