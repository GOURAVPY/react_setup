const canvas = document.querySelector(".canvas");
const canvasContext = canvas.getContext("2d");
const pacmanframs = document.querySelectorAll(".animationes");
const fruitsframs = document.querySelectorAll(".fruits");
const arcadeframs = document.querySelectorAll(".arcade");
canvasContext.imageSmoothingEnabled = false; // keep the pixel art sharp

let creatmove = (x, y, height, width, color) => {
  canvasContext.fillStyle = color;
  canvasContext.fillRect(x, y, height, width);
};
let blocksize = 20;
let wallspase = blocksize / 1.6;
let wallbodars = (blocksize - wallspase) / 2;  
let wallslinecolors = "black";
let backgroundcolor = "black";
let wallcolor = "#2121ff";
let fps = 60;
// map tiles: 0 empty, 1 wall, 2 food, 3 ghost door, 4 power pellet
let doorcolor = "#ffb8de";
let foodcolor = "#ffb897";
let map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 3, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];
let basemap = map.map((row) => [...row]);
let mazes = [basemap, ...extramazes];
let mazecolors = ["#2121ff", "#ff4fb0", "#00d8d8", "#ff9f1c"];
let mazecolor = mazecolors[0];
// a new maze and wall colour every 2 levels
let setmaze = () => {
  let round = Math.floor((level - 1) / 2);
  basemap = mazes[round % mazes.length];
  mazecolor = mazecolors[round % mazecolors.length];
};
let mapwidth = map[0].length;
let mapheight = map.length;
let tileat = (x, y) => {
  if (y < 0 || y >= mapheight) return 1;
  return map[y][(x + mapwidth) % mapwidth];
};
let pacmanstart = { x: 10, y: 17 };
let powerspots = [[1, 2], [19, 2], [1, 17], [19, 17]];
let ingosthouse = (x, y) => y >= 10 && y <= 11 && x >= 9 && x <= 11;
let intunnel = (x, y) => y === 10 && (x <= 4 || x >= 16);

let placefood = () => {
  setmaze();
  map = basemap.map((row) => [...row]);
  foodleft = 0;
  dotseaten = 0;
  let stack = [[pacmanstart.x, pacmanstart.y]];
  while (stack.length) {
    let [x, y] = stack.pop();
    if (tileat(x, y) !== 0 || ingosthouse(x, y)) continue;
    map[y][(x + mapwidth) % mapwidth] = 2;
    foodleft++;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  powerspots.forEach(([x, y]) => (map[y][x] = 4));
  foodtotal = foodleft;
};

let score = 0;
let foodleft = 0;
let foodtotal = 1;
let pacman;
let ghosts = [];
let scattermode = true;
let modetime = 0;
let frighttime = 0;
let lasttime = performance.now();

// bonus fruit: one per level type, shown twice per level below the ghost house
let fruitpoints = [100, 300, 500, 700, 1000, 2000, 3000, 5000];
let fruitspot = { x: 10, y: 13 };
let fruit = null; // { time } while a fruit is on the board
let dotseaten = 0;
let popups = []; // floating score numbers
let fruitforlevel = (lvl) => Math.min(lvl - 1, fruitpoints.length - 1);

let eatat = (x, y) => {
  if (map[y][x] === 2) score += 10;
  else if (map[y][x] === 4) {
    score += 50;
    frighten();
  } else return;
  map[y][x] = 0;
  foodleft--;
  playsound("chomp", false); // keeps the waka going without restarting it every dot
  dotseaten++;
  if (dotseaten === 70 || dotseaten === 170) fruit = { time: 9.5 };
};

let addpopup = (points, x, y) => popups.push({ text: String(points), x, y, time: 1.2 });

let updatefruit = (dt) => {
  popups.forEach((p) => (p.time -= dt));
  popups = popups.filter((p) => p.time > 0);
  if (!fruit) return;
  fruit.time -= dt;
  if (fruit.time <= 0) {
    fruit = null;
  } else if (pacman.x === fruitspot.x && pacman.y === fruitspot.y) {
    let points = fruitpoints[fruitforlevel(level)];
    score += points;
    playsound("eatfruit");
    addpopup(points, fruitspot.x, fruitspot.y);
    fruit = null;
  }
};

let ghostcombo = 0;
let freezetime = 0; // short pause after eating a ghost, like the arcade
let frighten = () => {
  frighttime = Math.max(difficulties[difficulty].fright - (level - 1), 2);
  ghostcombo = 0;
  ghosts.forEach((g) => {
    if (g.state === "eaten") return;
    g.frightened = true;
    g.reversenext = true;
  });
};

let checkcollisions = () => {
  let px = pacman.x + pacman.dir.x * pacman.progress;
  let py = pacman.y + pacman.dir.y * pacman.progress;
  for (let g of ghosts) {
    if (g.state !== "active") continue;
    if (haspower("FREEZE") && !g.frightened) continue; // frozen ghosts are harmless
    let gx = g.x + g.dir.x * g.progress;
    let gy = g.y + g.dir.y * g.progress;
    if (Math.abs(px - gx) > 0.6 || Math.abs(py - gy) > 0.6) continue;
    if (g.frightened) {
      ghostcombo++;
      score += 100 * 2 ** ghostcombo; // 200, 400, 800, 1600
      playsound("eatghost");
      addpopup(100 * 2 ** ghostcombo, gx, gy);
      g.state = "eaten";
      g.frightened = false;
      freezetime = 0.6;
      return false;
    } else {
      catcher = g;
      return true; // pac-man got caught
    }
  }
  return false;
};

let gameloops = () => {
  let now = performance.now();
  updeta(Math.min((now - lasttime) / 1000, 0.05));
  lasttime = now;
  draw();
  let bgmode = null;
  if (gamestate === "playing" && freezetime <= 0) {
    if (ghosts.some((g) => g.state === "eaten")) bgmode = "retreat";
    else if (frighttime > 0) bgmode = "fright";
    else bgmode = "siren";
  }
  backgroundsound(bgmode, 1 - foodleft / foodtotal);
};

let highscore = 0;
try {
  highscore = Number(localStorage.getItem("pacmanhighscore")) || 0;
} catch (e) {}
if (topscores.length) highscore = Math.max(highscore, topscores[0].score);
let lives = 3;
let players = 1; // 2 = player two steers the red ghost with WASD
let extralifegiven = false; // one bonus life at 10,000 points
let p2catches = 0; // two player mode: how often the red ghost caught pac-man
let catcher = null;
let level = 1;
// ready | playing | dying | levelup | gameover, plus the menu screens: menu | howto | paused
let gamestate = "menu";
let statetime = 2;

let updeta = (dt) => {
  if (menus[gamestate] || gamestate === "initials") return;
  if (gamestate !== "playing") {
    statetime -= dt;
    if (statetime <= 0 && gamestate !== "gameover") nextstate();
    return;
  }
  if (freezetime > 0) {
    freezetime -= dt;
    return;
  }
  pacman.update(haspower("SPEED") ? dt * 1.5 : dt);
  updatemodes(dt);
  ghosts.forEach((g) => {
    if (haspower("FREEZE") && g.state === "active") return; // frozen in place
    g.update(dt, ghostspeed(g));
  });
  updatefruit(dt);
  updatepowerups(dt);
  if (!extralifegiven && score >= 10000) {
    extralifegiven = true;
    lives++;
    playsound("extrapac");
  }
  if (checkcollisions()) {
    if (catcher.controlled) p2catches++;
    stopsounds();
    playsound("death");
    setstate("dying", 1.5);
  } else if (foodleft === 0) {
    stopsounds();
    playsound("intermission");
    setstate("levelup", 5.2); // as long as the intermission tune
  }
};

let setstate = (state, time) => {
  gamestate = state;
  statetime = time;
};

let nextstate = () => {
  if (gamestate === "dying") {
    lives--;
    if (lives <= 0) {
      highscore = Math.max(highscore, score);
      try {
        localStorage.setItem("pacmanhighscore", highscore);
      } catch (e) {}
      if (qualifies(score)) return startinitials();
      return setstate("gameover", 0);
    }
    resetpositions();
    return setstate("ready", 2);
  }
  if (gamestate === "levelup") {
    level++;
    placefood();
    resetpositions();
    return setstate("ready", 2);
  }
  setstate("playing", 0);
};

let resetpositions = () => {
  pacman = new PACMAN(pacmanstart.x, pacmanstart.y, 7.5);
  ghosts.forEach((g) => g.reset());
  frighttime = 0;
  freezetime = 0;
  resetpowerups();
  fruit = null;
  popups = [];
  scattermode = true;
  modetime = 0;
};

let newgame = () => {
  score = 0;
  lives = 3;
  extralifegiven = false;
  p2catches = 0;
  powerupclock = 15;
  level = 1;
  ghosts[0].controlled = players === 2;
  placefood();
  resetpositions();
  stopsounds();
  playsound("beginning");
  setstate("ready", 4.2); // wait for the opening tune like the arcade
};

let ghostspeed = (g) => {
  if (g.state === "eaten") return 14;
  if (g.frightened) return 4;
  if (g.state === "leaving") return 4;
  if (intunnel(g.x, g.y)) return 3.5; // the side tunnel is pac-man's escape route
  return Math.min(6.8 + (level - 1) * 0.4, 8.5) * difficulties[difficulty].ghostspeed;
};

let updatemodes = (dt) => {
  if (frighttime > 0) {
    frighttime -= dt;
    if (frighttime <= 0) ghosts.forEach((g) => (g.frightened = false));
    return; // the scatter/chase clock pauses while ghosts are blue
  }
  modetime += dt;
  let length = scattermode ? 7 : 20;
  if (modetime >= length) {
    modetime = 0;
    scattermode = !scattermode;
    ghosts.forEach((g) => (g.reversenext = !g.controlled));
  }
};

let hudtop = 40; // arcade layout: scores above the maze, lives and fruit below

let draw = () => {
  if (gamestate === "menu" || gamestate === "howto" || gamestate === "scores") return drawmenu();
  creatmove(0, 0, canvas.width, canvas.height, backgroundcolor);
  canvasContext.save();
  canvasContext.translate(0, hudtop);
  drawboard();
  canvasContext.restore();
  hud();
  if (gamestate === "paused") drawmenu();
  if (gamestate === "initials") drawinitials();
};

let drawboard = () => {
  if (gamestate === "levelup" && statetime <= 3) return drawcutscene(1 - statetime / 3); // break scene after the walls flash
  let flash = gamestate === "levelup" && statetime > 3 && Math.floor(statetime * 4) % 2;
  wallcolor = flash ? "white" : mazecolor;
  walls();
  foods();
  drawpowerups();
  if (fruit) drawfruit(fruitforlevel(level), fruitspot.x * blocksize - 2, fruitspot.y * blocksize - 2, blocksize + 4);
  popups.forEach((p) =>
    writetext(p.text, (p.x + 0.5) * blocksize, (p.y + 0.5) * blocksize + 4, "#00ffff", 12, "center")
  );
  if (gamestate === "dying") {
    let t = 1 - statetime / 1.5; // 0 -> 1 over the death tune
    if (t < 0.2) {
      pacman.draw();
      ghosts.forEach((g) => g.draw(false));
    } else {
      pacman.drawdying((t - 0.2) / 0.8);
    }
  } else {
    if (freezetime <= 0) pacman.draw(); // the score number shows in its place
    if (gamestate !== "levelup") ghosts.forEach((g) => g.draw(frighttime > 0 && frighttime < 2));
  }
};

let writetext = (text, x, y, color, size, align) => drawtext(text, x, y, color, size, align);

let drawfruit = (index, x, y, size) => {
  canvasContext.drawImage(fruitsframs[0], index * 40, 0, 40, 40, x, y, size, size);
};

let hud = () => {
  let middle = canvas.width / 2;
  // top bar: 1UP blinks while playing, like the arcade
  if (gamestate !== "playing" || Math.floor(Date.now() / 300) % 2) writetext("1UP", 60, 16, "white", 14, "center");
  writetext(score || "00", 100, 34, "white", 14, "right");
  writetext("HIGH SCORE", middle, 16, "white", 14, "center");
  writetext(Math.max(highscore, score) || "", middle + 36, 34, "white", 14, "right");
  if (players === 2) {
    writetext("2UP", 360, 16, "red", 14, "center");
    writetext("P2:" + p2catches, 390, 34, "red", 14, "right");
  } else {
    writetext("LEVEL", 360, 16, "white", 14, "center");
    writetext(level, 380, 34, "white", 14, "right");
  }
  // bottom bar: lives on the left, power-up timer, fruits of recent levels on the right
  let top = hudtop + mapheight * blocksize;
  for (let i = 0; i < lives - 1; i++) {
    canvasContext.drawImage(pacmanframs[0], 20, 0, 20, 20, 8 + i * 24, top + 10, blocksize, blocksize);
  }
  drawpowerhud(top - 22);
  if (gamestate !== "gameover") {
    for (let l = level, i = 0; l >= 1 && i < 7; l--, i++) {
      drawfruit(fruitforlevel(l), canvas.width - 8 - (i + 1) * 22, top + 10, blocksize);
    }
    if (players === 2) writetext("LEVEL " + level, middle, top + 26, "white", 12, "center");
  }
  let row = hudtop + 13.5 * blocksize + 6;
  if (gamestate === "ready") writetext("READY!", middle, row, "yellow", 18, "center");
  if (gamestate === "levelup" && statetime <= 3)
    writetext("LEVEL " + (level + 1), middle, row, "yellow", 18, "center");
  if (gamestate === "gameover") {
    writetext("GAME OVER", middle, row, "red", 18, "center");
    writetext("ENTER AGAIN - ESC MENU", middle, top + 26, "white", 12, "center");
  }
};

ghosts = [
  new GHOST(10, 8, 0, { x: 20, y: -2 }, 0),
  new GHOST(9, 10, 3, { x: 20, y: 24 }, 6),
  new GHOST(10, 11, 2, { x: 0, y: -2 }, 1),
  new GHOST(11, 10, 1, { x: 0, y: 24 }, 12),
];
newgame();
gamestate = "menu";
let gameintarval;
// start once every script and sprite has loaded
window.addEventListener("load", () => {
  lasttime = performance.now();
  gameintarval = setInterval(gameloops, 1000 / fps);
});

let drawcircle = (x, y, radius, color) => {
  canvasContext.fillStyle = color;
  canvasContext.beginPath();
  canvasContext.arc(x, y, radius, 0, Math.PI * 2);
  canvasContext.fill();
};

let foods = () => {
  for (let i = 0; i < mapheight; i++) {
    for (let j = 0; j < mapwidth; j++) {
      let cx = j * blocksize + blocksize / 2;
      let cy = i * blocksize + blocksize / 2;
      if (map[i][j] === 2) drawcircle(cx, cy, blocksize / 10, foodcolor);
      if (map[i][j] === 4 && Math.floor(Date.now() / 250) % 2)
        drawcircle(cx, cy, blocksize / 3, foodcolor);
      if (map[i][j] === 3)
        creatmove(j * blocksize, cy - 2, blocksize, 4, doorcolor);
    }
  }
};

// walls are drawn as thick rounded tubes between neighbouring wall tiles, then the
// middle is cut out so only a glowing outline is left. It is cached because the glow is slow.
let wallcache = null;
let wallcachekey = "";

let tracewalls = (ctx, width) => {
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  let iswall = (i, j) => i >= 0 && i < mapheight && j >= 0 && j < mapwidth && map[i][j] === 1;
  for (let i = 0; i < mapheight; i++) {
    for (let j = 0; j < mapwidth; j++) {
      if (!iswall(i, j)) continue;
      let cx = j * blocksize + blocksize / 2;
      let cy = i * blocksize + blocksize / 2;
      ctx.moveTo(cx, cy);
      ctx.lineTo(iswall(i, j + 1) ? cx + blocksize : cx, cy);
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, iswall(i + 1, j) ? cy + blocksize : cy);
      // fill the middle of thick blocks so they don't show a grid inside
      if (iswall(i, j + 1) && iswall(i + 1, j) && iswall(i + 1, j + 1)) ctx.fillRect(cx, cy, blocksize, blocksize);
    }
  }
  ctx.stroke();
};

let buildwalls = () => {
  wallcache = document.createElement("canvas");
  wallcache.width = mapwidth * blocksize;
  wallcache.height = mapheight * blocksize;
  let ctx = wallcache.getContext("2d");
  ctx.strokeStyle = ctx.fillStyle = ctx.shadowColor = wallcolor;
  ctx.shadowBlur = 8;
  tracewalls(ctx, blocksize * 0.7);
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "destination-out";
  tracewalls(ctx, blocksize * 0.7 - 5);
};

let walls = () => {
  let key = wallcolor + "|" + basemap.map((row) => row.join("")).join("");
  if (key !== wallcachekey) {
    wallcachekey = key;
    buildwalls();
  }
  canvasContext.drawImage(wallcache, 0, 0);
};

let keydirs = {
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
};
let wasd = ["w", "a", "s", "d"];

window.addEventListener("keydown", (event) => {
  if (menukey(event)) return;
  if (event.key === "Enter" && gamestate === "gameover") return newgame();
  let key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  let d = keydirs[key];
  if (!d) return;
  event.preventDefault();
  if (players === 2 && wasd.includes(key)) {
    let red = ghosts[0];
    red.wanted = d;
    if (d.x === -red.dir.x && d.y === -red.dir.y) red.reversenext = true; // turn around at once
    return;
  }
  pacman.nextdir = d;
});
