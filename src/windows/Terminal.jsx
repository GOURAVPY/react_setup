import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Flag } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { techStack } from "../constants/indax";
import Windowwappre from "../hoc/Windowwappre";
import { Windowcontrols } from "../components";
import useWindowStore from "../store/window";
import useLaunchApp from "../store/launch";
import { changeTheme } from "../store/theme";
import { isMobile } from "../utils/device";
import { COMMAND_NAMES, runCommand } from "./terminalCommands";

const COMMAND = "show tech stack";
const PROMPT = "@gourav % ";

let nextEntryId = 0;

const Terminal = () => {
  const isOpen = useWindowStore((state) => state.windows.terminal.isOpen);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const launch = useLaunchApp();

  const container = useRef(null);
  const command = useRef(null);
  const inputRef = useRef(null);

  const [entries, setEntries] = useState([]); // commands run and their output
  const [input, setInput] = useState("");
  const [cleared, setCleared] = useState(false); // `clear` also hides the intro
  const [ready, setReady] = useState(false); // the intro has finished
  const [past, setPast] = useState([]); // previous commands, for ↑ and ↓
  const [pastIndex, setPastIndex] = useState(null);

  // Every time the window opens it starts a fresh session
  useEffect(() => {
    if (isOpen) return;
    setEntries([]);
    setInput("");
    setCleared(false);
    setReady(false);
    setPastIndex(null);
  }, [isOpen]);

  // Replays every time the window opens: the command is typed out, then the
  // output prints line by line like a real terminal, then the prompt is
  // handed to the visitor
  useGSAP(
    () => {
      if (!isOpen) return;

      const typed = { length: 0 };
      command.current.textContent = "";
      gsap.set(".line, .next-prompt", { autoAlpha: 0 });
      gsap.set(".content", { borderColor: "transparent" });

      gsap
        .timeline({
          delay: 0.6,
          onComplete: () => setReady(true),
        })
        .to(typed, {
          length: COMMAND.length,
          duration: COMMAND.length * 0.07,
          ease: `steps(${COMMAND.length})`,
          onUpdate: () => {
            command.current.textContent = COMMAND.slice(
              0,
              Math.round(typed.length),
            );
          },
        })
        .set(".typing-cursor", { display: "none" }, "+=0.35")
        .to(".line", { autoAlpha: 1, duration: 0.01, stagger: 0.12 }, "+=0.15")
        .set(".content", { clearProps: "borderColor" }, "<0.12")
        .set(".next-prompt", { autoAlpha: 1 }, "+=0.2");
    },
    { dependencies: [isOpen], scope: container, revertOnUpdate: true },
  );

  // Hand over the prompt once it is enabled. Not on a phone, where focusing
  // would pop the keyboard up uninvited.
  useEffect(() => {
    if (ready && !isMobile()) inputRef.current?.focus({ preventScroll: true });
  }, [ready]);

  // keep the prompt in view as output grows
  useLayoutEffect(() => {
    const el = container.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, cleared]);

  const clear = () => {
    setEntries([]);
    setCleared(true);
  };

  const actions = {
    launch,
    clear,
    close: () => closeWindow("terminal"),
    setTheme: (mode) => changeTheme(mode),
  };

  const addEntry = (typed, lines = []) =>
    setEntries((list) => [...list, { id: nextEntryId++, command: typed, lines }]);

  const submit = (e) => {
    e.preventDefault();
    const typed = input;
    setInput("");
    setPastIndex(null);

    if (!typed.trim()) return addEntry("");

    setPast((list) => [...list, typed]);
    const lines = runCommand(typed, actions);
    // `clear` empties the screen itself, so it leaves nothing behind
    if (typed.trim().toLowerCase() !== "clear") addEntry(typed, lines);
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
      addEntry(`${input}^C`);
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
        <div className={clsx(cleared && "hidden")}>
          <p>
            <span>{PROMPT}</span>
            <span ref={command}>{COMMAND}</span>
            <span className="cursor typing-cursor" />
          </p>
          <div className="label line">
            <p className="w-32">Category</p>
            <p>Technologies</p>
          </div>
          <ul className="content">
            {techStack.map(({ category, items }) => (
              <li key={category} className="flex items-center line">
                <Check className="check" size={20} />
                <h3>{category}</h3>
                <ul>
                  {items.map((item, i) => (
                    <li key={i}>
                      {item}
                      {i < items.length - 1 ? "," : ""}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="footnote">
            <p className="line">
              <Check size={20} />
              {techStack.length} of {techStack.length} stacks loaded
              successfully
            </p>
            <p className="text-black line">
              <Flag size={15} fill="currentColor" />
              Render time : 6ms
            </p>
          </div>
          <p className="hint line">
            Type <b>help</b> to see what else you can run.
          </p>
        </div>

        {entries.map(({ id, command: typed, lines }) => (
          <div key={id} className="entry">
            <p>
              <span>{PROMPT}</span>
              {typed}
            </p>
            {lines.map(({ text, tone, label, href }, i) => (
              <p
                key={i}
                className={clsx("out", tone)}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                {label && <span className="out-label">{label}</span>}
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {text}
                  </a>
                ) : (
                  text
                )}
              </p>
            ))}
          </div>
        ))}

        <form className="next-prompt" onSubmit={submit}>
          <label>
            <span>{PROMPT}</span>
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
