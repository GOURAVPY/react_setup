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
  lunch: ["She brought me lunch 🍱", "Steel tiffin. Still warm 🍲", "Don't touch, that's mine 😄"],
  bench: ["My favourite bench 🌳", "Gourav and I sit here sometimes 💕", "Come and sit, it's lovely here 🌸"],
  tree: ["My blossom tree 🌸", "It blooms all year here. A little magic ✨", `${BIRD_NAME} likes this tree too 💙`],
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
    { text: "Maybe I'll go and sit with her on her park bench 🌳", picture: "herWave" },
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

// her park bench (castThings.js): now and then she sits there a while, and
// often Gourav comes to sit with her. Lines with a who are said by that one
// (her, or Gourav visiting her).
export const BENCH_START = ["I'll sit in the park a while 🌳", "Such a lovely day for the park 🌸", "A little break on my bench 🌳"];
export const BENCH_THOUGHTS = [
  "The blossom smells so sweet today 🌸",
  "The breeze is so nice here 🍃",
  { text: "I wish he were here with me… 💕", picture: "himWave" },
  { text: "Maybe he'll come and sit with me 💕", picture: ["himWave", "himCoding"] },
  "I could sit here all day 🌳",
];
// he walks up to her bench
export const VISIT_HELLO = [
  "There you are! I was looking for you 💕",
  "Room on that bench for one more? 💕",
  "I needed a break. And I missed you 💕",
];
// what they talk about, side by side
export const VISIT_TALKS = [
  [
    { who: "her", text: "Gourav! You came 🌸" },
    { who: "gourav", text: "Of course. I missed you 💕" },
    { who: "her", text: "Did you eat today? The truth! 🍲" },
    { who: "gourav", text: "…I had coffee? 😅" },
    { who: "her", text: "Gourav! We're getting food after this 😤" },
  ],
  [
    { who: "gourav", text: "How's the painting going? 🎨" },
    { who: "her", text: "Slowly. I'm painting something for you 💕" },
    { who: "gourav", text: "For me? What is it?" },
    { who: "her", text: "It's a surprise. No peeking! 🙈" },
  ],
  [
    { who: "her", text: "You look tired. Coding late again?" },
    { who: "gourav", text: "Just one little bug… okay, a big one 😅" },
    { who: "her", text: "Rest your eyes a minute. Here, with me 💕" },
    { who: "gourav", text: "Okay. Just a minute 💕" },
  ],
  [
    { who: "gourav", text: "You're wearing it! Your half of our heart 💕" },
    { who: "her", text: "Always. And you're wearing yours 💕" },
    { who: "gourav", text: "Together, it's a whole heart ❤️" },
  ],
  [
    { who: "her", text: `${BIRD_NAME} learned a new word today` },
    { who: "gourav", text: "Let me guess… my name? 😄" },
    { who: "her", text: "How did you know?! 😆" },
    { who: "gourav", text: "He's a clever bird 💙" },
  ],
];
// and then a hug: one asks, and something said in it
export const HUG_ASK = [
  { who: "her", text: "Come here, you 🤗" },
  { who: "gourav", text: "Hug? 🤗" },
  { who: "her", text: "I need a hug 🤗" },
];
export const HUG_SAYS = [
  { who: "her", text: "I'm so glad you're here 💕" },
  { who: "gourav", text: "I'm always here for you 💕" },
  { who: "her", text: "Best part of my day 💕" },
  { who: "gourav", text: "You make everything better 💕" },
];
// back to work he goes
export const VISIT_BYE = [
  [
    { who: "gourav", text: "I should get back to my code… 💻" },
    { who: "her", text: "Go! But eat something first 🍲" },
  ],
  [
    { who: "gourav", text: "See you this evening? 💕" },
    { who: "her", text: "It's a date 🌸" },
  ],
  [
    { who: "gourav", text: "Back to work. I'll miss you 💕" },
    { who: "her", text: "Miss you already 💕" },
  ],
];
// once he's gone
export const AFTER_VISIT = [
  { text: "He came just to see me… 💕", picture: "himWave" },
  { text: "Best part of my day 💕", picture: "himWave" },
  { text: "Don't forget to eat, Gourav! 🍲", picture: "himCoding" },
];
// clicked while he's visiting: him, and her
export const VISIT_CLICK = {
  gourav: ["Hi! Just visiting her 💕", "Shh, we're on a little date 😄", "She's the best, isn't she? 💕"],
  her: ["Hehe, he came to see me 💕", "Isn't he sweet? 🌸", "We're having a little date 🌸"],
};
// she's carried off, or called away: off he goes
export const VISIT_CUT = ["Hey! Bring her back! 😄", "Okay, okay, back to work 😅", "See you later! 💕"];

// and the other way round: with Gourav as the companion, she comes to see
// him at his desk now and then, with lunch for him. (Their hug uses HUG_ASK
// and HUG_SAYS too.) What she says walking up:
export const DESK_VISIT_HELLO = ["Knock knock! 💕", "Surprise! 🌸", "Lunch delivery! 🍱"];
// what they talk about, him turned round in his chair
export const DESK_VISIT_TALKS = [
  [
    { who: "gourav", text: "Hey, you! What are you doing here? 💕" },
    { who: "her", text: "Bringing you lunch. I know you skipped it 🍱" },
    { who: "gourav", text: "…How did you know? 😅" },
    { who: "her", text: "I always know 💕" },
  ],
  [
    { who: "her", text: "How's the code going? 💻" },
    { who: "gourav", text: "One bug left. Then it's done!" },
    { who: "her", text: "You said that yesterday 😆" },
    { who: "gourav", text: "…It's a different bug 😅" },
  ],
  [
    { who: "gourav", text: "You came all this way? 💕" },
    { who: "her", text: "Of course. I missed you 💕" },
    { who: "her", text: "And I made your favourite 🍲" },
    { who: "gourav", text: "Best. Day. Ever 😄" },
  ],
  [
    { who: "her", text: "Is that your third coffee? ☕" },
    { who: "gourav", text: "…Second. Maybe fourth 😅" },
    { who: "her", text: "Water. Now 💧" },
    { who: "gourav", text: "Yes, ma'am 😄" },
  ],
  [
    { who: "her", text: `${BIRD_NAME} says hi! He misses you` },
    { who: "gourav", text: "Tell him I'll come by this evening 💙" },
    { who: "her", text: "Now he'll squawk your name all day 😆" },
  ],
];
// she has to go
export const DESK_VISIT_BYE = [
  [
    { who: "her", text: "Eat while it's warm, okay? 🍲" },
    { who: "gourav", text: "Promise. Thank you 💕" },
  ],
  [
    { who: "her", text: "I'll let you work. Don't stay up late! 🌙" },
    { who: "gourav", text: "I won't. See you tonight 💕" },
  ],
  [
    { who: "her", text: "Okay, back to my painting 🎨" },
    { who: "gourav", text: "Paint me something nice 💕" },
  ],
];
// back at work, he eats the lunch she brought
export const LUNCH_THOUGHTS = [
  { text: "She made my favourite 🍲 💕", picture: "herWave" },
  { text: "Best lunch ever. She's the best 💕", picture: "herWave" },
  { text: "Mmm… now I can code all day 🍱", picture: "herPainting" },
];
// clicked while she's visiting him: him, and her
export const DESK_VISIT_CLICK = {
  gourav: ["She came to see me! 💕", "She brought me lunch 🍱", "Isn't she the best? 💕"],
  her: ["Shh, I'm visiting him 💕", "Make sure he eats, okay? 🍲", "He works too hard, doesn't he? 💕"],
};
// he's carried off, or called away: off she goes
export const DESK_VISIT_CUT = ["Hey! Bring him back! 😄", "Okay, okay, I'll let you work 💕", "Eat your lunch! 🍱"];

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
