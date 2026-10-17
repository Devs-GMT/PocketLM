// What Pocket, the landing page guide, says: the opening greeting, one line per section,
// the guided tour and its reactions. Claims stay true: PocketLM stamps a study proof on
// BOT Chain (testnet for now), notes stay in the browser and go to the AI only to make
// the study kit.

const pickOne = (a) => a[Math.floor(Math.random() * a.length)];

const VISIT_KEY = "pocketlm-guide-visited";

// Decided once per page load: effects can run more than once (React dev double-run, hiding and
// showing the guide again), and only the first look at storage tells a new visitor from a returning one.
let returningVisitor;

/** Whether this browser had been here before this page load (and remembers this visit). */
export function markVisit() {
  if (returningVisitor !== undefined) return returningVisitor;
  try {
    returningVisitor = localStorage.getItem(VISIT_KEY) !== null;
    localStorage.setItem(VISIT_KEY, String(Date.now()));
  } catch {
    returningVisitor = false;
  }
  return returningVisitor;
}

/** The opening line, by the visitor's local time and whether they have been here before. */
export function greeting(returning, hour = new Date().getHours()) {
  if (hour >= 22 || hour < 4) {
    return returning ? "Up late? Me too! Welcome back. Double-click me for a quick tour." : "Up late? Me too! I'm Pocket. Paste your notes and I'll help you study.";
  }
  const time = hour < 11 ? "Good morning!" : hour < 17 ? "Good afternoon!" : "Good evening!";
  return returning ? `${time} Welcome back! Double-click me any time for a quick tour.` : `${time} I'm Pocket! Paste your notes and I'll help you study.`;
}

/** Where Pocket likes to stand (fractions of the viewport) and what it says on arrival. */
export const GUIDE = {
  hero: { at: { x: 0.09, y: 0.52 }, line: "Hi, I'm Pocket! Paste your notes and I'll help you study." },
  how: { at: { x: 0.12, y: 0.44 }, line: "Four small steps: add notes, get your kit, quiz yourself, stamp it." },
  "step-1": { line: "Step one: paste text or drop in a short PDF. It's read right in your browser." },
  "step-2": { line: "Step two: you get a summary and 5 key points, and I can read the summary out loud." },
  "step-3": { line: "Step three: ask questions (answers come only from your notes) and try the quiz." },
  "step-4": { line: "Step four: finish the quiz and stamp your score as a study proof on BOT Chain." },
  privacy: { at: { x: 0.07, y: 0.4 }, line: "Your notes never go on-chain. Only a fingerprint, the title and your score do." },
  faq: { at: { x: 0.12, y: 0.4 }, line: "Got a question? Open one, I'll nod along." },
  cta: { at: { x: 0.2, y: 0.46 }, line: "Ready? Open your notebook and we'll study together!" },
};

/**
 * The tour: one stop per section, the four steps get a stop each. `target` is what to scroll
 * to, `beside` makes Pocket stand next to that element instead of its usual spot for the section.
 */
export const TOUR = [
  { key: "hero", target: "#top", line: "This is PocketLM. Paste your notes and I'll turn them into a study kit.", ms: 3600 },
  { key: "step-1", target: "#step-1", beside: true, line: GUIDE["step-1"].line, ms: 4200 },
  { key: "step-2", target: "#step-2", beside: true, line: GUIDE["step-2"].line, ms: 4200 },
  { key: "step-3", target: "#step-3", beside: true, line: GUIDE["step-3"].line, ms: 4200 },
  { key: "step-4", target: "#step-4", beside: true, line: GUIDE["step-4"].line, ms: 4400 },
  { key: "privacy", target: "#privacy", line: GUIDE.privacy.line, ms: 3800 },
  { key: "faq", target: "#faq", line: "Still curious? Quick answers live here.", ms: 2800 },
  { key: "cta", target: "#start", line: "That's the tour! Open your notebook and give it a try.", ms: 3200 },
];

/** How long a line stays up: enough time to read it. */
export const readMs = (text) => Math.round(2600 + text.length * 32);

export const ABOUT_LINE = "I turn your notes into a summary, key points and a quiz. Finish it and you can stamp a study proof on BOT Chain.";
export const STAMP_LINE = "Only the title, a fingerprint of your notes and your score get stamped. Never the notes themselves.";

export const PET_LINES = ["Hehe… that's nice.", "Aww, more please!", "Okay, now I'm blushing.", "Best. Pat. Ever."];
export const FAQ_LINES = ["Good question!", "Ooh, I wondered that too.", "Smart thing to ask!", "Good one, read on!"];
export const BACK_LINES = ["You're back! I missed you.", "There you are! I kept your page warm.", "Oh hi! Welcome back."];
export const WANDER = ["Just exploring!", "Don't mind me, I'm looking around.", "La la la…", "So much to see here!"];
export const CLICK_LINES = [
  ["happy", "Hehe, that tickles!"],
  ["surprised", "Whoa! Hi there!"],
  ["wink", "Psst, your notes stay in your browser!"],
  ["love", "You're my favorite student!"],
  ["spin", "Wheee!"],
];

/** Hovering or pressing a button that leads into the app. */
export const HOVER_LINES = ["Yes! Open it and paste your notes.", "Go on, your notebook is waiting!"];
