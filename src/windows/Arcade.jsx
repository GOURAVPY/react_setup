import { useEffect, useRef } from "react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useWindowStore from "../store/window";
import { isMobile } from "../utils/device";

const GAME_URL = "/games/pacman/index.html";

// Runs the Pac-Man game from public/games/pacman in a frame, so its scripts,
// keys and styles stay separate from the rest of the site.
const Arcade = () => {
  const isOpen = useWindowStore((state) => state.windows.arcade.isOpen);
  const isMinimized = useWindowStore((state) => state.windows.arcade.isMinimized);
  const frame = useRef(null);

  // keys go straight to the game once it has loaded. Not on a phone, where
  // the game has its own on-screen buttons.
  const focusGame = () => {
    if (!isMobile()) frame.current?.contentWindow?.focus();
  };

  // the game pauses while the window is in the dock, and stays paused
  // until the player resumes it
  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      isMinimized ? "hidden" : "visible",
      window.location.origin,
    );
    if (!isMinimized) focusGame();
  }, [isMinimized]);

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="arcade" />
        <h2>Arcade</h2>
      </div>

      {/* only while open: closing the window ends the game and its sound */}
      {isOpen && (
        <iframe
          ref={frame}
          src={GAME_URL}
          title="Pac-Man"
          onLoad={focusGame}
        />
      )}
    </>
  );
};

const ArcadeWindow = WindowWrapper(Arcade, "arcade");

export default ArcadeWindow;
