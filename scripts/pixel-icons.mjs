// Draws the "Pixel" icon style (src/components/AppIcon.jsx): pixel-art app
// icons for the dock, and folder and file icons for the Portfolio window,
// into public/images/pixel/*.svg. Run with `node scripts/pixel-icons.mjs`
// after changing a drawing here.
//
// An app icon is a 20 × 20 pixel tile (stepped corners, a dark rim, a lighter
// top) with a 16 × 16 picture in the middle. The pictures are letter grids
// (one letter a pixel, "." for none) or functions of x and y for round ones.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FRAMES as PIXIE_FRAMES, PALETTE as PIXIE_PALETTE } from "../src/components/pixie/sprites.js";
import { GOURAV_FRAMES, GOURAV_PALETTE } from "../src/components/pixie/gourav.js";
import { HER_FRAMES, HER_PALETTE } from "../src/components/pixie/her.js";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../public/images/pixel");
mkdirSync(OUT, { recursive: true });

const CELLS = 20; // the tile, in pixels
const SIZE = 88 / CELLS; // svg units a pixel
const ORIGIN = 6;

// runs of the same colour along each row, one <rect> each
const rects = (cells, size, origin) => {
  const out = [];
  cells.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const colour = row[x];
      let end = x;
      while (end + 1 < row.length && row[end + 1] === colour) end++;
      if (colour) {
        out.push(
          `<rect x="${(origin + x * size).toFixed(2)}" y="${(origin + y * size).toFixed(2)}" width="${((end - x + 1) * size).toFixed(2)}" height="${size.toFixed(2)}" fill="${colour}"/>`,
        );
      }
      x = end + 1;
    }
  });
  return out.join("\n  ");
};

const svg = (title, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" shape-rendering="crispEdges">
  <!-- ${title}, pixel style (made by scripts/pixel-icons.mjs) -->
  ${body}
</svg>
`;

// a pixel's colour from a picture: a grid of letters, or a function
const sample = (picture, palette, x, y) => {
  const c = typeof picture === "function" ? picture(x, y) : picture[y]?.[x];
  return c && c !== "." ? palette[c] : null;
};

// the tile: stepped corners, a dark rim, light top, base below, a gloss line
const inTile = (x, y) => {
  const cx = Math.min(x, CELLS - 1 - x);
  const cy = Math.min(y, CELLS - 1 - y);
  return !(cx + cy < 2 || (cx === 0 && cy === 2) || (cx === 2 && cy === 0));
};
const tile = ({ light, base, rim }) =>
  Array.from({ length: CELLS }, (_, y) =>
    Array.from({ length: CELLS }, (_, x) => {
      if (!inTile(x, y)) return null;
      const edge = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => !inTile(x + dx, y + dy) || x + dx < 0 || y + dy < 0 || x + dx >= CELLS || y + dy >= CELLS);
      if (edge) return rim;
      if (y === 1 || (y === 2 && (x === 1 || x === CELLS - 2))) return "#ffffff66";
      // two tones, dithered where they meet
      if (y < 9) return light;
      if (y === 9 || y === 10) return (x + y) % 2 ? light : base;
      return base;
    }),
  );

const appIcon = (name, title, colours, picture, palette) => {
  const cells = tile(colours);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const c = sample(picture, palette, x, y);
      if (c) cells[y + 2][x + 2] = c;
    }
  }
  writeFileSync(join(OUT, `${name}.svg`), svg(title, rects(cells, SIZE, ORIGIN)));
};

// a picture with no tile (the archive bin, and the folder and file icons)
const bareIcon = (name, title, picture, palette, w = 16, h = 16) => {
  const size = 88 / Math.max(w, h);
  const cells = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => sample(picture, palette, x, y)));
  const origin = 6 + (88 - w * size) / 2;
  writeFileSync(join(OUT, `${name}.svg`), svg(title, rects(cells, size, origin)));
};

const K = "#1b1424"; // outline

// ------------------------------------------------------------ Portfolio (Finder)
// the smiling two-tone face, its profile down the middle
const PROFILE = [8, 8, 8, 8, 7, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8];
appIcon(
  "finder",
  "Portfolio",
  { light: "#e0f2fe", base: "#bae6fd", rim: "#1e40af" },
  (x, y) => {
    if ((x === 4 || x === 11) && y >= 4 && y <= 6) return "K";
    if ((y === 11 && (x === 3 || x === 12)) || (y === 12 && x >= 4 && x <= 11)) return "K";
    if (x === PROFILE[y]) return "K";
    return x < PROFILE[y] ? "L" : "D";
  },
  { K, L: "#7dd3fc", D: "#2563eb" },
);

// ------------------------------------------------------------ Browser (Safari)
appIcon(
  "safari",
  "Browser",
  { light: "#7dd3fc", base: "#0284c7", rim: "#0c4a6e" },
  (x, y) => {
    const d = Math.hypot(x - 7.5, y - 7.5);
    if (d > 7.6) return null;
    if (d > 6.6) return "b";
    // the needle, red to the north-east, grey to the south-west: widest in
    // the middle, coming to a point at each end
    const across = (x - 7.5 - (7.5 - y)) / Math.SQRT2;
    const along = (x - 7.5 + (7.5 - y)) / Math.SQRT2;
    if (Math.abs(along) < 5.6 && Math.abs(across) < 1.25 * (1 - Math.abs(along) / 5.6) + 0.35) {
      if (Math.abs(along) < 0.8) return "K";
      return along > 0 ? "R" : "G";
    }
    if ((x === 7 || x === 8) && (y === 1 || y === 14)) return "t";
    if ((y === 7 || y === 8) && (x === 1 || x === 14)) return "t";
    return "W";
  },
  { K, W: "#ffffff", b: "#e0f2fe", R: "#ef4444", G: "#9ca3af", t: "#94a3b8" },
);

// ------------------------------------------------------------ Gallery (Photos)
const PETALS = ["o", "y", "g", "c", "b", "p", "m", "r"];
appIcon(
  "photos",
  "Gallery",
  { light: "#ffffff", base: "#e5e7eb", rim: "#9ca3af" },
  (x, y) => {
    const dx = x - 7.5;
    const dy = y - 7.5;
    let found = null;
    PETALS.forEach((colour, i) => {
      const a = (i / PETALS.length) * Math.PI * 2 - Math.PI / 2;
      // in the petal's own frame: along it, and across it
      const along = dx * Math.cos(a) + dy * Math.sin(a) - 4;
      const across = -dx * Math.sin(a) + dy * Math.cos(a);
      if ((along / 3.4) ** 2 + (across / 2.1) ** 2 <= 1) found = colour;
    });
    return found;
  },
  { o: "#fb923c", y: "#facc15", g: "#4ade80", c: "#2dd4bf", b: "#60a5fa", p: "#a78bfa", m: "#f472b6", r: "#f87171" },
);

// ------------------------------------------------------------ Contact
appIcon(
  "contact",
  "Contact",
  { light: "#e7c99a", base: "#c0935a", rim: "#6b4423" },
  (x, y) => {
    // the address book's spine, with its rings
    if (x <= 1) return [3, 7, 11].includes(y) ? "K" : "S";
    const d = Math.hypot(x - 9, y - 7.5);
    if (d > 6.6) return null;
    const head = Math.hypot(x - 9, y - 5.6) <= 2.5;
    const shoulders = ((x - 9) / 4.6) ** 2 + ((y - 13.2) / 3.4) ** 2 <= 1;
    return head || shoulders ? "P" : "c";
  },
  { K, S: "#8a5a32", c: "#f6e7c8", P: "#7a4a24" },
);

// ------------------------------------------------------------ Skills (Terminal)
appIcon(
  "terminal",
  "Skills",
  { light: "#52525b", base: "#27272a", rim: "#09090b" },
  [
    "gggggggggggggggg",
    "grgygngggggggggg",
    "kkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkk",
    "kkkkkkkkkkkkkkkk",
    "kkGGkkkkkkkkkkkk",
    "kkkGGkkkkkkkkkkk",
    "kkkkGGkkkkkkkkkk",
    "kkkGGkkkkkkkkkkk",
    "kkGGkkkkkkkkkkkk",
    "kkkkkkWWWWkkkkkk",
    "kkkkkkkkkkkkkkkk",
    "kkllllkllllllkkk",
    "kkkkkkkkkkkkkkkk",
    "kkllllllkllkkkkk",
    "kkkkkkkkkkkkkkkk",
  ],
  { g: "#a1a1aa", r: "#f87171", y: "#facc15", n: "#4ade80", k: "#0a0a0a", G: "#4ade80", W: "#ffffff", l: "#3f3f46" },
);

// ------------------------------------------------------------ Arcade
appIcon(
  "arcade",
  "Arcade",
  { light: "#a855f7", base: "#5b21b6", rim: "#2e1065" },
  [
    "................",
    "......KKKK......",
    ".....KRRRrK.....",
    "....KRWRRRrK....",
    "....KRRRRRrK....",
    ".....KRRRrK.....",
    "......KKKK......",
    ".......KsK......",
    ".......KsK......",
    ".......KsK......",
    "..KKKKKKsKKKKK..",
    ".KYYYYYYYYYYbYK.",
    "KYYYYYYYYYYYYYYK",
    "KyyyyyyyyyyyyyyK",
    ".KKKKKKKKKKKKKK.",
    "................",
  ],
  { K, R: "#ef4444", r: "#b91c1c", W: "#fecaca", s: "#9ca3af", Y: "#fbbf24", y: "#d97706", b: "#38bdf8" },
);

// ------------------------------------------------------------ Settings
appIcon(
  "settings",
  "Settings",
  { light: "#e5e7eb", base: "#9ca3af", rim: "#374151" },
  (x, y) => {
    const dx = x - 7.5;
    const dy = y - 7.5;
    const d = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    // eight teeth
    const tooth = Math.abs(((angle / (Math.PI / 4)) % 1 + 1) % 1 - 0.5) < 0.24;
    if (d < 2.2) return "h";
    if (d < 5.4) return d < 3.2 ? "d" : "G";
    if (d < 7.4 && tooth) return "G";
    return null;
  },
  { G: "#4b5563", d: "#1f2937", h: "#e5e7eb" },
);

// ------------------------------------------------------------ Archive (Trash): a bin, no tile
bareIcon(
  "trash",
  "Archive",
  [
    "......KKKK......",
    "......K..K......",
    ".KKKKKKKKKKKKKK.",
    "KwwwwwwwwwwwwwwK",
    ".KKKKKKKKKKKKKK.",
    "..KwgwwgwwgwwK..",
    "..KwgwwgwwgwwK..",
    "..KwgwwgwwgwwK..",
    "..KwgwwgwwgwwK..",
    "...KgwwgwwgwK...",
    "...KgwwgwwgwK...",
    "...KgwwgwwgwK...",
    "...KgwwgwwgwK...",
    "...KwwwwwwwwK...",
    "....KKKKKKKK....",
    "................",
  ],
  { K: "#475569", w: "#e2e8f0", g: "#94a3b8" },
);

// ------------------------------------------------------------ Music
appIcon(
  "music",
  "Music",
  { light: "#fda4af", base: "#e11d48", rim: "#881337" },
  [
    "................",
    ".........WWWWW..",
    ".....WWWWWWWWW..",
    ".....WWWWW...W..",
    ".....W.......W..",
    ".....W.......W..",
    ".....W.......W..",
    ".....W.......W..",
    ".....W.......W..",
    "...WWW.....WWW..",
    "..WWWW....WWWW..",
    "..WWWW....WWWW..",
    "...WW......WW...",
    "................",
    "................",
    "................",
  ],
  { W: "#ffffff" },
);

// ------------------------------------------------------------ Gourav's Book
const BOOK = (() => {
  const grid = Array.from({ length: 16 }, () => Array(16).fill("."));
  const set = (x, y, c) => (grid[y][x] = c);
  for (let y = 1; y <= 14; y++) {
    for (let x = 1; x <= 13; x++) set(x, y, y === 1 || y === 14 || x === 1 || x === 13 ? "K" : x === 2 ? "d" : "B");
    if (y > 1 && y < 14) set(14, y, "w");
  }
  for (let x = 3; x <= 12; x++) {
    set(x, 3, "Y");
    set(x, 12, "Y");
  }
  // its badge: </>
  [
    [5, 5],
    [4, 6],
    [3, 7],
    [4, 8],
    [5, 9],
    [9, 5],
    [8, 6],
    [8, 7],
    [7, 8],
    [7, 9],
    [10, 5],
    [11, 6],
    [12, 7],
    [11, 8],
    [10, 9],
  ].forEach(([x, y]) => set(x, y, "Y"));
  // and its ribbon
  set(10, 15, "R");
  set(11, 15, "R");
  return grid.map((row) => row.join(""));
})();
appIcon("book", "Gourav's Book", { light: "#fde68a", base: "#f59e0b", rim: "#78350f" }, BOOK, {
  K: "#2b1b2e",
  d: "#5a2c1c",
  B: "#7b3f2a",
  Y: "#ffd166",
  w: "#f6e7c1",
  R: "#e3463d",
});

// ------------------------------------------------------------ the companions, head and shoulders
const portrait = (frame, fromX) => (x, y) => frame[y]?.[x + fromX];
appIcon("pixie", "Pixie", { light: "#fbcfe8", base: "#a78bfa", rim: "#5b21b6" }, portrait(PIXIE_FRAMES.stand, 3), PIXIE_PALETTE);
appIcon("gourav", "Gourav", { light: "#dbeafe", base: "#60a5fa", rim: "#1e3a8a" }, portrait(GOURAV_FRAMES.stand, 4), GOURAV_PALETTE);
appIcon("her", "Someone special", { light: "#ffe4e6", base: "#fb7185", rim: "#9f1239" }, portrait(HER_FRAMES.stand, 4), HER_PALETTE);

// ------------------------------------------------------------ folder and file icons
bareIcon(
  "folder",
  "Folder",
  [
    "................",
    ".KKKKK..........",
    "KLLLLLKKKKKKKKK.",
    "KLLLLLLLLLLLLLLK",
    "KDDDDDDDDDDDDDDK",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KBBBBBBBBBBBBBBK",
    "KbbbbbbbbbbbbbbK",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
  ],
  { K: "#1d4ed8", L: "#93c5fd", D: "#60a5fa", B: "#7cc0ff", b: "#4f9ef5" },
);

const page = (inside) => [
  "..KKKKKKKKK.....",
  "..KWWWWWWWKK....",
  "..KWWWWWWWKfK...",
  "..KWWWWWWWKKKK..",
  ...inside,
  "..KKKKKKKKKKKK..",
];
const PAGE = { K: "#64748b", W: "#ffffff", f: "#e2e8f0" };

bareIcon(
  "txt",
  "Text file",
  page([
    "..KWWWWWWWWWWK..",
    "..KWllllllllWK..",
    "..KWWWWWWWWWWK..",
    "..KWllllllWWWK..",
    "..KWWWWWWWWWWK..",
    "..KWllllllllWK..",
    "..KWWWWWWWWWWK..",
    "..KWlllllWWWWK..",
    "..KWWWWWWWWWWK..",
    "..KWWWWWWWWWWK..",
    "..KWWWWWWWWWWK..",
  ]),
  { ...PAGE, l: "#94a3b8" },
);

bareIcon(
  "pdf",
  "PDF",
  page([
    "..KWWWWWWWWWWK..",
    "..KWllllllllWK..",
    "..KWWWWWWWWWWK..",
    "..KWllllllWWWK..",
    "..KWWWWWWWWWWK..",
    "..KRRRRRRRRRRK..",
    "..KRwwRwwRwwRK..",
    "..KRwRRwRRwRRK..",
    "..KRRRRRRRRRRK..",
    "..KWWWWWWWWWWK..",
    "..KWWWWWWWWWWK..",
  ]),
  { ...PAGE, l: "#94a3b8", R: "#ef4444", w: "#ffffff" },
);

bareIcon(
  "image",
  "Picture",
  page([
    "..KWWWWWWWWWWK..",
    "..KWssssssssWK..",
    "..KWssssssYsWK..",
    "..KWsssssYYYWK..",
    "..KWssssssYsWK..",
    "..KWssGsssssWK..",
    "..KWsGGGssGsWK..",
    "..KWGGGGGGGGWK..",
    "..KWggggggggWK..",
    "..KWWWWWWWWWWK..",
    "..KWWWWWWWWWWK..",
  ]),
  { ...PAGE, s: "#bae6fd", Y: "#facc15", G: "#4ade80", g: "#16a34a" },
);

// ------------------------------------------------------------ little icons
// the Portfolio window's sidebar (blue) and the menu bar (black), 14 × 14,
// one colour, drawn a pixel to a pixel so they stay sharp at their size

const smallIcon = (name, colour, rows) => {
  const cells = rows.map((row) => [...row].map((c) => (c === "X" ? colour : null)));
  writeFileSync(
    join(OUT, `little-${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" shape-rendering="crispEdges">
  <!-- ${name}, pixel style (made by scripts/pixel-icons.mjs) -->
  ${rects(cells, 1, 0)}
</svg>
`,
  );
};

const BLUE = "#007AFF";
const BLACK = "#000000";

smallIcon("work", BLUE, [
  "..............",
  "..............",
  ".....XXXX.....",
  "....XX..XX....",
  ".XXXXXXXXXXXX.",
  ".X..........X.",
  ".X..........X.",
  ".XXXXXXXXXXXX.",
  ".X....XX....X.",
  ".X..........X.",
  ".X..........X.",
  ".XXXXXXXXXXXX.",
  "..............",
  "..............",
]);
smallIcon("company", BLUE, [
  "..............",
  "...XXXXXXXX...",
  "...X......X...",
  "...X.X..X.X...",
  "...X......X...",
  "...X.X..X.X...",
  "...X......X...",
  "...X.X..X.X...",
  "...X......X...",
  "...X..XX..X...",
  "...X..XX..X...",
  ".XXXXXXXXXXXX.",
  "..............",
  "..............",
]);
smallIcon("info", BLUE, [
  "..............",
  ".....XXXX.....",
  "...XX....XX...",
  "..X...XX...X..",
  "..X........X..",
  ".X....XX....X.",
  ".X....XX....X.",
  ".X....XX....X.",
  ".X....XX....X.",
  "..X...XX...X..",
  "..X........X..",
  "...XX....XX...",
  ".....XXXX.....",
  "..............",
]);
smallIcon("file", BLUE, [
  "..............",
  "...XXXXXX.....",
  "...X....XX....",
  "...X....X.X...",
  "...X....XXXX..",
  "...X.......X..",
  "...X.XXXXX.X..",
  "...X.......X..",
  "...X.XXXXX.X..",
  "...X.......X..",
  "...X.XXX...X..",
  "...X.......X..",
  "...XXXXXXXXX..",
  "..............",
]);
smallIcon("trash", BLUE, [
  "..............",
  ".....XXXX.....",
  ".XXXXXXXXXXXX.",
  "..............",
  "..XXXXXXXXXX..",
  "..X..X..X..X..",
  "..X..X..X..X..",
  "..X..X..X..X..",
  "..X..X..X..X..",
  "..X..X..X..X..",
  "..X..X..X..X..",
  "...XXXXXXXX...",
  "..............",
  "..............",
]);
smallIcon("wifi", BLACK, [
  "..............",
  "..............",
  "....XXXXXX....",
  "..XX......XX..",
  ".X..........X.",
  "....XXXXXX....",
  "...X......X...",
  "..............",
  ".....XXXX.....",
  "....X....X....",
  "..............",
  "......XX......",
  "......XX......",
  "..............",
]);
smallIcon("search", BLACK, [
  "..............",
  "...XXXX.......",
  "..X....X......",
  ".X......X.....",
  ".X......X.....",
  ".X......X.....",
  ".X......X.....",
  "..X....X......",
  "...XXXXXX.....",
  "........XX....",
  ".........XX...",
  "..........XX..",
  "...........X..",
  "..............",
]);
smallIcon("user", BLACK, [
  "..............",
  ".....XXXX.....",
  "...XX....XX...",
  "..X..XXXX..X..",
  "..X..X..X..X..",
  ".X...X..X...X.",
  ".X...XXXX...X.",
  ".X..........X.",
  ".X..XXXXXX..X.",
  "..XX......XX..",
  "..X........X..",
  "...XX....XX...",
  ".....XXXX.....",
  "..............",
]);
// light and dark: a circle, half filled
smallIcon("mode", BLACK, [
  "..............",
  ".....XXXX.....",
  "...XXXX..XX...",
  "..XXXXX....X..",
  "..XXXXX....X..",
  ".XXXXXX.....X.",
  ".XXXXXX.....X.",
  ".XXXXXX.....X.",
  ".XXXXXX.....X.",
  "..XXXXX....X..",
  "..XXXXX....X..",
  "...XXXX..XX...",
  ".....XXXX.....",
  "..............",
]);

console.log("pixel icons written to", OUT);
