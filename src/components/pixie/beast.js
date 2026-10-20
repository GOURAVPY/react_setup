import { PALETTE, SCALE } from "./sprites";
import { BEAST_H, BEAST_W, BODY_X, HAND_AT, HEAD_AT, MOUTH_AT, STAGE_NAMES, beastGrid } from "./beastArt";
import { drawGrid } from "./thingsArt";

// Chompy, Pixie's plant beast, in the right-hand corner of the desktop
// (things.js). Super friendly and happy to be here: he has no eyes, but his
// head leans toward the pointer and bobs. He lives on flies and water only:
// every few minutes a fly comes buzzing in, he watches it, snaps, and sooner
// or later gulps it down, one fly at a time. Pixie waters him, and the two of
// them shake hands (her hand, his leaf) when she comes over (engine.js).
// Click him, or rub the pointer over his head, to pet him. Flies and water
// make him grow.

const PLANT_KEY = "pixie-plant"; // how much he has grown, kept between visits
const POINTS_PER_STAGE = 2; // flies or waterings to grow a stage
const THIRSTY_AFTER = 4 * 60_000; // ms after watering before he wants more
const PET_RUB = 140; // px of rubbing over his head that counts as a pet
const FIRST_FLY = 30; // seconds after he appears before the first fly comes
const FLY_EVERY = 4 * 60; // seconds between one fly arriving and the next
const BUZZ_FOR = [4, 7]; // seconds a new fly buzzes about before he snaps
const RETRY_AFTER = [3, 5]; // seconds after a miss before he snaps again
const CATCH_CHANCES = [0.5, 0.75, 1]; // a snap's chance, try by try: the third always catches
const GULP_TIME = 0.2; // seconds for a caught fly to vanish into his mouth
const HUM_EVERY = [9, 16]; // seconds between happy little notes

const between = (min, max) => min + Math.random() * (max - min);

const readPlant = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(PLANT_KEY) ?? "{}");
    return { points: Number(stored.points) || 0, wateredAt: Number(stored.wateredAt) || 0 };
  } catch {
    return { points: 0, wateredAt: 0 };
  }
};

/**
 * @param layer    where his canvases go (fixed, covering the screen)
 * @param floor    returns the y (px from the top) his pot stands on
 * @param edge     px from the right edge of the screen
 * @param onAction told what happened: "pet", "eat" (a fly), "snap" (missed
 *                 it), "grew"
 * @param fx       makes a floating symbol at (x, y): (text, x, y, className)
 */
export const createBeast = ({ layer, floor, edge, onAction, fx }) => {
  const width = BEAST_W * SCALE;
  const height = BEAST_H * SCALE;
  const canvasLeft = () => window.innerWidth - edge - width;
  const top = () => floor() - height;
  const screen = ({ x, y }) => ({ x: canvasLeft() + x * SCALE, y: top() + y * SCALE });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.className = "pixie-thing plant";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "button");
  canvas.setAttribute(
    "aria-label",
    "Chompy, Pixie's plant beast. He eats flies and drinks water. Click him or rub his head to pet him.",
  );
  layer.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // the fly, on a canvas of its own around his head
  const flyCanvas = document.createElement("canvas");
  flyCanvas.width = 240;
  flyCanvas.height = 200;
  flyCanvas.className = "pixie-flies";
  flyCanvas.setAttribute("aria-hidden", "true");
  layer.appendChild(flyCanvas);
  const flyCtx = flyCanvas.getContext("2d");

  const plant = readPlant();
  const stage = () => Math.min(STAGE_NAMES.length - 1, Math.floor(plant.points / POINTS_PER_STAGE));
  const grow = () => {
    const before = stage();
    plant.points += 1;
    try {
      localStorage.setItem(PLANT_KEY, JSON.stringify(plant));
    } catch {
      // storage blocked: he grows for this visit only
    }
    const grew = stage() > before;
    if (grew) {
      const head = screen(HEAD_AT);
      fx("✨", head.x, head.y - 30, "sparkle");
      onAction?.("grew");
    }
    return grew;
  };

  let time = 0;
  const mood = { kind: null, start: 0, until: 0 }; // shake, gulp, chew, drink, pet, chomp
  const feel = (kind, seconds) => Object.assign(mood, { kind, start: time, until: time + seconds });
  const feeling = (...kinds) => kinds.includes(mood.kind);
  let humAt = between(...HUM_EVERY);
  let pointer = null; // { x, y } on the page
  let drawn = "";

  // the one fly about, or null: { phase, speed, radius, dodge, caught, snapAt, tries }
  let fly = null;
  let nextFly = FIRST_FLY;

  const hearts = () => {
    const head = screen(HEAD_AT);
    fx("♥", head.x - 18, head.y - 24, "heart");
    setTimeout(() => fx("♥", head.x + 14, head.y - 30, "heart"), 220);
  };

  // ------------------------------------------------------------ things to do with him

  // Pixie's come to shake hands: he holds out his leaf and shakes
  const shake = (seconds) => {
    feel("shake", seconds);
    const head = screen(HEAD_AT);
    fx("♪", head.x, head.y - 34, "note");
  };

  const pet = () => {
    if (feeling("pet")) return;
    feel("pet", 2.2);
    hearts();
    onAction?.("pet");
  };

  // ------------------------------------------------------------ the pointer

  let pressed = null;
  let rubbed = 0;
  let lastRub = 0;
  const onHead = (e) => {
    const box = canvas.getBoundingClientRect();
    const x = (e.clientX - box.left) / SCALE - BODY_X;
    const y = (e.clientY - box.top) / SCALE;
    return x >= 3 && x <= 21 && y >= 1 && y <= 16;
  };
  canvas.addEventListener("pointerdown", (e) => {
    pressed = { x: e.clientX, y: e.clientY };
  });
  // a click (not the end of a rub) pets him
  canvas.addEventListener("click", (e) => {
    const moved = pressed ? Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) : 0;
    pressed = null;
    if (moved <= 8) pet();
  });
  canvas.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    pet();
  });
  // and so does rubbing the pointer over his head
  canvas.addEventListener("pointermove", (e) => {
    if (!onHead(e) || feeling("pet")) return;
    if (time - lastRub > 0.6) rubbed = 0;
    lastRub = time;
    rubbed += Math.abs(e.movementX) + Math.abs(e.movementY);
    if (rubbed > PET_RUB) {
      rubbed = 0;
      pet();
    }
  });
  const onPage = (e) => {
    pointer = { x: e.clientX, y: e.clientY };
  };
  window.addEventListener("pointermove", onPage);

  // ------------------------------------------------------------ the fly

  const flyAt = (head) => {
    const a = time * fly.speed + fly.phase;
    return {
      x: head.x + Math.cos(a) * fly.radius + fly.dodge.x,
      y: head.y - 6 + Math.sin(a * 1.3) * fly.radius * 0.55 + fly.dodge.y,
    };
  };

  const updateFly = (dt, head) => {
    // a new fly comes buzzing in from far away, every few minutes
    if (!fly && time >= nextFly) {
      nextFly += FLY_EVERY;
      const side = Math.random() < 0.5 ? -1 : 1;
      fly = {
        phase: between(0, 6.3),
        speed: between(0.9, 1.3),
        radius: between(36, 50),
        dodge: { x: side * 240, y: -140, vx: 0, vy: 0 },
        caught: null,
        snapAt: time + between(...BUZZ_FOR),
        tries: 0,
      };
    }
    if (!fly) return;
    const mouth = screen(MOUTH_AT);

    // caught: once it's in his mouth, gulp, and a happy chew
    if (fly.caught) {
      if (time - fly.caught.at < GULP_TIME) return;
      fly = null;
      feel("chew", 0.8);
      fx("😋", head.x + 22, head.y - 26, "note");
      onAction?.("eat");
      grow();
      return;
    }

    // a dodging fly zips off and drifts back to buzzing round his head
    const { dodge } = fly;
    dodge.x += dodge.vx * dt;
    dodge.y += dodge.vy * dt;
    dodge.vx *= Math.exp(-4 * dt);
    dodge.vy *= Math.exp(-4 * dt);
    dodge.x *= Math.exp(-1.2 * dt);
    dodge.y *= Math.exp(-1.2 * dt);

    // he snaps: it may get away the first time or two, never the third
    if (!mood.kind && time > fly.snapAt) {
      const at = flyAt(head);
      const chance = CATCH_CHANCES[Math.min(fly.tries, CATCH_CHANCES.length - 1)];
      fly.tries += 1;
      if (Math.random() < chance) {
        feel("gulp", GULP_TIME + 0.05);
        fly.caught = { at: time, x: at.x, y: at.y };
      } else {
        feel("chomp", 0.35);
        const away = Math.sign(at.x - mouth.x) || 1;
        Object.assign(dodge, { vx: away * 260, vy: -180 });
        setTimeout(() => fx("💨", at.x, at.y, "puff"), 120);
        fly.snapAt = time + between(...RETRY_AFTER);
        onAction?.("snap");
      }
    }
  };

  const drawFly = (head) => {
    const origin = { x: head.x - flyCanvas.width / 2, y: head.y - flyCanvas.height / 2 };
    flyCanvas.style.transform = `translate(${origin.x.toFixed(0)}px, ${origin.y.toFixed(0)}px)`;
    flyCtx.clearRect(0, 0, flyCanvas.width, flyCanvas.height);
    if (!fly) return;
    let at = flyAt(head);
    // caught: pulled into his mouth
    if (fly.caught) {
      const mouth = screen(MOUTH_AT);
      const p = Math.min(1, (time - fly.caught.at) / GULP_TIME);
      at = { x: fly.caught.x + (mouth.x - fly.caught.x) * p, y: fly.caught.y + (mouth.y - fly.caught.y) * p };
    }
    // on the pixel grid, like everything else
    const x = Math.round((at.x - origin.x) / SCALE) * SCALE;
    const y = Math.round((at.y - origin.y) / SCALE) * SCALE;
    flyCtx.fillStyle = PALETTE.K;
    flyCtx.fillRect(x, y, SCALE * 2, SCALE);
    flyCtx.fillStyle = "rgb(255 255 255 / 0.85)";
    const up = Math.floor(time * 18 + fly.phase) % 2;
    flyCtx.fillRect(x + (up ? 0 : SCALE), y - SCALE, SCALE, SCALE);
  };

  // ------------------------------------------------------------ every frame

  const update = (dt) => {
    time += dt;
    if (mood.kind && time > mood.until) mood.kind = null;
    const head = screen(HEAD_AT);

    updateFly(dt, head);

    // a happy little note when he's content
    if (!mood.kind && !fly && time > humAt) {
      humAt = time + between(...HUM_EVERY);
      fx("♪", head.x + 20, head.y - 30, "note");
    }

    // no eyes: his head leans toward the fly while there is one, otherwise
    // toward the pointer, and his mouth shows his moods
    const since = time - mood.start;
    let mouth = "shut";
    if (feeling("gulp", "drink")) mouth = "open";
    if (feeling("chomp") && since < 0.25) mouth = "open";
    if (feeling("chew")) mouth = Math.floor(since / 0.15) % 2 ? "open" : "shut";
    const watching = fly && !fly.caught ? flyAt(head) : pointer;
    const lean = watching && Math.abs(watching.x - head.x) > 30 ? Math.sign(watching.x - head.x) : 0;
    const shaking = feeling("shake") ? Math.floor(since / 0.15) % 2 : null;
    const bob = Math.floor(time / (feeling("pet") ? 0.25 : 0.6)) % 2;
    const pose = { stage: stage(), lean, mouth, shake: shaking, blush: feeling("pet"), bob };
    const key = JSON.stringify(pose);
    if (key !== drawn) {
      drawn = key;
      drawGrid(ctx, beastGrid(pose), SCALE, PALETTE);
    }

    drawFly(head);
  };

  const layout = () => {
    canvas.style.transform = `translate(${canvasLeft().toFixed(1)}px, ${top().toFixed(1)}px)`;
  };

  return {
    canvas,
    update,
    layout,
    // the left edge of his leaves, and the middle of him, in px from the left
    left: () => canvasLeft() + BODY_X * SCALE,
    center: () => screen(HEAD_AT).x,
    // where his leaf reaches out to when he shakes hands
    hand: () => screen(HAND_AT),
    shake,
    thirsty: () => Date.now() - plant.wateredAt > THIRSTY_AFTER,
    // Pixie waters him: he drinks it up, and it may make him grow
    water() {
      plant.wateredAt = Date.now();
      feel("drink", 1.6);
      return grow();
    },
    describe: () => ({
      name: "Chompy",
      kind: "a friendly plant beast in a pot; he eats flies and drinks water",
      stage: STAGE_NAMES[stage()],
      thirsty: Date.now() - plant.wateredAt > THIRSTY_AFTER,
      flyBuzzingRoundHim: Boolean(fly),
    }),
    destroy() {
      window.removeEventListener("pointermove", onPage);
    },
  };
};
