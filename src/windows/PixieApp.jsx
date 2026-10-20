import { useEffect, useRef, useState } from "react";
import {
  BookHeart,
  BookOpen,
  CalendarDays,
  Clapperboard,
  MessageCircle,
  Settings2,
  Smile,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import Toggle from "../components/Toggle";
import usePixieStore, { callPixie, chatWithPixie, pickCompanion, watchPixieStory } from "../store/pixie";
import useWindowStore from "../store/window";
import { brainEnabled } from "../components/pixie/brain";
import { HEIGHT, SCALE, WIDTH, drawFrame } from "../components/pixie/sprites";
import { CAST_NAMES, CAST_ROLES } from "../components/pixie/castLines";
import { CastNowPane, CastPortrait, CastTodayPane } from "./CastPanes";

// Pixie's own app in the dock: how she is right now, a diary of what her AI
// mind decided, and her settings. When the visitor's companion is Gourav or
// someone special, it's theirs instead (CastPanes.jsx).

const COMPANION_NAMES = { pixie: "Pixie", ...CAST_NAMES };

const MOODS = {
  happy: ["😊", "Happy"],
  curious: ["🧐", "Curious"],
  sleepy: ["😴", "Sleepy"],
  bored: ["😐", "Bored"],
  excited: ["🤩", "Excited"],
  shy: ["☺️", "Shy"],
};

const DOING = {
  idle: "Standing around",
  look: "Looking around",
  walk: "Going for a walk",
  sit: "Sitting down",
  sleep: "Napping",
  wave: "Waving",
  hop: "Hopping",
  twirl: "Twirling",
  held: "Being carried",
  fall: "Falling!",
  land: "Landing",
  bed: "Asleep in her bed",
  aim: "Aiming her slingshot",
  release: "Shooting a star",
  chase: "Chasing her ball",
  kick: "Kicking her ball",
  water: "Watering her plant",
  read: "Reading a book",
  dance: "Dancing",
};

// her plan steps, e.g. "walk window:arcade trot" -> "walk the arcade window trot"
const readable = (step) =>
  step.replace(/window:(\S+)/, "the $1 window").replace(/dock:(\S+)/, "the $1 icon");

// which picture to show for what she's doing out on the desktop
const POSES = {
  sleep: () => "sleep",
  bed: () => "sleep",
  sit: (tick) => (tick % 16 === 15 ? "sleep" : "sit"),
  walk: (tick) => ["stepA", "stand", "stepB", "stand"][tick % 4],
  chase: (tick) => ["stepA", "stand", "stepB", "stand"][tick % 4],
  kick: () => "stepA",
  aim: () => "aim",
  release: () => "release",
  water: () => "water",
  read: (tick) => (tick % 20 === 19 ? "readPage" : "read"),
  dance: (tick) => ["waveUp", "happy", "waveOut", "happy"][tick % 4],
  hop: () => "happy",
  twirl: () => "happy",
  held: () => "held",
  fall: () => "held",
  wave: (tick) => (tick % 2 ? "waveOut" : "waveUp"),
};

// Pixie drawn in her app, copying what she's doing on the desktop, and
// waving when you point at her
const Portrait = ({ doing = "idle", size = "large" }) => {
  const canvas = useRef(null);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let tick = 0;
    const draw = () => {
      const pose = waving ? POSES.wave : POSES[doing];
      const frame = pose ? pose(tick) : tick % 16 === 15 ? "blink" : "stand";
      drawFrame(ctx, frame, false);
      tick += 1;
    };
    draw();
    const timer = setInterval(draw, waving ? 220 : 200);
    return () => clearInterval(timer);
  }, [doing, waving]);

  return (
    <canvas
      ref={canvas}
      width={WIDTH * SCALE}
      height={HEIGHT * SCALE}
      className={clsx("portrait", size)}
      onMouseEnter={() => setWaving(true)}
      onMouseLeave={() => setWaving(false)}
      aria-hidden="true"
    />
  );
};

const Meter = ({ label, value, tone }) => (
  <div className="meter">
    <span>{label}</span>
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <i className={tone} style={{ width: `${value}%` }} />
    </div>
    <b>{value}</b>
  </div>
);

const NowPane = () => {
  const { show, mind, mood, thought, vitals } = usePixieStore();
  const [face, moodName] = MOODS[mood] ?? [];

  const status = !show ? "Hidden. Switch her on in Options." : vitals ? DOING[vitals.doing] : "On her way…";

  return (
    <div className="pane">
      <div className="pixie-hero">
        <Portrait doing={show ? vitals?.doing : "sleep"} />
        <div>
          <h3>Pixie</h3>
          <p>{status}</p>
          {face && (
            <span className="mood">
              <span aria-hidden="true">{face}</span> {moodName}
            </span>
          )}
        </div>
      </div>

      {brainEnabled && mind && show && (
        <div className="pixie-mind" aria-live="polite">
          <span aria-hidden="true">💭</span>
          <p>
            {thought ? (
              <>
                <strong>On her mind:</strong> “{thought}”
              </>
            ) : (
              "She hasn't made a plan yet. Move around the page a little and she will."
            )}
          </p>
        </div>
      )}

      {vitals && (
        <div className="meters">
          <Meter label="Energy" value={vitals.energy} tone="energy" />
          <Meter label="Boredom" value={vitals.boredom} tone="boredom" />
        </div>
      )}

      <div className="actions">
        {brainEnabled && (
          <button type="button" className="restart" onClick={chatWithPixie}>
            <MessageCircle size={14} />
            Chat with her
          </button>
        )}
        <button type="button" className="restart" onClick={callPixie}>
          <Smile size={14} />
          Call Pixie
        </button>
        <button type="button" className="restart" onClick={watchPixieStory}>
          <Clapperboard size={14} />
          Watch her story
        </button>
        <button type="button" className="restart" onClick={() => useWindowStore.getState().openWindow("book")}>
          <BookOpen size={14} />
          Read Gourav's book
        </button>
      </div>

      <p className="phone-note">Pixie lives on the desktop. Open this site on a computer to meet her.</p>
    </div>
  );
};

const DiaryPane = () => {
  const diary = usePixieStore((state) => state.diary);
  const mind = usePixieStore((state) => state.mind);

  const empty = !brainEnabled
    ? "Her mind needs her AI brain switched on (see server/README.md)."
    : !mind
      ? "Her mind is switched off. Turn it on in Options."
      : "Nothing yet. Use the desktop for a minute and her first plan will appear here.";

  return (
    <div className="pane">
      <h3>Diary</h3>
      <p>What her AI mind decided lately, newest first.</p>

      {diary.length === 0 ? (
        <p className="empty">{empty}</p>
      ) : (
        <ol className="diary">
          {diary.map(({ id, at, mood, thought, steps }) => (
            <li key={id}>
              <span className="face" aria-hidden="true">
                {MOODS[mood]?.[0] ?? "💭"}
              </span>
              <div>
                <p>“{thought}”</p>
                <small>
                  {dayjs(at).format("h:mm:ss A")} · {steps.map(readable).join(" → ")}
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const OptionsPane = () => {
  const { show, chatty, mind, things, companion, setPixie } = usePixieStore();

  return (
    <div className="pane">
      <h3>Options</h3>
      <p>Your companion on the desktop, and how they behave.</p>

      <div className="setting-group">
        <div className={clsx("setting-row", !show && "disabled")}>
          <span>
            Your companion: {COMPANION_NAMES[companion] ?? "not picked yet"}
            <small>Who shows you around: Pixie, Gourav or someone special. Only they are on the desktop.</small>
          </span>
          <button type="button" className="restart" disabled={!show} onClick={() => pickCompanion("")}>
            Choose again
          </button>
        </div>

        <div className="setting-row">
          <span>Show your companion</span>
          <Toggle label="Show your companion" checked={show} onChange={(value) => setPixie("show", value)} />
        </div>

        <div className={clsx("setting-row", !show && "disabled")}>
          <span>
            Shares tips and thoughts
            <small>Bubbles they make on their own.</small>
          </span>
          <Toggle
            label="Shares tips and thoughts"
            checked={chatty}
            onChange={(value) => setPixie("chatty", value)}
          />
        </div>

        <div className={clsx("setting-row", !show && "disabled")}>
          <span>
            Their things on the desktop
            <small>Pixie's bed, ball and plant; Gourav's desk, bookshelf, coffee machine and robot; her easel and parakeet.</small>
          </span>
          <Toggle
            label="Their things on the desktop"
            checked={things}
            onChange={(value) => setPixie("things", value)}
          />
        </div>

        <div className={clsx("setting-row", (!show || !brainEnabled) && "disabled")}>
          <span>
            Pixie decides for herself (AI)
            <small>
              {brainEnabled
                ? "Her AI mind picks where she goes and what she does."
                : "Needs her AI brain; see server/README.md."}
            </small>
          </span>
          <Toggle
            label="Decides for herself"
            checked={mind && brainEnabled}
            disabled={!brainEnabled}
            onChange={(value) => setPixie("mind", value)}
          />
        </div>
      </div>
    </div>
  );
};

const PIXIE_SECTIONS = [
  { id: "now", label: "Now", icon: Sparkles, pane: NowPane },
  { id: "diary", label: "Diary", icon: BookHeart, pane: DiaryPane },
  { id: "options", label: "Options", icon: Settings2, pane: OptionsPane },
];

const CAST_SECTIONS = [
  { id: "now", label: "Now", icon: Sparkles, pane: CastNowPane },
  { id: "today", label: "Today", icon: CalendarDays, pane: CastTodayPane },
  { id: "options", label: "Options", icon: Settings2, pane: OptionsPane },
];

const PixieApp = () => {
  const companion = usePixieStore((state) => state.companion);
  const cast = companion === "gourav" || companion === "her" ? companion : null;
  const sections = cast ? CAST_SECTIONS : PIXIE_SECTIONS;
  const [active, setActive] = useState(sections[0].id);
  // a section the other companion doesn't have: back to the first
  const ActivePane = (sections.find(({ id }) => id === active) ?? sections[0]).pane;
  const name = cast ? CAST_NAMES[cast] : "Pixie";

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="pixie" />
        <h2>{name}</h2>
      </div>

      <div className="flex">
        <div className="sidebar">
          <div className="profile">
            {cast ? <CastPortrait who={cast} size="small" /> : <Portrait size="small" />}
            <div>
              <p>{name}</p>
              <small>{cast ? CAST_ROLES[cast] : "Your little guide"}</small>
            </div>
          </div>

          <ul>
            {sections.map(({ id, label, icon }) => {
              const Icon = icon;
              return (
                <li
                  key={id}
                  className={active === id ? "active" : "not-active"}
                  onClick={() => setActive(id)}
                >
                  <Icon size={16} />
                  <p>{label}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <ActivePane who={cast} />
      </div>
    </>
  );
};

const PixieAppWindow = WindowWrapper(PixieApp, "pixie");

export default PixieAppWindow;
