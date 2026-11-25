// Golden Ladle input: mouse clicks and keyboard shortcuts, hit-tested against
// the same layout rects render.js draws, so a click lands where the eye says.
import { LAYOUT, binRect, plateRect, serveRect, stationRect, trashRect, traySlotRect } from './config.js';
import { INGREDIENTS } from './recipes.js';
import {
  clickPlate,
  clickPlateItem,
  clickServe,
  clickStation,
  clickTrayItem,
  pickIngredient,
  startShift,
} from './world.js';
import { playChop, playDone, playError, playPick, playServe, toggleMute, unlockSound } from './sound.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** Where a pointer is: a bin, a station, the plate, the serve window, the tray, or nowhere. */
export function hitAt(x, y, world) {
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (inside(x, y, binRect(i))) return { type: 'bin', index: i };
  }
  for (const name of ['chop', 'grill', 'pot']) {
    if (inside(x, y, stationRect(name))) return { type: 'station', name };
  }
  if (inside(x, y, plateRect())) return { type: 'plate' };
  if (inside(x, y, serveRect())) return { type: 'serve' };
  for (let i = 0; i < 3; i++) {
    if (inside(x, y, traySlotRect(i))) return { type: 'tray', index: i };
  }
  if (inside(x, y, trashRect())) return { type: 'trash' };
  return null;
}

/** What a click at canvas coordinates does. Returns the new world (startShift makes one). */
export function handleClick(world, x, y) {
  unlockSound();
  if (world.screen === 'title') return startShift(world);
  if (world.screen === 'over') return world;
  if (world.screen !== 'play' || world.paused) return world;
  const hit = hitAt(x, y, world);
  if (hit === null) return world;
  if (hit.type === 'bin') {
    if (pickIngredient(world, INGREDIENTS[hit.index].kind)) playPick();
    return world;
  }
  if (hit.type === 'station') {
    const result = clickStation(world, hit.name);
    if (result === 'started') playChop();
    else if (result === 'collected') playDone();
    return world;
  }
  if (hit.type === 'plate') {
    // Hands full: the plate takes the tray's items. Hands empty: the plate
    // hands its top item back, so a mis-stack can be fixed.
    if (world.tray.length > 0) {
      if (clickPlate(world)) playPick();
    } else if (world.plate.length > 0) {
      if (clickPlateItem(world, world.plate.length - 1)) playPick();
    }
    return world;
  }
  if (hit.type === 'serve') {
    const result = clickServe(world);
    if (result === 'served') playServe();
    else if (result === 'wrong') playError();
    return world;
  }
  if (hit.type === 'tray' || hit.type === 'trash') {
    if (hit.type === 'tray' && world.tray[hit.index]) clickTrayItem(world, hit.index);
    else if (hit.type === 'trash' && world.tray.length > 0) clickTrayItem(world, world.tray.length - 1);
    return world;
  }
  return world;
}

/** What a key press does. Returns the new world (startShift makes one). */
export function handleKey(world, key) {
  const k = key.toLowerCase();
  if (world.screen === 'title' && (k === 'enter' || k === ' ')) return startShift(world);
  if (world.screen === 'over' && k === 'r') return startShift(world);
  if (k === 'm') {
    toggleMute();
    return world;
  }
  if (world.screen !== 'play') return world;
  if (k === 'p') {
    world.paused = !world.paused;
    return world;
  }
  if (world.paused) return world;
  const bin = INGREDIENTS.find((ing) => ing.key === k);
  if (bin) {
    if (pickIngredient(world, bin.kind)) playPick();
    return world;
  }
  if (k === 'c') {
    const result = clickStation(world, 'chop');
    if (result === 'started') playChop();
    else if (result === 'collected') playDone();
  } else if (k === 'g') {
    const result = clickStation(world, 'grill');
    if (result === 'started') playChop();
    else if (result === 'collected') playDone();
  } else if (k === 'b') {
    const result = clickStation(world, 'pot');
    if (result === 'started') playChop();
    else if (result === 'collected') playDone();
  } else if (k === 'a') {
    if (clickPlate(world)) playPick();
  } else if (k === 's') {
    const result = clickServe(world);
    if (result === 'served') playServe();
    else if (result === 'wrong') playError();
  }
  return world;
}

/** Track the hovered control so render can highlight it. */
export function handleHover(world, x, y) {
  world.hover = world.screen === 'play' ? hitAt(x, y, world) : null;
  return world;
}
