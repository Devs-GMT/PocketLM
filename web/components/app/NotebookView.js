"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AskChat from "@/components/AskChat";
import Listen from "@/components/Listen";
import Quiz from "@/components/Quiz";
import StampModal from "@/components/app/StampModal";
import { MascotIcon } from "@/components/MascotArt";
import { metaLine, statusOf } from "@/components/app/NotebookCard";
import { deleteNotebook, getNotebook, patchNotebook, quizScore, saveNotebook, shortDateTime } from "@/lib/notebooks";
import { explorerTx } from "@/lib/config";

const TABS = ["Summary", "Key points", "Quiz", "Ask", "Listen"];

export default function NotebookView() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") || "";
  const unsaved = params.get("unsaved") === "1";
  const [nb, setNb] = useState(undefined); // undefined = loading, null = not found
  const [tab, setTab] = useState(0);
  const [chat, setChat] = useState([]);
  const [stampOpen, setStampOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => {
    let found = getNotebook(id);
    if (!found && unsaved) {
      try {
        found = JSON.parse(sessionStorage.getItem(`pocketlm.tmp.${id}`) || "null");
      } catch {
        found = null;
      }
    }
    setNb(found);
  }, [id, unsaved]);

  const update = useCallback(
    (patch) => {
      setNb((cur) => {
        if (!cur) return cur;
        const next = { ...cur, ...patch };
        if (!unsaved) saveNotebook(next);
        return next;
      });
    },
    [unsaved]
  );

  if (nb === undefined) return <div className="ap-page"><div className="ap-card ap-skel" style={{ height: 220 }} /></div>;
  if (nb === null) {
    return (
      <div className="ap-page ap-center">
        <MascotIcon size={90} idp="apm" />
        <h1 className="ap-h2">We can't find that notebook</h1>
        <p className="ap-lede">Notebooks live only in the browser that made them. It may have been deleted, or it was made on another device.</p>
        <div className="ap-row"><Link className="ap-btn is-primary" href="/app/new">New notebook</Link><Link className="ap-btn" href="/app/notebooks">My notebooks</Link></div>
      </div>
    );
  }

  const st = statusOf(nb);
  const total = nb.kit.quiz.length;
  const score = quizScore(nb);
  const m = nb.meta || {};

  return (
    <div className="ap-page">
      <div className="ap-nbhead">
        <Link href="/app/notebooks" className="ap-back" aria-label="Back to my notebooks">←</Link>
        <div className="ap-nbtitle">
          <h1 className="ap-h2" title={nb.title}>{nb.title}</h1>
          <p>{metaLine(nb)} <span className={`ap-chip ${st.cls}`}>{st.text}</span></p>
        </div>
        <div className="ap-menuwrap">
          <button className="ap-btn is-small" onClick={() => { setMenu((v) => !v); setConfirmDel(false); }} aria-expanded={menu} aria-haspopup="menu" aria-label="Notebook options">⋯</button>
          {menu && (
            <div className="ap-menu" role="menu" onMouseLeave={() => setConfirmDel(false)}>
              <button role="menuitem" onClick={() => { update({ answers: nb.kit.quiz.map(() => null) }); setTab(2); setMenu(false); }}>Retake quiz</button>
              {confirmDel ? (
                <button role="menuitem" className="is-danger" onClick={() => { deleteNotebook(nb.id); router.replace("/app/notebooks"); }}>Yes, delete it</button>
              ) : (
                <button role="menuitem" className="is-danger" onClick={() => setConfirmDel(true)}>Delete notebook</button>
              )}
            </div>
          )}
        </div>
      </div>

      {unsaved && <div className="ap-alert" role="status">This browser wouldn't store the notebook, so it only lasts until you close this tab.</div>}
      {nb.notice && <div className="ap-alert" role="status">{nb.notice}</div>}

      <div className="ap-tabs" role="tablist" aria-label="Study kit">
        {TABS.map((t, i) => (
          <button key={t} role="tab" id={`tab-${i}`} aria-selected={tab === i} aria-controls="tabpanel" className={tab === i ? "is-on" : ""} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>

      <div className="ap-panel" role="tabpanel" id="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === 0 && (
          <div className="ap-summary">
            <div className="ap-summary-main">
              <h2 className="ap-h3">Summary</h2>
              <p className="ap-body">{nb.kit.summary}</p>
              <div className="ap-row">
                <button className="ap-btn is-small" onClick={() => setTab(4)}>▶ Listen to it</button>
                <button className="ap-btn is-small" onClick={() => setTab(2)}>Take the quiz</button>
              </div>
            </div>
            <dl className="ap-facts">
              <div><dt>Source</dt><dd title={m.fileName}>{m.kind === "pdf" ? m.fileName : "Pasted text"}</dd></div>
              <div><dt>{m.kind === "pdf" ? "Pages" : "Length"}</dt><dd>{m.kind === "pdf" ? m.pages : `${nb.text.length.toLocaleString("en-US")} chars`}</dd></div>
              <div><dt>Type</dt><dd>{m.kind === "pdf" ? "PDF" : "Text"}</dd></div>
              <div><dt>Created</dt><dd>{shortDateTime(nb.createdAt)}</dd></div>
            </dl>
          </div>
        )}

        {tab === 1 && (
          <div>
            <h2 className="ap-h3">Key points</h2>
            <ol className="ap-points">
              {nb.kit.keyPoints.map((p, i) => (
                <li key={i}><span className="ap-pnum" aria-hidden="true">{i + 1}</span><p>{p}</p></li>
              ))}
            </ol>
          </div>
        )}

        {tab === 2 && (
          <>
            <Quiz
              quiz={nb.kit.quiz}
              answers={nb.answers}
              setAnswers={(a) => update({ answers: a })}
              onFinish={() => setStampOpen(true)}
              onRetake={() => update({ answers: nb.kit.quiz.map(() => null) })}
              stamped={nb.stamped}
            />
            {nb.stamped?.txHash && (
              <p className="ap-fine ap-center-text">Last stamp: <a href={explorerTx(nb.stamped.txHash)} target="_blank" rel="noopener noreferrer">view transaction</a> · <Link href={`/app?study=${nb.stamped.id}`}>see proof</Link></p>
            )}
          </>
        )}

        {tab === 3 && <AskChat text={nb.text} messages={chat} setMessages={setChat} />}
        {tab === 4 && <Listen text={nb.kit.summary} />}
      </div>

      {stampOpen && (
        <StampModal
          nb={nb}
          score={score}
          total={total}
          onClose={() => setStampOpen(false)}
          onStamped={(out) => update({ stamped: { id: out.id, txHash: out.txHash, at: Date.now() } })}
        />
      )}
    </div>
  );
}
