// Golden Ladle world: the shift's state and its rules. No drawing here, no
// input here, just the kitchen's clockwork: orders arrive, patience drains,
// stations cook, plates fill, and the shift ends.
import {
  BURN_AFTER_SECONDS,
  MAX_HEARTS,
  ORDER_FIRST_IN,
  ORDER_SPAWN_END,
  ORDER_SPAWN_START,
  PATIENCE_END,
  PATIENCE_START,
  PLATE_MAX,
  SHIFT_SECONDS,
  TRAY_MAX,
} from './config.js';
import {
  INGREDIENT_BY_KIND,
  RECIPE_BY_ID,
  findMatchingOrder,
  finishedKey,
  makeOrder,
  plateKeys,
  prepSeconds,
  stationForPrep,
} from './recipes.js';

/** A fresh world: title screen, nothing cooking yet. */
export function newWorld() {
  return {
    screen: 'title',
    timeLeft: SHIFT_SECONDS,
    elapsed: 0,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    tips: 0,
    hearts: MAX_HEARTS,
    tray: [],
    plate: [],
    orders: [],
    stations: {
      chop: { kind: null, progress: 0, duration: 0, done: false, overcook: 0 },
      grill: { kind: null, progress: 0, duration: 0, done: false, overcook: 0 },
      pot: { kind: null, progress: 0, duration: 0, done: false, overcook: 0 },
    },
    popups: [],
    spawnIn: ORDER_FIRST_IN,
    orderSeq: 0,
    servedFlash: 0,
    overReason: '',
    paused: false,
    best: 0,
  };
}

/** Begin the shift: clear the board and deal the first order. */
export function startShift(world) {
  const fresh = newWorld();
  fresh.screen = 'play';
  fresh.best = world.best;
  dealOrder(fresh);
  return fresh;
}

/** How fast orders arrive and how long they wait, ramping with the shift. */
function spawnInterval(world) {
  const t = world.elapsed / SHIFT_SECONDS;
  return ORDER_SPAWN_START + (ORDER_SPAWN_END - ORDER_SPAWN_START) * t;
}

function patienceFor(world) {
  const t = world.elapsed / SHIFT_SECONDS;
  return PATIENCE_START + (PATIENCE_END - PATIENCE_START) * t;
}

function dealOrder(world) {
  const recipe = pickRecipe(world);
  world.orderSeq += 1;
  world.orders.push(makeOrder(world.orderSeq, recipe.id, patienceFor(world)));
  world.spawnIn = spawnInterval(world);
}

/** Pick a recipe, avoiding three of the same dish in a row on the board. */
function pickRecipe(world) {
  const ids = ['burger', 'salad', 'pasta', 'omelette'];
  const onBoard = world.orders.map((o) => o.recipeId);
  const candidates = ids.filter((id) => onBoard.filter((x) => x === id).length < 2);
  const pool = candidates.length > 0 ? candidates : ids;
  return RECIPE_BY_ID[pool[Math.floor(Math.random() * pool.length)]];
}

function addPopup(world, x, y, text, color) {
  world.popups.push({ x, y, text, color, age: 0, life: 1.4 });
}

/** Take an ingredient from its bin into the tray. */
export function pickIngredient(world, kind) {
  if (world.screen !== 'play' || world.paused) return false;
  if (world.tray.length >= TRAY_MAX) return false;
  const ing = INGREDIENT_BY_KIND[kind];
  if (!ing) return false;
  world.tray.push({ kind, ready: ing.prep === 'none' });
  return true;
}

/** The station's work for a tray item: which station, and what it becomes. */
function stationJobFor(item) {
  const prep = INGREDIENT_BY_KIND[item.kind].prep;
  const station = stationForPrep(prep);
  if (station === null) return null;
  return { station, duration: prepSeconds(prep) };
}

/**
 * Click a station: start work on a matching raw tray item, collect a finished
 * one, or clear a burnt one. Returns what happened: 'started', 'collected',
 * 'burnt-cleared' or 'nothing'.
 */
export function clickStation(world, name) {
  if (world.screen !== 'play' || world.paused) return 'nothing';
  const slot = world.stations[name];
  if (slot.kind !== null) {
    if (slot.done) {
      if (world.tray.length >= TRAY_MAX) return 'nothing';
      world.tray.push({ kind: slot.kind, ready: true });
      slot.kind = null;
      slot.progress = 0;
      slot.done = false;
      slot.overcook = 0;
      return 'collected';
    }
    return 'nothing';
  }
  const index = world.tray.findIndex((item) => {
    if (item.ready) return false;
    const job = stationJobFor(item);
    return job !== null && job.station === name;
  });
  if (index < 0) return 'nothing';
  const item = world.tray.splice(index, 1)[0];
  const job = stationJobFor(item);
  slot.kind = item.kind;
  slot.duration = job.duration;
  slot.progress = 0;
  slot.done = false;
  slot.overcook = 0;
  return 'started';
}

/** Move everything in the tray onto the plate. */
export function clickPlate(world) {
  if (world.screen !== 'play' || world.paused) return false;
  if (world.tray.length === 0) return false;
  const room = PLATE_MAX - world.plate.length;
  if (room <= 0) return false;
  const moving = world.tray.splice(0, room);
  for (const item of moving) {
    world.plate.push({ kind: item.kind, key: item.ready ? finishedKey(item.kind) : item.kind });
  }
  return true;
}

/** Take one item off the plate back into the tray. */
export function clickPlateItem(world, index) {
  if (world.screen !== 'play' || world.paused) return false;
  if (world.tray.length >= TRAY_MAX) return false;
  const item = world.plate[index];
  if (!item) return false;
  world.plate.splice(index, 1);
  world.tray.push({ kind: item.kind, ready: true });
  return true;
}

/** Throw one tray item away. */
export function clickTrayItem(world, index) {
  if (world.screen !== 'play' || world.paused) return false;
  if (index < 0 || index >= world.tray.length) return false;
  world.tray.splice(index, 1);
  return true;
}

/** Serve the plate: a match pays, a miss clears the plate and the combo. */
export function clickServe(world) {
  if (world.screen !== 'play' || world.paused) return 'nothing';
  if (world.plate.length === 0) return 'nothing';
  const order = findMatchingOrder(plateKeys(world.plate), world.orders);
  if (order === null) {
    world.plate = [];
    world.combo = 0;
    return 'wrong';
  }
  const recipe = RECIPE_BY_ID[order.recipeId];
  const patienceBonus = Math.round((order.patience / order.maxPatience) * 50);
  const comboBonus = world.combo * 10;
  const earned = recipe.price + patienceBonus + comboBonus;
  world.score += earned;
  world.coins += Math.floor(recipe.price / 10) + world.combo;
  world.tips += patienceBonus;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  world.servedFlash = 0.9;
  addPopup(world, 990, 500, `+${earned}  ${recipe.name}`, '#2e7d32');
  world.orders = world.orders.filter((o) => o.id !== order.id);
  world.plate = [];
  return 'served';
}

/** Advance the shift by dt seconds: clock, orders, stations, popups. */
export function step(world, dt) {
  if (world.screen !== 'play' || world.paused) return;
  world.elapsed += dt;
  world.timeLeft -= dt;
  if (world.servedFlash > 0) world.servedFlash -= dt;

  // Orders arrive on a ramp, up to three on the board.
  world.spawnIn -= dt;
  if (world.spawnIn <= 0 && world.orders.length < 3) dealOrder(world);

  // Patience drains; a lost order costs a heart and the combo.
  for (const order of [...world.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      world.orders = world.orders.filter((o) => o.id !== order.id);
      world.lost += 1;
      world.combo = 0;
      world.hearts -= 1;
      addPopup(world, 160, 140, 'Order walked out!', '#c62f24');
    }
  }

  // Stations cook; a grilled item left too long burns.
  for (const name of ['chop', 'grill', 'pot']) {
    const slot = world.stations[name];
    if (slot.kind === null) continue;
    if (!slot.done) {
      slot.progress += dt;
      if (slot.progress >= slot.duration) {
        slot.done = true;
        slot.progress = slot.duration;
      }
    } else if (name === 'grill') {
      slot.overcook += dt;
      if (slot.overcook >= BURN_AFTER_SECONDS) {
        slot.kind = 'burnt';
        slot.done = false;
        slot.overcook = 0;
        slot.progress = 0;
      }
    }
  }

  // A burnt item on the grill clears itself with a puff.
  for (const name of ['chop', 'grill', 'pot']) {
    const slot = world.stations[name];
    if (slot.kind === 'burnt') {
      addPopup(world, 786, 300, 'Burnt! Tossed.', '#c62f24');
      slot.kind = null;
      slot.progress = 0;
      slot.done = false;
      slot.overcook = 0;
    }
  }

  for (const popup of world.popups) popup.age += dt;
  world.popups = world.popups.filter((p) => p.age < p.life);

  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.screen = 'over';
    world.overReason = 'Shift complete!';
    world.best = Math.max(world.best, world.score);
  } else if (world.hearts <= 0) {
    world.hearts = 0;
    world.screen = 'over';
    world.overReason = 'Too many walk-outs!';
    world.best = Math.max(world.best, world.score);
  }
}
