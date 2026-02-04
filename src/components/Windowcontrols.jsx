import React from "react";
import useWindowStore from "../store/window";

const WindowControls = ({ target }) => {
  const { closeWindow, minimizeWindow, maximizeWindow } = useWindowStore();

  return (
    <div id="window-controls">
      <button className="close" onClick={() => closeWindow(target)} aria-label="Close window" />
      <button className="minimize" onClick={() => minimizeWindow(target)} aria-label="Minimize window" />
      <button className="maximize" onClick={() => maximizeWindow(target)} aria-label="Maximize window" />
    </div>
  );
};

export default WindowControls;
