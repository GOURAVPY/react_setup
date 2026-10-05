import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Hyperbeam, { getRegionInfo } from "@hyperbeam/web";
import { ExternalLink, Loader2 } from "lucide-react";
import clsx from "clsx";
import { endCloud, startCloud } from "./cloud";

// The cloud browser inside the Browser window: a real Chrome running at
// Hyperbeam, streamed in like a video you can click and type into. It opens
// at `startUrl`; after that the Browser's own toolbar drives it through the
// ref (navigate, back, forward, reload) or the `request` prop. It can start
// hidden (`warm`) while the visitor is still typing, so it's ready sooner.
// The session ends when this unmounts, when the page closes, or when its time
// runs out (server/cloudBrowser.js).

const PROBLEMS = {
  month: "The cloud browser has used up its free time for this month.",
  visitor: "You've started a few cloud sessions already. Try again in a little while.",
};
const PROBLEM = "The cloud browser couldn't start right now.";

// Hyperbeam's limits on the picture size
const MIN_SIDE = 256;
const MAX_AREA = 1920 * 1080;

// a picture size matching the window: smaller pictures stream faster, and
// pixel for pixel text stays sharp
const fitScreen = (element, maxArea = MAX_AREA) => {
  const box = element?.getBoundingClientRect();
  if (!box || box.width < 300 || box.height < 200) return { width: 1280, height: 800 };
  let width = Math.round(box.width);
  let height = Math.round(box.height);
  const scale = Math.min(1, Math.sqrt(maxArea / (width * height)));
  width = Math.max(MIN_SIDE, Math.floor((width * scale) / 2) * 2);
  height = Math.max(MIN_SIDE, Math.floor((height * scale) / 2) * 2);
  return { width, height };
};

/**
 * @param startUrl   the page to open first
 * @param warm       started early and kept hidden until it's wanted
 * @param request    { url, seq }: open this page (a new seq opens it again)
 * @param paused     stop the video while the window is in the dock
 * @param onPage     ({ url, title }) whenever the page changes
 * @param onSession  ({ id, endsAt }) once the session has started
 * @param onEnd      (reason) when the session ends by itself
 */
const CloudBrowser = forwardRef(function CloudBrowser(
  { startUrl, warm = false, request, paused, onPage, onSession, onEnd },
  ref,
) {
  const screen = useRef(null);
  const client = useRef(null);
  const firstUrl = useRef(startUrl);
  const callbacks = useRef({ onPage, onSession, onEnd });
  // the pages seen, for back and forward: the cloud browser's own history
  // leaves out pages opened from the address bar
  const trail = useRef({ pages: [], at: -1, jumping: false });
  // an address asked for before the cloud browser could take it
  const waiting = useRef(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState("starting"); // starting, connecting, playing, reconnecting
  const [problem, setProblem] = useState(null);

  useEffect(() => {
    callbacks.current = { onPage, onSession, onEnd };
  });

  const open = (url) => {
    if (client.current) client.current.tabs.update({ url });
    else waiting.current = url;
  };

  // the cloud browser's own back/forward first, else the pages seen here
  const step = (by) => {
    const tabs = client.current?.tabs;
    if (!tabs) return;
    (by < 0 ? tabs.goBack() : tabs.goForward()).catch(() => {
      const t = trail.current;
      const at = t.at + by;
      if (at < 0 || at >= t.pages.length) return;
      t.at = at;
      t.jumping = true;
      tabs.update({ url: t.pages[at] });
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      navigate: open,
      back: () => step(-1),
      forward: () => step(1),
      reload: () => client.current?.tabs.reload(),
    }),
    [],
  );

  // a page asked for through the props (when a warm session is put to use)
  const requestSeq = request?.seq;
  const requestUrl = request?.url;
  useEffect(() => {
    if (requestUrl) open(requestUrl);
  }, [requestSeq, requestUrl]);

  useEffect(() => {
    let cancelled = false;
    let session = null;
    let hb = null;
    const leave = () => session && endCloud(session.id);
    window.addEventListener("pagehide", leave);

    // a moment's wait, so React's development double-mount doesn't start two
    const timer = setTimeout(async () => {
      try {
        // the nearest servers, and Google and YouTube in the visitor's country
        let place = {};
        try {
          place = await getRegionInfo();
        } catch {
          // the server picks a region
        }
        session = await startCloud(firstUrl.current, {
          region: place.region,
          country: place.country,
          language: navigator.languages?.join(",") || navigator.language,
          ...fitScreen(screen.current),
        });
        if (cancelled) return endCloud(session.id);
        callbacks.current.onSession?.(session);

        hb = await Hyperbeam(screen.current, session.embedUrl, {
          adminToken: session.adminToken,
          timeout: 20_000,
          // keys only go to the cloud browser once it's clicked
          delegateKeyboard: false,
          onDisconnect: ({ type }) => callbacks.current.onEnd?.(type),
          onConnectionStateChange: ({ state: next }) => setState(next),
        });
        if (cancelled) {
          hb.destroy();
          return;
        }
        client.current = hb;
        setReady(true);
        if (waiting.current) {
          hb.tabs.update({ url: waiting.current });
          waiting.current = null;
        }
        hb.tabs.onUpdated.addListener((tabId, change, tab) => {
          if (tab?.active === false || !(change.url || change.title)) return;
          const t = trail.current;
          if (change.url && t.jumping) t.jumping = false;
          else if (change.url && t.pages[t.at] !== change.url) {
            t.pages = [...t.pages.slice(0, t.at + 1), change.url];
            t.at = t.pages.length - 1;
          }
          callbacks.current.onPage?.({ url: change.url ?? tab?.url, title: change.title ?? tab?.title });
        });
      } catch (error) {
        if (cancelled) return;
        setProblem(PROBLEMS[error.code] ?? PROBLEM);
        leave();
        session = null;
      }
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("pagehide", leave);
      hb?.destroy();
      client.current = null;
      leave();
    };
  }, []);

  // the picture follows the window's size (full screen, back again)
  useEffect(() => {
    if (!ready || warm) return;
    let timer = null;
    const fit = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const hb = client.current;
        if (!hb) return;
        const { width, height } = fitScreen(screen.current, hb.maxArea || MAX_AREA);
        if (width === hb.width && height === hb.height) return;
        try {
          hb.resize(width, height);
        } catch {
          // a size it won't take: it keeps the old one
        }
      }, 300);
    };
    const watcher = new ResizeObserver(fit);
    watcher.observe(screen.current);
    fit();
    return () => {
      clearTimeout(timer);
      watcher.disconnect();
    };
  }, [ready, warm]);

  // no need to stream video into a window that's in the dock, or into one
  // that's warming up out of sight
  useEffect(() => {
    if (client.current) client.current.videoPaused = paused || warm;
  }, [paused, warm, state]);

  return (
    <div className={clsx("page cloud", warm && "warming")} aria-hidden={warm || undefined}>
      <div ref={screen} className="cloud-screen" />
      {problem ? (
        <div className="cloud-overlay">
          <p>{problem}</p>
          <a href={requestUrl ?? startUrl} target="_blank" rel="noopener noreferrer">
            Open in a new tab <ExternalLink size={14} />
          </a>
        </div>
      ) : (
        (!ready || state === "reconnecting") && (
          <div className="cloud-overlay" aria-live="polite">
            <Loader2 className="spin" size={22} />
            <p>{state === "reconnecting" ? "Reconnecting…" : "Starting a cloud browser…"}</p>
          </div>
        )
      )}
    </div>
  );
});

export default CloudBrowser;
