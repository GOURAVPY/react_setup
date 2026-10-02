// Shared by Pixie's chat (brain.js) and her mind (mind.js): talking to
// Gemini, reading requests, and the limits that keep the bill small.

export const GEMINI = "https://generativelanguage.googleapis.com/v1beta/models";
export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

const MAX_BODY = 16_000; // bytes per request

// at most `perVisitor` requests per `windowMs` from one visitor, and `daily`
// from everyone together; returns false once a limit is reached
export const createLimiter = ({ perVisitor, windowMs, daily }) => {
  const visitors = new Map(); // ip -> times of recent requests
  let day = new Date().toDateString();
  let today = 0;

  return (ip) => {
    const now = Date.now();
    if (new Date().toDateString() !== day) {
      day = new Date().toDateString();
      today = 0;
      visitors.clear();
    }
    if (today >= daily) return false;

    const recent = (visitors.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= perVisitor) return false;
    recent.push(now);
    visitors.set(ip, recent);
    today += 1;
    return true;
  };
};

export const clientIp = (req) =>
  String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() ||
  req.socket.remoteAddress;

// lets the site call from the browser; answers the preflight itself and
// returns true when it did
export const handleCors = (req, res, allowedOrigins) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes("*") || allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  if (req.method !== "OPTIONS") return false;
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.statusCode = 204;
  res.end();
  return true;
};

export const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("too large"));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

export const send = (res, status, text) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
};

export const sendJson = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
};

// the text in a Gemini response (or one streamed chunk), leaving out thinking
export const responseText = (data) =>
  (data?.candidates?.[0]?.content?.parts ?? [])
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("");

export const callGemini = ({ apiKey, model, body, stream = false, signal }) =>
  fetch(
    `${GEMINI}/${model}:${stream ? "streamGenerateContent?alt=sse" : "generateContent"}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
      signal,
    },
  );
