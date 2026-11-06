# Gourav's macOS portfolio

My portfolio, built as a little macOS desktop in the browser. You land on a power button, log in, and get a desktop with a dock, windows you can drag, minimize and maximize, a menu bar, Spotlight search, and pixel-art companions who live on the screen.

It's built with React, Vite, Tailwind, GSAP and Zustand. No UI kit and no game engine: every window, animation, sprite and song is code in this repo.

## What's inside

| In the dock | What it does |
|---|---|
| **Portfolio** (Finder) | My projects in folders, with text, image and PDF files you can open |
| **Browser** | A real browser window: an address bar, search, and sites shown in a frame. Sites that refuse to be framed open in a cloud Chrome (Hyperbeam) or a new tab |
| **Gallery** | Photos |
| **Contact** | Ways to reach me |
| **Terminal** | A working terminal with its own commands |
| **Arcade** | Pac-Man |
| **Music** | Five chiptune songs, played by the site itself (Web Audio), with a visualizer |
| **Pixie** | The app of the visitor's companion: what they're doing, their thoughts, their day |
| **Book** | A flip-book about me |
| **Settings** | Wallpaper, theme, dock size, auto-hide, minimize effect, icon and text style |

On the desktop:

- **Companions.** On their first visit, visitors pick a guide: **Pixie** (a pixel creature with an AI brain), **Gourav** (me, coding at my desk) or **someone special** (painting at her easel, with her parakeet Neel). Only the one you pick appears. They walk about, think in thought bubbles, react to the apps you open, dance to the Music app, and can be dragged around. Gourav and she visit each other: he sits with her on her park bench, and she brings him lunch at his desk.
- **Window effects.** Windows pour into the dock like macOS's genie effect, or scale, fade or flip (your choice in Settings).
- **Phones.** On a phone it becomes an iPhone-style home screen, and every app opens full screen.

## Run it

You need [Node.js](https://nodejs.org) 20.19 or newer (for Vite 7).

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

Optional keys, in a file called `.env.local` (Git ignores it):

```
GEMINI_API_KEY=...     # Pixie's AI chat and her own decisions
HYPERBEAM_API_KEY=...  # the cloud browser, for sites that can't be framed
```

Without them everything still works: Pixie wanders about on her own, and the Browser offers "Open in a new tab" instead. See [server/README.md](server/README.md) for the server and for deploying on Render.

Other commands: `npm run build` (the site, into `dist/`), `npm run lint`, and `node scripts/pixel-icons.mjs` (redraws the pixel icons).

## How it fits together

```
src/
  App.jsx            every window and desktop piece, mounted once
  main.jsx, boot.js  start-up: the power button, loading bar, text style
  constants/         the content: dock apps, projects, files, socials (indax.js)
  store/             Zustand stores: windows, dock, music, companions, theme…
  hoc/               WindowWrapper (drag, focus, open/close/minimize) and the effects
  windows/           one file per app (Finder.jsx, Music.jsx, Terminal.jsx…)
  components/        the desktop: Dock, Navbar, Spotlight, Welcome, phone home screen
  components/pixie/  the companions: sprites, the engines that move them, their lines
  music/             the synth and the songs
server/              the small Node server: Pixie's brain, frame checks, cloud browser
scripts/             pixel-icons.mjs
```

The short version: **every window lives in one store.** `store/window.js` holds each window's `isOpen`, `isMinimized`, `isMaximized` and `zIndex`. The dock, Spotlight, the menu bar and the companions only call `openWindow(id)`, and `WindowWrapper` turns that state into animation.

## More docs

- [Build your own](docs/BUILD-YOUR-OWN.md): how this was built, step by step, so you can build the same thing.
- [Add an app to the dock](docs/ADD-A-DOCK-APP.md): the five places a new app touches.
- [Smooth animation](docs/ANIMATION.md): the tricks that keep it at 60 fps, and the mistakes we made first.
- [The companions](docs/COMPANIONS.md): how the pixel characters are drawn, moved and made to talk.

## Credits

It started from JavaScript Mastery's macOS portfolio tutorial and grew from there. Built with help from Claude.
