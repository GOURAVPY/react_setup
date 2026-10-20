import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { FRAMES as PIXIE_FRAMES, PALETTE as PIXIE_PALETTE } from "./sprites";
import { GOURAV_FRAMES, GOURAV_PALETTE } from "./gourav";
import { HER_FRAMES, HER_PALETTE } from "./her";
import { HER_NAME } from "./castLines";
import usePixieStore, { pickCompanion } from "../../store/pixie";
import { playSound } from "../../store/sound";
import { isMobile } from "../../utils/device";

const SCALE = 5; // screen pixels per art pixel
const WAVE_TIME = 260; // ms per frame of a wave
const LEAVE_TIME = 650; // ms for the picker to fade once someone's picked

// the three, as they look on the desktop: standing, waving when pointed at,
// and cheering when picked
const CHOICES = [
  {
    id: "pixie",
    name: "Pixie",
    about: "A little pixel girl from the jungle. Playful, curious, and she knows every corner.",
    frames: PIXIE_FRAMES,
    palette: PIXIE_PALETTE,
    wave: ["waveUp", "waveOut"],
    picked: "happy",
  },
  {
    id: "gourav",
    name: "Gourav",
    about: "The developer who built all of this. He'll show you his own work.",
    frames: GOURAV_FRAMES,
    palette: GOURAV_PALETTE,
    wave: ["raise", "raiseTalk"],
    picked: "jumpTalk",
  },
  {
    id: "her",
    name: HER_NAME,
    about: "Gourav's someone special. Warm, funny, and honest about him.",
    frames: HER_FRAMES,
    palette: HER_PALETTE,
    wave: ["raise", "raiseTalk"],
    picked: "jumpTalk",
  },
];

const Sprite = ({ grid, palette }) => {
  const canvas = useRef(null);
  const width = grid[0].length;
  const height = grid.length;
  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    grid.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === ".") return;
        ctx.fillStyle = palette[cell];
        ctx.fillRect(x, y, 1, 1);
      }),
    );
  }, [grid, palette, width, height]);
  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      className="companion-sprite"
      style={{ width: width * SCALE, height: height * SCALE }}
      aria-hidden="true"
    />
  );
};

const Picker = () => {
  const [pointed, setPointed] = useState(null); // hovered or focused
  const [chosen, setChosen] = useState(null);
  const [beat, setBeat] = useState(0); // the wave's frame
  const cards = useRef([]);

  // whoever is pointed at waves
  useEffect(() => {
    if (!pointed || chosen) return;
    const timer = setInterval(() => setBeat((n) => n + 1), WAVE_TIME);
    return () => clearInterval(timer);
  }, [pointed, chosen]);

  useEffect(() => {
    cards.current[0]?.focus({ preventScroll: true });
  }, []);

  // once picked, a moment to cheer, then the desktop
  useEffect(() => {
    if (!chosen) return;
    const timer = setTimeout(() => pickCompanion(chosen), LEAVE_TIME);
    return () => clearTimeout(timer);
  }, [chosen]);

  const choose = (id) => {
    if (chosen) return;
    playSound("portal");
    setChosen(id);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") return choose("pixie");
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const at = cards.current.indexOf(document.activeElement);
    cards.current[(at + step + CHOICES.length) % CHOICES.length]?.focus();
  };

  const frameOf = ({ id, frames, wave, picked }) => {
    if (chosen === id) return frames[picked];
    if (pointed === id && !chosen) return frames[wave[beat % wave.length]];
    return frames.stand;
  };

  return (
    <div
      className={clsx("companion-picker", chosen && "leaving")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="companion-title"
      onKeyDown={onKeyDown}
    >
      <div className="companion-panel">
        <h2 id="companion-title">Choose your companion</h2>
        <p className="companion-intro">
          They'll walk around with you and show you Gourav's work. You can change your mind in Pixie's app.
        </p>
        <div className="companion-cards">
          {CHOICES.map((choice, i) => (
            <button
              key={choice.id}
              ref={(element) => {
                cards.current[i] = element;
              }}
              type="button"
              aria-label={`${choice.name}. ${choice.about}`}
              className={clsx("companion-card", `who-${choice.id}`, chosen === choice.id && "chosen", chosen && chosen !== choice.id && "faded")}
              onClick={() => choose(choice.id)}
              onPointerEnter={() => setPointed(choice.id)}
              onPointerLeave={() => setPointed((now) => (now === choice.id ? null : now))}
              onFocus={() => setPointed(choice.id)}
              onBlur={() => setPointed((now) => (now === choice.id ? null : now))}
            >
              <span className="companion-stage">
                <Sprite grid={frameOf(choice)} palette={choice.palette} />
              </span>
              <span className="companion-name">{choice.name}</span>
              <span className="companion-about">{choice.about}</span>
            </button>
          ))}
        </div>
        <button type="button" className="companion-skip" onClick={() => choose("pixie")}>
          Skip, Pixie can show me around
        </button>
      </div>
    </div>
  );
};

// The first time on a computer, before anything else: the visitor picks who
// shows them around, Pixie, Gourav or someone special, by how they look.
// Their companion greets them and guides them; the other two live on the
// desktop too. Picking again: Pixie's app (pickCompanion("")).
const CompanionPicker = () => {
  const show = usePixieStore((state) => state.show);
  const companion = usePixieStore((state) => state.companion);
  const [ready, setReady] = useState(false);

  // after the startup and login screens
  useEffect(() => {
    if (ready) return;
    const timer = setInterval(() => {
      if (!document.getElementById("boot") && !document.getElementById("login")) setReady(true);
    }, 400);
    return () => clearInterval(timer);
  }, [ready]);

  if (!show || companion || !ready || isMobile()) return null;
  return <Picker />;
};

export default CompanionPicker;
