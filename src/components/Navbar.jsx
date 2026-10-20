import { useEffect, useState } from "react";
import { navIcons, navLinks } from "../constants/indax";
import dayjs from "dayjs";
import useWindowStore from "../store/window";
import ThemeMenu from "./ThemeMenu";
import NowPlaying from "./NowPlaying";
import { useIconSrc } from "../utils/pixelIcons";
import useSpotlightStore from "../store/spotlight";
import { shortcutLabel } from "./spotlightSearch";

// the time in the menu bar, ticking over on the minute
const Clock = () => {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    let timer;
    const untilNextMinute = () => 60_000 - (Date.now() % 60_000) + 50;
    const tick = () => {
      setNow(dayjs());
      timer = setTimeout(tick, untilNextMinute());
    };
    timer = setTimeout(tick, untilNextMinute());
    return () => clearTimeout(timer);
  }, []);
  return <time dateTime={now.format("YYYY-MM-DDTHH:mm")}>{now.format("ddd MMM DD h:mm A")}</time>;
};

const Navbar = () => {
  const openWindow = useWindowStore((state) => state.openWindow);
  const toggleSpotlight = useSpotlightStore((state) => state.toggle);
  const iconSrc = useIconSrc();
  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="logo" />
        <p className="font_bold">Gourav's portfolio</p>

        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li key={id} onClick={() => openWindow(type)}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          {navIcons.map(({ id, img }) =>
            img.includes("mode") ? (
              <ThemeMenu key={id} icon={iconSrc(img)} />
            ) : img.includes("search") ? (
              <li key={id}>
                <button
                  type="button"
                  className="spotlight-button"
                  aria-label="Spotlight Search"
                  title={`Spotlight Search (${shortcutLabel()})`}
                  onClick={toggleSpotlight}
                >
                  <img src={iconSrc(img)} className="icon-hover" alt="" />
                </button>
              </li>
            ) : (
              <li key={id}>
                <img src={iconSrc(img)} className="icon-hover" alt={id} />
              </li>
            ),
          )}
        </ul>

        <NowPlaying />
        <Clock />
      </div>
    </nav>
  );
};

export default Navbar;
