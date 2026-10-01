// arcade bitmap font from aessta/arcadefont.png: 8x8 letters, 16 per row.
// the white-on-black set is recoloured with blend modes (no pixel reading, so it
// also works when index.html is opened straight from disk), and drawn with
// "lighten" so the black around the letters doesn't cover what's underneath.
let fontrows = ["ABCDEFGHIJKLMNO", "PQRSTUVWXYZ!©", '0123456789/-"'];

// characters the sheet doesn't have, drawn the same 8x8 way (1 = pixel)
let fontextras = {
  ".": ["00000000", "00000000", "00000000", "00000000", "00000000", "00011000", "00011000", "00000000"],
  ":": ["00000000", "00011000", "00011000", "00000000", "00000000", "00011000", "00011000", "00000000"],
  "<": ["00000110", "00001100", "00011000", "00110000", "00011000", "00001100", "00000110", "00000000"],
  ">": ["01100000", "00110000", "00011000", "00001100", "00011000", "00110000", "01100000", "00000000"],
  "'": ["00011000", "00011000", "00110000", "00000000", "00000000", "00000000", "00000000", "00000000"],
  "?": ["00111100", "01100110", "00000110", "00001100", "00011000", "00000000", "00011000", "00000000"],
  "+": ["00000000", "00011000", "00011000", "01111110", "00011000", "00011000", "00000000", "00000000"],
};
let fontextrakeys = Object.keys(fontextras);

let fontcache = {}; // colour -> recoloured copy of the letters

let fontsheet = (color) => {
  if (fontcache[color]) return fontcache[color];
  let c = document.createElement("canvas");
  c.width = 128;
  c.height = 32;
  let ctx = c.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 128, 32);
  ctx.drawImage(document.querySelector(".font"), 0, 0, 128, 24, 0, 0, 128, 24);
  ctx.fillStyle = "white";
  fontextrakeys.forEach((ch, i) => {
    fontextras[ch].forEach((line, py) => {
      [...line].forEach((bit, px) => bit === "1" && ctx.fillRect(i * 8 + px, 24 + py, 1, 1));
    });
  });
  ctx.globalCompositeOperation = "multiply"; // white -> colour, black stays black
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 32);
  fontcache[color] = c;
  return c;
};

let glyphspot = (ch) => {
  for (let row = 0; row < fontrows.length; row++) {
    let col = fontrows[row].indexOf(ch);
    if (col >= 0) return { col, row };
  }
  let extra = fontextrakeys.indexOf(ch);
  return extra >= 0 ? { col: extra, row: 3 } : null;
};

// size works like a font size: 10 draws the letters at 1x (8px)
let textwidth = (text, size) => String(text).length * 8 * (size / 10);

let drawtext = (text, x, y, color, size, align) => {
  text = String(text).toUpperCase();
  let scale = size / 10;
  let width = textwidth(text, size);
  let left = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  let top = y - 8 * scale; // y is the baseline, like fillText
  let sheet = fontsheet(color);
  canvasContext.save();
  canvasContext.globalCompositeOperation = "lighten";
  [...text].forEach((ch, i) => {
    let spot = glyphspot(ch);
    if (!spot) return; // spaces and unknown characters are left blank
    canvasContext.drawImage(sheet, spot.col * 8, spot.row * 8, 8, 8, left + i * 8 * scale, top, 8 * scale, 8 * scale);
  });
  canvasContext.restore();
};
