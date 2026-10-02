// Everything Pixie says. Edit freely: each list is picked from at random,
// except TIPS, which she goes through in order so nothing repeats too soon.

export const INTRO = [
  "Hi! I'm Pixie 👋 Welcome to Gourav's desktop!",
  "Click any app in the dock to open it. I'll be around if you need me!",
];

// how the portfolio works, one tip per click
export const TIPS = [
  "Open apps from the dock at the bottom of the screen.",
  "Drag a window by its title bar to move it around.",
  "The yellow button sends a window to the dock. Watch it pour in!",
  "The green button makes a window full screen. The dock hides away.",
  "Try the Skills terminal and type help. It's really interactive!",
  "Portfolio is a Finder: projects live in folders, and it has search too.",
  "Settings lets you change the wallpaper, theme, icons and sounds.",
  "The switch at the top right of the menu bar flips light and dark mode.",
  "Need a break? Arcade has a whole Pac-Man game inside!",
  "Contact has every way to reach Gourav. Say hi!",
  "You can pick me up and drop me anywhere. Wheee!",
  "Double-click me for a little twirl ✨",
];

export const GREETINGS = ["Hi there!", "Hello! 💕", "Need a hand? Click me!", "Oh, hi!"];

export const WAKE = ["Huh? Oh! I wasn't sleeping…", "Yawn… hi again!", "Zz… oh! Hello!"];

export const PICKED_UP = ["Wheee!", "Whoa, up we go!", "Hey, put me down! 😆"];

export const LANDED = ["Phew!", "Ta-da, safe landing!", "Again! Again!"];

export const TWIRL = ["✨ Ta-da! ✨", "Twirl! 💃", "La la la ♪"];

export const CALLED = ["You called? ✨", "I'm here! What's up?"];

// said when an app opens (one at most every few seconds)
export const APP_COMMENTS = {
  finder: "That's the portfolio. Projects are in the Work folder!",
  safari: "Ooh, articles! Good reading in there.",
  photos: "The gallery! Click a photo to see it big.",
  contact: "Want to work together? All the links are here!",
  terminal: "The terminal! Type help to see what it can do.",
  arcade: "Game time! Arrow keys to move. Can you beat the high score?",
  settings: "Make yourself at home: wallpaper, icons, sounds, all here.",
  pixie: "Hey, that's my room! Come in! 💕",
  resume: "Gourav's résumé! There's a download button at the top.",
};

export const THEME_COMMENTS = {
  dark: "Lights off! 🌙 So cosy.",
  light: "Good morning! ☀️",
};

// her AI brain (src/components/pixie/brain.js): the chat box in her bubble
export const CHAT_INTRO = "Got a question about Gourav? Click me and ask! 💬";

export const ASK = [
  "What would you like to know? 💬",
  "Ask me anything about Gourav! 💬",
  "Curious about something? Ask away!",
];

export const BRAIN_TIRED = "Phew, that's a lot of questions! Let me rest a little 😅";

export const BRAIN_DOWN = "Oops, my brain is napping 😴 Try again soon, or open Contact!";
