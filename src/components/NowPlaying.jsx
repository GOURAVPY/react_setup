import { Pause, Play } from "lucide-react";
import useMusicStore from "../store/music";
import useWindowStore from "../store/window";

// In the menu bar once a song has been played (the Music app keeps playing
// with its window closed): what's on, play or pause, and a click on the
// name opens Music.
const NowPlaying = () => {
  const { started, playing, songs, current, toggle } = useMusicStore();
  const openWindow = useWindowStore((state) => state.openWindow);
  if (!started) return null;
  const song = songs[current];

  return (
    <div className="now-playing">
      <button
        type="button"
        className="toggle"
        onClick={toggle}
        aria-label={playing ? "Pause the music" : "Play the music"}
        title={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
      </button>
      <button type="button" className="song" onClick={() => openWindow("music")} title="Open Music">
        <span aria-hidden="true">♪</span> {song.title}
      </button>
    </div>
  );
};

export default NowPlaying;
