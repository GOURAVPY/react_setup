let difficulties = [
  { name: "EASY", ghostspeed: 0.85, fright: 9 },
  { name: "NORMAL", ghostspeed: 1, fright: 7 },
  { name: "HARD", ghostspeed: 1.15, fright: 5 },
];
let difficulty = 1;
let menuselected = 0;
let pausedfrom = "playing";
let pausedtime = 0;

let changedifficulty = (step) => {
  difficulty = (difficulty + step + difficulties.length) % difficulties.length;
};

let openmenu = (name) => {
  stopsounds();
  setstate(name, 0);
  menuselected = 0;
};

let pause = () => {
  pausedfrom = gamestate;
  pausedtime = statetime;
  openmenu("paused");
};

let resume = () => setstate(pausedfrom, pausedtime);

let soundoption = {
  label: () => "SOUND  < " + (soundon ? "ON" : "OFF") + " >",
  action: () => togglesound(),
  side: () => togglesound(),
};

let menus = {
  menu: [
    { label: () => "START GAME", action: () => newgame() },
    {
      label: () => "DIFFICULTY  < " + difficulties[difficulty].name + " >",
      action: () => changedifficulty(1),
      side: changedifficulty,
    },
    {
      label: () => "PLAYERS  < " + players + " >",
      action: () => (players = 3 - players),
      side: () => (players = 3 - players),
    },
    soundoption,
    { label: () => "HIGH SCORES", action: () => openmenu("scores") },
    { label: () => "HOW TO PLAY", action: () => openmenu("howto") },
  ],
  paused: [
    { label: () => "RESUME", action: resume },
    { label: () => "RESTART", action: () => newgame() },
    soundoption,
    { label: () => "MAIN MENU", action: () => openmenu("menu") },
  ],
  howto: [{ label: () => "BACK", action: () => openmenu("menu") }],
  scores: [{ label: () => "BACK", action: () => openmenu("menu") }],
};

let itemboxes = []; // clickable areas of the menu items, in canvas pixels

let drawitems = (top) => {
  let middle = canvas.width / 2;
  itemboxes = [];
  menus[gamestate].forEach((item, i) => {
    let y = top + i * 32;
    let text = item.label();
    let selected = i === menuselected;
    writetext(text, middle, y, selected ? "yellow" : "white", 20, "center");
    let width = textwidth(text, 20);
    if (selected) {
      let frame = Math.floor(Date.now() / 60) % 7;
      canvasContext.drawImage(pacmanframs[0], frame * 20, 0, 20, 20, middle - width / 2 - 30, y - 16, 20, 20);
    }
    itemboxes.push({ x: middle - width / 2 - 30, y: y - 22, w: width + 60, h: 30 });
  });
};

let ghostnames = [
  { sprite: 0, name: "SHADOW", nick: "BLINKY", color: "#ff0000" },
  { sprite: 2, name: "SPEEDY", nick: "PINKY", color: "#ffb8ff" },
  { sprite: 3, name: "BASHFUL", nick: "INKY", color: "#00ffff" },
  { sprite: 1, name: "POKEY", nick: "CLYDE", color: "#ffb852" },
];

let drawtitle = () => {
  let middle = canvas.width / 2;
  writetext("PAC-MAN", middle, 80, "yellow", 52, "center");
  writetext("CHARACTER  /  NICKNAME", middle, 115, "white", 13, "center");
  ghostnames.forEach((g, i) => {
    let y = 128 + i * 26;
    drawsheet(Math.floor(Date.now() / 130) % 2, sheetrows[g.sprite], 70, y, 20);
    writetext("-" + g.name, 100, y + 16, g.color, 15, "left");
    writetext('"' + g.nick + '"', 250, y + 16, g.color, 15, "left");
  });
};

let drawpacat = (x, y, angle) => {
  let frame = Math.floor(Date.now() / 60) % 7;
  canvasContext.save();
  canvasContext.translate(x + 10, y + 10);
  canvasContext.rotate(angle);
  canvasContext.drawImage(pacmanframs[0], frame * 20, 0, 20, 20, -10, -10, 20, 20);
  canvasContext.restore();
};

// the little attract-mode chase along the bottom of the title screen
let drawchase = (y) => {
  let t = (Date.now() / 1000) % 8;
  let run = canvas.width + 160;
  let step = Math.floor(Date.now() / 130) % 2;
  if (t < 4) {
    let x = canvas.width + 20 - (t / 4) * run;
    drawpacat(x, y, Math.PI);
    ghostnames.forEach((g, i) => {
      drawsheet(2 + step, sheetrows[g.sprite], x + 36 + i * 24, y, 20);
    });
  } else {
    let x = -140 + ((t - 4) / 4) * run;
    drawpacat(x, y, 0);
    ghostnames.forEach((g, i) => drawsheet(8 + step, 64, x + 36 + i * 24, y, 20));
  }
};

let drawhowto = () => {
  let middle = canvas.width / 2;
  writetext("HOW TO PLAY", middle, 60, "yellow", 30, "center");
  let lines = [
    "ARROWS / WASD  MOVE",
    "ESC / P        PAUSE",
    "M              SOUND ON/OFF",
    "2 PLAYERS: WASD MOVES BLINKY",
    "",
    "EAT EVERY DOT TO CLEAR THE LEVEL.",
    "BIG DOTS TURN THE GHOSTS BLUE -",
    "EAT THEM BEFORE THEY RECOVER!",
    "THE SIDE TUNNEL WRAPS AROUND.",
  ];
  lines.forEach((line, i) => writetext(line, 30, 100 + i * 20, "white", 13, "left"));
  drawcircle(60, 290, 2, foodcolor);
  writetext("10 PTS", 90, 295, "white", 15, "left");
  drawcircle(60, 320, 6, foodcolor);
  writetext("50 PTS", 90, 325, "white", 15, "left");
  drawsheet(8, 64, 50, 340, 20);
  writetext("200 - 1600 PTS", 90, 355, "white", 15, "left");
  drawfruit(0, 50, 370, 20);
  writetext("BONUS FRUIT 100 - 5000 PTS", 90, 385, "white", 15, "left");
  drawitems(430);
};

let drawmenu = () => {
  let middle = canvas.width / 2;
  if (gamestate === "paused") {
    creatmove(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.7)");
    writetext("PAUSED", middle, 190, "yellow", 36, "center");
    return drawitems(250);
  }
  creatmove(0, 0, canvas.width, canvas.height, backgroundcolor);
  if (gamestate === "howto") return drawhowto();
  if (gamestate === "scores") return drawscores();
  drawtitle();
  drawitems(258);
  drawchase(445);
  writetext("UP/DOWN SELECT   ENTER CHOOSE", middle, 505, "gray", 12, "center");
};

// returns true when the menu used the key, so the game ignores it
let menukey = (event) => {
  let key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  let pausekey = key === "Escape" || key === "p";
  if (gamestate === "initials") {
    initialskey(event.key);
    event.preventDefault();
    return true;
  }
  if (key === "m") {
    togglesound();
    return true;
  }
  if (pausekey && (gamestate === "playing" || gamestate === "ready")) {
    pause();
  } else if (pausekey && gamestate === "paused") {
    resume();
  } else if (key === "Escape" && gamestate === "gameover") {
    openmenu("menu");
  } else if (key === "Escape" && (gamestate === "howto" || gamestate === "scores")) {
    openmenu("menu");
  } else {
    let items = menus[gamestate];
    if (!items) return false;
    let item = items[menuselected];
    if (key === "ArrowUp" || key === "w") menuselected = (menuselected + items.length - 1) % items.length;
    else if (key === "ArrowDown" || key === "s") menuselected = (menuselected + 1) % items.length;
    else if ((key === "ArrowLeft" || key === "a") && item.side) item.side(-1);
    else if ((key === "ArrowRight" || key === "d") && item.side) item.side(1);
    else if (key === "Enter" || key === " ") item.action();
  }
  event.preventDefault();
  return true;
};

let itemundermouse = (event) => {
  if (!menus[gamestate]) return -1;
  let rect = canvas.getBoundingClientRect();
  let x = ((event.clientX - rect.left) * canvas.width) / rect.width;
  let y = ((event.clientY - rect.top) * canvas.height) / rect.height;
  return itemboxes.findIndex((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
};

canvas.addEventListener("mousemove", (event) => {
  let i = itemundermouse(event);
  if (i >= 0) menuselected = i;
  canvas.style.cursor = i >= 0 ? "pointer" : "default";
});

canvas.addEventListener("click", (event) => {
  let i = itemundermouse(event);
  if (i >= 0) menus[gamestate][i].action();
});
