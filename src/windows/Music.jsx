import { useEffect, useRef } from "react";
import clsx from "clsx";
import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from "lucide-react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useMusicStore from "../store/music";
import useWindowStore from "../store/window";
import { COVERS, COVER_SIZE } from "../music/covers";
import * as synth from "../music/synth";

// The Music app in the dock: Gourav's little chiptune songs (music/songs.js),
// played by the site itself. What's on, the controls and a pixel visualizer
// on the left; the songs on the right.

const BARS = 16; // in the visualizer
const BAR_HEIGHT = 10;

const time = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

// a song's cover: its pixel picture on its colours
const Cover = ({ cover, size }) => {
  const canvas = useRef(null);
  const art = COVERS[cover];

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, COVER_SIZE, COVER_SIZE);
    art.draw(ctx);
  }, [art]);

  return (
    <span className={clsx("music-cover", size)} style={{ "--from": art.from, "--to": art.to }}>
      <canvas ref={canvas} width={COVER_SIZE} height={COVER_SIZE} aria-hidden="true" />
    </span>
  );
};

// bars that jump with the music, while it plays and the window is open
const Visualizer = () => {
  const canvas = useRef(null);
  const playing = useMusicStore((state) => state.playing);
  const open = useWindowStore((state) => state.windows.music?.isOpen);

  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, BARS * 2, BAR_HEIGHT);
      synth.levels(BARS).forEach((level, i) => {
        const height = playing ? Math.max(1, Math.round(level * BAR_HEIGHT)) : 1;
        for (let y = 0; y < Math.min(height, BAR_HEIGHT); y++) {
          ctx.fillStyle = y >= BAR_HEIGHT * 0.7 ? "#fb7185" : y >= BAR_HEIGHT * 0.4 ? "#f9a8d4" : "#c084fc";
          ctx.fillRect(i * 2, BAR_HEIGHT - 1 - y, 1, 1);
        }
      });
      if (playing && open) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [playing, open]);

  return <canvas ref={canvas} width={BARS * 2} height={BAR_HEIGHT} className="music-visualizer" aria-hidden="true" />;
};

const Music = () => {
  const {
    songs,
    current,
    playing,
    position,
    volume,
    shuffle,
    repeat,
    play,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = useMusicStore();
  const song = songs[current];
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="music" />
        <h2>Music</h2>
        <span className="w-14" />
      </div>

      <div className="music-body">
        <section className="music-now" aria-label="Now playing">
          <Cover cover={song.cover} size="large" />
          <Visualizer />

          <div className="music-title">
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>

          <div className="music-progress">
            <input
              type="range"
              min={0}
              max={song.duration}
              step={0.1}
              value={position}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Position in the song"
              aria-valuetext={`${time(position)} of ${time(song.duration)}`}
              style={{ "--fill": `${(position / song.duration) * 100}%` }}
            />
            <div>
              <span>{time(position)}</span>
              <span>-{time(Math.max(0, song.duration - position))}</span>
            </div>
          </div>

          <div className="music-controls">
            <button
              type="button"
              className={clsx("small", shuffle && "on")}
              onClick={toggleShuffle}
              aria-pressed={shuffle}
              aria-label="Shuffle"
              title="Shuffle"
            >
              <Shuffle size={16} />
            </button>
            <button type="button" onClick={previous} aria-label="Previous song" title="Previous">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              type="button"
              className="play"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              title={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
            <button type="button" onClick={next} aria-label="Next song" title="Next">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              type="button"
              className={clsx("small", repeat !== "off" && "on")}
              onClick={cycleRepeat}
              aria-label={`Repeat: ${repeat === "one" ? "this song" : repeat === "all" ? "all songs" : "off"}`}
              title={`Repeat: ${repeat === "one" ? "this song" : repeat === "all" ? "all songs" : "off"}`}
            >
              {repeat === "one" ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>

          <label className="music-volume">
            <VolumeIcon size={15} aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              style={{ "--fill": `${volume * 100}%` }}
            />
          </label>
        </section>

        <div className="music-library">
          <h3>Songs</h3>
          <p>Written by Gourav, played by the site itself.</p>
          <ol className="music-list">
            {songs.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={clsx(i === current && "current")}
                  onClick={() => (i === current ? toggle() : play(i))}
                  aria-label={`${item.title} by ${item.artist}, ${time(item.duration)}`}
                  aria-current={i === current ? "true" : undefined}
                >
                  <span className="number">
                    {i === current && playing ? (
                      <span className="music-playing" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <Cover cover={item.cover} size="small" />
                  <span className="name">
                    <b>{item.title}</b>
                    <small>{item.artist}</small>
                  </span>
                  <span className="length">{time(item.duration)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
};

const MusicWindow = WindowWrapper(Music, "music");

export default MusicWindow;
