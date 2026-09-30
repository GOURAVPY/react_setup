import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "../constants/indax";

const useWindowStore = create(
  immer((set) => ({
    windows: WINDOW_CONFIG,
    nextZindex: INITIAL_Z_INDEX + 1,

    openWindow: (windowKey, data = null) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.isOpen = true;
        win.zIndex = state.nextZindex;
        win.data = data ?? win.data;
        win.isMinimized = false;
        state.nextZindex++;
      }),

    closeWindow: (windowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        // zIndex and data are kept so the window can animate out as it was
        win.isOpen = false;
        win.isMaximized = false;
        win.isMinimized = false;
      }),

    focusWindow: (windowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.zIndex = state.nextZindex++;
      }),

    maximizeWindow: (windowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win || !win.isOpen) return;

        win.isMaximized = !win.isMaximized;
        win.isMinimized = false;
        win.zIndex = state.nextZindex++;
      }),

    minimizeWindow: (windowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win || !win.isOpen) return;

        win.isMinimized = true;
        win.isMaximized = false;
        // keep it open but visually minimized
      }),
  })),
);

export default useWindowStore;
