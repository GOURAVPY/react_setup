// Pixie's pixel art. Each frame is a grid of letters, one per pixel, built
// from parts (head, body, legs) plus small overlays (eyes, mouth, arms) so
// the poses share one drawing. To use a drawn sprite sheet instead, replace
// FRAMES with images of the same names; the behaviour never looks inside.

export const WIDTH = 22; // pixels
export const HEIGHT = 24;
export const SCALE = 4; // screen pixels per art pixel

export const PALETTE = {
  K: "#2b1b2e", // outline
  H: "#8b4a2f", // hair
  h: "#b86b45", // hair shine
  S: "#ffd9be", // skin
  B: "#ff9aa8", // blush
  E: "#2b1b2e", // eyes
  W: "#ffffff", // eye shine, socks
  D: "#ff6fa6", // dress
  d: "#ffffff", // dress dots
  R: "#ffd166", // bow
  F: "#6b3b2a", // shoes
  M: "#d6336c", // open mouth
  // her things
  O: "#c07a43", // wood
  o: "#7d4a26", // dark wood
  C: "#8fd0f5", // watering can
  c: "#3f8cc4", // watering can shade
  P: "#9d72ff", // book cover
  p: "#6b45d6", // book shade
  G: "#63c35b", // leaves
  g: "#2f8a3a", // dark leaves, stems
  T: "#e07a4f", // flower pot
  t: "#a94a2c", // flower pot shade
  k: "#5a3a28", // soil
  y: "#e6dcef", // pillow shade
  s: "#b9b2c8", // pebble
};

const PAD = 3; // the 16-pixel-wide body sits in the middle of the frame

const HEAD = [
  "....KKKKKKKK....",
  "..KKHHHHHHHHKK..",
  ".KHHHhhHHHHHHHK.",
  ".KHhHHHHHHHHHHK.",
  "KHHHHHHHHHHHHHHK",
  "KHHSSHHSSHHSSHHK",
  "KHSSSSSSSSSSSSHK",
  "KHSSEESSSSEESSHK",
  "KHSSEWSSSSWESSHK",
  "KHSBBSSSSSSBBSHK",
  ".KHSSSSKKSSSSHK.",
  ".KHHSSSSSSSSHHK.",
  "..KHKKSSSSKKHK..",
];

const BODY = [
  "....KKRRRRKK....",
  "...KDDDRRDDDK...",
  "..KSKDDDDDDKSK..",
  "..KSKDDDDDDKSK..",
  "..KSKDDDDDDKSK..",
  "..KSSDDDDDDSSK..",
  ".KDDdDDdDDdDDdK.",
  ".KKKKKKKKKKKKKK.",
];

const LEGS = {
  stand: [".....KSK.KSK....", ".....KWK.KWK....", "....KFFK.KFFK..."],
  stepA: ["....KSK...KSK...", "...KWK.....KWK..", "..KFFK.....KFFK."],
  stepB: ["......KSKKSK....", "......KWKKWK....", ".....KFFKKFFK..."],
  // legs stretched out in front: one row, with the feet at each end
  sit: ["..KFSSSK.KSSSFK."],
};

// [x, y, text] pieces painted over the frame (frame coordinates; "." skips)
const EYES = {
  open: [],
  closed: [
    [PAD + 4, 7, "SS....SS"],
    [PAD + 4, 8, "KK....KK"],
  ],
  happy: [
    [PAD + 4, 7, "KK....KK"],
    [PAD + 4, 8, "SS....SS"],
  ],
  // looking down, at a book
  down: [
    [PAD + 4, 7, "SS....SS"],
    [PAD + 4, 8, "EE....EE"],
  ],
};

const MOUTH = {
  smile: [],
  open: [[PAD + 7, 10, "MM"]],
};

// the right arm (on the viewer's right) taken off the body, for raising it;
// "." here clears a pixel rather than skipping it
const RIGHT_ARM_OFF = [
  [PAD + 11, 15, "K.."],
  [PAD + 11, 16, "K.."],
  [PAD + 11, 17, "K.."],
  [PAD + 11, 18, "K.."],
];

const RIGHT_ARM_UP = [
  [16, 14, "KSK"],
  [17, 13, "KSK"],
  [18, 12, "KSK"],
  [18, 11, "KSK"],
  [18, 10, "KSK"],
  [17, 9, "KSSK"],
  [18, 8, "KK"],
];

const RIGHT_ARM_OUT = [
  [16, 14, "KSK"],
  [17, 13, "KSK"],
  [18, 12, "KSSK"],
  [19, 11, "KSK"],
  [19, 10, "KSK"],
  [19, 9, "KK"],
];

// the same pieces on the other side of her body
const mirror = (pieces) =>
  pieces.map(([x, y, text]) => [
    WIDTH - x - text.length,
    y,
    [...text].reverse().join(""),
  ]);

// holding a slingshot out in front, ready to shoot
const SLINGSHOT_ARM = [
  [15, 14, "KKKK"],
  [15, 15, "SSSS"],
  [15, 16, "KKKK"],
  // the slingshot, gripped in her fist
  [19, 9, "O.O"],
  [19, 10, "O.O"],
  [19, 11, "OOO"],
  [20, 12, "o"],
  [19, 13, "KoK"],
  [19, 14, "KSK"],
  [19, 15, "SSK"],
  [19, 16, "KoK"],
  [20, 17, "o"],
];

// holding a watering can low in front, tipped to pour
const WATERING_ARM = [
  [15, 15, "SK"],
  [15, 16, "KSK"],
  [16, 17, "KSK"],
  [18, 15, "cc"],
  [17, 16, "c..c"],
  [16, 18, "KCCCK"],
  [16, 19, "KCCCCc"],
  [16, 20, "KcCCK.c"],
  [17, 21, "KKK"],
];

// each pose: which arm pixels to clear, then which to paint
const ARMS = {
  down: { off: [], on: [] },
  waveUp: { off: RIGHT_ARM_OFF, on: RIGHT_ARM_UP },
  waveOut: { off: RIGHT_ARM_OFF, on: RIGHT_ARM_OUT },
  up: {
    off: [...RIGHT_ARM_OFF, ...mirror(RIGHT_ARM_OFF)],
    on: [...RIGHT_ARM_UP, ...mirror(RIGHT_ARM_UP)],
  },
  // the band pulled back to her cheek…
  aim: { off: RIGHT_ARM_OFF, on: [...SLINGSHOT_ARM, [17, 9, "M."], [18, 10, "M"]] },
  // …and let go
  release: { off: RIGHT_ARM_OFF, on: [...SLINGSHOT_ARM, [20, 9, "M"]] },
  water: { off: RIGHT_ARM_OFF, on: WATERING_ARM },
};

// things held in front of her, painted last
const ITEMS = {
  none: [],
  book: [
    [7, 15, "KKKKKKKK"],
    [7, 16, "KPPPPPPK"],
    [7, 17, "KPPDDPPK"],
    [7, 18, "KPPPPPPK"],
    [7, 19, "KpWWWWpK"],
    [7, 20, "KKKKKKKK"],
  ],
};
// the same book, with a page being turned
ITEMS.page = [...ITEMS.book, [11, 13, "W"], [10, 14, "WWK"]];

const build = ({
  legs = "stand",
  eyes = "open",
  mouth = "smile",
  arms = "down",
  item = "none",
}) => {
  const grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill("."));
  const paint = (x, y, text) =>
    [...text].forEach((c, i) => {
      if (c !== "." && grid[y]?.[x + i] !== undefined) grid[y][x + i] = c;
    });
  const erase = (x, y, text) =>
    [...text].forEach((c, i) => {
      if (grid[y]?.[x + i] === undefined) return;
      grid[y][x + i] = c === "." ? "." : c;
    });

  // a sitting girl sits lower in the frame
  const drop = legs === "sit" ? 2 : 0;
  HEAD.forEach((row, y) => paint(PAD, y + drop, row));
  BODY.forEach((row, y) => paint(PAD, y + 13 + drop, row));
  LEGS[legs].forEach((row, y) => paint(PAD, y + 21 + drop, row));

  const overlay = (pieces, fn = paint) =>
    pieces.forEach(([x, y, text]) => fn(x, y + drop, text));
  overlay(EYES[eyes]);
  overlay(MOUTH[mouth]);
  overlay(ARMS[arms].off, erase);
  overlay(ARMS[arms].on);
  overlay(ITEMS[item]);

  return grid;
};

export const FRAMES = {
  stand: build({}),
  blink: build({ eyes: "closed" }),
  stepA: build({ legs: "stepA" }),
  stepB: build({ legs: "stepB" }),
  sit: build({ legs: "sit" }),
  sleep: build({ legs: "sit", eyes: "closed" }),
  waveUp: build({ arms: "waveUp", mouth: "open" }),
  waveOut: build({ arms: "waveOut", mouth: "open" }),
  happy: build({ arms: "up", eyes: "happy", mouth: "open" }),
  held: build({ arms: "up", mouth: "open", legs: "stepB" }),
  talk: build({ mouth: "open" }),
  // with her things
  aim: build({ arms: "aim", eyes: "happy" }),
  release: build({ arms: "release", mouth: "open" }),
  water: build({ arms: "water" }),
  read: build({ legs: "sit", eyes: "down", item: "book" }),
  readPage: build({ legs: "sit", eyes: "down", item: "page" }),
};

// draws a frame onto a canvas context, facing left or right
export const drawFrame = (ctx, name, facingLeft) => {
  const grid = FRAMES[name] ?? FRAMES.stand;
  ctx.clearRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);
  ctx.save();
  if (facingLeft) {
    ctx.translate(WIDTH * SCALE, 0);
    ctx.scale(-1, 1);
  }
  grid.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell === ".") return;
      ctx.fillStyle = PALETTE[cell];
      ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    }),
  );
  ctx.restore();
};
