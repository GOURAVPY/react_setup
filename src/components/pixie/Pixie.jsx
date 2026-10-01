import { useCallback, useEffect, useRef, useState } from "react";
import { WIDTH, HEIGHT, SCALE } from "./sprites";
import { createPixie } from "./engine";
import { APP_COMMENTS, INTRO, THEME_COMMENTS } from "./lines";
import usePixieStore from "../../store/pixie";
import useWindowStore from "../../store/window";
import useThemeStore from "../../store/theme";
import { playSound } from "../../store/sound";

const TYPE_SPEED = 28; // ms per letter as her bubble fills in
const READ_TIME = 2600; // ms the finished line stays up, plus a little per letter
const GREETED_KEY = "pixie-greeted";

// waits for the startup and login screens to be gone
const desktopReady = () =>
  !document.getElementById("boot") && !document.getElementById("login");

const PixieOnScreen = () => {
  const root = useRef(null);
  const canvas = useRef(null);
  const engine = useRef(null);
  const queue = useRef([]); // lines still to come after the current one
  const [bubble, setBubble] = useState(null); // { text, id }
  const [typed, setTyped] = useState(0);

  const say = useCallback((text) => {
    const [first, ...rest] = Array.isArray(text) ? text : [text];
    queue.current = rest;
    setBubble({ text: first, id: Math.random() });
    setTyped(0);
    playSound("chirp");
  }, []);

  const dismiss = () => {
    queue.current = [];
    setBubble(null);
  };

  // her behaviour runs for as long as she is on screen
  useEffect(() => {
    const pixie = createPixie({
      root: root.current,
      canvas: canvas.current,
      say,
      chatty: () => usePixieStore.getState().chatty,
    });
    engine.current = pixie;
    pixie.start();

    // the first time in a visit she walks in and says hello; after that she
    // is simply there
    const waiting = setInterval(() => {
      if (!desktopReady()) return;
      clearInterval(waiting);
      let greeted = false;
      try {
        greeted = sessionStorage.getItem(GREETED_KEY) === "1";
        sessionStorage.setItem(GREETED_KEY, "1");
      } catch {
        // storage blocked: she greets every time, which is fine
      }
      if (greeted) pixie.appear();
      else setTimeout(() => pixie.greet(INTRO), 1200);
    }, 400);

    const onCall = () => pixie.call();
    window.addEventListener("pixie:call", onCall);

    // remarks about apps being opened and the theme changing
    const offWindows = useWindowStore.subscribe((state, previous) => {
      Object.entries(state.windows).forEach(([id, window]) => {
        if (window.isOpen && !previous.windows[id]?.isOpen) {
          pixie.comment(APP_COMMENTS[id]);
        }
      });
    });
    const offTheme = useThemeStore.subscribe((state, previous) => {
      if (state.theme === previous.theme) return;
      // the page applies the theme a moment later
      setTimeout(
        () => pixie.comment(THEME_COMMENTS[document.documentElement.dataset.theme]),
        500,
      );
    });

    return () => {
      clearInterval(waiting);
      window.removeEventListener("pixie:call", onCall);
      offWindows();
      offTheme();
      pixie.destroy();
      engine.current = null;
    };
  }, [say]);

  const length = bubble?.text.length ?? 0;
  const typing = Boolean(bubble) && typed < length;

  // the bubble fills in letter by letter…
  useEffect(() => {
    if (!bubble) return;
    const timer = setInterval(
      () => setTyped((count) => Math.min(count + 1, bubble.text.length)),
      TYPE_SPEED,
    );
    return () => clearInterval(timer);
  }, [bubble]);

  // …stays up long enough to read, then the next line or nothing
  useEffect(() => {
    if (!bubble || typed < bubble.text.length) return;
    const timer = setTimeout(() => {
      const next = queue.current.shift();
      if (next) {
        setBubble({ text: next, id: Math.random() });
        setTyped(0);
        playSound("chirp");
      } else {
        setBubble(null);
      }
    }, READ_TIME + bubble.text.length * 25);
    return () => clearTimeout(timer);
  }, [bubble, typed]);

  // her mouth moves while the words appear
  useEffect(() => {
    engine.current?.setTalking(typing);
  }, [typing]);

  return (
    <div ref={root} className="pixie">
      {bubble && (
        <button
          key={bubble.id}
          type="button"
          className="pixie-bubble"
          onClick={dismiss}
          title="Click to close"
        >
          <span aria-hidden="true">{bubble.text.slice(0, typed)}</span>
          <span className="sr-only" role="status">
            {bubble.text}
          </span>
        </button>
      )}
      <canvas
        ref={canvas}
        width={WIDTH * SCALE}
        height={HEIGHT * SCALE}
        className="pixie-sprite"
        role="button"
        tabIndex={0}
        aria-label="Pixie, your guide. Click her for a tip."
      />
    </div>
  );
};

// Pixie, a little pixel girl who walks around the desktop, shows people how
// it works and reacts to what they do. Settings › Pixie hides her.
const Pixie = () => {
  const show = usePixieStore((state) => state.show);
  return show ? <PixieOnScreen /> : null;
};

export default Pixie;
