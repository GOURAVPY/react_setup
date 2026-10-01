import gsap from "gsap";

const DOCK_SCALE = 0.05;

// How a window leaves the screen when it is minimized (Settings › Dock).
// Each builds a paused timeline that takes the window from where it is now
// to gone. Minimizing plays it forwards; opening and restoring jump to its
// end and play it backwards, so a window comes back the way it left.
// The genie effect is separate (see genie.js), as it draws the window in
// strips rather than moving the window itself.
//
//   el      the window, displayed and at full size
//   from    its current x / y (it may have been dragged)
//   offset  distance from its centre to its dock icon's centre
//   rect    its box on screen

const scale = ({ el, from, offset }) =>
  gsap
    .timeline({ paused: true, defaults: { duration: 0.45 } })
    .to(el, { x: from.x + offset.x, scaleX: DOCK_SCALE, ease: "power1.in" }, 0)
    .to(el, { y: from.y + offset.y, scaleY: DOCK_SCALE, ease: "power3.in" }, 0)
    .to(el, { opacity: 0, duration: 0.15, ease: "none" }, 0.3);

// sinks a little and fades out where it is
const fade = ({ el, from }) =>
  gsap.timeline({ paused: true }).to(el, {
    y: from.y + 24,
    scale: 0.94,
    opacity: 0,
    duration: 0.35,
    ease: "power2.in",
  });

// tips backwards in 3D, then drops into its icon
const flip = ({ el, from, offset, rect }) =>
  gsap
    .timeline({ paused: true })
    .set(el, { transformPerspective: 1000, transformOrigin: "50% 100%" })
    .to(el, { rotationX: 70, duration: 0.3, ease: "power2.in" })
    .to(
      el,
      {
        x: from.x + offset.x,
        // it shrinks towards its bottom edge, so aim that at the icon
        y: from.y + offset.y - rect.height / 2,
        scale: DOCK_SCALE,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      },
      0.18,
    );

// spins down into its icon
const vortex = ({ el, from, offset }) =>
  gsap
    .timeline({ paused: true })
    .to(el, {
      x: from.x + offset.x,
      y: from.y + offset.y,
      scale: DOCK_SCALE,
      rotation: 540,
      duration: 0.6,
      ease: "power2.in",
    })
    .to(el, { opacity: 0, duration: 0.2, ease: "none" }, 0.4);

// falls off the bottom of the screen, tilting as it goes
const drop = ({ el, from, rect }) =>
  gsap
    .timeline({ paused: true })
    .to(el, {
      y: from.y + window.innerHeight - rect.top + 40,
      rotation: 6,
      duration: 0.5,
      ease: "power2.in",
    })
    .to(el, { opacity: 0, duration: 0.15, ease: "none" }, 0.35);

export const WINDOW_EFFECTS = { scale, fade, flip, vortex, drop };

// everything the effects above may have changed, back to normal
export const RESET_EFFECTS = {
  scale: 1,
  rotation: 0,
  rotationX: 0,
  opacity: 1,
  transformOrigin: "50% 50%",
};
