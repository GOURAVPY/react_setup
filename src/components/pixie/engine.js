import { WIDTH, HEIGHT, SCALE, drawFrame } from "./sprites";
import * as LINES from "./lines";

// Pixie's behaviour: where she is, what she is doing and how she reacts.
// It moves her element directly every frame rather than through React, so
// she costs nothing when nothing else on the page changes.

const W = WIDTH * SCALE;
const H = HEIGHT * SCALE;
const FLOOR_GAP = 112; // px from the bottom of the screen: just above the dock
const WALK_SPEED = 45; // px per second, wandering about
const TROT_SPEED = 120; // px per second, when she has somewhere to be
const GRAVITY = 2200; // px per second², when dropped
const SLEEP_AFTER = 45_000; // ms with nobody using the page before she naps
const COMMENT_GAP = 6000; // ms between remarks about what you are doing
const DRAG_START = 6; // px the pointer moves before a press becomes a pick-up
const DOUBLE_CLICK = 240; // ms to wait for a second click before acting on one

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.random() * (max - min);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @param root    element moved around the screen (holds sprite and bubble)
 * @param canvas  where she is drawn
 * @param say     shows a line (or a list of lines, in turn) in her bubble
 * @param chatty  returns whether she may share tips on her own
 */
export const createPixie = ({ root, canvas, say, chatty }) => {
  const ctx = canvas.getContext("2d");
  const floor = () => window.innerHeight - FLOOR_GAP - H;

  const pet = {
    x: -W,
    y: floor(),
    facingLeft: false,
    mode: "idle",
    time: 0,
    length: 2,
    targetX: 0,
    speed: WALK_SPEED,
    onArrive: null,
    vy: 0,
    lift: 0, // hop height
    spin: 0, // twirl
    tilt: 0, // swinging while held
    squash: 1, // landing
    blinkIn: 3,
    talking: false,
    tip: 0,
    lastActive: performance.now(),
    lastSpoke: performance.now(),
    nextChat: between(50_000, 80_000),
    lastComment: 0,
    pointerX: null,
  };

  const setMode = (mode, length = 0) => {
    pet.mode = mode;
    pet.time = 0;
    pet.length = length;
  };

  const speak = (text) => {
    pet.lastSpoke = performance.now();
    say(text);
  };

  const walkTo = (x, onArrive = null, speed = WALK_SPEED) => {
    pet.targetX = clamp(x, 8, window.innerWidth - W - 8);
    pet.onArrive = onArrive;
    pet.speed = speed;
    setMode("walk");
  };

  // little floating symbols: Zzz while asleep, hearts, sparkles
  const puff = (text, className = "") => {
    const span = document.createElement("span");
    span.className = `pixie-fx ${className}`;
    span.textContent = text;
    span.setAttribute("aria-hidden", "true");
    span.addEventListener("animationend", () => span.remove());
    root.appendChild(span);
  };

  const nextTip = () => {
    const tip = LINES.TIPS[pet.tip % LINES.TIPS.length];
    pet.tip += 1;
    return tip;
  };

  // ------------------------------------------------------------ choosing what to do

  const chooseNext = () => {
    const roll = Math.random();
    if (roll < 0.55) walkTo(between(16, window.innerWidth - W - 16));
    else if (roll < 0.75) setMode("sit", between(4, 9));
    else if (roll < 0.85) setMode("wave", 1.4);
    else setMode("idle", between(2, 5));
  };

  const update = (dt, now) => {
    pet.time += dt;
    const sleepy = now - pet.lastActive > SLEEP_AFTER;

    pet.blinkIn -= dt;
    if (pet.blinkIn < -0.15) pet.blinkIn = between(2, 5);

    switch (pet.mode) {
      case "idle":
        // keeps an eye on the pointer when it is near
        if (pet.pointerX !== null && Math.abs(pet.pointerX - (pet.x + W / 2)) < 350) {
          pet.facingLeft = pet.pointerX < pet.x + W / 2;
        }
        if (pet.time > pet.length) (sleepy ? setMode("sit", 3) : chooseNext());
        break;

      case "walk": {
        const gap = pet.targetX - pet.x;
        const step = pet.speed * dt;
        pet.facingLeft = gap < 0;
        if (Math.abs(gap) <= step) {
          pet.x = pet.targetX;
          const arrive = pet.onArrive;
          pet.onArrive = null;
          setMode("idle", between(1.5, 4));
          arrive?.();
        } else {
          pet.x += Math.sign(gap) * step;
        }
        break;
      }

      case "sit":
        if (sleepy) setMode("sleep");
        else if (pet.time > pet.length) setMode("idle", between(1, 3));
        break;

      case "sleep":
        if (pet.time > 1.4) {
          pet.time = 0;
          puff("z", "zzz");
        }
        break;

      case "wave":
        if (pet.time > pet.length) setMode("idle", between(1.5, 3));
        break;

      case "hop":
        pet.lift = Math.sin(Math.PI * Math.min(1, pet.time / 0.45)) * 26;
        if (pet.time > 0.45) {
          pet.lift = 0;
          setMode("idle", between(2, 4));
        }
        break;

      case "twirl":
        pet.spin = Math.min(1, pet.time / 0.7) * 360;
        pet.lift = Math.sin(Math.PI * Math.min(1, pet.time / 0.7)) * 14;
        if (pet.time > 0.7) {
          pet.spin = 0;
          pet.lift = 0;
          setMode("idle", between(2, 4));
        }
        break;

      case "held":
        pet.tilt *= 0.9; // the swing settles while she is held still
        break;

      case "fall":
        pet.vy += GRAVITY * dt;
        pet.y += pet.vy * dt;
        pet.tilt *= 0.9;
        if (pet.y >= floor()) {
          pet.y = floor();
          pet.vy = 0;
          pet.tilt = 0;
          setMode("land", 0.3);
          if (Math.random() < 0.6) speak(pick(LINES.LANDED));
        }
        break;

      case "land":
        pet.squash = 1 - 0.18 * Math.sin(Math.PI * Math.min(1, pet.time / 0.3));
        if (pet.time > 0.3) {
          pet.squash = 1;
          setMode("idle", between(1.5, 3));
        }
        break;

      default:
        break;
    }

    // stays on the floor and on the screen, unless picked up or falling
    if (pet.mode !== "held" && pet.mode !== "fall") pet.y = floor();
    // fully on screen, except while walking in from the side on arrival
    if (pet.mode !== "held") {
      const left = pet.mode === "walk" ? -W : 0;
      pet.x = clamp(pet.x, left, window.innerWidth - W);
    }

    // a tip now and then, when she is not busy and you are around
    const quiet = pet.mode === "idle" || pet.mode === "sit";
    if (chatty() && quiet && !sleepy && now - pet.lastSpoke > pet.nextChat) {
      pet.nextChat = between(50_000, 80_000);
      speak(nextTip());
    }
  };

  // ------------------------------------------------------------ drawing

  const frameName = () => {
    const tick = (seconds) => Math.floor(pet.time / seconds);
    switch (pet.mode) {
      case "held":
        return "held";
      case "hop":
      case "twirl":
        return "happy";
      case "sleep":
        return "sleep";
      case "sit":
        return pet.blinkIn < 0 ? "sleep" : "sit";
      case "walk":
        // quicker steps when she trots
        return ["stepA", "stand", "stepB", "stand"][
          tick(pet.speed > WALK_SPEED ? 0.08 : 0.14) % 4
        ];
      case "wave":
        return tick(0.22) % 2 ? "waveOut" : "waveUp";
      default:
        if (pet.blinkIn < 0) return "blink";
        if (pet.talking) return tick(0.14) % 2 ? "talk" : "stand";
        return "stand";
    }
  };

  let drawn = "";
  let shift = 0;

  const render = () => {
    root.style.transform = `translate(${pet.x.toFixed(1)}px, ${(pet.y - pet.lift).toFixed(1)}px)`;
    canvas.style.transform = `rotate(${(pet.spin + pet.tilt).toFixed(1)}deg) scaleY(${pet.squash.toFixed(3)})`;

    const name = frameName();
    const key = `${name}${pet.facingLeft ? "<" : ">"}`;
    if (key !== drawn) {
      drawn = key;
      drawFrame(ctx, name, pet.facingLeft);
    }

    // keep the speech bubble on the screen near the edges
    const middle = pet.x + W / 2;
    const half = 125;
    const next = Math.round(
      clamp(middle, half + 8, window.innerWidth - half - 8) - middle,
    );
    if (next !== shift) {
      shift = next;
      root.style.setProperty("--bubble-shift", `${shift}px`);
    }
  };

  // ------------------------------------------------------------ the loop

  let frame = null;
  let last = 0;
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt, now);
    render();
    frame = requestAnimationFrame(loop);
  };

  // ------------------------------------------------------------ you and her

  const active = () => {
    pet.lastActive = performance.now();
  };

  const onPagePointer = (e) => {
    active();
    pet.pointerX = e.clientX;
  };

  let press = null;
  let clickTimer = null;

  const onPointerDown = (e) => {
    active();
    canvas.setPointerCapture(e.pointerId);
    press = {
      x: e.clientX,
      y: e.clientY,
      grabX: e.clientX - pet.x,
      grabY: e.clientY - pet.y,
      lastX: e.clientX,
    };
  };

  const onPointerMove = (e) => {
    if (!press) return;
    if (pet.mode !== "held") {
      if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_START) return;
      clearTimeout(clickTimer);
      pet.lift = 0;
      pet.spin = 0;
      setMode("held");
      speak(pick(LINES.PICKED_UP));
    }
    pet.x = e.clientX - press.grabX;
    pet.y = Math.min(e.clientY - press.grabY, floor());
    // she swings the way she is being pulled
    pet.tilt = clamp(pet.tilt + (e.clientX - press.lastX) * 0.8, -30, 30);
    press.lastX = e.clientX;
  };

  const onPointerUp = () => {
    if (!press) return;
    press = null;
    if (pet.mode === "held") {
      pet.vy = 0;
      setMode("fall");
      return;
    }

    // a single click: wait a moment in case it is the start of a double click
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      if (pet.mode === "sleep") {
        setMode("wave", 1.2);
        speak(pick(LINES.WAKE));
        return;
      }
      setMode("hop");
      puff("♥", "heart");
      speak(nextTip());
    }, DOUBLE_CLICK);
  };

  const onDoubleClick = () => {
    clearTimeout(clickTimer);
    active();
    setMode("twirl");
    puff("✨", "sparkle");
    speak(pick(LINES.TWIRL));
  };

  let lastHello = 0;
  const onPointerEnter = () => {
    active();
    const now = performance.now();
    const free = pet.mode === "idle" || pet.mode === "sit" || pet.mode === "walk";
    if (!free || now - lastHello < 20_000 || now - pet.lastSpoke < 5000) return;
    lastHello = now;
    if (pet.pointerX !== null) pet.facingLeft = pet.pointerX < pet.x + W / 2;
    setMode("wave", 1.2);
    speak(pick(LINES.GREETINGS));
  };

  const onKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    active();
    setMode("hop");
    speak(nextTip());
  };

  const listeners = [
    [window, "pointermove", onPagePointer],
    [window, "keydown", active],
    [canvas, "pointerdown", onPointerDown],
    [canvas, "pointermove", onPointerMove],
    [canvas, "pointerup", onPointerUp],
    [canvas, "pointercancel", onPointerUp],
    [canvas, "dblclick", onDoubleClick],
    [canvas, "pointerenter", onPointerEnter],
    [canvas, "keydown", onKeyDown],
  ];

  return {
    start() {
      listeners.forEach(([target, type, fn]) => target.addEventListener(type, fn));
      last = performance.now();
      frame = requestAnimationFrame(loop);
    },

    destroy() {
      cancelAnimationFrame(frame);
      clearTimeout(clickTimer);
      listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn));
    },

    // walks in from the side and introduces herself
    greet(lines) {
      pet.x = -W;
      walkTo(
        window.innerWidth * 0.22,
        () => {
          setMode("wave", 1.6);
          speak(lines);
        },
        TROT_SPEED,
      );
    },

    // just appears somewhere and carries on
    appear() {
      pet.x = between(40, window.innerWidth - W - 40);
      setMode("idle", 2);
    },

    // comes to the middle of the screen when called
    call() {
      active();
      walkTo(
        window.innerWidth / 2 - W / 2,
        () => {
          setMode("wave", 1.6);
          speak(pick(LINES.CALLED));
        },
        TROT_SPEED,
      );
    },

    // a remark about something you did, if she is free and not chatting
    comment(text) {
      const now = performance.now();
      if (!text || pet.mode === "held" || pet.mode === "sleep") return;
      if (now - pet.lastComment < COMMENT_GAP) return;
      pet.lastComment = now;
      speak(text);
    },

    setTalking(talking) {
      pet.talking = talking;
    },
  };
};
