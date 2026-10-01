import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Info,
  Palette,
  Plus,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useThemeStore, { changeTheme } from "../store/theme";
import useWallpaperStore, { CUSTOM_ID, WALLPAPERS } from "../store/wallpaper";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
];

const ABOUT = [
  ["Name", "Gourav's Portfolio"],
  ["Built with", "React, Vite, Tailwind CSS, GSAP"],
  ["Inspired by", "macOS"],
];

// Plays the startup and login screens again, like restarting a Mac
const restart = () => {
  try {
    sessionStorage.clear();
  } catch {
    // storage can be blocked; the page still reloads
  }
  window.location.reload();
};

const AppearancePane = () => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className="pane">
      <h3>Appearance</h3>
      <p>Choose how the desktop looks.</p>

      <div className="themes">
        {THEME_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={theme === value}
            onClick={(e) => changeTheme(value, e.currentTarget)}
          >
            <span className={clsx("preview", value)}>
              <i />
            </span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

const WallpaperPane = () => {
  const { wallpaper, customImage, setWallpaper, setCustomImage } =
    useWallpaperStore();
  const [message, setMessage] = useState("");
  const fileInput = useRef(null);

  const options = [
    ...WALLPAPERS,
    ...(customImage
      ? [
          {
            id: CUSTOM_ID,
            name: "Your Photo",
            background: `url("${customImage}")`,
          },
        ]
      : []),
  ];
  const current = options.find(({ id }) => id === wallpaper) ?? options[0];

  const addPhoto = async (e) => {
    const [file] = e.target.files;
    e.target.value = ""; // so picking the same file again still fires
    if (!file) return;

    try {
      const saved = await setCustomImage(file);
      setMessage(
        saved
          ? ""
          : "Photo applied, but it is too large to remember after a reload.",
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="pane">
      <h3>Wallpaper</h3>

      <div className="current">
        <span style={{ backgroundImage: current.background }} />
        <div>
          <p>{current.name}</p>
          <small>Shown on the desktop and the login screen.</small>
        </div>
      </div>

      <div className="wallpapers">
        {options.map(({ id, name, background }) => (
          <button
            key={id}
            type="button"
            aria-pressed={wallpaper === id}
            onClick={() => setWallpaper(id)}
          >
            <span style={{ backgroundImage: background }} />
            {name}
          </button>
        ))}

        <button type="button" onClick={() => fileInput.current.click()}>
          <span className="add">
            <Plus size={20} />
          </span>
          {customImage ? "Change Photo…" : "Add Photo…"}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={addPhoto}
        />
      </div>

      {message && <p role="status">{message}</p>}
    </div>
  );
};

const AboutPane = () => (
  <div className="pane">
    <h3>About</h3>
    <dl>
      {ABOUT.map(([term, detail]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>

    <button type="button" className="restart" onClick={restart}>
      <RotateCcw size={14} />
      Restart…
    </button>
  </div>
);

const PANES = [
  { id: "appearance", label: "Appearance", icon: Palette, pane: AppearancePane },
  { id: "wallpaper", label: "Wallpaper", icon: ImageIcon, pane: WallpaperPane },
  { id: "about", label: "About", icon: Info, pane: AboutPane },
];

const Settings = () => {
  const [active, setActive] = useState(PANES[0].id);
  const ActivePane = PANES.find(({ id }) => id === active).pane;

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="settings" />
        <h2>Settings</h2>
      </div>

      <div className="flex">
        <div className="sidebar">
          <div className="profile">
            <span>G</span>
            <div>
              <p>Gourav</p>
              <small>Portfolio account</small>
            </div>
          </div>

          <ul>
            {PANES.map(({ id, label, icon }) => {
              const Icon = icon;
              return (
                <li
                  key={id}
                  className={active === id ? "active" : "not-active"}
                  onClick={() => setActive(id)}
                >
                  <Icon size={16} />
                  <p>{label}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <ActivePane />
      </div>
    </>
  );
};

const SettingsWindow = WindowWrapper(Settings, "settings");

export default SettingsWindow;
