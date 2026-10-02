import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Info,
  Palette,
  PanelBottom,
  Plus,
  RotateCcw,
  Smile,
  Volume2,
  VolumeX,
} from "lucide-react";
import clsx from "clsx";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useThemeStore, { changeTheme } from "../store/theme";
import useWallpaperStore, { CUSTOM_ID, WALLPAPERS } from "../store/wallpaper";
import useDockStore, { ICON_STYLES, MINIMIZE_EFFECTS } from "../store/dock";
import useSoundStore, { playSound } from "../store/sound";
import usePixieStore, { callPixie } from "../store/pixie";
import { brainEnabled } from "../components/pixie/brain";
import AppIcon from "../components/AppIcon";

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

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    className="switch"
    onClick={() => onChange(!checked)}
  >
    <span />
  </button>
);

const PREVIEW_APPS = [
  { id: "finder", image: "finder.png" },
  { id: "safari", image: "safari.png" },
  { id: "photos", image: "photos.png" },
  { id: "terminal", image: "terminal.png" },
];

const DockPane = () => {
  const {
    iconStyle,
    minimizeEffect,
    autohide,
    indicators,
    setDock,
    resetDock,
  } = useDockStore();

  return (
    <div className="pane">
      <h3>Dock</h3>
      <p>Choose how the app icons look and how the Dock behaves.</p>

      <h4>Icon style</h4>
      <div className="icon-styles" role="radiogroup" aria-label="Icon style">
        {ICON_STYLES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={iconStyle === id}
            onClick={() => setDock("iconStyle", id)}
          >
            {/* each preview shows its own style, whatever is chosen */}
            <span className="preview">
              {PREVIEW_APPS.map((app) => (
                <AppIcon key={app.id} {...app} style={id} />
              ))}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="setting-group">
        <label className="setting-row">
          <span>Minimize windows using</span>
          <select
            value={minimizeEffect}
            onChange={(e) => setDock("minimizeEffect", e.target.value)}
          >
            {MINIMIZE_EFFECTS.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="setting-row">
          <span>Automatically hide and show the Dock</span>
          <Toggle
            label="Automatically hide and show the Dock"
            checked={autohide}
            onChange={(value) => setDock("autohide", value)}
          />
        </div>

        <div className="setting-row">
          <span>Show indicators for open applications</span>
          <Toggle
            label="Show indicators for open applications"
            checked={indicators}
            onChange={(value) => setDock("indicators", value)}
          />
        </div>
      </div>

      <button type="button" className="restart" onClick={resetDock}>
        <RotateCcw size={14} />
        Reset to Defaults
      </button>
    </div>
  );
};

const SoundPane = () => {
  const { enabled, volume, startup, setSound } = useSoundStore();

  return (
    <div className="pane">
      <h3>Sound</h3>
      <p>Sound effects for windows, the startup and alerts.</p>

      <div className="setting-group">
        <div className="setting-row">
          <span>Play sound effects</span>
          <Toggle
            label="Play sound effects"
            checked={enabled}
            onChange={(value) => setSound("enabled", value)}
          />
        </div>

        <label className={clsx("setting-row", !enabled && "disabled")}>
          <span>Volume</span>
          <span className="slider">
            <VolumeX size={14} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              disabled={!enabled}
              onChange={(e) => setSound("volume", Number(e.target.value))}
              // a short sound to judge the new level by
              onPointerUp={() => playSound("pop")}
              onKeyUp={() => playSound("pop")}
            />
            <Volume2 size={14} />
          </span>
        </label>

        <div className={clsx("setting-row", !enabled && "disabled")}>
          <span>Play sound on startup</span>
          <Toggle
            label="Play sound on startup"
            checked={startup}
            onChange={(value) => setSound("startup", value)}
          />
        </div>
      </div>

      <button
        type="button"
        className="restart"
        disabled={!enabled}
        onClick={() => playSound("startup")}
      >
        <Volume2 size={14} />
        Play Startup Sound
      </button>
    </div>
  );
};

const MOOD_FACES = {
  happy: "😊",
  curious: "🧐",
  sleepy: "😴",
  bored: "😐",
  excited: "🤩",
  shy: "☺️",
};

const PixiePane = () => {
  const { show, chatty, mind, mood, thought, setPixie } = usePixieStore();
  const thinking = brainEnabled && show && mind;

  return (
    <div className="pane">
      <h3>Pixie</h3>
      <p>The little guide who walks around the desktop and shows people how it works.</p>

      <div className="setting-group">
        <div className="setting-row">
          <span>Show Pixie</span>
          <Toggle
            label="Show Pixie"
            checked={show}
            onChange={(value) => setPixie("show", value)}
          />
        </div>

        <div className={clsx("setting-row", !show && "disabled")}>
          <span>Share tips on her own</span>
          <Toggle
            label="Share tips on her own"
            checked={chatty}
            onChange={(value) => setPixie("chatty", value)}
          />
        </div>

        <div className={clsx("setting-row", (!show || !brainEnabled) && "disabled")}>
          <span>
            Decides for herself (AI)
            <small>
              {brainEnabled
                ? "Her AI mind picks where she goes and what she does."
                : "Needs her AI brain; see server/README.md."}
            </small>
          </span>
          <Toggle
            label="Decides for herself"
            checked={mind && brainEnabled}
            onChange={(value) => setPixie("mind", value)}
          />
        </div>
      </div>

      {thinking && (
        <div className="pixie-mind" aria-live="polite">
          <span aria-hidden="true">{MOOD_FACES[mood] ?? "💭"}</span>
          <p>
            {thought ? (
              <>
                <strong>On her mind:</strong> “{thought}”
                {mood && <small>Feeling {mood}</small>}
              </>
            ) : (
              "She hasn't made a plan yet. Move around the page a little and she will."
            )}
          </p>
        </div>
      )}

      <button type="button" className="restart" onClick={callPixie}>
        <Smile size={14} />
        Call Pixie
      </button>
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
  { id: "dock", label: "Dock", icon: PanelBottom, pane: DockPane },
  { id: "sound", label: "Sound", icon: Volume2, pane: SoundPane },
  { id: "pixie", label: "Pixie", icon: Smile, pane: PixiePane },
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
