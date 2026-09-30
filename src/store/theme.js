import { create } from "zustand";

const STORAGE_KEY = "theme";
export const THEMES = ["light", "dark", "system"];

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const useThemeStore = create((set) => ({
  theme: readStoredTheme(),

  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage can be blocked; the choice then only lasts for this visit
    }
    set({ theme });
  },
}));

export default useThemeStore;
