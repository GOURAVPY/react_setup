import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import useThemeStore from "../store/theme";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const systemPrefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)");

const applyTheme = (theme) => {
  const isDark =
    theme === "dark" || (theme === "system" && systemPrefersDark().matches);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
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

const ThemeMenu = ({ icon }) => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const menu = useRef(null);

  // Apply the chosen theme, following the device setting while on "system"
  useEffect(() => {
    const query = systemPrefersDark();
    const apply = () => applyTheme(theme);

    apply();
    if (theme !== "system") return;

    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    if (!isOpen) return;

    const close = (e) => {
      if (e.key === "Escape" || !menu.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [isOpen]);

  const chooseTheme = (value) => {
    const update = () => {
      flushSync(() => {
        setTheme(value);
        setIsOpen(false);
      });
      applyTheme(value);
    };

    const before = document.documentElement.dataset.theme;
    const willBeDark =
      value === "dark" || (value === "system" && systemPrefersDark().matches);
    if (before === (willBeDark ? "dark" : "light")) return update();

    const { left, top, width, height } =
      menu.current.firstElementChild.getBoundingClientRect();
    revealFrom(left + width / 2, top + height / 2, update);
  };

  return (
    <li ref={menu} className="theme-menu">
      <button
        type="button"
        aria-label="Appearance"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <img src={icon} className="icon-hover" alt="" />
      </button>

      {isOpen && (
        <section role="menu" aria-label="Appearance">
          <h3>Appearance</h3>
          {OPTIONS.map(({ value, label, icon }) => {
            const Icon = icon;
            return (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={theme === value}
              onClick={() => chooseTheme(value)}
            >
              <Icon size={15} />
              <span>{label}</span>
              {theme === value && <Check size={14} />}
            </button>
            );
          })}
        </section>
      )}
    </li>
  );
};

export default ThemeMenu;
