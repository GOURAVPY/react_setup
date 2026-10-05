import { create } from "zustand";

// Spotlight search: opened from the menu bar's magnifier or with
// ⌘/Ctrl + Space (or K), see components/Spotlight.jsx
const useSpotlightStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useSpotlightStore;
