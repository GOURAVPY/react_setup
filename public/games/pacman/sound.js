// plain <audio> players so the sounds also work when index.html is opened straight from disk
let soundnames = ["beginning", "chomp", "death", "eatfruit", "eatghost", "extrapac", "intermission"];
let sounds = {};
soundnames.forEach((name) => {
  sounds[name] = new Audio("aessta/sounds/pacman_" + name + ".wav");
  sounds[name].volume = 0.5;
});

let soundon = true;
try {
  soundon = localStorage.getItem("pacmansound") !== "off";
} catch (e) {}

// restart: play from the start even if it is already playing
let playsound = (name, restart = true) => {
  let s = sounds[name];
  if (!soundon || (!restart && !s.paused)) return;
  s.currentTime = 0;
  s.play().catch(() => {}); // browsers block audio until the first key press
};

let stopsounds = () => {
  Object.values(sounds).forEach((s) => {
    s.pause();
    s.currentTime = 0;
  });
};

let togglesound = () => {
  soundon = !soundon;
  if (!soundon) stopsounds();
  try {
    localStorage.setItem("pacmansound", soundon ? "on" : "off");
  } catch (e) {}
};

// background siren made with Web Audio, so it needs no sound file
let audioctx = null;
let bgosc = null;
let bggain = null;

let startbackground = () => {
  if (audioctx) return;
  try {
    audioctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    return;
  }
  bgosc = audioctx.createOscillator();
  bgosc.type = "triangle";
  bggain = audioctx.createGain();
  bggain.gain.value = 0;
  bgosc.connect(bggain).connect(audioctx.destination);
  bgosc.start();
};
// audio can only start after the player touches a key, the mouse or the screen
["keydown", "mousedown", "touchstart"].forEach((e) => window.addEventListener(e, startbackground));

// mode: "siren" | "fright" | "retreat" | null, progress: 0..1 through the level
let backgroundsound = (mode, progress) => {
  if (!audioctx) return;
  let t = audioctx.currentTime;
  let freq = 0;
  let vol = 0;
  if (mode === "siren") {
    let rate = 1.6 + progress * 2.4; // the siren speeds up as the dots run out
    freq = 440 + 180 * Math.sin(t * rate * Math.PI * 2);
    vol = 0.05;
  } else if (mode === "fright") {
    freq = 200 + 400 * ((t * 7.5) % 1);
    vol = 0.04;
  } else if (mode === "retreat") {
    freq = 900 + 700 * ((t * 10) % 1);
    vol = 0.03;
  }
  if (!soundon) vol = 0;
  bggain.gain.setTargetAtTime(vol, t, 0.02);
  if (freq) bgosc.frequency.setTargetAtTime(freq, t, 0.01);
};
