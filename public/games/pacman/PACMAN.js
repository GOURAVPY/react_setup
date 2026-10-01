
class PACMAN {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed; // tiles per second
    this.dir = { x: 0, y: 0 };
    this.nextdir = { x: 0, y: 0 };
    this.facing = { x: 1, y: 0 };
    this.progress = 0; // 0..1 of the way to the next tile
    this.frame = 0;
  }

  canmove(d) {
    if (d.x === 0 && d.y === 0) return false;
    let tile = tileat(this.x + d.x, this.y + d.y);
    return tile !== 1 && tile !== 3;
  }

  step() {
    this.x = (this.x + this.dir.x + mapwidth) % mapwidth;
    this.y += this.dir.y;
  }

  update(dt) {
    let n = this.nextdir;
    // reversing is allowed at any moment, even between tiles
    if (this.progress > 0 && n.x === -this.dir.x && n.y === -this.dir.y) {
      this.step();
      this.dir = n;
      this.progress = 1 - this.progress;
    }
    if (this.progress === 0) {
      if (this.canmove(n)) this.dir = n;
      if (!this.canmove(this.dir)) return;
    }
    this.facing = this.dir;
    this.frame += dt * 20;
    this.progress += this.speed * dt;
    if (this.progress >= 1) {
      this.step();
      this.progress = 0;
      eatat(this.x, this.y);
    }
  }

  pixelx() {
    return (this.x + this.dir.x * this.progress) * blocksize;
  }

  pixely() {
    return (this.y + this.dir.y * this.progress) * blocksize;
  }

  // arcade death: the 11 death frames from the sprite sheet, ending in a little pop
  drawdying(p) {
    let frame = 3 + Math.min(Math.floor(p * 11), 10);
    drawsheet(frame, 0, this.pixelx(), this.pixely(), blocksize);
  }

  draw() {
    let img = pacmanframs[0];
    canvasContext.save();
    canvasContext.translate(this.pixelx() + blocksize / 2, this.pixely() + blocksize / 2);
    canvasContext.rotate(Math.atan2(this.facing.y, this.facing.x));
    let frame = Math.floor(this.frame) % 7;
    canvasContext.drawImage(img, frame * 20, 0, 20, 20, -blocksize / 2, -blocksize / 2, blocksize, blocksize);
    canvasContext.restore();
  }
}
