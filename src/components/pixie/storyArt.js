import { FRAMES, PALETTE, WIDTH as PW, HEIGHT as PH } from "./sprites";
import {
  BUG_FRAMES,
  BUG_H,
  BUG_PALETTE,
  BUG_W,
  GOURAV_FRAMES,
  GOURAV_H,
  GOURAV_PALETTE,
  GOURAV_W,
} from "./gourav";

// Pixie's story, played the first time she appears (PortalStory.jsx): lost
// in a jungle at dusk, she is cornered by bugs. Gourav leaps in, squashes
// them, opens a portal to his home and gives her a book about himself, and
// through the portal she goes, onto this desktop. Drawn as pixel art on a
// small stage (320 × 180) that the page scales up, with Pixie from sprites.js
// and Gourav and the bugs from gourav.js, one pixel per art pixel.

export const STAGE_W = 320;
export const STAGE_H = 180;
export const LETTER = 0.035; // seconds per letter as a caption types in

// the scenes, each with its caption, and when each one ends (seconds)
export const SCENES = [
  { until: 4.5, caption: "Once upon a time, a little pixel girl got lost in a giant jungle." },
  { until: 9.5, caption: "Out of the bushes crawled bugs! She fired her slingshot, but there were too many…" },
  { until: 14, caption: "Then a hero leapt in: Gourav! He squashed every bug in sight." },
  { until: 17.5, caption: "Gourav: “Inside, child. This is the door to my home.”" },
  { until: 21, caption: "Gourav: “And read this: it's everything about me.”" },
  { until: 24, caption: "She hugged the book tight and stepped through the portal." },
  { until: 26.5, caption: "Whoooosh!" },
];
export const STORY_LENGTH = SCENES.at(-1).until;

const sceneStart = (index) => (index > 0 ? SCENES[index - 1].until : 0);

// sounds, and when they play
export const CUES = [
  { at: 5.95, sound: "pop" }, // her slingshot
  { at: 6.35, sound: "hit" },
  { at: 10.4, sound: "hit" }, // he lands
  { at: 10.85, sound: "hit" },
  { at: 11.75, sound: "hit" },
  { at: 12.3, sound: "hit" },
  { at: 14.3, sound: "portal" },
  { at: 23, sound: "warp" },
];

const GROUND = 150; // where everyone's feet stand
const PORTAL = { x: 262, y: 118 };
const START_X = 100; // where she stops when she is lost
const WARP_AT = 24; // into the tunnel

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const progress = (t, from, to) => clamp01((t - from) / (to - from));
const ease = (p) => p * p * (3 - 2 * p);
const lerp = (a, b, p) => a + (b - a) * p;

// a seeded random, so the jungle grows the same way every time
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const canvasOf = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// ------------------------------------------------------------ pixel tools

const dot = (ctx, x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
};

// a filled ellipse, one row at a time, so its edge stays crisp
const fillEllipse = (ctx, cx, cy, rx, ry, color) => {
  if (rx < 0.5 || ry < 0.5) return;
  ctx.fillStyle = color;
  for (let y = -Math.floor(ry); y <= ry; y += 1) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    ctx.fillRect(Math.round(cx - half), Math.round(cy + y), half * 2 + 1, 1);
  }
};

// an ellipse outline; with `turn`, only arcs of it, which spin as it changes
const ring = (ctx, cx, cy, rx, ry, color, turn = null) => {
  const steps = Math.max(16, Math.round((rx + ry) * 3));
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    if (turn !== null && Math.sin(a * 3 + turn) < -0.25) continue;
    dot(ctx, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, color);
  }
};

// ordered dithering, for soft colour steps that stay pixel art
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// ------------------------------------------------------------ the jungle

const SKY = [
  [0, "#1b1033"],
  [28, "#2e1650"],
  [52, "#4a1f63"],
  [72, "#7a2c6c"],
  [88, "#b5476b"],
  [100, "#e46f5d"],
  [110, "#f7a35c"],
];

const TREES = [
  { x: 6, top: 60 },
  { x: 44, top: 70 },
  { x: 84, top: 56 },
  { x: 126, top: 72 },
  { x: 168, top: 62 },
  { x: 204, top: 70 },
  { x: 230, top: 58 },
  { x: 298, top: 64 },
];

const VINES = [
  { x: 14, length: 52 },
  { x: 36, length: 30 },
  { x: 62, length: 68 },
  { x: 98, length: 40 },
  { x: 142, length: 58 },
  { x: 170, length: 28 },
  { x: 196, length: 44 },
  { x: 222, length: 62 },
  { x: 286, length: 36 },
  { x: 310, length: 56 },
];

// everything that doesn't move, drawn once
const drawJungle = () => {
  const canvas = canvasOf(STAGE_W, STAGE_H);
  const ctx = canvas.getContext("2d");
  const random = seeded(7);

  // the dusk sky, in dithered bands
  for (let y = 0; y < STAGE_H; y += 1) {
    const band = SKY.findLastIndex(([from]) => from <= y);
    const [from, color] = SKY[band];
    const next = SKY[band + 1];
    const share = next ? (y - from) / (next[0] - from) : 0;
    for (let x = 0; x < STAGE_W; x += 1) {
      ctx.fillStyle = next && BAYER[y % 4][x % 4] / 16 < share ? next[1] : color;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // the setting sun
  fillEllipse(ctx, 196, 104, 20, 20, "#ffc76a");
  fillEllipse(ctx, 196, 104, 13, 13, "#ffe39a");

  // far hills of trees
  for (let x = 0; x < STAGE_W; x += 1) {
    const top = Math.round(96 + 5 * Math.sin(x * 0.06) + 3 * Math.sin(x * 0.17 + 2) + 2 * Math.sin(x * 0.41));
    ctx.fillStyle = "#4b2462";
    ctx.fillRect(x, top, 1, STAGE_H - top);
  }
  for (let x = 0; x < STAGE_W; x += 1) {
    const top = Math.round(110 + 4 * Math.sin(x * 0.09 + 1) + 2 * Math.sin(x * 0.23));
    ctx.fillStyle = "#33204f";
    ctx.fillRect(x, top, 1, STAGE_H - top);
  }

  // big trees: a trunk and a canopy of leafy blobs, lit from the sunset
  TREES.forEach(({ x, top }) => {
    const width = 4 + Math.floor(random() * 4);
    ctx.fillStyle = "#16262a";
    ctx.fillRect(x - width / 2, top, width, GROUND - top);
    ctx.fillStyle = "#1f3434";
    ctx.fillRect(x - width / 2, top, 1, GROUND - top);
    for (let i = 0; i < 4; i += 1) {
      const bx = x + (random() - 0.5) * 30;
      const by = top + (random() - 0.5) * 12;
      const r = 9 + random() * 9;
      fillEllipse(ctx, bx, by, r * 1.2, r * 0.8, "#2f5b47");
      fillEllipse(ctx, bx + 1, by + 2, r * 1.2, r * 0.8, "#22403a");
    }
  });

  // thick bushes along the ground, lit on top
  for (let x = -10; x < STAGE_W + 10; x += 16) {
    const bx = x + random() * 8;
    const by = GROUND - 7 - random() * 4;
    const rx = 11 + random() * 8;
    const ry = 7 + random() * 4;
    fillEllipse(ctx, bx, by - 1, rx, ry, "#2c5a3e");
    fillEllipse(ctx, bx, by, rx, ry, "#1f3d2e");
  }

  // the canopy overhead: the jungle closes in from above
  for (let x = -8; x < STAGE_W + 8; x += 13) {
    const bx = x + random() * 6;
    const by = -2 + random() * 8;
    const rx = 12 + random() * 8;
    const ry = 8 + random() * 6;
    fillEllipse(ctx, bx, by + 1, rx, ry, "#2a4d3c");
    fillEllipse(ctx, bx, by, rx, ry, "#14291f");
  }

  // the ground, with tufts of grass and a lighter path
  ctx.fillStyle = "#1a3324";
  ctx.fillRect(0, GROUND - 4, STAGE_W, STAGE_H);
  fillEllipse(ctx, 160, GROUND + 5, 190, 5, "#24402c");
  for (let x = 0; x < STAGE_W; x += 3) {
    const h = 1 + Math.floor(random() * 3);
    ctx.fillStyle = "#2e5a38";
    ctx.fillRect(x, GROUND - 4 - h, 1, h);
  }

  return canvas;
};

// big dark leaves in the corners, in front of everything
const drawLeaves = () => {
  const canvas = canvasOf(STAGE_W, STAGE_H);
  const ctx = canvas.getContext("2d");
  const leaf = "#0e1b13";
  fillEllipse(ctx, 4, 176, 34, 16, leaf);
  fillEllipse(ctx, 26, 166, 14, 8, leaf);
  fillEllipse(ctx, 40, 174, 10, 6, leaf);
  fillEllipse(ctx, 318, 172, 30, 18, leaf);
  fillEllipse(ctx, 292, 168, 12, 7, leaf);
  fillEllipse(ctx, 300, 4, 34, 14, leaf);
  fillEllipse(ctx, 8, 2, 30, 12, leaf);
  return canvas;
};

const drawVines = (ctx, t) => {
  VINES.forEach(({ x, length }, i) => {
    for (let y = 0; y < length; y += 1) {
      const vx = x + Math.round(Math.sin(y * 0.12 + t * 1.2 + i) * 1.5);
      dot(ctx, vx, y, "#3d6b3f");
      // a two-pixel leaf every few pixels, on alternate sides
      if (y % 5 === 2) {
        const side = y % 10 === 2 ? 1 : -1;
        dot(ctx, vx + side, y, "#5d9a52");
        dot(ctx, vx + side * 2, y - 1, "#5d9a52");
      }
    }
  });
};

const FIREFLIES = (() => {
  const random = seeded(42);
  return Array.from({ length: 22 }, () => ({
    x: 10 + random() * 300,
    y: 40 + random() * 100,
    phase: random() * 6.3,
  }));
})();

// fireflies wander and blink; `gather` (0 to 1) draws them to the portal
const drawFireflies = (ctx, t, gather) => {
  FIREFLIES.forEach(({ x, y, phase }, i) => {
    if (Math.sin(t * 2.6 + phase) < -0.2) return;
    let fx = x + Math.sin(t * 0.7 + i) * 6;
    let fy = y + Math.cos(t * 0.9 + phase) * 4;
    if (gather > 0) {
      const a = t * 1.5 + phase;
      fx = lerp(fx, PORTAL.x + Math.cos(a) * 24, gather * 0.7);
      fy = lerp(fy, PORTAL.y + Math.sin(a) * 34, gather * 0.7);
    }
    // a dim glow around a bright centre
    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => dot(ctx, fx + dx, fy + dy, "#5f7f2a"));
    dot(ctx, fx, fy, "#eaff7a");
  });
};

// ------------------------------------------------------------ the portal

const SWIRL = ["#e8f7ff", "#9be7ff", "#40c4ff", "#8a5cff", "#c9b6ff"];

/**
 * A swirling portal, `size` from 0 (closed) to 1 (open), centred on cx, cy,
 * with its light on the ground at floorY. Also drawn on the desktop.
 */
export const drawPortal = (ctx, t, size, cx = PORTAL.x, cy = PORTAL.y, floorY = GROUND + 1) => {
  if (size <= 0.02) return;
  const rx = 15 * size;
  const ry = 27 * size;

  // its light on the ground: a dithered oval
  for (let y = -2; y <= 2; y += 1) {
    const half = Math.round(rx * 1.8 * Math.sqrt(1 - (y / 3) ** 2));
    for (let x = -half; x <= half; x += 1) {
      if ((x + y) % 2 === 0) dot(ctx, cx + x, floorY + y, "#6b4fb8");
    }
  }
  // a soft glow around it
  ["#5a2fd0", "#4a25a8", "#3a1d84"].forEach((color, k) =>
    ring(ctx, cx, cy, rx + 2 + k * 2, ry + 2 + k * 2, color, t * (2 + k) + k),
  );
  // the hole, and the swirl of light around its edge
  fillEllipse(ctx, cx, cy, rx, ry, "#1a0b3a");
  SWIRL.forEach((_, k) => {
    const f = 1 - k * 0.15;
    ring(ctx, cx, cy, rx * f, ry * f, SWIRL[(k + Math.floor(t * 10)) % SWIRL.length], -t * 6 + k);
  });
  // sparkles spiralling in
  for (let i = 0; i < 10; i += 1) {
    const a = t * 2.2 + (i * Math.PI * 2) / 10;
    const r = 1 - ((t * 0.6 + i / 10) % 1);
    dot(ctx, cx + Math.cos(a) * rx * r * 0.85, cy + Math.sin(a) * ry * r * 0.85, "#ffffff");
  }
};

// ------------------------------------------------------------ the cast

// each character's pictures, made once per frame and direction
const CAST = {
  pixie: { frames: FRAMES, palette: PALETTE, w: PW, h: PH },
  gourav: { frames: GOURAV_FRAMES, palette: GOURAV_PALETTE, w: GOURAV_W, h: GOURAV_H },
  bug: { frames: BUG_FRAMES, palette: BUG_PALETTE, w: BUG_W, h: BUG_H },
};

const pictures = new Map();
const picture = (who, name, facingLeft) => {
  const key = `${who}:${name}:${facingLeft}`;
  if (!pictures.has(key)) {
    const { frames, palette, w, h } = CAST[who];
    const canvas = canvasOf(w, h);
    const ctx = canvas.getContext("2d");
    frames[name].forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell === ".") return;
        ctx.fillStyle = palette[cell];
        ctx.fillRect(facingLeft ? w - 1 - x : x, y, 1, 1);
      }),
    );
    pictures.set(key, canvas);
  }
  return pictures.get(key);
};

// a character with its left edge at x and its feet on the ground (or at `y`)
const drawActor = (ctx, who, name, x, facingLeft = false, { y, angle = 0, scale = 1 } = {}) => {
  const image = picture(who, name, facingLeft);
  const top = y ?? GROUND - image.height;
  if (!angle && scale === 1) {
    ctx.drawImage(image, Math.round(x), Math.round(top));
    return;
  }
  ctx.save();
  ctx.translate(Math.round(x + image.width / 2), Math.round(top + image.height / 2));
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
};

const walking = (t, frames = ["stepA", "stand", "stepB", "stand"]) => frames[Math.floor(t / 0.12) % frames.length];

// "?", "!" and a heart over Pixie's head, outlined
const MARKS = {
  "?": [".KKK.", "KWWWK", "KKKWK", ".KWWK", ".KWK.", ".KKK.", ".KWK.", ".KKK."],
  "!": ["KKK", "KWK", "KWK", "KWK", "KKK", "KWK", "KKK"],
  heart: [".KK.KK.", "KDDKDDK", "KDDDDDK", ".KDDDK.", "..KDK..", "...K..."],
};
const MARK_COLORS = { K: PALETTE.K, W: "#ffffff", D: PALETTE.D };

const drawMark = (ctx, mark, x, t) => {
  const rows = MARKS[mark];
  const top = GROUND - PH - rows.length - 3 + Math.round(Math.sin(t * 6));
  const left = Math.round(x + PW / 2 - rows[0].length / 2);
  rows.forEach((row, y) =>
    [...row].forEach((cell, i) => {
      if (cell !== ".") dot(ctx, left + i, top + y, MARK_COLORS[cell]);
    }),
  );
};

// a burst of light where something is hit
const drawPow = (ctx, x, y, age) => {
  if (age < 0 || age > 0.3) return;
  const reach = 3 + age * 30;
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    for (let r = reach - 3; r <= reach; r += 1) {
      dot(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, r === reach ? "#ffffff" : "#ffd166");
    }
  }
};

// a puff of smoke where a bug was
const drawPoof = (ctx, x, y, age) => {
  if (age < 0 || age > 0.45) return;
  const r = 2 + age * 22;
  ring(ctx, x, y, r, r * 0.7, age < 0.25 ? "#e6dcef" : "#9f95b5");
};

// ------------------------------------------------------------ the story

// the bugs: where each crawls in from and to, and what becomes of it
const BUGS = [
  { from: 330, to: 196, start: 4.6, end: 6.2, shot: 6.35 }, // Pixie's slingshot gets this one
  { from: 360, to: 142, start: 5.2, end: 8.2, hit: 11.75 }, // the rest, Gourav's punches
  { from: -16, to: 64, start: 5.8, end: 8.4, hit: 10.85 },
  { from: 400, to: 166, start: 5.6, end: 8.6, hit: 12.3 },
];
const bugX = (bug, t) => lerp(bug.from, bug.to, progress(t, bug.start, bug.end));

const drawBugs = (ctx, t) => {
  BUGS.forEach((bug) => {
    if (t < bug.start) return;
    const facingLeft = bug.from > bug.to;
    const x = bugX(bug, t);
    const top = GROUND - BUG_H;
    // shot down by Pixie: a flash, a puff, gone
    if (bug.shot && t >= bug.shot) {
      drawPow(ctx, x + BUG_W / 2, top + 3, t - bug.shot);
      drawPoof(ctx, x + BUG_W / 2, top + 3, t - bug.shot);
      return;
    }
    // punched by Gourav: it flies off, spinning
    if (bug.hit && t >= bug.hit) {
      const age = t - bug.hit;
      drawPow(ctx, x + BUG_W / 2, top + 3, age);
      drawActor(ctx, "bug", "stepA", x + age * 150, facingLeft, {
        y: top - age * 220 + age * age * 260,
        angle: age * 12,
      });
      return;
    }
    // crawling in, then twitching where it stopped
    const crawling = t < bug.end;
    const name = crawling ? walking(t, ["stepA", "stepB"]) : ["stepA", "stepB"][Math.floor(t / 0.3) % 2];
    drawActor(ctx, "bug", name, x, facingLeft);
  });
};

// Pixie's slingshot shot: a star flying at the first bug
const drawShot = (ctx, t) => {
  if (t < 5.95 || t >= BUGS[0].shot) return;
  const p = progress(t, 5.95, BUGS[0].shot);
  const x = lerp(START_X + PW, bugX(BUGS[0], t), p);
  const y = GROUND - 14 - Math.sin(Math.PI * p) * 6;
  [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ].forEach(([dx, dy]) => dot(ctx, x + dx, y + dy, dx || dy ? "#ffd166" : "#ffffff"));
};

const PIXIE_AT_PORTAL = PORTAL.x - PW / 2;

const drawPixie = (ctx, t) => {
  const draw = (name, x, facingLeft = false, options) => drawActor(ctx, "pixie", name, x, facingLeft, options);
  // lost: she walks in and looks both ways
  if (t < 3) return draw(walking(t), lerp(-PW, START_X, t / 3));
  if (t < 4.6) {
    draw(t % 1.6 > 1.45 ? "blink" : "stand", START_X, Math.floor((t - 3) / 0.45) % 2 === 0);
    return drawMark(ctx, "?", START_X, t);
  }
  // bugs! she aims, fires, and then they close in around her
  if (t < 5) {
    draw("stand", START_X);
    return drawMark(ctx, "!", START_X, t);
  }
  if (t < 5.95) return draw("aim", START_X);
  if (t < 6.4) return draw("release", START_X);
  if (t < 7) return draw("stand", START_X);
  if (t < 12.4) {
    draw("held", START_X, Math.floor(t / 0.5) % 2 === 0);
    return drawMark(ctx, "!", START_X, t);
  }
  // saved!
  if (t < 13.6) return draw("happy", START_X);
  // listening to him, then hugging his book
  if (t < 19) return draw(t % 2.4 > 2.25 ? "blink" : "stand", START_X);
  if (t < 21) {
    draw("carry", START_X);
    if (t < 20.2) drawMark(ctx, "heart", START_X, t);
    return;
  }
  // and into the portal
  if (t < 23) {
    return draw(walking(t, ["carryA", "carry", "carryB", "carry"]), lerp(START_X, PIXIE_AT_PORTAL - 14, (t - 21) / 2));
  }
  const pull = ease(progress(t, 23, 23.6));
  if (pull < 1) {
    draw("held", lerp(PIXIE_AT_PORTAL - 14, PIXIE_AT_PORTAL, pull), false, {
      y: lerp(GROUND - PH, PORTAL.y - PH / 2, pull),
      angle: pull * Math.PI * 4,
      scale: 1 - pull * 0.9,
    });
  }
};

const GOURAV_STOP = 150; // where he stands to talk to her

// his mouth moves while his lines type in
const talking = (t) =>
  SCENES.some(
    ({ caption }, i) => caption.startsWith("Gourav:") && t >= sceneStart(i) && t < sceneStart(i) + caption.length * LETTER,
  );

const leap = (t, from, to, start, length, height) => {
  const p = progress(t, start, start + length);
  return { x: lerp(from, to, p), y: GROUND - GOURAV_H - Math.sin(Math.PI * p) * height };
};

const drawGourav = (ctx, t) => {
  if (t < 9.6) return;
  const talk = talking(t) ? "Talk" : "";
  const draw = (name, x, facingLeft = false, options) => drawActor(ctx, "gourav", name, x, facingLeft, options);
  const step = () => walking(t, ["step", "stand"]);
  // the leap in, over the bushes
  if (t < 10.4) {
    const { x, y } = leap(t, -GOURAV_W, 20, 9.6, 0.8, 40);
    return draw("jump", x, false, { y });
  }
  if (t < 10.5) return draw("stand", 20);
  if (t < 10.7) return draw(step(), lerp(20, 42, (t - 10.5) / 0.2));
  if (t < 10.95) return draw("punch", 42);
  // over her head, to the bugs on the other side
  if (t < 11.55) {
    const { x, y } = leap(t, 42, 120, 10.95, 0.6, 34);
    return draw("jump", x, false, { y });
  }
  if (t < 11.6) return draw("stand", 120);
  if (t < 11.85) return draw("punch", 120);
  if (t < 12.1) return draw(step(), lerp(120, 144, (t - 11.85) / 0.25));
  if (t < 12.4) return draw("punch", 144);
  if (t < 12.8) return draw(step(), lerp(144, GOURAV_STOP, (t - 12.4) / 0.4));
  // turns to her…
  if (t < 14) return draw("stand", GOURAV_STOP, true);
  // …opens the portal with a raise of his hand, and talks to her
  if (t < 15.4) return draw(`raise${talk}`, GOURAV_STOP);
  if (t < 17.6) return draw(`stand${talk}`, GOURAV_STOP, true);
  if (t < 19) return draw(`give${talk}`, GOURAV_STOP, true);
  if (t < 21) return draw(`stand${talk}`, GOURAV_STOP, true);
  // and waves her goodbye
  return draw(Math.floor(t / 0.3) % 2 ? "raise" : "stand", GOURAV_STOP);
};

// the warp: rings and streaks rushing past as she tumbles through
const drawWarp = (ctx, t) => {
  ctx.fillStyle = "#0b0620";
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  const cx = STAGE_W / 2;
  const cy = STAGE_H / 2;
  for (let i = 0; i < 14; i += 1) {
    const r = (t * 70 + i * 15) % 210;
    ring(ctx, cx, cy, r * 1.6, r, SWIRL[i % SWIRL.length], i % 3 === 0 ? null : t * 4 + i);
  }
  const random = seeded(3);
  for (let i = 0; i < 40; i += 1) {
    const a = random() * Math.PI * 2;
    const d = (t * 140 + random() * 190) % 190;
    for (let s = 0; s < 3 + d / 30; s += 1) {
      dot(ctx, cx + Math.cos(a) * (d + s) * 1.6, cy + Math.sin(a) * (d + s), s === 0 ? "#ffffff" : "#9be7ff");
    }
  }
  drawActor(ctx, "pixie", "carry", cx - PW / 2 + Math.sin(t * 3) * 6, false, {
    y: cy - PH / 2 + Math.cos(t * 2.4) * 4,
    angle: t * 5,
    scale: 1.6,
  });
};

const shade = (ctx, color, alpha) => {
  if (alpha <= 0) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);
  ctx.globalAlpha = 1;
};

/** Sets up the stage on `canvas` (STAGE_W × STAGE_H); draw(t) paints second t. */
export const createStoryArt = (canvas) => {
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const jungle = drawJungle();
  const leaves = drawLeaves();

  return {
    draw(t) {
      if (t < WARP_AT) {
        ctx.drawImage(jungle, 0, 0);
        drawVines(ctx, t);
        drawFireflies(ctx, t, progress(t, 14.3, 17));
        drawPortal(ctx, t, ease(progress(t, 14.3, 15.8)) * (1 + Math.sin(t * 3) * 0.03));
        drawBugs(ctx, t);
        drawShot(ctx, t);
        drawGourav(ctx, t);
        drawPixie(ctx, t);
        ctx.drawImage(leaves, 0, 0);
        // fades in from black, and out to black into the warp
        shade(ctx, "#000000", 1 - progress(t, 0, 0.8));
        shade(ctx, "#000000", progress(t, WARP_AT - 0.3, WARP_AT));
      } else {
        drawWarp(ctx, t);
        shade(ctx, "#000000", 1 - progress(t, WARP_AT, WARP_AT + 0.3));
        shade(ctx, "#ffffff", progress(t, STORY_LENGTH - 0.6, STORY_LENGTH));
      }
    },
  };
};
