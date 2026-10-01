import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import useThemeStore, {
  applyTheme,
  changeTheme,
  systemPrefersDark,
} from "../store/theme";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const ThemeMenu = ({ icon }) => {
  const theme = useThemeStore((state) => state.theme);
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
          {OPTIONS.map(({ value, label, icon: optionIcon }) => {
            const Icon = optionIcon;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={theme === value}
                onClick={() =>
                  changeTheme(value, menu.current.firstElementChild, () =>
                    setIsOpen(false),
                  )
                }
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
