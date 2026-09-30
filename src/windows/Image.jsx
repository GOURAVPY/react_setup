import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useWindowStore from "../store/window";

const Image = () => {
  const { windows } = useWindowStore();
  const data = windows.imgfile.data;

  if (!data) return null;

  const { name, imageUrl } = data;

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="imgfile" />
        <p>{name}</p>
      </div>
      <div className="preview">
        {imageUrl ? <img src={imageUrl} alt={name} /> : null}
      </div>
    </>
  );
};

const ImageWindow = WindowWrapper(Image, "imgfile");

export default ImageWindow;
