import { create } from "zustand";
import { SONGS } from "../music/songs";
import * as synth from "../music/synth";

// The Music app (Music.jsx): what's playing, and the controls. The music
// keeps going when its window is closed; the menu bar shows what's on
// (NowPlaying.jsx). The volume, shuffle and repeat are saved in the browser.

const STORAGE_KEY = "music";
const RESTART_AFTER = 3; // s into a song after which "previous" starts it again
const TICK = 250; // ms between position updates

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
})();

let ticker = null;

// a song starting, from one change of the store to the next: playing after a
// pause, another song, or the same one again from the top (repeat, or
// dragged back)
export const songStarted = (state, previous) =>
  state.playing && (!previous.playing || state.current !== previous.current || state.position + 1 < previous.position);
// seconds left of the song that's playing
export const songLeft = (state) => Math.max(1, state.songs[state.current].duration - state.position);

const useMusicStore = create((set, get) => {
  const keep = () => {
    const { volume, shuffle, repeat } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, shuffle, repeat }));
    } catch {
      // storage blocked: the settings last for this visit
    }
  };

  const follow = () => {
    clearInterval(ticker);
    ticker = setInterval(() => set({ position: synth.position() }), TICK);
  };

  // the song after this one, or null at the end of the list without repeat
  const after = (index, byHand) => {
    const { shuffle, repeat } = get();
    if (repeat === "one" && !byHand) return index;
    if (shuffle && SONGS.length > 1) {
      let next = index;
      while (next === index) next = Math.floor(Math.random() * SONGS.length);
      return next;
    }
    if (index + 1 < SONGS.length) return index + 1;
    return repeat === "all" || byHand ? 0 : null;
  };

  const start = (index, from = 0) => {
    const ok = synth.play(SONGS[index], from, () => {
      const next = after(index, false);
      if (next === null) {
        clearInterval(ticker);
        set({ playing: false, position: 0 });
      } else start(next);
    });
    if (!ok) return;
    set({ current: index, playing: true, position: from, started: true });
    follow();
  };

  return {
    songs: SONGS,
    current: 0,
    playing: false,
    started: false, // anything played yet this visit
    position: 0, // s into the current song
    volume: typeof saved.volume === "number" ? saved.volume : 0.7,
    shuffle: Boolean(saved.shuffle),
    repeat: ["all", "one", "off"].includes(saved.repeat) ? saved.repeat : "all",

    play: (index = get().current) => {
      synth.setVolume(get().volume);
      start(index);
    },
    toggle: () => {
      const { playing, current, position } = get();
      if (playing) {
        const at = synth.stop();
        clearInterval(ticker);
        set({ playing: false, position: at });
      } else {
        synth.setVolume(get().volume);
        start(current, position);
      }
    },
    next: () => start(after(get().current, true)),
    previous: () => {
      const { current, position } = get();
      start(position > RESTART_AFTER ? current : (current - 1 + SONGS.length) % SONGS.length);
    },
    seek: (seconds) => {
      const { current, playing } = get();
      const at = Math.max(0, Math.min(SONGS[current].duration - 0.5, seconds));
      if (playing) start(current, at);
      else set({ position: at });
    },
    setVolume: (volume) => {
      set({ volume });
      synth.setVolume(volume);
      keep();
    },
    toggleShuffle: () => {
      set({ shuffle: !get().shuffle });
      keep();
    },
    // all → one → off → all
    cycleRepeat: () => {
      set({ repeat: { all: "one", one: "off", off: "all" }[get().repeat] });
      keep();
    },
  };
});

export default useMusicStore;
