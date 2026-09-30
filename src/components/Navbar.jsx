import { navIcons, navLinks } from "../constants/indax";
import dayjs from "dayjs";
import useWindowStore from "../store/window";
import ThemeMenu from "./ThemeMenu";

const Navbar = () => {
  const { openWindow } = useWindowStore();
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
