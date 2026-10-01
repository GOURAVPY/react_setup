import { create } from "zustand";

const STORAGE_KEY = "dock";

// How the app icons are drawn, in the dock and on the phone home screen
// (see src/components/AppIcon.jsx)
export const ICON_STYLES = [
  { id: "macos", label: "macOS" },
  { id: "flat", label: "Flat" },
  { id: "glass", label: "Glass" },
  { id: "neon", label: "Neon" },
  { id: "minimal", label: "Minimal" },
];

export const DOCK_DEFAULTS = {
  minimizeEffect: "genie", // "genie" | "scale"
  autohide: false,
  indicators: true, // dot under apps that are open
  iconStyle: "macos",
};

const isValid = (key, value) =>
  key in DOCK_DEFAULTS &&
  typeof value === typeof DOCK_DEFAULTS[key] &&
  (key !== "iconStyle" || ICON_STYLES.some(({ id }) => id === value));

const readStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    // only keep known settings, so an old or edited value cannot break the dock
    return Object.fromEntries(
      Object.entries(stored).filter(([key, value]) => isValid(key, value)),
    );
  } catch {
    return {};
  }
};

const save = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage can be blocked; the settings then last for this visit
  }
};

const pick = (state) =>
  Object.fromEntries(Object.keys(DOCK_DEFAULTS).map((key) => [key, state[key]]));

const useDockStore = create((set, get) => ({
  ...DOCK_DEFAULTS,
  ...readStored(),

  setDock: (key, value) => {
    set({ [key]: value });
    save(pick(get()));
  },

  resetDock: () => {
    set(DOCK_DEFAULTS);
    save(DOCK_DEFAULTS);
  },
}));

export default useDockStore;
