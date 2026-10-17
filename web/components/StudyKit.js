"use client";
import { useState } from "react";
import Listen from "@/components/Listen";
import AskChat from "@/components/AskChat";
import Quiz from "@/components/Quiz";

const TABS = [
  ["I.", "Summary"],
  ["II.", "Key points"],
  ["III.", "Ask your notes"],
  ["IV.", "Quiz"],
];

export default function StudyKit({ title, text, docHash, kit, notice, onReset }) {
  const [tab, setTab] = useState(0);
  const [answers, setAnswers] = useState(() => kit.quiz.map(() => null));

  return (
    <div className="nb">
      <div className="nb-top">
        <div className="nb-label">
          <small>Name:</small>
          <b title={title}>{title}</b>
        </div>
        <button className="btn btn-sm" style={{ marginBottom: 16 }} onClick={onReset}>New notebook</button>
      </div>

      <div className="nb-page">
        {notice && <div className="banner info" role="status">{notice}</div>}

        <div className="tabs" role="tablist" aria-label="Study kit">
          {TABS.map(([n, label], i) => (
            <button key={n} role="tab" id={`tab-${i}`} aria-selected={tab === i} aria-controls={`panel-${i}`} className="tab" onClick={() => setTab(i)}>
              <i>{n}</i> {label}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 0 && (
            <div>
              <h2 className="h-sec">Summary</h2>
              <p className="summary">{kit.summary}</p>
              <Listen text={kit.summary} />
            </div>
          )}
          {tab === 1 && (
            <div>
              <h2 className="h-sec">Key points</h2>
              <ol className="keypoints">
                {kit.keyPoints.map((p, i) => <li key={i}><span>{p}</span></li>)}
              </ol>
            </div>
          )}
          {tab === 2 && <AskChat text={text} />}
          {tab === 3 && <Quiz quiz={kit.quiz} answers={answers} setAnswers={setAnswers} title={title} docHash={docHash} />}
        </div>
      </div>
    </div>
  );
}
