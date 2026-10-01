// Lets the portfolio's Arcade window talk to the game, which runs inside it
// in an <iframe>. Only messages from the portfolio itself are accepted.
//   "pause"  pauses a game in progress (the window was minimized)
window.addEventListener("message", (event) => {
  if (event.origin !== location.origin) return;

  if (event.data === "pause" && (gamestate === "playing" || gamestate === "ready")) {
    pause();
  }
});
