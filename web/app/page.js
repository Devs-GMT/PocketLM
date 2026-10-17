import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StudyRedirect from "@/components/StudyRedirect";
import HeroScene from "@/components/HeroScene";
import { HandWave, Scribble, Lock, Fingerprint, Feather } from "@/components/Icons";

const STEPS = [
  ["I.", "Add your notes", "paste text or drop in a short PDF"],
  ["II.", "Get your study kit", "summary, 5 key points, and you can listen to it"],
  ["III.", "Ask and quiz yourself", "answers come only from your notes"],
  ["IV.", "Stamp your study", "your score goes on BOT Chain as a study proof"],
];

export default function Landing() {
  return (
    <>
      <StudyRedirect />
      <Header landing />
      <main>
        <section className="hero">
          <HeroScene />
          <div className="hero-copy">
            <div className="greet note">
              <HandWave size={44} /> Dear students,
            </div>
            <h1>
              meet <span className="lm">pocketLM</span>
            </h1>
            <p className="sub">
              It’s an AI notebook that{" "}
              <span className="scrawl">
                actually!
                <Scribble />
              </span>{" "}
              helps you learn
            </p>
            <div className="cta">
              <Link href="/app" className="btn btn-primary">Open my notebook</Link>
              <span className="note-sm">no account needed</span>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 8 }}>
          <div className="narrow">
            <h2>Four pages, one notebook.</h2>
            <ol className="steps">
              {STEPS.map(([n, what, how]) => (
                <li key={n}>
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

        <section className="section">
          <div className="wrap privacy">
            <div>
              <h2>Everything you’d want. Nothing you’d worry about.</h2>
              <p className="lede">A study proof should show that you studied, not what you studied.</p>
            </div>
            <ul>
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
      </main>
      <Footer />
    </>
  );
}
