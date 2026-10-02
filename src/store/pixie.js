import { create } from "zustand";

// Settings for Pixie, the little guide who walks around the desktop
// (Settings › Pixie). Saved in the visitor's browser.

const STORAGE_KEY = "pixie";

export const PIXIE_DEFAULTS = {
  show: true,
  chatty: true, // shares a tip on her own now and then
  mind: true, // her AI mind decides what she does next
  things: true, // her bed, plant and ball on the desktop
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

  // what her mind last decided, and a diary of her plans (not saved); shown
  // in her app in the dock
  mood: null,
  thought: "",
  diary: [], // [{ id, at, mood, thought, steps }], newest first
  vitals: null, // { doing, energy, boredom }, kept up to date while she's out

  setPixie: (key, value) => {
    set({ [key]: value });
    const { show, chatty, mind, things } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ show, chatty, mind, things }));
    } catch {
      // storage can be blocked; the settings then last for this visit
    }
  },
}));

// Anything can ask Pixie to come over and say hello (the terminal's
// `pixie` command, the button in her app)
export const callPixie = () => {
  usePixieStore.getState().setPixie("show", true);
  // a moment for her to appear if she was hidden
  setTimeout(() => window.dispatchEvent(new Event("pixie:call")), 50);
};

// …or come over and open her chat box
export const chatWithPixie = () => {
  usePixieStore.getState().setPixie("show", true);
  setTimeout(() => window.dispatchEvent(new Event("pixie:chat")), 50);
};

const DIARY_PAGES = 30;
let page = 0;

export const writeDiary = (entry) =>
  usePixieStore.setState((state) => ({
    mood: entry.mood,
    thought: entry.thought,
    diary: [{ id: ++page, at: Date.now(), ...entry }, ...state.diary].slice(0, DIARY_PAGES),
  }));

export default usePixieStore;
