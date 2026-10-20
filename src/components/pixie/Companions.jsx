import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CAST_SIZE, TYPE_SPEED, createPerson, createScript } from "./cast";
import { createCastThings } from "./castThings";
import ThoughtPicture from "./ThoughtPicture";
import {
  ABOUT,
  AFTER_VISIT,
  APP_LINES,
  BENCH_START,
  BENCH_THOUGHTS,
  BIRD_DANCES,
  BIRD_DANCING,
  BIRD_OWN_SONG,
  BIRD_REPLY,
  BIRD_SAYS,
  DANCE_LINES,
  CALLED,
  CODE_THOUGHTS,
  COFFEE_RUN,
  COFFEE_THOUGHTS,
  DESK_DONE,
  DROPPED,
  EMPTY_MUG,
  MUSIC_FOCUS,
  FRESH_COFFEE,
  HELD,
  HELLO,
  HER_NAME,
  HUG_ASK,
  HUG_SAYS,
  MUSINGS,
  PAINTED,
  PAINT_THOUGHTS,
  PICKED,
  READ_DONE,
  READ_START,
  READ_THOUGHTS,
  ROBOT_LINES,
  SHELF_LINES,
  THINKING_OF,
  THING_LINES,
  TIPS,
  VISIT_BYE,
  VISIT_CLICK,
  VISIT_CUT,
  VISIT_HELLO,
  VISIT_TALKS,
} from "./castLines";
import usePixieStore, { justPicked } from "../../store/pixie";
import useMusicStore from "../../store/music";
import * as synth from "../../music/synth";
import useWindowStore from "../../store/window";
import { playSound } from "../../store/sound";

const HELLO_KEY = "companion-greeted"; // + who: each says hello once a visit
const QUIET_FOR = 1200; // ms of quiet before they speak up on their own
const WORK_EVERY = [14_000, 30_000]; // ms between spells at their desk or easel
const TIP_EVERY = [50_000, 80_000]; // ms between tips
const MUSE_EVERY = [70_000, 140_000]; // ms between little remarks to themselves
const APP_LINE_GAP = 5000; // ms between remarks about apps
const AWAY_AFTER = 120_000; // ms of no pointer or keys: nobody's there to hear them
const DRAG_START = 6; // px the pointer moves before a press becomes a drag
const THINK_EVERY = [7000, 12_000]; // ms between thoughts while they work
const SIP_AFTER = 1600; // ms after thinking of coffee that he has a sip
const UP_AFTER = 2600; // ms after finding his mug empty that he gets up for more
const BREW_SECONDS = 3.2; // s at the coffee machine
const THOUGHTS_KEPT = 8; // recent thoughts their app shows
const READ_EVERY = 0.3; // how often a spell of work is a reading break instead (Gourav)
const READ_SECONDS = [14, 24]; // s he reads for
const DANCE_FOR = 7; // s they dance when a song starts
const BENCH_EVERY = 0.35; // how often a spell of work is a sit on her park bench instead (her)
const BENCH_FOR = [16_000, 26_000]; // ms she sits there, on her own
const VISIT_CHANCE = 0.7; // how often Gourav comes to sit with her
const VISIT_AFTER = [4000, 9000]; // ms after she sits down that he walks in
const HUG_FOR = 6000; // ms they hug
const AFTER_VISIT_FOR = [5000, 9000]; // ms she stays on the bench once he's gone

const NAMES = { gourav: "Gourav", her: HER_NAME };
const LABELS = {
  gourav: "Gourav, who made this desktop, your guide. Click him for a tip, or drag him about.",
  her: `${HER_NAME}, a girl about Gourav's age, your guide. Click her for a tip, or drag her about.`,
};
// what they do at their things: Gourav sits at his desk and types (drawn
// with it, from behind), she paints
const WORK = {
  gourav: { pose: "type", seconds: [25, 45], sits: true },
  her: { pose: "paint", seconds: [10, 20], sits: false },
};

// a click gives a tip, then something about them, and so on
const interleave = (a, b) =>
  Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]])
    .flat()
    .filter(Boolean);
const CLICKS = { gourav: interleave(TIPS.gourav, ABOUT.gourav), her: interleave(TIPS.her, ABOUT.her) };

const between = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const desktopReady = () =>
  !document.getElementById("boot") &&
  !document.getElementById("login") &&
  !document.querySelector(".pixie-story, .companion-picker");

const CompanionOnScreen = ({ who }) => {
  const root = useRef(null); // holds their canvas and bubble
  const guestRoot = useRef(null); // Gourav, visiting her on her park bench
  const layer = useRef(null); // their things
  const stage = useRef(null);
  const script = useRef(null);
  const clicks = useRef(0); // the next click line
  const talk = useRef(null); // a click on them: their next line
  const [line, setLine] = useState(null); // { who, text, id }
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = root.current.querySelector("canvas");
    const person = createPerson(who, {
      root: root.current,
      canvas,
      still,
      onLand: () => say(pick(DROPPED[who])),
      // the song's beat, for dancing in time
      beat: () => {
        const { playing, songs, current } = useMusicStore.getState();
        return playing ? (synth.position() * songs[current].bpm) / 60 : null;
      },
    });
    // with her, Gourav comes to visit now and then: he walks in, sits with
    // her on her park bench, and off he goes again
    const guestCanvas = guestRoot.current?.querySelector("canvas");
    const guest = guestCanvas ? createPerson("gourav", { root: guestRoot.current, canvas: guestCanvas, still }) : null;
    if (guest) guestRoot.current.style.visibility = "hidden";
    // whoever's talking: their mouth moves, on the screen or on her bench
    const voice = (name, body) => ({
      setTalking(talking) {
        body.setTalking(talking);
        things.mouth?.(name, talking);
      },
      act: (pose, seconds) => body.act(pose, seconds),
    });
    const play = createScript({
      people: { [who]: voice(who, person), ...(guest && { gourav: voice("gourav", guest) }) },
      show: (next) => {
        setLine(next);
        setTyped(0);
        const spoken = Boolean(next) && next.kind !== "thought";
        if (spoken) playSound("chirp");
        // in his chair, he turns round to talk (not to think)
        things.setTalking?.(spoken);
      },
    });
    script.current = play;
    const say = (...lines) =>
      play.play(lines.map((said) => ({ who, ...(typeof said === "string" ? { text: said } : said) })));
    // a thought bubble, if they share their thoughts: a line, or { text,
    // picture } with a little picture in it (one of a list of pictures, at
    // random); their app lists them
    const thoughts = []; // [{ text, picture, at }], newest first
    const think = (thought) => {
      if (!usePixieStore.getState().chatty) return;
      const { text, picture: pictures } = typeof thought === "string" ? { text: thought } : thought;
      const picture = Array.isArray(pictures) ? pick(pictures) : pictures;
      play.play([{ who, text, picture, kind: "thought" }]);
      thoughts.unshift({ text, picture, at: Date.now() });
      thoughts.length = Math.min(thoughts.length, THOUGHTS_KEPT);
    };

    // their things: a click gets a word about it
    const things = createCastThings(who, {
      layer: layer.current,
      onTouch: (name) => {
        // Neel, her parakeet, squawks a word or two, and sometimes she answers
        if (name === "bird") {
          birdTalks();
          return;
        }
        playSound(name === "robot" ? "beep" : "pop");
        if (name === "robot") {
          say(pick(ROBOT_LINES));
          return;
        }
        // Gourav, sitting with her on her bench
        if (name === "guest") {
          say({ who: "gourav", text: pick(VISIT_CLICK.gourav) });
          return;
        }
        // his bookshelf: a word, and his book opens
        if (name === "shelf") {
          say(pick(SHELF_LINES));
          setTimeout(() => useWindowStore.getState().openWindow("book"), 1100);
          return;
        }
        say(pick(THING_LINES[name]));
      },
      onPainted: (picture) => {
        person.stopWork();
        say({ text: PAINTED[picture], pose: "jump" });
      },
      onPerson: (e) => grab(e),
    });

    // her park bench: now and then, instead of painting, she sits there a
    // while; often Gourav comes and sits with her, they talk, hug, and then
    // he has to get back to work. A visit goes "coming" (he walks in),
    // "talk", "ask" (for a hug), "hug", "bye", then "going" (he walks off).
    let onBench = false;
    let benchUntil = 0;
    let visitAt = 0;
    let visit = null; // { stage, next } while he's here
    let visits = 0; // times he's come this visit
    const guestSays = (text) => ({ who: "gourav", text });
    // they talk if they share their thoughts; quietly, they just sit
    const talkTogether = (lines) => {
      if (usePixieStore.getState().chatty) say(...lines);
    };
    // he's off the screen again
    const guestGone = () => {
      if (guestRoot.current) guestRoot.current.style.visibility = "hidden";
      visit = null;
      if (onBench) {
        benchUntil = performance.now() + between(...AFTER_VISIT_FOR);
        think(pick(AFTER_VISIT));
      }
    };
    // up he gets from the bench, and away
    const guestUp = () => {
      things.hug(false);
      things.sit("him", false);
      guest.setHidden(false);
      guest.stopWork();
    };
    const startVisit = () => {
      visitAt = 0;
      visits += 1;
      visit = { stage: "coming", next: 0 };
      guestRoot.current.style.visibility = "";
      guest.enter(false);
      guest.work({
        at: () => things.benchSpot("him"),
        pose: "stand",
        face: -1,
        seconds: Infinity,
        fast: true,
        onStart: () => {
          if (!visit) return;
          guest.setHidden(true);
          things.sit("him", true);
          visit = { stage: "talk", next: performance.now() + 3000 };
          talkTogether(pick(VISIT_TALKS));
        },
      });
      if (usePixieStore.getState().chatty) setTimeout(() => visit?.stage === "coming" && say(guestSays(pick(VISIT_HELLO))), 600);
    };
    // she's carried off or called away mid-visit: off he goes
    const cutVisit = () => {
      if (!visit || visit.stage === "going") return;
      guestUp();
      visit = { stage: "going", next: 0 };
      guest.leave(guestGone);
      setTimeout(() => {
        if (!play.busy() && usePixieStore.getState().chatty) say(guestSays(pick(VISIT_CUT)));
      }, 1800);
    };
    // a visit, a step at a time, once what they're saying is said
    const stepVisit = (now) => {
      if (!visit || play.busy() || now < visit.next) return;
      if (visit.stage === "talk") {
        visit = { stage: "ask", next: now + 1200 };
        talkTogether([pick(HUG_ASK)]);
      } else if (visit.stage === "ask") {
        things.hug(true);
        visit = { stage: "hug", next: now + HUG_FOR };
        setTimeout(() => visit?.stage === "hug" && talkTogether([pick(HUG_SAYS)]), 1500);
      } else if (visit.stage === "hug") {
        things.hug(false);
        visit = { stage: "bye", next: now + 2500 };
        talkTogether(pick(VISIT_BYE));
      } else if (visit.stage === "bye") {
        guestUp();
        visit = { stage: "going", next: Infinity };
        // a wave goodbye, then away
        guest.act("raise", 1.4);
        setTimeout(() => visit?.stage === "going" && guest.leave(guestGone), 1400);
      }
    };
    const sitOnBench = () => {
      if (usePixieStore.getState().chatty) say(pick(BENCH_START));
      person.work({
        at: () => things.benchSpot("her"),
        pose: "stand",
        face: 1,
        seconds: Infinity, // till she gets up (benchUntil)
        onStart: () => {
          onBench = true;
          things.sit("her", true);
          person.setHidden(true);
          benchUntil = performance.now() + between(...BENCH_FOR);
          thinkAt = performance.now() + between(2500, 4500);
          if (guest && Math.random() < VISIT_CHANCE) visitAt = performance.now() + between(...VISIT_AFTER);
        },
        onEnd: () => {
          if (!onBench) return;
          onBench = false;
          visitAt = 0;
          things.sit("her", false);
          person.setHidden(false);
          workAt = performance.now() + between(...WORK_EVERY);
          cutVisit();
        },
      });
    };
    // his visit, from the watch below
    const benchWatch = (now) => {
      stepVisit(now);
      if (!onBench) return;
      if (visitAt && now >= visitAt && !visit && !play.busy() && !fullScreen()) startVisit();
      else if (!visit && !visitAt && now >= benchUntil && !play.busy()) person.stopWork();
    };

    const birdTalks = () => {
      if (!things.birdSay) return;
      playSound("squawk");
      things.birdSay(pick(BIRD_SAYS));
      if (Math.random() < 0.45) setTimeout(() => say(pick(BIRD_REPLY)), 1500);
    };

    // a song starts: they dance to it a little while (up from his desk, if
    // he's at it; not with a mug in his hand), and Neel dances on his perch
    // (castThings.js), squawks about it, and she cheers him on
    const offMusic = useMusicStore.subscribe((state, previous) => {
      if (!state.playing) return;
      const fresh = !previous.playing || state.current !== previous.current;
      if (!fresh) return;
      // Gourav doesn't dance: music helps him focus, so he says so and
      // gets on with his work (his head bobs to it at his desk, castThings.js)
      if (who === "gourav") {
        if (!greeted || coffeeRun) return;
        if (usePixieStore.getState().chatty) setTimeout(() => say(pick(MUSIC_FOCUS)), 300);
        if (person.free() && thingsOn() && !fullScreen()) startWork();
        return;
      }
      if (greeted) {
        person.stopWork();
        if (person.dance(DANCE_FOR) && usePixieStore.getState().chatty && Math.random() < 0.5) {
          setTimeout(() => say(pick(DANCE_LINES[who])), 300);
        }
      }
      if (!things.birdSay) return;
      const own = state.songs[state.current].id === "neels-song";
      setTimeout(() => {
        playSound("squawk");
        things.birdSay(own ? BIRD_OWN_SONG : pick(BIRD_DANCES));
      }, 900);
      if (greeted && Math.random() < 0.6) setTimeout(() => say(pick(BIRD_DANCING)), 3200);
    });

    // a click on them is their next line, in turn
    talk.current = () => {
      // with Gourav: a word about him
      if (visit) {
        say(pick(VISIT_CLICK[who]));
        return;
      }
      const lines = CLICKS[who];
      const next = lines[clicks.current % lines.length];
      clicks.current += 1;
      // on her bench she stays sitting (no pose)
      say(onBench && typeof next !== "string" ? next.text : next);
    };
    // a click on Gourav, walking in or off
    const guestClick = () => say(guestSays(pick(VISIT_CLICK.gourav)));
    guestCanvas?.addEventListener("click", guestClick);

    // press and drag to pick them up (out of his chair, too); let go and
    // down they drop. A press that doesn't move is a click.
    const grab = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const from = { x: e.clientX, y: e.clientY };
      let dragging = false;
      const move = (ev) => {
        if (!dragging) {
          if (Math.hypot(ev.clientX - from.x, ev.clientY - from.y) < DRAG_START) return;
          dragging = true;
          person.stopWork();
          dropCoffee();
          person.pickUp(from.x, from.y);
          say(pick(HELD[who]));
        }
        person.carry(ev.clientX, ev.clientY);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        if (dragging) person.drop();
        else talk.current();
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    };
    canvas.addEventListener("pointerdown", grab);

    let frame = 0;
    const loop = (ms) => {
      person.tick(ms / 1000);
      guest?.tick(ms / 1000);
      things.tick(ms / 1000);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // they hide behind a full-screen window, like Pixie; their things can be
    // switched off
    const fullScreen = () =>
      Object.values(useWindowStore.getState().windows).some((w) => w.isOpen && !w.isMinimized && w.isMaximized);
    const thingsOn = () => usePixieStore.getState().things;
    const sync = () => {
      const hide = fullScreen();
      stage.current?.classList.toggle("hidden", hide);
      things.setHidden(!thingsOn());
      if (hide && play.busy()) play.stop();
      // her bench is hidden: she gets up off it
      if (!thingsOn() && onBench) person.stopWork();
    };
    sync();
    const offSettings = usePixieStore.subscribe(sync);

    // each app gets a remark, and they walk over to its window
    let greeted = false;
    let lastAppLine = 0;
    const offWindows = useWindowStore.subscribe((state, previous) => {
      sync();
      if (!greeted) return;
      const opened = Object.keys(state.windows).find((id) => state.windows[id].isOpen && !previous.windows[id]?.isOpen);
      if (!opened) return;
      setTimeout(() => {
        const box = document.getElementById(opened)?.getBoundingClientRect();
        if (box?.width) person.goTo(box.left + box.width / 2);
      }, 400);
      const remark = APP_LINES[who][opened];
      if (!remark || fullScreen() || performance.now() - lastAppLine < APP_LINE_GAP) return;
      lastAppLine = performance.now();
      say(remark);
    });

    // is anyone there to hear them?
    let lastActive = performance.now();
    const active = () => {
      lastActive = performance.now();
    };
    window.addEventListener("pointermove", active, { passive: true });
    window.addEventListener("keydown", active);
    const listening = () =>
      usePixieStore.getState().chatty && !fullScreen() && !document.hidden && performance.now() - lastActive < AWAY_AFTER;

    let quietSince = performance.now();
    const quiet = () => {
      if (play.busy() || !desktopReady()) quietSince = performance.now();
      return performance.now() - quietSince >= QUIET_FOR;
    };

    // they walk in and say hello: the first time in a visit, or when picked
    // just now; otherwise they're simply there
    const helloKey = `${HELLO_KEY}-${who}`;
    let seen = false;
    try {
      seen = sessionStorage.getItem(helloKey) === "1";
    } catch {
      // storage blocked: they greet every time, which is fine
    }
    const lines = seen ? (justPicked() ? [PICKED[who]] : null) : HELLO[who];
    let entering = false;
    if (!lines) greeted = true;
    // out of sight until they walk in
    else root.current.style.visibility = "hidden";

    // at their desk or easel a while, thinking now and then
    let thinkAt = 0;
    let sipAt = 0;
    let upAt = 0;
    let coffeeRun = false; // Gourav, off to fill his mug
    let reading = false; // Gourav, reading a book from his shelf
    let mugs = 0; // mugs he's filled this visit
    // a coffee run cut short (picked up, called over): his mug goes back on
    // the desk, full
    const dropCoffee = () => {
      if (person.holding()) {
        person.setHolding(null);
        things.putMug(true);
      }
      coffeeRun = false;
    };
    const startWork = (withFreshCoffee = false) => {
      const { pose, seconds, sits } = WORK[who];
      let started = false;
      person.work({
        at: things.spot,
        pose,
        face: 1,
        seconds: between(...seconds),
        // back from the coffee machine, across the screen: hurry
        fast: withFreshCoffee,
        onStart: () => {
          started = true;
          if (withFreshCoffee) {
            person.setHolding(null);
            things.putMug(true);
            coffeeRun = false;
            mugs += 1;
            setTimeout(() => think(pick(FRESH_COFFEE)), 700);
          }
          things.setBusy(true);
          if (sits) person.setHidden(true);
          thinkAt = performance.now() + between(...THINK_EVERY);
        },
        onEnd: (done) => {
          things.setBusy(false);
          person.setHidden(false);
          // a break before the next spell of work
          workAt = performance.now() + between(...WORK_EVERY);
          // stopped on the way back: the mug goes on the desk anyway
          if (withFreshCoffee && !started) {
            person.setHolding(null);
            things.putMug(true);
            coffeeRun = false;
          }
          if (done && !coffeeRun && who === "gourav" && listening() && Math.random() < 0.5) say(pick(DESK_DONE));
        },
      });
    };

    // now and then, instead of coding, Gourav takes a book from his shelf and
    // reads it there a while, then puts it back
    const readBook = () => {
      if (usePixieStore.getState().chatty) say(pick(READ_START));
      person.work({
        at: things.shelfSpot,
        pose: "read",
        face: 1,
        seconds: between(...READ_SECONDS),
        fast: true,
        onStart: () => {
          reading = true;
          things.takeBook();
          thinkAt = performance.now() + between(2500, 4500);
        },
        onEnd: (done) => {
          reading = false;
          things.returnBook();
          workAt = performance.now() + between(...WORK_EVERY);
          if (done && listening() && Math.random() < 0.5) say(pick(READ_DONE));
        },
      });
    };

    // his mug's empty: up he gets, takes it to the coffee machine, fills it,
    // and back to work
    const goForCoffee = () => {
      coffeeRun = true;
      person.stopWork();
      things.takeMug();
      person.setHolding("mug");
      say(pick(COFFEE_RUN));
      person.work({
        at: things.machineSpot,
        pose: "stand",
        face: 1,
        seconds: BREW_SECONDS,
        fast: true,
        onStart: () => {
          person.setHolding(null);
          things.brew();
        },
        onEnd: (done) => {
          if (!done) {
            person.setHolding(null);
            things.putMug(true);
            coffeeRun = false;
            return;
          }
          things.takeMug();
          person.setHolding("mug");
          startWork(true);
        },
      });
    };

    // called over from their app: they come to the middle and say hi
    let called = false;
    const onCall = () => {
      if (!greeted) return;
      person.stopWork();
      dropCoffee();
      person.goTo(window.innerWidth / 2);
      called = true;
    };
    window.addEventListener("cast:call", onCall);

    // how they're doing, for their app in the dock
    let reported = "";
    const report = () => {
      const vitals = {
        who,
        doing: coffeeRun
          ? "coffee"
          : reading && person.working()
            ? "read"
            : onBench && visit && !["coming", "going"].includes(visit.stage)
              ? "date"
              : onBench
                ? "bench"
                : person.doing(),
        visits,
        thought: thoughts[0]?.text ?? "",
        thoughts: [...thoughts],
        mugs,
        ...things.report(),
      };
      const key = JSON.stringify(vitals);
      if (key === reported) return;
      reported = key;
      usePixieStore.setState({ castVitals: vitals });
    };

    let workAt = performance.now() + between(6000, 12_000);
    let tipAt = performance.now() + between(...TIP_EVERY);
    let museAt = performance.now() + between(...MUSE_EVERY);
    let tips = 0;
    const watch = setInterval(() => {
      const now = performance.now();
      const ok = quiet();
      report();
      if (!desktopReady()) return;

      if (!greeted) {
        if (!entering) {
          entering = true;
          person.enter();
          root.current.style.visibility = "";
          return;
        }
        if (!person.free()) return;
        greeted = true;
        try {
          sessionStorage.setItem(helloKey, "1");
        } catch {
          // storage blocked: they may greet again after a reload
        }
        say(...lines);
        return;
      }

      if (called && person.free()) {
        called = false;
        say({ text: pick(CALLED[who]), pose: "raise" });
        return;
      }
      benchWatch(now);

      // to their desk or easel now and then
      if (now >= workAt && person.free() && ok) {
        workAt = now + between(...WORK_EVERY);
        if (thingsOn() && !fullScreen()) {
          if (who === "gourav" && Math.random() < READ_EVERY) readBook();
          else if (who === "her" && Math.random() < BENCH_EVERY) sitOnBench();
          else startWork();
          return;
        }
      }

      // at work, a thought now and then. Gourav's are mostly about coffee:
      // a sip, and when the mug's empty, more
      if (person.working() && !coffeeRun && now >= thinkAt && !play.busy()) {
        thinkAt = now + between(...THINK_EVERY);
        const roll = Math.random();
        if (who === "gourav" && reading) think(pick(READ_THOUGHTS));
        // on her bench: thinking of him, or the park (not while he's there)
        else if (onBench) {
          if (!visit) think(pick(BENCH_THOUGHTS));
        } else if (who === "gourav") {
          // mostly coffee and her; now and then the code
          if (things.sipsLeft() <= 0) {
            think(pick(EMPTY_MUG));
            upAt = now + UP_AFTER;
          } else if (roll < 0.45) {
            think(pick(COFFEE_THOUGHTS));
            sipAt = now + SIP_AFTER;
          } else if (roll < 0.8) think(pick(THINKING_OF.gourav));
          else think(pick(CODE_THOUGHTS));
        } else if (roll < 0.35) think(pick(PAINT_THOUGHTS));
        else if (roll < 0.75) think(pick(THINKING_OF.her));
      }
      if (sipAt && now >= sipAt) {
        sipAt = 0;
        things.sip?.();
      }
      if (upAt && now >= upAt && !play.busy()) {
        upAt = 0;
        if (things.seated?.() && person.working()) goForCoffee();
      }
      // resting on her bench: no tips or remarks meanwhile
      if (!ok || onBench) return;

      // a tip now and then, or a word to themselves
      if (now >= tipAt) {
        tipAt = now + between(...TIP_EVERY);
        if (listening()) say(TIPS[who][tips++ % TIPS[who].length]);
        return;
      }
      // a word to themselves, or a thought of the other one
      if (now >= museAt) {
        museAt = now + between(...MUSE_EVERY);
        if (!listening()) return;
        const roll = Math.random();
        if (roll < 0.4) say(pick(MUSINGS[who]));
        else if (roll < 0.75 || who !== "her") think(pick(THINKING_OF[who]));
        else birdTalks();
      }
    }, 300);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(watch);
      canvas.removeEventListener("pointerdown", grab);
      guestCanvas?.removeEventListener("click", guestClick);
      window.removeEventListener("cast:call", onCall);
      offMusic();
      usePixieStore.setState({ castVitals: null });
      offWindows();
      offSettings();
      window.removeEventListener("pointermove", active);
      window.removeEventListener("keydown", active);
      play.stop();
      things.destroy();
      script.current = null;
    };
  }, [who]);

  // the bubble fills in letter by letter
  useEffect(() => {
    if (!line) return;
    const timer = setInterval(() => setTyped((count) => Math.min(count + 1, line.text.length)), TYPE_SPEED);
    return () => clearInterval(timer);
  }, [line]);

  // a line in the bubble over whoever says it: them, or Gourav visiting her
  const bubble = line && (
    <button
      key={line.id}
      type="button"
      className={clsx("pixie-bubble cast-bubble", line.kind === "thought" && "thought")}
      onClick={() => script.current?.stop()}
      title="Click to close"
    >
      <b className="cast-name">{NAMES[line.who]}</b>
      {line.picture && <ThoughtPicture name={line.picture} />}
      <span aria-hidden="true">{line.text.slice(0, typed)}</span>
      <span className="sr-only" role="status">
        {`${NAMES[line.who]}: ${line.text}`}
      </span>
    </button>
  );

  return (
    <div ref={stage} className="cast">
      <div ref={layer} className="cast-things" />
      <div ref={root} className={clsx("cast-person", who)} style={CAST_SIZE[who]}>
        {line?.who === who && bubble}
        <canvas
          width={CAST_SIZE[who].width}
          height={CAST_SIZE[who].height}
          className="cast-sprite"
          role="button"
          tabIndex={0}
          aria-label={LABELS[who]}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            talk.current?.();
          }}
        />
      </div>
      {who === "her" && (
        <div ref={guestRoot} className="cast-person gourav guest" style={CAST_SIZE.gourav}>
          {line?.who === "gourav" && bubble}
          <canvas
            width={CAST_SIZE.gourav.width}
            height={CAST_SIZE.gourav.height}
            className="cast-sprite"
            aria-label="Gourav, come to see her"
          />
        </div>
      )}
    </div>
  );
};

// Gourav or someone special, when the visitor picks them as their companion
// (CompanionPicker.jsx): only the one they pick is on the desktop, with their
// own things and their own lines. Pixie has her own (Pixie.jsx). Settings ›
// Pixie hides them.
const Companions = () => {
  const who = usePixieStore((state) => (state.show ? state.companion : ""));
  return who === "gourav" || who === "her" ? <CompanionOnScreen key={who} who={who} /> : null;
};

export default Companions;
