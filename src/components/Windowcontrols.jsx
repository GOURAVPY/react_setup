import React from "react";
import { X, Minus, Maximize2 } from "lucide-react";
import useWindowStore from "../store/window";

const WindowControls = ({ target }) => {
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowStore((state) => state.maximizeWindow);

  return (
    <div id="window-controls" className="group">
      <button className="close" onClick={() => closeWindow(target)} aria-label="Close window">
        <X />
      </button>
      <button className="minimize" onClick={() => minimizeWindow(target)} aria-label="Minimize window">
        <Minus />
      </button>
      <button className="maximize" onClick={() => maximizeWindow(target)} aria-label="Maximize window">
        <Maximize2 />
      </button>
    </div>
  );
};

export default WindowControls;
