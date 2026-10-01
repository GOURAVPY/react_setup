import { create } from "zustand";

const STORAGE_KEY = "wallpaper";
const CUSTOM_STORAGE_KEY = "wallpaper-custom";
const CUSTOM_MAX_SIZE = 1920; // longest side, so the photo fits in storage

// `background` is any CSS background-image value
export const WALLPAPERS = [
  {
    id: "blue-wave",
    name: "Blue Wave",
    background: 'url("/images/wallpaper.png")',
  },
  {
    id: "sunset",
    name: "Sunset",
    background:
      "radial-gradient(120% 90% at 15% 100%, #ff8a3d 0%, transparent 55%), radial-gradient(90% 80% at 90% 10%, #7c3aed 0%, transparent 60%), linear-gradient(160deg, #1e1b4b, #9d174d)",
  },
  {
    id: "aurora",
    name: "Aurora",
    background:
      "radial-gradient(100% 80% at 80% 100%, #22d3ee 0%, transparent 55%), radial-gradient(90% 90% at 10% 20%, #10b981 0%, transparent 60%), linear-gradient(200deg, #0f172a, #134e4a)",
  },
  {
    id: "orchid",
    name: "Orchid",
    background:
      "radial-gradient(110% 90% at 0% 0%, #f472b6 0%, transparent 55%), radial-gradient(100% 90% at 100% 100%, #6366f1 0%, transparent 60%), linear-gradient(135deg, #4c1d95, #831843)",
  },
  {
    id: "ocean",
    name: "Ocean",
    background:
      "radial-gradient(120% 80% at 50% 110%, #38bdf8 0%, transparent 60%), radial-gradient(80% 70% at 85% 0%, #1d4ed8 0%, transparent 60%), linear-gradient(180deg, #020617, #1e3a8a)",
  },
  {
    id: "graphite",
    name: "Graphite",
    background:
      "radial-gradient(100% 80% at 20% 0%, #6b7280 0%, transparent 60%), linear-gradient(160deg, #111827, #374151)",
  },
];

export const CUSTOM_ID = "custom";

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false; // storage blocked or full: the choice lasts for this visit
  }
};

const backgroundFor = (id, customImage) => {
  if (id === CUSTOM_ID && customImage) return `url("${customImage}")`;
  return (WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0]).background;
};

const apply = (id, customImage) => {
  document.documentElement.style.setProperty(
    "--wallpaper",
    backgroundFor(id, customImage),
  );
};

// Shrinks a photo and returns it as a JPEG data URL
const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(
        1,
        CUSTOM_MAX_SIZE / Math.max(image.width, image.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    image.src = url;
  });

const storedCustomImage = read(CUSTOM_STORAGE_KEY);
const storedId = read(STORAGE_KEY);
const initialId =
  storedId === CUSTOM_ID
    ? storedCustomImage
      ? CUSTOM_ID
      : WALLPAPERS[0].id
    : (WALLPAPERS.find((w) => w.id === storedId)?.id ?? WALLPAPERS[0].id);

apply(initialId, storedCustomImage);

const useWallpaperStore = create((set, get) => ({
  wallpaper: initialId,
  customImage: storedCustomImage,

  setWallpaper: (id) => {
    write(STORAGE_KEY, id);
    apply(id, get().customImage);
    set({ wallpaper: id });
  },

  // Returns false when the photo is shown but could not be saved for next time
  setCustomImage: async (file) => {
    const customImage = await toDataUrl(file);
    const saved =
      write(CUSTOM_STORAGE_KEY, customImage) && write(STORAGE_KEY, CUSTOM_ID);

    apply(CUSTOM_ID, customImage);
    set({ wallpaper: CUSTOM_ID, customImage });
    return saved;
  },
}));

export default useWallpaperStore;
