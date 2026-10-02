import { askMind, brainEnabled } from "./brain";
import { dockApps } from "../../constants/indax";
import useWindowStore from "../../store/window";
import usePixieStore from "../../store/pixie";

// Pixie's AI mind, on the page side: when she runs out of things to do it
// describes the moment to the server (server/mind.js) and hands the plan
// that comes back to her body. It asks at most once every MIND_GAP, only
// while someone is using the page, and backs off when the server is busy.

const MIND_GAP = 40_000; // ms between plans at most
const AWAY = 60_000; // ms without the visitor doing anything before she stops planning
const BACK_OFF = 3 * 60_000; // ms to wait after the server failed
const TIRED = 10 * 60_000; // ms to wait after hitting the server's limits

const NAMES = {
  ...Object.fromEntries(dockApps.map((app) => [app.id, app.name])),
  resume: "Resume",
  txtfile: "a text file",
  imgfile: "an image",
};

const round = (value) => Math.round(value * 100) / 100;

const partOfDay = (hour) =>
  hour < 5 ? "night" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

const describeStep = (step) =>
  [step.do, step.to, step.seconds && `${step.seconds}s`, step.text && `"${step.text}"`]
    .filter(Boolean)
    .join(" ");

/**
 * @param engine      her body (createPixie)
 * @param events      returns what happened lately, as short lines
 * @param isChatting  returns whether a visitor is chatting with her
 */
export const createMind = ({ engine, events, isChatting }) => {
  let next = 0; // when she may ask again
  let pending = null;
  let lastPlan = [];
  let stopped = false;

  const openWindows = () => {
    const open = Object.entries(useWindowStore.getState().windows).filter(([, w]) => w.isOpen);
    const front = open
      .filter(([, w]) => !w.isMinimized)
      .sort(([, a], [, b]) => b.zIndex - a.zIndex)[0]?.[0];
    return open.map(([id, w]) => {
      const rect = document.getElementById(id)?.getBoundingClientRect();
      return {
        id,
        name: NAMES[id] ?? id,
        ...(id === front && { inFront: true }),
        ...(w.isMinimized && { minimized: true }),
        ...(w.isMaximized && { fullScreen: true }),
        // which part of the screen it covers, 0 = left edge, 1 = right edge
        ...(rect?.width > 0 && {
          spans: [round(rect.left / window.innerWidth), round(rect.right / window.innerWidth)],
        }),
      };
    });
  };

  const snapshot = (me) => {
    const now = new Date();
    const mouse =
      me.pointerX === null
        ? "not seen yet"
        : Math.abs(me.pointerX - me.x) < 0.1
          ? "right next to you"
          : me.pointerX < me.x
            ? "to your left"
            : "to your right";
    return {
      time: `${now.toLocaleDateString("en-GB", { weekday: "long" })} ${partOfDay(now.getHours())}, ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      language: navigator.language,
      theme: document.documentElement.dataset.theme ?? "light",
      you: {
        position: round(me.x), // 0 = left edge, 1 = right edge
        doing: me.doing,
        mood: me.mood,
        energy: me.energy,
        boredom: me.boredom,
        secondsSinceVisitorPlayedWithYou: me.secondsSinceVisitorPlayedWithYou,
      },
      visitor: {
        idleSeconds: me.visitorIdleSeconds,
        mouse,
        recentEvents: events(),
      },
      openWindows: openWindows(),
      dock: dockApps.map(({ id, name }) => ({ id, name })),
      yourLastPlan: lastPlan,
    };
  };

  const want = async () => {
    const now = Date.now();
    if (stopped || !brainEnabled || !usePixieStore.getState().mind) return;
    if (pending || now < next || isChatting() || document.hidden) return;
    // not while the startup or login screen is up
    if (document.getElementById("boot") || document.getElementById("login")) return;
    const me = engine.getState();
    if (me.visitorIdleSeconds * 1000 > AWAY) return;

    next = now + MIND_GAP;
    pending = new AbortController();
    try {
      const decision = await askMind(snapshot(me), { signal: pending.signal });
      if (stopped || isChatting() || !usePixieStore.getState().mind) return;
      engine.setPlan(decision);
      lastPlan = decision.plan.map(describeStep);
      usePixieStore.setState({ mood: decision.mood, thought: decision.thought });
    } catch (error) {
      if (error.name === "AbortError") return;
      next = Date.now() + (error.status === 429 ? TIRED : BACK_OFF);
    } finally {
      pending = null;
    }
  };

  return {
    want,
    destroy() {
      stopped = true;
      pending?.abort();
    },
  };
};
