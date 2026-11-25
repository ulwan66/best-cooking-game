// Golden Ladle boot: canvas setup, the game loop, and the frozen screenshot
// mode (?shot=cover|chop|assemble|serve) that stages a real mid-shift state
// and draws it once, without advancing the clock.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { newWorld, step } from './world.js';
import { drawWorld } from './render.js';
import { handleClick, handleHover, handleKey } from './input.js';
import { stageShot } from './shots.js';
import { playTick, unlockSound } from './sound.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

function setStatus(s) {
  status.textContent = s;
}

window.addEventListener('error', (e) => {
  setStatus(`ERROR: ${e.message}`);
});

function toCanvas(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width),
    y: (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height),
  };
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
let world = newWorld();

if (shot !== null) {
  // Screenshot mode: stage the scene and draw one frozen frame.
  stageShot(shot, world);
  drawWorld(ctx, world, 1.234);
  setStatus(`shot ${shot} staged`);
} else {
  canvas.addEventListener('pointermove', (e) => {
    const p = toCanvas(e);
    world = handleHover(world, p.x, p.y);
  });
  canvas.addEventListener('pointerdown', (e) => {
    unlockSound();
    const p = toCanvas(e);
    world = handleClick(world, p.x, p.y);
  });
  window.addEventListener('keydown', (e) => {
    world = handleKey(world, e.key);
  });
  let last = performance.now();
  let lastWholeSecond = -1;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const before = Math.ceil(world.timeLeft);
    step(world, dt);
    const after = Math.ceil(world.timeLeft);
    if (world.screen === 'play' && after !== before && after <= 10 && after > 0) playTick();
    if (after !== lastWholeSecond) {
      lastWholeSecond = after;
      if (world.screen === 'play') {
        setStatus(`Golden Ladle: ${after} seconds left, score ${world.score}, ${world.served} dishes served.`);
      } else if (world.screen === 'over') {
        setStatus(`Shift over. Final score ${world.score}, ${world.served} dishes served. Press R to play again.`);
      }
    }
    drawWorld(ctx, world, now / 1000);
    requestAnimationFrame(frame);
  }
  drawWorld(ctx, world, 0);
  setStatus('Golden Ladle: click or press Enter to start the shift.');
  requestAnimationFrame(frame);
}
