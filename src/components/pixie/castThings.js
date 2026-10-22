// Gourav's and someone special's things on the desktop (art in castArt.js),
// like Pixie's bed, ball and plant (things.js). Gourav's desk, with his
// computer, coffee and chair (he sits in it to code, his back to you), is on
// the left; his coffee machine and his bookshelf (he reads a book from it now
// and then) are over on the right; and his cleaning robot sweeps the floor.
// When she comes to see him, she leaves lunch on his desk, and they hug in
// front of it;
// her easel, with Neel her parakeet on it, is on the right, and her park
// bench, by a blossom tree, on the left (she sits there now and then, and
// Gourav comes to sit with her). Call tick(seconds) every frame.

import {
  BENCH,
  BENCH_PALETTE,
  BENCH_TOP,
  BIRD_FEET,
  BIRD_FRAMES,
  BIRD_H,
  BIRD_PALETTE,
  BIRD_W,
  CHAIR,
  CHAIR_AT,
  CODE_COLOURS,
  COFFEE,
  COFFEE_H,
  COFFEE_MUG_AT,
  COFFEE_PALETTE,
  COFFEE_W,
  DESK,
  DESK_H,
  DESK_PALETTE,
  DESK_W,
  DUST,
  DUST_H,
  DUST_PALETTE,
  DUST_W,
  EASEL,
  EASEL_H,
  EASEL_PALETTE,
  EASEL_W,
  EMBRACE_ARMS,
  EMBRACE_H,
  EMBRACE_W,
  HUG_ARMS,
  LUNCH,
  LUNCH_AT,
  MUG,
  MUG_AT,
  MUG_X,
  PAINTINGS,
  PAINT_AT,
  PAINT_PALETTE,
  PARK_H,
  PARK_SEATS,
  PARK_W,
  ROBOT_FRAMES,
  ROBOT_H,
  ROBOT_PALETTE,
  ROBOT_W,
  SHELF,
  SHELF_GAP,
  SHELF_H,
  SHELF_PALETTE,
  SHELF_W,
  SCREEN,
  SEATED_AT,
  SEATED_FRAMES,
  SEATED_W,
  SIP_MUG_AT,
  SPOUT,
  STEAM,
  TREE,
  TREE_H,
  TREE_PALETTE,
  TREE_W,
} from "./castArt";
import { GOURAV_FRAMES, GOURAV_PALETTE, GOURAV_W } from "./gourav";
import { HER_FRAMES, HER_PALETTE, HER_W } from "./her";
import { shut } from "./cast";
import { BIRD_NAME, ROBOT_NAME } from "./castLines";
import useMusicStore from "../../store/music";
import * as synth from "../../music/synth";
import { SCALE } from "./sprites";
import { floorLine } from "./engine";

const EDGE = 14; // px from the sides of the screen
const DESK_LEFT = 40; // px from the left of the screen
const STAND_BACK = 20; // px from the left of the easel to where she stands
const TYPE_EVERY = 0.09; // s per letter he types
const ELBOW_EVERY = 0.16; // s per bob of his elbows as he types
const STEAM_EVERY = 0.5; // s per puff of steam
const DAB_EVERY = 0.22; // s per dab of paint
const HOP_TIME = 0.4; // s
const HOP_HEIGHT = 10; // px
const MOUTH_EVERY = 0.12; // s per mouth open or shut, talking on the bench
const HEARTS_EVERY = 0.9; // s between hearts floating up from a hug

const between = (min, max) => min + Math.random() * (max - min);

// the beat of the song the Music app is playing (whole numbers on the
// beat), or null with no music
const songBeat = () => {
  const { playing, songs, current } = useMusicStore.getState();
  return playing ? (synth.position() * songs[current].bpm) / 60 : null;
};

// a canvas in its own box on the layer, so puffs can float up from it
const makeThing = (layer, w, h, label) => {
  const box = document.createElement("div");
  box.className = "cast-thing";
  const canvas = document.createElement("canvas");
  canvas.width = w * SCALE;
  canvas.height = h * SCALE;
  canvas.style.width = `${w * SCALE}px`;
  canvas.style.height = `${h * SCALE}px`;
  canvas.setAttribute("role", "button");
  canvas.setAttribute("aria-label", label);
  canvas.tabIndex = 0;
  box.append(canvas);
  layer.append(box);
  const ctx = canvas.getContext("2d");
  let placed = "";
  return {
    box,
    canvas,
    ctx,
    place(x, y) {
      const at = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      if (at !== placed) {
        placed = at;
        box.style.transform = at;
      }
    },
    // a click or Enter on it
    onPress(fn) {
      canvas.addEventListener("click", fn);
      canvas.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        fn(e);
      });
    },
    puff(text, kind) {
      const fx = document.createElement("span");
      fx.className = `pixie-fx ${kind}`;
      fx.textContent = text;
      fx.addEventListener("animationend", () => fx.remove());
      box.append(fx);
    },
  };
};

const paint = (ctx, rows, palette, dx = 0, dy = 0) =>
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === ".") return;
      ctx.fillStyle = palette[cell];
      ctx.fillRect((x + dx) * SCALE, (y + dy) * SCALE, SCALE, SCALE);
    }),
  );

// ------------------------------------------------------------ her parakeet

const BIRD_FLIGHT = 3.4; // s for a flight out and back
const BIRD_FLIES_EVERY = [35, 75]; // s between flights
const BIRD_REACH = 170; // px he flies out
const BIRD_HEIGHT = 90; // px he rises
const BIRD_SAYS_FOR = 2.6; // s his words stay up
const FLAP_EVERY = 0.12; // s per flap

// Neel, her parakeet: on his perch (where perch() says, his feet there),
// blinking, now and then off on a flight out over the desktop and back. He
// talks, a word or two at a time, in his own little bubble. While the Music
// app plays he dances on his perch, in time with the song: his head bobs on
// every beat, he turns round every bar, flaps his wings, and notes float up.
const createBird = ({ layer, perch, onTouch }) => {
  const bird = makeThing(layer, BIRD_W, BIRD_H, `${BIRD_NAME}, the parakeet`);
  bird.box.classList.add("cast-bird");
  const words = document.createElement("span");
  words.className = "bird-say";
  words.setAttribute("role", "status");
  bird.box.append(words);

  let flightAt = null;
  let nextFlight = performance.now() / 1000 + between(10, 20);
  let blinkUntil = 0;
  let blinkAt = between(2, 5);
  let hopAt = null;
  let saidUntil = 0;
  let drawn = "";
  let lastBeat = -1;

  const beat = songBeat;

  const draw = (frame, facing) => {
    const { ctx } = bird;
    ctx.clearRect(0, 0, BIRD_W * SCALE, BIRD_H * SCALE);
    ctx.save();
    if (facing < 0) {
      ctx.translate(BIRD_W * SCALE, 0);
      ctx.scale(-1, 1);
    }
    paint(ctx, BIRD_FRAMES[frame].map((row) => row.join("")), BIRD_PALETTE);
    ctx.restore();
  };

  bird.onPress(() => {
    hopAt = performance.now() / 1000;
    onTouch("bird");
  });

  return {
    dancing: () => beat() !== null,
    say(text) {
      words.textContent = text;
      words.classList.add("shown");
      saidUntil = performance.now() / 1000 + BIRD_SAYS_FOR;
    },
    tick(now) {
      const home = perch();
      // out towards the middle of the screen, and back
      const out = home.x < window.innerWidth / 2 ? 1 : -1;
      let x = home.x;
      let y = home.y;
      let frame = now < blinkUntil ? "blink" : "perch";
      let facing = out;

      // dancing: no flying off while the music's on
      const on = beat();
      if (on !== null && flightAt === null) {
        const count = Math.floor(on);
        const down = on - count < 0.5;
        // a flap every fourth beat, a turn every bar
        frame = down ? (count % 4 === 3 ? "bobFlap" : "bob") : "perch";
        facing = Math.floor(count / 4) % 2 ? -out : out;
        y -= down ? 0 : 3;
        if (count !== lastBeat) {
          lastBeat = count;
          if (count % 2 === 0) bird.puff(count % 4 ? "♫" : "♪", "note");
        }
        nextFlight = Math.max(nextFlight, now + 8);
      }
      if (flightAt === null && now >= nextFlight) flightAt = now;
      if (flightAt !== null) {
        const t = (now - flightAt) / BIRD_FLIGHT;
        if (t >= 1) {
          flightAt = null;
          nextFlight = now + between(...BIRD_FLIES_EVERY);
        } else {
          x = home.x + out * BIRD_REACH * Math.sin(Math.PI * t);
          y = home.y - BIRD_HEIGHT * Math.sin(Math.PI * t) * (t < 0.5 ? 1 : 0.6);
          frame = Math.floor(now / FLAP_EVERY) % 2 ? "flapUp" : "flapDown";
          facing = t < 0.5 ? out : -out;
        }
      }
      if (hopAt !== null) {
        const t = (now - hopAt) / HOP_TIME;
        if (t >= 1) hopAt = null;
        else y -= Math.sin(Math.PI * t) * HOP_HEIGHT;
      }
      if (now >= blinkAt) {
        blinkUntil = now + 0.15;
        blinkAt = now + between(2, 5);
      }
      if (saidUntil && now >= saidUntil) {
        saidUntil = 0;
        words.classList.remove("shown");
      }

      const key = `${frame}:${facing}`;
      if (key !== drawn) {
        drawn = key;
        draw(frame, facing);
      }
      bird.place(x - (BIRD_W * SCALE) / 2, y - (BIRD_FEET + 1) * SCALE);
    },
  };
};

// ------------------------------------------------------------ his cleaning robot

const ROBOT_SPEED = 55; // px a second
const SWEEP_TIME = 1.1; // s to sweep up a pile of dust
const DUST_EVERY = [25, 45]; // s between piles of dust
const DUST_MAX = 3;
const PATROL_EVERY = [10, 22]; // s between little drives about, with nothing to sweep
const ROBOT_EDGE = 20; // px it keeps from the sides of the screen

// Robo: drives over to each pile of dust that turns up on the floor and
// sweeps it up (a sparkle when it's clean), and potters about in between.
// Its wheels turn as it goes, its brush spins, its antenna light blinks.
const createRobot = ({ layer, onTouch }) => {
  const robot = makeThing(layer, ROBOT_W, ROBOT_H, `${ROBOT_NAME}, Gourav's cleaning robot`);
  const width = ROBOT_W * SCALE;
  const floorX = (x) => Math.min(window.innerWidth - ROBOT_EDGE - width / 2, Math.max(ROBOT_EDGE + width / 2, x));

  let x = floorX(window.innerWidth * 0.32); // its middle
  let target = x;
  let facing = 1;
  let sweeping = null; // { pile, until }
  let patrolAt = performance.now() / 1000 + between(...PATROL_EVERY);
  let dustAt = performance.now() / 1000 + between(8, 15);
  let blinkUntil = 0;
  let blinkAt = between(2, 5);
  let hopAt = null;
  let drawn = "";
  const piles = []; // { x, el }

  const addDust = () => {
    const el = document.createElement("canvas");
    el.className = "cast-dust";
    el.width = DUST_W * SCALE;
    el.height = DUST_H * SCALE;
    paint(el.getContext("2d"), DUST, DUST_PALETTE);
    layer.append(el);
    piles.push({ x: floorX(between(ROBOT_EDGE + width, window.innerWidth - ROBOT_EDGE - width)), el });
  };

  const draw = (frame) => {
    const { ctx } = robot;
    ctx.clearRect(0, 0, width, ROBOT_H * SCALE);
    ctx.save();
    if (facing < 0) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    paint(ctx, ROBOT_FRAMES[frame].map((row) => row.join("")), ROBOT_PALETTE);
    ctx.restore();
  };

  robot.onPress(() => {
    hopAt = performance.now() / 1000;
    robot.puff("♪", "note");
    onTouch("robot");
  });

  return {
    tick(now, dt) {
      // dust settles, now and then
      if (now >= dustAt) {
        dustAt = now + between(...DUST_EVERY);
        if (piles.length < DUST_MAX) addDust();
      }

      if (sweeping) {
        if (now >= sweeping.until) {
          sweeping.pile.el.remove();
          piles.splice(piles.indexOf(sweeping.pile), 1);
          sweeping = null;
          robot.puff("✨", "sparkle");
        }
      } else if (piles.length) {
        // the nearest pile, and off it goes
        const pile = piles.reduce((best, p) => (Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best));
        target = pile.x;
        if (Math.abs(target - x) < 2) sweeping = { pile, until: now + SWEEP_TIME };
      } else if (now >= patrolAt) {
        patrolAt = now + between(...PATROL_EVERY);
        target = floorX(x + between(-260, 260));
      }

      const moving = Math.abs(target - x) > 1;
      if (moving) {
        const way = Math.sign(target - x);
        x += way * Math.min(ROBOT_SPEED * dt, Math.abs(target - x));
        facing = way;
      }
      if (now >= blinkAt) {
        blinkUntil = now + 0.15;
        blinkAt = now + between(2, 5);
      }
      const wheels = moving && Math.floor(now / 0.12) % 2 ? "b" : "a";
      const brush = moving || sweeping ? Math.floor(now / 0.08) % 2 : 0;
      const state = now < blinkUntil ? "-blink" : Math.floor(now / 0.8) % 2 ? "" : "-off";
      const frame = `${wheels}${brush}${state}`;
      const key = `${frame}:${facing}`;
      if (key !== drawn) {
        drawn = key;
        draw(frame);
      }

      const floor = floorLine();
      let lift = 0;
      if (hopAt !== null) {
        const t = (now - hopAt) / HOP_TIME;
        if (t >= 1) hopAt = null;
        else lift = Math.sin(Math.PI * t) * HOP_HEIGHT;
      }
      // a little shake while it sweeps
      const shake = sweeping ? (Math.floor(now / 0.06) % 2 ? 1 : -1) : 0;
      robot.place(x - width / 2 + shake, floor - ROBOT_H * SCALE - lift);
      piles.forEach((pile) => {
        pile.el.style.transform = `translate(${Math.round(pile.x - (DUST_W * SCALE) / 2)}px, ${Math.round(floor - DUST_H * SCALE)}px)`;
        // it shrinks as it's swept
        if (sweeping?.pile === pile) pile.el.style.opacity = String(Math.max(0.1, (sweeping.until - now) / SWEEP_TIME));
      });
    },
  };
};

// ------------------------------------------------------------ Gourav

const SIPS = 3; // sips in a full mug
const SIP_TIME = 1.4; // s with the mug at his lips
const BREW_TIME = 3; // s for the machine to fill his mug

const createGouravThings = ({ layer, onTouch, onPerson }) => {
  const desk = makeThing(layer, DESK_W, DESK_H, "Gourav's desk, with his computer and coffee");
  const robot = createRobot({ layer, onTouch });
  const machine = makeThing(layer, COFFEE_W, COFFEE_H, "Gourav's coffee machine");
  const shelf = makeThing(layer, SHELF_W, SHELF_H, "Gourav's bookshelf: open his book");
  // the two of them hugging, when she visits: in front of his desk, and only
  // there while they hug
  const embrace = makeThing(layer, EMBRACE_W, EMBRACE_H, "Gourav and her, hugging");
  embrace.box.style.display = "none";
  let bookOut = false; // the book he's reading, off the shelf
  const drawShelf = () => {
    const { ctx } = shelf;
    ctx.clearRect(0, 0, SHELF_W * SCALE, SHELF_H * SCALE);
    paint(ctx, SHELF, SHELF_PALETTE);
    if (!bookOut) return;
    ctx.fillStyle = SHELF_PALETTE.k;
    ctx.fillRect(SHELF_GAP.x * SCALE, SHELF_GAP.y * SCALE, SHELF_GAP.w * SCALE, SHELF_GAP.h * SCALE);
  };
  drawShelf();

  // the code on his screen: a line at a time, as { indent, length, max, colour }
  const code = [];
  const newLine = () => {
    const indent = Math.floor(Math.random() * 5);
    code.push({
      indent,
      length: 0,
      max: Math.max(2, Math.floor(between(4, SCREEN.w - indent))),
      colour: Math.floor(Math.random() * CODE_COLOURS.length),
    });
    if (code.length > SCREEN.h) code.shift();
  };
  for (let i = 0; i < 9; i++) {
    newLine();
    code.at(-1).length = code.at(-1).max;
  }
  newLine();

  let seated = false; // in his chair, typing
  let turned = false; // looking sideways at you, talking
  let visitor = false; // she's come to see him: he stays turned round
  let lunch = false; // the lunch she brought, on his desk
  let hugging = false;
  let heartAt = 0;
  let typedAt = 0;
  let lines = 0; // lines of code typed this visit
  let steam = 0;
  let steamAt = 0;
  let drawn = "";
  let drawnMachine = "";
  let lastTick = null;
  // his mug: on the desk, in his hand, or in the machine; and how full
  const mug = { where: "desk", sips: 1 + Math.floor(Math.random() * SIPS), sipUntil: 0, brewUntil: 0 };
  const sipping = (now) => now < mug.sipUntil;

  const drawDesk = (now, elbows, bob = 0) => {
    const { ctx } = desk;
    ctx.clearRect(0, 0, DESK_W * SCALE, DESK_H * SCALE);
    paint(ctx, DESK, DESK_PALETTE);
    // the code, dimmer while he's away
    ctx.globalAlpha = seated ? 1 : 0.55;
    code.forEach(({ indent, length, colour }, row) => {
      ctx.fillStyle = CODE_COLOURS[colour];
      for (let i = 0; i < length; i++) {
        // a gap now and then, like words
        if ((i + 1) % 4 === 0) continue;
        ctx.fillRect((SCREEN.x + indent + i) * SCALE, (SCREEN.y + row) * SCALE, SCALE, SCALE - 1);
      }
    });
    // the cursor
    const last = code.at(-1);
    if (seated || Math.floor(performance.now() / 500) % 2) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        (SCREEN.x + Math.min(SCREEN.w - 1, last.indent + last.length)) * SCALE,
        (SCREEN.y + code.length - 1) * SCALE,
        SCALE,
        SCALE - 1,
      );
    }
    ctx.globalAlpha = 1;
    // the lunch she brought him
    if (lunch) paint(ctx, LUNCH, DESK_PALETTE, LUNCH_AT.x, LUNCH_AT.y);
    // his mug on the desk, steaming while there's coffee in it
    if (mug.where === "desk" && !sipping(now)) {
      paint(ctx, MUG, DESK_PALETTE, MUG_AT.x, MUG_AT.y);
      if (mug.sips > 0) {
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = "#ffffff";
        STEAM[steam].forEach(([x, y]) => ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE));
        ctx.globalAlpha = 1;
      }
    }
    // him, from behind (or sipping, or looking sideways), and his chair in
    // front of him
    if (seated) {
      if (sipping(now)) {
        paint(ctx, SEATED_FRAMES.sip, GOURAV_PALETTE, SEATED_AT.x, SEATED_AT.y);
        paint(ctx, MUG, DESK_PALETTE, SEATED_AT.x + SIP_MUG_AT.x, SEATED_AT.y + SIP_MUG_AT.y);
      } else paint(ctx, SEATED_FRAMES[`${elbows}${turned ? "Turn" : ""}`], GOURAV_PALETTE, SEATED_AT.x, SEATED_AT.y + bob);
    }
    paint(ctx, CHAIR, DESK_PALETTE, CHAIR_AT.x, CHAIR_AT.y);
  };

  // the coffee machine, with his mug under it filling up
  const drawMachine = (now) => {
    const { ctx } = machine;
    ctx.clearRect(0, 0, COFFEE_W * SCALE, COFFEE_H * SCALE);
    paint(ctx, COFFEE, COFFEE_PALETTE);
    if (mug.where !== "machine") return;
    paint(ctx, MUG, COFFEE_PALETTE, COFFEE_MUG_AT.x, COFFEE_MUG_AT.y);
    if (now < mug.brewUntil) {
      // a trickle of coffee from the spout
      ctx.fillStyle = COFFEE_PALETTE.C;
      ctx.fillRect((SPOUT.x + (Math.floor(now / 0.15) % 2)) * SCALE, SPOUT.y * SCALE, SCALE, SCALE);
    }
  };

  // where on the desk a pointer is, in art pixels
  const artAt = (e) => ({ x: e.offsetX / SCALE, y: e.offsetY / SCALE });
  const onHim = (e) => {
    const { x, y } = artAt(e);
    return (
      seated &&
      x >= SEATED_AT.x &&
      x < SEATED_AT.x + SEATED_W &&
      y >= SEATED_AT.y &&
      y < CHAIR_AT.y + CHAIR.length
    );
  };
  // grabbing him in his chair is grabbing him (Companions.jsx); the rest of
  // the desk has its own say
  desk.canvas.addEventListener("pointerdown", (e) => {
    if (onHim(e)) onPerson(e);
  });
  desk.onPress((e) => {
    if (e.type === "click" && onHim(e)) return;
    const { x, y } = artAt(e);
    if (lunch && x < LUNCH_AT.x + LUNCH[0].length && y >= LUNCH_AT.y && y < LUNCH_AT.y + LUNCH.length) onTouch("lunch");
    else onTouch(Number.isFinite(x) && x >= MUG_X && mug.where === "desk" ? "mug" : "desk");
  });
  machine.onPress(() => onTouch("machine"));
  embrace.onPress(() => onTouch("guest"));

  // the hug: drawn as on her bench (her on the left, PARK_SEATS.hug), then
  // mirrored, so she's on his right; eyes shut
  const drawEmbrace = () => {
    const { ctx } = embrace;
    ctx.clearRect(0, 0, EMBRACE_W * SCALE, EMBRACE_H * SCALE);
    ctx.save();
    ctx.translate(EMBRACE_W * SCALE, 0);
    ctx.scale(-1, 1);
    // her feet are a row higher in her picture than his
    paint(ctx, shut(HER_FRAMES.embrace), HER_PALETTE, PARK_SEATS.hug.her.x, 1);
    paint(ctx, shut(GOURAV_FRAMES.embrace), GOURAV_PALETTE, PARK_SEATS.hug.him.x);
    EMBRACE_ARMS.his.forEach(([x, y, text]) => paint(ctx, [text], GOURAV_PALETTE, x, y));
    EMBRACE_ARMS.hers.forEach(([x, y, text]) => paint(ctx, [text], HER_PALETTE, x, y));
    ctx.restore();
  };
  drawEmbrace();
  shelf.onPress(() => {
    shelf.puff("📖", "note");
    onTouch("shelf");
  });

  const deskLeft = () => DESK_LEFT;
  // over on the right of the screen: the bookshelf at the edge, the coffee
  // machine beside it
  const shelfLeft = () => window.innerWidth - EDGE - 30 - SHELF_W * SCALE;
  const machineLeft = () => shelfLeft() - 28 - COFFEE_W * SCALE;
  const spot = () => deskLeft() + (SEATED_AT.x + SEATED_W / 2) * SCALE;
  // the hug's picture, with his middle where he stands up from his chair
  const embraceLeft = () => spot() - (EMBRACE_W - PARK_SEATS.hug.him.x - GOURAV_W / 2) * SCALE;

  return {
    // where he sits to work: his middle, in px from the left
    spot,
    // where she stands when she visits him: at his right, by his desk, where
    // she is in their hug
    visitorSpot: () => embraceLeft() + (EMBRACE_W - PARK_SEATS.hug.her.x - HER_W / 2) * SCALE,
    // she's come to see him (he stays turned round in his chair), or gone
    setVisitor(on) {
      visitor = on;
      turned = seated && on;
    },
    // the lunch she brings: on his desk, and eaten
    putLunch() {
      lunch = true;
      desk.puff("🍱", "note");
    },
    eatLunch() {
      if (!lunch) return;
      lunch = false;
      desk.puff("😋", "note");
    },
    hasLunch: () => lunch,
    // the two of them hugging in front of his desk (their own sprites hidden
    // meanwhile), hearts floating up
    embrace(on) {
      hugging = on;
      embrace.box.style.display = on ? "" : "none";
      heartAt = 0;
    },
    // where he stands at the coffee machine, his mug in reach of the spout
    machineSpot: () => machineLeft() - 24,
    // where he stands to read: in front of his bookshelf, to the left a bit so
    // the gap where his book was still shows
    shelfSpot: () => shelfLeft() + 20,
    // the book he reads, taken off the shelf and put back
    takeBook() {
      bookOut = true;
      drawShelf();
    },
    returnBook() {
      bookOut = false;
      drawShelf();
    },
    setBusy(on) {
      seated = on;
      if (!on) {
        turned = false;
        mug.sipUntil = 0;
      }
    },
    seated: () => seated,
    // he looks round when he talks (or while she's there)
    setTalking(talking) {
      turned = seated && (talking || visitor);
    },
    // for his app: how full his mug is (0 to 1), and lines of code typed
    report: () => ({ coffee: mug.where === "machine" ? 1 : mug.sips / SIPS, lines }),
    // his coffee: how many sips are left, a sip, and fetching more
    sipsLeft: () => mug.sips,
    sip() {
      const now = performance.now() / 1000;
      if (!seated || mug.where !== "desk" || mug.sips <= 0 || sipping(now)) return false;
      mug.sipUntil = now + SIP_TIME;
      mug.sips -= 1;
      return true;
    },
    takeMug() {
      mug.where = "hand";
    },
    brew() {
      mug.where = "machine";
      mug.brewUntil = performance.now() / 1000 + BREW_TIME;
      machine.puff("☕", "note");
    },
    // back on the desk; full if it was filled
    putMug(full) {
      mug.where = "desk";
      if (full) mug.sips = SIPS;
    },
    tick(now) {
      if (seated && !turned && !sipping(now) && now - typedAt >= TYPE_EVERY) {
        typedAt = now;
        const line = code.at(-1);
        if (line.length < line.max) line.length += 1;
        else {
          newLine();
          lines += 1;
        }
      }
      if (now - steamAt >= STEAM_EVERY) {
        steamAt = now;
        steam = (steam + 1) % STEAM.length;
      }
      const elbows = seated && !turned && Math.floor(now / ELBOW_EVERY) % 2 ? "b" : "a";
      // music on: his head bobs on the beat as he works (he doesn't dance)
      const on = seated && !turned ? songBeat() : null;
      const bob = on !== null && on % 1 < 0.35 ? 1 : 0;
      const key = [
        code.length,
        code.at(-1).length,
        steam,
        seated,
        turned,
        elbows,
        mug.where,
        mug.sips,
        sipping(now),
        bob,
        lunch,
        Math.floor(performance.now() / 500) % 2,
      ].join(":");
      if (key !== drawn) {
        drawn = key;
        drawDesk(now, elbows, bob);
      }
      const machineKey = `${mug.where}:${now < mug.brewUntil ? Math.floor(now / 0.15) % 2 : "-"}`;
      if (machineKey !== drawnMachine) {
        drawnMachine = machineKey;
        drawMachine(now);
      }

      const floor = floorLine();
      desk.place(deskLeft(), floor - DESK_H * SCALE);
      shelf.place(shelfLeft(), floor - SHELF_H * SCALE);
      machine.place(machineLeft(), floor - COFFEE_H * SCALE);
      embrace.place(embraceLeft(), floor - EMBRACE_H * SCALE);
      if (hugging && now >= heartAt) {
        heartAt = now + HEARTS_EVERY;
        embrace.puff(Math.random() < 0.7 ? "💕" : "❤️", "note");
      }
      robot.tick(now, lastTick === null ? 0 : Math.min(now - lastTick, 0.05));
      lastTick = now;
    },
  };
};

// ------------------------------------------------------------ someone special

const PICTURES = Object.keys(PAINTINGS);

const createHerThings = ({ layer, onTouch, onPainted, onPerson }) => {
  // her park corner: a blossom tree, and her bench in front of it
  const tree = makeThing(layer, TREE_W, TREE_H, "Her blossom tree");
  paint(tree.ctx, TREE, TREE_PALETTE);
  const park = makeThing(layer, PARK_W, PARK_H, "Her park bench");
  const easel = makeThing(layer, EASEL_W, EASEL_H, "Her easel");
  // Neel, on the top of her canvas
  const bird = createBird({
    layer,
    onTouch,
    perch: () => ({ x: easelLeft() + 16 * SCALE, y: floorLine() - (EASEL_H - 2) * SCALE }),
  });

  // the picture on the easel, filled in a dab at a time
  let picture = 0;
  let dabs = []; // the pixels still to paint, in a shuffled order
  let painted = new Set();
  let painting = false;
  let dabAt = 0;
  const start = (index) => {
    picture = index;
    painted = new Set();
    const spots = [];
    PAINTINGS[PICTURES[picture]].forEach((row, y) =>
      [...row].forEach((cell, x) => {
        // roughly top to bottom, a bit jumbled
        if (cell !== ".") spots.push({ dab: `${x},${y}`, order: y + between(-2, 2) });
      }),
    );
    dabs = spots.sort((a, b) => a.order - b.order).map(({ dab }) => dab);
  };
  start(Math.floor(Math.random() * PICTURES.length));
  // she's already started this one
  dabs.splice(0, Math.floor(dabs.length * 0.4)).forEach((dab) => painted.add(dab));
  let finished = false;
  const done = []; // the pictures she's finished this visit

  let drawnEasel = "";

  const drawEasel = () => {
    const { ctx } = easel;
    ctx.clearRect(0, 0, EASEL_W * SCALE, EASEL_H * SCALE);
    paint(ctx, EASEL, EASEL_PALETTE);
    const rows = PAINTINGS[PICTURES[picture]];
    rows.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === "." || !painted.has(`${x},${y}`)) return;
        ctx.fillStyle = PAINT_PALETTE[cell];
        ctx.fillRect((PAINT_AT.x + x) * SCALE, (PAINT_AT.y + y) * SCALE, SCALE, SCALE);
      }),
    );
  };

  easel.onPress(() => onTouch(finished ? "easelDone" : "easel"));
  tree.onPress(() => {
    tree.puff("🌸", "note");
    onTouch("tree");
  });

  // who's on the bench, drawn in it (their own sprites hidden meanwhile):
  // her, Gourav beside her, and whether they're hugging; whose mouth moves
  const bench = { her: false, him: false, hug: false };
  const talking = { her: false, gourav: false };
  const blinks = { her: { at: between(2, 5), until: 0 }, gourav: { at: between(2, 5), until: 0 } };
  let heartAt = 0;
  let drawnPark = "";
  const seatX = (who) => (bench.hug ? PARK_SEATS.hug[who].x : PARK_SEATS[who].x);
  const drawPark = (frames) => {
    const { ctx } = park;
    ctx.clearRect(0, 0, PARK_W * SCALE, PARK_H * SCALE);
    paint(ctx, BENCH, BENCH_PALETTE, 0, BENCH_TOP);
    // her, then him, then the arms that show round each other in a hug
    if (bench.her) paint(ctx, frames.her, HER_PALETTE, seatX("her"));
    if (bench.him) paint(ctx, frames.him, GOURAV_PALETTE, seatX("him"));
    if (bench.hug) {
      HUG_ARMS.his.forEach(([x, y, text]) => paint(ctx, [text], GOURAV_PALETTE, x, y));
      HUG_ARMS.hers.forEach(([x, y, text]) => paint(ctx, [text], HER_PALETTE, x, y));
    }
  };
  // which picture each of them is, sitting there: hugging (eyes shut),
  // talking, or blinking
  const sitting = (frames, name, who, now) => {
    const pose = bench.hug ? "hug" : "sit";
    const mouth = talking[who] && Math.floor(now / MOUTH_EVERY) % 2;
    const grid = frames[mouth ? `${pose}Talk` : pose];
    return bench.hug || now < blinks[who].until ? { key: `${name}${mouth ? "o" : ""}-`, grid: shut(grid) } : { key: `${name}${mouth ? "o" : ""}`, grid };
  };

  // where on the bench a pointer is, in art pixels: on her (grab her), on
  // him (he says something), or the bench
  const onSitter = (e, who) => {
    const x = e.offsetX / SCALE - seatX(who);
    const y = e.offsetY / SCALE;
    return bench[who] && x >= 5 && x < (who === "her" ? HER_W : GOURAV_W) - 5 && y >= 2 && y < PARK_H;
  };
  park.canvas.addEventListener("pointerdown", (e) => {
    if (onSitter(e, "her")) onPerson?.(e);
  });
  park.onPress((e) => {
    if (e.type === "click" && onSitter(e, "her")) return;
    if (e.type === "click" && onSitter(e, "him")) onTouch("guest");
    else onTouch("bench");
  });

  const easelLeft = () => window.innerWidth - EDGE - 30 - EASEL_W * SCALE;
  const treeLeft = () => EDGE + 6;
  const parkLeft = () => treeLeft() + TREE_W * SCALE - 20;

  return {
    spot: () => easelLeft() - STAND_BACK,
    // where she (or Gourav, "him") sits on the bench: their middle, in px
    benchSpot: (who) => parkLeft() + (PARK_SEATS[who].x + (who === "her" ? HER_W : GOURAV_W) / 2) * SCALE,
    // she (or he) sits down on the bench, or gets up
    sit(who, on) {
      bench[who] = on;
      if (!on) bench.hug = false;
    },
    // side by side on the bench, a hug, with hearts floating up
    hug(on) {
      bench.hug = on && bench.her && bench.him;
      heartAt = 0;
    },
    // whose mouth moves as they talk on the bench ("her" or "gourav")
    mouth(who, on) {
      talking[who] = on;
    },
    hearts: () => park.puff("💕", "note"),
    birdSay: (text) => bird.say(text),
    setBusy(on) {
      painting = on;
      // a finished picture comes off, and a new one starts
      if (on && finished) {
        finished = false;
        start((picture + 1) % PICTURES.length);
      }
    },
    // the picture she's on, and whether it's done
    picture: () => ({ name: PICTURES[picture], finished }),
    // for her app: how far along the picture is (0 to 1), and the ones done
    report: () => ({
      painting: painted.size / (painted.size + dabs.length),
      picture: PICTURES[picture],
      paintings: [...done],
    }),
    tick(now) {
      if (painting && !finished && now - dabAt >= DAB_EVERY) {
        dabAt = now;
        const dab = dabs.shift();
        if (dab) painted.add(dab);
        if (!dabs.length) {
          finished = true;
          done.push(PICTURES[picture]);
          onPainted(PICTURES[picture]);
        }
      }
      const easelKey = `${picture}:${painted.size}`;
      if (easelKey !== drawnEasel) {
        drawnEasel = easelKey;
        drawEasel();
      }

      // the bench, and whoever's on it
      Object.values(blinks).forEach((blink) => {
        if (now < blink.at) return;
        blink.until = now + 0.13;
        blink.at = now + between(2.5, 5.5);
      });
      if (bench.hug && now >= heartAt) {
        heartAt = now + HEARTS_EVERY;
        park.puff(Math.random() < 0.7 ? "💕" : "❤️", "note");
      }
      const her = bench.her ? sitting(HER_FRAMES, "her", "her", now) : null;
      const him = bench.him ? sitting(GOURAV_FRAMES, "him", "gourav", now) : null;
      const parkKey = [her?.key, him?.key, bench.hug].join(":");
      if (parkKey !== drawnPark) {
        drawnPark = parkKey;
        drawPark({ her: her?.grid, him: him?.grid });
      }

      const floor = floorLine();
      tree.place(treeLeft(), floor - TREE_H * SCALE);
      park.place(parkLeft(), floor - PARK_H * SCALE);
      easel.place(easelLeft(), floor - EASEL_H * SCALE);
      bird.tick(now);
    },
  };
};

/**
 * The things of the visitor's companion, on `layer`. onTouch(name) when one
 * is clicked: "desk", "mug", "lunch", "machine", "shelf", "robot" (his),
 * "easel", "easelDone", "bird" (her parakeet), "tree", "bench" or "guest"
 * (the other one, visiting: on her bench, or hugging at his desk);
 * onPainted(picture) when she finishes a painting; onPerson(pointerdown) when
 * Gourav is grabbed in his chair, or she is on her bench.
 */
export const createCastThings = (who, { layer, onTouch, onPainted, onPerson }) => {
  const things =
    who === "gourav"
      ? createGouravThings({ layer, onTouch, onPerson })
      : createHerThings({ layer, onTouch, onPainted, onPerson });
  return {
    ...things,
    setHidden(hidden) {
      layer.classList.toggle("hidden", hidden);
    },
    destroy() {
      layer.replaceChildren();
    },
  };
};
