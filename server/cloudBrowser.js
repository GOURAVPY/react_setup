import { clientIp, createLimiter, handleCors, readBody, sendJson } from "./common.js";

// The Browser app's cloud browser: a real Chrome running at Hyperbeam,
// streamed into the Browser window, for sites that refuse to be shown inside
// another page (YouTube, Google, GitHub…). The Hyperbeam key stays here; a
// visitor only ever gets a link to their own short session.
//
// GET  /api/cloud-browser        <- { enabled, minutesLeft }
// POST /api/cloud-browser        { url, region } -> { id, embedUrl, adminToken, endsAt }
// POST /api/cloud-browser/end    { id } (also sent by the page as it closes)

const ENGINE = "https://engine.hyperbeam.com/v0";
const REGIONS = ["NA", "EU", "AS"];

const SESSION = 10 * 60; // seconds a session may last
const INACTIVE = 3 * 60; // seconds without input before it ends
const OFFLINE = 45; // seconds after the visitor leaves before it ends
const DEFAULT_MONTHLY = 9000; // minutes a month, under Hyperbeam's 10,000 free

/**
 * @param apiKey          Hyperbeam API key; without it the cloud browser is off
 * @param allowedOrigins  sites allowed to call it from a browser ("*" for any)
 * @param monthlyMinutes  stop starting sessions after this many minutes a month
 */
export const createCloudBrowserHandler = ({
  apiKey,
  allowedOrigins = [],
  monthlyMinutes = DEFAULT_MONTHLY,
} = {}) => {
  // a few sessions an hour per visitor, and a cap on the day for everyone
  const allow = createLimiter({ perVisitor: 6, windowMs: 60 * 60_000, daily: 300 });
  const sessions = new Map(); // id -> { ip, endsAt }
  let usage = { at: 0, minutes: 0 };

  const engine = (path, init = {}) =>
    fetch(`${ENGINE}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(20_000),
    });

  // this month's minutes so far, asked at most every five minutes
  const minutesUsed = async () => {
    if (Date.now() - usage.at < 5 * 60_000) return usage.minutes;
    try {
      const { usage: months = [] } = await (await engine("/vm/usage")).json();
      const month = new Date().toISOString().slice(0, 7);
      const now = months.find(({ date }) => String(date).startsWith(month));
      usage = { at: Date.now(), minutes: Math.ceil((now?.seconds ?? 0) / 60) };
    } catch {
      usage.at = Date.now();
    }
    return usage.minutes;
  };

  const end = async (id) => {
    sessions.delete(id);
    try {
      await engine(`/vm/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {
      // it ends by itself when its timeouts run out
    }
  };

  const start = async (req, res) => {
    let body = {};
    try {
      body = JSON.parse((await readBody(req)) || "{}");
    } catch {
      return sendJson(res, 400, { error: "bad request" });
    }
    let url;
    try {
      url = new URL(String(body.url ?? ""));
    } catch {
      return sendJson(res, 400, { error: "bad address" });
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return sendJson(res, 400, { error: "bad address" });
    }
    const region = REGIONS.includes(body.region) ? body.region : "AS";
    // Google and YouTube in the visitor's country and language
    const country = /^[A-Z]{2}$/.test(body.country ?? "") ? body.country : undefined;
    const language = /^[a-zA-Z0-9,;=.\- ]{2,60}$/.test(body.language ?? "") ? body.language : undefined;

    const ip = clientIp(req);
    if (!allow(ip)) return sendJson(res, 429, { error: "visitor" });
    if ((await minutesUsed()) >= monthlyMinutes) return sendJson(res, 429, { error: "month" });

    // one session per visitor: a new one replaces the old
    const now = Date.now();
    for (const [id, session] of sessions) {
      if (session.endsAt < now) sessions.delete(id);
      else if (session.ip === ip) end(id);
    }

    const response = await engine("/vm", {
      method: "POST",
      body: JSON.stringify({
        start_url: url.href,
        kiosk: true, // the Browser window has its own address bar
        adblock: true,
        region,
        ...((country || language) && { locale: { country, language } }),
        width: 1280,
        height: 800,
        timeout: { absolute: SESSION, inactive: INACTIVE, offline: OFFLINE, warning: 60 },
      }),
    });
    if (!response.ok) {
      console.error("Hyperbeam error", response.status, (await response.text()).slice(0, 300));
      return sendJson(res, 502, { error: "unavailable" });
    }
    const { session_id: id, embed_url: embedUrl, admin_token: adminToken } = await response.json();
    const endsAt = now + SESSION * 1000;
    sessions.set(id, { ip, endsAt });
    usage.minutes += 1; // a rough count until the next real figure
    sendJson(res, 200, { id, embedUrl, adminToken, endsAt });
  };

  return async (req, res) => {
    if (handleCors(req, res, allowedOrigins)) return;
    const action = new URL(req.url, "http://localhost").pathname.replace(/\/+$/, "").split("/").pop();

    try {
      if (req.method === "GET") {
        if (!apiKey) return sendJson(res, 200, { enabled: false, minutesLeft: 0 });
        const minutesLeft = Math.max(0, monthlyMinutes - (await minutesUsed()));
        return sendJson(res, 200, { enabled: minutesLeft > 0, minutesLeft });
      }
      if (req.method !== "POST") return sendJson(res, 405, { error: "GET or POST" });
      if (!apiKey) return sendJson(res, 503, { error: "off" });

      if (action === "end") {
        let id = "";
        try {
          id = String(JSON.parse((await readBody(req)) || "{}").id ?? "");
        } catch {
          // ignore: nothing to end
        }
        // a session id is a long random secret only its visitor has, so
        // knowing it is enough (this also works after the server restarts)
        if (/^[0-9a-f-]{36}$/i.test(id)) await end(id);
        return sendJson(res, 200, { ended: true });
      }
      return await start(req, res);
    } catch (error) {
      console.error("Cloud browser failed:", error.message);
      if (!res.headersSent) sendJson(res, 502, { error: "unavailable" });
    }
  };
};
