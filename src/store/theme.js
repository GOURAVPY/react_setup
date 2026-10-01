import { create } from "zustand";
import { flushSync } from "react-dom";

const STORAGE_KEY = "theme";
export const THEMES = ["light", "dark", "system"];

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const useThemeStore = create((set) => ({
  theme: readStoredTheme(),

  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage can be blocked; the choice then only lasts for this visit
    }
    set({ theme });
  },
}));

export const systemPrefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)");

const resolve = (theme) =>
  theme === "dark" || (theme === "system" && systemPrefersDark().matches)
    ? "dark"
    : "light";

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = resolve(theme);
};

// The new theme spreads out as a growing circle from the given point
const revealFrom = (x, y, update) => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!document.startViewTransition || reduceMotion) return update();

  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  // ready rejects when the browser skips the animation (e.g. a hidden tab);
  // the theme has still been applied, so there is nothing to recover
  const { ready } = document.startViewTransition(update);
  const animate = () => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  };
  ready.then(animate, () => {});
};

/**
 * Switches theme, revealing the new one in a circle growing out of `origin`
 * (the element that was clicked). `alsoUpdate` runs in the same render, for
 * state that should change together with the theme, such as closing a menu.
 */
export const changeTheme = (theme, origin, alsoUpdate) => {
  const update = () => {
    flushSync(() => {
      useThemeStore.getState().setTheme(theme);
      alsoUpdate?.();
    });
    applyTheme(theme);
  };

  const looksTheSame =
    document.documentElement.dataset.theme === resolve(theme);
  if (looksTheSame || !origin) return update();

  const { left, top, width, height } = origin.getBoundingClientRect();
  revealFrom(left + width / 2, top + height / 2, update);
};

export default useThemeStore;
