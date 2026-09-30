import { useState } from "react";
import { Search, X } from "lucide-react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useLocationStore from "../store/location";
import useWindowStore from "../store/window.js";
import { locations } from "../constants/indax";
import clsx from "clsx";

// Every file and folder in every location, with the folder path it lives in
const flatten = (items, path = []) =>
  items.flatMap((item) => [
    { item, path: path.join(" › ") },
    ...flatten(item.children ?? [], [...path, item.name]),
  ]);

const searchIndex = flatten(Object.values(locations));

// Stops the window's drag handler from swallowing clicks meant for the input
const stopDrag = (e) => e.stopPropagation();

const Finder = () => {
  const { openWindow } = useWindowStore();
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const results = term
    ? searchIndex.filter(({ item }) => item.name.toLowerCase().includes(term))
    : [];

  const closeSearch = () => {
    setIsSearching(false);
    setQuery("");
  };

  const { activeLocation, setActiveLocation } = useLocationStore();

  const openItem = (item) => {
    if (item.fileType === "pdf") return openWindow("resume");
    if (item.kind === "folder") {
      closeSearch();
      return setActiveLocation(item);
    }
    if (["fig", "url"].includes(item.fileType) && item.href)
      return window.open(item.href, "_blank");
    if (item.fileType === "txt") return openWindow("txtfile", item);
    if (item.fileType === "img") return openWindow("imgfile", item);
  };

  const renderList = (name, items) => (
    <div>
      <h3>{name}</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            onClick={() => {
              closeSearch();
              setActiveLocation(item);
            }}
            className={clsx(
              item.id === activeLocation.id ? "active" : "not-active",
            )}
          >
            <img src={item.icon} className=" w-4" alt={item.name} />
            <p className="text-sm font-medium truncate">{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="finder" />
        {isSearching ? (
          <label
            className="search"
            onMouseDown={stopDrag}
            onTouchStart={stopDrag}
            onPointerDown={stopDrag}
          >
            <Search size={14} />
            <input
              autoFocus
              type="text"
              value={query}
              placeholder="Search"
              aria-label="Search files and folders"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
            />
            <button type="button" aria-label="Close search" onClick={closeSearch}>
              <X size={14} />
            </button>
          </label>
        ) : (
          <button
            type="button"
            aria-label="Search"
            onClick={() => setIsSearching(true)}
          >
            <Search className="icon" />
          </button>
        )}
      </div>
      <div className=" bg-white flex h-full">
        <div className="sidebar">
          {renderList("Favorites", Object.values(locations))}
          {renderList("work", locations.work.children)}
        </div>
        {term ? (
          <div className="results">
            <h3>
              {results.length} {results.length === 1 ? "result" : "results"} for
              “{query.trim()}”
            </h3>
            <ul>
              {results.map(({ item, path }) => (
                <li
                  key={`${path}/${item.id}-${item.name}`}
                  onClick={() => openItem(item)}
                >
                  <img src={item.icon} alt="" />
                  <p>{item.name}</p>
                  <span>{path || "Favorites"}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="content">
            {activeLocation?.children.map((item) => (
              <li
                key={item.id}
                className={item.position}
                onClick={() => openItem(item)}
              >
                <img src={item.icon} alt={item.name} />
                <p>{item.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;
