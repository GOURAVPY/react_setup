// Everything Gourav and someone special say when the visitor picks them as
// their companion (Companions.jsx). Pixie's own lines are in lines.js. A line
// is a string, or { text, pose } to strike a pose while saying it ("raise"
// waves, "give" holds out his book, "jump" hops). Edit freely.

// her name, once Gourav shares it
export const HER_NAME = "Someone special";
// Gourav's cleaning robot
export const ROBOT_NAME = "Robo";
// her blue parakeet ("neel" is blue), on her easel
export const BIRD_NAME = "Neel";
// what he squawks when clicked, or now and then: a parakeet repeats what he hears
export const BIRD_SAYS = [
  "Pretty! Pretty! 🎨",
  "Gourav! Gourav! 💕",
  "Pretty bird! 💙",
  "Love him! Love him! 💕",
  "Hello! Hello! 👋",
  "Paint! Paint! 🖌️",
];
// when the Music app starts playing, he dances (castThings.js), and says so;
// his own song gets its own squawk, and she cheers him on
export const BIRD_DANCES = ["Dance! Dance! 💃", "Music! Music! 🎶", "Shake! Shake! 🎶"];
export const BIRD_OWN_SONG = "My song! My song! 🎶";
export const BIRD_DANCING = [`Look, ${BIRD_NAME}'s dancing! 💃`, `${BIRD_NAME} loves this one 💙`, `Go, ${BIRD_NAME}, go! 🎶`];
// and sometimes she answers him
export const BIRD_REPLY = [`${BIRD_NAME}, shh! 😆`, "He taught you that, didn't he? 💕", `Good bird, ${BIRD_NAME} 💙`];

// their names and who they are, for name tags and their app in the dock
export const CAST_NAMES = { gourav: "Gourav", her: HER_NAME };
export const CAST_ROLES = { gourav: "Your guide · the developer", her: "Your guide · someone special" };

// their hello the first time in a visit, after walking in
export const HELLO = {
  gourav: [
    { text: "Hey, I'm Gourav 👋 I built this desktop, and I'll show you around!", pose: "raise" },
    `Click me any time for a tip. And say hi to ${ROBOT_NAME}, my cleaning robot 🤖`,
  ],
  her: [
    { text: "Hi! I'm someone special 🌸 I'll be your guide today!", pose: "raise" },
    `Click me any time for a tip. And say hi to ${BIRD_NAME}, my parakeet!`,
  ],
};

// picked later in the visit, from Pixie's app
export const PICKED = {
  gourav: { text: "You picked me? Great! 👋 Click me any time for a tip.", pose: "raise" },
  her: { text: "Yay, you picked me! 🌸 Click me any time for a tip.", pose: "raise" },
};

// a click on them: a tip, then something about them, and so on
export const TIPS = {
  gourav: [
    "Everything opens from the dock at the bottom. Start with Portfolio!",
    "Drag a window by its title bar. Yellow sends it to the dock, green makes it full screen.",
    "Press Ctrl+Space (⌘K on a Mac) to search the whole desktop.",
    "The Skills terminal is real. Type help!",
    "Settings changes the wallpaper, the theme and the sounds.",
    "The Browser really browses. Search for anything.",
    "Need a break? The Arcade has Pac-Man.",
    "Want a different guide? Pixie's app in the dock lets you choose again.",
  ],
  her: [
    "Start with Portfolio in the dock. That's all his work!",
    "Windows drag by the top bar. The green button makes them big.",
    "Lost? The magnifier at the top right finds anything.",
    "Open the Skills terminal and type help. He's so proud of it 😄",
    "His résumé is in the dock. It even downloads!",
    "Gourav's book is in the dock. It's all about him 📖",
    "Contact has all his links. Go on, say hi!",
    "Want a different guide? Pixie's app in the dock lets you choose again.",
  ],
};

export const ABOUT = {
  gourav: [
    "I'm a full-stack developer. I build web apps with React, Node and a bit of AI.",
    "Open Portfolio in the dock to see what I've built.",
    "Live City 3D and AI Interview Coach are my own projects. Have a look!",
    "My résumé is in the dock, if you're hiring 😄",
    { text: "I put everything about me in a book. It's in the dock too 📖", pose: "give" },
    "That desk is where all of this got built. Coffee included ☕",
    "She paints while I code. Best team there is 💕",
    "I'd love to work abroad one day, anywhere the work is exciting ✈️",
    { text: "Want to build something together? Contact has every way to reach me.", pose: "raise" },
  ],
  her: [
    "He stayed up so many nights making this desktop 🌙",
    "Make sure he takes breaks, okay? He forgets 💕",
    "I paint while he codes. Want to see what I'm painting? 🎨",
    `${BIRD_NAME} is my parakeet. He talks more than I do 💙`,
    "Pixie's my little buddy. We read Gourav's book together 📖",
    { text: "The Arcade has Pac-Man. I always beat his high score 😏", pose: "jump" },
    "Settings can change the wallpaper. Pick a pretty one! 🌸",
    "If you're hiring: he's really good. I'm not biased. Okay, maybe a little 💕",
  ],
};

// to themselves, now and then
export const MUSINGS = {
  gourav: [
    "Hmm, one more feature…",
    "Note to self: commit more often.",
    "I wonder what to build next 🤔",
    "One more bug, then I'll call her 💕",
  ],
  her: [
    "La la la ♪",
    `${BIRD_NAME}, stop pecking my brush! 💙`,
    "What should I paint next? 🎨",
    "I hope he's eating properly 💕",
  ],
};

// a song starts in the Music app: she dances…
export const DANCE_LINES = {
  her: ["Dance with me! 💃", "My favourite! 🎶", "Music! Let's dance 💕"],
};
// …and Gourav doesn't: music helps him focus, and back to work he goes
export const MUSIC_FOCUS = [
  "Music's good. It helps me focus 🎧",
  "Good music, good code 🎧",
  "Ahh, coding music. Time to focus 🎧",
];

// his cleaning robot (castThings.js), when clicked
export const ROBOT_LINES = [
  `That's ${ROBOT_NAME}! He keeps my floor clean 🤖`,
  `Beep boop! ${ROBOT_NAME}'s on cleaning duty.`,
  `${ROBOT_NAME} does the cleaning so I can code 😄`,
];

// called over from their app in the dock
export const CALLED = {
  gourav: ["You called? 👋", "I'm here! What's up?", "Need a hand? 👋"],
  her: ["Coming! 🌸", "Hi again! Need me?", "Here I am! 🌸"],
};

// picked up by the visitor, and put down again
export const HELD = {
  gourav: ["Whoa! Put me down 😅", "Hey, I can walk, you know!", "Okay, okay, where are we going?"],
  her: ["Eek! 😆", "Wheee! Okay, that's fun!", "Careful, I'm holding a paintbrush! 🎨"],
};
export const DROPPED = {
  gourav: ["Phew. Back to work.", "Ten out of ten landing 😄", "My code better still be there…"],
  her: ["Ta-da! Safe landing 🌸", "Again! Again! 😆", "Hehe, that was fun!"],
};

// a reading break: he takes a book from his shelf, reads it a while (with
// thoughts about it), and puts it back
export const READ_START = ["Time for a little reading 📖", "Let me look something up… 📚", "A quick read, then back to code 📖"];
export const READ_THOUGHTS = [
  "Hmm, interesting… 📖",
  "One more chapter, then back to work",
  "So that's how it works! 💡",
  "She'd love this part 💕",
  "Must remember this one 🧠",
];
export const READ_DONE = ["Good book. Back to work!", "Learned something new today 💡", "Back on the shelf you go 📚"];

// his bookshelf, when clicked: then his book opens
export const SHELF_LINES = [
  "My bookshelf! Here, read my book 📖",
  "Lots of code books… and one about me 📚",
  "That's where my book lives. Have a look 📖",
];

// their things (castThings.js), when clicked
export const THING_LINES = {
  desk: ["My laptop. This whole site was built on it 💻", "Shh, I'm in the zone 😄", "The code's on my GitHub. The link is in Contact!"],
  mug: ["Coffee: fuel for code ☕", "Still hot! ☕", "Careful, that's my third cup ☕"],
  machine: ["My coffee machine. Best thing I own ☕", "That's where all my energy comes from ☕", "One mug, coming up… later ☕"],
  easel: ["Not finished yet. No peeking! 🎨", "It's coming along… 🎨", "Guess what it's going to be!"],
  easelDone: ["Do you like it? 🎨", "Not bad, right? 😊", "I'll start a new one soon!"],
};

// what's on their minds while they work, in thought bubbles. Gourav mostly
// thinks about coffee: then he has a sip, and when his mug is empty he takes
// it to his coffee machine and fills it up.
export const COFFEE_THOUGHTS = [
  "Coffee… ☕",
  "Mmm, coffee ☕",
  "Just one more sip ☕",
  "Is it coffee o'clock? ☕",
  "Coffee first, bugs later ☕",
  "This code needs coffee ☕",
];
export const EMPTY_MUG = ["Hmm, my mug's empty… ☕", "Out of coffee! ☕", "Need. More. Coffee. ☕"];
export const CODE_THOUGHTS = [
  "Why does this work? 🤔",
  "Missing a semicolon somewhere…",
  "Just one more commit…",
  "Hmm, a CSS bug.",
  "This function needs a better name.",
];
// getting up for more, and back with a full mug
export const COFFEE_RUN = ["Coffee run! ☕", "Refill time ☕", "Be right back, coffee ☕"];
export const FRESH_COFFEE = ["Ahh, fresh coffee ☕", "Much better ☕", "Now where was I… ☕"];
// her, at her easel
export const PAINT_THOUGHTS = [
  "Hmm, a little more pink? 🎨",
  `${BIRD_NAME} would like this one 💙`,
  "Needs more sunshine ☀️",
  "This one's for him 💕",
];

// thinking of each other, lovingly, with a little picture in the bubble
// (thoughtArt.js): what the other one might be doing right now, or his gifts
// to her, her bead bracelet and the half-heart necklace they each wear half
// of. A list of pictures means one of them, at random.
export const THINKING_OF = {
  gourav: [
    { text: "I wonder what she's doing right now… 💕", picture: ["herPainting", "herWave", "bird"] },
    { text: "I hope she's had something to eat today 🍲", picture: "herWave" },
    { text: "I miss her smile. Back to work, then I'll call her 💕", picture: "herWave" },
    { text: "She's probably painting something beautiful again 🎨", picture: "herPainting" },
    { text: `I hope ${BIRD_NAME} is keeping her company 💙`, picture: "bird" },
    { text: "Every bug feels smaller when I think of her 💕", picture: "herWave" },
    { text: "Her half of our heart… I hope she's wearing it today 💕", picture: "necklace" },
    { text: "I picked that bracelet just for her. I hope she loves it ✨", picture: "bracelet" },
    { text: `I bet ${BIRD_NAME} is squawking my name to her again 💕`, picture: "bird" },
  ],
  her: [
    { text: "I wonder what he's doing right now… 💕", picture: ["himCoding", "himCoffee", "himWave"] },
    { text: "I hope he's not skipping meals for code again 🍲", picture: "himCoding" },
    { text: "Too much coffee, Gourav! Drink some water too 💧", picture: "himCoffee" },
    { text: "He works so hard. I hope he takes a little rest 💕", picture: "himCoding" },
    { text: "I'm so proud of him 💕", picture: "himWave" },
    { text: "I'll paint him next, with a big heart around him 🎨", picture: "himWave" },
    { text: "My half of our heart. I keep it close 💕", picture: "necklace" },
    { text: "He gave me this bracelet. I never take it off ✨", picture: "bracelet" },
    { text: `${BIRD_NAME} says "Gourav!" all day. I wonder who taught him that 💕`, picture: "bird" },
  ],
};

// Gourav, done at his desk for now (sometimes)
export const DESK_DONE = ["Pushed it! 🚀", "Bug fixed. Next! 😅", "Tests are green ✅", "Done for now. Time to check on her 💕"];

// her, finishing a painting (castArt.js PAINTINGS)
export const PAINTED = {
  flower: "Ta-da! A flower 🌸",
  heart: "Ta-da! A heart 💕",
  sun: "Ta-da! A little sunshine ☀️",
  bird: `Ta-da! It's ${BIRD_NAME} 💙`,
};

// said when an app opens
export const APP_LINES = {
  gourav: {
    finder: "My projects! My own are in Projects, my company work is in Work.",
    safari: "A real browser inside the site. That one took a while 😅",
    photos: "The gallery. Click any photo to see it big.",
    contact: "Here's how to reach me. I reply fast!",
    terminal: "My tech stack, as a terminal. Type help.",
    arcade: "Pac-Man! Arrow keys to move. Good luck 😄",
    settings: "Make it yours: wallpaper, icons, sounds.",
    pixie: "That's my app! What I'm up to, and how much coffee I've had ☕",
    resume: "My résumé. There's a download button at the top.",
    book: "My book! Click the pages to turn them 📖",
    music: "My songs! Coffee & Code is my coding song ☕",
  },
  her: {
    finder: "His projects! The ones in Projects he made all by himself.",
    safari: "Yes, it's a real browser. He wouldn't stop talking about it 😆",
    photos: "Ooh, photos! Click one to see it big.",
    contact: "Message him, he'd love that 💕",
    terminal: "Type help. He made the terminal talk 🤓",
    arcade: "Pac-Man! I'm still the champion 😏",
    settings: "Pick a pretty wallpaper! 🌸",
    pixie: "My app! My paintings are in there too 🎨",
    resume: "His résumé. Hire him, okay? 😄",
    book: "His book! I've read it twice 📖",
    music: "Play Half a Heart. He wrote it for me 💕",
  },
};
