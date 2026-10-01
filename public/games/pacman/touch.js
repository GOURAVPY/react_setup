// phone and tablet controls: swipe on the game or use the buttons below it.
// both just send the same key presses the keyboard would.
let presskey = (key) => window.dispatchEvent(new KeyboardEvent("keydown", { key }));

let swipestart = null;
canvas.addEventListener(
  "touchstart",
  (event) => {
    let t = event.touches[0];
    swipestart = { x: t.clientX, y: t.clientY };
  },
  { passive: true }
);
// stop the page from scrolling while swiping on the game
canvas.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
canvas.addEventListener("touchend", (event) => {
  if (!swipestart) return;
  let t = event.changedTouches[0];
  let dx = t.clientX - swipestart.x;
  let dy = t.clientY - swipestart.y;
  swipestart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
    if (gamestate === "gameover") presskey("Enter"); // a tap plays again
    return; // other taps are handled as clicks by the menus
  }
  if (Math.abs(dx) > Math.abs(dy)) presskey(dx > 0 ? "ArrowRight" : "ArrowLeft");
  else presskey(dy > 0 ? "ArrowDown" : "ArrowUp");
});

document.querySelectorAll(".controls button").forEach((button) => {
  button.addEventListener("touchstart", (event) => {
    event.preventDefault(); // no double-tap zoom
    presskey(button.dataset.key);
  });
  button.addEventListener("click", () => presskey(button.dataset.key));
});
