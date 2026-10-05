import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  ExternalLink,
  Globe,
  House,
  Loader2,
  Lock,
  RotateCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { Windowcontrols } from "../components";
import WindowWrapper from "../hoc/Windowwappre";
import useWindowStore from "../store/window";
import { serverEnabled, serverUrl } from "../components/pixie/brain";
import CloudBrowser from "./CloudBrowser";
import { getCloudStatus, googleSearch } from "./cloud";
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
// the browser's broken-page error, and the choice of the cloud browser: a
// real Chrome streamed in from Hyperbeam that opens anything (CloudBrowser).
// "" in the history is the start page.

const HOME = "";
const RECENTS_KEY = "browser-recents";
const RECENTS_KEPT = 8;
const LOAD_TIMEOUT = 15_000; // ms before the spinner gives up on a slow page
const WARM_FOR = 60_000; // ms a cloud browser started while typing waits to be used
const WARM_START = "https://www.google.com";

// why a cloud session ended by itself
const CLOUD_ENDED = {
  absolute: "Your 10 minutes in the cloud browser are up.",
  inactive: "The cloud browser closed after a few quiet minutes.",
};

const clock = (ms) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

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
  const isOpen = useWindowStore((state) => state.windows.safari.isOpen);
  const isMinimized = useWindowStore((state) => state.windows.safari.isMinimized);

  const [nav, setNav] = useState({ stack: [HOME], at: 0 });
  const current = nav.stack[nav.at];
  // is the cloud browser switched on (a Hyperbeam key, minutes left)?
  const [cloudReady, setCloudReady] = useState(false);
  const resolved = current ? resolvePage(current) : null;
  // without the cloud browser, a stand-in opens straight away (YouTube's
  // home page becomes Bing Videos)
  const page =
    resolved?.blocked && resolved.alternative && !cloudReady
      ? {
          url: resolved.alternative.url,
          host: hostName(resolved.alternative.url),
          blocked: false,
          trusted: true,
        }
      : resolved;
  const pageUrl = page?.url ?? null;

  // the cloud browser: { startUrl, id, warm, request }, the page it shows,
  // and when its time is up. A "warm" one was started in the background while
  // the visitor typed, and isn't shown until it's used.
  const [cloud, setCloud] = useState(null);
  const cloudOn = Boolean(cloud && !cloud.warm);
  const [cloudPage, setCloudPage] = useState(null);
  const [cloudEndsAt, setCloudEndsAt] = useState(null);
  const [cloudNote, setCloudNote] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const cloudView = useRef(null);

  // what the address bar shows, and what's typed in it until that changes
  const shown = cloudOn ? (cloudPage?.url ?? cloud.request?.url ?? cloud.startUrl) : current;
  const [typed, setTyped] = useState({ at: shown, text: shown });
  const address = typed.at === shown ? typed.text : shown;

  const [loading, setLoading] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [recents, setRecents] = useState(readRecents);
  const input = useRef(null);

  useEffect(() => {
    getCloudStatus().then((status) => setCloudReady(Boolean(status.enabled)));
  }, []);

  // shows the cloud browser at `url`, putting a warm one to use if there is one
  const openCloud = (url) => {
    setCloudNote(null);
    setCloudPage({ url, title: null });
    if (cloud?.warm) {
      setCloud({ ...cloud, warm: false, request: { url, seq: Date.now() } });
      return;
    }
    setCloudEndsAt(null);
    setCloud({ startUrl: url, id: Date.now(), warm: false, request: null });
  };

  // starts one out of sight while the visitor types a search or the address
  // of a site that needs it, so it's ready (or nearly) by the time they press
  // Enter
  const warmUp = (text) => {
    if (!cloudReady || cloud || text.trim().length < 3) return;
    const href = resolveInput(text, () => null);
    if (href !== null && !resolvePage(href).blocked) return;
    setCloud({ startUrl: WARM_START, id: Date.now(), warm: true, request: null });
  };

  const typing = (text) => {
    setTyped({ at: shown, text });
    if (!cloudOn) warmUp(text);
  };

  const closeCloud = (reason) => {
    setCloud(null);
    setCloudPage(null);
    setCloudEndsAt(null);
    setCloudNote(CLOUD_ENDED[reason] ?? null);
  };

  // a site that won't show in a frame opens straight in the cloud browser,
  // so its links stay in this window too (without it, the "won't open in
  // here" page offers the choices)
  const autoCloud = useRef(null);
  useEffect(() => {
    autoCloud.current = (url) => {
      if (cloudReady && !cloudOn) openCloud(url);
    };
  });

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
        (answer) => {
          setVerdicts((all) => ({ ...all, [pageUrl]: answer.embeddable ?? null }));
          if (answer.embeddable === false) autoCloud.current?.(pageUrl);
        },
        () => {
          // the server is away: try the page anyway
          if (!controller.signal.aborted) setVerdicts((all) => ({ ...all, [pageUrl]: null }));
        },
      );
    return () => controller.abort();
  }, [pageUrl, needsCheck, verdict]);

  // closing the window ends the session
  if (!isOpen && cloud) closeCloud();

  // the countdown on the cloud chip
  useEffect(() => {
    if (!cloudOn) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [cloudOn]);

  // a warm one nobody used ends by itself
  const warmId = cloud?.warm ? cloud.id : null;
  useEffect(() => {
    if (!warmId) return;
    const timer = setTimeout(() => {
      setCloud((now) => (now?.id === warmId && now.warm ? null : now));
    }, WARM_FOR);
    return () => clearTimeout(timer);
  }, [warmId]);

  const pushPage = (href) =>
    setNav(({ stack, at }) => ({ stack: [...stack.slice(0, at + 1), href], at: at + 1 }));

  const go = (target) => {
    if (target == null) return;
    // Google's and Bing's front pages refuse to be framed: the start page
    // has its own search box
    const href = isSearchHome(target) ? HOME : target;
    pushPage(href);
    const refused = href !== HOME && resolvePage(href).blocked;
    if (refused && cloudReady) openCloud(href);
    // a warm cloud browser isn't needed for a page that shows in a frame
    else if (cloud?.warm) closeCloud();
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
    if (cloudOn) {
      if (by < 0) cloudView.current?.back();
      else cloudView.current?.forward();
      return;
    }
    setNav((n) => {
      const at = Math.min(n.stack.length - 1, Math.max(0, n.at + by));
      const href = n.stack[at];
      setLoading(href !== HOME && !resolvePage(href).blocked);
      return { ...n, at };
    });
  };

  const reload = () => {
    if (cloudOn) {
      cloudView.current?.reload();
      return;
    }
    if (!page || blocked) return;
    setReloads((n) => n + 1);
    setLoading(true);
  };

  // something else asked for an address (openWindow("safari", { url }))
  const [seenData, setSeenData] = useState(data);
  if (data !== seenData) {
    setSeenData(data);
    if (data?.url) {
      if (cloud) closeCloud();
      go(data.url);
    }
  }

  // a page that never says it has loaded shouldn't spin forever
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), LOAD_TIMEOUT);
    return () => clearTimeout(timer);
  }, [loading, current, reloads]);

  const submit = (e) => {
    e.preventDefault();
    // in the cloud browser everything opens, Google included; a search starts
    // it, so clicking a result stays in this window (in a frame, Bing opens
    // results in a new tab)
    const isSearch = address.trim() !== "" && resolveInput(address, () => null) === null;
    const href = cloudOn || (isSearch && cloudReady) ? resolveInput(address, googleSearch) : resolveInput(address);
    if (href && cloudOn) cloudView.current?.navigate(href);
    else if (href && isSearch && cloudReady) openCloud(href);
    else if (href) go(href);
    // the address bar shows the page again, not what was typed
    setTyped({ at: null, text: "" });
    input.current?.blur();
  };

  const goHome = () => {
    if (cloud) closeCloud();
    pushPage(HOME);
  };

  const canGoBack = cloudOn || nav.at > 0;
  const canGoForward = cloudOn || nav.at < nav.stack.length - 1;
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
          <button type="button" onClick={reload} disabled={!cloudOn && (!page || blocked)} aria-label="Reload">
            <RotateCw className="icon" />
          </button>
        </div>

        <form className="address" onSubmit={submit}>
          {cloudOn ? (
            <Cloud className="icon cloud-icon" aria-label="Cloud browser" />
          ) : spinning ? (
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
            onChange={(e) => typing(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Search or enter website name"
            aria-label="Address"
            autoComplete="off"
            spellCheck={false}
          />
        </form>

        <div className="tools">
          {cloudOn && (
            <button
              type="button"
              className="cloud-chip"
              onClick={() => closeCloud()}
              title="End the cloud browser"
              aria-label="End the cloud browser"
            >
              <Cloud size={13} />
              {cloudEndsAt ? clock(cloudEndsAt - now) : "Cloud"}
              <X size={12} />
            </button>
          )}
          {!cloudOn && cloudReady && current && (
            <button
              type="button"
              onClick={() => openCloud(current)}
              title="Open this page in the cloud browser"
              aria-label="Open this page in the cloud browser"
            >
              <Cloud className="icon" />
            </button>
          )}
          <button type="button" onClick={goHome} disabled={!current && !cloudOn} aria-label="Start page">
            <House className="icon" />
          </button>
          <a
            href={shown || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in a new tab"
            aria-disabled={!shown}
            className={shown ? undefined : "disabled"}
          >
            <ExternalLink className="icon" />
          </a>
        </div>
      </div>

      {cloud && (
        <CloudBrowser
          key={cloud.id}
          ref={cloudView}
          startUrl={cloud.startUrl}
          warm={cloud.warm}
          request={cloud.request}
          paused={isMinimized}
          onPage={setCloudPage}
          onSession={(session) => setCloudEndsAt(session.endsAt)}
          onEnd={closeCloud}
        />
      )}
      {cloudOn ? null : !page ? (
        <div className="page start">
          <form className="big-search" onSubmit={submit}>
            <Search className="icon" />
            <input
              type="text"
              value={address}
              onChange={(e) => typing(e.target.value)}
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
            {cloudReady
              ? "Searches and sites that refuse to be shown here, like YouTube, Google and LinkedIn, open in the cloud browser, a real Chrome streamed into this window."
              : "YouTube videos, GitHub repositories and Spotify links open in here. Many big sites, like Google, LinkedIn and Instagram, only open in their own tab."}
          </p>
        </div>
      ) : blocked ? (
        <div className="page blocked">
          <Globe size={40} strokeWidth={1.5} />
          <h3>{page.host} won&apos;t open in here</h3>
          <p>
            {cloudReady
              ? "This site doesn't allow being shown inside other pages, but the cloud browser can open it."
              : "This site only allows itself to be shown in its own tab."}
          </p>
          {cloudNote && <p className="note">{cloudNote}</p>}
          <div className="choices">
            {cloudReady && (
              <button type="button" className="primary" onClick={() => openCloud(current)}>
                <Cloud size={15} /> Open in cloud browser
              </button>
            )}
            {page.alternative && (
              <button type="button" className="secondary" onClick={() => go(page.alternative.url)}>
                {page.alternative.label}
              </button>
            )}
            <a
              href={current}
              target="_blank"
              rel="noopener noreferrer"
              className={cloudReady ? "secondary" : "primary"}
            >
              Open in a new tab <ExternalLink size={14} />
            </a>
          </div>
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
              {cloudReady && (
                <button type="button" onClick={() => openCloud(current)}>
                  <Cloud size={12} /> Try the cloud browser
                </button>
              )}
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
