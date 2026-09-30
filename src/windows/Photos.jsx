import { Search } from "lucide-react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useWindowStore from "../store/window";
import { photosLinks, gallery } from "../constants/indax";

const Photos = () => {
  const { openWindow } = useWindowStore();

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="photos" />
        <Search className="icon" />
      </div>
      <div className="flex w-full">
        <div className="sidebar">
          <h2>Photos</h2>
          <ul>
            {photosLinks.map(({ id, icon, title }) => (
              <li key={id}>
                <img src={icon} alt={title} />
                <p>{title}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="gallery">
          <ul>
            {gallery.map(({ id, img }) => (
              <li
                key={id}
                className="cursor-pointer"
                onClick={() =>
                  openWindow("imgfile", {
                    name: `Gallery image ${id}`,
                    imageUrl: img,
                  })
                }
              >
                <img src={img} alt={`Gallery image ${id}`} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const PhotosWindow = WindowWrapper(Photos, "photos");

export default PhotosWindow;
