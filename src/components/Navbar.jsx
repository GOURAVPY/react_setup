import { navIcons, navLinks } from "../constants/indax";
import dayjs from "dayjs";

const Navbar = () => {
  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="logo" />
        <p className="font_bold">Gourav's portfolio</p>

        <ul>
          {navLinks.map(({ id, name }) => (
            <li key={id}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} className="icon-hover" alt={id} />
            </li>
          ))}
        </ul>

        <time>{dayjs().format("ddd MMM D h:mm A")}</time>
      </div>
    </nav>
  );
};

export default Navbar;
