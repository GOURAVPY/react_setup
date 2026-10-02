# Pixie's brain

Pixie uses Gemini in two ways: she answers visitors' questions, and her "mind" decides what she does next. This folder is the small server that holds the Gemini key, so the key never reaches the browser.

- `brain.js`: the chat (`/api/pixie`). It contains her instructions and what she knows, and it limits each visitor to 15 questions per 10 minutes and the whole site to 500 per day.
- `mind.js`: her own decisions (`/api/pixie/mind`). About once a minute, while someone is using the page, the page describes the moment: where she is, her mood, energy and boredom, open windows, and what the visitor just did. Gemini then plans her next 30 to 60 seconds: walk somewhere, sit, think or say something, read, dance, use her slingshot, kick her ball, water her plant, sleep in her bed, and so on. Each visitor gets at most 12 plans per 10 minutes, and the whole site 1500 per day. Without a plan, or when the server says no, she wanders about on her own as before.
- `common.js`: the parts both share: limits, website checks and the Gemini call.
- `profile.js`: facts about you. **Fill this in.** She also uses the projects, skills and links from `src/constants/indax.js`.
- `index.js`: runs the handler as its own web service for the live site.

## On your computer

1. Save your Gemini key once:

   ```bash
   setx GEMINI_API_KEY "your-gemini-key"
   ```

   Instead, you can put `GEMINI_API_KEY=your-gemini-key` in a file named `.env.local` in `react_setup`. Git ignores that file.
2. Close the terminal and open a new one, then run `npm run dev`. The dev server runs her brain too.

## On Render

Two services from the same GitHub repository:

**1. Her brain: New → Web Service**

| Setting | Value |
|---|---|
| Root directory | leave empty |
| Runtime | Node |
| Build command | `node --version` (nothing to build) |
| Start command | `node server/index.js` |
| Instance type | Free |
| Environment | `GEMINI_API_KEY` = your key; `ALLOWED_ORIGINS` = your site's address (step 3) |

**2. The website: New → Static Site**

| Setting | Value |
|---|---|
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |
| Environment | `VITE_PIXIE_API` = the brain's address, e.g. `https://pixie-brain.onrender.com` |

**3.** Copy the website's address, for example `https://gourav-portfolio.onrender.com`, into the brain's `ALLOWED_ORIGINS`. The address has no slash at the end.

Without `VITE_PIXIE_API`, the site still works: Pixie gives tips when clicked instead of opening a chat box.

## Good to know

- **A free Render server sleeps when nobody uses it.** The site wakes it as soon as a visitor arrives, but the first answer after a long quiet spell can still be slow.
- **On Gemini's free tier, Google may use the questions to improve its products.** A paid key doesn't allow that.
- **Gemini's free tier limits how many requests you can make per minute.** With several visitors at once, her mind may be refused for a while. She then wanders on her own and tries again 10 minutes later.
- Optional settings for the brain: `PIXIE_MODEL` (default `gemini-3.5-flash-lite`), `PIXIE_DAILY_LIMIT` (chat questions per day, default 500) and `PIXIE_MIND_DAILY` (plans per day, default 1500).
- Visitors can switch her mind off in Settings › Pixie, which also shows what's on her mind right now.
