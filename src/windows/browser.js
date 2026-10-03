// The Browser app's knowledge: where an address really leads, which sites
// refuse to be shown inside another page, and the start page's tiles.

// Searches go to Bing: Google and DuckDuckGo refuse to be framed
export const searchUrl = (query) =>
  `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

// Well-known sites that forbid being shown inside another page (they send
// X-Frame-Options or a frame-ancestors rule). We don't even try: the visitor
// gets an "open in a new tab" page instead of a blank frame.
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
  "netflix.com",
  "amazon.com",
  "amazon.in",
  "flipkart.com",
  "apple.com",
  "microsoft.com",
  "vercel.com",
  "netlify.com",
  "neal.fun",
];

const hostOf = (url) => url.hostname.replace(/^www\./, "").toLowerCase();

const refuses = (host) =>
  REFUSES.some((site) => host === site || host.endsWith(`.${site}`));

/**
 * Turns what was typed in the address bar into an address: a web address
 * as it is, a bare domain with https:// added, anything else as a search.
 */
export const resolveInput = (raw) => {
  const text = raw.trim();
  if (!text) return null;
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
  const looksLikeAddress =
    hasScheme || (!/\s/.test(text) && /^[^/?#]+\.[a-z]{2,}([/?#]|$)/i.test(text));
  if (!looksLikeAddress) return searchUrl(text);
  try {
    const url = new URL(hasScheme ? text : `https://${text}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return searchUrl(text);
    return url.href;
  } catch {
    return searchUrl(text);
  }
};

/**
 * Where an address really goes in the frame:
 * { url, host, blocked } — `blocked` when the site won't be shown here.
 * YouTube videos are swapped for their embed player, and Google searches for
 * Bing, so those still work.
 */
export const resolvePage = (href) => {
  let url;
  try {
    url = new URL(href);
  } catch {
    return { url: href, host: href, blocked: true };
  }
  const host = hostOf(url);

  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1).split("/")[0]
        : url.pathname.startsWith("/embed/")
          ? url.pathname.slice(7).split("/")[0]
          : url.pathname.startsWith("/shorts/")
            ? url.pathname.slice(8).split("/")[0]
            : url.searchParams.get("v");
    if (id && /^[\w-]{6,20}$/.test(id)) {
      return { url: `https://www.youtube.com/embed/${id}`, host: "youtube.com", blocked: false };
    }
  }

  if (host === "google.com" && url.pathname === "/search" && url.searchParams.get("q")) {
    return { url: searchUrl(url.searchParams.get("q")), host: "bing.com", blocked: false };
  }

  return { url: url.href, host, blocked: refuses(host) };
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
  { name: "Wikipedia", url: "https://en.wikipedia.org/wiki/Main_Page" },
  { name: "React", url: "https://react.dev" },
  { name: "Vite", url: "https://vite.dev" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com" },
  { name: "Three.js", url: "https://threejs.org" },
  { name: "Remotion", url: "https://www.remotion.dev" },
  { name: "Excalidraw", url: "https://excalidraw.com" },
  { name: "Hacker News", url: "https://news.ycombinator.com" },
  { name: "Internet Archive", url: "https://archive.org" },
  {
    name: "Kota on the map",
    url: "https://www.openstreetmap.org/export/embed.html?bbox=75.78%2C25.12%2C75.90%2C25.22&layer=mapnik",
    host: "openstreetmap.org",
  },
];
