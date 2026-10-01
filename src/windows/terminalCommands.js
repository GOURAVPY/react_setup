import dayjs from "dayjs";
import { locations, socials, techStack } from "../constants/indax";

// Commands the Skills terminal understands. Each command's `run` gets the
// words typed after it and a few actions from the terminal, and returns the
// lines to print. A line is { text, tone, label, href }:
//   tone   colours the line: "muted", "success", "error" or "accent"
//   label  an aligned green column in front of the text
//   href   turns the text into a link

const line = (text, tone) => ({ text, tone });

// app names a visitor can type after `open`, and the window each one opens
const APPS = {
  portfolio: "finder",
  finder: "finder",
  articles: "safari",
  blog: "safari",
  safari: "safari",
  gallery: "photos",
  photos: "photos",
  contact: "contact",
  resume: "resume",
  settings: "settings",
  trash: "trash",
};

const APP_NAMES = "portfolio, articles, gallery, contact, resume, settings";

const THEMES = ["light", "dark", "system"];

export const COMMANDS = {
  help: {
    description: "List the commands you can run",
    run: () => [
      line("Available commands:", "muted"),
      ...Object.entries(COMMANDS)
        .filter(([, command]) => !command.hidden)
        .map(([name, { usage, description }]) => ({
          label: usage ?? name,
          text: description,
        })),
      line("Tip: Tab completes a command, ↑ and ↓ go through history.", "muted"),
    ],
  },

  about: {
    description: "A little about me",
    run: () => {
      const aboutMe = locations.about.children.find(
        ({ fileType }) => fileType === "txt",
      );
      return aboutMe.description.map((paragraph) => line(paragraph));
    },
  },

  skills: {
    description: "My tech stack",
    run: () =>
      techStack.map(({ category, items }) => ({
        label: `✓ ${category}`,
        text: items.join(", "),
      })),
  },

  projects: {
    description: "Projects I have built",
    run: () => [
      ...locations.work.children.map(({ name }, i) =>
        line(`${i + 1}. ${name}`),
      ),
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
    run: () =>
      socials.map(({ text, link }) => ({
        label: text,
        text: link.replace(/^https?:\/\/(www\.)?/, ""),
        href: link,
      })),
  },

  open: {
    usage: "open <app>",
    description: "Open an app, e.g. open resume",
    run: ([name], { launch }) => {
      if (!name) return [line(`usage: open <app>  (${APP_NAMES})`, "error")];

      const key = name.toLowerCase();
      if (["skills", "terminal"].includes(key)) {
        return [line("You're already here.", "muted")];
      }
      if (!APPS[key]) {
        return [
          line(`open: no app called "${name}". Try: ${APP_NAMES}`, "error"),
        ];
      }

      // after the line has printed, so the reply shows before the app opens
      setTimeout(() => launch(APPS[key]), 250);
      return [line(`Opening ${key}…`, "success")];
    },
  },

  theme: {
    usage: "theme <mode>",
    description: "Switch to light, dark or system appearance",
    run: ([mode], { setTheme }) => {
      const value = mode?.toLowerCase();
      if (!THEMES.includes(value)) {
        return [line(`usage: theme <${THEMES.join("|")}>`, "error")];
      }
      setTheme(value);
      return [line(`Appearance set to ${value}.`, "success")];
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
    run: (_, { close }) => {
      setTimeout(close, 300);
      return [line("Saving session… completed.", "muted")];
    },
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

// Runs one line of input and returns the lines to print
export const runCommand = (input, actions) => {
  const [name, ...args] = input.trim().split(/\s+/);
  const command = COMMANDS[name.toLowerCase()];

  if (!command) {
    return [
      line(`zsh: command not found: ${name}`, "error"),
      line("Type `help` to see what you can run.", "muted"),
    ];
  }
  return command.run(args, actions);
};
