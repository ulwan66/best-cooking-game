// Golden Ladle sounds: tiny WebAudio synth, no files. Everything is an
// oscillator or a burst of filtered noise, made fresh on each call.
let ctx = null;
let muted = false;

function audio() {
  if (ctx === null) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Call once from a user gesture so the browser lets sound play. */
export function unlockSound() {
  audio();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function tone(freq, dur, type, gain, when = 0) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, freq, gain) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ac.destination);
  src.start();
}

/** Pick up an ingredient. */
export function playPick() {
  tone(620, 0.08, 'sine', 0.12);
}

/** Knife on the board. */
export function playChop() {
  noiseBurst(0.09, 1800, 0.25);
  tone(180, 0.06, 'triangle', 0.1);
}

/** Something finished cooking. */
export function playDone() {
  tone(880, 0.12, 'sine', 0.14);
  tone(1174, 0.16, 'sine', 0.12, 0.09);
}

/** A dish served: a little chime. */
export function playServe() {
  tone(523, 0.12, 'sine', 0.16);
  tone(659, 0.12, 'sine', 0.16, 0.09);
  tone(784, 0.22, 'sine', 0.18, 0.18);
}

/** Wrong plate, or an order walked out. */
export function playError() {
  tone(160, 0.25, 'sawtooth', 0.1);
  tone(120, 0.3, 'sawtooth', 0.08, 0.12);
}

/** The last ten seconds. */
export function playTick() {
  tone(980, 0.05, 'square', 0.05);
}
