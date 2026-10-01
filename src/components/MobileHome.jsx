import dayjs from "dayjs";
import { dockApps } from "#constants/indax.js";
import useWindowStore from "../store/window";
import useLaunchApp from "../store/launch";

const APPS = [
  ...dockApps.filter(({ id }) => id !== "trash"),
  { id: "resume", name: "Resume", icon: "pdf.png" },
  ...dockApps.filter(({ id }) => id === "trash"),
];

const DOCK_IDS = ["finder", "safari", "contact", "settings"];
const DOCK_APPS = DOCK_IDS.map((id) => APPS.find((app) => app.id === id));

// iPhone-style home screen, shown instead of the Mac desktop on phones
const MobileHome = () => {
  const windows = useWindowStore((state) => state.windows);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const launch = useLaunchApp();

  const [frontApp] = Object.entries(windows)
    .filter(([, window]) => window.isOpen && !window.isMinimized)
    .sort(([, a], [, b]) => b.zIndex - a.zIndex)
    .map(([id]) => id);

  const renderIcon = ({ id, name, icon }, showLabel = true) => (
    <li key={id}>
      <button
        type="button"
        data-app={id}
        aria-label={name}
        onClick={() => launch(id)}
      >
        <img src={`/images/${icon}`} alt="" />
        {showLabel && <span>{name}</span>}
      </button>
    </li>
  );

  return (
    <>
      <section id="ios-home">
        <div className="widget">
          <small>{dayjs().format("dddd, MMMM D")}</small>
          <h1>Hi, I&apos;m Gourav</h1>
          <p>Welcome to my portfolio. Tap an app to look around.</p>
        </div>

        <ul className="apps">{APPS.map((app) => renderIcon(app))}</ul>

        <ul className="ios-dock">
          {DOCK_APPS.map((app) => renderIcon(app, false))}
        </ul>
      </section>

      {frontApp && (
        <button
          type="button"
          id="home-indicator"
          aria-label="Go to home screen"
          onPointerUp={() => closeWindow(frontApp)}
        >
          <span />
        </button>
      )}
    </>
  );
};

export default MobileHome;
