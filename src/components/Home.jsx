import { locations } from "../constants/indax";
import clsx from "clsx";
import { useIconSrc } from "../utils/pixelIcons";

const projects = locations.wark?.children ?? [];

const Home = () => {
  const iconSrc = useIconSrc();
  return (
    <section id="home">
      <ul>
        {projects.map((project) => (
          <li
            key={project.id}
            className={clsx("group folder", project.windowPosition)}
          >
            <img src={iconSrc("/images/folder.png")} alt={project.name} />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
