import { create } from "zustand";

// Mac-style sound effects, synthesized with the Web Audio API, so there are
// no audio files to download (or license). Settings › Sound turns them off
// or down. play() does nothing until the visitor has clicked or pressed a
// key, as browsers only allow sound after that.

const STORAGE_KEY = "sound";

export const SOUND_DEFAULTS = {
  enabled: true,
  volume: 0.6, // 0 to 1
  startup: true, // the chord when the power button is pressed
};

const readStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([key, value]) =>
          key in SOUND_DEFAULTS && typeof value === typeof SOUND_DEFAULTS[key],
      ),
    );
  } catch {
    return {};
  }
};

const useSoundStore = create((set, get) => ({
  ...SOUND_DEFAULTS,
  ...readStored(),

  setSound: (key, value) => {
    set({ [key]: value });
    const { enabled, volume, startup } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, volume, startup }));
    } catch {
      // storage can be blocked; the settings then last for this visit
    }
  },
}));

// ------------------------------------------------------------ the synth

let context = null;
let master = null;

const audio = () => {
  if (!context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    master = context.createGain();
    master.connect(context.destination);
  }
  if (context.state === "suspended") context.resume();
  return context;
};

// one note: rises quickly, then fades away
const tone = ({
  freq,
  to,
  type = "sine",
  start = 0,
  duration = 0.3,
  volume = 0.3,
  attack = 0.01,
  detune = 0,
}) => {
  const t = context.currentTime + start;
  const osc = context.createOscillator();
  osc.type = type;
  osc.detune.value = detune;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + duration);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(gain).connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.05);
};

let noiseBuffer = null;

// a breath of air swept through a filter, for whooshes
const whoosh = ({ from, to, start = 0, duration = 0.35, volume = 0.18 }) => {
  if (!noiseBuffer) {
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = context.currentTime + start;
  const source = context.createBufferSource();
  source.buffer = noiseBuffer;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + duration);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + duration * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  source.connect(filter).connect(gain).connect(master);
  source.start(t);
  source.stop(t + duration + 0.05);
};

const SOUNDS = {
  // a big warm major chord that blooms and slowly fades, like a Mac starting up
  startup: () => {
    [92.5, 185, 233.08, 277.18, 369.99].forEach((freq, i) => {
      const volume = i === 0 ? 0.16 : 0.1;
      tone({ freq, duration: 3.2, volume, attack: 0.04 });
      tone({ freq, type: "triangle", duration: 3, volume: volume * 0.5, attack: 0.04, detune: 6 });
      tone({ freq: freq * 2, duration: 1.6, volume: volume * 0.25, attack: 0.03, detune: -4 });
    });
  },
  // two soft rising notes as the login screen lifts
  unlock: () => {
    tone({ freq: 880, duration: 0.18, volume: 0.12 });
    tone({ freq: 1318.5, start: 0.08, duration: 0.3, volume: 0.12 });
  },
  open: () => whoosh({ from: 350, to: 2600, duration: 0.32 }),
  minimize: () => whoosh({ from: 2600, to: 300, duration: 0.42 }),
  close: () => {
    tone({ freq: 1100, to: 650, duration: 0.06, volume: 0.12 });
    tone({ freq: 2200, duration: 0.025, volume: 0.04, type: "triangle" });
  },
  pop: () => tone({ freq: 520, to: 1250, duration: 0.11, volume: 0.16 }),
  // Pixie starting to talk: a tiny two-note chirp
  chirp: () => {
    tone({ freq: 1500, to: 1900, duration: 0.07, volume: 0.06 });
    tone({ freq: 1900, to: 2300, start: 0.07, duration: 0.08, volume: 0.06 });
  },
  // a low, dull alert for things that went wrong
  error: () => {
    tone({ freq: 196, to: 150, duration: 0.32, volume: 0.22, type: "triangle" });
    tone({ freq: 98, to: 82, duration: 0.36, volume: 0.18 });
  },
};

export const playSound = (name) => {
  const { enabled, volume, startup } = useSoundStore.getState();
  if (!enabled || volume <= 0 || (name === "startup" && !startup)) return;
  if (!audio()) return;

  master.gain.value = volume;
  SOUNDS[name]?.();
};

export default useSoundStore;
