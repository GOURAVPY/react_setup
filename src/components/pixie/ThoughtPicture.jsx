import { useEffect, useRef } from "react";
import clsx from "clsx";
import { THOUGHT_PICTURES } from "./thoughtArt";

const MAX_W = 96; // px a picture is at most
const MAX_H = 72;

/**
 * A little pixel picture in a thought bubble (thoughtArt.js), scaled up by a
 * whole number so it stays crisp: what Gourav or someone special is thinking
 * of when they think of each other.
 */
const ThoughtPicture = ({ name, small = false }) => {
  const canvas = useRef(null);
  const picture = THOUGHT_PICTURES[name];

  useEffect(() => {
    if (!picture) return;
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, picture.w, picture.h);
    picture.draw(ctx);
  }, [picture]);

  if (!picture) return null;
  const scale = Math.max(1, Math.floor(Math.min(MAX_W / picture.w, MAX_H / picture.h) / (small ? 2 : 1)));
  return (
    <canvas
      ref={canvas}
      width={picture.w}
      height={picture.h}
      className={clsx("thought-picture", small && "small")}
      style={{ width: picture.w * scale, height: picture.h * scale }}
      aria-hidden="true"
    />
  );
};

export default ThoughtPicture;
