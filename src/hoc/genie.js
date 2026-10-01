// macOS "genie" effect. A browser cannot bend an element, so the window is
// copied into horizontal strips and each strip gets a projective (matrix3d)
// transform that turns it into a trapezoid. Neighbouring strips share their
// edges, so they tile into one smooth funnel with no steps, which keeps the
// strip count low. Each frame only changes transforms, so the compositor
// moves the strips without repainting anything. Strips are only built once
// they come into view, so a window pouring out of the dock spreads that work
// over its first frames instead of pausing on the click.

const STRIP_HEIGHT = 22; // px; fewer strips are cheaper, more are smoother
const MAX_STRIPS = 32;
const BEND_END = 0.45; // share of the animation spent bending the sides
const SLIDE_START = 0.2; // when the window starts sliding down

const clamp = (value) => Math.min(1, Math.max(0, value));
const easeInOut = (t) => (1 - Math.cos(Math.PI * t)) / 2;

const copyCanvases = (from, to) => {
  const sources = from.querySelectorAll("canvas");
  to.querySelectorAll("canvas").forEach((canvas, i) => {
    canvas.getContext("2d")?.drawImage(sources[i], 0, 0);
  });
};

// Transform that maps a box of the given size onto the trapezoid whose top
// edge runs from topLeft to topRight (at y = 0) and whose bottom edge runs
// from bottomLeft to bottomRight (at y = height). All x values are relative
// to the box's own left edge, and the transform origin must be 0 0.
const trapezoid = (
  width,
  height,
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
) => {
  const scaleX = (topRight - topLeft) / width;
  const ratio = (topRight - topLeft) / (bottomRight - bottomLeft);
  const perspective = (ratio - 1) / height;
  const shear = (bottomLeft * ratio - topLeft) / height;

  return `matrix3d(${scaleX.toFixed(5)},0,0,0,${shear.toFixed(5)},${ratio.toFixed(5)},0,${perspective.toFixed(6)},0,0,1,0,${topLeft.toFixed(2)},0,0,1)`;
};

/**
 * @param el     the window element; must be displayed and unscaled
 * @param target DOMRect of the dock icon the window pours into
 * @returns      render(progress) with 0 = normal window and 1 = fully in the
 *               dock, and destroy() to remove the effect
 */
const createGenie = (el, target) => {
  const rect = el.getBoundingClientRect();
  const distance = target.top - rect.top;
  if (distance <= 0 || !rect.width || !rect.height) return null;

  const stripHeight = Math.max(
    STRIP_HEIGHT,
    Math.ceil(rect.height / MAX_STRIPS),
  );
  const count = Math.ceil(rect.height / stripHeight);

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
  // strip is cloned from later. The window's own rounded corners are kept:
  // the first strip shows the top ones and the last strip the bottom ones.
  const template = el.cloneNode(true);
  Object.assign(template.style, {
    position: "absolute",
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
    const strip = document.createElement("div");
    Object.assign(strip.style, {
      position: "absolute",
      left: `${rect.left}px`,
      top: `${rect.top + i * stripHeight}px`,
      width: `${rect.width}px`,
      // one extra row, painted over by the next strip, so no seam shows
      height: `${stripHeight + 1}px`,
      overflow: "hidden",
      transformOrigin: "0 0",
      willChange: "transform",
      contain: "strict",
    });

    const copy = template.cloneNode(true);
    copy.style.top = `${-i * stripHeight}px`;
    copyCanvases(el, copy);

    strip.appendChild(copy);
    // keep document order, so each strip paints over the one above it
    const next = strips.slice(i + 1).find(Boolean) ?? null;
    layer.insertBefore(strip, next);
    strips[i] = strip;
    return strip;
  };

  const render = (progress) => {
    const bend = easeInOut(clamp(progress / BEND_END));
    const slide = clamp((progress - SLIDE_START) / (1 - SLIDE_START));
    const drop = slide * slide * distance;

    // left and right edge of the funnel at a given height on screen,
    // relative to the window's left edge
    const edges = (y) => {
      const pull = bend * easeInOut(clamp((y - rect.top) / distance));
      return [
        (target.left - rect.left) * pull,
        rect.width + (target.right - rect.right) * pull,
      ];
    };

    // Once the sides have closed in, the rows inside the dock are dropped. A
    // window that starts out lower than the dock is squeezed into it first,
    // so its bottom does not vanish the moment the animation starts.
    const cutoff = bend >= 1 ? target.top + target.height / 2 : Infinity;

    let [left, right] = edges(rect.top + drop);

    for (let i = 0; i < count; i++) {
      const top = rect.top + i * stripHeight + drop;

      // display rather than visibility: the copy inside would stay visible
      // through a hidden parent, and a strip only ever changes state once
      if (top >= cutoff) {
        if (strips[i]) strips[i].style.display = "none";
        continue;
      }

      const strip = strips[i] ?? createStrip(i);
      const [nextLeft, nextRight] = edges(top + stripHeight);
      strip.style.display = "";
      strip.style.transform = `translateY(${drop.toFixed(2)}px) ${trapezoid(
        rect.width,
        stripHeight,
        left,
        right,
        nextLeft,
        nextRight,
      )}`;
      [left, right] = [nextLeft, nextRight];
    }
  };

  return { render, destroy: () => layer.remove() };
};

export default createGenie;
