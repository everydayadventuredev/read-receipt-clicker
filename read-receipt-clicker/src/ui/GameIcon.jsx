/**
 * GameIcon — unified icon component using game-icons.net SVGs.
 * Icons are white-on-transparent SVGs. We apply color via CSS filter or
 * by rendering them as mask-image with a colored background.
 *
 * CC BY 3.0 — game-icons.net (Lorc, Delapouite, Willdabeast)
 */

const BASE = import.meta.env.BASE_URL + 'icons/';

// ── Building icon map ──
export const BUILDING_ICON_MAP = {
  ex:      'buildings/cold-heart.svg',
  par:     'buildings/love-letter.svg',
  bsy:     'buildings/sprint.svg',
  hr:      'buildings/congress.svg',
  del:     'buildings/delivery-drone.svg',
  gov:     'buildings/wax-seal.svg',
  int:     'buildings/lock-spy.svg',
  algo:    'buildings/brain-tentacle.svg',
  ai:      'buildings/vintage-robot.svg',
  alien:   'buildings/satellite-communication.svg',
  time:    'buildings/time-trap.svg',
  quantum: 'buildings/double-ringed-orb.svg',
  void:    'buildings/vortex.svg',
  god:     'buildings/all-seeing-eye.svg',
};

// ── Flower icon map (keyed by flower id f01-f20 from garden.js) ──
export const FLOWER_ICON_MAP = {
  // Series 1 — 遺忘之花
  f01: 'flowers/viola.svg',           // 勿忘我
  f02: 'flowers/shut-rose.svg',       // 枯萎玫瑰
  f03: 'flowers/folded-paper.svg',    // 紙花
  f04: 'flowers/glass-heart.svg',     // 水晶淚
  f05: 'flowers/spiral-bloom.svg',    // 虛空蘭
  // Series 2 — 釋懷之花
  f06: 'flowers/dandelion-flower.svg', // 蒲公英
  f07: 'flowers/daisy.svg',           // 野花
  f08: 'flowers/twirly-flower.svg',   // 夕陽百合
  f09: 'flowers/flower-star.svg',     // 月見草
  f10: 'flowers/fire-flower.svg',     // 鳳凰花
  // Series 3 — 新生之花
  f11: 'flowers/sprout.svg',          // 嫩芽
  f12: 'flowers/clover.svg',          // 幸運草
  f13: 'flowers/bamboo.svg',          // 竹子
  f14: 'flowers/flowers.svg',         // 櫻花
  f15: 'flowers/lotus-flower.svg',    // 金蓮
  // Series 4 — 永恆之花
  f16: 'flowers/new-shoot.svg',       // 苔蘚
  f17: 'flowers/curling-vines.svg',   // 常春藤
  f18: 'flowers/rainbow-star.svg',    // 星花
  f19: 'flowers/rose.svg',            // 極光玫瑰
  f20: 'flowers/star-swirl.svg',      // 宇宙櫻
};

// ── Merge gift icon map (keyed by tier 1-7) ──
export const GIFT_ICON_MAP = {
  1: 'gifts/shiny-apple.svg',
  2: 'gifts/cupcake.svg',
  3: 'gifts/present.svg',
  4: 'gifts/banknote.svg',
  5: 'gifts/shoulder-bag.svg',
  6: 'gifts/crab.svg',
  7: 'gifts/gold-bar.svg',
};

// ── Stock channel icon map ──
export const STOCK_ICON_MAP = {
  meme:   'stocks/drama-masks.svg',
  cat:    'stocks/cat.svg',
  news:   'stocks/newspaper.svg',
  gossip: 'stocks/love-mystery.svg',
  food:   'stocks/hot-meal.svg',
  know:   'stocks/enlightenment.svg',
};

// ── UI icons ──
export const UI_ICON_MAP = {
  golden:   'ui/cookie.svg',
  prestige: 'ui/ouroboros.svg',
  guilt:    'ui/chained-heart.svg',
  seed:     'ui/plant-seed.svg',
  click:    'ui/button-finger.svg',
};

/**
 * GameIcon component — renders an SVG icon as a CSS mask.
 * This allows us to color the icon with any CSS color.
 *
 * @param {string} src — relative path from icons/ (e.g., 'buildings/cold-heart.svg')
 * @param {number} size — icon size in px (default 24)
 * @param {string} color — CSS color (default '#1e293b')
 * @param {object} style — additional inline styles
 */
export default function GameIcon({ src, size = 24, color = '#1e293b', style = {} }) {
  if (!src) return null;
  const url = `${BASE}${src}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: color,
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        ...style,
      }}
    />
  );
}

/**
 * Helper to get icon src for a building ID.
 */
export function getBuildingIcon(buildingId) {
  return BUILDING_ICON_MAP[buildingId] ?? null;
}

/**
 * Helper to get icon src for a flower ID.
 */
export function getFlowerIcon(flowerId) {
  return FLOWER_ICON_MAP[flowerId] ?? null;
}

/**
 * Helper to get icon src for a merge gift tier.
 */
export function getGiftIcon(tier) {
  return GIFT_ICON_MAP[tier] ?? null;
}

/**
 * Helper to get icon src for a stock channel ID.
 */
export function getStockIcon(channelId) {
  return STOCK_ICON_MAP[channelId] ?? null;
}
