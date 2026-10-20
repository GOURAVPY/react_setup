import { Code, Globe } from "lucide-react";
import { dockApps, locations, socials, techStack } from "../constants/indax";

// What Spotlight (Spotlight.jsx) can find: the apps, the projects, the
// skills, the résumé and "about me", and the links. Built from the same
// constants as the rest of the site, so new projects and skills show up here
// by themselves.
//
// An entry is { id, section, title, subtitle, icon, action }:
//   icon    { app, image } an app icon, { src, bg } a picture (on a colour),
//           or { glyph } a lucide icon
//   action  { type: "app", id }, { type: "folder", location },
//           { type: "window", id, data }, { type: "link", href }
//           or { type: "search", query }

// other words a visitor might use for each app
const APP_WORDS = {
  finder: "projects work finder folders",
  safari: "safari web internet browse google youtube",
  photos: "photos pictures images gallery",
  contact: "email hire message reach talk",
  terminal: "terminal tech stack skills command",
  arcade: "games pacman play fun",
  pixie: "pet pixel assistant ai chat",
  music: "music songs player play audio sound playlist chiptune",
  settings: "preferences wallpaper theme dark light dock",
  trash: "trash bin deleted",
  book: "book about me story everything pixel bio who developer",
};

const SECTIONS = ["Apps", "Projects", "Work", "Skills", "Documents", "Links"];
const PER_SECTION = 5;

const firstSentence = (text = "") => text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;

const entry = ({ words = "", text = "", ...rest }) => ({
  ...rest,
  // lower-cased once, for matching
  find: {
    title: rest.title.toLowerCase(),
    titleWords: rest.title.toLowerCase().split(/[\s/._-]+/),
    words: words.toLowerCase().split(/\s+/),
    text: text.toLowerCase(),
  },
});

const apps = dockApps.map(({ id, name, icon }) =>
  entry({
    id: `app-${id}`,
    section: "Apps",
    title: name,
    subtitle: "Application",
    words: `${id} application app ${APP_WORDS[id] ?? ""}`,
    icon: { app: id, image: icon },
    action: { type: "app", id },
  }),
);

// project folders: my own, and the company work from my job
const folders = (location, section, words) =>
  location.children.map((project) => {
    const about = project.children?.find(({ fileType }) => fileType === "txt");
    const description = about?.description ?? [];
    return entry({
      id: `project-${project.id}`,
      section,
      title: project.name,
      subtitle: firstSentence(description[0]) || "Project",
      words,
      text: description.join(" "),
      icon: { src: "/images/folder.png" },
      action: { type: "folder", location: project },
    });
  });

const projects = folders(locations.work, "Projects", "project");
const work = locations.company
  ? folders(locations.company, "Work", "project work job company app building studio")
  : [];

const skills = techStack.flatMap(({ category, items }) =>
  items.map((skill) =>
    entry({
      id: `skill-${skill}`,
      section: "Skills",
      title: skill,
      subtitle: category,
      words: `${category} skill tech stack`,
      icon: { glyph: Code },
      action: { type: "app", id: "terminal" },
    }),
  ),
);

const aboutMe = locations.about.children.find(({ fileType }) => fileType === "txt");
const documents = [
  entry({
    id: "resume",
    section: "Documents",
    title: "Resume",
    subtitle: "PDF document",
    words: "pdf document cv résumé experience education hire",
    icon: { app: "resume", image: "pdf.png" },
    action: { type: "app", id: "resume" },
  }),
  ...(aboutMe
    ? [
        entry({
          id: "about-me",
          section: "Documents",
          title: "About me",
          subtitle: aboutMe.subtitle ?? "Text document",
          words: "text document bio who developer profile",
          text: aboutMe.description?.join(" "),
          icon: { src: "/images/txt.png" },
          action: { type: "window", id: "txtfile", data: aboutMe },
        }),
      ]
    : []),
];

const links = socials.map(({ id, text, icon, bg, link }) =>
  entry({
    id: `link-${id}`,
    section: "Links",
    title: text,
    subtitle: link.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    words: "social profile link",
    text: link,
    icon: { src: icon, bg },
    action: { type: "link", href: link },
  }),
);

const EVERYTHING = [...apps, ...projects, ...work, ...skills, ...documents, ...links];

// shown before anything is typed: what a recruiter most likely wants
const SUGGESTIONS = [
  documents[0],
  apps.find(({ action }) => action.id === "book"),
  ...work,
  ...projects,
  apps.find(({ action }) => action.id === "terminal"),
  apps.find(({ action }) => action.id === "contact"),
].filter(Boolean);

// how well one typed word matches an entry: 0 is not at all
const wordScore = ({ find }, word) => {
  if (find.title === word) return 100;
  if (find.title.startsWith(word)) return 80;
  if (find.titleWords.some((part) => part.startsWith(word))) return 60;
  if (find.title.includes(word)) return 40;
  if (find.words.some((part) => part.startsWith(word))) return 30;
  // descriptions only for longer words: "res" shouldn't find "restaurants"
  if (word.length > 3 && find.text.includes(word)) return 10;
  return 0;
};

// every typed word has to match somewhere
const score = (item, words) => {
  let total = 0;
  for (const word of words) {
    const points = wordScore(item, word);
    if (!points) return 0;
    total += points;
  }
  return total;
};

/**
 * The results for what's typed, in sections: [{ title, items }]. The
 * section with the best match comes first, so the top hit is the first row.
 * Anything typed also offers a web search, last.
 */
export const searchSpotlight = (query) => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [{ title: "Suggestions", items: SUGGESTIONS }];

  const sections = SECTIONS.map((title) => {
    const items = EVERYTHING.filter((item) => item.section === title)
      .map((item) => ({ item, points: score(item, words) }))
      .filter(({ points }) => points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, PER_SECTION);
    return { title, items: items.map(({ item }) => item), best: items[0]?.points ?? 0 };
  })
    .filter(({ items }) => items.length)
    .sort((a, b) => b.best - a.best);

  const typed = query.trim();
  sections.push({
    title: "Web",
    items: [
      {
        id: "web-search",
        title: `Search the web for “${typed}”`,
        subtitle: "Opens in the Browser",
        icon: { glyph: Globe },
        action: { type: "search", query: typed },
      },
    ],
  });
  return sections;
};

// the keys that open Spotlight, as this device writes them. On a Mac the
// system's own Spotlight takes ⌘ Space before the page sees it, so ⌘K.
export const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform ?? navigator.platform ?? "");
export const shortcutLabel = () => (isMac() ? "⌘K" : "Ctrl+Space");
