import dayjs from "dayjs";
import { locations, socials, techStack } from "../constants/indax";
import { callPixie } from "../store/pixie";

// Commands the Skills terminal understands.
//
// A command's `run` gets the words typed after it and a few actions from the
// terminal, and returns either the lines to print or
// { lines, status, onDone } to override its status or act once the reply has
// finished typing (opening an app, switching theme).
//
// `status` is the progress pill shown before the reply:
//   { symbol, verb, duration, percent }  percent: false shows no percentage
//
// A line is { text, tone, label, href, bullet }:
//   tone    colours the line: "muted", "success", "error" or "accent"
//   label   an aligned bold column in front of the text
//   href    turns the text into a link
//   bullet  starts the line with a ▶ marker

const line = (text, tone) => ({ text, tone });

// app names a visitor can type after `open`, and the window each one opens
const APPS = {
  portfolio: "finder",
  finder: "finder",
  browser: "safari",
  web: "safari",
  internet: "safari",
  articles: "safari",
  safari: "safari",
  gallery: "photos",
  photos: "photos",
  contact: "contact",
  resume: "resume",
  settings: "settings",
  trash: "trash",
  arcade: "arcade",
  pixie: "pixie",
  game: "arcade",
  pacman: "arcade",
};

const APP_NAMES =
  "portfolio, browser, gallery, contact, resume, arcade, pixie, settings";

const THEMES = ["light", "dark", "system"];

const skillLines = () =>
  techStack.map(({ category, items }) => ({
    bullet: true,
    label: category,
    text: items.join(", "),
  }));

export const COMMANDS = {
  help: {
    description: "List the commands you can run",
    status: { symbol: "✦", verb: "Loading", duration: 450 },
    run: () => [
      ...Object.entries(COMMANDS)
        .filter(([, command]) => !command.hidden)
        .map(([name, { usage, description }]) => ({
          bullet: true,
          label: usage ?? name,
          text: description,
        })),
      line("Tab completes a command, ↑ and ↓ go through history.", "muted"),
    ],
  },

  about: {
    description: "A little about me",
    status: { symbol: "⌘", verb: "Profiling" },
    run: () => {
      const aboutMe = locations.about.children.find(
        ({ fileType }) => fileType === "txt",
      );
      return aboutMe.description.map((paragraph) => line(paragraph));
    },
  },

  skills: {
    description: "My tech stack",
    status: { symbol: "✦", verb: "Analysing" },
    run: skillLines,
  },

  projects: {
    description: "Projects I have built",
    status: { symbol: "✦", verb: "Indexing" },
    run: () => [
      ...locations.work.children.map(({ name }) => ({ bullet: true, text: name })),
      line("Run `open portfolio` to look inside them.", "muted"),
    ],
  },

  ls: {
    description: "List the folders on this Mac",
    run: () => [
      line(
        Object.values(locations)
          .map(({ name }) => `${name}/`)
          .join("    "),
        "accent",
      ),
    ],
  },

  contact: {
    description: "Where to find me",
    status: { symbol: "⌘", verb: "Connecting" },
    run: () =>
      socials.map(({ text, link }) => ({
        bullet: true,
        label: text,
        text: link.replace(/^https?:\/\/(www\.)?/, ""),
        href: link,
      })),
  },

  open: {
    usage: "open <app>",
    description: "Open an app, e.g. open resume",
    status: { symbol: "⌘", verb: "Launching", duration: 600 },
    run: ([name], { launch }) => {
      if (!name) {
        return {
          status: null,
          lines: [line(`usage: open <app>  (${APP_NAMES})`, "error")],
        };
      }

      const key = name.toLowerCase();
      if (["skills", "terminal"].includes(key)) {
        return { status: null, lines: [line("You're already here.", "muted")] };
      }
      if (!APPS[key]) {
        return {
          status: null,
          lines: [
            line(`open: no app called "${name}". Try: ${APP_NAMES}`, "error"),
          ],
        };
      }

      return {
        lines: [line(`${key} is ready.`, "success")],
        onDone: () => launch(APPS[key]),
      };
    },
  },

  theme: {
    usage: "theme <mode>",
    description: "Switch to light, dark or system appearance",
    status: { symbol: "✦", verb: "Repainting", duration: 600 },
    run: ([mode], { setTheme }) => {
      const value = mode?.toLowerCase();
      if (!THEMES.includes(value)) {
        return {
          status: null,
          lines: [line(`usage: theme <${THEMES.join("|")}>`, "error")],
        };
      }
      return {
        lines: [line(`Appearance set to ${value}.`, "success")],
        onDone: () => setTheme(value),
      };
    },
  },

  pixie: {
    description: "Call Pixie, the little guide",
    run: () => {
      callPixie();
      return [line("Pixie is on her way! ✨", "success")];
    },
  },

  whoami: {
    description: "Who you are logged in as",
    run: () => [line("guest — visiting gourav's portfolio")],
  },

  date: {
    description: "Show the date and time",
    run: () => [line(dayjs().format("ddd MMM D HH:mm:ss YYYY"))],
  },

  echo: {
    usage: "echo <text>",
    description: "Print some text",
    run: (words) => [line(words.join(" "))],
  },

  clear: {
    description: "Clear the screen (or press Ctrl+L)",
    run: (_, { clear }) => {
      clear();
      return [];
    },
  },

  exit: {
    description: "Close the terminal",
    status: { symbol: "⌘", verb: "Saving session", duration: 500 },
    run: (_, { close }) => ({
      lines: [line("[Process completed]", "muted")],
      onDone: () => setTimeout(close, 350),
    }),
  },

  sudo: {
    hidden: true,
    run: () => [
      line(
        "guest is not in the sudoers file. This incident will be reported.",
        "error",
      ),
    ],
  },
};

export const COMMAND_NAMES = Object.keys(COMMANDS);

// Runs one line of input. Returns { lines, status, onDone }.
export const runCommand = (input, actions) => {
  const [name, ...args] = input.trim().split(/\s+/);
  const command = COMMANDS[name.toLowerCase()];

  if (!command) {
    return {
      status: null,
      lines: [
        line(`zsh: command not found: ${name}`, "error"),
        line("Type `help` to see what you can run.", "muted"),
      ],
    };
  }

  const result = command.run(args, actions);
  const { lines, ...rest } = Array.isArray(result) ? { lines: result } : result;
  return { status: command.status ?? null, onDone: null, ...rest, lines };
};

// What plays each time the terminal opens, one block after another
export const INTRO = [
  {
    command: "show tech stack",
    status: { symbol: "✦", verb: "Analysing" },
    lines: skillLines(),
    delay: 600, // let the window finish opening first
  },
  {
    status: { symbol: "⌘", verb: "Initializing", percent: false, duration: 1100 },
    lines: [line("Let's build something great 🚀", "success")],
    delay: 250,
  },
  {
    rule: true,
    lines: [line("Type `help` to see what else you can run.", "muted")],
    delay: 200,
  },
];
