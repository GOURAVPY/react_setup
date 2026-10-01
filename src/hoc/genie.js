// macOS "genie" effect. A browser cannot bend an element, so the window is
// copied into strips and each strip gets a projective (matrix3d) transform
// that turns it into a trapezoid. Neighbouring strips share their edges, so
// they tile into one smooth funnel with no steps, which keeps the strip count
// low. Each frame only changes transforms, so the compositor moves the strips
// without repainting anything. Strips are only built once they come into
// view, so a window pouring out of the dock spreads that work over its first
// frames instead of pausing on the click.
//
// The strips run across the direction the window travels: rows when the
// dock is at the bottom, columns when it is on the left or right.

const STRIP_SIZE = 22; // px; fewer strips are cheaper, more are smoother
const MAX_STRIPS = 32;
const BEND_END = 0.45; // share of the animation spent bending the sides
const SLIDE_START = 0.2; // when the window starts sliding towards the dock

const clamp = (value) => Math.min(1, Math.max(0, value));
const easeInOut = (t) => (1 - Math.cos(Math.PI * t)) / 2;

const copyCanvases = (from, to) => {
  const sources = from.querySelectorAll("canvas");
  to.querySelectorAll("canvas").forEach((canvas, i) => {
    canvas.getContext("2d")?.drawImage(sources[i], 0, 0);
  });
};

const n = (value, digits = 5) => value.toFixed(digits);

// Maps a row (width × height) onto the trapezoid whose top edge runs from
// topLeft to topRight and whose bottom edge runs from bottomLeft to
// bottomRight, all relative to the row's own left edge. Origin must be 0 0.
const rowTrapezoid = (width, height, topLeft, topRight, bottomLeft, bottomRight) => {
  const ratio = (topRight - topLeft) / (bottomRight - bottomLeft);
  const scaleX = (topRight - topLeft) / width;
  const perspective = (ratio - 1) / height;
  const shear = (bottomLeft * ratio - topLeft) / height;

  return `matrix3d(${n(scaleX)},0,0,0,${n(shear)},${n(ratio)},0,${n(perspective, 6)},0,0,1,0,${n(topLeft, 2)},0,0,1)`;
};

// The same for a column: its left edge runs from leftTop to leftBottom and
// its right edge from rightTop to rightBottom, relative to its own top edge.
const columnTrapezoid = (width, height, leftTop, leftBottom, rightTop, rightBottom) => {
  const ratio = (leftBottom - leftTop) / (rightBottom - rightTop);
  const scaleY = (leftBottom - leftTop) / height;
  const perspective = (ratio - 1) / width;
  const shear = (rightTop * ratio - leftTop) / width;

  return `matrix3d(${n(ratio)},${n(shear)},0,${n(perspective, 6)},0,${n(scaleY)},0,0,0,0,1,0,0,${n(leftTop, 2)},0,1)`;
};

/**
 * @param el     the window element; must be displayed and unscaled
 * @param target DOMRect of the dock icon the window pours into
 * @param side   where the dock is: "bottom", "left" or "right"
 * @returns      render(progress) with 0 = normal window and 1 = fully in the
 *               dock, and destroy() to remove the effect; or null when the
 *               window is not on the far side of the dock from it
 */
const createGenie = (el, target, side = "bottom") => {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  // "main" is the axis the window travels along, "cross" the one it narrows on
  const rows = side !== "left" && side !== "right";
  const main = rows
    ? { start: rect.top, length: rect.height }
    : { start: rect.left, length: rect.width };
  const cross = rows
    ? { start: rect.left, length: rect.width, targetStart: target.left, targetEnd: target.right }
    : { start: rect.top, length: rect.height, targetStart: target.top, targetEnd: target.bottom };

  // the window edge furthest from the dock has to travel to the dock's edge
  const far = rows ? rect.top : side === "left" ? rect.right : rect.left;
  const dockEdge = rows ? target.top : side === "left" ? target.right : target.left;
  const distance = dockEdge - far;
  const direction = side === "left" ? -1 : 1;
  if (Math.sign(distance) !== direction) return null;

  const dockMiddle = rows
    ? target.top + target.height / 2
    : target.left + target.width / 2;

  const stripSize = Math.max(STRIP_SIZE, Math.ceil(main.length / MAX_STRIPS));
  const count = Math.ceil(main.length / stripSize);

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, {
    position: "fixed",
    inset: "0",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: getComputedStyle(el).zIndex,
  });

  document.body.appendChild(layer);

  // One copy of the window, taken now while it is still shown, that each
  // strip is cloned from later. The window's own rounded corners are kept.
  const template = el.cloneNode(true);
  Object.assign(template.style, {
    position: "absolute",
    top: "0",
    left: "0",
    right: "auto",
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    maxWidth: "none",
    margin: "0",
    transform: "none",
    translate: "none",
    opacity: "1",
    display: "block",
    boxShadow: "none",
    filter: "none",
  });
  template.querySelectorAll("img").forEach((img) => {
    img.decoding = "sync";
    img.loading = "eager";
  });

  const strips = new Array(count).fill(null);

  const createStrip = (i) => {
    const offset = i * stripSize;
    const strip = document.createElement("div");
    Object.assign(strip.style, {
      position: "absolute",
      left: `${rect.left + (rows ? 0 : offset)}px`,
      top: `${rect.top + (rows ? offset : 0)}px`,
      // one extra pixel, painted over by the next strip, so no seam shows
      width: `${rows ? rect.width : stripSize + 1}px`,
      height: `${rows ? stripSize + 1 : rect.height}px`,
      overflow: "hidden",
      transformOrigin: "0 0",
      willChange: "transform",
      contain: "strict",
    });

    const copy = template.cloneNode(true);
    copy.style[rows ? "top" : "left"] = `${-offset}px`;
    copyCanvases(el, copy);

    strip.appendChild(copy);
    // keep document order, so each strip paints over the one before it
    const next = strips.slice(i + 1).find(Boolean) ?? null;
    layer.insertBefore(strip, next);
    strips[i] = strip;
    return strip;
  };

  const render = (progress) => {
    const bend = easeInOut(clamp(progress / BEND_END));
    const slide = clamp((progress - SLIDE_START) / (1 - SLIDE_START));
    const shift = slide * slide * distance;

    // where the funnel's two sides are at a point along the main axis,
    // relative to the window's own cross-axis start
    const edges = (at) => {
      const pull = bend * easeInOut(clamp((at - far) / distance));
      return [
        (cross.targetStart - cross.start) * pull,
        cross.length + (cross.targetEnd - (cross.start + cross.length)) * pull,
      ];
    };

    for (let i = 0; i < count; i++) {
      const stripStart = main.start + i * stripSize + shift;
      const stripEnd = stripStart + stripSize;

      // Once the sides have closed in, strips that have passed the middle of
      // the dock are dropped. A window that starts out past the dock is
      // squeezed into it first, so that part does not vanish straight away.
      // display rather than visibility: the copy inside would stay visible
      // through a hidden parent, and a strip only ever changes state once.
      const trailing = direction > 0 ? stripStart : stripEnd;
      if (bend >= 1 && (trailing - dockMiddle) * direction >= 0) {
        if (strips[i]) strips[i].style.display = "none";
        continue;
      }

      const strip = strips[i] ?? createStrip(i);
      const [startA, startB] = edges(stripStart);
      const [endA, endB] = edges(stripEnd);
      strip.style.display = "";
      strip.style.transform = rows
        ? `translateY(${n(shift, 2)}px) ${rowTrapezoid(rect.width, stripSize, startA, startB, endA, endB)}`
        : `translateX(${n(shift, 2)}px) ${columnTrapezoid(stripSize, rect.height, startA, startB, endA, endB)}`;
    }
  };

  return { render, destroy: () => layer.remove() };
};

export default createGenie;
