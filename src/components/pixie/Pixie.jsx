import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import clsx from "clsx";
import { WIDTH, HEIGHT, SCALE } from "./sprites";
import { createPixie, floorLine } from "./engine";
import { createThings } from "./things";
import { askPixie, brainEnabled, wakeBrain } from "./brain";
import { createMind } from "./mind";
import PortalStory from "./PortalStory";
import { isMobile } from "../../utils/device";
import {
  APP_COMMENTS,
  ARRIVED,
  ASK,
  BRAIN_DOWN,
  BRAIN_TIRED,
  CHAT_INTRO,
  INTRO,
  LAMP_ON,
  LAMP_STORY,
  MUSIC_ON,
  PICKED,
  STORY_AGAIN,
  THEME_COMMENTS,
  YOU_WIN,
} from "./lines";
import usePixieStore, { justPicked } from "../../store/pixie";
import useMusicStore, { songLeft, songStarted } from "../../store/music";
import useWindowStore from "../../store/window";
import useThemeStore, { changeTheme } from "../../store/theme";
import { playSound } from "../../store/sound";

const TYPE_SPEED = 28; // ms per letter as her bubble fills in
const READ_TIME = 2600; // ms the finished line stays up, plus a little per letter
const GREETED_KEY = "pixie-greeted";
const HISTORY = 8; // messages of the conversation she is reminded of
const CHAT_TIMEOUT = 120_000; // ms of nobody chatting before the box closes
const EVENTS_KEPT = 6; // recent happenings her mind is told about
const EVENT_MEMORY = 5 * 60_000; // ms she remembers them for
const VITALS_EVERY = 1500; // ms between updates of her energy etc. for her app
const THEME_FLIP_KEY = "pixie-flipped-theme"; // she flips the theme once a visit at most
const RESPECT_CHOICE = 3 * 60_000; // ms after the visitor picks a theme that she leaves it alone
const SETTLE_IN = 90_000; // ms on the page before she would touch the switch at all
const STORY_KEY = "pixie-story-seen"; // her story plays on a visitor's first visit only
const LAMP_STORY_KEY = "pixie-lamp-story"; // the story of her magic ball, told once
const LAMP_TURN = 1400; // ms for her ball to turn into a lamp before she talks about it
const LAMP_STORY_LATER = 40_000; // ms after arriving at night before she tells it anyway

const isNight = () => document.documentElement.dataset.theme === "dark";

// her story plays the first time, on a computer, unless the visitor asked
// for less motion; her app can replay it any time
const firstStory = () => {
  if (isMobile() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return localStorage.getItem(STORY_KEY) !== "1";
  } catch {
    return false;
  }
};

// where her portal opens: near where she would walk in to
const portalSpot = () => Math.round(window.innerWidth * 0.3);

const ago = (ms) => (ms < 60_000 ? `${Math.round(ms / 1000)}s ago` : `${Math.round(ms / 60_000)} min ago`);

// her answers may end with [open:finder] to open an app for the visitor
const ACTION = /\[open:([a-z]+)\]/gi;
const visible = (text) =>
  text
    .replace(ACTION, " ")
    .replace(/\s*\[[^\]]*$/, "") // a tag still arriving
    .replace(/\s+/g, " ")
    .trim();

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// waits for the startup and login screens to be gone, and for the visitor
// to pick their companion (CompanionPicker.jsx)
const desktopReady = () =>
  !document.getElementById("boot") &&
  !document.getElementById("login") &&
  !document.querySelector(".companion-picker");

const PixieOnScreen = () => {
  const root = useRef(null);
  const canvas = useRef(null);
  const layer = useRef(null); // her bed, plant and ball
  const engine = useRef(null);
  const queue = useRef([]); // lines still to come after the current one
  const [bubble, setBubble] = useState(null); // { text, id, live, kind }
  const [typed, setTyped] = useState(0);
  const [story, setStory] = useState(null); // { x, lines } while her story plays

  // the chat with her AI brain
  const [asking, setAsking] = useState(false);
  const [thinking, setThinking] = useState(false); // waiting for her first word
  const [question, setQuestion] = useState("");
  const askingRef = useRef(false);
  const history = useRef([]); // [{ role, text }]
  const pending = useRef(null); // AbortController of the answer on its way
  const input = useRef(null);
  const happenings = useRef([]); // [{ text, at }] for her mind
  // her slingshot and the light/dark switch: when the visitor last chose a
  // theme, what she flipped it to, and whether she has given up
  const themeFight = useRef({ visitorChoseAt: 0, flipTo: null, flipAt: 0, gaveUp: false });

  const say = useCallback((text) => {
    // while chatting, her own remarks would talk over the answers
    if (askingRef.current) return;
    const [first, ...rest] = Array.isArray(text) ? text : [text];
    queue.current = rest;
    setBubble({ text: first, id: Math.random() });
    setTyped(0);
    playSound("chirp");
  }, []);

  // a thought bubble: what's on her mind, no sound
  const think = useCallback((text) => {
    if (askingRef.current) return;
    queue.current = [];
    setBubble({ text, id: Math.random(), kind: "thought" });
    setTyped(0);
  }, []);

  const remember = useCallback((text) => {
    happenings.current = [...happenings.current, { text, at: Date.now() }].slice(-EVENTS_KEPT);
  }, []);

  const dismiss = () => {
    queue.current = [];
    setBubble(null);
  };

  // ------------------------------------------------------------ chatting

  const openChat = useCallback(() => {
    if (askingRef.current) {
      input.current?.focus();
      return;
    }
    askingRef.current = true;
    queue.current = [];
    setAsking(true);
    engine.current?.setBusy(true);
    setBubble({ text: pick(ASK), id: Math.random() });
    setTyped(0);
    playSound("chirp");
  }, []);

  const closeChat = useCallback(() => {
    pending.current?.abort();
    pending.current = null;
    askingRef.current = false;
    setAsking(false);
    setThinking(false);
    setBubble(null);
    engine.current?.setBusy(false);
  }, []);

  const busy = thinking || Boolean(bubble?.live);

  const submit = async (e) => {
    e.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setQuestion("");
    history.current.push({ role: "user", text });
    remember(`asked you "${text.slice(0, 60)}"`);

    const id = Math.random();
    const controller = new AbortController();
    pending.current = controller;
    setBubble({ text: "", id, live: true });
    setTyped(0);
    setThinking(true);

    let started = false;
    try {
      const answer = await askPixie(history.current.slice(-HISTORY), {
        signal: controller.signal,
        onText: (sofar) => {
          if (!started) {
            started = true;
            setThinking(false);
            playSound("chirp");
          }
          setBubble({ text: visible(sofar), id, live: true });
        },
      });
      const reply = visible(answer) || "…";
      history.current.push({ role: "model", text: reply });
      setBubble({ text: reply, id, live: false });

      // opens the app she suggested, once she has had her say
      const app = [...answer.matchAll(ACTION)].map((m) => m[1].toLowerCase()).at(-1);
      const { windows, openWindow } = useWindowStore.getState();
      if (app && windows[app]) setTimeout(() => openWindow(app), 900);
    } catch (error) {
      if (controller.signal.aborted) return;
      history.current.pop(); // the question went unanswered
      setBubble({ text: error.status === 429 ? BRAIN_TIRED : BRAIN_DOWN, id: Math.random() });
      setTyped(0);
    } finally {
      if (pending.current === controller) pending.current = null;
      setThinking(false);
    }
  };

  // the chat box closes by itself when left alone for a while
  useEffect(() => {
    if (!asking || busy) return;
    const timer = setTimeout(closeChat, CHAT_TIMEOUT);
    return () => clearTimeout(timer);
  }, [asking, busy, question, bubble, closeChat]);

  // ------------------------------------------------------------ her life

  // her behaviour runs for as long as she is on screen
  useEffect(() => {
    let mind = null;

    // she only shoots the switch once a visit, never soon after the visitor
    // chose a theme, and not at all once they've switched it back on her
    const canFlipTheme = () => {
      const fight = themeFight.current;
      if (performance.now() < SETTLE_IN) return false;
      if (fight.gaveUp || Date.now() - fight.visitorChoseAt < RESPECT_CHOICE) return false;
      try {
        if (sessionStorage.getItem(THEME_FLIP_KEY)) return false;
      } catch {
        // storage blocked: the other rules still apply
      }
      return Boolean(document.querySelector(".theme-menu > button"));
    };
    const flipTheme = () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      Object.assign(themeFight.current, { flipTo: next, flipAt: Date.now() });
      try {
        sessionStorage.setItem(THEME_FLIP_KEY, next);
      } catch {
        // storage blocked: she won't remember after a reload, which is fine
      }
      remember(`shot the light/dark switch and turned on ${next} mode`);
      changeTheme(next, document.querySelector(".theme-menu > button"));
    };

    const things = createThings({
      layer: layer.current,
      floor: floorLine,
      // the first click on her lamp tells its story
      onTouch: (name) => {
        if (name === "lamp" && tellLampStory()) return;
        pixie.touchThing(name);
      },
    });
    const pixie = createPixie({
      things,
      canFlipTheme,
      onThemeHit: flipTheme,
      root: root.current,
      canvas: canvas.current,
      say,
      think,
      chatty: () => usePixieStore.getState().chatty,
      wantPlan: () => mind?.want(),
      onEvent: remember,
      // a click opens the chat box when her brain is switched on
      onTap: () => {
        if (!brainEnabled) return false;
        openChat();
        return true;
      },
    });
    engine.current = pixie;
    mind = createMind({
      engine: pixie,
      canFlipTheme,
      isChatting: () => askingRef.current,
      events: () =>
        happenings.current
          .filter(({ at }) => Date.now() - at < EVENT_MEMORY)
          .map(({ text, at }) => `${text} (${ago(Date.now() - at)})`),
    });
    pixie.start();
    wakeBrain();

    // her magic ball, from Gourav: a ball by day and a flying lamp at night
    // (dark mode). The first time a visitor sees it, she tells its story.
    const tellLampStory = () => {
      try {
        if (localStorage.getItem(LAMP_STORY_KEY) === "1") return false;
      } catch {
        return false;
      }
      if (!things.available() || !pixie.tell(LAMP_STORY)) return false;
      try {
        localStorage.setItem(LAMP_STORY_KEY, "1");
      } catch {
        // storage blocked: she may tell it again next time
      }
      remember("told the visitor the story of your magic ball");
      return true;
    };
    let night = isNight();
    let lampTimer = null;
    things.setNight(night, true);
    const nightWatch = new MutationObserver(() => {
      if (isNight() === night) return;
      night = isNight();
      things.setNight(night);
      if (!night || !things.available()) return;
      clearTimeout(lampTimer);
      lampTimer = setTimeout(() => {
        if (!tellLampStory()) pixie.comment(pick(LAMP_ON));
      }, LAMP_TURN);
    });
    nightWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    // already night when she arrives: she tells it once she has settled in
    const lampStoryLater = setTimeout(() => {
      if (isNight()) tellLampStory();
    }, LAMP_STORY_LATER);

    // the first time in a visit she walks in and says hello; after that she
    // is simply there. Picked again later in the visit, she walks in and
    // says she's glad.
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
      const intro = brainEnabled ? [...INTRO, CHAT_INTRO] : INTRO;
      if (greeted && justPicked()) {
        remember("were picked by the visitor as their companion");
        pixie.greet([PICKED]);
      } else if (greeted) pixie.appear();
      else if (firstStory()) {
        // the first visit ever: she comes through her portal
        pixie.away();
        setStory({ x: portalSpot(), lines: [ARRIVED, ...intro] });
      } else setTimeout(() => pixie.greet(intro), 1200);
    }, 400);

    // the button in her app plays her story again
    const onStory = () => {
      closeChat();
      queue.current = [];
      setBubble(null);
      pixie.away();
      setStory({ x: portalSpot(), lines: STORY_AGAIN });
    };
    window.addEventListener("pixie:story", onStory);

    const onCall = () => pixie.call();
    window.addEventListener("pixie:call", onCall);
    // the Chat button in her app: she comes over and opens her chat box
    const onChat = () => {
      pixie.call();
      if (brainEnabled) openChat();
    };
    window.addEventListener("pixie:chat", onChat);

    // a song starts in the Music app: she dances to it, all the way through;
    // the music stops, and so does she
    const offMusic = useMusicStore.subscribe((state, previous) => {
      if (!state.playing) {
        if (previous.playing) pixie.stopDancing();
        return;
      }
      if (!songStarted(state, previous)) return;
      const song = state.songs[state.current];
      if (!pixie.dance(songLeft(state), song.bpm)) return;
      remember(`danced to "${song.title}" in the Music app`);
      if (usePixieStore.getState().chatty && Math.random() < 0.5) setTimeout(() => pixie.comment(pick(MUSIC_ON)), 400);
    });

    // how she's doing, for her app in the dock
    const vitals = setInterval(() => {
      const { doing, energy, boredom } = pixie.getState();
      const last = usePixieStore.getState().vitals;
      if (last?.doing !== doing || last?.energy !== energy || last?.boredom !== boredom) {
        usePixieStore.setState({ vitals: { doing, energy, boredom } });
      }
    }, VITALS_EVERY);

    // her things hide when switched off, or behind a full-screen window
    const syncThings = () => {
      const fullScreen = Object.values(useWindowStore.getState().windows).some(
        (w) => w.isOpen && !w.isMinimized && w.isMaximized,
      );
      things.setHidden(fullScreen || !usePixieStore.getState().things);
    };
    syncThings();
    const offSettings = usePixieStore.subscribe((state, previous) => {
      if (state.things !== previous.things) syncThings();
    });

    // remarks about apps being opened and the theme changing
    const offWindows = useWindowStore.subscribe((state, previous) => {
      syncThings();
      Object.entries(state.windows).forEach(([id, window]) => {
        const before = previous.windows[id];
        if (window.isOpen && !before?.isOpen) {
          remember(`opened the ${id} window`);
          pixie.notice();
          pixie.comment(APP_COMMENTS[id]);
        } else if (!window.isOpen && before?.isOpen) {
          remember(`closed the ${id} window`);
        } else if (window.isMinimized && !before?.isMinimized) {
          remember(`minimized the ${id} window`);
        } else if (window.isMaximized && !before?.isMaximized) {
          remember(`made the ${id} window full screen`);
        }
      });
    });
    const offTheme = useThemeStore.subscribe((state, previous) => {
      if (state.theme === previous.theme) return;
      const fight = themeFight.current;
      // her own slingshot shot: she has already said her piece
      if (state.theme === fight.flipTo && Date.now() - fight.flipAt < 3000) return;
      fight.visitorChoseAt = Date.now();
      remember(`switched the theme to ${state.theme}`);
      pixie.notice();
      // the visitor changed it back after she flipped it: she lets it go
      if (fight.flipTo && !fight.gaveUp) {
        fight.gaveUp = true;
        setTimeout(() => pixie.comment(YOU_WIN), 600);
        return;
      }
      // the page applies the theme a moment later; at night her lamp has its
      // own say (above)
      setTimeout(() => {
        const theme = document.documentElement.dataset.theme;
        if (theme === "dark" && things.available()) return;
        pixie.comment(THEME_COMMENTS[theme]);
      }, 500);
    });

    return () => {
      clearInterval(waiting);
      nightWatch.disconnect();
      clearTimeout(lampTimer);
      clearTimeout(lampStoryLater);
      window.removeEventListener("pixie:story", onStory);
      window.removeEventListener("pixie:call", onCall);
      window.removeEventListener("pixie:chat", onChat);
      offMusic();
      clearInterval(vitals);
      usePixieStore.setState({ vitals: null });
      offWindows();
      offTheme();
      offSettings();
      pending.current?.abort();
      mind.destroy();
      pixie.destroy();
      things.destroy();
      engine.current = null;
    };
  }, [say, think, remember, openChat, closeChat]);

  // out of the portal she jumps; the story counts as seen, even if skipped
  const arrive = () => {
    engine.current?.arrive(story.x, story.lines);
    try {
      localStorage.setItem(STORY_KEY, "1");
    } catch {
      // storage blocked: she may tell it again next time
    }
  };

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

  // …stays up long enough to read, then the next line or nothing (in a chat
  // her answer stays until the next question)
  useEffect(() => {
    if (!bubble || asking || typed < bubble.text.length) return;
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
  }, [bubble, typed, asking]);

  // her mouth moves while the words appear
  useEffect(() => {
    engine.current?.setTalking(typing);
  }, [typing]);

  return (
    <>
      {story && <PortalStory x={story.x} onArrive={arrive} onDone={() => setStory(null)} />}
      <div ref={layer} className="pixie-things" />
      <div ref={root} className="pixie">
        {asking ? (
          <div className="pixie-bubble chat" role="dialog" aria-label="Chat with Pixie">
            <button type="button" className="pixie-close" onClick={closeChat} aria-label="Close chat">
              <X size={14} strokeWidth={3} />
            </button>
            {thinking ? (
              <p className="pixie-line">
                <span className="pixie-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="sr-only">Pixie is thinking</span>
              </p>
            ) : (
              bubble && (
                <p className="pixie-line">
                  <span aria-hidden="true">{bubble.text.slice(0, typed)}</span>
                  <span className="sr-only" role="status">
                    {bubble.live ? "" : bubble.text}
                  </span>
                </p>
              )
            )}
            <form className="pixie-ask" onSubmit={submit}>
              <input
                ref={input}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && closeChat()}
                maxLength={300}
                placeholder="Ask me anything…"
                aria-label="Your question for Pixie"
                autoFocus
              />
              <button type="submit" disabled={busy || !question.trim()} aria-label="Send">
                <Send size={14} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        ) : (
          bubble && (
            <button
              key={bubble.id}
              type="button"
              className={clsx("pixie-bubble", bubble.kind === "thought" && "thought")}
              onClick={dismiss}
              title="Click to close"
            >
              <span aria-hidden="true">{bubble.text.slice(0, typed)}</span>
              <span className="sr-only" role="status">
                {bubble.text}
              </span>
            </button>
          )
        )}
        <canvas
          ref={canvas}
          width={WIDTH * SCALE}
          height={HEIGHT * SCALE}
          className="pixie-sprite"
          role="button"
          tabIndex={0}
          aria-label={
            brainEnabled
              ? "Pixie, your guide. Click her to ask a question."
              : "Pixie, your guide. Click her for a tip."
          }
        />
      </div>
    </>
  );
};

// Pixie, a little pixel girl who walks around the desktop, shows people how
// it works, answers questions and reacts to what they do. She's there when
// the visitor picks her as their companion (CompanionPicker.jsx); Settings ›
// Pixie hides her.
const Pixie = () => {
  const out = usePixieStore((state) => state.show && state.companion === "pixie");
  return out ? <PixieOnScreen /> : null;
};

export default Pixie;
