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
  "The Browser really browses: try Wikipedia, or search for anything.",
  "Contact has every way to reach Gourav. Say hi!",
  "Gourav gave me a book all about him 📖 It's right there in the dock!",
  "You can pick me up and drop me anywhere. Wheee!",
  "Double-click me for a little twirl ✨",
  "My bed is in the corner. Click it and I might take a nap!",
  "Click my ball to kick it, then watch me chase it!",
  "My ball is magic! Switch to dark mode and watch it ✨",
  "Chompy, my plant beast, only eats flies and drinks water. Rub his head to pet him! 🌱",
];

export const GREETINGS = ["Hi there!", "Hello! 💕", "Need a hand? Click me!", "Oh, hi!"];

export const WAKE = ["Huh? Oh! I wasn't sleeping…", "Yawn… hi again!", "Zz… oh! Hello!"];

export const PICKED_UP = ["Wheee!", "Whoa, up we go!", "Hey, put me down! 😆"];

export const LANDED = ["Phew!", "Ta-da, safe landing!", "Again! Again!"];

export const TWIRL = ["✨ Ta-da! ✨", "Twirl! 💃", "La la la ♪"];

export const CALLED = ["You called? ✨", "I'm here! What's up?"];

// said when an app opens (one at most every few seconds)
export const APP_COMMENTS = {
  finder: "That's the portfolio: Gourav's projects, and company work in the Work folder!",
  safari: "A real browser! Try Wikipedia, or search for something.",
  photos: "The gallery! Click a photo to see it big.",
  contact: "Want to work together? All the links are here!",
  terminal: "The terminal! Type help to see what it can do.",
  arcade: "Game time! Arrow keys to move. Can you beat the high score?",
  settings: "Make yourself at home: wallpaper, icons, sounds, all here.",
  pixie: "Hey, that's my room! Come in! 💕",
  music: "Music! Play Through the Portal, that one's mine ✨",
  resume: "Gourav's résumé! There's a download button at the top.",
  book: "That's the book Gourav gave me! Click the pages to turn them 📖",
};

// her magic ball, a present from Gourav: a ball by day, a flying lamp by
// night. The story is told the first time a visitor sees it change.
export const LAMP_STORY = [
  "Ooh, night time! Watch my ball… ✨",
  "Gourav gave it to me. It's magic!",
  "By day it's a ball. At night it's a lamp that flies around with me 💡",
];
export const LAMP_ON = ["Lamp on! ✨", "Night time, little lamp! 💡", "Look, my ball's a lamp again ✨"];
export const LAMP_CLICKED = [
  "My magic lamp! Gourav gave it to me ✨",
  "It follows me around all night 💡",
  "Wheee, look at it fly!",
];

// a song starts in the Music app, and she dances
export const MUSIC_ON = ["Ooh, music! 🎶", "I love this one! 💃", "Dance party! ✨"];

export const THEME_COMMENTS = {
  dark: "Lights off! 🌙 So cosy.",
  light: "Good morning! ☀️",
};

// her AI brain (src/components/pixie/brain.js): the chat box in her bubble
// out of her portal (PortalStory.jsx): the first time, before she says hello…
export const ARRIVED = "Whoa… so this is Gourav's home? A computer?! ✨";
// …and after her story is replayed from her app
export const STORY_AGAIN = "…and that's how I got here! Home sweet desktop 🏡";

// picked as the visitor's companion later, from her app
export const PICKED = "Yay, you picked me! ✨ I'll show you around!";

export const CHAT_INTRO ="Got a question about Gourav? Click me and ask! 💬";

export const ASK = [
  "What would you like to know? 💬",
  "Ask me anything about Gourav! 💬",
  "Curious about something? Ask away!",
];

export const BRAIN_TIRED = "Phew, that's a lot of questions! Let me rest a little 😅";

export const BRAIN_DOWN = "Oops, my brain is napping 😴 Try again soon, or open Contact!";

// her things: bed, slingshot, ball, plant
export const BEDTIME = ["Nap time… 😴", "Just five more minutes…", "So cosy! Zz"];

export const BULLSEYE = ["Bullseye! ✨", "Hehe, got it!", "Ping! ✦"];

export const BALL_KICKED = ["Hey, my ball! 😆", "Ooh, I'll get it!", "Catch me if you can!"];

export const WATERING = ["Drink up, Chompy! 💧", "Here you go, Chompy 🌱", "Splish splash 💧"];

export const PLANT_GREW = "Look, Chompy grew! 🌱✨";

// Chompy, her plant beast (beast.js): when visitors pet him, and when he
// snaps at a fly
// she and Chompy shake hands (her hand, his leaf) when she comes over
export const SHAKE_CHOMPY = ["Hi Chompy! 🤝", "Leaf shake! 🌱🤝", "Best friends 💚", "How are you today, Chompy?"];
export const BEAST_PET = ["He's purring! 💚", "So soft… for a beast 😆", "Chompy loves pets!"];
export const BEAST_ATE = ["Gulp! Chompy caught one 😋", "Nice catch, Chompy!", "A fly snack! Yum 🪰"];
export const BEAST_SNAP =["Missed again, Chompy! 😆", "Those flies are too quick for him!", "Chompy, leave the flies alone!"];

// when she doesn't like the light or dark mode, she shoots the switch
export const TOO_BRIGHT = ["Too bright! My eyes! 😎", "Way too bright in here…"];

export const TOO_DARK = ["It's too dark, I can't see my book! 💡", "Who turned off the lights?"];

export const MUCH_BETTER = ["Much better! ✨", "Ahh, that's nicer!"];

export const YOU_WIN = "Okay, okay, you win! 😅";
