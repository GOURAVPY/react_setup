// The pixel pictures in Gourav's book (Book.jsx): one grid of letters per
// picture, one letter per pixel, coloured from BOOK_PALETTE ("." is empty).
// Gourav and Pixie themselves come from their sprites.

export const BOOK_PALETTE = {
  K: "#2b1b2e", // outline
  W: "#fbf7ee", // white
  L: "#1f2a44", // screen
  G: "#5ccf6c", // green
  B: "#4aa3ff", // blue
  Y: "#ffd166", // gold
  S: "#b9c2d0", // silver
  s: "#6b7385", // dark silver
  O: "#a0623a", // leather
  o: "#7a4526", // dark leather
  R: "#e3463d", // red
  r: "#a8302a", // dark red
  C: "#2b2d42", // cap
  D: "#ff6fa6", // pink
  P: "#9d72ff", // purple
};

export const BOOK_ART = {
  // a laptop with code on the screen
  laptop: [
    "....KKKKKKKKKKKKKKKK....",
    "....KLLLLLLLLLLLLLLK....",
    "....KLGGLLLLLLLLLLLK....",
    "....KLLLBBBBLLLLLLLK....",
    "....KLLLLLLGGGGGLLLK....",
    "....KLLYYYLLLLLLLLLK....",
    "....KLLLLLLLBBBLLLLK....",
    "....KLGGGGLLLLLLLLLK....",
    "....KLLLLLLLLLLLLLLK....",
    "....KKKKKKKKKKKKKKKK....",
    "..KKSSSSSSSSSSSSSSSSKK..",
    ".KSSSSSSSSSSSSSSSSSSSSK.",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
  ],
  // a work briefcase with a gold clasp
  briefcase: [
    "........KKKKKKKK........",
    "........KK....KK........",
    "..KKKKKKKKKKKKKKKKKKKK..",
    "..KOOOOOOOOOOOOOOOOOOK..",
    "..KOOOOOOOOOOOOOOOOOOK..",
    "..KooooooooYYooooooooK..",
    "..KOOOOOOOOYYOOOOOOOOK..",
    "..KOOOOOOOOOOOOOOOOOOK..",
    "..KOOOOOOOOOOOOOOOOOOK..",
    "..KKKKKKKKKKKKKKKKKKKK..",
  ],
  // a London train in front of the city
  train: [
    "..........K.............",
    ".....KK..KKK...KK.......",
    "....KBBK.KBK..KBBK..K...",
    "....KBBK.KBK..KBBK.KBK..",
    "KKKKKKKKKKKKKKKKKKKKKKK.",
    "KRRRRRRRRRRRRRRRRRRRRRKK",
    "KRWWRWWRWWRWWRWWRWWRRRRK",
    "KRWWRWWRWWRWWRWWRWWRRRRK",
    "KRRRRRRRRRRRRRRRRRRRRRRK",
    "KBBBBBBBBBBBBBBBBBBBBBBK",
    "KKKsKKKKKKKKKKKKKKKsKKKK",
    "SSSSSSSSSSSSSSSSSSSSSSSS",
  ],
  // a microphone and a speech bubble
  mic: [
    "...............KKKKKKK..",
    "..............KWWWWWWWK.",
    "....KKKK......KWKWKWKWK.",
    "...KSSSSK.....KWWWWWWWK.",
    "...KSsSSK......KKKWKKK..",
    "...KSSSSK.........K.....",
    "...KSsSSK...............",
    "...KSSSSK...............",
    "..K.KKKK.K..............",
    "..K......K..............",
    "...KK..KK...............",
    ".....KK.................",
    ".....KK.................",
    "...KKKKKK...............",
  ],
  // a résumé and a pen
  document: [
    "..KKKKKKKKKKKK..........",
    "..KWWWWWWWWWWK..........",
    "..KWGGGGGGWWWK.....KK...",
    "..KWWWWWWWWWWK....KYK...",
    "..KWsssssssWWK...KYK....",
    "..KWssssWWWWWK..KYK.....",
    "..KWWWWWWWWWWK.KYK......",
    "..KWssssssssWKKYK.......",
    "..KWsssWWWWWWKYK........",
    "..KWWWWWWWWWWKK.........",
    "..KKKKKKKKKKKK..........",
  ],
  // any other project: a folder
  folder: [
    "..KKKKKK................",
    ".KYYYYYYK...............",
    "KYYYYYYYYKKKKKKKKKKKKKK.",
    "KYYYYYYYYYYYYYYYYYYYYYYK",
    "KYYYYYYYYYYYYYYYYYYYYYYK",
    "KYYYYYYYYYYYYYYYYYYYYYYK",
    "KYYYYYYYYYYYYYYYYYYYYYYK",
    "KYYYYYYYYYYYYYYYYYYYYYYK",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
  ],
  // a red toolbox
  toolbox: [
    "........KKKKKKKK........",
    "........K......K........",
    ".KKKKKKKKKKKKKKKKKKKKKK.",
    ".KRRRRRRRRRRRRRRRRRRRRK.",
    ".KRRRRRRRRYYYRRRRRRRRRK.",
    ".KKKKKKKKKKKKKKKKKKKKKK.",
    ".KrrrrrrrrrrrrrrrrrrrrK.",
    ".KrrrrrrrrrrrrrrrrrrrrK.",
    ".KKKKKKKKKKKKKKKKKKKKKK.",
  ],
  // a graduation cap with its tassel
  cap: [
    "...........KK...........",
    ".........KKCCKK.........",
    ".......KKCCCCCCKK.......",
    ".....KKCCCCCCCCCCKK.....",
    "...KKCCCCCCCCCCCCCCKK...",
    ".....KKCCCCCCCCCCKK..Y..",
    ".......KKCCCCCCKK....Y..",
    "......KCKKKCCKKKCK...Y..",
    "......KCCCCCCCCCCK..YYY.",
    ".......KKKKKKKKKK...YYY.",
  ],
  // the world
  globe: [
    "........KKKKKKKK........",
    "......KKBBBBGGBBKK......",
    ".....KBBBGGGGBBBBBK.....",
    "....KBBGGGGGBBBBGGBK....",
    "....KBBBGGGBBBBGGGBK....",
    "....KBBBBGBBBBBGGBBK....",
    "....KBBBBBBBGGBBBBBK....",
    ".....KBBBBBGGGGBBBK.....",
    "......KKBBBBGGBBKK......",
    "........KKKKKKKK........",
  ],
  // a letter with a heart seal
  envelope: [
    "KKKKKKKKKKKKKKKKKKKKKKKK",
    "KKWWWWWWWWWWWWWWWWWWWWKK",
    "KWKKWWWWWWWWWWWWWWWWKKWK",
    "KWWWKKWWWWWWWWWWWWKKWWWK",
    "KWWWWWKKWWWWWWWWKKWWWWWK",
    "KWWWWWWWKKWDDWKKWWWWWWWK",
    "KWWWWWWWWWKKKKWWWWWWWWWK",
    "KWWWWWWWWWWWWWWWWWWWWWWK",
    "KKKKKKKKKKKKKKKKKKKKKKKK",
  ],
  // the badge on the cover: </>
  emblem: [
    "....KK........KK....",
    "...KYK...KK...KYK...",
    "..KYK...KYK....KYK..",
    ".KYK...KYK......KYK.",
    "KYK....KYK.......KYK",
    ".KYK..KYK.......KYK.",
    "..KYK.KYK......KYK..",
    "...KYKYK......KYK...",
    "....KKK.......KK....",
  ],
};

// which picture goes with a project, by its name
export const projectArt = (name) => {
  if (/city|train|tube|london/i.test(name)) return "train";
  if (/interview|voice/i.test(name)) return "mic";
  if (/resume|résumé|cv/i.test(name)) return "document";
  return "folder";
};
