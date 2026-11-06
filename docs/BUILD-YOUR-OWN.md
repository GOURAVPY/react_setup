# Build your own macOS portfolio

This is how this portfolio was built, in the order it was built, so you can make your own. Each step works on its own before the next one starts.

## 0. The tools

| Tool | Why |
|---|---|
| [Vite](https://vite.dev) + [React](https://react.dev) | fast dev server, components |
| [Tailwind CSS](https://tailwindcss.com) v4 | styling, with plain CSS for the tricky parts |
| [GSAP](https://gsap.com) + Draggable | every animation and window dragging |
| [Zustand](https://zustand.docs.pmnd.rs) + immer | small stores for windows, dock, music, settings |
| [lucide-react](https://lucide.dev), react-tooltip, dayjs, react-pdf | icons, tooltips, the clock, the résumé |

```bash
npm create vite@latest my-portfolio -- --template react
```

```bash
npm install gsap @gsap/react zustand immer clsx dayjs lucide-react react-tooltip react-pdf tailwindcss @tailwindcss/vite
```

**Tip:** add path aliases in `vite.config.js` (`#components`, `#constants`, `#store`…) so imports stay short.

## 1. The desktop

Start with what's always on screen:

- **Navbar** (`components/Navbar.jsx`): the menu bar, with a clock that ticks every minute.
- **Welcome** (`components/Welcome.jsx`): the big text in the middle.
- **Dock** (`components/Dock.jsx`): icons from one list, `dockApps` in `constants/indax.js`.
- A wallpaper, set in CSS.

Keep the **content in one file** (`constants/indax.js`): the dock apps, your projects, files, links and skills. Then changing what the site says never means touching components.

## 2. Windows

This is the heart of it. Three pieces:

1. **One store for every window** (`store/window.js`): each has `isOpen`, `isMinimized`, `isMaximized`, `zIndex` and `data`, plus `openWindow`, `closeWindow`, `focusWindow`, `minimizeWindow` and `maximizeWindow`. The highest `zIndex` is on top, and focusing a window gives it the next number.
2. **One wrapper for every window** (`hoc/Windowwappre.jsx`): it turns that state into behaviour. Dragging by the title bar (GSAP Draggable), bringing it to the front on a click, and the open, close, minimize and maximize animations.
3. **The apps** (`windows/*.jsx`): each is a plain component with a title bar, exported as `WindowWrapper(Component, "id")`.

Then the dock only has to call `openWindow("id")`. So do Spotlight, the menu bar and the companions.

[Add an app to the dock](ADD-A-DOCK-APP.md) walks through one app from start to finish.

## 3. The apps

Build them one at a time, simplest first:

1. **Contact** and **Text/Image** viewers: just content.
2. **Portfolio** (Finder): folders and files from `locations` in `indax.js`. Opening a file opens the Text, Image or Résumé window with the file as `data`.
3. **Terminal**: an input, a history, and a table of commands (`terminalCommands.js`).
4. **Settings**: wallpaper, theme, dock options. Each setting is a small store saved in `localStorage`.
5. **Browser**: an `<iframe>` with an address bar. Most big sites refuse to be framed, so a tiny server endpoint checks first (`server/frameCheck.js`) and shows "open in a new tab" instead of a broken window.
6. **Music**: songs written as notes and chords (`music/songs.js`), played with the Web Audio API (`music/synth.js`), so there are no audio files at all.
7. **Arcade**, **Book**, **Gallery**: whatever shows off who you are.

## 4. Make it feel like a Mac

The details are what sell it:

- **Dock magnification:** icons near the pointer grow and lift.
- **The genie effect:** windows pour into their dock icon (`hoc/genie.js`). Also scale, fade and flip, picked in Settings.
- **Spotlight** (⌘ or Ctrl + Space, or + K): searches apps, projects and files.
- **Start-up:** a power button, a loading bar that waits for the real images, then a lock screen.
- **Sounds** for clicks and windows, which can be switched off.
- **Dark mode, auto-hide dock, dock size.**

Read [Smooth animation](ANIMATION.md) before you build the effects. It will save you the bugs we hit.

## 5. Phones

A desktop doesn't fit on a phone, so below a set width the site becomes an iPhone-style home screen (`MobileHome.jsx`) using the same `dockApps` list, and every window opens full screen. `utils/device.js` decides which you are on.

## 6. Give it a personality (optional)

This is what makes the portfolio memorable: companions who live on the desktop. See [The companions](COMPANIONS.md) for how they're drawn (pixel grids in code), moved and made to talk. Pixie can also chat with visitors through a small Node server that keeps the AI key off the browser (`server/brain.js`).

## 7. Put it online

- **The site** is static: `npm run build` makes `dist/`, which any static host can serve (Render Static Site, Netlify, Vercel, GitHub Pages).
- **The server** (only for Pixie's AI and the cloud browser) is one Node service: `node server/index.js`. Put the API keys in the host's environment variables, never in the code.

[server/README.md](../server/README.md) has the exact Render settings.

## How the work was done

- **One feature at a time, on its own branch.** Small commits, merged into `main` when it works.
- **Check it in the browser every time.** Open it, drag it, minimize it, try a phone width, and look at it, not just at the code.
- **Draw before you wire.** For pixel art, render the grid to an image and check it before putting it in the app.
- **Keep secrets out of Git.** Keys live in `.env.local`, which Git ignores.
