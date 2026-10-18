import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StudyRedirect from "@/components/StudyRedirect";
import GuideLoader from "@/components/GuideLoader";
import HeroVideo from "@/components/hero/HeroVideo";

import HowStage from "@/components/landing/HowStage";
import { Marquee, Ways, Features, Privacy, Audience, Faq, FinalCta } from "@/components/landing/Sections";
import ShelfRows from "@/components/landing/ShelfRows";
import TypedWord from "@/components/landing/TypedWord";
import CardFx from "@/components/landing/CardFx";
import ScrollFx from "@/components/landing/ScrollFx";
import StampCursor from "@/components/landing/StampCursor";
import { HandWave, Scribble } from "@/components/Icons";

export default function Landing() {
  return (
    <>
      <StudyRedirect />
      <Header landing />
      <main>
        <section id="top" className="hero hero-landing" data-guide-section="hero">
          <HeroVideo />
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
              helps you <TypedWord words={["learn", "understand", "remember", "prove it"]} />
            </p>
            <p className="sub-note" data-guide-avoid>Free to try · no account needed</p>
            <div className="cta" data-guide-avoid>
              <Link href="/app" className="btn btn-primary" data-guide-cta>Open my notebook</Link>
            </div>
          </div>
        </section>

        <Marquee />
        <Ways />

        <section id="how" className="ln-section ln-how-wrap" data-guide-section="how">
          <div className="wrap ln-how-head">
            <p className="ln-note" data-reveal>one page of notes, four steps</p>
            <h2 data-split data-guide-avoid>Four pages, one notebook.</h2>
            <p className="lede" data-reveal data-guide-avoid>Scroll down and watch a page of notes turn into a study proof.</p>
          </div>
          <HowStage />
        </section>

        <Features />
        <Privacy />
        <Audience />
        <ShelfRows />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <ScrollFx />
      <CardFx />
      <StampCursor />
      <GuideLoader />
    </>
  );
}
