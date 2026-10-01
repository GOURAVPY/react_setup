// Lets the portfolio's Arcade window talk to the game, which runs inside it
// in an <iframe>. Only messages from the portfolio itself are accepted.
//   "hidden"   the window went to the dock: pause, and keep it paused
//   "visible"  the window is back (the player resumes from the pause menu)
let hiddenbyportfolio = false;

let pauseifplaying = () => {
  if (hiddenbyportfolio && (gamestate === "playing" || gamestate === "ready")) pause();
};

window.addEventListener("message", (event) => {
  if (event.origin !== location.origin) return;
  if (event.data === "hidden") {
    hiddenbyportfolio = true;
    pauseifplaying();
  }
  if (event.data === "visible") hiddenbyportfolio = false;
});

// the game can only pause while playing; if it was in the middle of
// something else (a death, the level-clear scene) pause as soon as it plays
setInterval(pauseifplaying, 100);
