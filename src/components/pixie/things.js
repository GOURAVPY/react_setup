import { PALETTE, SCALE } from "./sprites";
import {
  BALL,
  BALL_SIZE,
  BED_EMPTY,
  BED_HEIGHT,
  BED_SLEEPING,
  BED_WIDTH,
  LAMP_FRAMES,
  LAMP_H,
  LAMP_W,
  drawGrid,
} from "./thingsArt";
import { createBeast } from "./beast";

// Pixie's things on the desktop: her bed in the left corner, Chompy (her
// plant beast, beast.js) in the right corner and a ball that rolls about,
// standing on the same floor as her. They are plain canvases moved by her
// loop, like Pixie herself.
// Her slingshot's little stars fly from here too.
//
// The ball is magic, a present from Gourav: by day (light mode) it's a ball,
// and at night (dark mode) it rises, sprouts wings and glows, a lamp that
// flies wherever her engine sends it (ball.flyTo).

const EDGE = 10; // px from the sides of the screen
const GRAVITY = 1800; // px per second², for the ball
const SHOT_TIME = 0.75; // seconds a slingshot star is in the air
const TURN_TIME = 1.2; // seconds for the ball to turn into the lamp, or back
const LAMP_FOLLOW = 2.2; // how quickly the lamp catches up with where it's going
const LAMP_LOW = 70; // px above the floor it flies when it has nowhere to be

const between = (min, max) => min + Math.random() * (max - min);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @param layer   element the things live in (fixed, covering the screen)
 * @param floor   returns the y (px from the top) of the floor they stand on
 * @param onTouch called with "bed", "ball" or "lamp" when the visitor clicks one,
 *                and "plant-pet", "plant-eat", "plant-snap" or "plant-grew"
 *                for what happens with Chompy
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
      // a click kicks the ball away from the pointer, and nudges the lamp
      if (name === "ball" || name === "lamp") kick(Math.sign(center() - e.clientX) || 1, 0.9);
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

  // ------------------------------------------------------------ Chompy

  // made once the floating symbols below exist
  let beast = null;

  // ------------------------------------------------------------ the ball

  const ballCanvas = make(BALL_SIZE, BALL_SIZE, "ball");
  drawGrid(ballCanvas.getContext("2d"), BALL, SCALE, PALETTE);
  const size = BALL_SIZE * SCALE;
  const ball = { x: window.innerWidth * between(0.3, 0.45), height: 0, vx: 0, vh: 0, spin: 0 };

  // the lamp, and the soft light around it
  const lampCanvas = make(LAMP_W, LAMP_H, "lamp");
  const lampCtx = lampCanvas.getContext("2d");
  const lampW = LAMP_W * SCALE;
  const lampH = LAMP_H * SCALE;
  const glow = document.createElement("span");
  glow.className = "pixie-glow";
  glow.setAttribute("aria-hidden", "true");
  layer.prepend(glow);
  // amount: 0 is a ball, 1 a lamp; x, y: the lamp's centre; to: where it's going
  const magic = { night: false, amount: 0, x: 0, y: 0, vx: 0, vy: 0, to: null, time: 0, frame: -1 };
  const isLamp = () => magic.amount >= 0.5;

  const center = () => (magic.amount > 0 ? magic.x : ball.x + size / 2);

  const kick = (direction, power = 1) => {
    // the lamp gets a little push and floats back
    if (magic.amount > 0) {
      magic.vx += direction * 260 * power;
      magic.vy -= 140 * power;
      return;
    }
    ball.vx = direction * between(380, 600) * power;
    ball.vh = between(260, 420) * power;
  };
  const rolling = () => magic.amount === 0 && (Math.abs(ball.vx) > 4 || ball.height > 0);

  // at night it starts its turn from wherever the ball lies
  const liftOff = () => {
    Object.assign(magic, { x: ball.x + size / 2, y: floor() - size / 2 - ball.height, vx: 0, vy: 0 });
  };

  const setNight = (night, instant = false) => {
    magic.night = night;
    if (!instant) return;
    if (night) {
      liftOff();
      magic.y = floor() - LAMP_LOW;
    }
    magic.amount = night ? 1 : 0;
  };

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

  const floating = (text, x, y, className = "") => {
    const fx = document.createElement("span");
    fx.className = `pixie-fx ${className}`;
    fx.textContent = text;
    fx.setAttribute("aria-hidden", "true");
    fx.style.left = `${x}px`;
    fx.style.top = `${y}px`;
    fx.addEventListener("animationend", () => fx.remove());
    layer.appendChild(fx);
  };

  beast = createBeast({
    layer,
    floor,
    edge: EDGE,
    fx: floating,
    onAction: (action) => onTouch?.(`plant-${action}`),
  });

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
    beast.layout();
  };

  // the magic: turning between ball and lamp, and the lamp's flight
  const updateMagic = (dt) => {
    magic.time += dt;
    const goal = magic.night ? 1 : 0;
    if (magic.amount !== goal) {
      if (magic.amount === 0) {
        liftOff();
        sparkle(magic.x, magic.y);
      }
      magic.amount = clamp(magic.amount + (Math.sign(goal - magic.amount) * dt) / TURN_TIME, 0, 1);
      // back on the floor as a ball, right where the lamp came down, with a hop
      if (magic.amount === 0) {
        Object.assign(ball, { x: magic.x - size / 2, height: 0, vx: 0, vh: 160 });
        sparkle(magic.x, floor() - size);
      }
    }
    if (magic.amount === 0) {
      lampCanvas.style.visibility = "hidden";
      ballCanvas.style.visibility = "";
      glow.style.opacity = "0";
      return false;
    }

    // up to where it's sent at night; down to the floor by day
    const target = magic.night
      ? (magic.to ?? { x: magic.x, y: floor() - LAMP_LOW })
      : { x: magic.x, y: floor() - size / 2 };
    const pull = 1 - Math.exp(-LAMP_FOLLOW * dt);
    magic.x += (target.x - magic.x) * pull + magic.vx * dt;
    magic.y += (target.y - magic.y) * pull + magic.vy * dt;
    magic.vx *= Math.exp(-3 * dt);
    magic.vy *= Math.exp(-3 * dt);
    magic.x = clamp(magic.x, lampW / 2, window.innerWidth - lampW / 2);
    magic.y = clamp(magic.y, lampH, floor() - size / 2);

    const bob = Math.sin(magic.time * 3) * 3 * magic.amount;
    const lamp = isLamp();
    lampCanvas.style.visibility = lamp ? "" : "hidden";
    ballCanvas.style.visibility = lamp ? "hidden" : "";
    if (lamp) {
      // its wings flap
      const frame = Math.floor(magic.time / 0.18) % 2;
      if (frame !== magic.frame) {
        magic.frame = frame;
        drawGrid(lampCtx, LAMP_FRAMES[frame], SCALE, PALETTE);
      }
      place(lampCanvas, magic.x - lampW / 2, magic.y - lampH / 2 + bob);
    } else {
      // the ball spins as it rises, or as it comes back down
      place(ballCanvas, magic.x - size / 2, magic.y - size / 2, ` rotate(${(magic.amount * 720).toFixed(0)}deg)`);
    }
    glow.style.opacity = magic.amount.toFixed(2);
    glow.style.transform = `translate(${magic.x.toFixed(1)}px, ${(magic.y + bob).toFixed(1)}px)`;
    return true;
  };

  // the ball bounces, rolls, slows down and bumps off the sides
  const updateBall = (dt) => {
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
  };

  const update = (dt) => {
    // a lamp at night; the ball waits for morning
    if (!updateMagic(dt)) updateBall(dt);
    beast.update(dt);

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
      left: () => beast.left(),
      center: () => beast.center(),
      thirsty: () => beast.thirsty(),
      // Pixie waters him; true when it made him grow
      water: () => beast.water(),
      // shaking hands with Pixie: where his leaf reaches, and the shake itself
      hand: () => beast.hand(),
      shake: (seconds) => beast.shake(seconds),
    },

    // night (dark mode) turns the ball into the lamp; `instant` skips the show
    setNight,

    ball: {
      center,
      top: () => (magic.amount > 0 ? magic.y - lampH / 2 : floor() - size - ball.height),
      rolling,
      kick,
      isLamp,
      // where the lamp should fly to, in px from the top left
      flyTo(x, y) {
        magic.to = { x, y };
      },
    },

    // for her AI mind: where her things are (0 = left edge, 1 = right edge)
    describe() {
      const at = (x) => Math.round((x / window.innerWidth) * 100) / 100;
      return {
        bed: { position: at(EDGE + (BED_WIDTH * SCALE) / 2) },
        plant: { position: at(beast.center()), ...beast.describe() },
        ball: { position: at(center()), rolling: rolling(), magicLampTonight: isLamp() },
      };
    },

    destroy() {
      window.removeEventListener("resize", layout);
      beast.destroy();
      shots.forEach((shot) => shot.star.remove());
      layer.replaceChildren();
    },
  };
};
