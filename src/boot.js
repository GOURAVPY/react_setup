// Drives the Mac-style startup screen that index.html shows on a visitor's
// first load: a power button, then the logo and loading bar once it is
// pressed. The bar tracks the desktop's images actually loading, but never
// finishes faster than MIN_DURATION, so the screen does not just flash by.

const MIN_DURATION = 2200;
const MAX_DURATION = 8000; // give up waiting on a slow connection
const FADE_DURATION = 600;
const LOGO_DELAY = 900; // power button fades out, then the logo fades in

const ASSETS = [
  "/images/wallpaper.png",
  "/images/finder.png",
  "/images/safari.png",
  "/images/photos.png",
  "/images/contact.png",
  "/images/terminal.png",
  "/images/trash.png",
  "/images/folder.png",
];

const preload = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = image.onerror = resolve;
    image.src = src;
  });

const runBootScreen = () => {
  const screen = document.getElementById("boot");
  if (!screen) return;

  if (document.documentElement.classList.contains("booted")) {
    screen.remove();
    return;
  }

  const bar = screen.querySelector(".boot-bar span");
  const powerButton = screen.querySelector(".boot-power button");
  let loaded = 0;

  // images start loading straight away, while the visitor is still deciding
  ASSETS.forEach((src) => preload(src).then(() => loaded++));

  const finish = () => {
    try {
      sessionStorage.setItem("booted", "1");
    } catch {
      // storage can be blocked; the screen then shows again on reload
    }
    screen.classList.add("done");
    setTimeout(() => {
      screen.remove();
      window.dispatchEvent(new Event("boot:done"));
    }, FADE_DURATION);
  };

  const start = () => {
    const startedAt = performance.now() + LOGO_DELAY;
    screen.classList.add("starting");

    // setInterval rather than requestAnimationFrame, which pauses in a
    // background tab and would leave the screen stuck there
    const timer = setInterval(() => {
      const elapsed = Math.max(0, performance.now() - startedAt);
      const timedOut = elapsed >= MAX_DURATION;
      const progress = timedOut
        ? 1
        : Math.min(loaded / ASSETS.length, elapsed / MIN_DURATION);

      bar.style.width = `${progress * 100}%`;

      if (progress >= 1) {
        clearInterval(timer);
        setTimeout(finish, 350); // let the bar reach the end before fading
      }
    }, 50);
  };

  powerButton.addEventListener("click", start, { once: true });
  powerButton.focus();
};

export default runBootScreen;
