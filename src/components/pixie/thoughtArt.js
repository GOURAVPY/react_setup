// The little pixel pictures in Gourav's and someone special's thought
// bubbles (ThoughtPicture.jsx) when they think of each other: what the other
// one is up to, and the gifts he gave her. Each is { w, h, draw(ctx) },
// drawn one canvas pixel per art pixel and scaled up crisp.

import { GOURAV_FRAMES, GOURAV_PALETTE } from "./gourav";
import { HER_FRAMES, HER_PALETTE } from "./her";
import {
  BIRD_FRAMES,
  BIRD_PALETTE,
  CHAIR,
  DESK,
  DESK_PALETTE,
  EASEL,
  EASEL_PALETTE,
  PAINTINGS,
  PAINT_AT,
  PAINT_PALETTE,
  SCREEN,
  SEATED_FRAMES,
  CODE_COLOURS,
} from "./castArt";

const paint = (ctx, rows, palette, dx = 0, dy = 0, flip = false) =>
  rows.forEach((row, y) => {
    const cells = [...row];
    cells.forEach((cell, x) => {
      if (cell === ".") return;
      ctx.fillStyle = palette[cell];
      ctx.fillRect((flip ? cells.length - 1 - x : x) + dx, y + dy, 1, 1);
    });
  });

const GIFT_PALETTE = { K: "#1b1424", N: "#ff9ec0", n: "#ffd1e0", Y: "#ffd166", W: "#ffffff" };

// a heart, broken in two down a zigzag: one half each
const HEART = [
  "..KKKK..KKKK..",
  ".KNNNNKKNNNNK.",
  "KNnWNNNNNNNNNK",
  "KNnNNNNNNNNNNK",
  "KNNNNNNNNNNNNK",
  ".KNNNNNNNNNNK.",
  "..KNNNNNNNNK..",
  "...KNNNNNNK...",
  "....KNNNNK....",
  ".....KNNK.....",
  "......KK......",
];
const BREAK = [7, 7, 6, 7, 6, 7, 6, 7, 6, 7, 7]; // where each row splits
const GAP = 3; // px between the halves

const BRACELET = [
  "....KKKKKK....",
  "..KKNYNYNYKK..",
  ".KNK......KYK.",
  "KYK........KNK",
  "KNK........KYK",
  ".KYK......KNK.",
  "..KKNYNYNYKK..",
  "....KKKKKK....",
];

export const THOUGHT_PICTURES = {
  // her at her easel, painting a heart
  herPainting: {
    w: 44,
    h: 32,
    draw(ctx) {
      paint(ctx, EASEL, EASEL_PALETTE, 20, 0);
      paint(ctx, PAINTINGS.heart, PAINT_PALETTE, 20 + PAINT_AT.x, PAINT_AT.y);
      paint(ctx, HER_FRAMES.paint.map((row) => row.join("")), HER_PALETTE, 0, 2);
    },
  },
  // her waving
  herWave: {
    w: 24,
    h: 30,
    draw(ctx) {
      paint(ctx, HER_FRAMES.raise.map((row) => row.join("")), HER_PALETTE, 0, 0, true);
    },
  },
  // him at his desk, from behind, code on the screen
  himCoding: {
    w: 44,
    h: 35,
    draw(ctx) {
      paint(ctx, DESK, DESK_PALETTE);
      for (let row = 0; row < SCREEN.h; row++) {
        ctx.fillStyle = CODE_COLOURS[row % CODE_COLOURS.length];
        ctx.fillRect(SCREEN.x + (row % 4), SCREEN.y + row, 4 + ((row * 7) % 14), 1);
      }
      paint(ctx, SEATED_FRAMES.a, GOURAV_PALETTE, 11, 6);
      paint(ctx, CHAIR, DESK_PALETTE, 11, 22);
    },
  },
  // him with his coffee
  himCoffee: {
    w: 24,
    h: 30,
    draw(ctx) {
      paint(ctx, GOURAV_FRAMES.mug.map((row) => row.join("")), GOURAV_PALETTE);
    },
  },
  // him waving
  himWave: {
    w: 24,
    h: 30,
    draw(ctx) {
      paint(ctx, GOURAV_FRAMES.raise.map((row) => row.join("")), GOURAV_PALETTE);
    },
  },
  // the half-heart necklace: her half, his half
  necklace: {
    w: 14 + GAP,
    h: 11,
    draw(ctx) {
      HEART.forEach((row, y) =>
        [...row].forEach((cell, x) => {
          if (cell === ".") return;
          ctx.fillStyle = GIFT_PALETTE[cell];
          ctx.fillRect(x < BREAK[y] ? x : x + GAP, y, 1, 1);
        }),
      );
    },
  },
  // Neel, her parakeet
  bird: {
    w: 16,
    h: 20,
    draw(ctx) {
      paint(ctx, BIRD_FRAMES.perch.map((row) => row.join("")), BIRD_PALETTE);
    },
  },
  // the bead bracelet he gave her
  bracelet: {
    w: 14,
    h: 8,
    draw(ctx) {
      paint(ctx, BRACELET, GIFT_PALETTE);
    },
  },
};
