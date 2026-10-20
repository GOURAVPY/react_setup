import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useWindowStore from "../store/window";
import useLocationStore from "../store/location";
import { playSound } from "../store/sound";
import { locations, techStack } from "../constants/indax";
import { ABOUT } from "../constants/about";
import { BOOK_ART, BOOK_PALETTE, projectArt } from "./bookArt";
import { GOURAV_FRAMES, GOURAV_PALETTE } from "../components/pixie/gourav";
import { FRAMES as PIXIE_FRAMES, PALETTE as PIXIE_PALETTE } from "../components/pixie/sprites";

// Gourav's book: the one he gives Pixie in her story, "everything about me".
// A pixel-art book whose pages turn in little steps, like an old game. Click
// the right page to turn forward and the left page to go back (or use the
// arrow keys). Its words come from constants/about.js, and its project and
// skill pages from the same lists as the Portfolio and Skills apps.

const STAGE_W = 640; // the open book's own size; it's scaled down to fit
const STAGE_H = 420;
const WINDOW_W = 736; // the window at its widest (46rem), as in index.css
const DESK_PADDING = 48; // the desk's padding, both sides

// how much the book is shrunk before the window has been measured: what
// fits in the window at this screen width
const guessScale = () =>
  Math.min(1, (Math.min(WINDOW_W, window.innerWidth - 32) - DESK_PADDING) / STAGE_W);
const TECH_SHOWN = 5; // tools listed on a project page

// the pages, in order: two to a leaf, front then back
const PAGES = (() => {
  const inner = [
    { id: "hello" },
    { id: "what" },
    { id: "work" },
    ...locations.work.children.map((project) => ({ id: `project-${project.id}`, project })),
    { id: "skills" },
    { id: "learning" },
    { id: "next" },
    { id: "hi" },
  ];
  // the leaves need an even number of pages
  if (inner.length % 2) inner.push({ id: "notes" });
  return [{ id: "cover", cover: true }, ...inner, { id: "end", cover: true }];
})();
const LEAVES = Array.from({ length: PAGES.length / 2 }, (_, i) => ({ front: PAGES[i * 2], back: PAGES[i * 2 + 1] }));
const INNER_PAGES = PAGES.length - 2;

// a picture from a grid of letters, drawn on a canvas and scaled up crisply
const PixelArt = ({ rows, palette = BOOK_PALETTE, scale = 4, label = "" }) => {
  const canvas = useRef(null);
  const width = Math.max(...rows.map((row) => row.length));
  const height = rows.length;
  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    rows.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === ".") return;
        ctx.fillStyle = palette[cell];
        ctx.fillRect(x, y, 1, 1);
      }),
    );
  }, [rows, palette, width, height]);
  return (
    <canvas
      ref={canvas}
      width={width}
      height={height}
      className="pixel-art"
      style={{ width: width * scale, height: height * scale }}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    />
  );
};

// a button on a page: it acts without turning the page
const PageButton = ({ onClick, children }) => (
  <button
    type="button"
    className="book-button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    {children}
  </button>
);

const ProjectPage = ({ project }) => {
  const openWindow = useWindowStore((state) => state.openWindow);
  const setActiveLocation = useLocationStore((state) => state.setActiveLocation);
  const notes = project.children?.find(({ fileType }) => fileType === "txt");
  const tech = notes?.description
    ?.find((line) => line.startsWith("Tech:"))
    ?.replace(/^Tech:\s*/, "")
    .replace(/\.$/, "")
    .split(/,\s*/);
  return (
    <>
      <PixelArt rows={BOOK_ART[projectArt(project.name)]} scale={5} />
      <span className="book-kicker">A project of mine</span>
      <h3>{project.name}</h3>
      {notes?.subtitle && <p>{notes.subtitle}</p>}
      {tech && (
        <p className="small">
          {tech.slice(0, TECH_SHOWN).join(" · ")}
          {tech.length > TECH_SHOWN ? " …" : ""}
        </p>
      )}
      <PageButton
        onClick={() => {
          setActiveLocation(project);
          openWindow("finder");
        }}
      >
        Look inside ›
      </PageButton>
    </>
  );
};

const SayHiPage = () => {
  const openWindow = useWindowStore((state) => state.openWindow);
  return (
    <>
      <PixelArt rows={BOOK_ART.envelope} scale={5} />
      <h3>Say hi!</h3>
      <p>I'd love to hear from you.</p>
      <p>
        <a href={`mailto:${ABOUT.email}`} onClick={(e) => e.stopPropagation()}>
          {ABOUT.email}
        </a>
      </p>
      <div className="book-buttons">
        <PageButton onClick={() => openWindow("contact")}>Contact</PageButton>
        <PageButton onClick={() => openWindow("resume")}>My résumé</PageButton>
      </div>
    </>
  );
};

const PageContent = ({ page }) => {
  if (page.project) return <ProjectPage project={page.project} />;
  switch (page.id) {
    case "cover":
      return (
        <>
          <PixelArt rows={BOOK_ART.emblem} scale={4} />
          <h2>Everything about me</h2>
          <PixelArt rows={GOURAV_FRAMES.stand} palette={GOURAV_PALETTE} scale={3} label={ABOUT.name} />
          <p className="book-author">{ABOUT.name}</p>
          <p className="book-hint">Click to open ›</p>
        </>
      );
    case "hello":
      return (
        <>
          <PixelArt rows={GOURAV_FRAMES.raise} palette={GOURAV_PALETTE} scale={5} label={`${ABOUT.firstName}, waving`} />
          <h3>Hi, I'm {ABOUT.firstName}!</h3>
          <p>{ABOUT.role}</p>
          <p className="small">from {ABOUT.home}</p>
        </>
      );
    case "what":
      return (
        <>
          <PixelArt rows={BOOK_ART.laptop} scale={5} />
          <h3>What I do</h3>
          {ABOUT.whatIDo.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </>
      );
    case "work":
      return (
        <>
          <PixelArt rows={BOOK_ART.briefcase} scale={5} />
          <h3>At work</h3>
          <p>
            {ABOUT.job.title} at {ABOUT.job.company}, {ABOUT.job.years}
          </p>
          <p className="small">What I've built there:</p>
          <ul className="book-list">
            {locations.company?.children.map(({ id, name }) => (
              <li key={id}>{name}</li>
            ))}
          </ul>
        </>
      );
    case "skills":
      return (
        <>
          <PixelArt rows={BOOK_ART.toolbox} scale={3} />
          <h3>My toolbox</h3>
          {techStack.map(({ category, items }) => (
            <div key={category} className="book-skills">
              <span className="small">{category}</span>
              <div className="book-chips">
                {items.map((item) => (
                  <span key={item} className="book-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </>
      );
    case "learning":
      return (
        <>
          <PixelArt rows={BOOK_ART.cap} scale={5} />
          <h3>Learning</h3>
          <p>{ABOUT.education}</p>
          <p className="small">What I'm good at:</p>
          <ul className="book-list">
            {ABOUT.strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </>
      );
    case "next":
      return (
        <>
          <PixelArt rows={BOOK_ART.globe} scale={6} />
          <h3>Next chapter</h3>
          <p>{ABOUT.nextChapter}</p>
        </>
      );
    case "hi":
      return <SayHiPage />;
    case "notes":
      return (
        <>
          <PixelArt rows={PIXIE_FRAMES.read} palette={PIXIE_PALETTE} scale={5} label="Pixie, reading" />
          <p className="small">(Pixie's favourite page.)</p>
        </>
      );
    case "end":
      return (
        <>
          <PixelArt rows={PIXIE_FRAMES.waveUp} palette={PIXIE_PALETTE} scale={5} label="Pixie, waving" />
          <h2>The end…</h2>
          <p className="book-hint">…for now! ✨</p>
        </>
      );
    default:
      return null;
  }
};

const Book = () => {
  const isOpen = useWindowStore((state) => state.windows.book.isOpen);
  const [turned, setTurned] = useState(0); // leaves turned over so far
  const [wasOpen, setWasOpen] = useState(isOpen);
  const holder = useRef(null);
  const [scale, setScale] = useState(guessScale);

  // it opens at the cover each time
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTurned(0);
  }

  // the book shrinks to fit a narrow window. While the window is shut it
  // measures 0 wide: the last size is kept, so the book is there the moment
  // the window opens instead of growing in a frame later.
  useEffect(() => {
    const watcher = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      if (width > 0) setScale(Math.min(1, width / STAGE_W));
    });
    watcher.observe(holder.current);
    return () => watcher.disconnect();
  }, []);

  const turnTo = (count) => {
    const next = Math.min(LEAVES.length, Math.max(0, count));
    if (next === turned) return;
    setTurned(next);
    playSound("page");
  };

  // the right page turns forward, the left one back
  const onLeafClick = (i) => {
    if (i === turned) turnTo(turned + 1);
    else if (i === turned - 1) turnTo(turned - 1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") turnTo(turned + 1);
    else if (e.key === "ArrowLeft") turnTo(turned - 1);
    else return;
    e.preventDefault();
  };

  const state = turned === 0 ? "closed" : turned === LEAVES.length ? "finished" : "open";
  const where =
    state === "closed" ? "Cover" : state === "finished" ? "The end" : `Pages ${turned * 2 - 1}–${turned * 2} of ${INNER_PAGES}`;

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="book" />
        <h2>Gourav's Book</h2>
        <span className="w-14" />
      </div>
      <div
        className="book-desk"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Gourav's book. Use the arrow keys to turn the pages."
      >
        <div ref={holder} className="book-holder" style={{ height: STAGE_H * scale }}>
          <div className={clsx("book", state)} style={{ transform: `scale(${scale})` }}>
            <div className="book-shift">
              {LEAVES.map(({ front, back }, i) => {
                const flipped = i < turned;
                const frontShown = i === turned;
                const backShown = i === turned - 1;
                return (
                  <div
                    key={front.id}
                    className={clsx("leaf", flipped && "turned")}
                    style={{ zIndex: flipped ? i + 1 : LEAVES.length - i }}
                    onClick={() => onLeafClick(i)}
                  >
                    <div
                      className={clsx("book-page front", front.cover && "cover")}
                      aria-hidden={!frontShown}
                      inert={!frontShown}
                      // pages under the open ones: not copied into the window's
                      // genie animation (genie.js), which they made stutter
                      data-genie-skip={frontShown ? undefined : ""}
                    >
                      <div className={clsx("page-inner", front.id === "skills" && "dense")}>
                        <PageContent page={front} />
                      </div>
                      {!front.cover && <span className="page-number">{i * 2}</span>}
                    </div>
                    <div
                      className={clsx("book-page back", back.cover && "cover")}
                      aria-hidden={!backShown}
                      inert={!backShown}
                      data-genie-skip={backShown ? undefined : ""}
                    >
                      <div className={clsx("page-inner", back.id === "skills" && "dense")}>
                        <PageContent page={back} />
                      </div>
                      {!back.cover && <span className="page-number">{i * 2 + 1}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="book-controls">
          <button type="button" onClick={() => turnTo(turned - 1)} disabled={turned === 0}>
            ‹ Back
          </button>
          <span aria-live="polite">{where}</span>
          <button type="button" onClick={() => turnTo(turned + 1)} disabled={turned === LEAVES.length}>
            Next ›
          </button>
        </div>
      </div>
    </>
  );
};

const BookWindow = WindowWrapper(Book, "book");

export default BookWindow;
