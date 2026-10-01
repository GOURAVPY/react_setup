// the break scene between levels, like the arcade's first intermission:
// Blinky chases Pac-Man off the screen, then a giant Pac-Man chases him back.
let drawcutscene = (p) => {
  creatmove(0, 0, canvas.width, mapheight * blocksize, backgroundcolor);
  let y = 180;
  let step = Math.floor(Date.now() / 130) % 2;
  let run = canvas.width + 200;
  if (p < 0.5) {
    let x = canvas.width + 20 - (p / 0.5) * run;
    let frame = Math.floor(Date.now() / 60) % 7;
    canvasContext.save();
    canvasContext.translate(x + 16, y + 16);
    canvasContext.rotate(Math.PI); // facing left
    canvasContext.drawImage(pacmanframs[0], frame * 20, 0, 20, 20, -16, -16, 32, 32);
    canvasContext.restore();
    drawsheet(2 + step, sheetrows[0], x + 70, y, 32); // blinky close behind
  } else {
    let x = -140 + ((p - 0.5) / 0.5) * run;
    drawsheet(8 + step, 64, x + 110, y + 8, 32); // blue blinky running away
    let frame = [0, 1, 2, 1][Math.floor(Date.now() / 80) % 4];
    canvasContext.drawImage(arcadeframs[0], 504 + frame * 32, 16, 32, 32, x, y - 24, 96, 96);
  }
};
