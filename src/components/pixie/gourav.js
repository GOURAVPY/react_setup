// Gourav, the hero of Pixie's story (storyArt.js), drawn the way she is
// (sprites.js): a grid of letters, one per pixel, built from a head, a body
// and legs, with arms posed for each frame. Taller than her, with a red scarf,
// a blue hoodie, and on his chest his half of the half-heart necklace he gave
// someone special (her.js has the other half). Faces right; the story mirrors
// him to face left. He sits with her on her park bench (castArt.js), and they
// hug there.

export const GOURAV_W = 24;
export const GOURAV_H = 30;

export const GOURAV_PALETTE = {
  K: "#1b1424", // outline
  H: "#1f1b2e", // hair
  h: "#3d3656", // hair shine
  S: "#c68b5f", // skin
  E: "#1b1424", // eyes
  W: "#ffffff", // eye shine
  M: "#8c2f39", // open mouth
  C: "#e8434f", // scarf
  c: "#b22f3b", // scarf shade
  J: "#2f6fe0", // hoodie
  j: "#2552a8", // hoodie shade
  Y: "#ffd166", // gold
  N: "#ff9ec0", // his half of the heart
  g: "#b8b8c8", // the lines of a book he reads
  P: "#2b2d42", // trousers
  F: "#f4f1e8", // trainers
  B: "#9d72ff", // the book he gives her
  b: "#6b45d6", // its spine
};

// [x, y, rows]: where each part sits in the frame
const HEAD = [
  5,
  0,
  [
    "....KKKKKK....",
    "..KKHHHHHHKK..",
    ".KHHhhHHHHHHK.",
    "KHHhHHHHHHHHHK",
    "KHHHHHHHHHHHHK",
    "KHHHSHHHHSHHHK",
    "KHSSSSSSSSSSHK",
    "KSSKKSSSSKKSSK",
    "KSSEESSSSEESSK",
    "KSSEWSSSSEWSSK",
    ".KSSSSSSSSSSK.",
    "..KSSSKKSSSK..",
    "...KKSSSSKK...",
  ],
];

const BODY = [
  7,
  13,
  [
    "..KSSSSK..",
    ".KCCCCCCK.",
    "KCCcCCcCCK",
    "KJJCCCCJJK",
    "KJJJCCJJJK",
    "KJJJNNNJJK",
    "KJJJNNJJJK",
    "KJJJNJJJJK",
    "KjjjjjjjjK",
  ],
];

// the end of his scarf, flying out behind him
const SCARF_TAIL = [
  [6, 13, "KCC"],
  [4, 14, "KCCK"],
  [3, 15, "KcK"],
];

// sitting, he's this many rows lower from the waist up
const SIT_DROP = 1;

const LEGS = {
  // sitting on her park bench: knees towards you
  sit: [7, 23, ["KPPPPPPPPK", "KPPPKKPPPK", ".KPPKKPPK.", ".KPPKKPPK.", ".KPPKKPPK.", "KFFFKKFFFK", "KKKKKKKKKK"]],
  stand: [
    7,
    22,
    [
      ".KPPKKPPK.",
      ".KPPKKPPK.",
      ".KPPKKPPK.",
      ".KPPKKPPK.",
      ".KPPKKPPK.",
      ".KPPKKPPK.",
      "KFFFKKFFFK",
      "KKKKKKKKKK",
    ],
  ],
  step: [
    6,
    22,
    [
      "..KPPKKPPK..",
      "..KPPKKPPK..",
      ".KPPK..KPPK.",
      ".KPPK..KPPK.",
      ".KPPK..KPPK.",
      "KPPK....KPPK",
      "KFFK....KFFK",
      "KKKK....KKKK",
    ],
  ],
  // knees up, mid-leap
  jump: [7, 22, [".KPPKKPPK.", "KPPPKKPPPK", "KFFFKKFFFK", "KKKKKKKKKK"]],
};

// arms as [x, y, text] pieces ("." skips a pixel)
const LEFT_ARM = {
  down: [
    [5, 16, "KJ"],
    [5, 17, "KJ"],
    [5, 18, "KJ"],
    [5, 19, "KJ"],
    [5, 20, "KS"],
    [5, 21, "KS"],
    [5, 22, "KK"],
  ],
  up: [
    [5, 16, "KJ"],
    [4, 15, "KJK"],
    [4, 14, "KJK"],
    [3, 13, "KJK"],
    [3, 12, "KJK"],
    [3, 11, "KSK"],
    [3, 10, "KSK"],
    [3, 9, "KKK"],
  ],
  // both hands in front, holding a book open to read (the book is drawn
  // with the right arm)
  read: [
    [5, 16, "KJ"],
    [5, 17, "KJ"],
    [5, 18, "KJSS"],
    [5, 19, "KJSS"],
    [5, 20, "KKK"],
  ],
  // round behind her on the bench, hugging her (castArt.js draws his hand on
  // her far shoulder)
  none: [],
};

const mirror = (pieces) => pieces.map(([x, y, text]) => [GOURAV_W - x - text.length, y, [...text].reverse().join("")]);

const RIGHT_ARM = {
  down: mirror(LEFT_ARM.down),
  up: mirror(LEFT_ARM.up),
  // straight out: a punch
  punch: [
    [17, 15, "KKKKKK"],
    [17, 16, "JJJJSSK"],
    [17, 17, "jjjjSSK"],
    [17, 18, "KKKKKK"],
  ],
  // forward at his waist, typing on the laptop at his desk (castArt.js)
  type: [
    [17, 16, "JK"],
    [17, 17, "JKKKK"],
    [17, 18, "JJJSSK"],
    [17, 19, "jjjSSK"],
    [17, 20, "KKKKKK"],
  ],
  // reading: the other hand, and the open book between them
  read: [
    [16, 18, "SSJK"],
    [16, 19, "SSJK"],
    [17, 20, "KKK"],
    [17, 16, "JK"],
    [17, 17, "JK"],
    [8, 16, "KBBBBBBK"],
    [8, 17, "KWWKKWWK"],
    [8, 18, "KWgKKgWK"],
    [8, 19, "KWWKKgWK"],
    [8, 20, "KbbbbbbK"],
  ],
  // carrying his coffee mug (white, with a red stripe) to the coffee machine
  // and back (castThings.js)
  mug: [
    [17, 16, "JK"],
    [17, 17, "JK"],
    [17, 18, "JJSSK"],
    [17, 19, "jjSSK"],
    [17, 20, "KKKK"],
    [19, 14, "KKKK"],
    [19, 15, "KWWKK"],
    [19, 16, "KCCKK"],
    [19, 17, "KWWKK"],
  ],
  // held out low, with a book standing on his hand
  give: [
    [19, 12, "KKKKK"],
    [19, 13, "KBBBK"],
    [19, 14, "KBYBK"],
    [19, 15, "KBBBK"],
    [19, 16, "KbWWK"],
    [19, 17, "KKKKK"],
    [17, 17, "K"],
    [17, 18, "JJJSSK"],
    [17, 19, "jjjSSK"],
    [17, 20, "KKKKK"],
  ],
};

const POSES = {
  stand: { legs: "stand", left: "down", right: "down" },
  step: { legs: "step", left: "down", right: "down" },
  jump: { legs: "jump", left: "up", right: "up" },
  punch: { legs: "step", left: "down", right: "punch" },
  raise: { legs: "stand", left: "down", right: "up" },
  give: { legs: "stand", left: "down", right: "give" },
  type: { legs: "stand", left: "down", right: "type" },
  mug: { legs: "stand", left: "down", right: "mug" },
  mugStep: { legs: "step", left: "down", right: "mug" },
  // reading a book from his shelf
  read: { legs: "stand", left: "read", right: "read" },
  // on her park bench beside her; and hugging her there, his head on hers,
  // his arm round her
  sit: { legs: "sit", left: "down", right: "down", sit: true },
  hug: { legs: "sit", left: "none", right: "down", sit: true, lean: -1 },
};

// sitting, all of him from the waist up is lower (his legs are drawn where
// they go); leaning, his head tips over to the left
const build = ({ legs, left, right, sit = false, lean = 0 }, talking) => {
  const grid = Array.from({ length: GOURAV_H }, () => Array(GOURAV_W).fill("."));
  const paint = (x, y, text) =>
    [...text].forEach((c, i) => {
      if (c !== "." && grid[y]?.[x + i] !== undefined) grid[y][x + i] = c;
    });
  const part = ([x, y, rows], dx = 0, dy = 0) => rows.forEach((row, i) => paint(x + dx, y + dy + i, row));
  const pieces = (list, dx, dy) => list.forEach(([x, y, text]) => paint(x + dx, y + dy, text));
  const drop = sit ? SIT_DROP : 0;
  const tip = lean ? 1 : 0;

  pieces(SCARF_TAIL, 0, drop);
  part(HEAD, lean, drop + tip);
  part(BODY, 0, drop);
  part(LEGS[legs]);
  pieces(LEFT_ARM[left], 0, drop);
  pieces(RIGHT_ARM[right], 0, drop);
  if (talking) paint(11 + lean, 11 + drop + tip, "MM");
  return grid;
};

// every pose, and the same pose talking ("standTalk", "giveTalk", …)
export const GOURAV_FRAMES = Object.fromEntries(
  Object.entries(POSES).flatMap(([name, pose]) => [
    [name, build(pose, false)],
    [`${name}Talk`, build(pose, true)],
  ]),
);

// the bugs that chase Pixie: chunky beetles with angry red eyes, facing
// right, in two steps
export const BUG_W = 16;
export const BUG_H = 10;

export const BUG_PALETTE = {
  K: "#1b1424",
  V: "#5b2d82", // shell
  v: "#8b5cc4", // shine
  R: "#ff3b3b", // angry eye
  T: "#e6dcef", // pincers
};

const BUG_BODY = [
  "............K...",
  "...KKKKKK..K....",
  "..KVVVVVVKK.....",
  ".KVvvVVVVVKKK...",
  "KVvVVVVVVVKRRK..",
  "KVVVVVVVVVKKKKK.",
  "KVVVVVVVVVKKTTK.",
  ".KVVVVVVVVKKKK..",
  "..KKKKKKKKKK....",
];

export const BUG_FRAMES = {
  stepA: [...BUG_BODY, "..K.K..K.K..K..."].map((row) => [...row]),
  stepB: [...BUG_BODY, ".K.K..K.K..K...."].map((row) => [...row]),
};
