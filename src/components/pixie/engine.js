import { WIDTH, HEIGHT, SCALE, drawFrame } from "./sprites";
import * as LINES from "./lines";

// Pixie's behaviour: where she is, what she is doing and how she reacts.
// It moves her element directly every frame rather than through React, so
// she costs nothing when nothing else on the page changes.
//
// What she does next comes from her AI mind when it is switched on: a short
// plan of steps (walk somewhere, sit, think something…) that she carries out
// in order. Without a plan she wanders about on her own. Clicks, drags and
// falls are always handled here, straight away.
//
// She has things on the desktop too (things.js): a bed she sleeps in, a ball
// she chases, a plant she waters. And a slingshot, a book and her dancing.

const W = WIDTH * SCALE;
const H = HEIGHT * SCALE;
const FLOOR_GAP = 112; // px from the bottom of the screen: just above the dock
const WALK_SPEED = 45; // px per second, wandering about
const TROT_SPEED = 120; // px per second, when she has somewhere to be
const GRAVITY = 2200; // px per second², when dropped
const SLEEP_AFTER = 45_000; // ms with nobody using the page before she naps
const COMMENT_GAP = 6000; // ms between remarks about what you are doing
const DRAG_START = 6; // px the pointer moves before a press becomes a pick-up
const DOUBLE_CLICK = 240; // ms to wait for a second click before acting on one
const PLAN_STALE = 90_000; // ms before an unfinished plan is out of date
const KICK_REACH = 10; // px from the ball before she can kick it

// her taste: light mode late at night is too bright, dark mode in the middle
// of the day too gloomy
const dislikesTheme = () => {
  const hour = new Date().getHours();
  const dark = document.documentElement.dataset.theme === "dark";
  return dark ? hour >= 9 && hour < 17 : hour >= 21 || hour < 6;
};

// the line her feet (and her things) stand on, in px from the top
export const floorLine = () => window.innerHeight - FLOOR_GAP;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.random() * (max - min);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @param root    element moved around the screen (holds sprite and bubble)
 * @param canvas  where she is drawn
 * @param say     shows a line (or a list of lines, in turn) in her bubble
 * @param chatty  returns whether she may share tips on her own
 * @param think   shows a line in a thought bubble
 * @param onTap   called when she is clicked; returning true means it was
 *                handled (her chat box opened), so she gives no tip
 * @param wantPlan  called when she has run out of plan; her mind may answer
 *                  later through setPlan
 * @param onEvent   told what the visitor did to her ("picked you up", …)
 * @param things    her bed, plant and ball (things.js), or null
 * @param canFlipTheme  returns whether she may shoot the light/dark switch now
 * @param onThemeHit    called when her star hits it, to flip the theme
 */
export const createPixie = ({
  root,
  canvas,
  say,
  think,
  chatty,
  onTap,
  wantPlan,
  onEvent,
  things = null,
  canFlipTheme = () => false,
  onThemeHit,
}) => {
  const ctx = canvas.getContext("2d");
  const floor = () => window.innerHeight - FLOOR_GAP - H;

  const pet = {
    x: -W,
    y: floor(),
    facingLeft: false,
    mode: "idle",
    time: 0,
    length: 2,
    targetX: 0,
    speed: WALK_SPEED,
    onArrive: null,
    vy: 0,
    lift: 0, // hop height
    spin: 0, // twirl
    tilt: 0, // swinging while held
    squash: 1, // landing
    blinkIn: 3,
    talking: false,
    busy: false, // chatting with a visitor: she stays put and listens
    plan: [], // steps from her mind still to do
    planAt: 0,
    mood: "happy",
    energy: between(70, 90), // 0-100: tires walking, recovers sitting and napping
    boredom: 20, // 0-100: grows when nothing happens
    lastTouched: null, // when the visitor last played with her
    lookX: 0,
    puffIn: 0,
    shot: null, // where her slingshot is aimed
    tip: 0,
    lastActive: performance.now(),
    lastSpoke: performance.now(),
    nextChat: between(50_000, 80_000),
    lastComment: 0,
    pointerX: null,
  };

  const setMode = (mode, length = 0) => {
    if (pet.mode === "bed" && mode !== "bed") things?.bed.empty();
    pet.lift = 0;
    pet.mode = mode;
    pet.time = 0;
    pet.length = length;
  };

  // a pause between things: short when a plan is waiting
  const rest = (min, max) => setMode("idle", pet.plan.length ? 0.4 : between(min, max));

  const speak = (text) => {
    pet.lastSpoke = performance.now();
    say(text);
  };

  const muse = (text) => {
    pet.lastSpoke = performance.now();
    think?.(text);
  };

  // the visitor played with her
  const touched = (what) => {
    pet.lastTouched = performance.now();
    pet.boredom = clamp(pet.boredom - 25, 0, 100);
    onEvent?.(what);
  };

  // ------------------------------------------------------------ her things

  // her things can be switched off, and hide behind full-screen windows
  const hasThings = () => Boolean(things?.available());

  // walks to her bed and climbs in, for `seconds` (0: until someone wakes her);
  // without her bed she naps where she is
  const goToBed = (seconds, speed = WALK_SPEED) => {
    if (!hasThings()) {
      setMode("sleep", seconds);
      return;
    }
    walkTo(things.bed.headX() - W / 2, () => {
      if (!hasThings()) return setMode("sleep", seconds);
      things.bed.tuckIn();
      setMode("bed", seconds);
      if (chatty() && Math.random() < 0.5) speak(pick(LINES.BEDTIME));
    }, speed);
  };

  // where a slingshot star should go: a dock icon, a window, her ball or the sky
  const aimAt = (to) => {
    const onScreen = (rect) =>
      rect && rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight - 4;
    const [kind, id = ""] = String(to ?? "sky").split(":");
    if (kind === "dock") {
      const element = document.querySelector(`#dock [data-app="${CSS.escape(id)}"]`);
      const rect = element?.getBoundingClientRect();
      if (onScreen(rect)) {
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, element };
      }
    }
    if (kind === "window") {
      const element = document.getElementById(id);
      const rect = element?.getBoundingClientRect();
      if (onScreen(rect)) {
        return { x: rect.left + rect.width * between(0.3, 0.7), y: rect.top + 18, element };
      }
    }
    if (kind === "ball" && hasThings()) {
      return { x: things.ball.center(), y: things.ball.top() + 12, ball: true };
    }
    // the light/dark switch in the menu bar
    if (kind === "theme" && hasThings() && canFlipTheme()) {
      const element = document.querySelector(".theme-menu > button");
      const rect = element?.getBoundingClientRect();
      if (onScreen(rect)) {
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, element, theme: true };
      }
    }
    const side = Math.random() < 0.5 ? -1 : 1;
    return { x: pet.x + W / 2 + side * between(120, 360), y: -40 };
  };

  // the top of her slingshot, where the stars fly from
  const slingshotTip = () => ({
    x: pet.x + (pet.facingLeft ? WIDTH - 1 - 20 : 20) * SCALE + SCALE / 2,
    y: pet.y - pet.lift + 9 * SCALE,
  });

  const randomDockIcon = () => {
    const icons = [...document.querySelectorAll("#dock [data-app]")];
    return icons.length ? `dock:${pick(icons).dataset.app}` : "sky";
  };

  const walkTo = (x, onArrive = null, speed = WALK_SPEED) => {
    pet.targetX = clamp(x, 8, window.innerWidth - W - 8);
    pet.onArrive = onArrive;
    pet.speed = speed;
    setMode("walk");
  };

  // little floating symbols: Zzz while asleep, hearts, sparkles
  const puff = (text, className = "") => {
    const span = document.createElement("span");
    span.className = `pixie-fx ${className}`;
    span.textContent = text;
    span.setAttribute("aria-hidden", "true");
    span.addEventListener("animationend", () => span.remove());
    root.appendChild(span);
  };

  const nextTip = () => {
    const tip = LINES.TIPS[pet.tip % LINES.TIPS.length];
    pet.tip += 1;
    return tip;
  };

  // ------------------------------------------------------------ choosing what to do

  // on her own: a little random, coloured by how she feels
  const wander = () => {
    const roll = Math.random();
    if ((pet.energy < 25 || pet.mood === "sleepy") && roll < 0.5) {
      if (hasThings()) goToBed(between(12, 25));
      else setMode("sit", between(6, 12));
      return;
    }
    // now and then, one of her pastimes
    if (roll < 0.3) {
      const pastimes = ["read", "dance", "slingshot"];
      // she doesn't like the light or dark mode: time for her slingshot
      if (dislikesTheme() && canFlipTheme()) {
        pastimes.push("theme", "theme", "theme");
      }
      if (hasThings()) pastimes.push("kick", "kick");
      if (hasThings() && things.plant.thirsty()) pastimes.push("water", "water");
      const what = pick(pastimes);
      if (what === "theme") {
        runStep({ do: "slingshot", to: "theme" });
        return;
      }
      runStep({
        do: what,
        seconds: what === "read" ? between(6, 12) : between(3, 6),
        to: what === "slingshot" ? pick(["sky", randomDockIcon()]) : undefined,
      });
      return;
    }
    const speed = pet.mood === "excited" ? TROT_SPEED * 0.7 : WALK_SPEED;
    if (roll < 0.62) walkTo(between(16, window.innerWidth - W - 16), null, speed);
    else if (roll < 0.78) setMode("sit", between(4, 9));
    else if (roll < 0.86) setMode("wave", 1.4);
    else setMode("idle", between(2, 5));
  };

  // where a plan's target is on the floor: a side, the pointer, an open
  // window or an icon in the dock
  const resolveX = (to) => {
    const at = (fraction) => clamp(fraction, 0, 1) * (window.innerWidth - W);
    if (to === "left") return at(between(0.02, 0.15));
    if (to === "right") return at(between(0.85, 0.98));
    if (to === "center") return at(between(0.42, 0.58));
    if (to === "pointer" && pet.pointerX !== null) return pet.pointerX - W / 2;

    const [kind, id = ""] = String(to ?? "").split(":");
    const element =
      kind === "window"
        ? document.getElementById(id)
        : kind === "dock"
          ? document.querySelector(`#dock [data-app="${CSS.escape(id)}"]`)
          : null;
    const rect = element?.getBoundingClientRect();
    if (rect && rect.width > 0) return rect.left + rect.width * between(0.25, 0.75) - W / 2;
    return at(Math.random());
  };

  const runStep = (step) => {
    switch (step.do) {
      case "walk":
        walkTo(resolveX(step.to), null, step.pace === "trot" ? TROT_SPEED : WALK_SPEED);
        break;
      case "look":
        pet.lookX = resolveX(step.to);
        setMode("look", step.seconds ?? 3);
        break;
      case "sit":
        setMode("sit", step.seconds ?? 6);
        break;
      case "nap":
        setMode("sleep", step.seconds ?? 10);
        break;
      case "wave":
        setMode("wave", 1.4);
        break;
      case "hop":
        setMode("hop");
        puff("♥", "heart");
        break;
      case "twirl":
        setMode("twirl");
        puff("✨", "sparkle");
        break;
      case "bed":
        goToBed(step.seconds ?? 15);
        break;
      case "slingshot":
        pet.shot = aimAt(step.to);
        pet.facingLeft = pet.shot.x < pet.x + W / 2;
        // she grumbles about the light first, and takes her time aiming
        if (pet.shot.theme && chatty()) {
          const dark = document.documentElement.dataset.theme === "dark";
          speak(pick(dark ? LINES.TOO_DARK : LINES.TOO_BRIGHT));
        }
        setMode("aim", pet.shot.theme ? 1.6 : 0.8);
        break;
      case "kick":
        if (hasThings()) setMode("chase", 8);
        else wander();
        break;
      case "water":
        if (!hasThings()) {
          wander();
          break;
        }
        // stands just left of the pot so the can pours into it
        walkTo(
          things.plant.left() - 70,
          () => {
            pet.facingLeft = false;
            setMode("water", 2.4);
            if (chatty() && Math.random() < 0.5) speak(pick(LINES.WATERING));
          },
          step.pace === "trot" ? TROT_SPEED : WALK_SPEED,
        );
        break;
      case "read":
        setMode("read", step.seconds ?? 10);
        break;
      case "dance":
        setMode("dance", step.seconds ?? 5);
        break;
      case "say":
      case "think":
        // with tips switched off she keeps her thoughts to herself
        if (chatty()) (step.do === "say" ? speak : muse)(step.text);
        setMode("idle", 1.5 + step.text.length * 0.05);
        break;
      default:
        setMode("idle", step.seconds ?? 2);
    }
  };

  const chooseNext = () => {
    if (pet.plan.length && performance.now() - pet.planAt > PLAN_STALE) pet.plan = [];
    const step = pet.plan.shift();
    if (pet.plan.length === 0) wantPlan?.();
    if (step) runStep(step);
    else wander();
  };

  const update = (dt, now) => {
    pet.time += dt;
    const sleepy = !pet.busy && now - pet.lastActive > SLEEP_AFTER;

    pet.blinkIn -= dt;
    if (pet.blinkIn < -0.15) pet.blinkIn = between(2, 5);

    // needs: walking tires her, sitting and napping rest her; boredom grows
    // unless something happens
    const minutes = dt / 60;
    const effort =
      { sleep: 25, sit: 8, hop: -10, twirl: -10 }[pet.mode] ??
      (pet.mode === "walk" ? (pet.speed > WALK_SPEED ? -8 : -4) : -1.5);
    pet.energy = clamp(pet.energy + effort * minutes, 0, 100);
    pet.boredom = clamp(pet.boredom + (pet.mode === "sleep" ? -5 : 5) * minutes, 0, 100);

    switch (pet.mode) {
      case "idle":
        // keeps an eye on the pointer when it is near
        if (pet.pointerX !== null && Math.abs(pet.pointerX - (pet.x + W / 2)) < 350) {
          pet.facingLeft = pet.pointerX < pet.x + W / 2;
        }
        if (pet.time > pet.length && !pet.busy) {
          if (!sleepy) chooseNext();
          else if (hasThings()) goToBed(0);
          else setMode("sit", 3);
        }
        break;

      case "walk": {
        const gap = pet.targetX - pet.x;
        const step = pet.speed * dt;
        pet.facingLeft = gap < 0;
        if (Math.abs(gap) <= step) {
          pet.x = pet.targetX;
          const arrive = pet.onArrive;
          pet.onArrive = null;
          rest(1.5, 4);
          arrive?.();
        } else {
          pet.x += Math.sign(gap) * step;
        }
        break;
      }

      case "sit":
        if (sleepy) (hasThings() ? goToBed(0) : setMode("sleep"));
        else if (pet.time > pet.length) rest(1, 3);
        break;

      case "sleep":
        pet.puffIn -= dt;
        if (pet.puffIn <= 0) {
          pet.puffIn = 1.4;
          puff("z", "zzz");
        }
        // a nap from her plan ends by itself; dozing off when nobody is
        // around lasts until someone comes back
        if (pet.length && pet.time > pet.length) rest(1, 2);
        break;

      case "look":
        pet.facingLeft = pet.lookX < pet.x;
        if (pet.time > pet.length) rest(1, 2);
        break;

      case "bed":
        pet.puffIn -= dt;
        if (pet.puffIn <= 0) {
          pet.puffIn = 1.4;
          puff("z", "zzz");
        }
        // her bed went away (switched off, or behind a full-screen window)
        if (!hasThings()) setMode("sleep", pet.length);
        else if (pet.length && pet.time > pet.length) setMode("wave", 1.2);
        break;

      case "aim":
        if (pet.time > pet.length) {
          const shot = pet.shot ?? aimAt("sky");
          pet.shot = null;
          things?.shoot(slingshotTip(), shot, () => {
            if (shot.ball && hasThings()) things.ball.kick(Math.sign(shot.x - slingshotTip().x) || 1, 0.7);
            if (shot.theme) {
              onThemeHit?.();
              puff("♥", "heart");
              if (chatty()) speak(pick(LINES.MUCH_BETTER));
            } else if (shot.y > 0 && chatty() && Math.random() < 0.6) {
              speak(pick(LINES.BULLSEYE));
            }
          });
          setMode("release", 0.45);
        }
        break;

      case "release":
        if (pet.time > pet.length) rest(1, 2);
        break;

      case "chase": {
        // runs after her ball and kicks it once she reaches it
        if (!hasThings() || pet.time > pet.length) {
          rest(1, 2);
          break;
        }
        const ballX = things.ball.center();
        const ballRight = ballX > pet.x + W / 2;
        const spot = ballRight ? ballX - W + 18 : ballX - 18;
        const gap = spot - pet.x;
        const step = TROT_SPEED * 1.3 * dt;
        if (Math.abs(gap) <= Math.max(step, KICK_REACH)) {
          pet.facingLeft = !ballRight;
          things.ball.kick(ballRight ? 1 : -1);
          setMode("kick", 0.35);
          puff("✦", "sparkle");
        } else {
          pet.facingLeft = gap < 0;
          pet.x += Math.sign(gap) * step;
        }
        break;
      }

      case "kick":
        if (pet.time > pet.length) rest(1.5, 3);
        break;

      case "water":
        pet.puffIn -= dt;
        if (pet.puffIn <= 0) {
          pet.puffIn = 0.28;
          puff("💧", "drop");
        }
        if (pet.time > pet.length) {
          if (hasThings() && things.plant.water()) {
            puff("♥", "heart");
            if (chatty()) speak(LINES.PLANT_GREW);
          }
          rest(1.5, 3);
        }
        break;

      case "read":
        if (pet.time > pet.length) rest(1, 2);
        break;

      case "dance":
        pet.lift = Math.abs(Math.sin(pet.time * Math.PI * 2.5)) * 8;
        pet.puffIn -= dt;
        if (pet.puffIn <= 0) {
          pet.puffIn = 0.6;
          puff(pick(["♪", "♫"]), "note");
        }
        if (pet.time > pet.length) rest(1.5, 3);
        break;

      case "wave":
        if (pet.time > pet.length) rest(1.5, 3);
        break;

      case "hop":
        pet.lift = Math.sin(Math.PI * Math.min(1, pet.time / 0.45)) * 26;
        if (pet.time > 0.45) {
          pet.lift = 0;
          rest(2, 4);
        }
        break;

      case "twirl":
        pet.spin = Math.min(1, pet.time / 0.7) * 360;
        pet.lift = Math.sin(Math.PI * Math.min(1, pet.time / 0.7)) * 14;
        if (pet.time > 0.7) {
          pet.spin = 0;
          pet.lift = 0;
          rest(2, 4);
        }
        break;

      case "held":
        pet.tilt *= 0.9; // the swing settles while she is held still
        break;

      case "fall":
        pet.vy += GRAVITY * dt;
        pet.y += pet.vy * dt;
        pet.tilt *= 0.9;
        if (pet.y >= floor()) {
          pet.y = floor();
          pet.vy = 0;
          pet.tilt = 0;
          setMode("land", 0.3);
          if (Math.random() < 0.6) speak(pick(LINES.LANDED));
        }
        break;

      case "land":
        pet.squash = 1 - 0.18 * Math.sin(Math.PI * Math.min(1, pet.time / 0.3));
        if (pet.time > 0.3) {
          pet.squash = 1;
          rest(1.5, 3);
        }
        break;

      default:
        break;
    }

    // stays on the floor and on the screen, unless picked up or falling
    if (pet.mode !== "held" && pet.mode !== "fall") pet.y = floor();
    // fully on screen, except while walking in from the side on arrival
    if (pet.mode !== "held") {
      const left = pet.mode === "walk" ? -W : 0;
      pet.x = clamp(pet.x, left, window.innerWidth - W);
    }

    // a tip now and then, when she is not busy and you are around
    const quiet = pet.mode === "idle" || pet.mode === "sit";
    if (chatty() && quiet && !sleepy && !pet.busy && now - pet.lastSpoke > pet.nextChat) {
      pet.nextChat = between(50_000, 80_000);
      speak(nextTip());
    }
  };

  // ------------------------------------------------------------ drawing

  const frameName = () => {
    const tick = (seconds) => Math.floor(pet.time / seconds);
    switch (pet.mode) {
      case "held":
        return "held";
      case "hop":
      case "twirl":
        return "happy";
      case "sleep":
        return "sleep";
      case "sit":
        return pet.blinkIn < 0 ? "sleep" : "sit";
      case "walk":
        // quicker steps when she trots
        return ["stepA", "stand", "stepB", "stand"][
          tick(pet.speed > WALK_SPEED ? 0.08 : 0.14) % 4
        ];
      case "wave":
        return tick(0.22) % 2 ? "waveOut" : "waveUp";
      case "aim":
      case "release":
      case "water":
        return pet.mode;
      case "read":
        return pet.time % 4 > 3.6 ? "readPage" : "read";
      case "dance":
        return ["waveUp", "happy", "waveOut", "happy"][tick(0.25) % 4];
      case "chase":
        return ["stepA", "stand", "stepB", "stand"][tick(0.08) % 4];
      case "kick":
        return "stepA";
      default:
        if (pet.blinkIn < 0) return "blink";
        if (pet.talking) return tick(0.14) % 2 ? "talk" : "stand";
        return "stand";
    }
  };

  let drawn = "";
  let shift = 0;
  let inBed = false;

  const render = () => {
    root.style.transform = `translate(${pet.x.toFixed(1)}px, ${(pet.y - pet.lift).toFixed(1)}px)`;
    canvas.style.transform = `rotate(${(pet.spin + pet.tilt).toFixed(1)}deg) scaleY(${pet.squash.toFixed(3)})`;

    // tucked in, she is part of the bed's picture
    if (inBed !== (pet.mode === "bed")) {
      inBed = pet.mode === "bed";
      canvas.style.visibility = inBed ? "hidden" : "";
    }

    const name = frameName();
    const key = `${name}${pet.facingLeft ? "<" : ">"}`;
    if (key !== drawn) {
      drawn = key;
      drawFrame(ctx, name, pet.facingLeft);
    }

    // keep the speech bubble on the screen near the edges
    const middle = pet.x + W / 2;
    const half = 135;
    const next = Math.round(
      clamp(middle, half + 8, window.innerWidth - half - 8) - middle,
    );
    if (next !== shift) {
      shift = next;
      root.style.setProperty("--bubble-shift", `${shift}px`);
    }
  };

  // ------------------------------------------------------------ the loop

  let frame = null;
  let last = 0;
  let stopped = false;
  const loop = (now) => {
    if (stopped) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt, now);
    things?.update(dt);
    render();
    frame = requestAnimationFrame(loop);
  };

  // ------------------------------------------------------------ you and her

  const active = () => {
    pet.lastActive = performance.now();
  };

  const onPagePointer = (e) => {
    active();
    pet.pointerX = e.clientX;
  };

  let press = null;
  let clickTimer = null;

  const onPointerDown = (e) => {
    active();
    canvas.setPointerCapture(e.pointerId);
    press = {
      x: e.clientX,
      y: e.clientY,
      grabX: e.clientX - pet.x,
      grabY: e.clientY - pet.y,
      lastX: e.clientX,
    };
  };

  const onPointerMove = (e) => {
    if (!press) return;
    if (pet.mode !== "held") {
      if (Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_START) return;
      clearTimeout(clickTimer);
      pet.lift = 0;
      pet.spin = 0;
      setMode("held");
      touched("picked you up");
      speak(pick(LINES.PICKED_UP));
    }
    pet.x = e.clientX - press.grabX;
    pet.y = Math.min(e.clientY - press.grabY, floor());
    // she swings the way she is being pulled
    pet.tilt = clamp(pet.tilt + (e.clientX - press.lastX) * 0.8, -30, 30);
    press.lastX = e.clientX;
  };

  const onPointerUp = () => {
    if (!press) return;
    press = null;
    if (pet.mode === "held") {
      pet.vy = 0;
      setMode("fall");
      onEvent?.("dropped you");
      return;
    }

    // a single click: wait a moment in case it is the start of a double click
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      if (pet.mode === "sleep") {
        touched("woke you up");
        setMode("wave", 1.2);
        speak(pick(LINES.WAKE));
        return;
      }
      touched("clicked you");
      setMode("hop");
      puff("♥", "heart");
      if (!onTap?.()) speak(nextTip());
    }, DOUBLE_CLICK);
  };

  const onDoubleClick = () => {
    clearTimeout(clickTimer);
    active();
    touched("double-clicked you for a twirl");
    setMode("twirl");
    puff("✨", "sparkle");
    speak(pick(LINES.TWIRL));
  };

  let lastHello = 0;
  const onPointerEnter = () => {
    active();
    const now = performance.now();
    const free = pet.mode === "idle" || pet.mode === "sit" || pet.mode === "walk";
    if (!free || pet.busy || now - lastHello < 20_000 || now - pet.lastSpoke < 5000) return;
    lastHello = now;
    if (pet.pointerX !== null) pet.facingLeft = pet.pointerX < pet.x + W / 2;
    setMode("wave", 1.2);
    speak(pick(LINES.GREETINGS));
  };

  const onKeyDown = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    active();
    setMode("hop");
    if (!onTap?.()) speak(nextTip());
  };

  const listeners = [
    [window, "pointermove", onPagePointer],
    [window, "keydown", active],
    [canvas, "pointerdown", onPointerDown],
    [canvas, "pointermove", onPointerMove],
    [canvas, "pointerup", onPointerUp],
    [canvas, "pointercancel", onPointerUp],
    [canvas, "dblclick", onDoubleClick],
    [canvas, "pointerenter", onPointerEnter],
    [canvas, "keydown", onKeyDown],
  ];

  return {
    start() {
      listeners.forEach(([target, type, fn]) => target.addEventListener(type, fn));
      last = performance.now();
      frame = requestAnimationFrame(loop);
    },

    destroy() {
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(clickTimer);
      listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn));
    },

    // walks in from the side and introduces herself
    greet(lines) {
      pet.x = -W;
      walkTo(
        window.innerWidth * 0.22,
        () => {
          setMode("wave", 1.6);
          speak(lines);
        },
        TROT_SPEED,
      );
    },

    // just appears somewhere and carries on
    appear() {
      pet.x = between(40, window.innerWidth - W - 40);
      setMode("idle", 2);
    },

    // comes to the middle of the screen when called
    call() {
      active();
      walkTo(
        window.innerWidth / 2 - W / 2,
        () => {
          setMode("wave", 1.6);
          speak(pick(LINES.CALLED));
        },
        TROT_SPEED,
      );
    },

    // a remark about something you did, if she is free and not chatting
    comment(text) {
      const now = performance.now();
      if (!text || pet.busy || pet.mode === "held" || pet.mode === "sleep") return;
      if (now - pet.lastComment < COMMENT_GAP) return;
      pet.lastComment = now;
      speak(text);
    },

    setTalking(talking) {
      pet.talking = talking;
    },

    // a plan from her mind: { mood, plan: [{ do, to, pace, seconds, text }] }
    setPlan({ mood, plan }) {
      if (pet.busy) return;
      pet.mood = mood ?? pet.mood;
      pet.plan = plan.slice();
      pet.planAt = performance.now();
      // starts straight away if she is only standing about
      if (pet.mode === "idle") pet.length = Math.min(pet.length, pet.time + 0.3);
    },

    // the visitor clicked one of her things (the ball has already been kicked)
    touchThing(name) {
      active();
      if (pet.busy || pet.mode === "held" || pet.mode === "fall") return;
      if (name === "bed") {
        if (pet.mode === "bed") {
          touched("woke you up");
          speak(pick(LINES.WAKE));
          setMode("wave", 1.2);
        } else {
          touched("sent you to bed");
          pet.plan = [];
          goToBed(between(8, 14), TROT_SPEED);
        }
      } else if (name === "ball") {
        touched("kicked your ball");
        if (chatty() && Math.random() < 0.6) speak(pick(LINES.BALL_KICKED));
        if (pet.mode !== "bed" && pet.mode !== "sleep") {
          pet.plan = [];
          setMode("chase", 8);
        }
      } else if (name === "plant") {
        touched("asked you to water your plant");
        pet.plan = [];
        runStep({ do: "water", pace: "trot" });
      }
    },

    // something happened on the page worth noticing
    notice() {
      pet.boredom = clamp(pet.boredom - 15, 0, 100);
    },

    // how she is and where, for her mind
    getState() {
      const now = performance.now();
      return {
        x: (pet.x + W / 2) / window.innerWidth,
        doing: pet.mode,
        mood: pet.mood,
        energy: Math.round(pet.energy),
        boredom: Math.round(pet.boredom),
        secondsSinceVisitorPlayedWithYou:
          pet.lastTouched === null ? "never" : Math.round((now - pet.lastTouched) / 1000),
        visitorIdleSeconds: Math.round((now - pet.lastActive) / 1000),
        pointerX: pet.pointerX === null ? null : pet.pointerX / window.innerWidth,
        things: hasThings() ? things.describe() : null,
      };
    },

    // while a visitor chats with her she stops wandering, napping and
    // chattering, and stands still to listen
    setBusy(busy) {
      pet.busy = busy;
      // no tip straight after a chat
      pet.lastSpoke = performance.now();
      if (!busy) return;
      touched("started chatting with you");
      pet.plan = [];
      active();
      if (pet.mode === "walk" || pet.mode === "sit" || pet.mode === "sleep") {
        pet.onArrive = null;
        setMode("idle", 1);
      }
    },
  };
};
