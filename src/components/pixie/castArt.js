// Gourav's and someone special's things (castThings.js), drawn like Pixie's
// (things.js): a grid of letters, one per pixel. Gourav has a desk with a
// monitor, a mug of coffee and an office chair, where he sits with his back
// to you while he codes, a coffee machine to fill his mug at, and a cleaning
// robot; she has an easel she paints on, with Neel, her parakeet, on top.

// ------------------------------------------------------------ Gourav

export const DESK_W = 44;
export const DESK_H = 35;

export const DESK_PALETTE = {
  K: "#1b1424", // outline
  D: "#9a6a44", // wood
  d: "#6e4a2e", // wood shade
  L: "#c9ced6", // monitor stand
  l: "#8d94a0", // monitor stand shade
  B: "#1e2a44", // monitor screen
  W: "#f4f1e8", // mug
  R: "#e8434f", // mug stripe
  A: "#434a5c", // chair
  a: "#2c3140", // chair shade
  F: "#f4f1e8", // his trainers, under the chair
};

// the desk and its monitor, up on a tall stand so his code shows over his
// head; castThings.js writes the code onto the screen, and puts his mug on
const pad = (n) => ".".repeat(n);
export const DESK = [
  pad(9) + "K".repeat(26) + pad(9),
  ...Array.from({ length: 13 }, () => pad(9) + "K" + "B".repeat(24) + "K" + pad(9)),
  pad(9) + "K".repeat(26) + pad(9),
  ...Array.from({ length: 7 }, () => pad(20) + "KllK" + pad(20)),
  pad(16) + "KLLLLLLLLLLK" + pad(16),
  "K" + "D".repeat(42) + "K",
  "K" + "d".repeat(42) + "K",
  ...Array.from({ length: 9 }, () => ".KdK" + pad(36) + "KdK."),
  ".KKK" + pad(36) + "KKK.",
];

// his office chair from behind, drawn over him when he sits: the back comes
// up to his shoulder blades, and his trainers peep out under the seat
export const CHAIR_AT = { x: 11, y: 22 };
export const CHAIR = [
  "....KKKKKKKKKKKKKK....",
  "...KAAAAAAAAAAAAAAK...",
  "...KAaAAAAAAAAAAaAK...",
  "...KAAAAAAAAAAAAAAK...",
  "...KaAAAAAAAAAAAAaK...",
  "....KKKKKKKKKKKKKK....",
  "..KaaaaaaaaaaaaaaaaK..",
  "..KKKKKKKKKKKKKKKKKK..",
  ".KFFK....KllK....KFFK.",
  "........KllK..........",
  "........KllK..........",
  "...KKKKKKKKKKKKKKKK...",
  "..KK.....KK.....KK....",
];

// where the code goes: { x, y, w, h } in art pixels
export const SCREEN = { x: 10, y: 1, w: 24, h: 13 };
// the colours of the code he types
export const CODE_COLOURS = ["#7bdc8a", "#6fb6ff", "#d08bff", "#ffd166", "#ff9f6f", "#e6e9f0"];
// his coffee mug (DESK_PALETTE), and where it stands on the desk; for
// clicks, the mug is from MUG_X to the right edge
export const MUG = ["KKKKK..", "KWWWKK.", "KRRRK.K", "KWWWKK.", "KKKKK.."];
export const MUG_AT = { x: 35, y: 18 };
export const MUG_X = 35;
// steam rising off his coffee, two puffs that take turns
export const STEAM = [
  [
    [36, 17],
    [37, 16],
    [36, 15],
    [37, 14],
  ],
  [
    [37, 17],
    [36, 16],
    [37, 15],
    [38, 14],
  ],
];

// Gourav in his chair, from behind (his colours: GOURAV_PALETTE): his hair
// and ears, the red scarf with its end over his shoulder, the hood of his
// blue hoodie, and his arms out to the desk
export const SEATED_AT = { x: 11, y: 6 };
export const SEATED_W = 22;
export const SEATED_H = 21;
const SEATED = [
  "........KKKKKK........",
  "......KKHHHHHHKK......",
  ".....KHHHhhHHHHHK.....",
  "....KHHHhHHHHHHHHK....",
  "....KHHHHHHHHHHHHK....",
  "....KHHHHHHHHHHHHK....",
  "...KSKHHHHHHHHHHKSK...",
  "...KSKHHHHHHHHHHKSK...",
  "....KHHHHHHHHHHHHK....",
  ".....KHHHHHHHHHHK.....",
  "......KKSSSSSSKK......",
  ".....KCCCCCCCCCCK.....",
  "...KKCCCCCCCCCCCCKK...",
  "..KJJCcjjjjjjjjJJJJK..",
  ".KJJJCcjJJJJJJjJJJJJK.",
  ".KJJJCcJjJJJJjJJJJJJK.",
  ".KJJJJcJJjjjjJJJJJJJK.",
  "...KJJJJJJJJJJJJJJK...",
  "...KJJJJJJJJJJJJJJK...",
  "...KjjjjjjjjjjjjjjK...",
  "...KKKKKKKKKKKKKKKK...",
];

// looking sideways to talk: his head turns, and you see his face side on
// (eye, nose and smile), with his ear in the middle of his head
const SIDEWAYS = {
  4: "....KHHHHHHHHHHSSK....",
  5: "....KHHHHHHHHHSSSK....",
  6: "....KHHHHKSKHHSESSK...",
  7: "....KHHHHKSKHSSSSSSK..",
  8: "....KHHHHHHHHSSSSSK...",
  9: ".....KHHHHHHHSSMSK....",
  10: "......KKSSSSSSSSK.....",
};

// his arms, out to the keyboard, going up and down as he types: the top row
// of [left arm, right arm]
const ARMS = { a: [16, 17], b: [17, 16], sip: [16, null] };
const ARM = ["KJJK", "KJJK", "KjjK", "KKKK"];
// his right arm raised, the mug at his lips (castThings.js draws the mug at
// SIP_MUG_AT, beside his head)
const SIP_ARM = ["KSSK", "KJJK", "KJJK", "KJJK", "KJJK", "KJJK"];
export const SIP_MUG_AT = { x: 18, y: 5 };

const seated = (arms, sideways) => {
  const grid = SEATED.map((row, y) => [...((sideways && SIDEWAYS[y]) || row)]);
  const [left, right] = ARMS[arms];
  ARM.forEach((text, i) =>
    [...text].forEach((c, j) => {
      grid[left + i][j] = c;
      if (right !== null) grid[right + i][SEATED_W - 4 + j] = c;
    }),
  );
  if (right === null) SIP_ARM.forEach((text, i) => [...text].forEach((c, j) => (grid[10 + i][SEATED_W - 4 + j] = c)));
  return grid;
};

export const SEATED_FRAMES = {
  a: seated("a", false),
  b: seated("b", false),
  aTurn: seated("a", true),
  bTurn: seated("b", true),
  sip: seated("sip", false),
};

// his coffee machine, on a little cupboard: he puts his mug under the spout
// and it fills
export const COFFEE_W = 16;
export const COFFEE_H = 29;
export const COFFEE_PALETTE = {
  ...DESK_PALETTE,
  M: "#2d3142", // machine
  m: "#555b6e", // machine panel
  P: "#ff4d4d", // power light
  G: "#4ade80", // ready light
  C: "#6b4226", // coffee
};
export const COFFEE = [
  "..KKKKKKKKKKKK..",
  "..KMMMMMMMMMMK..",
  "..KMmmmmmmmmMK..",
  "..KMmPmmmGmmMK..",
  "..KMmmmmmmmmMK..",
  "..KMMMMMMMMMMK..",
  "..KKKKKKKKMMMK..",
  "....KK....KMMK..",
  "..........KMMK..",
  "..........KMMK..",
  "..........KMMK..",
  "..........KMMK..",
  "..........KMMK..",
  "..........KMMK..",
  "..KKKKKKKKKMMK..",
  "..KmmmmmmmmMMK..",
  "..KKKKKKKKKKKK..",
  "KDDDDDDDDDDDDDDK",
  "KddddddddddddddK",
  ".KDDDDDDDDDDDDK.",
  ".KDKKKKKKKKKKDK.",
  ".KDKDDDDDDDDKDK.",
  ".KDKDDDDDKDDKDK.",
  ".KDKDDDDDDDDKDK.",
  ".KDKDDDDDDDDKDK.",
  ".KDKKKKKKKKKKDK.",
  ".KDDDDDDDDDDDDK.",
  ".KddddddddddddK.",
  ".KKK........KKK.",
];
// where his mug goes under the spout, and the coffee pours from
export const COFFEE_MUG_AT = { x: 3, y: 9 };
export const SPOUT = { x: 4, y: 8 };

// his bookshelf (castThings.js): three shelves of books in every colour, a
// little plant, and a stack lying down. Clicking it opens Gourav's Book; he
// takes the purple book from the right of the top shelf to read (SHELF_GAP is
// where it was).
export const SHELF_W = 22;
export const SHELF_H = 32;
export const SHELF_GAP = { x: 14, y: 3, w: 2, h: 7 };
export const SHELF_PALETTE = {
  K: "#1b1424", // outline
  D: "#9a6a44", // wood
  d: "#6e4a2e", // wood shade
  k: "#3b2a1e", // the back of the shelves
  R: "#e8434f",
  B: "#3b82f6",
  G: "#22c55e",
  Y: "#facc15",
  P: "#a855f7",
  O: "#fb923c",
  T: "#14b8a6",
  W: "#f4f1e8",
  g: "#15803d", // leaves
  o: "#c2410c", // the plant's pot
};
// each shelf's books, left to right: [colour, width, height], or a gap
const SHELVES = [
  { top: 3, books: [["R", 2, 7], ["B", 2, 6], ["Y", 1, 7], ["G", 2, 5], ["T", 2, 7], ["O", 2, 6], ["gap", 1], ["P", 2, 7], ["W", 2, 5], ["R", 1, 6]] },
  { top: 12, books: [["B", 2, 6], ["W", 2, 7], ["O", 2, 5], ["gap", 2], ["plant"], ["gap", 2], ["P", 2, 6]] },
  { top: 21, books: [["G", 2, 7], ["R", 2, 6], ["T", 2, 7], ["Y", 2, 5], ["gap", 1], ["stack"]] },
];
export const SHELF = (() => {
  const grid = Array.from({ length: SHELF_H }, () => Array(SHELF_W).fill("."));
  const set = (x, y, c) => {
    if (grid[y]?.[x] !== undefined) grid[y][x] = c;
  };
  for (let y = 0; y < 31; y++) {
    for (let x = 0; x < SHELF_W; x++) {
      const edge = x === 0 || x === SHELF_W - 1 || y === 0 || y === 30;
      const board = [1, 10, 19, 28].includes(y);
      const shade = [2, 11, 20, 29].includes(y);
      set(x, y, edge ? "K" : x === 1 || x === SHELF_W - 2 || board ? "D" : shade ? "d" : "k");
    }
  }
  // its feet
  [1, 2, SHELF_W - 3, SHELF_W - 2].forEach((x) => set(x, 31, "K"));

  SHELVES.forEach(({ top, books }) => {
    const bottom = top + 6; // the shelf they stand on is just below
    let x = 2;
    books.forEach(([kind, width = 0, height = 0]) => {
      if (kind === "gap") {
        x += width;
        return;
      }
      if (kind === "plant") {
        // a pot, and leaves above it
        [[x, bottom], [x + 1, bottom], [x + 2, bottom], [x, bottom - 1], [x + 1, bottom - 1], [x + 2, bottom - 1]].forEach(([px, py]) => set(px, py, "o"));
        [[x + 1, bottom - 2], [x, bottom - 3], [x + 2, bottom - 3], [x + 1, bottom - 4], [x - 1, bottom - 4], [x + 3, bottom - 4], [x + 1, bottom - 3]].forEach(([px, py]) => set(px, py, "g"));
        x += 3;
        return;
      }
      if (kind === "stack") {
        // books lying down, one on another
        ["P", "B", "O"].forEach((colour, i) => {
          for (let px = x; px < x + 5 - (i % 2); px++) {
            set(px, bottom - i * 2, colour);
            set(px, bottom - i * 2 - 1, colour);
          }
        });
        x += 5;
        return;
      }
      for (let dx = 0; dx < width; dx++) {
        for (let h = 0; h < height; h++) set(x + dx, bottom - h, kind);
        // a band across the spine
        if (height > 5) set(x + dx, bottom - height + 2, kind === "Y" ? "O" : "Y");
      }
      x += width;
    });
  });
  return grid.map((row) => row.join(""));
})();

// his cleaning robot (castThings.js): a little dome on wheels, with a visor
// and two glowing eyes, a light on its antenna, and a brush at the front that
// spins as it sweeps up the dust. Faces right.
export const ROBOT_W = 16;
export const ROBOT_H = 12;
export const ROBOT_PALETTE = {
  K: "#1b1424", // outline
  W: "#e5e7eb", // shell
  w: "#9ca3af", // shell shade
  V: "#1e293b", // visor
  E: "#22d3ee", // eyes
  B: "#3b82f6", // bumper
  A: "#4ade80", // antenna light
  a: "#166534", // antenna light, off
  g: "#6b7280", // wheels
  b: "#fbbf24", // brush
};
const ROBOT = [
  ".......K........",
  ".......A........",
  ".....KKKKK......",
  "...KKWWWWWKK....",
  "..KWWVVVVVWWK...",
  "..KWVVVEVVEWK...",
  ".KWWWVVVVVWWWK..",
  ".KBBBBBBBBBBBK..",
  ".KWWWWWWWWWWwK..",
  "..KKKKKKKKKKK...",
  "...KgK...KgK....",
  "....K.....K.....",
];
// its frames: wheels turning (a, b), eyes shut for a blink, the light off,
// and the brush's two turns
const robot = ({ wheels = "a", blink = false, light = true, brush = 0 }) => {
  const grid = ROBOT.map((row) => [...row]);
  if (wheels === "b") {
    grid[10][4] = "K";
    grid[10][3] = "g";
    grid[10][5] = "g";
    grid[10][10] = "K";
    grid[10][9] = "g";
    grid[10][11] = "g";
  }
  if (blink) grid[5] = grid[5].map((c) => (c === "E" ? "V" : c));
  if (!light) grid[1][7] = "a";
  // the brush, under its nose
  const bristles = brush ? [[14, 9], [14, 11]] : [[14, 10], [15, 10]];
  bristles.forEach(([x, y]) => (grid[y][x] = "b"));
  grid[9][13] = "K";
  return grid;
};
export const ROBOT_FRAMES = Object.fromEntries(
  ["a", "b"].flatMap((wheels) =>
    [0, 1].flatMap((brush) => [
      [`${wheels}${brush}`, robot({ wheels, brush })],
      [`${wheels}${brush}-blink`, robot({ wheels, brush, blink: true })],
      [`${wheels}${brush}-off`, robot({ wheels, brush, light: false })],
    ]),
  ),
);

// a little pile of dust on the floor, for the robot to sweep up
export const DUST_W = 7;
export const DUST_H = 3;
export const DUST_PALETTE = { d: "#a8a29e", D: "#78716c" };
export const DUST = ["..ddd..", ".dDdDd.", "dDdDdDd"];

// ------------------------------------------------------------ someone special

export const EASEL_W = 22;
export const EASEL_H = 32;

export const EASEL_PALETTE = {
  K: "#1b1424",
  D: "#b07a4a", // wood
  d: "#7f5530", // wood shade
  W: "#fbf8f1", // the canvas
};

export const EASEL = [
  ".........KDDK.........",
  ".........KDDK.........",
  "..KKKKKKKKKKKKKKKKKK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KWWWWWWWWWWWWWWWWK..",
  "..KKKKKKKKKKKKKKKKKK..",
  ".KDDDDDDDDDDDDDDDDDDK.",
  ".KddddddddddddddddddK.",
  "...KDK...KDDK...KDK...",
  "...KDK...KDDK...KDK...",
  "..KDK....KDDK....KDK..",
  "..KDK....KDDK....KDK..",
  "..KDK....KDDK....KDK..",
  ".KDK.....KDDK.....KDK.",
  ".KDK.....KDDK.....KDK.",
  ".KDK.....KDDK.....KDK.",
  "KDK......KDDK......KDK",
  "KDK......KDDK......KDK",
  "KDK......KDDK......KDK",
  "KDK......KDDK......KDK",
  "KKK......KKKK......KKK",
];

// where her picture goes on the canvas
export const PAINT_AT = { x: 5, y: 4 };

export const PAINT_PALETTE = {
  K: "#1b1424",
  R: "#e63946",
  P: "#ff8fab",
  G: "#3fa34d",
  Y: "#ffd166",
  O: "#ff9f1c",
  B: "#4cc9f0",
};

// what she paints, one after another (12 × 10)
export const PAINTINGS = {
  flower: [
    "....PPPP....",
    "...PPYYPP...",
    "...PPYYPP...",
    "....PPPP....",
    ".....GG.....",
    "..GG.GG.....",
    "...GGGG.....",
    ".....GG.GG..",
    ".....GGGG...",
    ".....GG.....",
  ],
  heart: [
    "..RR....RR..",
    ".RRRR..RRRR.",
    "RRPRRRRRRRRR",
    "RRRRRRRRRRRR",
    ".RRRRRRRRRR.",
    "..RRRRRRRR..",
    "...RRRRRR...",
    "....RRRR....",
    ".....RR.....",
    "............",
  ],
  sun: [
    "Y....Y....Y.",
    ".Y...Y...Y..",
    "...OOOOO....",
    "..OOYYYOO...",
    "YYOYYYYYOYY.",
    "..OOYYYOO...",
    "...OOOOO....",
    ".Y...Y...Y..",
    "Y....Y....Y.",
    "............",
  ],
  // Neel, her parakeet, on a branch
  bird: [
    "............",
    ".....BBB....",
    "....BBKBR...",
    "....BBBBRR..",
    "..BBBBBB....",
    ".BBBBBBB....",
    "BBBBBBB.....",
    "...BB.......",
    "..BB........",
    "GGGGGGGGGGGG",
  ],
};


// ------------------------------------------------------------ her parakeet

// Neel, her blue rose-ringed parakeet, who perches on her easel and flies
// out and back now and then: perched facing right, with a red
// hooked beak, a black ring round the neck and a long tail. The art sits two
// pixels in from each side, so the wings have room to flap.
export const BIRD_W = 16;
export const BIRD_H = 20;
export const BIRD_PALETTE = {
  K: "#1b1424", // outline, and the ring round his neck
  B: "#6ec6ff", // sky-blue feathers
  b: "#3a8fd6", // wing and tail feathers
  L: "#c4ecff", // pale chest and cheek
  R: "#e8434f", // beak
  r: "#a8202f", // beak shade
  W: "#f4f1e8", // the ring round his eye
  E: "#1b1424", // eye
  g: "#8d94a0", // feet
};

const BIRD = [
  "....KKKK....",
  "...KBBBBK...",
  "..KBBBWEBK..",
  "..KBBBBBBRK.",
  "..KBBBBLKRRK",
  "..KBBBLLKKrK",
  "..KKKKKKK.K.",
  "..KBBBBBLK..",
  ".KBBBBBBLLK.",
  ".KBbBBbBLLK.",
  ".KBBbbBBLLK.",
  ".KBBBbBBLLK.",
  "..KBBbBBLK..",
  "..KgKKKKgK..",
  "....KbbK....",
  "....KbBK....",
  "....KbBK....",
  ".....KbK....",
  ".....KbK....",
  "......K.....",
];

// his wings, flapping: up over his back, then down
const WINGS = {
  up: [
    [1, 3, "KK"],
    [0, 4, "KbK"],
    [0, 5, "KbBK"],
    [1, 6, "KbBK"],
    [2, 7, "KbB"],
  ],
  down: [
    [2, 9, "KbB"],
    [1, 10, "KbBK"],
    [0, 11, "KbBK"],
    [0, 12, "KbK"],
    [1, 13, "KK"],
  ],
};

const HEAD_ROWS = 7; // his head and neck ring, which bob when he dances

const bird = ({ wings, blink = false, bob = false }) => {
  const grid = Array.from({ length: BIRD_H }, () => Array(BIRD_W).fill("."));
  BIRD.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === ".") return;
      // dancing: his head bobs down and forward, onto his shoulders
      const head = bob && y < HEAD_ROWS;
      grid[y + (head ? 1 : 0)][x + 2 + (head ? 1 : 0)] = blink && c === "E" ? "B" : c;
    }),
  );
  (WINGS[wings] ?? []).forEach(([x, y, text]) =>
    [...text].forEach((c, i) => {
      if (c !== ".") grid[y][x + i] = c;
    }),
  );
  return grid;
};

export const BIRD_FRAMES = {
  perch: bird({}),
  blink: bird({ blink: true }),
  flapUp: bird({ wings: "up" }),
  flapDown: bird({ wings: "down" }),
  // dancing to the Music app
  bob: bird({ bob: true }),
  bobFlap: bird({ bob: true, wings: "up" }),
};
// where his feet are, from the top of his picture
export const BIRD_FEET = 13;

// her park corner (castThings.js): a wooden park bench on iron legs, where
// she sits now and then (and Gourav comes to sit with her), and a little tree
// in blossom beside it. The bench is drawn at the bottom of a taller picture,
// with whoever sits on it (her.js, gourav.js) drawn in it too.
export const PARK_W = 40;
export const PARK_H = 30;
export const BENCH_TOP = 13; // the row of the picture its back starts on
export const BENCH_PALETTE = {
  K: "#1b1424",
  D: "#c08552", // wood
  d: "#8a5a34", // wood shade
  I: "#3d3a4a", // iron
  i: "#6b6880", // iron shine
};
export const BENCH = [
  "..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..",
  "..KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK..",
  "..KddddddddddddddddddddddddddddddddddK..",
  "..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..",
  "...KiK..........................KiK.....",
  "..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK..",
  "..KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK..",
  "..KddddddddddddddddddddddddddddddddddK..",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
  "KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK",
  "KDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDK",
  "KddddddddddddddddddddddddddddddddddddddK",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
  "..KIiK..........................KIiK....",
  "..KIIK..........................KIIK....",
  "..KIIK..........................KIIK....",
  ".KKKKKK........................KKKKKK...",
];
// where the seat is: the row its top is on, in the picture
export const SEAT_Y = BENCH_TOP + 8;

export const TREE_W = 24;
export const TREE_H = 40;
export const TREE_PALETTE = {
  K: "#1b1424",
  L: "#3fa34d", // leaves
  l: "#2b7a3a", // leaves in shade
  g: "#7ed38a", // leaves in the sun
  P: "#ffafcc", // blossom
  p: "#ff7aa8", // blossom, deeper
  T: "#8a5a34", // trunk
  t: "#5e3c22", // trunk shade
  G: "#3fa34d", // grass at its foot
};
export const TREE = (() => {
  const grid = Array.from({ length: TREE_H }, () => Array(TREE_W).fill("."));
  const set = (x, y, c) => {
    if (grid[y]?.[x] !== undefined) grid[y][x] = c;
  };
  // the trunk, wider at the foot
  for (let y = 18; y < TREE_H - 1; y++) {
    const wide = y > TREE_H - 5 ? 1 : 0;
    for (let x = 10 - wide; x <= 13 + wide; x++) set(x, y, x === 10 - wide || x === 13 + wide ? "K" : x === 12 + wide ? "t" : "T");
  }
  // the leaves: a round crown in three shades, outlined
  const inCrown = (x, y) => ((x - 11.5) / 11) ** 2 + ((y - 11) / 10.5) ** 2 <= 1;
  for (let y = 0; y < 23; y++) {
    for (let x = 0; x < TREE_W; x++) {
      if (!inCrown(x, y)) continue;
      const edge = !inCrown(x - 1, y) || !inCrown(x + 1, y) || !inCrown(x, y - 1) || !inCrown(x, y + 1);
      const light = x + y < 14;
      const dark = x - y > 6 || y > 16;
      set(x, y, edge ? "K" : light ? "g" : dark ? "l" : "L");
    }
  }
  // blossom dotted about it
  [[6, 5], [12, 3], [17, 6], [4, 11], [10, 9], [15, 12], [19, 10], [8, 15], [13, 17], [18, 16], [5, 18]].forEach(([x, y]) => {
    set(x, y, "P");
    set(x + 1, y, "p");
  });
  // a tuft of grass round its foot
  for (let x = 7; x <= 16; x++) set(x, TREE_H - 1, x % 3 ? "G" : "K");
  return grid.map((row) => row.join(""));
})();

// where they sit on the bench (the top left of their art, in the picture):
// her on the left with room beside her, him beside her; and closer, hugging,
// cheek to cheek (he's drawn over her, then their arms over both)
export const PARK_SEATS = {
  her: { x: 0 },
  him: { x: 16 },
  hug: { her: { x: 1 }, him: { x: 15 } },
};
// hugging, the arms that show round each other, in the picture: his hand on
// her far shoulder (his arm's round behind her), and her arm round his waist,
// her bracelet on it
export const HUG_ARMS = {
  his: [
    [7, 16, "KKKK"],
    [7, 17, "KSSSK"],
    [7, 18, "KSSSK"],
    [8, 19, "KKK"],
  ],
  hers: [
    [19, 19, "KRK"],
    [20, 20, "KSSK"],
    [22, 21, "KSSSSSK"],
    [22, 22, "KKKKNSSK"],
  ],
};
