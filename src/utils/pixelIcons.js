import useDockStore from "../store/dock";

// The "Pixel" icon style's pictures, drawn by scripts/pixel-icons.mjs into
// public/images/pixel: the dock's apps; the folder and file icons in the
// Portfolio window, the desktop and Spotlight; and the little icons in the
// Portfolio window's sidebar and the menu bar.

const PIXEL = new Set([
  "finder",
  "safari",
  "photos",
  "contact",
  "terminal",
  "arcade",
  "music",
  "pixie",
  "gourav",
  "her",
  "book",
  "settings",
  "trash",
  "folder",
  "txt",
  "pdf",
  "image",
]);

const LITTLE = new Set(["work", "company", "info", "file", "trash", "wifi", "search", "user", "mode"]);

/** A picture swapped for its pixel-art one, if it has one. */
export const pixelVersion = (path) => {
  if (path?.startsWith("/icons/")) {
    const name = path.slice("/icons/".length).replace(/\.svg$/, "");
    return LITTLE.has(name) ? `/images/pixel/little-${name}.svg` : path;
  }
  if (!path?.startsWith("/images/")) return path;
  const name = path.slice("/images/".length).replace(/\.(png|svg|jpe?g)$/, "");
  return PIXEL.has(name) ? `/images/pixel/${name}.svg` : path;
};

/** For folder, file and little icons: their pixel ones while the Pixel style is chosen. */
export const useIconSrc = () => {
  const pixel = useDockStore((state) => state.iconStyle === "pixel");
  return (path) => (pixel ? pixelVersion(path) : path);
};
