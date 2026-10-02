import { PALETTE, SCALE } from "./sprites";
import {
  BALL,
  BALL_SIZE,
  BED_EMPTY,
  BED_HEIGHT,
  BED_SLEEPING,
  BED_WIDTH,
  PLANT_HEIGHT,
  PLANT_STAGES,
  PLANT_STAGE_NAMES,
  PLANT_WIDTH,
  drawGrid,
} from "./thingsArt";

// Pixie's things on the desktop: her bed in the left corner, her plant in
// the right corner and a ball that rolls about, standing on the same floor
// as her. They are plain canvases moved by her loop, like Pixie herself.
// Her slingshot's little stars fly from here too.

const EDGE = 10; // px from the sides of the screen
const PLANT_KEY = "pixie-plant"; // how much her plant has grown, kept between visits
const WATERINGS_PER_STAGE = 2;
const THIRSTY_AFTER = 4 * 60_000; // ms after watering before the plant wants more
const GRAVITY = 1800; // px per second², for the ball
const SHOT_TIME = 0.75; // seconds a slingshot star is in the air

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
 * @param layer   element the things live in (fixed, covering the screen)
 * @param floor   returns the y (px from the top) of the floor they stand on
 * @param onTouch called with "bed", "ball" or "plant" when the visitor clicks one
 */
export const createThings = ({ layer, floor, onTouch }) => {
  let hidden = false;

  const make = (width, height, name) => {
    const canvas = document.createElement("canvas");
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;
    canvas.className = `pixie-thing ${name}`;
    canvas.setAttribute("aria-hidden", "true");
    canvas.addEventListener("click", (e) => {
      // a click kicks the ball away from the pointer
      if (name === "ball") kick(Math.sign(ball.x + size / 2 - e.clientX) || 1, 0.9);
      onTouch?.(name);
    });
    layer.appendChild(canvas);
    return canvas;
  };
  const place = (canvas, x, y, extra = "") => {
    canvas.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)${extra}`;
  };

  // ------------------------------------------------------------ the bed

  const bedCanvas = make(BED_WIDTH, BED_HEIGHT, "bed");
  const bedCtx = bedCanvas.getContext("2d");
  let occupied = false;
  const drawBed = () => drawGrid(bedCtx, occupied ? BED_SLEEPING : BED_EMPTY, SCALE, PALETTE);

  // ------------------------------------------------------------ the plant

  const plantCanvas = make(PLANT_WIDTH, PLANT_HEIGHT, "plant");
  const plantCtx = plantCanvas.getContext("2d");
  const plant = readPlant();
  const stage = () => Math.min(PLANT_STAGES.length - 1, Math.floor(plant.points / WATERINGS_PER_STAGE));
  const drawPlant = () => drawGrid(plantCtx, PLANT_STAGES[stage()], SCALE, PALETTE);
  const plantLeft = () => window.innerWidth - EDGE - PLANT_WIDTH * SCALE;

  // ------------------------------------------------------------ the ball

  const ballCanvas = make(BALL_SIZE, BALL_SIZE, "ball");
  drawGrid(ballCanvas.getContext("2d"), BALL, SCALE, PALETTE);
  const size = BALL_SIZE * SCALE;
  const ball = { x: window.innerWidth * between(0.3, 0.45), height: 0, vx: 0, vh: 0, spin: 0 };

  const kick = (direction, power = 1) => {
    ball.vx = direction * between(380, 600) * power;
    ball.vh = between(260, 420) * power;
  };
  const rolling = () => Math.abs(ball.vx) > 4 || ball.height > 0;

  // ------------------------------------------------------------ slingshot stars

  const shots = [];

  // a star from (x, y) to a target: { x, y, element? } (y < 0 for the sky)
  const shoot = (from, target, onHit) => {
    const star = document.createElement("span");
    star.className = "pixie-shot";
    star.textContent = "✦";
    star.setAttribute("aria-hidden", "true");
    layer.appendChild(star);
    const distance = Math.hypot(target.x - from.x, target.y - from.y);
    shots.push({ star, from, target, onHit, time: 0, arc: Math.min(160, 40 + distance * 0.25) });
  };

  const bonk = (element) => {
    if (!element) return;
    element.classList.remove("pixie-bonk");
    // restarts the wobble if it was already wobbling
    void element.offsetWidth;
    element.classList.add("pixie-bonk");
    element.addEventListener("animationend", () => element.classList.remove("pixie-bonk"), { once: true });
  };

  const sparkle = (x, y) => {
    const fx = document.createElement("span");
    fx.className = "pixie-fx star";
    fx.textContent = "✦";
    fx.setAttribute("aria-hidden", "true");
    fx.style.left = `${x}px`;
    fx.style.top = `${y}px`;
    fx.addEventListener("animationend", () => fx.remove());
    layer.appendChild(fx);
  };

  // ------------------------------------------------------------ every frame

  const layout = () => {
    const y = floor();
    place(bedCanvas, EDGE, y - BED_HEIGHT * SCALE);
    place(plantCanvas, plantLeft(), y - PLANT_HEIGHT * SCALE);
  };

  const update = (dt) => {
    // the ball bounces, rolls, slows down and bumps off the sides
    if (rolling() || ball.vh) {
      ball.vh -= GRAVITY * dt;
      ball.height += ball.vh * dt;
      if (ball.height <= 0) {
        ball.height = 0;
        ball.vh = ball.vh < -140 ? -ball.vh * 0.45 : 0;
        ball.vx *= Math.exp(-2.4 * dt);
      }
      ball.x += ball.vx * dt;
      const max = window.innerWidth - size;
      if (ball.x < 0 || ball.x > max) {
        ball.x = Math.min(max, Math.max(0, ball.x));
        ball.vx *= -0.7;
      }
      if (Math.abs(ball.vx) < 4 && ball.height === 0) ball.vx = 0;
      ball.spin += ((ball.vx * dt) / (size / 2)) * (180 / Math.PI);
    }
    ball.x = Math.min(window.innerWidth - size, Math.max(0, ball.x));
    place(ballCanvas, ball.x, floor() - size - ball.height, ` rotate(${ball.spin.toFixed(0)}deg)`);

    // stars fly in an arc and land
    for (let i = shots.length - 1; i >= 0; i--) {
      const shot = shots[i];
      shot.time += dt;
      const t = Math.min(1, shot.time / SHOT_TIME);
      const x = shot.from.x + (shot.target.x - shot.from.x) * t;
      const y = shot.from.y + (shot.target.y - shot.from.y) * t - shot.arc * 4 * t * (1 - t);
      shot.star.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(t * 540).toFixed(0)}deg)`;
      if (t < 1) continue;
      shot.star.remove();
      shots.splice(i, 1);
      if (shot.target.y > 0) {
        sparkle(shot.target.x, shot.target.y);
        bonk(shot.target.element);
      }
      shot.onHit?.();
    }
  };

  window.addEventListener("resize", layout);
  drawBed();
  drawPlant();
  layout();
  update(0);

  return {
    // usable right now: switched on and not hidden behind a full-screen window
    available: () => !hidden,

    setHidden(value) {
      hidden = value;
      layer.classList.toggle("hidden", value);
    },

    update,
    shoot,

    bed: {
      // where her head lies, in px from the left of the screen
      headX: () => EDGE + 7 * SCALE,
      tuckIn() {
        occupied = true;
        drawBed();
      },
      empty() {
        occupied = false;
        drawBed();
      },
    },

    plant: {
      left: plantLeft,
      thirsty: () => Date.now() - plant.wateredAt > THIRSTY_AFTER,
      water() {
        const before = stage();
        plant.points += 1;
        plant.wateredAt = Date.now();
        try {
          localStorage.setItem(PLANT_KEY, JSON.stringify(plant));
        } catch {
          // storage blocked: it grows for this visit only
        }
        drawPlant();
        return stage() > before; // it grew
      },
    },

    ball: {
      center: () => ball.x + size / 2,
      top: () => floor() - size - ball.height,
      rolling,
      kick,
    },

    // for her AI mind: where her things are (0 = left edge, 1 = right edge)
    describe() {
      const at = (x) => Math.round((x / window.innerWidth) * 100) / 100;
      return {
        bed: { position: at(EDGE + (BED_WIDTH * SCALE) / 2) },
        plant: {
          position: at(plantLeft() + (PLANT_WIDTH * SCALE) / 2),
          stage: PLANT_STAGE_NAMES[stage()],
          thirsty: Date.now() - plant.wateredAt > THIRSTY_AFTER,
        },
        ball: { position: at(ball.x + size / 2), rolling: rolling() },
      };
    },

    destroy() {
      window.removeEventListener("resize", layout);
      shots.forEach((shot) => shot.star.remove());
      layer.replaceChildren();
    },
  };
};
