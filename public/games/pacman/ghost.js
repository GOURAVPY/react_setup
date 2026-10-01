let ghostdirs = [
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 0 },
];

// the arcade sprite sheet: 16px cells starting at x=456
let sheetrows = [64, 112, 80, 96]; // ghost rows by sprite index: red, orange, pink, cyan
let dircol = (d) => (d.x > 0 ? 0 : d.x < 0 ? 1 : d.y < 0 ? 2 : 3); // right, left, up, down
let drawsheet = (col, row, x, y, size) => {
  canvasContext.drawImage(arcadeframs[0], 456 + col * 16, row, 16, 16, x, y, size, size);
};

class GHOST {
  constructor(x, y, sprite, corner, releasedelay) {
    this.startx = x;
    this.starty = y;
    this.sprite = sprite;
    this.corner = corner; // scatter target
    this.releasedelay = releasedelay;
    this.reset();
  }

  reset() {
    this.x = this.startx;
    this.y = this.starty;
    this.dir = { x: 0, y: -1 };
    this.progress = 0;
    // house | leaving | active | eaten
    this.state = ingosthouse(this.x, this.y) ? "house" : "active";
    this.frightened = false;
    this.reversenext = false;
    this.housetime = this.releasedelay;
    this.wanted = null; // direction asked for by player 2
  }

  target() {
    if (this.state === "leaving") return { x: 10, y: 8 };
    if (this.state === "eaten") return { x: 10, y: 10 };
    if (scattermode) return this.corner;
    let p = pacman;
    let f = pacman.facing;
    switch (this.sprite) {
      case 0: // red: straight at pac-man
        return { x: p.x, y: p.y };
      case 2: // pink: aims 4 tiles ahead of pac-man
        return { x: p.x + f.x * 4, y: p.y + f.y * 4 };
      case 3: { // cyan: flanks using the red ghost's position
        let red = ghosts[0];
        return { x: 2 * (p.x + f.x * 2) - red.x, y: 2 * (p.y + f.y * 2) - red.y };
      }
      default: { // orange: chases when far, wanders home when close
        let dist = Math.hypot(p.x - this.x, p.y - this.y);
        return dist > 8 ? { x: p.x, y: p.y } : this.corner;
      }
    }
  }

  canmove(d) {
    let tile = tileat(this.x + d.x, this.y + d.y);
    if (tile === 1) return false;
    if (tile === 3) return this.state === "leaving" || this.state === "eaten";
    return true;
  }

  choosedir() {
    let back = { x: -this.dir.x, y: -this.dir.y };
    if (this.controlled && this.state === "active") {
      // player 2 steers: turn when possible, otherwise keep going
      if (this.wanted && this.canmove(this.wanted)) return this.wanted;
      if (this.canmove(this.dir)) return this.dir;
      return ghostdirs.find((d) => this.canmove(d)) || back;
    }
    let options = ghostdirs.filter(
      (d) => !(d.x === back.x && d.y === back.y) && this.canmove(d)
    );
    if (options.length === 0) return back;
    if (this.frightened && this.state === "active")
      return options[Math.floor(Math.random() * options.length)];
    let t = this.target();
    let distance = (d) => (this.x + d.x - t.x) ** 2 + (this.y + d.y - t.y) ** 2;
    return options.reduce((best, d) => (distance(d) < distance(best) ? d : best));
  }

  update(dt, speed) {
    if (this.state === "house") {
      this.housetime -= dt;
      if (this.housetime <= 0) this.state = "leaving";
      return;
    }
    if (this.reversenext && this.progress > 0) {
      this.x = (this.x + this.dir.x + mapwidth) % mapwidth;
      this.y += this.dir.y;
      this.dir = { x: -this.dir.x, y: -this.dir.y };
      this.progress = 1 - this.progress;
    }
    this.reversenext = false;
    if (this.progress === 0) this.dir = this.choosedir();
    this.progress += speed * dt;
    if (this.progress >= 1) {
      this.x = (this.x + this.dir.x + mapwidth) % mapwidth;
      this.y += this.dir.y;
      this.progress = 0;
      this.arrived();
    }
  }

  draw(flashing) {
    let px = (this.x + this.dir.x * this.progress) * blocksize;
    let py = (this.y + this.dir.y * this.progress) * blocksize;
    let frozen = haspower("FREEZE") && this.state === "active" && !this.frightened;
    let step = frozen ? 0 : Math.floor(Date.now() / 130) % 2; // two-frame walk
    if (this.state === "eaten") return drawsheet(8 + dircol(this.dir), 80, px, py, blocksize);
    if (this.frightened) {
      let white = flashing && Math.floor(Date.now() / 200) % 2;
      return drawsheet((white ? 10 : 8) + step, 64, px, py, blocksize);
    }
    if (frozen) canvasContext.globalAlpha = 0.5; // see-through while frozen
    drawsheet(dircol(this.dir) * 2 + step, sheetrows[this.sprite], px, py, blocksize);
    canvasContext.globalAlpha = 1;
    if (this.controlled) writetext("P2", px + blocksize / 2, py - 1, "white", 8, "center");
  }

  arrived() {
    if (this.state === "leaving" && this.x === 10 && this.y === 8) {
      this.state = "active";
    } else if (this.state === "eaten" && this.x === 10 && this.y === 10) {
      this.state = "leaving";
      this.frightened = false;
    }
  }
}
