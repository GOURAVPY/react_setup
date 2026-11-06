# Smooth animation: what we learned

A desktop in a browser has a lot moving at once: windows pouring into the dock, a magnifying dock, companions walking about, a music visualizer. Here are the moves that keep it smooth, most of them learned by getting it wrong first.

## The rules

### 1. Move things with `transform` and `opacity` only

Changing `left`, `top`, `width` or `height` makes the browser lay out the page again on every frame. Changing `transform` and `opacity` doesn't: the GPU just moves a picture it already has.

- Windows move with GSAP's `x`, `y` and `scale`, which are transforms.
- The companions and their things are placed with `transform: translate(…)`, never `left`/`top`.
- Things that move all the time get `will-change: transform`, so the browser keeps them on their own layer.

### 2. Don't measure while you animate

Reading a size or position (`getBoundingClientRect`, `offsetWidth`) right after changing styles forces the browser to lay out the page before it can answer. Do that on every mouse move and the animation stutters.

**The dock** (`components/Dock.jsx`) measures where its icons are once, when the pointer arrives, and only does maths after that. Each icon also has one reusable `gsap.quickTo` tween that gets retargeted, instead of a new tween piling up on every mouse move.

### 3. Only write to the page when something changed

The companions run every frame, but most frames nothing changes. So each one remembers what it last drew:

```js
const key = `${pose}${blinking ? "-" : ""}${facing}`;
if (key !== drawn) {
  drawn = key;
  draw(pose, blinking);
}
```

The same goes for its position: the `translate(…)` string is only written when it differs from the last one. A sprite standing still costs almost nothing.

### 4. One loop for drawing, a slower one for thinking

Each companion has a `requestAnimationFrame` loop that only moves and draws, plus a `setInterval` every 300 ms that makes decisions (go to work, have a thought, start a visit). Decisions don't need 60 fps, and keeping them out of the drawing loop keeps frames short.

### 5. Read state when you need it, don't subscribe to all of it

With Zustand, a component that reads the whole store re-renders whenever anything in it changes.

- Each window subscribes only to its own entry: `useWindowStore((s) => s.windows[windowKey])`. Opening one window doesn't re-render the others.
- The dock calls `useWindowStore.getState()` when you click an icon (`store/launch.js`) instead of subscribing, so it doesn't re-render whenever any window changes.

### 6. Mount once, hide and show

Every window is mounted at start-up and hidden with `display: none` while closed. Opening one doesn't build anything, so the animation starts on the click instead of after a render. It also comes back as you left it.

### 7. Build an animation once, play it both ways

The minimize effects (`hoc/windowEffects.js`) are paused GSAP timelines that take a window from where it is to its dock icon. Minimizing plays the timeline forwards. Opening and restoring jump to its end and play it **backwards**, so a window always comes back the way it left, and there's only one animation to get right.

### 8. Load pictures before they're needed

`boot.js` holds the start-up loading bar until the desktop's images have loaded (at least 2.2 s, at most 8 s). Then it quietly fetches and decodes the pictures inside the windows. Otherwise the first time you open a window, its images pop in halfway through the genie.

### 9. Respect "reduce motion"

People who set *reduce motion* on their computer get still companions and calmer effects. Look for `prefers-reduced-motion` in `index.css` and the `still` flag in the companions.

## The genie effect

macOS bends a window into the dock like liquid. A browser can't bend an element, so `hoc/genie.js` fakes it:

1. The window is copied into **strips** (rows when the dock is at the bottom).
2. Each strip gets a `matrix3d` transform that turns it into a trapezoid. Neighbouring strips share their edges, so together they form one smooth funnel.
3. Every frame only changes those transforms, so nothing is repainted.
4. Strips are built as they come into view, so the work is spread over the first frames instead of freezing on the click.
5. Canvases come out blank when copied, so each copy is redrawn from its original (matched by number, `data-genie-canvas`).

There's a cap of 32 strips, about 22 px each: fewer is faster, more is smoother.

## Mistakes we made (so you don't have to)

**The Book stuttered when it opened.** It has 12 pages stacked under the open ones. The genie copied all of them into every one of about 25 strips, around 300 hidden pages a frame. The worst frames took 217–400 ms. *Fix:* anything that can't be seen gets `data-genie-skip`, and the genie leaves it out of the copies. Worst frames dropped to about 50–100 ms.

**The Book appeared late.** It sized its pages with a `ResizeObserver`, which measures 0 while the window is still hidden, so the pages waited for the first real measurement. *Fix:* ignore zero sizes and start from a guess (`guessScale`), so it shows straight away.

**A window couldn't find the dock.** With auto-hide on, the dock was off screen, so there was nothing to pour into. *Fix:* the dock "peeks" for a moment, shown instantly with its slide turned off, so it can be measured.

**Styles leaked between apps.** The Book's `.page` class squashed the Browser's `.page`, and a `.pixie` card class matched Pixie herself. *Fix:* give each app its own names (`book-page`, `who-pixie`, `cast-portrait`).

**Dancing ran on timers, not the music.** Moves drifted off the beat. *Fix:* the synth schedules notes 150 ms ahead on the Web Audio clock (`music/synth.js`), and dancers read the song's real position (`synth.position()`) to know which beat they're on. They also stop the moment the music stops.

## Testing animations

- **Watch it, don't just measure it.** Numbers can say "done" while a glitch only shows on screen.
- **Background tabs pause animation.** A hidden tab doesn't run `requestAnimationFrame` at all, and it slows timers down. Test with the tab visible.
- **Restart the dev server after big changes.** Hot reload can leave two copies of a module (a store, say) running side by side, and they won't see each other's changes. A full reload, or a restart, fixes it.
- **Profile in Chrome DevTools.** The Performance tab shows long frames. Anything over 16 ms is a dropped frame at 60 fps.
