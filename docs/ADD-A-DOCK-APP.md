# Add an app to the dock

Every app in the dock (Portfolio, Browser, Music, Terminal…) is wired the same way. This is how the **Music** app was added, so you can do the same for your own.

A new app touches five places:

| # | File | What you add |
|---|---|---|
| 1 | `src/constants/indax.js`, `WINDOW_CONFIG` | the window's state |
| 2 | `src/windows/YourApp.jsx` | the window itself, wrapped in `WindowWrapper` |
| 3 | `src/windows/index.js` and `src/App.jsx` | export it and mount it once |
| 4 | `src/constants/indax.js`, `dockApps` | its icon in the dock |
| 5 | `public/images/` (and `scripts/pixel-icons.mjs`) | the icon picture |

## 1. Give it a window state

In `WINDOW_CONFIG`, add an entry. The key is the app's id, and you'll use the same id everywhere:

```js
music: {
  isOpen: false,
  isMaximized: false,
  isMinimized: false,
  zIndex: INITIAL_Z_INDEX,
  data: null,
},
```

`store/window.js` reads this list, so `openWindow("music")`, `closeWindow`, `minimizeWindow`, `maximizeWindow` and `focusWindow` now work for it. `data` is for anything you pass when opening it, like the file a Text window shows.

## 2. Write the window

A window is an ordinary component with a title bar, wrapped in `WindowWrapper`:

```jsx
import Windowcontrols from "../components/Windowcontrols";
import WindowWrapper from "../hoc/Windowwappre";

const Music = () => (
  <>
    <div id="window-header">
      <Windowcontrols target="music" />
      <h2>Music</h2>
    </div>
    <div className="p-5">…your app…</div>
  </>
);

const MusicWindow = WindowWrapper(Music, "music");

export default MusicWindow;
```

What you get for free from `WindowWrapper` (`src/hoc/Windowwappre.jsx`):

- dragging by the title bar (`#window-header`), so buttons, sliders and text inside still work;
- clicking anywhere brings it to the front;
- opening out of its dock icon and minimizing back into it, with the effect chosen in Settings (genie, scale, fade or flip);
- maximize, and full screen on phones.

`Windowcontrols` draws the red, yellow and green buttons. Its `target` must be the app's id.

Give the window its size and look in `src/index.css` under its id (`#music { … }`), like the other windows.

## 3. Mount it once

Export it from `src/windows/index.js`, then add `<Music />` to `src/App.jsx` next to the other windows. Windows are always mounted and simply hidden while closed, so opening one is instant and it comes back as you left it.

## 4. Put it in the dock

Add it to `dockApps`, in the order you want it in the dock:

```js
{
  id: "music",
  name: "Music",
  icon: "music.png",
  canOpen: true,
},
```

That one list feeds the dock (`Dock.jsx`), the phone home screen (`MobileHome.jsx`) and Spotlight (`spotlightSearch.js`), so the app shows up in all three. In `spotlightSearch.js`, also add a few words people might type to find it (Music has "songs player play audio…").

Clicking the icon goes through `store/launch.js`: it opens the app, restores it if it's minimized, or brings it to the front if it's already open.

## 5. Draw the icon

Put `music.png` in `public/images/`. The site also has a **Pixel** icon style (the default, switchable in Settings). For that one, add a drawing for your app to `scripts/pixel-icons.mjs` and run:

```bash
node scripts/pixel-icons.mjs
```

It writes `public/images/pixel/music.svg`. If your icon is on the dock at start-up, add it to `ASSETS` in `src/boot.js` too, so the loading bar waits for it and it doesn't pop in late.

## Optional extras

- **A menu-bar control.** The Music app has one (`components/NowPlaying.jsx`), driven by its own store (`store/music.js`), so the music keeps playing when the window closes. Keep long-running state like this in a store, not in the window.
- **A word from the companions.** Add a line for your app's id to `APP_LINES` in `components/pixie/castLines.js` (and `APP_COMMENTS` in `lines.js` for Pixie). They'll say it and walk over when the window opens.
- **Open it from anywhere.** Call `useWindowStore.getState().openWindow("music")`. The Book opens this way when you click Gourav's bookshelf.

## Checklist

- [ ] Same id in `WINDOW_CONFIG`, `WindowWrapper(…, id)`, `Windowcontrols target` and `dockApps`
- [ ] Mounted once in `App.jsx`
- [ ] Icon in `public/images/` (and the pixel one, if you use that style)
- [ ] `npm run lint` passes
- [ ] Open it, drag it, minimize it into the dock, restore it, maximize it, and try it at phone width
