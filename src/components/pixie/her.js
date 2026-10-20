// "Someone special": a girl about Gourav's age, the visitor's companion if
// they pick her (Companions.jsx), drawn the way Gourav is (gourav.js): long
// black hair, a red dress with gold trim, gold earrings and a gold bangle,
// and Gourav's gifts: a pink bead bracelet, and her half of a half-heart
// necklace (he wears the other half). Faces right; mirrored to face left.
// She sits on her park bench too (castArt.js), and hugs Gourav there.

export const HER_W = 24;
export const HER_H = 30;

export const HER_PALETTE = {
  K: "#1b1424", // outline
  H: "#15111c", // hair
  h: "#3a3150", // hair shine
  S: "#c68b5f", // skin
  E: "#1b1424", // eyes
  W: "#ffffff", // eye shine
  B: "#e88a8a", // blush
  M: "#a8323e", // lips
  O: "#5e1620", // open mouth
  R: "#d62839", // dress
  r: "#9e1b2b", // dress shade
  Y: "#ffd166", // gold: trim, earrings, bangles
  F: "#8a5a3c", // sandals, and her brush
  P: "#4cc9f0", // paint on the brush
  N: "#ff9ec0", // Gourav's gifts: her half of the heart, and her bracelet
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
    "KHHHSSSHSSSHHK",
    "KHHSSSSSSSSHHK",
    "KHSKKSSSSKKSHK",
    "KHSEESSSSEESHK",
    "KHSEWSSSSEWSHK",
    "KHSBSSSSSSBSHK",
    "KHHSSSMMSSSHHK",
    "KHHKSSSSSSKHHK",
  ],
];

// her hair, falling down her back behind her shoulders
const HAIR_BACK = [
  [3, 13, "KHHK"],
  [3, 14, "KHHK"],
  [3, 15, "KHHK"],
  [3, 16, "KHHK"],
  [3, 17, "KHhK"],
  [3, 18, "KHHK"],
  [4, 19, "KHK"],
  [17, 13, "KHHK"],
  [17, 14, "KHHK"],
  [17, 15, "KHHK"],
  [17, 16, "KHHK"],
  [17, 17, "KhHK"],
  [17, 18, "KHHK"],
  [17, 19, "KHK"],
];

const NECKLACE = [
  [10, 16, "NNN"],
  [11, 17, "NN"],
  [12, 18, "N"],
];

const EARRINGS = [
  [4, 11, "Y"],
  [19, 11, "Y"],
];

// the top of her dress
const BODICE = [
  7,
  13,
  ["..KSSSSK..", ".KYSSSSYK.", "KRYYYYYYRK", "KRRRRRRRRK", "KRRrRRrRRK", ".KRRRRRRK."],
];

// sitting, she's this many rows lower from the waist up
const SIT_DROP = 3;

// her long skirt, still or swishing as she walks, or over her knees as she
// sits, her ankles showing
const SKIRT = {
  sit: [
    5,
    22,
    [
      "..KRRRRRRRRK..",
      ".KRRRrRRrRRRK.",
      "KRRRRRRRRRRRRK",
      "KYYYYYYYYYYYYK",
      "KKKKKKKKKKKKKK",
      "....KSK.KSK...",
      "....KSK.KSK...",
      "...KFFK.KFFK..",
    ],
  ],
  stand: [
    5,
    19,
    [
      "..KRRRRRRRRK..",
      "..KRRRRRRRRK..",
      ".KRRRrRRrRRRK.",
      ".KRRRRRRRRRRK.",
      "KRRRRRRRRRRRRK",
      "KRrRRRRRRRRrRK",
      "KYYYYYYYYYYYYK",
      "KKKKKKKKKKKKKK",
      "....KFK.KFK...",
      "...KFFK.KFFK..",
    ],
  ],
  step: [
    5,
    19,
    [
      "..KRRRRRRRRK..",
      "..KRRRRRRRRRK.",
      ".KRRRrRRrRRRK.",
      ".KRRRRRRRRRRRK",
      "KRRRRRRRRRRRRK",
      "KRrRRRRRRRRRrK",
      "KYYYYYYYYYYYYK",
      "KKKKKKKKKKKKKK",
      "...KFK...KFK..",
      "..KFFK...KFFK.",
    ],
  ],
};

const LEFT_ARM = {
  down: [
    [5, 15, "KR"],
    [5, 16, "KR"],
    [5, 17, "KS"],
    [5, 18, "KS"],
    [5, 19, "KN"],
    [5, 20, "KS"],
    [5, 21, "KK"],
  ],
  // out past her hair, so the wave shows
  up: [
    [5, 15, "KR"],
    [3, 14, "KRK"],
    [2, 13, "KSK"],
    [1, 12, "KSK"],
    [1, 11, "KNK"],
    [1, 10, "KSK"],
    [1, 9, "KSK"],
    [1, 8, "KKK"],
  ],
  // dancing: straight out to the side…
  out: [
    [1, 14, "KKKKKK"],
    [0, 15, "KSSRRR"],
    [0, 16, "KSNrRR"],
    [1, 17, "KKKKKK"],
  ],
  // …and in, to clap at her chest
  clap: [
    [6, 15, "KK"],
    [6, 16, "KRRSSK"],
    [7, 17, "KKKKK"],
  ],
  // round behind Gourav, hugging him (castArt.js draws her hand on his far side)
  none: [],
};

const mirror = (pieces) => pieces.map(([x, y, text]) => [HER_W - x - text.length, y, [...text].reverse().join("")]);

const RIGHT_ARM = {
  down: mirror(LEFT_ARM.down),
  up: mirror(LEFT_ARM.up),
  out: mirror(LEFT_ARM.out),
  clap: mirror(LEFT_ARM.clap),
  none: [],
  // held out at the easel (castArt.js), with a brush
  paint: [
    [17, 12, "KKKK"],
    [17, 13, "RRSSK"],
    [17, 14, "rRSSK"],
    [17, 15, "KKKKK"],
    [21, 12, "F"],
    [22, 11, "F"],
    [23, 10, "P"],
  ],
};

const POSES = {
  stand: { skirt: "stand", left: "down", right: "down" },
  step: { skirt: "step", left: "down", right: "down" },
  // waving
  raise: { skirt: "stand", left: "down", right: "up" },
  // a happy little jump, both hands up
  jump: { skirt: "stand", left: "up", right: "up" },
  paint: { skirt: "stand", left: "down", right: "paint" },
  // her dance (cast.js): arms wide, a clap, and a twirl with her skirt swishing
  out: { skirt: "step", left: "out", right: "out" },
  clap: { skirt: "stand", left: "clap", right: "clap" },
  twirl: { skirt: "step", left: "up", right: "down" },
  // on her park bench, her hands in her lap; and hugging Gourav there, her
  // head on his shoulder, her arm round him
  sit: { skirt: "sit", left: "down", right: "down", sit: true },
  hug: { skirt: "sit", left: "down", right: "none", sit: true, lean: 1 },
};

// sitting, all of her from the waist up is lower (her skirt is drawn where
// it goes); leaning, her head tips over to the right
const build = ({ skirt, left, right, sit = false, lean = 0 }, talking) => {
  const grid = Array.from({ length: HER_H }, () => Array(HER_W).fill("."));
  const paint = (x, y, text) =>
    [...text].forEach((c, i) => {
      if (c !== "." && grid[y]?.[x + i] !== undefined) grid[y][x + i] = c;
    });
  const part = ([x, y, rows], dx = 0, dy = 0) => rows.forEach((row, i) => paint(x + dx, y + dy + i, row));
  const pieces = (list, dx, dy) => list.forEach(([x, y, text]) => paint(x + dx, y + dy, text));
  const drop = sit ? SIT_DROP : 0;
  const tip = lean ? 1 : 0;

  pieces(HAIR_BACK, lean, drop);
  part(SKIRT[skirt]);
  part(BODICE, 0, drop);
  part(HEAD, lean, drop + tip);
  pieces(NECKLACE, 0, drop);
  pieces(EARRINGS, lean, drop + tip);
  pieces(LEFT_ARM[left], 0, drop);
  pieces(RIGHT_ARM[right], 0, drop);
  if (talking) paint(11 + lean, 11 + drop + tip, "OO");
  return grid;
};

// every pose, and the same pose talking ("standTalk", "raiseTalk", …)
export const HER_FRAMES = Object.fromEntries(
  Object.entries(POSES).flatMap(([name, pose]) => [
    [name, build(pose, false)],
    [`${name}Talk`, build(pose, true)],
  ]),
);
