// top-10 table with 3-letter initials, kept in the browser
let topscores = [];
try {
  topscores = JSON.parse(localStorage.getItem("pacmantopscores")) || [];
} catch (e) {}

let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let entry = { letters: [0, 0, 0], pos: 0 };
let newestscore = null; // the row to highlight after entering initials

let qualifies = (points) =>
  points > 0 && (topscores.length < 10 || points > topscores[topscores.length - 1].score);

let addscore = (name, points, lvl) => {
  newestscore = { name, score: points, level: lvl };
  topscores.push(newestscore);
  topscores.sort((a, b) => b.score - a.score);
  topscores = topscores.slice(0, 10);
  try {
    localStorage.setItem("pacmantopscores", JSON.stringify(topscores));
  } catch (e) {}
};

let startinitials = () => {
  entry = { letters: [0, 0, 0], pos: 0 };
  setstate("initials", 0);
};

let initialskey = (key) => {
  let k = key.length === 1 ? key.toUpperCase() : key;
  let l = entry.letters;
  if (k === "ArrowUp") l[entry.pos] = (l[entry.pos] + 1) % 26;
  else if (k === "ArrowDown") l[entry.pos] = (l[entry.pos] + 25) % 26;
  else if (k === "ArrowLeft" || k === "Backspace") entry.pos = Math.max(entry.pos - 1, 0);
  else if (k === "ArrowRight") entry.pos = Math.min(entry.pos + 1, 2);
  else if (letters.includes(k) && k.length === 1) {
    l[entry.pos] = letters.indexOf(k);
    if (entry.pos < 2) entry.pos++;
  } else if (k === "Enter") {
    if (entry.pos < 2) return entry.pos++;
    addscore(l.map((i) => letters[i]).join(""), score, level);
    openmenu("scores");
  }
};

let drawinitials = () => {
  let middle = canvas.width / 2;
  creatmove(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.8)");
  writetext("NEW HIGH SCORE!", middle, 150, "yellow", 26, "center");
  writetext(String(score), middle, 190, "white", 22, "center");
  writetext("ENTER YOUR INITIALS", middle, 240, "white", 15, "center");
  entry.letters.forEach((index, i) => {
    let x = middle + (i - 1) * 50;
    let active = i === entry.pos;
    writetext(letters[index], x, 300, active ? "yellow" : "white", 40, "center");
    if (active) creatmove(x - 15, 310, 30, 4, "yellow");
  });
  writetext("UP/DOWN LETTER   ENTER NEXT", middle, 360, "gray", 12, "center");
};

let drawscores = () => {
  let middle = canvas.width / 2;
  writetext("HIGH SCORES", middle, 60, "yellow", 30, "center");
  writetext("RANK  NAME     SCORE  LEVEL", middle, 100, "gray", 14, "center");
  if (!topscores.length) writetext("NO SCORES YET", middle, 200, "white", 16, "center");
  topscores.forEach((row, i) => {
    let color = row === newestscore ? "yellow" : ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"][i % 4];
    let text =
      String(i + 1).padStart(2, " ") + ".  " + row.name + "   " +
      String(row.score).padStart(7, " ") + "   " + String(row.level).padStart(3, " ");
    writetext(text, middle, 135 + i * 26, color, 16, "center");
  });
  drawitems(430);
};
