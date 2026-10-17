import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StudyRedirect from "@/components/StudyRedirect";
import GuideLoader from "@/components/GuideLoader";
import HeroScene from "@/components/hero/HeroScene";
import { HandWave, Scribble, Lock, Fingerprint, Feather } from "@/components/Icons";

const STEPS = [
  ["I.", "Add your notes", "paste text or drop in a short PDF"],
  ["II.", "Get your study kit", "summary, 5 key points, and you can listen to it"],
  ["III.", "Ask and quiz yourself", "answers come only from your notes"],
  ["IV.", "Stamp your study", "your score goes on BOT Chain as a study proof"],
];

const FAQ = [
  ["Do my notes go on the blockchain?", "No. Only the title, a SHA-256 fingerprint of the text and your score are stamped. Nobody can read your notes from that."],
  ["Does the AI see my notes?", "Yes, the text is sent to the AI only to make your study kit and to answer your questions. PocketLM does not save it."],
  ["Does the stamp prove I mastered the topic?", "No. The quiz is graded in your browser, so the score is a self-reported study log. A stamp shows that your wallet logged a result at a certain time."],
  ["Which network is this?", "BOT Chain testnet for now (chain ID 968), so stamps cost test BOT only. You can get test BOT from the BOT Chain faucet."],
  ["Do I need a wallet?", "Only to stamp. The study kit, chat and quiz work without one."],
];

export default function Landing() {
  return (
    <>
      <StudyRedirect />
      <Header landing />
      <main>
        <section id="top" className="hero hero-landing" data-guide-section="hero">
          <HeroScene />
          <div className="hero-copy">
            <div className="greet note">
              <HandWave size={44} /> Dear students,
            </div>
            <h1 data-guide-avoid>
              meet <span className="lm">pocketLM</span>
            </h1>
            <p className="sub" data-guide-avoid>
              It’s an AI notebook that{" "}
              <span className="scrawl">
                actually!
                <Scribble />
              </span>{" "}
              helps you learn
            </p>
            <div className="cta" data-guide-avoid>
              <Link href="/app" className="btn btn-primary" data-guide-cta>Open my notebook</Link>
              <span className="note-sm">no account needed</span>
            </div>
          </div>
        </section>

        <section id="how" className="section" style={{ paddingTop: 36 }} data-guide-section="how">
          <div className="narrow">
            <h2 data-guide-avoid>Four pages, one notebook.</h2>
            <ol className="steps" data-guide-avoid>
              {STEPS.map(([n, what, how], i) => (
                <li key={n} id={`step-${i + 1}`} data-guide-step={i + 1}>
                  <span className="num">{n}</span>
                  <span className="what">
                    {what}
                    <small>{how}</small>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="privacy" className="section" data-guide-section="privacy">
          <div className="wrap privacy">
            <div data-guide-avoid>
              <h2>Everything you’d want. Nothing you’d worry about.</h2>
              <p className="lede">A study proof should show that you studied, not what you studied.</p>
            </div>
            <ul data-guide-avoid>
              <li>
                <Lock />
                <div>
                  <strong>Your notes never go on-chain</strong>
                  <span>The text stays in your browser and is sent to the AI only to make your study kit.</span>
                </div>
              </li>
              <li>
                <Fingerprint />
                <div>
                  <strong>Only a fingerprint is stamped</strong>
                  <span>A hash of the document, its title and your score. Nobody can read your notes from it.</span>
                </div>
              </li>
              <li>
                <Feather />
                <div>
                  <strong>No account, no database</strong>
                  <span>Your shelf is read straight from the contract with your wallet.</span>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section id="faq" className="section" style={{ paddingTop: 24 }} data-guide-section="faq">
          <div className="narrow">
            <h2 data-guide-avoid>Good questions.</h2>
            <div className="faq" data-guide-avoid>
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="section final-cta" data-guide-section="cta">
          <div className="narrow" style={{ textAlign: "center" }}>
            <h2 data-guide-avoid>Ready when you are.</h2>
            <p className="lede" style={{ margin: "10px auto 22px" }}>Paste your notes, make a study kit, stamp it.</p>
            <Link href="/app" className="btn btn-primary" data-guide-avoid data-guide-cta>Open my notebook</Link>
          </div>
        </section>
      </main>
      <Footer />
      <GuideLoader />
    </>
  );
}
