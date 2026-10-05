import { navIcons, navLinks } from "../constants/indax";
import dayjs from "dayjs";
import useWindowStore from "../store/window";
import ThemeMenu from "./ThemeMenu";
import useSpotlightStore from "../store/spotlight";
import { shortcutLabel } from "./spotlightSearch";

const Navbar = () => {
  const openWindow = useWindowStore((state) => state.openWindow);
  const toggleSpotlight = useSpotlightStore((state) => state.toggle);
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
              <ThemeMenu key={id} icon={img} />
            ) : img.includes("search") ? (
              <li key={id}>
                <button
                  type="button"
                  className="spotlight-button"
                  aria-label="Spotlight Search"
                  title={`Spotlight Search (${shortcutLabel()})`}
                  onClick={toggleSpotlight}
                >
                  <img src={img} className="icon-hover" alt="" />
                </button>
              </li>
            ) : (
              <li key={id}>
                <img src={img} className="icon-hover" alt={id} />
              </li>
            ),
          )}
        </ul>

        <time>{dayjs().format("ddd MMM DD h:mm A")}</time>
      </div>
    </nav>
  );
};

export default Navbar;
