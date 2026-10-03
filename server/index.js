import http from "node:http";
import { createPixieHandler } from "./brain.js";
import { createMindHandler } from "./mind.js";
import { createFrameCheckHandler } from "./frameCheck.js";

// Pixie's brain as its own small web service, for when the site itself is
// hosted as static files (Render Static Site). Settings come from the
// environment:
//   GEMINI_API_KEY    the Gemini key (required)
//   ALLOWED_ORIGINS   the site's address, e.g. https://my-portfolio.onrender.com
//                     (several separated by commas)
//   PIXIE_MODEL       optional Gemini model id
//   PIXIE_DAILY_LIMIT optional chat questions per day from everyone together
//   PIXIE_MIND_DAILY  optional plans (her own decisions) per day, all together
//   PORT              set by the host

const options = {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.PIXIE_MODEL || undefined,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
};
const chat = createPixieHandler({
  ...options,
  dailyLimit: Number(process.env.PIXIE_DAILY_LIMIT) || undefined,
});
const mind = createMindHandler({
  ...options,
  dailyLimit: Number(process.env.PIXIE_MIND_DAILY) || undefined,
});
// the Browser app: may this site be shown inside another page?
const frameCheck = createFrameCheckHandler({ allowedOrigins: options.allowedOrigins });

const server = http.createServer((req, res) => {
  const path = (req.url ?? "").split("?")[0];
  if (path === "/api/pixie") return chat(req, res);
  if (path === "/api/pixie/mind") return mind(req, res);
  // the site pings this on load, so a sleeping free server wakes up in time
  if (path === "/api/frame-check") return frameCheck(req, res);
  if (path === "/api/health" || path === "/") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end("ok");
    return;
  }
  res.statusCode = 404;
  res.end("Not found");
});

const port = Number(process.env.PORT) || 8787;
server.listen(port, () => {
  console.log(`Pixie's brain is listening on port ${port}`);
  if (!process.env.GEMINI_API_KEY) console.warn("GEMINI_API_KEY is not set");
});
