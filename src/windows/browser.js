// The Browser app's knowledge: where an address really leads, which sites
// refuse to be shown inside another page, and the start page's tiles.

// Searches go to Bing: Google and DuckDuckGo refuse to be framed
export const searchUrl = (query) =>
  `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

const videoSearchUrl = (query) =>
  `https://www.bing.com/videos/search?q=${encodeURIComponent(query)}`;

// Well-known sites that forbid being shown inside another page (they send
// X-Frame-Options or a frame-ancestors rule). They get the "open in a new
// tab" page straight away; any other site is asked by the server first
// (server/frameCheck.js).
const REFUSES = [
  "google.com",
  "youtube.com",
  "github.com",
  "stackoverflow.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "instagram.com",
  "facebook.com",
  "reddit.com",
  "developer.mozilla.org",
  "npmjs.com",
  "codepen.io",
  "duckduckgo.com",
  "render.com",
  "gsap.com",
  "dev.to",
  "medium.com",
  "chatgpt.com",
  "openai.com",
  "claude.ai",
  "anthropic.com",
  "discord.com",
  "whatsapp.com",
  "figma.com",
  "notion.so",
  "canva.com",
  "netflix.com",
  "amazon.com",
  "amazon.in",
  "apple.com",
  "microsoft.com",
  "vercel.com",
  "netlify.com",
  "nextjs.org",
  "w3schools.com",
  "geeksforgeeks.org",
  "freecodecamp.org",
  "leetcode.com",
  "hackerrank.com",
  "huggingface.co",
  "replit.com",
  "bbc.com",
  "coursera.org",
  "udemy.com",
  "pinterest.com",
  "producthunt.com",
  "quora.com",
  "twitch.tv",
  "soundcloud.com",
  "naukri.com",
  "speedtest.net",
  "regex101.com",
  "roadmap.sh",
  "monkeytype.com",
  "lichess.org",
  "neal.fun",
  "news.ycombinator.com",
  "flightradar24.com",
];

const hostOf = (url) => url.hostname.replace(/^www\./, "").toLowerCase();

const refuses = (host) =>
  REFUSES.some((site) => host === site || host.endsWith(`.${site}`));

/**
 * Turns what was typed in the address bar into an address: a web address
 * as it is, a bare domain with https:// added, anything else as a search.
 */
export const resolveInput = (raw, toSearch = searchUrl) => {
  const text = raw.trim();
  if (!text) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
  const looksLikeAddress =
    hasScheme || (!/\s/.test(text) && /^[^/?#]+\.[a-z]{2,}([/?#]|$)/i.test(text));
  if (!looksLikeAddress) return toSearch(text);
  try {
    const url = new URL(hasScheme ? text : `https://${text}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return toSearch(text);
    return url.href;
  } catch {
    return toSearch(text);
  }
};

// search engines' front pages refuse to be framed: the start page has its
// own search box instead
export const isSearchHome = (href) => {
  try {
    const url = new URL(href);
    const host = hostOf(url);
    const front = url.pathname === "/" || url.pathname === "/webhp";
    return front && !url.searchParams.get("q") && (host === "google.com" || host === "bing.com");
  } catch {
    return false;
  }
};

// GitHub paths that aren't repositories
const GITHUB_PAGES = new Set([
  "settings", "features", "login", "join", "explore", "topics", "trending",
  "marketplace", "pricing", "about", "orgs", "sponsors", "notifications",
  "pulls", "issues", "search", "new", "codespaces", "collections", "events",
]);

/**
 * Where an address really goes in the frame: { url, host, blocked, trusted }.
 * Links that would be refused are swapped for a version that's allowed, where
 * one exists: YouTube videos for the embedded player, YouTube searches for
 * Bing Videos, GitHub repositories for github1s (a code viewer), Spotify and
 * Vimeo links for their players, Google searches for Bing. `trusted` means
 * it's known to work, so the server needn't be asked.
 */
export const resolvePage = (href) => {
  let url;
  try {
    url = new URL(href);
  } catch {
    return { url: href, host: href, blocked: true, trusted: false };
  }
  // an https page can't show an http one: most sites have both
  if (url.protocol === "http:" && window.location.protocol === "https:") url.protocol = "https:";

  const host = hostOf(url);
  const parts = url.pathname.split("/").filter(Boolean);
  const swap = (to, swappedHost = hostOf(new URL(to))) => ({
    url: to,
    host: swappedHost,
    blocked: false,
    trusted: true,
  });

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be"
        ? parts[0]
        : parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live"
          ? parts[1]
          : url.searchParams.get("v");
    if (id && /^[\w-]{6,20}$/.test(id)) return swap(`https://www.youtube.com/embed/${id}`, "youtube.com");
    // the rest of YouTube needs the cloud browser; Bing Videos is the stand-in
    const query = url.searchParams.get("search_query");
    return {
      url: url.href,
      host: "youtube.com",
      blocked: true,
      trusted: false,
      alternative: { url: videoSearchUrl(query || "trending videos"), label: "Bing Videos instead" },
    };
  }

  if (host === "google.com" && url.pathname === "/search" && url.searchParams.get("q")) {
    return swap(searchUrl(url.searchParams.get("q")));
  }

  if (host === "github.com" && parts.length >= 2 && !GITHUB_PAGES.has(parts[0])) {
    return swap(`https://github1s.com/${parts.join("/")}`);
  }

  if (host === "open.spotify.com" && parts[0] !== "embed" && parts.length >= 2) {
    const kind = parts.find((part) => /^(track|album|playlist|artist|episode|show)$/.test(part));
    const id = kind && parts[parts.indexOf(kind) + 1];
    if (id) return swap(`https://open.spotify.com/embed/${kind}/${id}`);
  }

  if (host === "vimeo.com" && /^\d+$/.test(parts[0] ?? "")) {
    return swap(`https://player.vimeo.com/video/${parts[0]}`);
  }

  const known = SITES.some((site) => hostOf(new URL(site.url)) === host);
  return { url: url.href, host, blocked: refuses(host), trusted: known || host === "bing.com" };
};

export const hostName = (href) => {
  try {
    return hostOf(new URL(href));
  } catch {
    return href;
  }
};

// a site's little icon, through DuckDuckGo's icon service
export const faviconOf = (host) => `https://icons.duckduckgo.com/ip3/${host}.ico`;

// the start page: sites that are happy to be shown in here
export const SITES = [
  { group: "Explore", name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Main_Page" },
  { group: "Explore", name: "Videos", url: videoSearchUrl("trending videos"), host: "bing.com" },
  { group: "Explore", name: "Radio Garden", url: "https://radio.garden" },
  { group: "Explore", name: "Live wind map", url: "https://earth.nullschool.net" },
  { group: "Explore", name: "Open Library", url: "https://openlibrary.org" },
  { group: "Explore", name: "Internet Archive", url: "https://archive.org" },
  {
    group: "Explore",
    name: "Kota on the map",
    url: "https://www.openstreetmap.org/export/embed.html?bbox=75.78%2C25.12%2C75.90%2C25.22&layer=mapnik",
    host: "openstreetmap.org",
  },
  { group: "Create", name: "Excalidraw", url: "https://excalidraw.com" },
  { group: "Create", name: "tldraw", url: "https://www.tldraw.com" },
  { group: "Create", name: "Photopea", url: "https://www.photopea.com" },
  { group: "Create", name: "Squoosh", url: "https://squoosh.app" },
  { group: "Create", name: "Desmos", url: "https://www.desmos.com/calculator" },
  { group: "Create", name: "GeoGebra", url: "https://www.geogebra.org/calculator" },
  { group: "Developers", name: "React", url: "https://react.dev" },
  { group: "Developers", name: "Vite", url: "https://vite.dev" },
  { group: "Developers", name: "Tailwind CSS", url: "https://tailwindcss.com" },
  { group: "Developers", name: "Node.js", url: "https://nodejs.org" },
  { group: "Developers", name: "Express", url: "https://expressjs.com" },
  { group: "Developers", name: "MongoDB", url: "https://www.mongodb.com" },
  { group: "Developers", name: "shadcn/ui", url: "https://ui.shadcn.com" },
  { group: "Developers", name: "Three.js", url: "https://threejs.org" },
  { group: "Developers", name: "Remotion", url: "https://www.remotion.dev" },
  { group: "Developers", name: "DevDocs", url: "https://devdocs.io" },
  { group: "Developers", name: "Can I use", url: "https://caniuse.com" },
  { group: "Developers", name: "CodeSandbox", url: "https://codesandbox.io" },
];

export const SITE_GROUPS = [...new Set(SITES.map((site) => site.group))];
