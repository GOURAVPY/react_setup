import { create } from "zustand";

// Settings for Pixie, the little guide who walks around the desktop
// (Settings › Pixie). Saved in the visitor's browser.

const STORAGE_KEY = "pixie";

export const PIXIE_DEFAULTS = {
  show: true,
  chatty: true, // shares a tip on her own now and then
};

const readStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([key, value]) =>
          key in PIXIE_DEFAULTS && typeof value === typeof PIXIE_DEFAULTS[key],
      ),
    );
  } catch {
    return {};
  }
};

const usePixieStore = create((set, get) => ({
  ...PIXIE_DEFAULTS,
  ...readStored(),

  setPixie: (key, value) => {
    set({ [key]: value });
    const { show, chatty } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ show, chatty }));
    } catch {
      // storage can be blocked; the settings then last for this visit
    }
  },
}));

// Anything can ask Pixie to come over and say hello (the terminal's
// `pixie` command, the Settings button)
export const callPixie = () => {
  usePixieStore.getState().setPixie("show", true);
  // a moment for her to appear if she was hidden
  setTimeout(() => window.dispatchEvent(new Event("pixie:call")), 50);
};

export default usePixieStore;
