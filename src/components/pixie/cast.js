// Gourav (gourav.js) and someone special (her.js), when the visitor picks
// one of them as their companion (Companions.jsx): they walk in, stroll
// about the floor, blink, wave and hop, work at their things (castThings.js),
// can be picked up and dropped, and move their mouths while their bubbles
// fill in.

import { GOURAV_FRAMES, GOURAV_H, GOURAV_PALETTE, GOURAV_W } from "./gourav";
import { HER_FRAMES, HER_H, HER_PALETTE, HER_W } from "./her";
import { SCALE } from "./sprites";
import { floorLine } from "./engine";

const WALK_SPEED = 48; // px a second
const RUSH = 2.6; // times faster when walking in
const HURRY = 2.4; // times faster on the way to a job marked fast (a coffee run)
const STEP_TIME = 0.2; // s per step while walking
const MOUTH_TIME = 0.12; // s per mouth open or shut while talking
const BLINK_TIME = 0.13;
const BLINK_EVERY = [2.5, 5.5]; // s
const STROLL_EVERY = [8, 18]; // s
const REACH = 320; // px they stroll at most in one go
const SIDES = 70; // px they keep from the sides of the screen
const JUMP_TIME = 0.5; // s in the air
const JUMP_HEIGHT = 16; // px
const BUBBLE_HALF = 135; // px: half a wide bubble, kept on screen
const GRAVITY = 2200; // px/s² when dropped
const DANCE_HOP = 12; // px, a hop in a dance
const DANCE_SWAY = 6; // px side to side

// how each of them dances to a song, a beat at a time: (count, phase) →
// { pose, facing, dx, dy, sparkle }. Gourav doesn't dance (music helps him
// focus, Companions.jsx); she has an eight-beat routine: a wave, a clap, the
// other way, a clap, a hop, a twirl, arms wide, and a hop with a sparkle,
// swaying side to side all the while.
const DANCES = {
  her: (count, phase) => {
    const sway = Math.sin(((count + phase) * Math.PI) / 2) * DANCE_SWAY;
    const hop = -Math.sin(Math.PI * phase) * DANCE_HOP;
    switch (count % 8) {
      case 0:
        return { pose: "raise", facing: 1, dx: sway };
      case 1:
        return { pose: "clap", facing: 1, dx: sway };
      case 2:
        return { pose: "raise", facing: -1, dx: sway };
      case 3:
        return { pose: "clap", facing: -1, dx: sway };
      case 4:
        return { pose: "jump", facing: 1, dy: hop };
      case 5:
        // a quick spin: round and round in the beat
        return { pose: "twirl", facing: Math.floor(phase * 4) % 2 ? -1 : 1 };
      case 6:
        return { pose: "out", facing: 1, dx: sway };
      default:
        return { pose: "jump", facing: -1, dy: hop, sparkle: true };
    }
  },
};

export const TYPE_SPEED = 28; // ms per letter as a bubble fills in
const READ_TIME = 2600; // ms a finished line stays up, plus a little per letter
export const lineTime = (text) => text.length * TYPE_SPEED + READ_TIME + text.length * 25;

const between = (min, max) => min + Math.random() * (max - min);

// each of them: their art (it faces right) and where they stand at first;
// their app in the dock (CastPanes.jsx) draws them too
export const PEOPLE = {
  gourav: {
    frames: GOURAV_FRAMES,
    palette: GOURAV_PALETTE,
    w: GOURAV_W,
    h: GOURAV_H,
    home: () => window.innerWidth * 0.45,
  },
  her: {
    frames: HER_FRAMES,
    palette: HER_PALETTE,
    w: HER_W,
    h: HER_H,
    home: () => window.innerWidth * 0.55,
  },
};

export const CAST_SIZE = Object.fromEntries(
  Object.entries(PEOPLE).map(([who, { w, h }]) => [who, { width: w * SCALE, height: h * SCALE }]),
);

// the same frame with the eyes shut: the top row of each eye turns to skin,
// the bottom row to a line
export const shut = (grid) => {
  const eyes = grid.flatMap((row, y) => (row.includes("E") ? [y] : []));
  return grid.map((row, y) => {
    if (y === eyes[0]) return row.map((c) => (c === "E" || c === "W" ? "S" : c));
    if (y === eyes[1]) return row.map((c) => (c === "E" || c === "W" ? "K" : c));
    return row;
  });
};

// the lowest painted row, so their feet stand on the floor
const feet = (grid) => grid.findLastIndex((row) => row.some((c) => c !== "."));

/**
 * The companion on screen: draws onto `canvas` and moves `root` (the element
 * holding the canvas and their bubble). Call tick(seconds) every frame.
 */
/**
 * @param beat  the beat of the song that's playing (whole numbers on the
 *              beat), or null with no music: for dancing in time
 */
export const createPerson = (who, { root, canvas, still, onLand, beat }) => {
  const art = PEOPLE[who];
  const blinks = Object.fromEntries(Object.entries(art.frames).map(([name, grid]) => [name, shut(grid)]));
  const bottom = feet(art.frames.stand) + 1;
  const ctx = canvas.getContext("2d");
  const width = art.w * SCALE;

  const me = {
    x: art.home(), // their middle, px from the left of the screen
    target: art.home(),
    rush: false, // walking in, quickly
    facing: 1,
    pose: null,
    poseUntil: 0,
    talking: false,
    hopAt: null,
    blinkAt: between(...BLINK_EVERY),
    blinkUntil: 0,
    strollAt: between(...STROLL_EVERY),
    last: null,
    lookAt: null, // a screen x they turn to once they stop
    job: null, // { at, pose, seconds, face, onStart, onEnd, until }
    held: false, // picked up by the visitor
    grab: { dx: 0, dy: 0 }, // where on them they were grabbed
    air: 0, // px above the floor
    vy: 0, // px/s, falling
    holding: null, // something in their hand ("mug": the "mug" and "mugStep" poses)
    danceUntil: 0, // s: dancing to the music till then
  };
  let drawn = "";
  let placed = "";
  let shift = 0;

  const clampTo = (x) => Math.min(window.innerWidth - SIDES, Math.max(SIDES, x));
  // where their top is when standing on the floor
  const floorTop = () => floorLine() - bottom * SCALE;

  // a sparkle or a note floating up from them
  const puff = (text, kind) => {
    const fx = document.createElement("span");
    fx.className = `pixie-fx ${kind}`;
    fx.textContent = text;
    fx.addEventListener("animationend", () => fx.remove());
    root.append(fx);
  };

  const endJob = (done) => {
    const job = me.job;
    if (!job) return;
    me.job = null;
    me.strollAt = performance.now() / 1000 + between(...STROLL_EVERY);
    job.onEnd?.(done);
  };

  const draw = (name, blinking) => {
    const grid = (blinking ? blinks : art.frames)[name] ?? art.frames.stand;
    ctx.clearRect(0, 0, width, art.h * SCALE);
    ctx.save();
    if (me.facing < 0) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    grid.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell === ".") return;
        ctx.fillStyle = art.palette[cell];
        ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
      }),
    );
    ctx.restore();
  };

  return {
    tick(now) {
      const dt = me.last === null ? 0 : Math.min(now - me.last, 0.05);
      me.last = now;

      // dropped: down they fall
      if (!me.held && me.air > 0) {
        me.vy += GRAVITY * dt;
        me.air -= me.vy * dt;
        if (me.air <= 0) {
          me.air = 0;
          me.vy = 0;
          me.target = clampTo(me.x);
          onLand?.();
        }
      }
      const aloft = me.held || me.air > 0;
      if (aloft) me.target = me.x;

      // off to work: walk over, then keep at it a while (where it is can
      // change with the size of the screen)
      const job = me.job;
      if (job) {
        me.target = clampTo(job.at());
        if (!job.until && Math.abs(me.target - me.x) <= 1) {
          job.until = now + job.seconds;
          job.onStart?.();
        } else if (job.until && now >= job.until) endJob(true);
      }
      // on the screen, even when it gets smaller
      if (!me.rush && !aloft) me.target = clampTo(me.target);

      // a stroll now and then, unless busy
      if (!still && !me.job && !aloft && now >= me.strollAt) {
        me.strollAt = now + between(...STROLL_EVERY);
        if (!me.talking && !me.pose) {
          let to = me.x + between(-REACH, REACH);
          if (Math.abs(to - me.x) < 25) to = me.x + (to < me.x ? -25 : 25);
          me.target = clampTo(to);
          me.lookAt = null;
        }
      }

      const walking = Math.abs(me.target - me.x) > 1;
      if (walking) {
        const way = Math.sign(me.target - me.x);
        const speed = me.rush ? RUSH : me.job?.fast ? HURRY : 1;
        me.x += way * Math.min(WALK_SPEED * speed * dt, Math.abs(me.target - me.x));
        me.facing = way;
      } else {
        me.rush = false;
        if (me.job?.until) me.facing = me.job.face;
        else if (me.lookAt !== null) {
          const way = Math.sign(me.lookAt - me.x);
          if (way) me.facing = way;
        }
      }

      if (me.pose && now >= me.poseUntil) me.pose = null;
      let y = 0;

      // dancing, while the song plays: their routine (DANCES), on the beat
      const on = now < me.danceUntil && !aloft && !me.job ? (beat?.() ?? null) : null;
      let dance = null;
      let dx = 0;
      if (on !== null && DANCES[who]) {
        const count = Math.floor(on);
        const move = DANCES[who](count, on - count);
        me.target = me.x;
        me.facing = move.facing;
        dance = move.pose;
        dx = move.dx ?? 0;
        y += move.dy ?? 0;
        if (move.sparkle && count !== me.sparkled) {
          me.sparkled = count;
          puff("✨", "sparkle");
        }
      }
      if (me.hopAt !== null) {
        const t = (now - me.hopAt) / JUMP_TIME;
        if (t >= 1) me.hopAt = null;
        else y = -Math.sin(Math.PI * t) * JUMP_HEIGHT;
      }

      if (now >= me.blinkAt) {
        me.blinkUntil = now + BLINK_TIME;
        me.blinkAt = now + between(...BLINK_EVERY);
      }

      let name = me.hopAt !== null || aloft ? "jump" : (dance ?? me.pose ?? (me.job?.until ? me.job.pose : null));
      if (!name) {
        const step = walking && Math.floor(now / STEP_TIME) % 2;
        if (me.holding) name = step ? `${me.holding}Step` : me.holding;
        else name = step ? "step" : "stand";
      }
      if (me.talking && Math.floor(now / MOUTH_TIME) % 2) name = `${name}Talk`;
      const blinking = now < me.blinkUntil;
      const key = `${name}${blinking ? "-" : ""}${me.facing}`;
      if (key !== drawn) {
        drawn = key;
        draw(name, blinking);
      }

      // keep their bubble on the screen near the edges
      const middle = me.x;
      const nextShift = Math.round(
        Math.min(Math.max(middle, BUBBLE_HALF + 8), window.innerWidth - BUBBLE_HALF - 8) - middle,
      );
      if (nextShift !== shift) {
        shift = nextShift;
        root.style.setProperty("--bubble-shift", `${shift}px`);
      }

      const left = Math.round(middle - width / 2 + dx);
      const top = Math.round(floorTop() - me.air + y);
      const at = `translate(${left}px, ${top}px)`;
      if (at !== placed) {
        placed = at;
        root.style.transform = at;
      }
    },

    setTalking(talking) {
      me.talking = talking;
    },

    // out of sight (sat in his chair, drawn with it), bubble and all still there
    setHidden(hidden) {
      canvas.style.visibility = hidden ? "hidden" : "";
      // sat down, their bubble goes up over the desk
      root.classList.toggle("seated", hidden);
    },

    // picked up at a point on the screen, carried, and let go
    pickUp(x, y) {
      endJob(false);
      me.held = true;
      me.pose = null;
      me.hopAt = null;
      me.rush = false;
      me.lookAt = null;
      me.grab = { dx: x - me.x, dy: y - (floorTop() - me.air) };
    },
    carry(x, y) {
      if (!me.held) return;
      const next = x - me.grab.dx;
      if (Math.abs(next - me.x) > 2) me.facing = Math.sign(next - me.x);
      me.x = next;
      me.air = Math.max(0, floorTop() - (y - me.grab.dy));
    },
    drop() {
      me.held = false;
      me.vy = 0;
      me.x = Math.min(window.innerWidth - width / 2, Math.max(width / 2, me.x));
      me.strollAt = performance.now() / 1000 + between(...STROLL_EVERY);
      if (me.air <= 0) onLand?.();
    },
    held: () => me.held,

    // carrying something, or not (null)
    setHolding(thing) {
      me.holding = thing;
    },
    holding: () => me.holding,

    // strikes a pose for a while; "jump" is a little hop instead
    act(pose, seconds) {
      if (pose === "jump") {
        if (!still) me.hopAt = performance.now() / 1000;
        return;
      }
      endJob(false);
      me.target = me.x;
      me.pose = pose;
      me.poseUntil = performance.now() / 1000 + seconds;
    },

    // dances for a while, in time with the music (see beat): stopping
    // whatever they were doing
    dance(seconds) {
      if (!DANCES[who] || me.held || me.air > 0) return false;
      endJob(false);
      me.pose = null;
      me.target = me.x;
      me.danceUntil = performance.now() / 1000 + seconds;
      me.strollAt = me.danceUntil + between(...STROLL_EVERY);
      return true;
    },
    dancing: () => performance.now() / 1000 < me.danceUntil,

    // walks over to a screen x and looks at it
    goTo(x) {
      endJob(false);
      me.target = clampTo(x);
      me.lookAt = x;
      me.strollAt = performance.now() / 1000 + between(...STROLL_EVERY);
    },

    // walks in from the left side of the screen
    enter() {
      endJob(false);
      me.x = -width;
      me.target = art.home();
      me.rush = true;
      me.lookAt = null;
      me.strollAt = performance.now() / 1000 + between(...STROLL_EVERY);
    },

    // goes over and works there: { at() (a screen x), pose, seconds, face,
    // fast (hurry there), onStart, onEnd(done) }
    work(job) {
      endJob(false);
      me.lookAt = null;
      me.job = { ...job, until: 0 };
    },
    stopWork: () => endJob(true),

    // what they're up to, for their app: "held", "fall", "arriving", "work",
    // "walk" or "idle"
    doing() {
      if (me.held) return "held";
      if (me.air > 0) return "fall";
      if (performance.now() / 1000 < me.danceUntil) return "dance";
      if (me.rush) return "arriving";
      if (me.job?.until) return "work";
      if (Math.abs(me.target - me.x) > 1) return "walk";
      return "idle";
    },

    // standing about with nothing to do
    free: () =>
      !me.job &&
      !me.pose &&
      !me.talking &&
      !me.held &&
      me.air <= 0 &&
      performance.now() / 1000 >= me.danceUntil &&
      Math.abs(me.target - me.x) <= 1,
    working: () => Boolean(me.job?.until),
  };
};

/**
 * Plays lines one after another: [{ who, text, pose, kind }], each in the
 * speaker's bubble through show(line). A line of kind "thought" is in a
 * thought bubble, and their mouth stays shut.
 */
export const createScript = ({ show, people }) => {
  let queue = [];
  let timer = null;
  let mouth = null;
  let speaker = null;

  const quiet = () => {
    clearTimeout(mouth);
    people[speaker]?.setTalking(false);
    speaker = null;
  };

  const next = () => {
    quiet();
    const line = queue.shift();
    if (!line) {
      timer = null;
      show(null);
      return;
    }
    const person = people[line.who];
    if (line.kind !== "thought") {
      speaker = line.who;
      person.setTalking(true);
      mouth = setTimeout(quiet, line.text.length * TYPE_SPEED);
    }
    if (line.pose) person.act(line.pose, lineTime(line.text) / 1000);
    show({ ...line, id: Math.random() });
    timer = setTimeout(next, lineTime(line.text));
  };

  return {
    play(lines) {
      clearTimeout(timer);
      queue = [...lines];
      next();
    },
    stop() {
      clearTimeout(timer);
      timer = null;
      queue = [];
      quiet();
      show(null);
    },
    busy: () => timer !== null,
  };
};
