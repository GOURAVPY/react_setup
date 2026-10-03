import dns from "node:dns/promises";
import net from "node:net";
import { clientIp, createLimiter, handleCors, sendJson } from "./common.js";

// For the portfolio's Browser app: asks a site, before it's loaded in the
// Browser window, whether it allows being shown inside another page. Sites
// that refuse (X-Frame-Options, or a Content-Security-Policy frame-ancestors
// rule) then get a friendly "open in a new tab" page instead of the browser's
// broken-page error.
//
// GET /api/frame-check?url=https://example.com
// <- { embeddable: true | false | null, url: final address after redirects }
//
// Only ever reads response headers, never page content, and refuses to look
// at private or local network addresses.

const MAX_REDIRECTS = 5;
const TIMEOUT = 6000; // ms per site
const CACHE_FOR = 60 * 60_000; // ms a site's answer is remembered
const CACHE_SIZE = 1000;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// ------------------------------------------------------------ safety

const PRIVATE_V4 = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

const v4ToInt = (ip) => ip.split(".").reduce((n, part) => (n << 8) + Number(part), 0) >>> 0;

const isPrivate = (ip) => {
  if (net.isIPv4(ip)) {
    const n = v4ToInt(ip);
    return PRIVATE_V4.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (n & mask) === (v4ToInt(base) & mask);
    });
  }
  const lower = ip.toLowerCase();
  if (lower.startsWith("::ffff:")) return isPrivate(lower.slice(7));
  return (
    lower === "::" ||
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe8") ||
    lower.startsWith("fe9") ||
    lower.startsWith("fea") ||
    lower.startsWith("feb")
  );
};

// a public web address on the usual ports, or null
const publicUrl = async (href) => {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== "80" && url.port !== "443") return null;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return null;
  try {
    const addresses = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivate(address))) return null;
  } catch {
    return null;
  }
  return url;
};

// ------------------------------------------------------------ the rules

// does this response allow being shown inside a page from `origin`?
const allowsFraming = (headers, origin) => {
  const xfo = headers.get("x-frame-options");
  if (xfo && /deny|sameorigin|allow-from/i.test(xfo)) return false;

  const csp = headers.get("content-security-policy") ?? "";
  const rule = csp
    .split(/[;,]/)
    .map((part) => part.trim())
    .find((part) => /^frame-ancestors\s/i.test(part));
  if (!rule) return true;
  const sources = rule.split(/\s+/).slice(1);
  if (sources.includes("*")) return true;
  if (!origin) return false;
  const { protocol, host } = new URL(origin);
  return sources.some((source) => {
    const clean = source.replace(/\/$/, "");
    if (clean === origin || clean === host) return true;
    // "https://*.example.com" style wildcards
    const match = clean.match(/^(?:(https?):\/\/)?\*\.(.+)$/);
    return Boolean(match && (!match[1] || `${match[1]}:` === protocol) && host.endsWith(`.${match[2]}`));
  });
};

const check = async (href, origin) => {
  let url = await publicUrl(href);
  if (!url) return { embeddable: false, url: href, reason: "not a public web address" };

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8" },
      signal: AbortSignal.timeout(TIMEOUT),
    });
    // only the headers matter
    response.body?.cancel().catch(() => {});

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      const next = await publicUrl(new URL(location, url).href);
      if (!next) return { embeddable: false, url: url.href, reason: "redirects somewhere private" };
      url = next;
      continue;
    }
    return { embeddable: allowsFraming(response.headers, origin), url: url.href };
  }
  return { embeddable: null, url: url.href, reason: "too many redirects" };
};

// ------------------------------------------------------------ the handler

/**
 * Returns a (req, res) handler for Node's http server and Vite's dev server.
 * @param allowedOrigins  sites allowed to call it from a browser ("*" for any)
 */
export const createFrameCheckHandler = ({ allowedOrigins = [] } = {}) => {
  const allow = createLimiter({ perVisitor: 60, windowMs: 10 * 60_000, daily: 5000 });
  const cache = new Map(); // "origin url" -> { at, answer }

  return async (req, res) => {
    if (handleCors(req, res, allowedOrigins)) return;
    if (req.method !== "GET") return sendJson(res, 405, { error: "GET only" });

    const href = new URL(req.url, "http://localhost").searchParams.get("url") ?? "";
    if (!href || href.length > 2000) return sendJson(res, 400, { error: "?url= is required" });

    // the page doing the framing: the Browser app's own site
    const origin = req.headers.origin ?? null;
    const key = `${origin} ${href}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_FOR) return sendJson(res, 200, hit.answer);

    if (!allow(clientIp(req))) return sendJson(res, 429, { error: "Too many checks" });

    let answer;
    try {
      answer = await check(href, origin);
    } catch {
      // unreachable or too slow: let the browser try anyway
      answer = { embeddable: null, url: href, reason: "no answer" };
    }
    if (cache.size >= CACHE_SIZE) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), answer });
    res.setHeader("Cache-Control", "public, max-age=3600");
    sendJson(res, 200, answer);
  };
};
