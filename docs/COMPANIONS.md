# The companions

On their first visit, visitors choose a guide (`components/pixie/CompanionPicker.jsx`). Only the one they pick is on the desktop:

| | Who | Their things |
|---|---|---|
| **Pixie** | a pixel creature with an AI brain (Gemini) | bed, ball, plant, lamp, and Chompy |
| **Gourav** | the developer, coding at his desk | desk and chair, coffee machine, bookshelf, Robo the cleaning robot |
| **Someone special** | painting at her easel | easel, Neel her blue parakeet, a park bench under a blossom tree |

## Drawing pixel art in code

There are no image files for the characters. Each one is a **grid of letters**, one letter a pixel, with a palette saying what colour each letter is:

```js
const HEAD = [5, 0, [
  "....KKKKKK....",
  "..KKHHHHHHKK..",
  "KSSEESSSSEESSK",   // K outline, H hair, S skin, E eyes
]];
```

A character is built from parts (head, body, legs, arms), and every pose is just a different set of parts:

```js
const POSES = {
  stand: { legs: "stand", left: "down", right: "down" },
  read:  { legs: "stand", left: "read", right: "read" },   // holding a book
  sit:   { legs: "sit",   left: "down", right: "down", sit: true },
};
```

`build()` paints the parts into a 24 × 30 grid for each pose, plus a talking version (mouth open). It also makes a blinking version by turning the eye pixels into skin and a line (`shut()` in `cast.js`). Arms are mirrored for the other side, so you only draw one.

Each grid is drawn onto a `<canvas>` at 4× (`SCALE`), with `image-rendering: pixelated` so the pixels stay sharp.

The same grids make the dock icons (`scripts/pixel-icons.mjs`) and the portrait in their app (`windows/CastPanes.jsx`), so a change shows up everywhere.

**Tip:** to check new art without opening the site, render a grid to a PNG with a small Node script and look at it. That's how the hug and the bench were drawn.

## Moving them

`cast.js` (`createPerson`) runs one person:

- **Walking** to a target x, with steps, blinking now and then, and strolls when they're bored.
- **Jobs:** `work({ at, pose, seconds, onStart, onEnd })` walks somewhere and holds a pose there, such as typing at the desk, painting, reading at the shelf or sitting on the bench. `onEnd(done)` says whether it finished or was interrupted.
- **Dragging:** `pickUp`, `carry`, `drop`, with gravity.
- **Dancing:** a routine per style, a beat at a time (`DANCES`). It reads the song's real position, so moves land on the beat.
- **Visiting:** `enter()` walks in from the edge, and `leave(onGone)` walks off it.

Pixie has her own, bigger engine (`engine.js`), because she does more: sleeping, her slingshot, her ball, and plans from her AI "mind".

## Sitting at a desk or on a bench

When Gourav sits at his desk, his own sprite is hidden and the desk draws him from behind, inside its own canvas. The bench does the same for anyone sitting on it, so two people hugging is one picture: no layering problems between two canvases.

## Talking

Lines live in `castLines.js` (Pixie's in `lines.js`): hellos, tips, thoughts, and words for each app and each of their things. Edit them freely.

`createScript` plays lines one after another, in the right person's bubble. A line can have:

- `who`: whose bubble (for conversations between the two of them);
- `pose`: strike a pose while saying it;
- `kind: "thought"`: a thought bubble, mouth shut;
- `picture`: a little pixel picture inside a thought (`thoughtArt.js`).

## What makes them feel alive

- **Routines:** Gourav codes, drinks coffee, refills it at the machine, and sometimes reads a book from his shelf. She paints, sits in the park, and chats with Neel.
- **Thoughts:** while they work they think about coffee, the code, the painting, and each other.
- **Visits:** he comes to sit with her on her bench, and she brings him lunch at his desk. They talk, hug and say goodbye. Dragging or calling one of them away ends the visit, and the other one leaves with a word.
- **Reacting to you:** opening an app gets a remark, and they walk over to it. Playing music makes her and Pixie dance for the whole song, in her own style for each song. Gourav just says music helps him focus.
- **Their app in the dock** shows what they're doing right now, their latest thoughts and their day.
