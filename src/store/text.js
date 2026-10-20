import { create } from "zustand";

// How the desktop's text looks (Settings › Appearance): "pixel", in the pixel
// font that goes with the Pixel icons, or "classic". Saved in the browser, and
// set on <html data-text="…">, which index.css reads.

const STORAGE_KEY = "text-style";

export const TEXT_STYLES = [
  { id: "pixel", label: "Pixel" },
  { id: "classic", label: "Classic" },
];

const readStored = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return TEXT_STYLES.some(({ id }) => id === stored) ? stored : "pixel";
  } catch {
    return "pixel";
  }
};

const apply = (style) => {
  document.documentElement.dataset.text = style;
};

const useTextStore = create((set) => ({
  textStyle: readStored(),

  setTextStyle: (textStyle) => {
    try {
      localStorage.setItem(STORAGE_KEY, textStyle);
    } catch {
      // storage can be blocked; the choice then lasts for this visit
    }
    apply(textStyle);
    set({ textStyle });
  },
}));

// set straight away, before the desktop is drawn
apply(useTextStore.getState().textStyle);

export default useTextStore;
