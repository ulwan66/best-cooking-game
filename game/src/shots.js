// Golden Ladle screenshot scenes: each one builds a real, legal game state
// (the same fields real play produces) and hands it to the renderer, so the
// frame is what the game really looks like mid-shift. The shot scenes are
// frozen: main.js renders them without advancing the clock.
import { makeOrder } from './recipes.js';

/** Put the world on the play screen with the shift's clock and score set. */
function basePlay(world, timeLeft, score, coins, combo, served) {
  world.screen = 'play';
  world.timeLeft = timeLeft;
  world.elapsed = 150 - timeLeft;
  world.score = score;
  world.coins = coins;
  world.combo = combo;
  world.bestCombo = combo;
  world.served = served;
  world.hearts = 3;
  return world;
}

function order(id, recipeId, patience, maxPatience) {
  const o = makeOrder(id, recipeId, maxPatience);
  o.patience = patience;
  return o;
}

/**
 * Stage the named scene on a fresh world and return the screen to draw.
 * Scenes: cover (the busy kitchen), chop (knife mid-cut), assemble (a dish
 * half-built on the plate), serve (the bell just rung).
 */
export function stageShot(name, world) {
  if (name === 'chop') {
    basePlay(world, 125, 120, 12, 1, 1);
    world.orders = [order(4, 'salad', 40, 52), order(5, 'burger', 25, 52)];
    world.tray = [
      { kind: 'lettuce', ready: false },
      { kind: 'onion', ready: false },
    ];
    world.stations.chop = { kind: 'tomato', progress: 1.1, duration: 1.6, done: false, overcook: 0 };
    return { screen: 'play' };
  }
  if (name === 'assemble') {
    basePlay(world, 70, 210, 21, 2, 2);
    world.orders = [order(7, 'burger', 20, 52), order(8, 'pasta', 38, 52)];
    world.tray = [{ kind: 'tomato', ready: true }];
    world.plate = [
      { kind: 'bun', key: 'bun' },
      { kind: 'patty', key: 'patty-grilled' },
      { kind: 'lettuce', key: 'lettuce-chopped' },
    ];
    return { screen: 'play' };
  }
  if (name === 'serve') {
    basePlay(world, 58, 485, 41, 4, 4);
    world.orders = [order(9, 'salad', 30, 52), order(10, 'omelette', 44, 52)];
    world.tray = [{ kind: 'cheese', ready: true }];
    world.stations.grill = { kind: 'egg', progress: 3.2, duration: 3.2, done: true, overcook: 0 };
    world.servedFlash = 0.9;
    world.popups = [{ x: 690, y: 470, text: '+145  Sunny Burger', color: '#2e7d32', age: 0.2, life: 1.4 }];
    return { screen: 'play' };
  }
  // Cover: the kitchen at its busiest.
  basePlay(world, 92, 340, 28, 3, 3);
  world.orders = [
    order(1, 'burger', 30, 52),
    order(2, 'salad', 18, 52),
    order(3, 'pasta', 42, 52),
  ];
  world.tray = [
    { kind: 'tomato', ready: false },
    { kind: 'cheese', ready: true },
  ];
  world.plate = [
    { kind: 'bun', key: 'bun' },
    { kind: 'patty', key: 'patty-grilled' },
  ];
  world.stations.chop = { kind: 'lettuce', progress: 0.9, duration: 1.6, done: false, overcook: 0 };
  world.stations.grill = { kind: 'patty', progress: 2.0, duration: 3.2, done: false, overcook: 0 };
  return { screen: 'play' };
}
