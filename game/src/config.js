// Golden Ladle: the kitchen's fixed numbers. Every layout rect, colour and timing
// lives here so render.js and input.js always agree on where things are.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const TRAY_MAX = 3;
export const PLATE_MAX = 4;
export const MAX_ORDERS = 3;

export const CHOP_SECONDS = 1.6;
export const GRILL_SECONDS = 3.2;
export const BOIL_SECONDS = 4.0;
export const BURN_AFTER_SECONDS = 4.5;

export const ORDER_FIRST_IN = 4;
export const ORDER_SPAWN_START = 14;
export const ORDER_SPAWN_END = 8;
export const PATIENCE_START = 52;
export const PATIENCE_END = 34;

// Warm kitchen palette.
export const COLORS = {
  wall: '#f6e3bd',
  wallDark: '#efd9a7',
  floor: '#a9703f',
  floorLine: '#8f5a2e',
  wood: '#8a5a33',
  woodDark: '#6e4525',
  counter: '#b07a45',
  counterTop: '#c98f52',
  cream: '#fff6e0',
  paper: '#fffdf4',
  ink: '#3b2a1a',
  inkSoft: '#6b4e2e',
  gold: '#d4a017',
  goldLight: '#f2c94c',
  red: '#d9382b',
  green: '#3f9e4d',
  tomato: '#e23b2e',
  lettuce: '#58b368',
  cheese: '#ffc93c',
  patty: '#7a4a21',
  bun: '#e8b06a',
  onion: '#b678c2',
  mushroom: '#d8cbb8',
  egg: '#fff3c4',
  pasta: '#f2c14e',
  ticket: '#fff8dc',
  ticketEdge: '#e0c98f',
  serveGlow: '#ffd94d',
  danger: '#c62f24',
};

// Layout rectangles, computed once from the canvas size.
export const LAYOUT = {
  header: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 16, y: 80, w: 288, h: 560 },
  bins: { x: 320, y: 80, w: 944, h: 124 },
  stations: { x: 320, y: 220, w: 944, h: 184 },
  plate: { x: 320, y: 420, w: 400, h: 220 },
  serve: { x: 736, y: 420, w: 528, h: 220 },
  tray: { x: 16, y: 656, w: 1248, h: 56 },
};

export function ticketRect(slot) {
  return { x: LAYOUT.board.x + 14, y: LAYOUT.board.y + 52 + slot * 160, w: LAYOUT.board.w - 28, h: 148 };
}

export function binRect(index) {
  const gap = 7;
  const w = 96;
  return { x: LAYOUT.bins.x + index * (w + gap), y: LAYOUT.bins.y + 28, w, h: 92 };
}

export function stationRect(kind) {
  const y = LAYOUT.stations.y + 28;
  const h = 152;
  if (kind === 'chop') return { x: 320, y, w: 300, h };
  if (kind === 'grill') return { x: 636, y, w: 300, h };
  return { x: 952, y, w: 312, h };
}

export function plateRect() {
  return { x: LAYOUT.plate.x, y: LAYOUT.plate.y + 28, w: LAYOUT.plate.w, h: 188 };
}

export function serveRect() {
  return { x: LAYOUT.serve.x, y: LAYOUT.serve.y + 28, w: LAYOUT.serve.w, h: 188 };
}

export function traySlotRect(index) {
  return { x: 340 + index * 64, y: LAYOUT.tray.y + 6, w: 56, h: 44 };
}

export function trashRect() {
  return { x: 1180, y: LAYOUT.tray.y + 6, w: 56, h: 44 };
}
