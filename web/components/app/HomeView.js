"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MascotIcon } from "@/components/MascotArt";
import Proof from "@/components/Proof";
import { NotebookCard } from "@/components/app/NotebookCard";
import { greeting, handOffFile, useNotebooks } from "@/lib/notebooks";
import { MAX_PDF_PAGES } from "@/lib/limits";

export default function HomeView() {
  const study = useSearchParams().get("study");
  if (study !== null) return <Proof id={study} />;
  return <Home />;
}

function Home() {
  const router = useRouter();
  const list = useNotebooks();
  const fileRef = useRef(null);
  const [over, setOver] = useState(false);
  const [hello, setHello] = useState("Hello");
  useEffect(() => setHello(greeting()), []);

  function take(file) {
    if (!file) return;
    handOffFile(file);
    router.push("/app/new");
  }

  return (
    <div className="ap-page">
      <p className="ap-hello">{hello} <span aria-hidden="true">👋</span></p>
      <h1 className="ap-h1">What do you want to <em>learn</em> today?</h1>
      <p className="ap-lede">Turn your notes into a summary, key points and a quiz. Then stamp what you finished on BOT Chain.</p>

      <section className="ap-start" aria-label="Start a notebook">
        <label
          className={`ap-drop${over ? " is-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
        >
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={(e) => take(e.target.files?.[0])} />
          <span className="ap-drop-ico" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
          </span>
          <b>Drop your PDF here</b>
          <small>or click to choose one · up to {MAX_PDF_PAGES} pages</small>
        </label>
        <div className="ap-start-or"><span>or</span></div>
        <Link href="/app/new?mode=paste" className="ap-paste">
          <b>Paste your notes</b>
          <small>Plain text from a lecture, article or chapter</small>
        </Link>
        <div className="ap-buddy" aria-hidden="true">
          <span className="ap-hand">your study buddy!</span>
          <MascotIcon size={92} idp="aph" className="ap-buddy-art" />
        </div>
      </section>
      <p className="ap-privacy">Your notes stay on this device. Only the study kit request goes to the AI, and only a title, a fingerprint and your score can ever go on-chain.</p>

      <section className="ap-sec" aria-labelledby="recent-h">
        <div className="ap-sec-head">
          <h2 id="recent-h">Recent notebooks</h2>
          {list && list.length > 3 && <Link href="/app/notebooks">See all →</Link>}
        </div>
        {list === null ? (
          <div className="ap-grid" aria-hidden="true">{[0, 1, 2].map((i) => <div key={i} className="ap-card ap-skel" />)}</div>
        ) : list.length === 0 ? (
          <div className="ap-empty">
            <p className="ap-hand">nothing here yet</p>
            <p>Your first notebook will show up here, saved in this browser.</p>
          </div>
        ) : (
          <div className="ap-grid">{list.slice(0, 3).map((n) => <NotebookCard key={n.id} nb={n} />)}</div>
        )}
      </section>
    </div>
  );
}
