// Album covers for the songs (songs.js), in the site's pixel art: a picture
// on a gradient, drawn into a 24 × 24 canvas (Music.jsx scales it up crisp).

import { BIRD_FRAMES, BIRD_PALETTE, DESK_PALETTE, MUG, PAINTINGS, PAINT_PALETTE } from "../components/pixie/castArt";

export const COVER_SIZE = 24;

// paints letter-grid art, `scale` canvas pixels a pixel, centred
const centred = (ctx, rows, palette, scale) => {
  const grid = rows.map((row) => [...row]);
  const w = Math.max(...grid.map((row) => row.length)) * scale;
  const h = grid.length * scale;
  const dx = Math.floor((COVER_SIZE - w) / 2);
  const dy = Math.floor((COVER_SIZE - h) / 2);
  grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell === ".") return;
      ctx.fillStyle = palette[cell];
      ctx.fillRect(dx + x * scale, dy + y * scale, scale, scale);
    }),
  );
};

export const COVERS = {
  // a sun coming up
  sun: {
    from: "#fde68a",
    to: "#fb923c",
    draw: (ctx) => centred(ctx, PAINTINGS.sun, PAINT_PALETTE, 2),
  },
  // Gourav's coffee
  coffee: {
    from: "#e7c9a3",
    to: "#7c4a2a",
    draw: (ctx) => {
      centred(ctx, MUG, DESK_PALETTE, 3);
      // steam
      ctx.fillStyle = "rgb(255 255 255 / 0.8)";
      [
        [9, 2],
        [10, 3],
        [9, 4],
        [12, 1],
        [13, 2],
        [12, 3],
      ].forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
    },
  },
  // Neel, her parakeet
  bird: {
    from: "#e0f2fe",
    to: "#38bdf8",
    draw: (ctx) => centred(ctx, BIRD_FRAMES.perch.map((row) => row.join("")), BIRD_PALETTE, 1),
  },
  // a heart
  heart: {
    from: "#ffe4e6",
    to: "#f43f5e",
    draw: (ctx) => centred(ctx, PAINTINGS.heart, PAINT_PALETTE, 2),
  },
  // Pixie's portal: a swirl of light
  portal: {
    from: "#312e81",
    to: "#0f172a",
    draw: (ctx) => {
      const middle = COVER_SIZE / 2 - 0.5;
      const colours = ["#f0abfc", "#a855f7", "#6d28d9"];
      for (let y = 0; y < COVER_SIZE; y++) {
        for (let x = 0; x < COVER_SIZE; x++) {
          const d = Math.hypot(x - middle, y - middle);
          if (d > 10) continue;
          const swirl = d + Math.atan2(y - middle, x - middle) * 1.6;
          ctx.fillStyle = d < 2.5 ? "#ffffff" : colours[((Math.floor(swirl / 2) % 3) + 3) % 3];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
  },
};
