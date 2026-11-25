// Golden Ladle render: every pixel of the kitchen, drawn with canvas paths.
// The food is drawn, not pasted: each ingredient is a small vector picture,
// so the game looks the same offline and in a screenshot.
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  LAYOUT,
  binRect,
  plateRect,
  serveRect,
  stationRect,
  ticketRect,
  trashRect,
  traySlotRect,
} from './config.js';
import { INGREDIENTS, RECIPE_BY_ID, findMatchingOrder, finishedKey, plateKeys } from './recipes.js';

/** Rounded-rectangle path. */
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function text(ctx, s, x, y, size, color, font = 'bold', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${font} ${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function titleText(ctx, s, x, y, size, color, align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

/** A heart, for the lives row. */
function drawHeart(ctx, x, y, s, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 16, s / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-9, -3, -5, -10, 0, -5);
  ctx.bezierCurveTo(5, -10, 9, -3, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? COLORS.red : '#00000022';
  ctx.fill();
  ctx.restore();
}

/**
 * One ingredient, drawn at (cx, cy) with size s (its bounding box). `key` is
 * a raw kind ('tomato') or a finished key ('tomato-chopped'). Every dish on
 * a ticket, in a bin, on a station and on a plate goes through here, so the
 * art is one consistent set.
 */
export function drawFood(ctx, key, cx, cy, s) {
  const r = s / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (key === 'bun') {
    ctx.fillStyle = '#d99a4e';
    rr(ctx, -r * 0.95, -r * 0.1, r * 1.9, r * 0.55, r * 0.25);
    ctx.fill();
    ctx.fillStyle = COLORS.bun;
    ctx.beginPath();
    ctx.arc(0, -r * 0.05, r * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff2cf';
    for (const [dx, dy] of [[-0.45, -0.55], [0, -0.75], [0.45, -0.55], [-0.2, -0.35], [0.25, -0.3]]) {
      ctx.beginPath();
      ctx.ellipse(dx * r, dy * r, r * 0.09, r * 0.06, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (key === 'patty' || key === 'patty-grilled') {
    ctx.fillStyle = key === 'patty-grilled' ? '#5d3413' : COLORS.patty;
    rr(ctx, -r, -r * 0.42, r * 2, r * 0.84, r * 0.4);
    ctx.fill();
    ctx.strokeStyle = '#3f2208';
    ctx.lineWidth = Math.max(2, r * 0.12);
    for (const dx of [-0.5, 0, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(dx * r, -r * 0.4);
      ctx.lineTo(dx * r, r * 0.4);
      ctx.stroke();
    }
    if (key === 'patty-grilled') {
      ctx.fillStyle = '#2c1503';
      circle(ctx, -r * 0.6, -r * 0.2, r * 0.12);
      ctx.fill();
      circle(ctx, r * 0.55, r * 0.15, r * 0.1);
      ctx.fill();
    }
  } else if (key === 'lettuce' || key === 'lettuce-chopped') {
    if (key === 'lettuce') {
      ctx.fillStyle = '#2f7d3a';
      for (const [dx, dy] of [[-0.4, -0.2], [0.4, -0.2], [0, 0.35], [-0.1, -0.5], [0.3, 0.3]]) {
        circle(ctx, dx * r, dy * r, r * 0.55);
        ctx.fill();
      }
      ctx.fillStyle = COLORS.lettuce;
      circle(ctx, 0, 0, r * 0.62);
      ctx.fill();
      ctx.strokeStyle = '#8ed694';
      ctx.lineWidth = Math.max(1.5, r * 0.07);
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.5);
      ctx.lineTo(0, r * 0.5);
      ctx.moveTo(-r * 0.4, -r * 0.2);
      ctx.lineTo(r * 0.4, -r * 0.2);
      ctx.stroke();
    } else {
      ctx.fillStyle = COLORS.lettuce;
      for (const [dx, dy, rot] of [[-0.4, 0.1, 0.5], [0.1, -0.3, -0.4], [0.45, 0.25, 0.9]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r);
        ctx.rotate(rot);
        rr(ctx, -r * 0.45, -r * 0.14, r * 0.9, r * 0.28, r * 0.14);
        ctx.fill();
        ctx.restore();
      }
    }
  } else if (key === 'tomato' || key === 'tomato-chopped') {
    if (key === 'tomato') {
      ctx.fillStyle = COLORS.tomato;
      circle(ctx, 0, r * 0.05, r * 0.85);
      ctx.fill();
      ctx.fillStyle = '#ff8a7a';
      circle(ctx, -r * 0.3, -r * 0.25, r * 0.22);
      ctx.fill();
      ctx.fillStyle = COLORS.green;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
        ctx.lineTo(Math.cos(a) * r * 0.45, -r * 0.75 + Math.sin(a) * r * 0.3);
        const a2 = a + Math.PI / 5;
        ctx.lineTo(Math.cos(a2) * r * 0.16, -r * 0.75 + Math.sin(a2) * r * 0.12);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = '#f0564a';
      for (const [dx, dy, rot] of [[-0.35, 0.1, 0.4], [0.3, -0.25, -0.5], [0.35, 0.35, 1.1]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.5);
        ctx.lineTo(r * 0.42, r * 0.4);
        ctx.lineTo(-r * 0.42, r * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#ffd9d0';
      circle(ctx, -r * 0.2, r * 0.05, r * 0.08);
      ctx.fill();
      circle(ctx, r * 0.3, r * 0.3, r * 0.07);
      ctx.fill();
    }
  } else if (key === 'onion' || key === 'onion-chopped') {
    if (key === 'onion') {
      ctx.fillStyle = '#a86fc0';
      circle(ctx, 0, 0, r * 0.85);
      ctx.fill();
      ctx.strokeStyle = '#e8d5f2';
      ctx.lineWidth = Math.max(1.5, r * 0.09);
      circle(ctx, 0, 0, r * 0.55);
      ctx.stroke();
      circle(ctx, 0, 0, r * 0.28);
      ctx.stroke();
      ctx.fillStyle = '#7ec850';
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85);
      ctx.quadraticCurveTo(r * 0.3, -r * 1.25, r * 0.05, -r * 1.15);
      ctx.quadraticCurveTo(-r * 0.2, -r * 1.1, 0, -r * 0.85);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#c9a0dd';
      ctx.lineWidth = Math.max(2, r * 0.14);
      for (const [dx, dy, rad] of [[-0.35, 0.05, 0.32], [0.3, -0.2, 0.26], [0.3, 0.35, 0.22]]) {
        circle(ctx, dx * r, dy * r, rad * r);
        ctx.stroke();
      }
      ctx.strokeStyle = '#a86fc0';
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      for (const [dx, dy, rad] of [[-0.35, 0.05, 0.18], [0.3, -0.2, 0.14]]) {
        circle(ctx, dx * r, dy * r, rad * r);
        ctx.stroke();
      }
    }
  } else if (key === 'mushroom' || key === 'mushroom-chopped') {
    if (key === 'mushroom') {
      ctx.fillStyle = '#f3e9d2';
      rr(ctx, -r * 0.22, -r * 0.1, r * 0.44, r * 0.85, r * 0.2);
      ctx.fill();
      ctx.fillStyle = '#c98f5f';
      ctx.beginPath();
      ctx.arc(0, -r * 0.1, r * 0.9, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff6e0';
      for (const [dx, dy] of [[-0.5, -0.45], [0, -0.65], [0.5, -0.45]]) {
        circle(ctx, dx * r, dy * r, r * 0.12);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#e3cfa5';
      ctx.strokeStyle = '#a87c4a';
      ctx.lineWidth = Math.max(1.5, r * 0.07);
      for (const [dx, dy, rot] of [[-0.4, 0.15, 0.3], [0.15, -0.3, -0.3], [0.45, 0.3, 0.8]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillRect(-r * 0.08, 0, r * 0.16, r * 0.35);
        ctx.restore();
      }
    }
  } else if (key === 'cheese') {
    ctx.fillStyle = COLORS.cheese;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.6);
    ctx.lineTo(r * 0.9, r * 0.6);
    ctx.lineTo(0, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8a91c';
    for (const [dx, dy, rad] of [[-0.25, 0.25, 0.13], [0.3, 0.1, 0.11], [0.05, -0.35, 0.09]]) {
      circle(ctx, dx * r, dy * r, rad * r);
      ctx.fill();
    }
  } else if (key === 'egg' || key === 'egg-grilled') {
    ctx.fillStyle = '#fdf6e3';
    ctx.strokeStyle = '#d9c9a3';
    ctx.lineWidth = Math.max(1.5, r * 0.07);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (key === 'egg-grilled') {
      ctx.strokeStyle = '#d8a35a';
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.75, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#f5a623';
    circle(ctx, r * 0.1, 0, r * 0.42);
    ctx.fill();
    ctx.fillStyle = '#ffc93c';
    circle(ctx, r * 0.02, -r * 0.08, r * 0.22);
    ctx.fill();
  } else if (key === 'pasta' || key === 'pasta-boiled') {
    ctx.strokeStyle = '#e8b13a';
    ctx.lineWidth = Math.max(2.5, r * 0.16);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc((i - 1) * r * 0.45, (i % 2 === 0 ? -0.15 : 0.2) * r, r * 0.42, 0.3, Math.PI * 1.7);
      ctx.stroke();
    }
    if (key === 'pasta-boiled') {
      ctx.strokeStyle = '#ffffffaa';
      ctx.lineWidth = Math.max(2, r * 0.1);
      for (const dx of [-0.4, 0.1, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(dx * r, -r * 0.7);
        ctx.quadraticCurveTo((dx + 0.2) * r, -r * 1.05, (dx - 0.1) * r, -r * 1.35);
        ctx.stroke();
      }
    }
  } else if (key === 'burnt') {
    ctx.fillStyle = '#241a12';
    circle(ctx, 0, 0, r * 0.8);
    ctx.fill();
    ctx.fillStyle = '#4a4a4a';
    circle(ctx, -r * 0.3, -r * 0.2, r * 0.18);
    ctx.fill();
    circle(ctx, r * 0.35, r * 0.25, r * 0.14);
    ctx.fill();
  }
  ctx.restore();
}

/** A thin progress bar under a station. */
function progressBar(ctx, x, y, w, frac, color) {
  ctx.fillStyle = '#00000033';
  rr(ctx, x, y, w, 10, 5);
  ctx.fill();
  ctx.fillStyle = color;
  rr(ctx, x, y, Math.max(10, w * Math.min(1, frac)), 10, 5);
  ctx.fill();
}

/** A progress ring around a point, for the chopping board. */
function progressRing(ctx, x, y, r, frac, color) {
  ctx.strokeStyle = '#00000033';
  ctx.lineWidth = 6;
  circle(ctx, x, y, r);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac));
  ctx.stroke();
}

function drawTicket(ctx, world, slot, time) {
  const order = world.orders[slot];
  const rect = ticketRect(slot);
  ctx.save();
  ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
  ctx.rotate((slot - 1) * 0.012);
  ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
  ctx.fillStyle = COLORS.ticket;
  ctx.shadowColor = '#00000033';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (!order) {
    ctx.fillStyle = COLORS.inkSoft;
    text(ctx, 'Waiting for', rect.x + rect.w / 2, rect.y + rect.h / 2 - 12, 15, COLORS.inkSoft);
    text(ctx, 'the next order...', rect.x + rect.w / 2, rect.y + rect.h / 2 + 12, 15, COLORS.inkSoft);
    ctx.restore();
    return;
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const frac = Math.max(0, order.patience / order.maxPatience);
  const urgent = frac < 0.35;
  ctx.fillStyle = urgent && Math.sin(time * 6) > 0 ? '#ffe3df' : COLORS.ticket;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 8);
  ctx.fill();
  ctx.strokeStyle = COLORS.ticketEdge;
  ctx.lineWidth = 2;
  rr(ctx, rect.x + 5, rect.y + 5, rect.w - 10, rect.h - 10, 6);
  ctx.stroke();
  text(ctx, `#${order.id}`, rect.x + 14, rect.y + 18, 12, COLORS.inkSoft, 'bold', 'left');
  text(ctx, `$${recipe.price}`, rect.x + rect.w - 14, rect.y + 18, 14, '#2e7d32', 'bold', 'right');
  titleText(ctx, recipe.name, rect.x + rect.w / 2, rect.y + 46, 21, COLORS.ink);
  text(ctx, recipe.blurb, rect.x + rect.w / 2, rect.y + 72, 11, COLORS.inkSoft);
  const needs = recipe.needs;
  const iconGap = Math.min(52, (rect.w - 40) / needs.length);
  const startX = rect.x + rect.w / 2 - ((needs.length - 1) * iconGap) / 2;
  needs.forEach((key, i) => {
    drawFood(ctx, key, startX + i * iconGap, rect.y + 106, 34);
  });
  const barX = rect.x + 14;
  const barW = rect.w - 28;
  const barY = rect.y + rect.h - 20;
  ctx.fillStyle = '#00000022';
  rr(ctx, barX, barY, barW, 9, 4);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? '#e8a91c' : COLORS.danger;
  rr(ctx, barX, barY, Math.max(9, barW * frac), 9, 4);
  ctx.fill();
  ctx.restore();
}

function drawHeader(ctx, world, time) {
  const h = LAYOUT.header;
  ctx.fillStyle = COLORS.woodDark;
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.fillStyle = COLORS.wood;
  ctx.fillRect(h.x, h.y + h.h - 6, h.w, 6);
  titleText(ctx, 'GOLDEN LADLE', 24, 34, 30, COLORS.goldLight, 'left');
  text(ctx, 'RUSH HOUR KITCHEN', 24, 54, 10, '#e8c98f', 'bold', 'left');
  const cx = CANVAS_WIDTH / 2;
  const total = Math.max(0, Math.ceil(world.timeLeft));
  const mm = Math.floor(total / 60);
  const ss = String(total % 60).padStart(2, '0');
  const low = world.screen === 'play' && world.timeLeft <= 10;
  ctx.fillStyle = low && Math.sin(time * 8) > 0 ? COLORS.danger : COLORS.cream;
  ctx.beginPath();
  ctx.arc(cx, 32, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = low ? COLORS.danger : COLORS.gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, 32, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, world.timeLeft / 150));
  ctx.stroke();
  titleText(ctx, `${mm}:${ss}`, cx, 33, 20, COLORS.ink);
  const right = CANVAS_WIDTH - 24;
  text(ctx, `SCORE ${world.score}`, right, 20, 16, COLORS.cream, 'bold', 'right');
  text(ctx, `COINS ${world.coins}   COMBO x${world.combo}`, right, 44, 13, COLORS.goldLight, 'bold', 'right');
  for (let i = 0; i < 3; i++) {
    drawHeart(ctx, CANVAS_WIDTH - 300 + i * 30, 32, 22, i < world.hearts);
  }
}

function drawBoard(ctx, world, time) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#7a4a21';
  rr(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.fillStyle = '#9c6b35';
  rr(ctx, b.x + 6, b.y + 6, b.w - 12, b.h - 12, 9);
  ctx.fill();
  titleText(ctx, 'ORDER BOARD', b.x + b.w / 2, b.y + 28, 22, COLORS.cream);
  for (let slot = 0; slot < 3; slot++) drawTicket(ctx, world, slot, time);
}

function drawBins(ctx, world) {
  const bins = LAYOUT.bins;
  ctx.fillStyle = COLORS.counter;
  rr(ctx, bins.x - 8, bins.y, bins.w + 16, bins.h, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.counterTop;
  rr(ctx, bins.x - 8, bins.y, bins.w + 16, 10, 5);
  ctx.fill();
  titleText(ctx, 'INGREDIENTS  ·  click a bin or press 1-9', bins.x + 8, bins.y + 16, 13, COLORS.cream, 'left');
  INGREDIENTS.forEach((ing, i) => {
    const rect = binRect(i);
    const hovered = world.hover && world.hover.type === 'bin' && world.hover.index === i;
    ctx.fillStyle = hovered ? '#ffe9b0' : COLORS.cream;
    ctx.strokeStyle = hovered ? COLORS.gold : '#d9c49a';
    ctx.lineWidth = hovered ? 3 : 2;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.stroke();
    drawFood(ctx, ing.kind, rect.x + rect.w / 2, rect.y + 38, 52);
    text(ctx, ing.label, rect.x + rect.w / 2, rect.y + 76, 12, COLORS.ink);
    ctx.fillStyle = COLORS.wood;
    circle(ctx, rect.x + 12, rect.y + 12, 9);
    ctx.fill();
    text(ctx, ing.key, rect.x + 12, rect.y + 13, 11, COLORS.cream);
  });
}

function drawStation(ctx, world, name, time) {
  const rect = stationRect(name);
  const slot = world.stations[name];
  const hovered = world.hover && world.hover.type === 'station' && world.hover.name === name;
  ctx.fillStyle = hovered ? '#ffe9b0' : COLORS.cream;
  ctx.strokeStyle = hovered ? COLORS.gold : '#d9c49a';
  ctx.lineWidth = hovered ? 3 : 2;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.stroke();
  const cx = rect.x + rect.w / 2;
  if (name === 'chop') {
    titleText(ctx, 'CHOPPING BOARD', cx, rect.y + 18, 14, COLORS.ink);
    ctx.fillStyle = '#e3c893';
    rr(ctx, cx - 105, rect.y + 42, 210, 84, 10);
    ctx.fill();
    ctx.strokeStyle = '#b98d4f';
    ctx.lineWidth = 2;
    rr(ctx, cx - 105, rect.y + 42, 210, 84, 10);
    ctx.stroke();
    if (slot.kind !== null) {
      drawFood(ctx, slot.done ? `${slot.kind}-chopped` : slot.kind, cx - 30, rect.y + 84, 56);
      if (!slot.done) progressRing(ctx, cx - 30, rect.y + 84, 36, slot.progress / slot.duration, COLORS.green);
      ctx.save();
      ctx.translate(cx + 55, rect.y + 70);
      ctx.rotate(-0.5 + Math.sin(time * 14) * (slot.done ? 0 : 0.12));
      ctx.fillStyle = '#c8ccd4';
      ctx.beginPath();
      ctx.moveTo(-6, -34);
      ctx.lineTo(10, -28);
      ctx.lineTo(4, 6);
      ctx.lineTo(-8, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5a3a1a';
      rr(ctx, -9, 4, 16, 26, 4);
      ctx.fill();
      ctx.restore();
      text(ctx, slot.done ? 'Chopped! Click to take' : 'Chopping...', cx, rect.y + 140, 12, COLORS.inkSoft);
    } else {
      text(ctx, 'Click with a veggie', cx, rect.y + 84, 13, COLORS.inkSoft);
      text(ctx, 'in your tray', cx, rect.y + 104, 13, COLORS.inkSoft);
    }
  } else if (name === 'grill') {
    titleText(ctx, 'GRILL', cx, rect.y + 18, 14, COLORS.ink);
    ctx.fillStyle = '#2e2a26';
    rr(ctx, cx - 105, rect.y + 42, 210, 84, 10);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 100, rect.y + 58 + i * 18);
      ctx.lineTo(cx + 100, rect.y + 58 + i * 18);
      ctx.stroke();
    }
    if (slot.kind !== null) {
      const cooking = !slot.done;
      if (cooking) {
        ctx.fillStyle = '#ff7b2e';
        for (const dx of [-60, 0, 60]) {
          const flick = Math.sin(time * 9 + dx) * 4;
          ctx.beginPath();
          ctx.moveTo(cx + dx - 14, rect.y + 126);
          ctx.quadraticCurveTo(cx + dx + flick, rect.y + 96, cx + dx + 14, rect.y + 126);
          ctx.closePath();
          ctx.fill();
        }
      }
      drawFood(ctx, slot.done ? `${slot.kind}-grilled` : slot.kind, cx, rect.y + 84, 62);
      if (cooking) {
        progressBar(ctx, cx - 80, rect.y + 134, 160, slot.progress / slot.duration, '#ff7b2e');
      } else if (slot.overcook > 2.5) {
        text(ctx, 'BURNING! Grab it!', cx, rect.y + 140, 12, COLORS.danger);
      } else {
        text(ctx, 'Ready! Click to take', cx, rect.y + 140, 12, COLORS.green);
      }
    } else {
      ctx.fillStyle = '#e8c98f';
      ctx.font = 'bold 13px Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Click with a patty or egg', cx, rect.y + 84);
      ctx.fillText('in your tray', cx, rect.y + 104);
    }
  } else {
    titleText(ctx, 'POT  ·  BOILING', cx, rect.y + 18, 14, COLORS.ink);
    ctx.fillStyle = '#8d99a6';
    rr(ctx, cx - 95, rect.y + 52, 190, 76, 12);
    ctx.fill();
    ctx.fillStyle = '#6b7683';
    rr(ctx, cx - 105, rect.y + 44, 210, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#7fb3d5';
    ctx.beginPath();
    ctx.ellipse(cx, rect.y + 58, 88, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    if (slot.kind !== null) {
      drawFood(ctx, slot.done ? 'pasta-boiled' : 'pasta', cx, rect.y + 66, 54);
      ctx.strokeStyle = '#ffffffaa';
      ctx.lineWidth = 2;
      for (const dx of [-40, 0, 40]) {
        const bob = Math.sin(time * 5 + dx) * 3;
        ctx.beginPath();
        ctx.moveTo(cx + dx, rect.y + 40 + bob);
        ctx.quadraticCurveTo(cx + dx + 8, rect.y + 26 + bob, cx + dx - 4, rect.y + 12 + bob);
        ctx.stroke();
      }
      if (!slot.done) {
        progressBar(ctx, cx - 80, rect.y + 134, 160, slot.progress / slot.duration, '#4a90d9');
      } else {
        text(ctx, 'Ready! Click to take', cx, rect.y + 140, 12, COLORS.green);
      }
    } else {
      text(ctx, 'Click with pasta', cx, rect.y + 84, 13, COLORS.inkSoft);
      text(ctx, 'in your tray', cx, rect.y + 104, 13, COLORS.inkSoft);
    }
  }
}

function drawPlateArea(ctx, world) {
  const area = LAYOUT.plate;
  const hovered = world.hover && world.hover.type === 'plate';
  ctx.fillStyle = hovered ? '#ffe9b0' : COLORS.cream;
  ctx.strokeStyle = hovered ? COLORS.gold : '#d9c49a';
  ctx.lineWidth = hovered ? 3 : 2;
  rr(ctx, area.x, area.y, area.w, area.h, 12);
  ctx.fill();
  ctx.stroke();
  titleText(ctx, 'ASSEMBLY PLATE', area.x + area.w / 2, area.y + 20, 14, COLORS.ink);
  const rect = plateRect();
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 96;
  ctx.fillStyle = '#e8e2d4';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18, 150, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 132, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9d2c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 132, 34, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (world.plate.length === 0) {
    text(ctx, 'Click the plate to move', cx, cy - 6, 13, COLORS.inkSoft);
    text(ctx, 'tray items here', cx, cy + 14, 13, COLORS.inkSoft);
  } else {
    world.plate.forEach((item, i) => {
      const jitter = (i % 2 === 0 ? -1 : 1) * 8;
      drawFood(ctx, item.key, cx + jitter, cy - 6 - i * 16, 62);
    });
  }
  const match = world.plate.length > 0 ? findMatchingOrder(plateKeys(world.plate), world.orders) : null;
  if (match) {
    ctx.fillStyle = COLORS.green;
    rr(ctx, cx - 90, rect.y + rect.h - 26, 180, 22, 11);
    ctx.fill();
    text(ctx, `Matches ${RECIPE_BY_ID[match.recipeId].name}!`, cx, rect.y + rect.h - 14, 12, '#ffffff');
  }
}

function drawServeArea(ctx, world, time) {
  const area = LAYOUT.serve;
  const hovered = world.hover && world.hover.type === 'serve';
  const match = world.plate.length > 0 ? findMatchingOrder(plateKeys(world.plate), world.orders) : null;
  const glow = match !== null || world.servedFlash > 0;
  ctx.fillStyle = hovered ? '#ffe9b0' : COLORS.cream;
  ctx.strokeStyle = glow ? COLORS.gold : '#d9c49a';
  ctx.lineWidth = glow ? 4 : 2;
  if (glow) {
    ctx.shadowColor = COLORS.serveGlow;
    ctx.shadowBlur = 24 + Math.sin(time * 5) * 8;
  }
  rr(ctx, area.x, area.y, area.w, area.h, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.stroke();
  titleText(ctx, 'SERVING WINDOW', area.x + area.w / 2, area.y + 20, 14, COLORS.ink);
  const rect = serveRect();
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + 92;
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.red : '#ffffff';
    ctx.fillRect(rect.x + 30 + i * 76, rect.y + 8, 76, 22);
  }
  ctx.fillStyle = '#5a3a1a';
  rr(ctx, rect.x + 20, rect.y + 118, rect.w - 40, 18, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(cx, cy + 6, 26, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(cx - 30, cy + 4, 60, 6);
  circle(ctx, cx, cy - 26, 5);
  ctx.fill();
  if (world.servedFlash > 0) {
    const a = Math.min(1, world.servedFlash / 0.5);
    ctx.save();
    ctx.globalAlpha = a;
    titleText(ctx, 'SERVED!', cx, cy - 52, 34, COLORS.green);
    ctx.restore();
  } else if (match) {
    text(ctx, 'Order complete, serve it!', cx, cy - 52, 16, COLORS.green);
  } else if (world.plate.length > 0) {
    // A plate that is a subset of some open order is still being built.
    const keys = plateKeys(world.plate);
    const building = world.orders.some((order) => {
      const needs = [...RECIPE_BY_ID[order.recipeId].needs];
      return keys.every((key) => {
        const at = needs.indexOf(key);
        if (at < 0) return false;
        needs.splice(at, 1);
        return true;
      });
    });
    text(ctx, building ? 'Keep building — almost there' : 'No order matches this plate', cx, cy - 52, 14, building ? COLORS.inkSoft : COLORS.danger);
  } else {
    text(ctx, 'Ring the bell when a dish is ready', cx, cy - 52, 13, COLORS.inkSoft);
  }
  text(ctx, `Served: ${world.served}   Walked out: ${world.lost}`, cx, rect.y + rect.h - 12, 12, COLORS.inkSoft);
}

function drawTray(ctx, world) {
  const tray = LAYOUT.tray;
  ctx.fillStyle = COLORS.woodDark;
  rr(ctx, tray.x, tray.y, tray.w, tray.h, 10);
  ctx.fill();
  text(ctx, 'TRAY', 30, tray.y + 30, 15, COLORS.goldLight, 'bold', 'left');
  for (let i = 0; i < 3; i++) {
    const rect = traySlotRect(i);
    const item = world.tray[i];
    const hovered = world.hover && world.hover.type === 'tray' && world.hover.index === i;
    ctx.fillStyle = hovered ? '#ffe9b0' : item ? COLORS.cream : '#00000033';
    ctx.strokeStyle = hovered ? COLORS.gold : '#ffffff55';
    ctx.lineWidth = hovered ? 3 : 2;
    rr(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fill();
    ctx.stroke();
    if (item) drawFood(ctx, item.ready ? finishedKey(item.kind) : item.kind, rect.x + rect.w / 2, rect.y + rect.h / 2, 36);
  }
  const trash = trashRect();
  ctx.fillStyle = '#00000033';
  rr(ctx, trash.x, trash.y, trash.w, trash.h, 8);
  ctx.fill();
  ctx.fillStyle = '#c8ccd4';
  rr(ctx, trash.x + 14, trash.y + 12, 28, 24, 3);
  ctx.fill();
  ctx.fillStyle = '#8d99a6';
  rr(ctx, trash.x + 10, trash.y + 8, 36, 6, 3);
  ctx.fill();
  text(ctx, 'Click a tray item to toss it  ·  Keys 1-9 grab ingredients  ·  P pauses', 850, tray.y + 30, 12, '#e8c98f');
}

function drawPopups(ctx, world) {
  for (const popup of world.popups) {
    const a = 1 - popup.age / popup.life;
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    text(ctx, popup.text, popup.x, popup.y - popup.age * 40, 18, popup.color);
    ctx.restore();
  }
}

function drawTitle(ctx, world) {
  ctx.fillStyle = '#3b2a1add';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, 290, 110, 700, 470, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 4;
  rr(ctx, 290, 110, 700, 470, 18);
  ctx.stroke();
  titleText(ctx, 'GOLDEN LADLE', 640, 170, 54, COLORS.ink);
  titleText(ctx, 'Rush Hour Kitchen', 640, 214, 24, COLORS.gold);
  text(ctx, 'Orders pile up on the board. Grab ingredients, chop, grill and', 640, 272, 16, COLORS.inkSoft);
  text(ctx, 'boil them, stack each dish on the plate, and serve it before', 640, 296, 16, COLORS.inkSoft);
  text(ctx, 'the customer walks out. Three walk-outs end the shift.', 640, 320, 16, COLORS.inkSoft);
  text(ctx, 'Mouse: click bins, stations, plate and bell  ·  Keys 1-9: ingredients', 640, 368, 14, COLORS.ink);
  text(ctx, 'C: chop   G: grill   B: boil   A: assemble   S: serve', 640, 392, 14, COLORS.ink);
  const pulse = 0.75 + Math.sin(Date.now() / 300) * 0.25;
  ctx.save();
  ctx.globalAlpha = pulse;
  titleText(ctx, 'Click or press Enter to start', 640, 452, 24, COLORS.green);
  ctx.restore();
  if (world.best > 0) text(ctx, `Best score: ${world.best}`, 640, 500, 15, COLORS.inkSoft);
  text(ctx, '150 seconds a shift  ·  combos pay extra  ·  burnt food gets tossed', 640, 540, 13, COLORS.inkSoft);
}

function drawGameOver(ctx, world) {
  ctx.fillStyle = '#3b2a1add';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = COLORS.cream;
  rr(ctx, 340, 150, 600, 400, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 4;
  rr(ctx, 340, 150, 600, 400, 18);
  ctx.stroke();
  titleText(ctx, world.overReason, 640, 210, 36, COLORS.ink);
  titleText(ctx, `Score: ${world.score}`, 640, 280, 30, COLORS.gold);
  text(ctx, `Dishes served: ${world.served}    Best combo: x${world.bestCombo}`, 640, 330, 16, COLORS.inkSoft);
  text(ctx, `Tips earned: ${world.tips}    Orders lost: ${world.lost}`, 640, 358, 16, COLORS.inkSoft);
  text(ctx, `Coins: ${world.coins}`, 640, 386, 16, COLORS.inkSoft);
  const pulse = 0.75 + Math.sin(Date.now() / 300) * 0.25;
  ctx.save();
  ctx.globalAlpha = pulse;
  titleText(ctx, 'Press R to play again', 640, 462, 22, COLORS.green);
  ctx.restore();
}

/** Draw the whole kitchen for one frame. `time` is seconds, for animation. */
export function drawWorld(ctx, world, time) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = COLORS.wallDark;
  for (let x = 0; x < CANVAS_WIDTH; x += 96) {
    ctx.fillRect(x, 64, 48, 16);
  }
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 648, CANVAS_WIDTH, 8);
  drawHeader(ctx, world, time);
  drawBoard(ctx, world, time);
  drawBins(ctx, world);
  drawStation(ctx, world, 'chop', time);
  drawStation(ctx, world, 'grill', time);
  drawStation(ctx, world, 'pot', time);
  drawPlateArea(ctx, world);
  drawServeArea(ctx, world, time);
  drawTray(ctx, world);
  drawPopups(ctx, world);
  if (world.screen === 'title') drawTitle(ctx, world);
  else if (world.screen === 'over') drawGameOver(ctx, world);
  else if (world.paused) {
    ctx.fillStyle = '#3b2a1a99';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    titleText(ctx, 'PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10, 44, COLORS.cream);
    text(ctx, 'Press P to keep cooking', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 36, 16, COLORS.cream);
  }
}
