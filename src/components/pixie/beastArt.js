// Chompy, Pixie's plant beast (beast.js), as pixel art, after the monster
// plant Gourav picked: a pale bulb of a head with ridges and no eyes, a big
// purple mouth under it, a collar of pointed pink-edged leaves around it and
// long drooping leaves spilling over a clay pot. Built from pieces like Pixie
// herself (sprites.js), so his mouth, his leaves and how grown he is can each
// change on their own.
//
// The pieces are drawn on a 24 × 28 design and placed on a canvas with room
// on the left for a leaf held out to shake hands.

export const BEAST_W = 32; // canvas, in art pixels
export const BEAST_H = 30;
export const BODY_X = 8; // where the 24-wide design starts on the canvas
const TOP = 2; // rows above the design, for his head to bob and lean

// [x, y, text] in design coordinates; "." skips a pixel
const rows = (x, y, list) => list.map((text, i) => [x, y + i, text]);

// the bulb: pale, with ridges running down it, and no eyes at all
const BULB = rows(0, 0, [
  "........KKKKKKKK........",
  "......KKVVvVVvVVKK......",
  ".....KVVvVVvVVvVVVK.....",
  "....KVVVvVVvVVvVVVVK....",
  "....KVVVvVVvVVvVVVVK....",
  "....KVVVvVVvVVvVVVVK....",
  "....KVVVvVVvVVvVVVVK....",
  ".....KVVvVVvVVvVVVK.....",
]);

// the mouth under it: purple lips, shut…
const MOUTH_SHUT = rows(0, 8, [
  "....KqqKKKKKKKKKKqqK....",
  "....KqqqqqqqqqqqqqqK....",
  ".....KqqQQQQQQQQqqK.....",
  "......KKqqqqqqqqKK......",
  "........KKKKKKKK........",
]);

// …and wide open, with teeth
const MOUTH_OPEN = rows(0, 8, [
  "....KqKWKWKWKWKWKWqK....",
  "....KqQQQQQQQQQQQQqK....",
  ".....KQQDDDDDDDDQQK.....",
  "......KKQQQQQQQQKK......",
  "........KKKKKKKK........",
]);

// pink cheeks on the bulb, while he's petted
const BLUSH = [
  [5, 5, "rr"],
  [17, 5, "rr"],
];

const STEM = rows(10, 13, ["KggK", "KggK", "KggK", "KggK", "KggK", "KggK"]);

const POT = rows(0, 19, [
  "....KKKKkkkkkkkkKKKK....",
  "....KKKKKKKKKKKKKKKK....",
  "....KTTTTTTTTTTTTTTK....",
  "....KttttttttttttttK....",
  ".....KTTTTTTTTTTTTK.....",
  ".....KTTTTTTTTTTTTK.....",
  "......KTTTTTTTTTTK......",
  "......KttttttttttK......",
  ".......KKKKKKKKKK.......",
]);

const mirror = (pieces) => pieces.map(([x, y, text]) => [24 - x - text.length, y, [...text].reverse().join("")]);

// the leaves spilling down over his pot: little ones while he's a baby
const DROOP_SMALL = [
  [5, 16, "KK"],
  [4, 17, "KrGK"],
  [5, 18, "KKGGKK"],
];
const DROOP = [
  [3, 13, "KK"],
  [1, 14, "KrGK"],
  [0, 15, "KrGGGK"],
  [0, 16, "KrGGGGKK"],
  [1, 17, "KKrGGGGK"],
  [3, 18, "KKrrGGKK"],
];

// the left leaf held out to shake Pixie's hand, with its leafy fingers
const LEAF_SHAKE = [
  [-7, 14, "K.K"],
  [-8, 15, "KGKGKKKKKKKK"],
  [-8, 16, "KGGGGGrrrrrGGKK"],
  [-7, 17, ".KGGGGGGGGGGGGGKK"],
  [-5, 18, "KKKKKKKKKKKKKKK"],
];

// pointed leaves around his head: a lower ring once he's leafy, an upper
// ring when he's fully grown
const COLLAR_LOW = [
  [1, 9, "KK"],
  [0, 10, "KrGK"],
  [1, 11, "KrGGK"],
  [3, 12, "KKrGK"],
];
const COLLAR_HIGH = [
  [0, 2, "K"],
  [0, 3, "KrK"],
  [1, 4, "KrGK"],
  [2, 5, "KrGK"],
  [3, 6, "KK"],
];

/**
 * His picture as a grid of letters for the canvas.
 * @param stage   how grown he is: 0 baby, 1 small, 2 leafy, 3 fully grown
 * @param lean    -1, 0 or 1: his head leans toward the pointer
 * @param mouth   "shut" or "open"
 * @param shake   null, or 0 / 1: the left leaf held out, up or down
 * @param blush   pink cheeks (being petted)
 * @param bob     0 or 1: his head bobs a pixel
 */
export const beastGrid = ({ stage, lean, mouth, shake, blush, bob }) => {
  const grid = Array.from({ length: BEAST_H }, () => Array(BEAST_W).fill("."));
  const paint = (pieces, dx = 0, dy = 0) =>
    pieces.forEach(([x, y, text]) =>
      [...text].forEach((c, i) => {
        const row = grid[y + TOP + dy];
        const col = x + BODY_X + dx + i;
        if (c !== "." && row?.[col] !== undefined) row[col] = c;
      }),
    );

  const droop = stage === 0 ? DROOP_SMALL : DROOP;
  paint(POT);
  paint(STEM);
  paint(mirror(droop));
  if (shake === null) paint(droop);
  else paint(LEAF_SHAKE, 0, shake + 1); // a pixel lower, level with her hand
  if (stage >= 2) {
    paint(COLLAR_LOW, lean, bob);
    paint(mirror(COLLAR_LOW), lean, bob);
  }
  if (stage >= 3) {
    paint(COLLAR_HIGH, lean, bob);
    paint(mirror(COLLAR_HIGH), lean, bob);
  }
  paint(BULB, lean, bob);
  paint(mouth === "open" ? MOUTH_OPEN : MOUTH_SHUT, lean, bob);
  if (blush) paint(BLUSH, lean, bob);
  return grid;
};

// where his mouth and head are, and the tip of his handshake leaf, in art
// pixels on the canvas
export const MOUTH_AT = { x: BODY_X + 12, y: TOP + 10 };
export const HEAD_AT = { x: BODY_X + 12, y: TOP + 5 };
export const HAND_AT = { x: 1, y: TOP + 17 };

export const STAGE_NAMES = ["baby", "small", "leafy", "fully grown"];
