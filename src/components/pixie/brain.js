// Talks to Pixie's brain (server/brain.js), which answers with Gemini. In
// development the Vite dev server runs it at /api/pixie. On the live site it
// is a separate small server: set VITE_PIXIE_API to its address when
// building, e.g. https://pixie-brain.onrender.com. Without it she has no
// chat box and gives tips instead, as before.

const API = (import.meta.env.VITE_PIXIE_API ?? "").replace(/\/$/, "");

export const brainEnabled = import.meta.env.DEV || Boolean(API);

// the same small server also answers the Browser app (server/frameCheck.js)
export const serverEnabled = brainEnabled;
export const serverUrl = (path) => `${API}${path}`;

// a free server sleeps when unused; knocking on page load wakes it in time
export const wakeBrain = () => {
  if (API) fetch(`${API}/api/health`, { mode: "no-cors" }).catch(() => {});
};

/**
 * Asks her mind what she wants to do next.
 * @param snapshot  the moment: where she is, how she feels, what's going on
 * @returns { mood, thought, plan }; throws an Error with .status when it can't
 */
export const askMind = async (snapshot, { signal } = {}) => {
  const response = await fetch(`${API}/api/pixie/mind`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot }),
    signal,
  });
  if (!response.ok) {
    const error = new Error(`Pixie's mind answered ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

/**
 * Sends the conversation and streams back her answer.
 * @param messages  [{ role: "user" | "model", text }], ending with a question
 * @param onText    called with the answer so far, each time more arrives
 * @returns the whole answer; throws an Error with .status when she can't
 */
export const askPixie = async (messages, { signal, onText }) => {
  const response = await fetch(`${API}/api/pixie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!response.ok || !response.body) {
    const error = new Error(`Pixie's brain answered ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return text;
    text += value;
    onText(text);
  }
};
