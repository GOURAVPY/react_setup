import { useRef } from "react";
import useWindowStore from "../store/window";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import gsap from "gsap";
import clsx from "clsx";
import createGenie from "./genie";

gsap.registerPlugin(Draggable);

const getPosition = (el) => ({
  x: gsap.getProperty(el, "x"),
  y: gsap.getProperty(el, "y"),
});

const DOCK_SCALE = 0.05;

// A window's dock icon, or the dock itself for windows that have no icon
const getDockTarget = (windowKey) =>
  document.querySelector(`#dock [data-app="${windowKey}"]`) ??
  document.querySelector("#dock .dock-container");

// Distance from the window's centre to its dock target. The window must be
// visible and unscaled.
const getDockOffset = (el, windowKey) => {
  const rect = el.getBoundingClientRect();
  const dock = getDockTarget(windowKey)?.getBoundingClientRect();

  if (!dock?.width) return { x: 0, y: window.innerHeight - rect.top };

  return {
    x: dock.left + dock.width / 2 - (rect.left + rect.width / 2),
    y: dock.top + dock.height / 2 - (rect.top + rect.height / 2),
  };
};

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex, isMinimized, isMaximized } =
      windows[windowKey] ?? {};
    const ref = useRef(null);
    const draggable = useRef(null);
    const previous = useRef({ isOpen: false, isMinimized: false });
    const minimizedFrom = useRef({ x: 0, y: 0 });
    const maximizedFrom = useRef(null);
    const genie = useRef(null);

    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      [draggable.current] = Draggable.create(el, {
        onPress: () => focusWindow(windowKey),
      });

      return () => draggable.current?.kill();
    }, []);

    // Maximize: fill the screen and lock dragging, then put the window back
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      if (isMaximized) {
        maximizedFrom.current = getPosition(el);
        gsap.set(el, { x: 0, y: 0 });
        draggable.current?.disable();
      } else if (maximizedFrom.current) {
        gsap.set(el, maximizedFrom.current);
        maximizedFrom.current = null;
        draggable.current?.enable();
      }
    }, [isMaximized]);

    // Open from the dock icon, close, minimize into the dock and restore from it
    useGSAP(() => {
      const el = ref.current;
      if (!el) return;

      const was = previous.current;
      previous.current = { isOpen, isMinimized };

      const hide = () => {
        el.style.display = "none";
      };

      // Pours the window into its dock icon (or back out of it). Returns
      // false when there is no dock to pour into, e.g. on small screens.
      const playGenie = (from, to, onComplete) => {
        const dock = getDockTarget(windowKey)?.getBoundingClientRect();
        const effect = dock?.width ? createGenie(el, dock) : null;
        if (!effect) return false;

        const state = { progress: from };
        effect.render(from);
        el.classList.add("window-pouring");

        const tween = gsap.to(state, {
          progress: to,
          duration: 0.6,
          ease: "power1.inOut",
          onUpdate: () => effect.render(state.progress),
          onComplete: () => {
            stopGenie();
            onComplete?.();
          },
        });

        genie.current = { tween, effect };
        return true;
      };

      const stopGenie = () => {
        genie.current?.tween.kill();
        genie.current?.effect.destroy();
        genie.current = null;
        el.classList.remove("window-pouring");
      };

      stopGenie();

      if (!isOpen) {
        gsap.killTweensOf(el);
        if (!was.isOpen || was.isMinimized) return hide();
        gsap.to(el, {
          scale: 0.92,
          opacity: 0,
          duration: 0.18,
          ease: "power2.in",
          onComplete: hide,
        });
        return;
      }

      if (isMinimized) {
        if (was.isMinimized) return;
        gsap.killTweensOf(el);
        el.style.display = "block";
        gsap.set(el, { scale: 1, opacity: 1 });
        const from = getPosition(el);
        minimizedFrom.current = from;

        if (playGenie(0, 1, hide)) return;

        // No dock to pour into: shrink the window away instead
        const offset = getDockOffset(el, windowKey);
        gsap
          .timeline({ defaults: { duration: 0.45 }, onComplete: hide })
          .to(el, { x: from.x + offset.x, scaleX: DOCK_SCALE, ease: "power1.in" }, 0)
          .to(el, { y: from.y + offset.y, scaleY: DOCK_SCALE, ease: "power3.in" }, 0)
          .to(el, { opacity: 0, duration: 0.15, ease: "none" }, 0.3);
        return;
      }

      gsap.killTweensOf(el);
      el.style.display = "block";

      if (was.isOpen && was.isMinimized) {
        const to = minimizedFrom.current;
        const wasShrunk = gsap.getProperty(el, "opacity") < 1;
        if (!wasShrunk && playGenie(1, 0)) return;

        gsap
          .timeline({ defaults: { duration: 0.45 } })
          .to(el, { opacity: 1, duration: 0.15, ease: "none" }, 0)
          .to(el, { y: to.y, scaleY: 1, ease: "power3.out" }, 0)
          .to(el, { x: to.x, scaleX: 1, ease: "power1.out" }, 0);
      } else if (!was.isOpen) {
        gsap.set(el, { x: 0, y: 0, scale: 1, opacity: 1 });
        if (playGenie(1, 0)) return;

        // No dock to pour out of: grow the window into place instead
        const offset = getDockOffset(el, windowKey);
        gsap.fromTo(
          el,
          { ...offset, scale: DOCK_SCALE, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" }
        );
      }
    }, [isOpen, isMinimized]);

    return (
      <section
        id={windowKey}
        ref={ref}
        style={{ zIndex, display: "none" }}
        className={clsx("window absolute", isMaximized && "window-maximized")}
      >
        <Component {...props} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper${
    Component.displayName || Component.name || "Component"
  }`;

  return Wrapped;
};

export default WindowWrapper;
