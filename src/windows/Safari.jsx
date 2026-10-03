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
import { SITES, faviconOf, hostName, resolveInput, resolvePage } from "./browser";

// A browser that really browses: type an address or a search, and the page
// loads inside the window. Sites that refuse to be shown in a frame get an
// "open in a new tab" page instead. "" in the history is the start page.

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

  // what's typed in the address bar, until the page changes
  const [typed, setTyped] = useState({ at: current, text: current });
  const address = typed.at === current ? typed.text : current;

  const [loading, setLoading] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [recents, setRecents] = useState(readRecents);
  const input = useRef(null);

  const go = (href) => {
    if (href == null) return;
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
    if (!page || page.blocked) return;
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
          <button type="button" onClick={reload} disabled={!page || page.blocked} aria-label="Reload">
            <RotateCw className="icon" />
          </button>
        </div>

        <form className="address" onSubmit={submit}>
          {loading ? (
            <Loader2 className="icon spin" aria-label="Loading" />
          ) : page?.blocked ? (
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

          <h3>Sites that work in here</h3>
          <ul className="tiles">
            {SITES.map(({ name, url, host }) => (
              <li key={url}>
                <button type="button" onClick={() => go(url)}>
                  <SiteIcon host={host ?? hostName(url)} name={name} />
                  <span>{name}</span>
                </button>
              </li>
            ))}
          </ul>

          {recents.length > 0 && (
            <>
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
            </>
          )}

          <p className="hint">
            Google, GitHub and some other big sites only open in their own tab. YouTube videos play
            here.
          </p>
        </div>
      ) : page.blocked ? (
        <div className="page blocked">
          <Globe size={40} strokeWidth={1.5} />
          <h3>{page.host} won&apos;t open in here</h3>
          <p>Some sites only allow themselves to be shown in their own tab.</p>
          <a href={current} target="_blank" rel="noopener noreferrer">
            Open in a new tab <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        <iframe
          key={`${page.url}#${reloads}`}
          className="page"
          src={page.url}
          title={page.host}
          onLoad={() => setLoading(false)}
          // no allow-top-navigation: a framed page can't take over the portfolio
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          // sites see only that the portfolio is showing them; YouTube won't
          // play embedded videos without that (error 153)
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </>
  );
};

const SafariWindow = WindowWrapper(Safari, "safari");

export default SafariWindow;
