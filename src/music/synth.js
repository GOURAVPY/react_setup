// The Music app's sound (Music.jsx, store/music.js): a little chiptune synth
// and sequencer on the Web Audio API. Songs (songs.js) are compiled into
// notes on a grid of sixteenth notes, scheduled a moment ahead of time so
// they play in time even when the page is busy.

const LOOKAHEAD = 0.15; // s of notes scheduled ahead
const TICK = 25; // ms between scheduling passes

let ctx = null;
let master = null;
let analyser = null;
let noise = null;

const audio = () => {
  if (ctx) return ctx;
  const Context = window.AudioContext ?? window.webkitAudioContext;
  if (!Context) return null;
  ctx = new Context();
  master = ctx.createGain();
  master.gain.value = 0.7;
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.7;
  // room at the top, so loud bits don't all max out
  analyser.minDecibels = -85;
  analyser.maxDecibels = -10;
  master.connect(analyser).connect(ctx.destination);
  // a second of white noise, for the drums
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
};

// ------------------------------------------------------------ instruments

// a note: an oscillator through a quick attack and a gentle fade
const tone = (bus, time, { freq, length, wave = "square", volume = 0.1, attack = 0.005, release = 0.08, detune = 0 }) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + attack);
  gain.gain.setValueAtTime(volume, time + Math.max(attack, length - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length + release);
  osc.connect(gain).connect(bus);
  osc.start(time);
  osc.stop(time + length + release + 0.02);
};

const hiss = (bus, time, { length, volume, highpass }) => {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = highpass;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
  source.connect(filter).connect(gain).connect(bus);
  source.start(time, Math.random() * 0.5);
  source.stop(time + length + 0.02);
};

const INSTRUMENTS = {
  lead: (bus, time, e, song) =>
    tone(bus, time, { freq: e.freq, length: e.length, wave: song.lead ?? "square", volume: 0.09 * e.volume }),
  arp: (bus, time, e, song) =>
    tone(bus, time, { freq: e.freq, length: e.length, wave: song.arp ?? "square", volume: 0.035 * e.volume, release: 0.04 }),
  pad: (bus, time, e) => {
    tone(bus, time, { freq: e.freq, length: e.length, wave: "triangle", volume: 0.03 * e.volume, attack: 0.25, release: 0.4 });
    tone(bus, time, { freq: e.freq, length: e.length, wave: "sine", volume: 0.025 * e.volume, attack: 0.3, release: 0.4, detune: 7 });
  },
  bass: (bus, time, e) =>
    tone(bus, time, { freq: e.freq, length: e.length, wave: "triangle", volume: 0.16 * e.volume, release: 0.05 }),
  kick: (bus, time, e) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    gain.gain.setValueAtTime(0.32 * e.volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    osc.connect(gain).connect(bus);
    osc.start(time);
    osc.stop(time + 0.2);
  },
  snare: (bus, time, e) => {
    hiss(bus, time, { length: 0.13, volume: 0.09 * e.volume, highpass: 1500 });
    tone(bus, time, { freq: 190, length: 0.04, wave: "triangle", volume: 0.07 * e.volume, release: 0.04 });
  },
  hat: (bus, time, e) => hiss(bus, time, { length: 0.04, volume: 0.035 * e.volume, highpass: 7000 }),
};

// ------------------------------------------------------------ the player

let playing = null; // { song, bus, start, next, timer, onEnd }

const stopBus = (bus) => {
  const now = ctx.currentTime;
  bus.gain.cancelScheduledValues(now);
  bus.gain.setTargetAtTime(0, now, 0.015);
  setTimeout(() => bus.disconnect(), 300);
};

const schedule = () => {
  const { song, bus, start } = playing;
  const until = ctx.currentTime + LOOKAHEAD;
  while (playing.next < song.events.length) {
    const e = song.events[playing.next];
    const time = start + e.time;
    if (time > until) break;
    if (time >= ctx.currentTime - 0.01) INSTRUMENTS[e.kind](bus, time, e, song);
    playing.next += 1;
  }
  // the end of the song, once the last notes have rung out
  if (playing.next >= song.events.length && ctx.currentTime >= start + song.duration) {
    const { onEnd } = playing;
    stop();
    onEnd?.();
  }
};

/** Plays a compiled song (songs.js) from `from` seconds; onEnd when it's over. */
export const play = (song, from = 0, onEnd) => {
  if (!audio()) return false;
  stop();
  ctx.resume();
  const bus = ctx.createGain();
  bus.connect(master);
  const start = ctx.currentTime + 0.05 - from;
  const next = song.events.findIndex((e) => e.time >= from - 0.001);
  playing = { song, bus, start, next: next < 0 ? song.events.length : next, onEnd, timer: null };
  playing.timer = setInterval(schedule, TICK);
  schedule();
  return true;
};

/** Stops, and says where it got to (seconds). */
export const stop = () => {
  if (!playing) return 0;
  const at = position();
  clearInterval(playing.timer);
  stopBus(playing.bus);
  playing = null;
  return at;
};

export const position = () => (playing && ctx ? Math.max(0, Math.min(playing.song.duration, ctx.currentTime - playing.start)) : 0);

export const setVolume = (volume) => {
  if (!audio()) return;
  master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
};

/**
 * How loud it is across the spectrum, for the visualizer: n values 0 to 1,
 * low notes to high. The bands widen as they go up (as our ears hear them),
 * and the high ones are turned up a little, so every bar has something to do.
 */
export const levels = (n) => {
  if (!analyser) return Array(n).fill(0);
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const top = Math.floor(data.length / 4); // up to about 5 kHz, where the tunes are
  return Array.from({ length: n }, (_, i) => {
    const from = Math.floor(top ** (i / n));
    const to = Math.max(from + 1, Math.floor(top ** ((i + 1) / n)));
    let sum = 0;
    for (let j = from; j < to; j++) sum += data[j];
    const level = sum / (to - from) / 255;
    // a quiet floor left out, so the bars dance rather than sit high; the
    // high notes are quieter, so their floor is lower and they're turned up
    const up = i / n;
    const floor = 0.25 - up * 0.15;
    return Math.min(1, (Math.max(0, level - floor) / (1 - floor)) * (1 + up * 1.6));
  });
};
