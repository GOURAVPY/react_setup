const navLinks = [
  {
    id: 1,
    name: "Projects",
    type: "finder",
  },
  {
    id: 3,
    name: "Contact",
    type: "contact",
  },
  {
    id: 4,
    name: "Resume",
    type: "resume",
  },
];

const navIcons = [
  {
    id: 1,
    img: "/icons/wifi.svg",
  },
  {
    id: 2,
    img: "/icons/search.svg",
  },
  {
    id: 3,
    img: "/icons/user.svg",
  },
  {
    id: 4,
    img: "/icons/mode.svg",
  },
];

const dockApps = [
  {
    id: "finder",
    name: "Portfolio", // was "Finder"
    icon: "finder.png",
    canOpen: true,
  },
  {
    id: "safari",
    name: "Browser", // was "Safari"
    icon: "safari.png",
    canOpen: true,
  },
  {
    id: "photos",
    name: "Gallery", // was "Photos"
    icon: "photos.png",
    canOpen: true,
  },
  {
    id: "contact",
    name: "Contact", // or "Get in touch"
    icon: "contact.png",
    canOpen: true,
  },
  {
    id: "terminal",
    name: "Skills", // was "Terminal"
    icon: "terminal.png",
    canOpen: true,
  },
  {
    id: "arcade",
    name: "Arcade",
    icon: "arcade.svg",
    canOpen: true,
  },
  {
    id: "music",
    name: "Music",
    icon: "music.svg",
    canOpen: true,
  },
  {
    id: "pixie",
    name: "Pixie",
    icon: "pixie.svg",
    canOpen: true,
  },
  {
    id: "book",
    name: "Gourav's Book",
    icon: "book.svg",
    canOpen: true,
  },
  {
    id: "settings",
    name: "Settings",
    icon: "settings.svg",
    canOpen: true,
  },
  {
    id: "trash",
    name: "Archive", // was "Trash"
    icon: "trash.png",
    canOpen: true,
  },
];

const blogPosts = [
  {
    id: 1,
    date: "Sep 2, 2025",
    title:
      "TypeScript Explained: What It Is, Why It Matters, and How to Master It",
    image: "/images/blog1.png",
    link: "https://jsmastery.com/blog/typescript-explained-what-it-is-why-it-matters-and-how-to-master-it",
  },
  {
    id: 2,
    date: "Aug 28, 2025",
    title: "The Ultimate Guide to Mastering Three.js for 3D Development",
    image: "/images/blog2.png",
    link: "https://jsmastery.com/blog/the-ultimate-guide-to-mastering-three-js-for-3d-development",
  },
  {
    id: 3,
    date: "Aug 15, 2025",
    title: "The Ultimate Guide to Mastering GSAP Animations",
    image: "/images/blog3.png",
    link: "https://jsmastery.com/blog/the-ultimate-guide-to-mastering-gsap-animations",
  },
];

const techStack = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "Vite", "Tailwind CSS", "Ant Design", "GSAP"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "REST APIs", "MongoDB (Mongoose)"],
  },
  {
    category: "AI & Video",
    items: ["Claude API", "Gemini API", "AI document reading", "Remotion"],
  },
  {
    category: "Tools",
    items: ["Git", "GitHub", "Docker", "Render", "Postman"],
  },
  {
    category: "AI coding tools",
    items: ["Claude Code", "Codex", "Cursor", "Base44"],
  },
];

const socials = [
  {
    id: 1,
    text: "Github",
    icon: "/icons/github.svg",
    bg: "#f4656b",
    link: "https://github.com/JavaScript-Mastery-Pro",
  },
  {
    id: 2,
    text: "Platform",
    icon: "/icons/atom.svg",
    bg: "#4bcb63",
    link: "https://jsmastery.com/",
  },
  {
    id: 3,
    text: "Twitter/X",
    icon: "/icons/twitter.svg",
    bg: "#ff866b",
    link: "https://x.com/jsmasterypro",
  },
  {
    id: 4,
    text: "LinkedIn",
    icon: "/icons/linkedin.svg",
    bg: "#05b6f6",
    link: "https://www.linkedin.com/company/javascriptmastery/posts/?feedView=all",
  },
];

const photosLinks = [
  {
    id: 1,
    icon: "/icons/gicon1.svg",
    title: "Library",
  },
  {
    id: 2,
    icon: "/icons/gicon2.svg",
    title: "Memories",
  },
  {
    id: 3,
    icon: "/icons/file.svg",
    title: "Places",
  },
  {
    id: 4,
    icon: "/icons/gicon4.svg",
    title: "People",
  },
  {
    id: 5,
    icon: "/icons/gicon5.svg",
    title: "Favorites",
  },
];

const gallery = [
  {
    id: 1,
    img: "/images/gal1.png",
  },
  {
    id: 2,
    img: "/images/gal2.png",
  },
  {
    id: 3,
    img: "/images/gal3.png",
  },
  {
    id: 4,
    img: "/images/gal4.png",
  },
];

export {
  navLinks,
  navIcons,
  dockApps,
  blogPosts,
  techStack,
  socials,
  photosLinks,
  gallery,
};

// where a folder's files sit inside Finder, in reading order, three to a row
const FILE_SPOTS = [
  "top-6 left-6",
  "top-6 left-[200px]",
  "top-6 left-[380px]",
  "top-[150px] left-6",
  "top-[150px] left-[200px]",
  "top-[150px] left-[380px]",
  "top-[294px] left-6",
  "top-[294px] left-[200px]",
  "top-[294px] left-[380px]",
];

// A project folder in Finder: a .txt saying what it is, then its screenshots
// (`images`, kept in public/images/projects) and its links.
// `position` places the folder inside Finder, `windowPosition` on the desktop.
const project = ({ id, name, position, windowPosition, subtitle, description, images = [], links = [] }) => ({
  id,
  name,
  icon: "/images/folder.png",
  kind: "folder",
  position,
  windowPosition,
  children: [
    { name: `${name}.txt`, icon: "/images/txt.png", kind: "file", fileType: "txt", subtitle, description },
    ...images.map((image) => ({
      name: image.name,
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: image.src,
    })),
    ...links.map((link) => ({
      name: link.name,
      icon: "/images/safari.png",
      kind: "file",
      fileType: "url",
      href: link.href,
    })),
  ].map((file, i) => ({ id: i + 1, position: FILE_SPOTS.at(i), ...file })),
});

// Company projects say whose they are
const AT_STUDIO =
  "A company project: it belongs to App Building Studio, where I built it as a Full-Stack Developer (AI), 2026–present.";

// my own projects
const WORK_LOCATION = {
  id: 1,
  type: "work",
  name: "Projects",
  icon: "/icons/work.svg",
  kind: "folder",
  children: [
    project({
      id: 14,
      name: "Live City 3D",
      position: "top-6 left-6",
      windowPosition: "top-[12vh] left-7",
      subtitle: "Every train in London, live, in 3D",
      description: [
        "A 3D map of London where about 500 Tube, Elizabeth line and Overground trains move along the real track, under the streets and over the viaducts, with every aircraft overhead too.",
        "TfL doesn't publish where its trains are, only countdowns such as “train 241 reaches Warren Street in 95 seconds”. I work backwards from those countdowns to a point on the real track, then animate every train between updates.",
        "Click a train to see its next stops and follow it with the camera, or a station for its live departures board. Scrub back through the last 24 hours at up to 600x, with delay alerts, day and night by London's real sunset, and a phone layout.",
        "Tech: React, TypeScript, MapLibre GL, Three.js, Node.js, Express, Socket.IO, TfL open data, OpenStreetMap track data.",
      ],
      images: [
        { name: "rush-hour.jpg", src: "/images/projects/live-city-rush-hour.jpg" },
        { name: "follow-a-train.jpg", src: "/images/projects/live-city-follow.jpg" },
      ],
      links: [
        { name: "Code on GitHub", href: "https://github.com/GOURAVPY/3d-UK-" },
        { name: "Demo video", href: "https://github.com/GOURAVPY/3d-UK-/blob/main/docs/demo/demo.mp4" },
      ],
    }),
    project({
      id: 15,
      name: "AI Interview Coach",
      position: "top-6 left-[200px]",
      windowPosition: "top-[12vh] left-32",
      subtitle: "Practise your interview for a job abroad with an AI that talks back",
      description: [
        "A live voice interviewer that speaks with you in English, German, Japanese, Dutch, French or Spanish. It asks questions for the job you choose, follows up on your answers, and gives you a scored report at the end.",
        "The report has a score out of 100, feedback and a stronger example answer for each question, your filler words and speaking speed. A coding round has AI-written problems with hidden tests, hints and a review.",
        "I built it to prepare for working abroad. The voice streams straight to Gemini Live so replies feel instant, the API key never reaches the browser, and voice time is capped so the bill stays small.",
        "Tech: React, TypeScript, Vite, CodeMirror 6, Gemini Live API, Node.js, Express, Zod, MongoDB, JWT login.",
      ],
      images: [
        { name: "interview-room.jpg", src: "/images/projects/interview-room.jpg" },
        { name: "report.jpg", src: "/images/projects/interview-report.jpg" },
        { name: "progress.jpg", src: "/images/projects/interview-progress.jpg" },
        { name: "coding-round.jpg", src: "/images/projects/interview-coding-round.jpg" },
      ],
      links: [{ name: "Code on GitHub", href: "https://github.com/GOURAVPY/AI-Interview-Coach" }],
    }),
    project({
      id: 10,
      name: "AI Resume Builder",
      position: "top-6 left-[380px]",
      windowPosition: "top-[26vh] left-7",
      subtitle: "Write a résumé with AI and download it as a PDF",
      description: [
        "A full-stack résumé builder with AI help: write and improve your résumé with AI, then download it as a PDF.",
        "Accounts with secure login keep each résumé saved, so it can be edited later.",
        "Tech: React, Redux Toolkit, Tailwind CSS, Motion, Node.js, Express, MongoDB (Mongoose), JWT login, OpenAI API, ImageKit, PDF.js.",
      ],
      links: [
        { name: "ai-resume-buiding.vercel.app", href: "https://ai-resume-buiding.vercel.app" },
        { name: "Code on GitHub", href: "https://github.com/GOURAVPY/AI-RESUME-BUIDING" },
      ],
    }),
  ],
};

// what I've built at my job: these belong to the company
const COMPANY_LOCATION = {
  id: 13,
  type: "company",
  name: "Work",
  icon: "/icons/company.svg",
  kind: "folder",
  children: [
    project({
      id: 6,
      name: "AI App Builder",
      position: "top-6 left-6",
      windowPosition: "top-[12vh] left-7",
      subtitle: "Builds SaaS apps and websites from a plain-language prompt",
      description: [
        "A vibe-coding app builder: describe the app or website you want in plain words, and AI builds it, with a live preview as it goes.",
        "It creates working SaaS apps and websites, so people without a developer can turn an idea into a real product.",
        AT_STUDIO,
      ],
    }),
    project({
      id: 7,
      name: "AI UGC Video Generator",
      position: "top-6 left-[200px]",
      windowPosition: "top-[12vh] left-32",
      subtitle: "A platform that makes UGC-style videos with AI",
      description: [
        "An AI-powered platform for user-generated-content (UGC) style videos: the short, authentic-looking clips brands use in ads and social posts.",
        AT_STUDIO,
      ],
    }),
    project({
      id: 8,
      name: "AI Movie Generator",
      position: "top-6 left-[380px]",
      windowPosition: "top-[26vh] left-7",
      subtitle: "An app that generates movies with AI",
      description: ["An app that generates movies with AI.", AT_STUDIO],
    }),
    project({
      id: 9,
      name: "Custom Domain System",
      position: "top-[150px] left-6",
      windowPosition: "top-[26vh] left-32",
      subtitle: "Manages and connects custom domains",
      description: [
        "Domain systems for managing and connecting custom domains, so apps can go live on their own web address.",
        AT_STUDIO,
      ],
    }),
    project({
      id: 5,
      name: "Insurance Claim Verifier",
      position: "top-[150px] left-[200px]",
      windowPosition: "top-[40vh] left-7",
      subtitle: "Catches mistakes in hospital insurance claims before they're sent",
      description: [
        "A web tool for hospital and TPA claim staff. Upload a patient's claim documents, and it reads them with AI, checks each one for missing fields, and compares the details across documents.",
        "It catches things like a policy number that doesn't match between the bill and the insurance card, or “Jasvinder” on one form and “Jaswinder” on another, before the claim goes to the insurer.",
        "Every claim ends up Verified, Needs Correction or Incomplete. Possible mismatches are flagged for a person to confirm: it never approves or rejects a claim by itself.",
        "Tech: React 19, Vite, Ant Design, Node.js, Express 5, MongoDB (Mongoose), secure session login, Claude API for reading documents, Docker.",
        AT_STUDIO,
      ],
    }),
    project({
      id: 11,
      name: "Remotion Rendering Server",
      position: "top-[150px] left-[380px]",
      windowPosition: "top-[40vh] left-32",
      subtitle: "Renders React video templates into MP4s through an API",
      description: [
        "A server that turns React video templates into finished MP4 videos. Apps send it data through an API and get a rendered video back, so videos can be made automatically.",
        "Tech: Node.js, Remotion, FFmpeg.",
        AT_STUDIO,
      ],
    }),
    project({
      id: 12,
      name: "macOS Portfolio",
      position: "top-[294px] left-6",
      windowPosition: "top-[54vh] left-7",
      subtitle: "The site you're using right now",
      description: [
        "A macOS-style desktop in the browser: a dock, windows that pour in and out, Spotlight search, light and dark modes, a Pac-Man arcade, and a real web browser that streams a cloud Chrome for sites that can't be shown in a frame.",
        "Pixie, the pixel girl, is an AI guide: she chats with visitors using the Gemini API and decides for herself what to do next.",
        "Tech: React 19, Vite, Tailwind CSS, GSAP, Zustand, Node.js, Gemini API, Hyperbeam.",
        AT_STUDIO,
      ],
    }),
  ],
};

const ABOUT_LOCATION = {
  id: 2,
  type: "about",
  name: "About me",
  icon: "/icons/info.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-5",
      imageUrl: "/images/adrian.jpg",
    },
    {
      id: 2,
      name: "casual-me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-28 right-72",
      imageUrl: "/images/adrian-2.jpg",
    },
    {
      id: 3,
      name: "conference-me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-52 left-80",
      imageUrl: "/images/adrian-3.jpeg",
    },
    {
      id: 4,
      name: "about-me.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-60 left-5",
      subtitle: "Meet the Developer Behind the Code",
      image: "/images/adrian.jpg",
      description: [
        "Hey! I’m Adrian 👋, a web developer who enjoys building sleek, interactive websites that actually work well.",
        "I specialize in JavaScript, React, and Next.js—and I love making things feel smooth, fast, and just a little bit delightful.",
        "I’m big on clean UI, good UX, and writing code that doesn’t need a search party to debug.",
        "Outside of dev work, you'll find me tweaking layouts at 2AM, sipping overpriced coffee, or impulse-buying gadgets I absolutely convinced myself I needed 😅",
      ],
    },
  ],
};

const RESUME_LOCATION = {
  id: 3,
  type: "resume",
  name: "Resume",
  icon: "/icons/file.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "Resume.pdf",
      icon: "/images/pdf.png",
      kind: "file",
      fileType: "pdf",
      // you can add `href` if you want to open a hosted resume
      // href: "/your/resume/path.pdf",
    },
  ],
};

const TRASH_LOCATION = {
  id: 4,
  type: "trash",
  name: "Trash",
  icon: "/icons/trash.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "trash1.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-10",
      imageUrl: "/images/trash-1.png",
    },
    {
      id: 2,
      name: "trash2.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-40 left-80",
      imageUrl: "/images/trash-2.png",
    },
  ],
};

export const locations = {
  work: WORK_LOCATION,
  company: COMPANY_LOCATION,
  about: ABOUT_LOCATION,
  resume: RESUME_LOCATION,
  trash: TRASH_LOCATION,
};

const INITIAL_Z_INDEX = 1000;

const WINDOW_CONFIG = {
  finder: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  contact: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  resume: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  safari: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  photos: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  terminal: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  arcade: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  pixie: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  settings: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  book: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  music: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  txtfile: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
  imgfile: {
    isOpen: false,
    isMaximized: false,
    isMinimized: false,
    zIndex: INITIAL_Z_INDEX,
    data: null,
  },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG };
