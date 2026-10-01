import { useRef } from "react";
import useWindowStore from "../store/window";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import gsap from "gsap";
import clsx from "clsx";
import createGenie from "./genie";
import { RESET_EFFECTS, WINDOW_EFFECTS } from "./windowEffects";
import { isMobile, mobileQuery } from "../utils/device";
import useDockStore from "../store/dock";

gsap.registerPlugin(Draggable);

const getPosition = (el) => ({
  x: gsap.getProperty(el, "x"),
  y: gsap.getProperty(el, "y"),
});

const DOCK_SCALE = 0.05;

let peekTimer = null;

// An auto-hiding dock is shown for a moment while a window pours into or
// out of it, so the window has somewhere to go. It is shown instantly (the
// "peek" class turns its slide off), so it can be measured straight away.
const peekDock = () => {
  const dock = document.getElementById("dock");
  if (!dock?.classList.contains("autohide")) return;

  dock.classList.add("peek");
  clearTimeout(peekTimer);
  peekTimer = setTimeout(() => dock.classList.remove("peek"), 1400);
};

// A window's icon in the dock (or on the phone home screen), or the dock
// itself for windows that have no icon
const getDockTarget = (windowKey) => {
  if (!isMobile()) peekDock();

  const [home, dock] = isMobile()
    ? ["#ios-home", "#ios-home .ios-dock"]
    : ["#dock", "#dock .dock-container"];

  return (
    document.querySelector(`${home} [data-app="${windowKey}"]`) ??
    document.querySelector(dock)
  );
};

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
    // Only this window's own state, so other windows changing does not
    // re-render this one
    const focusWindow = useWindowStore((state) => state.focusWindow);
    const { isOpen, zIndex, isMinimized, isMaximized } =
      useWindowStore((state) => state.windows[windowKey]) ?? {};
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

      // on a phone every app is full screen, so there is nothing to drag
      const query = mobileQuery();
      const syncDragging = () => draggable.current?.enabled(!query.matches);
      syncDragging();
      query.addEventListener("change", syncDragging);

      return () => {
        query.removeEventListener("change", syncDragging);
        draggable.current?.kill();
      };
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
      // false on phones, when another effect is chosen in Settings, or when
      // the window sits where it cannot pour into the dock.
      const playGenie = (from, to, onComplete) => {
        const { minimizeEffect } = useDockStore.getState();
        if (isMobile() || minimizeEffect !== "genie") return false;
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

      // Plays the minimize effect chosen in Settings, forwards (leaving) or
      // backwards (arriving). The window must be shown at full size. A
      // genie that cannot play here falls back to the scale effect.
      const playEffect = (reverse, onComplete) => {
        const { minimizeEffect } = useDockStore.getState();
        const build = WINDOW_EFFECTS[minimizeEffect] ?? WINDOW_EFFECTS.scale;
        const timeline = build({
          el,
          from: getPosition(el),
          offset: getDockOffset(el, windowKey),
          rect: el.getBoundingClientRect(),
        });

        if (onComplete) {
          timeline.eventCallback(
            reverse ? "onReverseComplete" : "onComplete",
            onComplete,
          );
        }
        if (reverse) timeline.progress(1).reverse();
        else timeline.play();
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

        // phone: the app shrinks back into its icon, like going home on iOS
        if (isMobile()) {
          gsap.set(el, { x: 0, y: 0, scale: 1 });
          gsap.to(el, {
            ...getDockOffset(el, windowKey),
            scale: DOCK_SCALE,
            opacity: 0,
            duration: 0.4,
            ease: "power3.in",
            onComplete: hide,
          });
          return;
        }

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
        gsap.set(el, RESET_EFFECTS);
        minimizedFrom.current = getPosition(el);

        if (!playGenie(0, 1, hide)) playEffect(false, hide);
        return;
      }

      gsap.killTweensOf(el);
      el.style.display = "block";

      // Restoring returns the window to where it was; opening puts it in its
      // usual place. Either way it is set there at full size first, so the
      // effect can measure it, and then the effect plays backwards.
      if (was.isOpen && was.isMinimized) {
        gsap.set(el, { ...RESET_EFFECTS, ...minimizedFrom.current });
      } else if (!was.isOpen) {
        gsap.set(el, { ...RESET_EFFECTS, x: 0, y: 0 });
      } else {
        return;
      }

      if (!playGenie(1, 0)) playEffect(true);
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
