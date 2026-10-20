import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CUES, LETTER, SCENES, STAGE_H, STAGE_W, STORY_LENGTH, createStoryArt, drawPortal } from "./storyArt";
import { floorLine } from "./engine";
import { playSound } from "../../store/sound";

const FADE = 0.6; // s for the story to fade into the desktop (see .pixie-story)
const POP_OUT = 0.7; // s after that before she jumps out of the portal
const PORTAL_STAYS = 1.4; // s the portal stays open on the desktop after that
const PORTAL_TURN = 0.35; // s for it to open or close

// the portal on the desktop, in art pixels drawn 4 screen pixels big, like her
const DESK_W = 36;
const DESK_H = 60;
const DESK_SCALE = 4;
const DESK_FLOOR = DESK_H - 3; // the row its light falls on

/**
 * Pixie's story (storyArt.js) over the whole screen, then a portal on the
 * desktop that she jumps out of. Skip (or Esc) goes straight to the portal.
 * @param x         where on the desktop she comes out, px from the left
 * @param onArrive  the moment she should jump out of the portal
 * @param onDone    all over: the portal has closed again
 */
const PortalStory = ({ x, onArrive, onDone }) => {
  const stage = useRef(null);
  const caption = useRef(null);
  const spoken = useRef(null);
  const desk = useRef(null);
  const [part, setPart] = useState("story"); // story, then desktop
  const callbacks = useRef({ onArrive, onDone });

  useEffect(() => {
    callbacks.current = { onArrive, onDone };
  });

  // the story, drawn frame by frame with its captions typing in
  useEffect(() => {
    if (part !== "story") return;
    const art = createStoryArt(stage.current);
    const start = performance.now();
    let scene = -1;
    let cue = 0;
    let frame = 0;
    const loop = (now) => {
      const t = (now - start) / 1000;
      if (t >= STORY_LENGTH) {
        setPart("desktop");
        return;
      }
      try {
        art.draw(t);
      } catch (error) {
        // a broken frame must never leave the screen covered: on to the desktop
        console.error("Pixie's story failed:", error);
        setPart("desktop");
        return;
      }
      const index = SCENES.findIndex(({ until }) => t < until);
      const from = index > 0 ? SCENES[index - 1].until : 0;
      const words = SCENES[index].caption;
      if (index !== scene) {
        scene = index;
        spoken.current.textContent = words;
      }
      caption.current.textContent = words.slice(0, Math.floor((t - from) / LETTER));
      while (cue < CUES.length && t >= CUES[cue].at) playSound(CUES[cue++].sound);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onKey = (e) => {
      if (e.key === "Escape") setPart("desktop");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [part]);

  // then the desktop: the story fades away, a portal opens, out she jumps
  useEffect(() => {
    if (part !== "desktop") return;
    const ctx = desk.current.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const start = performance.now();
    const closeAt = FADE + POP_OUT + PORTAL_STAYS;
    let arrived = false;
    let frame = 0;
    playSound("portal");
    const loop = (now) => {
      const t = (now - start) / 1000;
      if (!arrived && t >= FADE + POP_OUT) {
        arrived = true;
        playSound("pop");
        callbacks.current.onArrive?.();
      }
      if (t >= closeAt + PORTAL_TURN) {
        callbacks.current.onDone?.();
        return;
      }
      const opening = (t - FADE / 2) / PORTAL_TURN;
      const closing = (closeAt + PORTAL_TURN - t) / PORTAL_TURN;
      ctx.clearRect(0, 0, DESK_W, DESK_H);
      drawPortal(ctx, t, Math.max(0, Math.min(1, opening, closing)), DESK_W / 2, 28, DESK_FLOOR);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [part]);

  return (
    <>
      <div className={clsx("pixie-story", part !== "story" && "fading")} role="dialog" aria-label="Pixie's story">
        <canvas ref={stage} width={STAGE_W} height={STAGE_H} className="pixie-story-stage" />
        <p ref={caption} className="pixie-story-caption" aria-hidden="true" />
        <p ref={spoken} className="sr-only" aria-live="polite" />
        {part === "story" && (
          <button type="button" className="pixie-story-skip" onClick={() => setPart("desktop")} autoFocus>
            Skip ›
          </button>
        )}
      </div>
      {part === "desktop" && (
        <canvas
          ref={desk}
          width={DESK_W}
          height={DESK_H}
          className="pixie-portal"
          style={{ left: x - (DESK_W * DESK_SCALE) / 2, top: floorLine() - DESK_FLOOR * DESK_SCALE }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default PortalStory;
