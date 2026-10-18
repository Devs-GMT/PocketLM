import Link from "next/link";
import { Lock, Fingerprint, Feather, Pencil } from "@/components/Icons";
import { MascotIcon } from "@/components/MascotArt";
import Listen from "@/components/landing/ListenMini";
import LiveReceipt from "@/components/landing/LiveReceipt";
import { AskDemo, StampToy } from "@/components/landing/FeatureToys";

// Landing sections below the hero (hero, navbar and the Pocket guide live elsewhere).
// Ideas borrowed (not copied) from superr.ai (roman-numeral steps, "no-list" privacy, who it is for,
// pinned scroll storytelling) and oyenza.com (big proof numbers, app mock-ups, bento cards, rows that
// pop in one by one, a read-vs-skipped privacy demo). Motion hooks are data attributes read by
// ScrollFx: data-reveal, data-split, data-count, data-parallax.

function Doodle({ kind, className = "", speed = 0.12 }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <span className={`ln-doodle ${className}`} data-parallax={speed} aria-hidden="true">
      {kind === "star" && (
        <svg viewBox="0 0 48 48" width="46" height="46" {...common}>
          <path d="M24 4 C25 16 32 23 44 24 C32 25 25 32 24 44 C23 32 16 25 4 24 C16 23 23 16 24 4Z" />
        </svg>
      )}
      {kind === "squiggle" && (
        <svg viewBox="0 0 120 24" width="110" height="22" {...common}>
          <path d="M3 14c10-14 18 12 28-2s18 10 28-2 18 10 28-2 18 8 26 -1" />
        </svg>
      )}
      {kind === "pencil" && (
        <svg viewBox="0 0 32 32" width="54" height="54" {...common}>
          <path d="M5 27l1.4-6.2L22.6 4.6a2.6 2.6 0 0 1 3.7 3.7L10.2 24.4z" />
          <path d="M20 7.2l4.8 4.8M6.4 20.8l4.8 4.8" />
        </svg>
      )}
      {kind === "loop" && (
        <svg viewBox="0 0 80 60" width="80" height="60" {...common}>
          <path d="M6 44c18-30 40-34 44-18 3 14-20 18-18 4 2-14 28-22 42-10" />
        </svg>
      )}
    </span>
  );
}

/* ---------- a ticker of things you can study ---------- */
const THINGS = ["lecture notes", "articles", "textbook chapters", "documentation", "research papers", "cheat sheets", "meeting notes", "blog posts", "study guides"];

export function Marquee() {
  const row = (hidden) => (
    <div className="ln-marq-row" aria-hidden={hidden || undefined}>
      {THINGS.map((t) => (
        <p key={t}>
          <span>{t}</span>
          <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path d="M24 4 C25 16 32 23 44 24 C32 25 25 32 24 44 C23 32 16 25 4 24 C16 23 23 16 24 4Z" fill="currentColor" /></svg>
        </p>
      ))}
    </div>
  );
  return (
    <div className="ln-marq" data-guide-avoid role="img" aria-label="PocketLM works with lecture notes, articles, textbook chapters, documentation, research papers, cheat sheets, meeting notes, blog posts and study guides.">
      <div className="ln-marq-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/* ---------- big numbers ---------- */
export function Ways() {
  const cells = [
    [<span key="a" data-count="300">300</span>, "characters", "Paste text. A short page of notes is enough to start."],
    [<span key="b" data-count="10">10</span>, "pages", "Drop in a PDF. It is read in your browser, not uploaded."],
    [
      <span key="c">
        <span data-count="5">5</span>+<span data-count="5">5</span>
      </span>,
      "per kit",
      "Five key points and a five-question quiz for every document.",
    ],
    [<span key="d">0</span>, "words on-chain", "Only a title, a fingerprint and your score are stamped."],
  ];
  return (
    <section className="ln-section ln-ways-wrap" aria-labelledby="ways-h">
      <Doodle kind="star" className="d1" speed={-0.1} />
      <Doodle kind="squiggle" className="d2" speed={0.14} />
      <div className="wrap">
        <p className="ln-note" data-reveal>psst… it is smaller than it looks</p>
        <h2 id="ways-h" data-split data-guide-avoid>Small notes in. A whole study kit out.</h2>
        <div className="ln-ways" data-guide-avoid>
          {cells.map(([big, unit, text], i) => (
            <div key={unit} className="ln-way" data-reveal data-delay={i * 110}>
              <div className="ln-bigline">
                <span className="ln-big">{big}</span>
                <span className="ln-unit">{unit}</span>
              </div>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- feature cards ---------- */
const BARS = Array.from({ length: 26 }, (_, i) => ({ h: 22 + ((i * 37) % 70), d: (i * 0.09) % 1.2 }));
const ANSWER = "Red and blue light.".split(" ");
const LISTEN_TEXT = "Photosynthesis turns light into chemical energy inside the chloroplasts. Chlorophyll absorbs red and blue light, then the Calvin cycle fixes carbon dioxide into glucose.";

export function Features() {
  return (
    <section id="features" className="ln-section ln-features" aria-labelledby="feat-h" data-guide-section="how">
      <Doodle kind="pencil" className="d3" speed={0.16} />
      <Doodle kind="loop" className="d4" speed={-0.08} />
      <div className="wrap">
        <h2 id="feat-h" data-split data-guide-avoid>More than a summary.</h2>
        <p className="lede" data-reveal data-guide-avoid>Everything in the notebook is made to be used, not just read.</p>
        <div className="ln-bento">
          <article className="ln-card ln-ask" data-guide-avoid data-reveal>
            <h3>Ask your notes</h3>
            <p>Answers come only from your document, with the line they came from. If it is not in there, you are told.</p>
            <AskDemo />
          </article>

          <article className="ln-card ln-listen" data-guide-avoid data-reveal data-delay="90">
            <h3>Listen to it</h3>
            <p>Your summary, read aloud with your browser&apos;s own voice. Nothing extra is sent anywhere.</p>
            <div className="ln-wave" aria-hidden="true">
              {BARS.map((b, i) => (
                <span key={i} style={{ height: `${b.h}%`, animationDelay: `${b.d}s` }} />
              ))}
            </div>
            <Listen text={LISTEN_TEXT} />
          </article>

          <article className="ln-card ln-pdf" data-guide-avoid data-reveal data-delay="60">
            <span className="ln-tape" aria-hidden="true" />
            <h3>PDF in, text out</h3>
            <p>Up to 10 pages. A scanned PDF with no text? We will say so and ask you to paste it instead.</p>
            <div className="ln-pages" aria-hidden="true">
              <span /><span /><span>
                <i /><i /><i /><i />
              </span>
              <b>pages 1 to 10</b>
            </div>
          </article>

          <article className="ln-card ln-proof" data-guide-avoid data-reveal data-delay="140">
            <StampToy />
            <h3>A study proof</h3>
            <p>Finish the quiz and stamp the title, a fingerprint and your score on BOT Chain.</p>
            <div className="ln-chips" aria-hidden="true">
              <span>title</span><span>fingerprint</span><span>score</span><span className="on">BOT Chain testnet</span>
            </div>
          </article>

          <article className="ln-card ln-shelf" data-guide-avoid data-reveal data-delay="220">
            <h3>Your shelf, and a link to share</h3>
            <p>Every stamp is read straight from the contract. Share one as a link anyone can open, no wallet needed.</p>
            <ul aria-hidden="true">
              <li style={{ "--k": 0 }}><span>Biology chapter 3</span><b>4/5</b></li>
              <li style={{ "--k": 1 }}><span>Intro to Solidity</span><b>5/5</b></li>
              <li style={{ "--k": 2 }}><span>History notes, week 2</span><b>3/5</b></li>
            </ul>
            <span className="ln-link">/app?study=12</span>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- privacy ---------- */
export function Privacy() {
  return (
    <section id="privacy" className="ln-section ln-privacy" aria-labelledby="priv-h" data-guide-section="privacy">
      <Doodle kind="star" className="d5" speed={0.12} />
      <div className="wrap ln-privacy-grid">
        <div>
          <h2 id="priv-h" data-split data-guide-avoid>Everything you&apos;d want. Nothing you&apos;d worry about.</h2>
          <p className="lede" data-reveal data-guide-avoid>A study proof should show that you studied, not what you studied.</p>
          <ul className="ln-nolist" data-guide-avoid>
            {[
              [<Lock key="l" />, "Your notes never go on-chain", "The text stays in your browser and is sent to the AI only to make your study kit."],
              [<Fingerprint key="f" />, "Only a fingerprint is stamped", "A hash of the document, its title and your score. Nobody can read your notes from it."],
              [<Feather key="e" />, "No account, no database", "Your shelf is read straight from the contract with your wallet."],
            ].map(([icon, t, p], i) => (
              <li key={t} data-reveal="left" data-delay={i * 120}>
                {icon}
                <div>
                  <strong>{t}</strong>
                  <span>{p}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <LiveReceipt />
      </div>
    </section>
  );
}

/* ---------- who it is for ---------- */
const AUDIENCE = [
  ["Students", "Turn lecture notes into a quick quiz, then keep a log of what you studied and when."],
  ["Mentors and communities", "Ask learners to stamp their study. You can check a stamp on the explorer, as a log, not a grade."],
  ["Anyone upskilling", "Working through docs on code, AI or Web3? Stamp each session and share the proof."],
];

export function Audience() {
  return (
    <section id="who" className="ln-section ln-audience" aria-labelledby="aud-h">
      <div className="wrap">
        <h2 id="aud-h" data-split data-guide-avoid>Made for people who study.</h2>
        <div className="ln-aud-grid">
          {AUDIENCE.map(([t, p], i) => (
            <article key={t} data-guide-avoid data-reveal data-delay={i * 130}>
              <span className="num" aria-hidden="true">{["I.", "II.", "III."][i]}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQ = [
  ["Do my notes go on the blockchain?", "No. Only the title, a SHA-256 fingerprint of the text and your score are stamped. Nobody can read your notes from that."],
  ["Does the AI see my notes?", "Yes. The text is sent to an AI service only to make your study kit and to answer your questions. PocketLM itself does not save it, and the AI provider handles it under its own terms, so skip anything private."],
  ["What can I upload?", "Paste text, or upload a PDF of up to 10 pages. Very long text is trimmed to about 20,000 characters, and you are told when that happens. A scanned PDF with no text can't be read, so paste the text instead."],
  ["Is it free?", "Using the notebook costs nothing right now: no account and no payment. Stamping runs on BOT Chain testnet, so it only costs test BOT, which you can get from the BOT Chain faucet."],
  ["Does the stamp prove I mastered the topic?", "No. The quiz is graded in your browser, so the score is a self-reported study log. A stamp shows that your wallet logged a result at a certain time, nothing more."],
  ["Can other people see what I stamped?", "Yes. A stamp is public: your wallet address, the title, the score and the date. Your notes are not. Stamps can't be undone, so pick a title you are happy to share."],
  ["Which network is this?", "BOT Chain testnet for now (chain ID 968). PocketLM adds the network to MetaMask for you the first time you stamp."],
  ["Do I need a wallet?", "Only to stamp. The study kit, the chat and the quiz all work without one."],
];

export function Faq() {
  return (
    <section id="faq" className="ln-section ln-faq-wrap" aria-labelledby="faq-h" data-guide-section="faq">
      <div className="wrap ln-faq-grid">
        <div data-guide-avoid>
          <h2 id="faq-h" data-split>Good questions.</h2>
          <p className="lede" data-reveal>Tap one to open it. Straight answers, no fine print.</p>
        </div>
        <div className="faq" data-guide-avoid>
          {FAQ.map(([q, a], i) => (
            <details key={q} data-reveal data-delay={i * 70}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- closing call to action ---------- */
export function FinalCta() {
  return (
    <section id="start" className="ln-section ln-final" data-guide-section="cta">
      <div className="wrap">
        <div className="ln-final-card" data-guide-avoid data-reveal="scale">
          <span className="ln-tape" aria-hidden="true" />
          <div className="ln-final-mascot" aria-hidden="true">
            <MascotIcon size={132} idp="fin" />
          </div>
          <div>
            <p className="ln-note">little by little…</p>
            <h2>One page of notes is enough to begin.</h2>
            <p>Paste it, get your study kit, and stamp what you learned.</p>
            <div className="ln-final-actions">
              <Link href="/app" className="btn btn-primary" data-guide-cta>
                <Pencil size={20} /> Open my notebook
              </Link>
              <span className="note-sm">no account needed</span>
            </div>
          </div>
          <div className="ln-final-stamp" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="150" height="150">
              <circle cx="32" cy="32" r="27" fill="none" stroke="#fff3e0" strokeWidth="3.4" />
              <circle cx="32" cy="32" r="20" fill="none" stroke="#fff3e0" strokeWidth="1.6" opacity=".7" />
              <path d="M20 33l8 8 17-18" fill="none" stroke="#fff3e0" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>stamped ✓</span>
          </div>
        </div>
      </div>
    </section>
  );
}
