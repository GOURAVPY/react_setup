import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Globe,
  House,
  Loader2,
  Lock,
  RotateCw,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useWindowStore from "../store/window";
import { serverEnabled, serverUrl } from "../components/pixie/brain";
import {
  SITES,
  SITE_GROUPS,
  faviconOf,
  hostName,
  isSearchHome,
  resolveInput,
  resolvePage,
} from "./browser";

// A browser that really browses: type an address or a search, and the page
// loads inside the window. Before showing a site it doesn't know, it asks the
// server (server/frameCheck.js) whether the site allows being shown inside
// another page; sites that refuse get an "open in a new tab" page instead of
// the browser's broken-page error. "" in the history is the start page.

const HOME = "";
const RECENTS_KEY = "browser-recents";
const RECENTS_KEPT = 8;
const LOAD_TIMEOUT = 15_000; // ms before the spinner gives up on a slow page

const readRecents = () => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(RECENTS_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((url) => typeof url === "string") : [];
  } catch {
    return [];
  }
};

// a site's icon with its first letter behind it, in case the icon fails
const SiteIcon = ({ host, name }) => (
  <span className="site-icon">
    <b aria-hidden="true">{name[0]}</b>
    <img src={faviconOf(host)} alt="" loading="lazy" onError={(e) => e.target.remove()} />
  </span>
);

const Safari = () => {
  const data = useWindowStore((state) => state.windows.safari.data);

  const [nav, setNav] = useState({ stack: [HOME], at: 0 });
  const current = nav.stack[nav.at];
  const page = current ? resolvePage(current) : null;
  const pageUrl = page?.url ?? null;

  // what's typed in the address bar, until the page changes
  const [typed, setTyped] = useState({ at: current, text: current });
  const address = typed.at === current ? typed.text : current;

  const [loading, setLoading] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [recents, setRecents] = useState(readRecents);
  const input = useRef(null);

  // the server's answers: page address -> true (allowed), false (refused),
  // null (couldn't tell)
  const [verdicts, setVerdicts] = useState({});
  const needsCheck = Boolean(page && !page.blocked && !page.trusted && serverEnabled);
  const verdict = pageUrl ? verdicts[pageUrl] : undefined;
  const checking = needsCheck && verdict === undefined;
  const blocked = Boolean(page && (page.blocked || verdict === false));

  useEffect(() => {
    if (!needsCheck || verdict !== undefined) return;
    const controller = new AbortController();
    fetch(serverUrl(`/api/frame-check?url=${encodeURIComponent(pageUrl)}`), {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { embeddable: null }))
      .then(
        (answer) => setVerdicts((all) => ({ ...all, [pageUrl]: answer.embeddable ?? null })),
        () => {
          // the server is away: try the page anyway
          if (!controller.signal.aborted) setVerdicts((all) => ({ ...all, [pageUrl]: null }));
        },
      );
    return () => controller.abort();
  }, [pageUrl, needsCheck, verdict]);

  const go = (target) => {
    if (target == null) return;
    // Google's and Bing's front pages refuse to be framed: the start page
    // has its own search box
    const href = isSearchHome(target) ? HOME : target;
    setNav(({ stack, at }) => ({ stack: [...stack.slice(0, at + 1), href], at: at + 1 }));
    setLoading(href !== HOME && !resolvePage(href).blocked);
    if (href !== HOME) {
      setRecents((list) => {
        const next = [href, ...list.filter((url) => url !== href)].slice(0, RECENTS_KEPT);
        try {
          sessionStorage.setItem(RECENTS_KEY, JSON.stringify(next));
        } catch {
          // storage blocked: recents last until the page reloads
        }
        return next;
      });
    }
  };

  const step = (by) => {
    setNav((n) => {
      const at = Math.min(n.stack.length - 1, Math.max(0, n.at + by));
      const href = n.stack[at];
      setLoading(href !== HOME && !resolvePage(href).blocked);
      return { ...n, at };
    });
  };

  const reload = () => {
    if (!page || blocked) return;
    setReloads((n) => n + 1);
    setLoading(true);
  };

  // something else asked for an address (openWindow("safari", { url }))
  const [seenData, setSeenData] = useState(data);
  if (data !== seenData) {
    setSeenData(data);
    if (data?.url) go(data.url);
  }

  // a page that never says it has loaded shouldn't spin forever
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), LOAD_TIMEOUT);
    return () => clearTimeout(timer);
  }, [loading, current, reloads]);

  const submit = (e) => {
    e.preventDefault();
    const href = resolveInput(address);
    if (href) go(href);
    input.current?.blur();
  };

  const canGoBack = nav.at > 0;
  const canGoForward = nav.at < nav.stack.length - 1;
  const spinning = checking || (loading && !blocked);
  // no answer from the server: the page might still turn out empty
  const unsure = Boolean(page && !blocked && !checking && !page.trusted && verdict !== true);

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="safari" />

        <div className="nav">
          <button type="button" onClick={() => step(-1)} disabled={!canGoBack} aria-label="Back">
            <ChevronLeft className="icon" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={!canGoForward} aria-label="Forward">
            <ChevronRight className="icon" />
          </button>
          <button type="button" onClick={reload} disabled={!page || blocked} aria-label="Reload">
            <RotateCw className="icon" />
          </button>
        </div>

        <form className="address" onSubmit={submit}>
          {spinning ? (
            <Loader2 className="icon spin" aria-label="Loading" />
          ) : blocked ? (
            <ShieldAlert className="icon" />
          ) : page ? (
            <Lock className="icon" />
          ) : (
            <Search className="icon" />
          )}
          <input
            ref={input}
            type="text"
            value={address}
            onChange={(e) => setTyped({ at: current, text: e.target.value })}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter website name"
            aria-label="Address"
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        <div className="tools">
          <button type="button" onClick={() => go(HOME)} disabled={!current} aria-label="Start page">
            <House className="icon" />
          </button>
          <a
            href={current || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in a new tab"
            aria-disabled={!current}
            className={current ? undefined : "disabled"}
          >
            <ExternalLink className="icon" />
          </a>
        </div>
      </div>

      {!page ? (
        <div className="page start">
          <form className="big-search" onSubmit={submit}>
            <Search className="icon" />
            <input
              type="text"
              value={address}
              onChange={(e) => setTyped({ at: current, text: e.target.value })}
              placeholder="Search the web or type an address"
              aria-label="Search the web or type an address"
              autoComplete="off"
              spellCheck={false}
            />
          </form>

          {SITE_GROUPS.map((group) => (
            <section key={group}>
              <h3>{group}</h3>
              <ul className="tiles">
                {SITES.filter((site) => site.group === group).map(({ name, url, host }) => (
                  <li key={url}>
                    <button type="button" onClick={() => go(url)}>
                      <SiteIcon host={host ?? hostName(url)} name={name} />
                      <span>{name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {recents.length > 0 && (
            <section>
              <h3>Recent</h3>
              <ul className="recents">
                {recents.map((url) => (
                  <li key={url}>
                    <button type="button" onClick={() => go(url)} title={url}>
                      <SiteIcon host={hostName(url)} name={hostName(url)} />
                      <span>{url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="hint">
            YouTube videos, GitHub repositories and Spotify links open in here. Many big sites,
            like Google, LinkedIn and Instagram, only open in their own tab.
          </p>
        </div>
      ) : blocked ? (
        <div className="page blocked">
          <Globe size={40} strokeWidth={1.5} />
          <h3>{page.host} won&apos;t open in here</h3>
          <p>This site only allows itself to be shown in its own tab.</p>
          <a href={current} target="_blank" rel="noopener noreferrer">
            Open in a new tab <ExternalLink size={14} />
          </a>
        </div>
      ) : checking ? (
        <div className="page checking" aria-live="polite">
          <Loader2 className="spin" size={22} />
          <span>Opening {page.host}…</span>
        </div>
      ) : (
        <div className="page framed">
          {unsure && (
            <p className="frame-hint">
              Page stays empty? {page.host} may not allow being shown here.
              <a href={current} target="_blank" rel="noopener noreferrer">
                Open in a new tab <ExternalLink size={12} />
              </a>
            </p>
          )}
          <iframe
            key={`${page.url}#${reloads}`}
            src={page.url}
            title={page.host}
            onLoad={() => setLoading(false)}
            // no allow-top-navigation: a framed page can't take over the portfolio
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-modals allow-downloads allow-pointer-lock"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            // sites see only that the portfolio is showing them; YouTube won't
            // play embedded videos without that (error 153)
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
    </>
  );
};

const SafariWindow = WindowWrapper(Safari, "safari");

export default SafariWindow;
