import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";
import Windowwappre from "../hoc/Windowwappre";
import { Windowcontrols } from "../components";
import useWindowStore from "../store/window";
import useLaunchApp from "../store/launch";
import { changeTheme } from "../store/theme";
import { isMobile } from "../utils/device";
import { COMMAND_NAMES, INTRO, runCommand } from "./terminalCommands";

const PROMPT = "@gourav %";

const TICK = 30; // ms between animation frames
const COMMAND_CHAR_TIME = 70; // ms per character when the intro types a command
const STATUS_DURATION = 900; // ms for a progress pill to fill
const STATUS_STEP = 90; // the pill fills in uneven jumps, like real progress
const TYPE_CHAR_TIME = 16; // ms per character of a reply…
const TYPE_MAX_TIME = 1100; // …but a long reply never takes longer than this

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOut = (t) => 1 - (1 - t) ** 3;

const lineLength = ({ label, text }) => (label?.length ?? 0) + text.length;

let nextEntryId = 0;

const finish = (entry) =>
  entry.phase === "done"
    ? entry
    : {
        ...entry,
        phase: "done",
        started: true,
        commandTyped: entry.command?.length ?? 0,
        progress: 100,
        typed: entry.chars,
      };

// One block on screen: an optional prompt line, an optional progress pill
// and the reply. It plays through its phases in order:
// "command" (intro only, types the command) → "working" (fills the pill)
// → "typing" (types the reply) → "done"
const makeEntry = ({
  command = null,
  status = null,
  lines = [],
  onDone = null,
  rule = false,
  delay = 0,
  typeCommand = false,
  intro = false,
}) => {
  const entry = {
    id: nextEntryId++,
    intro,
    command,
    status,
    lines,
    onDone,
    rule: rule || Boolean(status),
    delay,
    chars: lines.reduce((total, line) => total + lineLength(line), 0),
    phase: typeCommand ? "command" : status ? "working" : "typing",
    startedAt: null,
    started: false, // drawn only once its turn has come
    commandTyped: 0,
    progress: 0,
    typed: 0,
  };
  return reducedMotion() ? finish(entry) : entry;
};

// Moves the first unfinished entry forward to `now`
const advance = (entries, now) => {
  const index = entries.findIndex(({ phase }) => phase !== "done");
  if (index === -1) return entries;

  const entry = { ...entries[index] };
  if (entry.startedAt === null) entry.startedAt = now + entry.delay;
  const elapsed = now - entry.startedAt;

  const nextPhase = (phase) => {
    entry.phase = phase;
    entry.startedAt = now;
  };

  if (elapsed >= 0) entry.started = true;

  if (elapsed < 0) {
    // still waiting for its turn; only remember when it starts
  } else if (entry.phase === "command") {
    entry.commandTyped = Math.min(
      entry.command.length,
      Math.floor(elapsed / COMMAND_CHAR_TIME),
    );
    if (elapsed >= entry.command.length * COMMAND_CHAR_TIME + 350) {
      nextPhase(entry.status ? "working" : "typing");
    }
  } else if (entry.phase === "working") {
    const duration = entry.status.duration ?? STATUS_DURATION;
    const stepped = Math.floor(elapsed / STATUS_STEP) * STATUS_STEP;
    entry.progress = Math.min(
      100,
      Math.round(100 * easeOut(Math.min(1, stepped / duration))),
    );
    if (elapsed >= duration + 150) {
      entry.progress = 100;
      nextPhase("typing");
    }
  } else if (entry.phase === "typing") {
    const duration = Math.min(TYPE_MAX_TIME, entry.chars * TYPE_CHAR_TIME);
    entry.typed = duration
      ? Math.floor(entry.chars * Math.min(1, elapsed / duration))
      : entry.chars;
    if (entry.typed >= entry.chars) nextPhase("done");
  }

  const updated = [...entries];
  updated[index] = entry;
  return updated;
};

// Small made-up "tokens processed" counter shown next to the pill
const tokenCount = ({ chars, progress }) =>
  `${Math.max(0.1, (chars * 1.7 * progress) / 100 / 1000).toFixed(1)}k`;

const StatusPill = ({ entry }) => {
  const { symbol, verb, percent = true } = entry.status;
  const working = entry.phase === "working";

  return (
    <p className="status">
      <span className="symbol">{symbol}</span>
      <span className={clsx("pill", working && "working")}>
        <span
          className="fill"
          style={{ width: percent ? `${entry.progress}%` : "100%" }}
        />
        <span className="pill-text">
          {verb}…{percent && ` ${entry.progress}%`}
        </span>
      </span>
      {entry.chars > 0 && <span className="count">{tokenCount(entry)}</span>}
    </p>
  );
};

// The reply, typed out up to `entry.typed` characters
const Reply = ({ entry }) => {
  const done = entry.phase === "done";
  let remaining = entry.typed;
  const shown = [];

  for (const [i, line] of entry.lines.entries()) {
    if (!done && remaining <= 0) break;
    const length = lineLength(line);
    const visible = done ? length : Math.min(length, remaining);
    remaining -= visible;

    const labelLength = line.label?.length ?? 0;
    const label = line.label?.slice(0, visible);
    const text = line.text.slice(0, Math.max(0, visible - labelLength));
    const typing = !done && (visible < length || remaining <= 0);

    shown.push(
      <p
        key={i}
        className={clsx(
          "out",
          line.tone,
          line.bullet && "bullet",
          line.label && "labelled",
        )}
      >
        {line.bullet && <span className="marker">▶</span>}
        {line.label && <span className="out-label">{label}</span>}
        <span className="out-text">
          {line.href && done ? (
            <a href={line.href} target="_blank" rel="noopener noreferrer">
              {text}
            </a>
          ) : (
            text
          )}
          {typing && <span className="caret" />}
        </span>
      </p>,
    );
  }

  return shown;
};

const Terminal = () => {
  const isOpen = useWindowStore((state) => state.windows.terminal.isOpen);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const launch = useLaunchApp();

  const container = useRef(null);
  const inputRef = useRef(null);
  const finishedIds = useRef(new Set()); // entries whose onDone has run

  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState("");
  const [past, setPast] = useState([]); // previous commands, for ↑ and ↓
  const [pastIndex, setPastIndex] = useState(null);
  const [wasOpen, setWasOpen] = useState(false);

  // Opening the window starts a fresh session with the intro; closing it
  // ends the session. Done while rendering, so the first frame of an open
  // window already has the intro rather than flashing an empty prompt.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    setEntries(
      isOpen
        ? INTRO.map((block) =>
            makeEntry({
              ...block,
              intro: true,
              typeCommand: Boolean(block.command),
            }),
          )
        : [],
    );
    setInput("");
    setPastIndex(null);
  }

  const animating = entries.some(({ phase }) => phase !== "done");
  // the prompt is handed over once the intro has played
  const ready =
    isOpen && !entries.some(({ intro, phase }) => intro && phase !== "done");

  // One timer drives whichever entry is playing. setInterval rather than
  // requestAnimationFrame, which stops when the tab is in the background.
  useEffect(() => {
    if (!animating) return;
    const timer = setInterval(
      () => setEntries((list) => advance(list, performance.now())),
      TICK,
    );
    return () => clearInterval(timer);
  }, [animating]);

  // Run each finished entry's action (open an app, switch theme…) once
  useEffect(() => {
    entries.forEach(({ id, phase, onDone }) => {
      if (phase !== "done" || !onDone || finishedIds.current.has(id)) return;
      finishedIds.current.add(id);
      onDone();
    });
  }, [entries]);

  // Focus the prompt once it is enabled. Not on a phone, where focusing
  // would pop the keyboard up uninvited.
  useEffect(() => {
    if (ready && !isMobile()) inputRef.current?.focus({ preventScroll: true });
  }, [ready]);

  // keep the newest output in view
  useLayoutEffect(() => {
    const el = container.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const clear = () => setEntries([]);

  const actions = {
    launch,
    clear,
    close: () => closeWindow("terminal"),
    // the new theme spreads out from the prompt
    setTheme: (mode) => changeTheme(mode, inputRef.current),
  };

  // a new command finishes anything still playing, then starts its own block
  const addEntry = (entry) =>
    setEntries((list) => [...list.map(finish), makeEntry(entry)]);

  const submit = (e) => {
    e.preventDefault();
    const typed = input;
    setInput("");
    setPastIndex(null);

    if (!typed.trim()) return addEntry({ command: "" });

    setPast((list) => [...list, typed]);
    const result = runCommand(typed, actions);
    // `clear` empties the screen itself, so it leaves nothing behind
    if (typed.trim().toLowerCase() !== "clear") {
      addEntry({ command: typed, ...result });
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!past.length) return;
      e.preventDefault();
      const from = pastIndex ?? past.length;
      const index = e.key === "ArrowUp" ? Math.max(0, from - 1) : from + 1;

      if (index >= past.length) {
        setPastIndex(null);
        setInput("");
      } else {
        setPastIndex(index);
        setInput(past[index]);
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const word = input.trim().toLowerCase();
      if (!word || word.includes(" ")) return;
      const matches = COMMAND_NAMES.filter((name) => name.startsWith(word));
      if (matches.length === 1) setInput(`${matches[0]} `);
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      clear();
      return;
    }

    // Ctrl+C abandons the line, like a real shell
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      addEntry({ command: `${input}^C` });
      setInput("");
      setPastIndex(null);
    }
  };

  // clicking anywhere in the terminal puts you back at the prompt, unless
  // you were selecting text to copy
  const focusPrompt = () => {
    if (ready && !window.getSelection()?.toString()) {
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <>
      <div id="window-header">
        <Windowcontrols target="terminal" />
        <h2>Tech Stack</h2>
      </div>
      <div className="techstack" ref={container} onClick={focusPrompt}>
        {entries
          .filter(({ started }) => started)
          .map((entry) => (
          <Fragment key={entry.id}>
            {entry.command !== null && (
              <p className="prompt-line">
                <span className="prompt">{PROMPT}</span>{" "}
                {entry.phase === "command" ? (
                  <>
                    {entry.command.slice(0, entry.commandTyped)}
                    <span className="cursor" />
                  </>
                ) : (
                  entry.command
                )}
              </p>
            )}

            {entry.phase !== "command" && (
              <>
                {entry.rule && <hr className="rule" />}
                {entry.status && <StatusPill entry={entry} />}
                {entry.phase !== "working" && <Reply entry={entry} />}
              </>
            )}
          </Fragment>
        ))}

        <form
          className={clsx("next-prompt", !ready && "invisible")}
          onSubmit={submit}
        >
          <label>
            <span className="prompt">{PROMPT}</span>{" "}
            <span className="typed">{input}</span>
            <span className="cursor" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal command"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              disabled={!ready}
            />
          </label>
        </form>
      </div>
    </>
  );
};

const TerminalWindow = Windowwappre(Terminal, "terminal");

export default TerminalWindow;
