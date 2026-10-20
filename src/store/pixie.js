import { create } from "zustand";

// Settings for the visitor's companion: Pixie, the little guide who walks
// around the desktop, or Gourav, or someone special (Settings › Pixie).
// Saved in the visitor's browser.

const STORAGE_KEY = "pixie";

export const PIXIE_DEFAULTS = {
  show: true, // their companion on the desktop
  chatty: true, // shares a tip on their own now and then
  mind: true, // Pixie's AI mind decides what she does next
  things: true, // their things on the desktop: Pixie's bed, ball and plant, Gourav's desk, her easel
  companion: "", // who the visitor picked to show them around ("" until they pick)
};

const COMPANIONS = ["", "pixie", "gourav", "her"];

const readStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([key, value]) =>
          key in PIXIE_DEFAULTS &&
          typeof value === typeof PIXIE_DEFAULTS[key] &&
          (key !== "companion" || COMPANIONS.includes(value)),
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
  pickedAt: 0, // when the visitor last picked a companion (not saved)
  // Gourav or someone special, for their app (Companions.jsx keeps it up to
  // date): { who, doing, thought, thoughts, coffee, lines, mugs, painting,
  // picture, paintings }
  castVitals: null,

  setPixie: (key, value) => {
    set({ [key]: value });
    const { show, chatty, mind, things, companion } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ show, chatty, mind, things, companion }));
    } catch {
      // storage can be blocked; the settings then last for this visit
    }
  },
}));

// the visitor picks their companion (CompanionPicker.jsx), or "" to pick
// again. Only the one they pick is on the desktop.
export const pickCompanion = (who) => {
  usePixieStore.setState({ pickedAt: Date.now() });
  usePixieStore.getState().setPixie("companion", who);
};

// was a companion picked just now (rather than on an earlier visit)?
export const justPicked = () => Date.now() - usePixieStore.getState().pickedAt < 5000;

// Pixie's buttons bring her back as the companion if someone else was
// picked; true when she has to come back first (she says hello herself)
const bringPixie = () => {
  const { companion, setPixie } = usePixieStore.getState();
  setPixie("show", true);
  if (companion === "pixie") return false;
  pickCompanion("pixie");
  return true;
};

// Anything can ask Pixie to come over and say hello (the terminal's
// `pixie` command, the button in her app)
export const callPixie = () => {
  if (bringPixie()) return;
  // a moment for her to appear if she was hidden
  setTimeout(() => window.dispatchEvent(new Event("pixie:call")), 50);
};

// …or come over and open her chat box
export const chatWithPixie = () => {
  const back = bringPixie();
  setTimeout(() => window.dispatchEvent(new Event("pixie:chat")), back ? 600 : 50);
};

// …or tell her story again: how she came through the portal
export const watchPixieStory = () => {
  const back = bringPixie();
  setTimeout(() => window.dispatchEvent(new Event("pixie:story")), back ? 600 : 50);
};

// the visitor's companion comes over: Pixie, or Gourav or someone special
// (Companions.jsx)
export const callCompanion = () => {
  const { companion, setPixie } = usePixieStore.getState();
  if (!companion || companion === "pixie") return callPixie();
  setPixie("show", true);
  setTimeout(() => window.dispatchEvent(new Event("cast:call")), 50);
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
