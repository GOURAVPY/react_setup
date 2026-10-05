import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import useSpotlightStore from "../store/spotlight";
import useWindowStore from "../store/window";
import useLocationStore from "../store/location";
import useLaunchApp from "../store/launch";
import AppIcon from "./AppIcon";
import { searchSpotlight } from "./spotlightSearch";

// macOS-style Spotlight: a search box over the desktop that finds the apps,
// projects, skills, documents and links (spotlightSearch.js) and opens them.
// Opened from the menu bar's magnifier, or ⌘/Ctrl + Space or K anywhere.

const ResultIcon = ({ icon }) => {
  if (icon.app) return <AppIcon id={icon.app} image={icon.image} />;
  if (icon.glyph) {
    const Glyph = icon.glyph;
    return (
      <span className="glyph">
        <Glyph size={17} />
      </span>
    );
  }
  return (
    <span className="picture" style={icon.bg ? { background: icon.bg } : undefined}>
      <img src={icon.src} alt="" />
    </span>
  );
};

const Panel = ({ onClose }) => {
  const [query, setQuery] = useState("");
  // the highlighted row, for the query it was picked in (a new query starts
  // again at the top hit)
  const [picked, setPicked] = useState({ query: "", index: 0 });
  const list = useRef(null);

  const launch = useLaunchApp();
  const openWindow = useWindowStore((state) => state.openWindow);
  const setActiveLocation = useLocationStore((state) => state.setActiveLocation);

  const sections = searchSpotlight(query);
  const results = sections.flatMap(({ items }) => items);
  // where each section's rows start in `results`
  const starts = sections.map((_, at) =>
    sections.slice(0, at).reduce((count, { items }) => count + items.length, 0),
  );
  const selected = picked.query === query ? Math.min(picked.index, results.length - 1) : 0;

  // keep the highlighted row in view
  useEffect(() => {
    list.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selected, query]);

  const run = ({ action }) => {
    onClose();
    switch (action.type) {
      case "app":
        return launch(action.id);
      case "folder":
        setActiveLocation(action.location);
        return openWindow("finder");
      case "window":
        return openWindow(action.id, action.data);
      case "link":
        return window.open(action.href, "_blank", "noopener,noreferrer");
      case "search":
        return openWindow("safari", { search: action.query });
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      const by = e.key === "ArrowDown" ? 1 : -1;
      setPicked({ query, index: (selected + by + results.length) % results.length });
    } else if (e.key === "Enter" && results[selected]) {
      e.preventDefault();
      run(results[selected]);
    }
  };

  return (
    <div
      id="spotlight"
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="panel" role="dialog" aria-label="Spotlight Search" onKeyDown={onKeyDown}>
        <label className="query">
          <Search size={22} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search"
            aria-label="Search apps, projects and skills"
            role="combobox"
            aria-expanded="true"
            aria-controls="spotlight-results"
            aria-activedescendant={results.length ? `spotlight-${selected}` : undefined}
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </label>

        <div ref={list} id="spotlight-results" className="results" role="listbox">
          {sections.map(({ title, items }, at) => (
            <section key={title} role="group" aria-label={title}>
              <h3>{title}</h3>
              <ul>
                {items.map((item, n) => {
                  const index = starts[at] + n;
                  return (
                    <li
                      key={item.id}
                      id={`spotlight-${index}`}
                      role="option"
                      aria-selected={index === selected}
                      onMouseMove={() => index !== selected && setPicked({ query, index })}
                      onClick={() => run(item)}
                    >
                      <span className="thumb">
                        <ResultIcon icon={item.icon} />
                      </span>
                      <span className="text">
                        <span className="title">{item.title}</span>
                        {item.subtitle && <span className="sub">{item.subtitle}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <footer aria-hidden="true">
          <span><kbd>↑</kbd> <kbd>↓</kbd> move</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </footer>
      </div>
    </div>
  );
};

const Spotlight = () => {
  const isOpen = useSpotlightStore((state) => state.isOpen);
  const close = useSpotlightStore((state) => state.close);

  // ⌘/Ctrl + Space, or + K (a Mac's own Spotlight takes ⌘ Space first)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      if (e.code !== "Space" && e.key.toLowerCase() !== "k") return;
      // not over the startup and login screens
      if (document.getElementById("boot") || document.getElementById("login")) return;
      e.preventDefault();
      useSpotlightStore.getState().toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // a fresh panel each time, so it opens empty
  return isOpen ? <Panel onClose={close} /> : null;
};

export default Spotlight;
