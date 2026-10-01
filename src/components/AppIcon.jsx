import {
  Compass,
  FileText,
  FolderOpen,
  Gamepad2,
  Images,
  Settings,
  SquareTerminal,
  Trash2,
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import useDockStore from "../store/dock";

// The symbol and colours each app gets in the drawn icon styles: a gradient
// (from → to) and, where it differs, the colour its symbol glows in the Neon
// style. The "macos" style uses the app's own picture from public/images.
const GLYPHS = {
  finder: { Glyph: FolderOpen, from: "#38bdf8", to: "#2563eb" },
  safari: { Glyph: Compass, from: "#22d3ee", to: "#0284c7" },
  photos: { Glyph: Images, from: "#fb923c", to: "#db2777" },
  contact: { Glyph: UserRound, from: "#fbbf24", to: "#b45309" },
  arcade: { Glyph: Gamepad2, from: "#a855f7", to: "#4c1d95", glow: "#facc15" },
  terminal: { Glyph: SquareTerminal, from: "#4b5563", to: "#111827", glow: "#4ade80" },
  settings: { Glyph: Settings, from: "#9ca3af", to: "#4b5563", glow: "#e5e7eb" },
  trash: { Glyph: Trash2, from: "#cbd5e1", to: "#64748b" },
  resume: { Glyph: FileText, from: "#f87171", to: "#dc2626" },
};

/**
 * An app's icon in the chosen icon style.
 * @param id     app id, e.g. "finder"
 * @param image  the app's picture, used by the macOS style
 * @param style  overrides the chosen style (for the previews in Settings)
 */
const AppIcon = ({ id, image, style, className }) => {
  const chosen = useDockStore((state) => state.iconStyle);
  const iconStyle = style ?? chosen;
  const glyph = GLYPHS[id];

  if (iconStyle === "macos" || !glyph) {
    return (
      <img
        src={`/images/${image}`}
        alt=""
        loading="lazy"
        className={clsx("app-icon", className)}
      />
    );
  }

  const { Glyph, from, to, glow = from } = glyph;
  return (
    <span
      className={clsx("app-icon", "app-tile", iconStyle, className)}
      style={{ "--from": from, "--to": to, "--glow": glow }}
      aria-hidden="true"
    >
      <Glyph strokeWidth={iconStyle === "minimal" ? 1.75 : 2} />
    </span>
  );
};

export default AppIcon;
