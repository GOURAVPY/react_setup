// power-ups: one shows up in the maze now and then, grab it for a few seconds of help
let poweruptypes = [
  { name: "SPEED", color: "yellow", time: 6 }, // pac-man moves 1.5x faster
  { name: "FREEZE", color: "#00ffff", time: 5 }, // ghosts stop and can't hurt you
  { name: "MAGNET", color: "#ff4040", time: 7 }, // pulls in dots up to 2 tiles away
];
let powerup = null; // on the board: { type, x, y, time }
let activepower = null; // { type, time }
let powerupclock = 15; // seconds until the next one appears

let haspower = (name) => activepower !== null && activepower.type.name === name;

// after a death the board is cleared, but the clock keeps counting towards the next one
let resetpowerups = () => {
  powerup = null;
  activepower = null;
};

let spawnpowerup = () => {
  let spots = [];
  for (let y = 1; y < mapheight - 1; y++) {
    for (let x = 1; x < mapwidth - 1; x++) {
      let far = Math.abs(x - pacman.x) + Math.abs(y - pacman.y) > 6;
      if ((map[y][x] === 0 || map[y][x] === 2) && !ingosthouse(x, y) && far) spots.push({ x, y });
    }
  }
  if (!spots.length) return;
  let spot = spots[Math.floor(Math.random() * spots.length)];
  let type = poweruptypes[Math.floor(Math.random() * poweruptypes.length)];
  powerup = { type, x: spot.x, y: spot.y, time: 9 };
};

let updatepowerups = (dt) => {
  if (activepower) {
    activepower.time -= dt;
    if (activepower.time <= 0) activepower = null;
  }
  if (powerup) {
    powerup.time -= dt;
    if (powerup.time <= 0) {
      powerup = null;
    } else if (pacman.x === powerup.x && pacman.y === powerup.y) {
      activepower = { type: powerup.type, time: powerup.type.time };
      addpopup(powerup.type.name, powerup.x, powerup.y);
      playsound("eatfruit");
      powerup = null;
    }
  } else {
    powerupclock -= dt;
    if (powerupclock <= 0) {
      spawnpowerup();
      powerupclock = 20;
    }
  }
  if (haspower("MAGNET")) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        let x = pacman.x + dx;
        let y = pacman.y + dy;
        if (x >= 0 && x < mapwidth && y >= 0 && y < mapheight) eatat(x, y);
      }
    }
  }
};

let drawpowericon = (type, cx, cy, r) => {
  canvasContext.save();
  canvasContext.fillStyle = canvasContext.strokeStyle = type.color;
  canvasContext.lineWidth = 2;
  canvasContext.beginPath();
  if (type.name === "SPEED") {
    // lightning bolt
    let pts = [[0.2, -1], [-0.5, 0.1], [0, 0.1], [-0.2, 1], [0.5, -0.1], [0, -0.1]];
    pts.forEach(([px, py], i) => (i ? canvasContext.lineTo : canvasContext.moveTo).call(canvasContext, cx + px * r, cy + py * r));
    canvasContext.fill();
  } else if (type.name === "FREEZE") {
    // snowflake
    for (let i = 0; i < 3; i++) {
      let a = (i * Math.PI) / 3;
      canvasContext.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
      canvasContext.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    canvasContext.stroke();
  } else {
    // horseshoe magnet with white tips
    canvasContext.lineWidth = r * 0.5;
    canvasContext.arc(cx, cy - r * 0.1, r * 0.65, 0, Math.PI);
    canvasContext.moveTo(cx - r * 0.65, cy - r * 0.1);
    canvasContext.lineTo(cx - r * 0.65, cy - r * 0.8);
    canvasContext.moveTo(cx + r * 0.65, cy - r * 0.1);
    canvasContext.lineTo(cx + r * 0.65, cy - r * 0.8);
    canvasContext.stroke();
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(cx - r * 0.9, cy - r, r * 0.5, r * 0.3);
    canvasContext.fillRect(cx + r * 0.4, cy - r, r * 0.5, r * 0.3);
  }
  canvasContext.restore();
};

let drawpowerups = () => {
  if (powerup && (powerup.time > 2 || Math.floor(Date.now() / 150) % 2)) {
    drawpowericon(powerup.type, (powerup.x + 0.5) * blocksize, (powerup.y + 0.5) * blocksize, blocksize * 0.45);
  }
};

// small icon and time bar in the bottom bar while a power-up is working
let drawpowerhud = (top) => {
  if (!activepower) return;
  drawpowericon(activepower.type, 72, top + 42, 8);
  creatmove(86, top + 38, 70, 8, "#333");
  creatmove(86, top + 38, 70 * (activepower.time / activepower.type.time), 8, activepower.type.color);
};
