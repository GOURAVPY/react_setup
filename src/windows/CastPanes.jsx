import { useEffect, useRef, useState } from "react";
import { BookOpen, Smile, Users } from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import usePixieStore, { callCompanion, pickCompanion } from "../store/pixie";
import useWindowStore from "../store/window";
import { PEOPLE, shut } from "../components/pixie/cast";
import { CHAIR, DESK_PALETTE, PAINTINGS, PAINT_PALETTE, SEATED_FRAMES } from "../components/pixie/castArt";
import { CAST_NAMES } from "../components/pixie/castLines";
import ThoughtPicture from "../components/pixie/ThoughtPicture";

// Pixie's app in the dock, when the visitor's companion is Gourav or someone
// special (PixieApp.jsx): what they're up to right now, and their day.

const DOING = {
  arriving: () => "Walking in…",
  idle: () => "Standing around",
  walk: () => "Walking about",
  work: (who) => (who === "gourav" ? "Coding at his desk" : "Painting at her easel"),
  coffee: () => "Getting a coffee ☕",
  dance: () => "Dancing to the music 🎶",
  read: () => "Reading a book 📖",
  bench: () => "Sitting on her park bench 🌳",
  date: () => "On the bench with Gourav 💕",
  held: () => "Being carried!",
  fall: () => "Falling!",
};

const HE = { gourav: "he", her: "she" };
const HIM = { gourav: "him", her: "her" };
const HIS = { gourav: "his", her: "her" };

const paint = (ctx, rows, palette, dx = 0, dy = 0) =>
  rows.forEach((row, y) =>
    [...row].forEach((cell, x) => {
      if (cell === ".") return;
      ctx.fillStyle = palette[cell];
      ctx.fillRect(x + dx, y + dy, 1, 1);
    }),
  );

// which picture to show for what they're doing, a beat at a time
const pose = (who, doing, beat) => {
  if (doing === "held" || doing === "fall") return "jump";
  if (doing === "dance") return beat % 2 ? "jump" : "raise";
  if (doing === "read") return beat % 12 === 11 ? "stand" : "read";
  if (doing === "bench" || doing === "date") return beat % 16 === 15 ? "sitBlink" : "sit";
  if (doing === "work") return who === "gourav" ? (beat % 2 ? "seatedB" : "seatedA") : "paint";
  if (doing === "coffee") return beat % 2 ? "mugStep" : "mug";
  if (doing === "walk" || doing === "arriving") return beat % 2 ? "step" : "stand";
  return beat % 16 === 15 ? "blink" : "stand";
};

/**
 * Gourav or someone special drawn in their app, copying what they're doing
 * on the desktop (at his desk, Gourav from behind, as he is there), and
 * waving when you point at them.
 */
export const CastPortrait = ({ who, doing = "idle", size = "large" }) => {
  const canvas = useRef(null);
  const [waving, setWaving] = useState(false);
  const { frames, palette, w, h } = PEOPLE[who];

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let beat = 0;
    const draw = () => {
      const name = waving ? (beat % 2 ? "raiseTalk" : "raise") : pose(who, doing, beat);
      ctx.clearRect(0, 0, w, h);
      if (name === "seatedA" || name === "seatedB") {
        paint(ctx, SEATED_FRAMES[name === "seatedA" ? "a" : "b"], palette, 1, 1);
        paint(ctx, CHAIR, DESK_PALETTE, 1, 17);
      } else if (name === "blink") paint(ctx, shut(frames.stand), palette);
      else if (name === "sitBlink") paint(ctx, shut(frames.sit), palette);
      else paint(ctx, frames[name] ?? frames.stand, palette);
      beat += 1;
    };
    draw();
    const timer = setInterval(draw, waving ? 260 : 220);
    return () => clearInterval(timer);
  }, [who, doing, waving, frames, palette, w, h]);

  return (
    <canvas
      ref={canvas}
      width={w}
      height={h}
      className={clsx("portrait", "cast-portrait", size)}
      onMouseEnter={() => setWaving(true)}
      onMouseLeave={() => setWaving(false)}
      aria-hidden="true"
    />
  );
};

const Meter = ({ label, value, tone }) => (
  <div className="meter">
    <span>{label}</span>
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <i className={tone} style={{ width: `${value}%` }} />
    </div>
    <b>{value}</b>
  </div>
);

// one of her paintings, small, in a frame
const Painting = ({ name }) => {
  const canvas = useRef(null);
  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.fillStyle = "#fbf8f1";
    ctx.fillRect(0, 0, 14, 12);
    paint(ctx, PAINTINGS[name], PAINT_PALETTE, 1, 1);
  }, [name]);
  return <canvas ref={canvas} width={14} height={12} className="cast-painting" aria-label={`A painting: ${name}`} />;
};

export const CastNowPane = ({ who }) => {
  const show = usePixieStore((state) => state.show);
  const vitals = usePixieStore((state) => (state.castVitals?.who === who ? state.castVitals : null));
  const name = CAST_NAMES[who];
  const status = !show
    ? `Hidden. Switch ${HIM[who]} on in Options.`
    : vitals
      ? DOING[vitals.doing]?.(who)
      : "On the way…";

  return (
    <div className="pane">
      <div className="pixie-hero">
        <CastPortrait who={who} doing={show ? vitals?.doing : "idle"} />
        <div>
          <h3>{name}</h3>
          <p>{status}</p>
        </div>
      </div>

      {show && (
        <div className="pixie-mind" aria-live="polite">
          <span aria-hidden="true">💭</span>
          <p>
            {vitals?.thought ? (
              <>
                <strong>On {HIS[who]} mind:</strong> “{vitals.thought}”
              </>
            ) : who === "gourav" ? (
              "No thoughts yet. Give him a minute at his desk; it's usually coffee."
            ) : (
              "No thoughts yet. Give her a minute at her easel."
            )}
          </p>
        </div>
      )}

      {vitals && (
        <div className="meters">
          {who === "gourav" ? (
            <Meter label="Coffee" value={Math.round(vitals.coffee * 100)} tone="coffee" />
          ) : (
            <Meter label="Painting" value={Math.round(vitals.painting * 100)} tone="paint" />
          )}
        </div>
      )}

      <div className="actions">
        <button type="button" className="restart" onClick={callCompanion}>
          <Smile size={14} />
          Call {who === "gourav" ? name : "her"}
        </button>
        <button type="button" className="restart" onClick={() => useWindowStore.getState().openWindow("book")}>
          <BookOpen size={14} />
          Read Gourav's book
        </button>
        <button type="button" className="restart" onClick={() => pickCompanion("")}>
          <Users size={14} />
          Choose another companion
        </button>
      </div>

      <p className="phone-note">
        {name} lives on the desktop. Open this site on a computer to meet {HIM[who]}.
      </p>
    </div>
  );
};

export const CastTodayPane = ({ who }) => {
  const vitals = usePixieStore((state) => (state.castVitals?.who === who ? state.castVitals : null));
  const thoughts = vitals?.thoughts ?? [];

  return (
    <div className="pane">
      <h3>Today</h3>
      <p>What {HE[who]}'s been up to on the desktop this visit.</p>

      {who === "gourav" ? (
        <div className="cast-stats">
          <div>
            <span aria-hidden="true">☕</span>
            <b>{vitals?.mugs ?? 0}</b>
            <small>mugs of coffee</small>
          </div>
          <div>
            <span aria-hidden="true">⌨️</span>
            <b>{vitals?.lines ?? 0}</b>
            <small>lines of code</small>
          </div>
          <div>
            <span aria-hidden="true">💭</span>
            <b>{thoughts.length}</b>
            <small>thoughts</small>
          </div>
        </div>
      ) : (
        <>
          <div className="cast-stats">
            <div>
              <span aria-hidden="true">🎨</span>
              <b>{vitals?.paintings.length ?? 0}</b>
              <small>paintings finished</small>
            </div>
            <div>
              <span aria-hidden="true">🖌️</span>
              <b>{Math.round((vitals?.painting ?? 0) * 100)}%</b>
              <small>of the next one</small>
            </div>
            <div>
              <span aria-hidden="true">💕</span>
              <b>{vitals?.visits ?? 0}</b>
              <small>visits from Gourav</small>
            </div>
          </div>
          {vitals?.paintings.length > 0 && (
            <div className="cast-gallery">
              {vitals.paintings.map((name, i) => (
                <Painting key={i} name={name} />
              ))}
            </div>
          )}
        </>
      )}

      <h4 className="cast-subhead">Recent thoughts</h4>
      {thoughts.length === 0 ? (
        <p className="empty">Nothing yet. Thoughts show up while {HE[who]} works.</p>
      ) : (
        <ol className="diary">
          {thoughts.map(({ text, picture, at }) => (
            <li key={at}>
              {picture ? (
                <ThoughtPicture name={picture} small />
              ) : (
                <span className="face" aria-hidden="true">
                  💭
                </span>
              )}
              <div>
                <p>“{text}”</p>
                <small>{dayjs(at).format("h:mm:ss A")}</small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
