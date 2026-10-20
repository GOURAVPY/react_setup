// The songs in the Music app: little chiptune tunes, written here and played
// by synth.js, so the site needs no music files (and no licences). Each song
// is a chord progression (one chord a bar, four bars a section), a melody for
// its "a" and "b" sections, and how the band plays: the lead's sound, arpeggios
// or soft pads, the bass, and a drum pattern.
//
// A melody bar is eight eighth notes, like "E5 - G5 - C6 - G5 -": a note, "-"
// to hold the one before, "." for a rest. A drum bar is sixteen steps: k kick,
// s snare, h hi-hat, "." nothing.

const NOTES = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };

// "A4" → 440
export const frequency = (note) => {
  const [, name, octave] = note.match(/^([A-G][#b]?)(-?\d)$/);
  const midi = (Number(octave) + 1) * 12 + NOTES[name];
  return 440 * 2 ** ((midi - 69) / 12);
};

// the notes of each chord, from the root up, without octaves
const CHORDS = {
  C: ["C", "E", "G"],
  Cmaj7: ["C", "E", "G", "B"],
  Dm: ["D", "F", "A"],
  Dm7: ["D", "F", "A", "C"],
  D: ["D", "F#", "A"],
  Em: ["E", "G", "B"],
  F: ["F", "A", "C"],
  G: ["G", "B", "D"],
  G7: ["G", "B", "D", "F"],
  Am: ["A", "C", "E"],
  Am7: ["A", "C", "E", "G"],
  Bb: ["Bb", "D", "F"],
  Bm: ["B", "D", "F#"],
};

// a chord's notes stacked from an octave, each one above the last
const voice = (chord, octave) => {
  let at = octave;
  let last = -1;
  return CHORDS[chord].map((name) => {
    if (NOTES[name] <= last) at += 1;
    last = NOTES[name];
    return `${name}${at}`;
  });
};

const STEPS = 16; // sixteenth notes a bar
const BARS = 4; // bars a section

/**
 * Turns a song into timed notes: { ...song, events: [{ time, kind, freq,
 * length, volume }], duration } with times and lengths in seconds.
 */
export const compile = (song) => {
  const step = 60 / song.bpm / 4;
  const events = [];
  const add = (at, kind, note, steps, volume = 1) => {
    // swing: the off-beat eighths come a little late
    const late = song.swing && at % 4 === 2 ? song.swing * step : 0;
    events.push({ time: at * step + late, kind, freq: note ? frequency(note) : 0, length: steps * step, volume });
  };

  let bar = 0;
  song.form.forEach((section) => {
    const ending = section === "outro";
    for (let b = 0; b < BARS; b++, bar++) {
      const base = bar * STEPS;
      const chord = song.chords[b];
      // the end fades out
      const volume = ending ? 1 - b * 0.2 : 1;

      // bass: the root, in eighths, halves or whole bars
      const root = `${CHORDS[chord][0]}2`;
      const every = { eighths: 2, halves: 8, whole: 16 }[song.bass ?? "halves"];
      for (let s = 0; s < STEPS; s += every) add(base + s, "bass", root, every * 0.9, volume);

      // the chord: rippling up and down, or held soft
      if (song.arp) {
        const notes = voice(chord, 4);
        const pattern = [0, 1, 2, notes.length > 3 ? 3 : 1];
        for (let s = 0; s < STEPS; s += 2) add(base + s, "arp", notes[pattern[(s / 2) % 4]], 1.6, volume);
      }
      if (song.pad) voice(chord, 3).forEach((note) => add(base, "pad", note, STEPS * 0.95, volume));

      // the tune, in the "a" and "b" sections
      const tokens = song.melody[section]?.[b]?.split(/\s+/) ?? [];
      tokens.forEach((token, i) => {
        if (token === "." || token === "-") return;
        let hold = 1;
        while (tokens[i + hold] === "-") hold += 1;
        add(base + i * 2, "lead", token, hold * 2 - 0.4, volume);
      });

      // the drums
      const drums = song.drums[ending || section === "intro" ? "intro" : "main"] ?? "";
      [...drums].forEach((hit, s) => {
        const kind = { k: "kick", s: "snare", h: "hat" }[hit];
        if (kind) add(base + s, kind, null, 1, volume);
      });
    }
  });

  events.sort((a, b) => a.time - b.time);
  // a moment for the last notes to ring
  return { ...song, events, duration: bar * STEPS * step + 0.6 };
};

export const SONGS = [
  {
    id: "pixel-sunrise",
    title: "Pixel Sunrise",
    artist: "Gourav",
    cover: "sun",
    bpm: 118,
    lead: "square",
    arp: "square",
    bass: "eighths",
    chords: ["C", "G", "Am", "F"],
    form: ["intro", "a", "b", "a", "b", "a", "outro"],
    melody: {
      a: ["E5 - G5 - C6 - G5 -", "D5 - G5 - B5 - D6 -", "C6 - B5 A5 - - E5 -", "F5 - A5 - G5 F5 E5 D5"],
      b: ["G5 . G5 . A5 G5 E5 .", "D5 . D5 . E5 D5 B4 .", "C5 . E5 . A5 . G5 .", "F5 - E5 - D5 - C5 -"],
    },
    drums: { intro: "k.......k.......", main: "k.h.s.h.k.k.s.h." },
  },
  {
    id: "coffee-and-code",
    title: "Coffee & Code",
    artist: "Gourav",
    cover: "coffee",
    bpm: 80,
    swing: 0.35,
    lead: "triangle",
    pad: true,
    bass: "halves",
    chords: ["Dm7", "G7", "Cmaj7", "Am7"],
    form: ["intro", "a", "b", "a", "b", "outro"],
    melody: {
      a: ["F5 - - A5 C6 - A5 -", "B5 - - G5 F5 - D5 -", "E5 - G5 - B5 - - -", "A5 - G5 - E5 - C5 -"],
      b: ["D5 F5 A5 - C6 - A5 -", "G5 - F5 - D5 - B4 -", "C5 - E5 - G5 - E5 -", "A4 - C5 - E5 - - -"],
    },
    drums: { intro: "k.......k.......", main: "k.h.s.hk..k.s.h." },
  },
  {
    id: "neels-song",
    title: "Neel's Song",
    artist: "Neel & her",
    cover: "bird",
    bpm: 132,
    lead: "sine",
    arp: "triangle",
    bass: "eighths",
    chords: ["F", "C", "Dm", "Bb"],
    form: ["intro", "a", "b", "a", "b", "a", "outro"],
    melody: {
      a: ["A5 C6 A5 . F5 . C6 .", "G5 C6 G5 . E5 . C6 .", "F5 A5 D6 . A5 . F5 .", "D6 - C6 - Bb5 - A5 -"],
      b: ["C6 . C6 . D6 C6 A5 .", "C6 . C6 . D6 C6 G5 .", "A5 . A5 . Bb5 A5 F5 .", "G5 - A5 - Bb5 - C6 -"],
    },
    drums: { intro: "k.......k.......", main: "k.h.s.h.k.h.s.hh" },
  },
  {
    id: "half-a-heart",
    title: "Half a Heart",
    artist: "Gourav",
    cover: "heart",
    bpm: 72,
    lead: "sine",
    pad: true,
    bass: "whole",
    chords: ["Am", "F", "C", "G"],
    form: ["intro", "a", "b", "a", "b", "outro"],
    melody: {
      a: ["E5 - - - C5 - D5 E5", "F5 - - - E5 - C5 -", "G5 - - - E5 - C5 -", "D5 - - - - - - -"],
      b: ["A5 - - - G5 - E5 -", "F5 - A5 - C6 - - -", "E5 - G5 - C6 - B5 -", "B5 - - - D6 - - -"],
    },
    drums: { intro: "k...............", main: "k.......h......." },
  },
  {
    id: "through-the-portal",
    title: "Through the Portal",
    artist: "Pixie",
    cover: "portal",
    bpm: 100,
    lead: "triangle",
    arp: "square",
    bass: "halves",
    chords: ["Em", "C", "D", "Bm"],
    form: ["intro", "a", "b", "a", "b", "outro"],
    melody: {
      a: ["B4 - E5 - G5 - F#5 -", "E5 - - - G5 - E5 -", "F#5 - A5 - D6 - A5 -", "B5 - - - - - F#5 -"],
      b: ["G5 F#5 E5 - B5 - - -", "C6 B5 G5 - E5 - - -", "D6 C#6 A5 - F#5 - - -", "B5 - - - F#5 - D5 -"],
    },
    drums: { intro: "k...............", main: "k...h.k.s...h..." },
  },
].map(compile);
