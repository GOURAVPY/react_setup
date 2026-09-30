// macOS "genie" effect. A browser cannot bend an element, so the window is
// copied into thin horizontal strips and each strip is squeezed and moved on
// its own, which together reads as the window being poured into the dock.
// The strips are slightly oversized and trimmed by one smooth outline, so the
// edge of the funnel is a clean curve instead of a staircase.

const MIN_STRIP_HEIGHT = 4;
const MAX_STRIPS = 130;
const SAMPLES = 32; // points along each side of the outline
const CORNER_STEPS = 4;
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

  const styles = getComputedStyle(el);
  const radius = parseFloat(styles.borderTopLeftRadius) || 0;

  const stripHeight = Math.max(
    MIN_STRIP_HEIGHT,
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
    zIndex: styles.zIndex,
  });

  const strips = Array.from({ length: count }, (_, i) => {
    const strip = document.createElement("div");
    Object.assign(strip.style, {
      position: "absolute",
      left: `${rect.left}px`,
      top: `${rect.top + i * stripHeight}px`,
      width: `${rect.width}px`,
      // double height: each strip also shows the rows of the one below it,
      // which then paints over them, so the soft edges never show a gap
      height: `${stripHeight * 2}px`,
      overflow: "hidden",
      transformOrigin: "0 0",
      willChange: "transform",
      contain: "strict",
    });

    const copy = el.cloneNode(true);
    Object.assign(copy.style, {
      position: "absolute",
      top: `${-i * stripHeight}px`,
      left: "0",
      right: "auto",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      maxWidth: "none",
      margin: "0",
      transform: "none",
      translate: "none",
      opacity: "1",
      visibility: "visible",
      display: "block",
      boxShadow: "none",
      filter: "none",
      borderRadius: "0",
    });
    copyCanvases(el, copy);
    copy.querySelectorAll("img").forEach((img) => {
      img.decoding = "sync";
      img.loading = "eager";
    });

    strip.appendChild(copy);
    layer.appendChild(strip);
    return strip;
  });

  document.body.appendChild(layer);

  const render = (progress) => {
    const bend = easeInOut(clamp(progress / BEND_END));
    const slide = clamp((progress - SLIDE_START) / (1 - SLIDE_START));
    const drop = Math.round(slide * slide * distance);

    // left and right edge of the funnel at a given height on screen
    const edges = (y) => {
      const pull = bend * easeInOut(clamp((y - rect.top) / distance));
      return [
        rect.left + (target.left - rect.left) * pull,
        rect.right + (target.right - rect.right) * pull,
      ];
    };

    const top = rect.top + drop;
    // Rows are cut off once they are inside the dock. A window that starts
    // out lower than the dock is squeezed into it first, so its bottom does
    // not vanish the moment the animation starts.
    const bottom =
      bend >= 1
        ? Math.min(rect.bottom + drop, target.top + target.height / 2)
        : rect.bottom + drop;

    if (bottom <= top) {
      layer.style.visibility = "hidden";
      return;
    }
    layer.style.visibility = "visible";

    strips.forEach((strip, i) => {
      const y = rect.top + i * stripHeight + drop;

      if (y >= bottom) {
        strip.style.visibility = "hidden";
        return;
      }

      // wide enough to cover the outline over the strip's whole height
      const [leftA, rightA] = edges(y);
      const [leftB, rightB] = edges(y + stripHeight * 2);
      const left = Math.min(leftA, leftB);
      const right = Math.max(rightA, rightB);

      strip.style.visibility = "visible";
      strip.style.transform = `translate(${left - rect.left}px, ${drop}px) scaleX(${(right - left) / rect.width})`;
    });

    // Smooth outline that trims the strips
    const left = [];
    const right = [];
    const corner = Math.min(radius, (bottom - top) / 2);

    const [topLeft, topRight] = edges(top);
    for (let i = 0; i <= CORNER_STEPS; i++) {
      const angle = (Math.PI / 2) * (i / CORNER_STEPS);
      const dx = corner * (1 - Math.sin(angle));
      const y = top + corner * (1 - Math.cos(angle));
      left.push([topLeft + dx, y]);
      right.push([topRight - dx, y]);
    }

    // the bottom corners straighten out as the funnel forms
    const bottomCorner = corner * (1 - bend);
    const sideEnd = bottom - bottomCorner;

    for (let i = 1; i <= SAMPLES; i++) {
      const y = top + corner + ((sideEnd - top - corner) * i) / SAMPLES;
      const [l, r] = edges(y);
      left.push([l, y]);
      right.push([r, y]);
    }

    const [bottomLeft, bottomRight] = edges(bottom);
    for (let i = 1; i <= CORNER_STEPS && bottomCorner > 0; i++) {
      const angle = (Math.PI / 2) * (i / CORNER_STEPS);
      const dx = bottomCorner * (1 - Math.cos(angle));
      const y = sideEnd + bottomCorner * Math.sin(angle);
      left.push([bottomLeft + dx, y]);
      right.push([bottomRight - dx, y]);
    }

    const outline = [...right, ...left.reverse()]
      .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
      .join(",");
    layer.style.clipPath = `polygon(${outline})`;
  };

  return { render, destroy: () => layer.remove() };
};

export default createGenie;
