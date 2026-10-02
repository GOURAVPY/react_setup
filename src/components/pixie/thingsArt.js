// Pixel art for Pixie's things on the desktop: her bed (empty, and with her
// asleep in it), her plant at each stage of growing, and her ball. Drawn in
// the same palette and size of pixel as Pixie (src/components/pixie/sprites.js).

const grid = (width, height) => Array.from({ length: height }, () => Array(width).fill("."));

const paint = (g, x, y, text) =>
  [...text].forEach((c, i) => {
    if (c !== "." && g[y]?.[x + i] !== undefined) g[y][x + i] = c;
  });

// a filled box with a dark outline
const box = (g, x, y, w, h, fill, outline = "K") => {
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const edge = row === y || row === y + h - 1 || col === x || col === x + w - 1;
      if (g[row]?.[col] !== undefined) g[row][col] = edge ? outline : fill;
    }
  }
};

// ------------------------------------------------------------ the bed

export const BED_WIDTH = 30;
export const BED_HEIGHT = 15;

const bedFrame = () => {
  const g = grid(BED_WIDTH, BED_HEIGHT);
  // headboard and footboard
  box(g, 0, 1, 5, 13, "O");
  paint(g, 1, 0, "KKK");
  for (let y = 2; y < 13; y++) paint(g, 2, y, "o");
  box(g, 25, 5, 5, 9, "O");
  for (let y = 6; y < 13; y++) paint(g, 27, y, "o");
  // mattress on a wooden rail, and little legs
  box(g, 4, 9, 22, 3, "W");
  box(g, 4, 11, 22, 3, "O");
  paint(g, 5, 12, "oooooooooooooooooooo");
  paint(g, 1, 14, "oo");
  paint(g, 27, 14, "oo");
  // the pillow
  box(g, 5, 6, 6, 4, "W");
  paint(g, 6, 8, "yyyy");
  return g;
};

// the blanket: pink with white dots like her dress, folded over at the top
const blanket = (g, top) => {
  box(g, 10, top, 16, 12 - top, "D");
  paint(g, 11, top + 1, "WWWWWWWWWWWWWW");
  for (let x = 12; x < 25; x += 3) paint(g, x, top + 3, "d");
  for (let x = 13; x < 25; x += 3) paint(g, x, top + 5, "d");
};

export const BED_EMPTY = (() => {
  const g = bedFrame();
  blanket(g, 7);
  return g;
})();

// Pixie tucked in: her head on the pillow, eyes shut, a bump under the blanket
export const BED_SLEEPING = (() => {
  const g = bedFrame();
  [
    "..KKKKK..",
    ".KHHhHHK.",
    "KHHHHHHHK",
    "KHSSSSSHK",
    "KSKKSKKSK",
    "KSBSSSBSK",
    ".KSSSSSK.",
  ].forEach((row, y) => paint(g, 3, y + 1, row));
  blanket(g, 6);
  // her knees make a little hill in the blanket
  paint(g, 14, 4, "KKKKKK");
  paint(g, 13, 5, "KDDDDDDK");
  paint(g, 13, 6, "KDDDDDDK");
  return g;
})();

// ------------------------------------------------------------ the plant

export const PLANT_WIDTH = 12;
export const PLANT_HEIGHT = 18;

const pot = () => {
  const g = grid(PLANT_WIDTH, PLANT_HEIGHT);
  [
    "KKKKKKKKKKKK",
    "KkkkkkkkkkkK",
    "KTTTTTTTTTTK",
    "KttttttttttK",
    ".KTTTTTTTTK.",
    ".KTTTTTTTTK.",
    "..KKKKKKKK..",
  ].forEach((row, y) => paint(g, 0, y + 11, row));
  return g;
};

const leaves = (g, rows) => rows.forEach(([x, y, text]) => paint(g, x, y, text));

const SPROUT = [
  [5, 10, "gg"],
  [5, 9, "g"],
  [3, 8, "GG"],
  [6, 8, "GG"],
  [4, 9, "G"],
  [7, 9, "G"],
];

const SMALL = [
  ...[5, 6, 7, 8, 9, 10].map((y) => [5, y, "g"]),
  [2, 8, "GGG"],
  [6, 8, "GGG"],
  [3, 9, "Gg"],
  [6, 9, "gG"],
  [3, 5, "GG"],
  [6, 5, "GG"],
  [4, 4, "GgG"],
];

const LEAFY = [
  ...[3, 4, 5, 6, 7, 8, 9, 10].map((y) => [5, y, "g"]),
  [1, 8, "GGGG"],
  [6, 8, "GGGG"],
  [2, 9, "Gg"],
  [7, 9, "gG"],
  [2, 6, "GGG"],
  [6, 6, "GGG"],
  [3, 7, "g"],
  [7, 7, "g"],
  [3, 3, "GG"],
  [6, 3, "GG"],
  [4, 2, "GgG"],
];

const FLOWER = [
  ...LEAFY.filter(([, y]) => y > 2),
  [4, 0, ".DD."],
  [3, 1, "DDRDD"],
  [3, 2, "DRRRD"],
  [4, 3, "DgD"],
];

export const PLANT_STAGES = [SPROUT, SMALL, LEAFY, FLOWER].map((parts) => {
  const g = pot();
  leaves(g, parts);
  return g;
});

export const PLANT_STAGE_NAMES = ["sprout", "small", "leafy", "flowering"];

// ------------------------------------------------------------ the ball

export const BALL_SIZE = 8;

export const BALL = [
  "..KKKK..",
  ".KDDWWK.",
  "KDDDWWWK",
  "KDDWWWDK",
  "KWWWWDDK",
  "KWWWDDDK",
  ".KWDDDK.",
  "..KKKK..",
].map((row) => [...row]);

// ------------------------------------------------------------ drawing

export const drawGrid = (ctx, g, scale, palette) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  g.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell === ".") return;
      ctx.fillStyle = palette[cell];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }),
  );
};
