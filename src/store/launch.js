import useWindowStore from "./window";
import useLocationStore from "./location";
import { locations } from "../constants/indax";

// What tapping an app icon does, shared by the dock and the phone home
// screen: open the app, restore it if minimized, or bring it to the front.
const useLaunchApp = () => {
  const { openWindow, focusWindow, windows } = useWindowStore();
  const setActiveLocation = useLocationStore(
    (state) => state.setActiveLocation,
  );

  return (id) => {
    // The Trash has no window of its own: it is a folder shown in Finder
    if (id === "trash") {
      setActiveLocation(locations.trash);
      return openWindow("finder");
    }

    const window = windows[id];
    if (!window) return;

    if (window.isOpen && !window.isMinimized) focusWindow(id);
    else openWindow(id);
  };
};

export default useLaunchApp;
