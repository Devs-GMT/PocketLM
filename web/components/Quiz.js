"use client";
import { useEffect, useState } from "react";

const LETTERS = ["A", "B", "C", "D"];

// One question at a time. Right or wrong shows straight away, with the reason.
// `answers` is kept by the notebook, so leaving the tab (or the page) keeps progress.
export default function Quiz({ quiz, answers, setAnswers, onFinish, onRetake, stamped }) {
  const firstOpen = answers.findIndex((a) => a === null);
  const [qi, setQi] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [end, setEnd] = useState(firstOpen === -1);
  const done = firstOpen === -1;
  const score = quiz.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);

  useEffect(() => {
    if (answers.every((a) => a === null)) {
      setQi(0);
      setEnd(false);
    }
  }, [answers]);

  if (done && end) {
    const msg = score === quiz.length ? "Perfect score!" : score >= quiz.length * 0.6 ? "Nice work!" : "Good start. Read the key points and try again.";
    return (
      <div className="ap-quiz-end">
        <div className="ap-score" aria-label={`Score ${score} out of ${quiz.length}`}>
          <b>{score}</b><span>/ {quiz.length}</span>
        </div>
        <h2 className="ap-h3">{msg}</h2>
        <p className="ap-lede">
          {stamped ? `Stamped on BOT Chain as Study #${stamped.id ?? "·"}. You can stamp again after a new attempt.` : "Stamp this study on BOT Chain as a proof, or keep it just for yourself."}
        </p>
        <div className="ap-row">
          <button className="ap-btn is-primary" onClick={onFinish}>{stamped ? "Stamp again" : "Stamp on BOT Chain"}</button>
          <button className="ap-btn" onClick={() => { setEnd(false); setQi(0); }}>Review answers</button>
          <button className="ap-btn is-ghost" onClick={onRetake}>Retake quiz</button>
        </div>
      </div>
    );
  }

  const q = quiz[qi];
  const picked = answers[qi];
  const last = qi === quiz.length - 1;

  function pick(oi) {
    if (picked !== null) return;
    setAnswers(answers.map((v, i) => (i === qi ? oi : v)));
  }

  return (
    <div className="ap-quiz">
      <div className="ap-qhead">
        <span>Question {qi + 1} of {quiz.length}</span>
        <span className="ap-qscore">{answers.filter((a, i) => a !== null && a === quiz[i].answer).length} right so far</span>
      </div>
      <div className="ap-bar is-solid" role="progressbar" aria-valuemin={0} aria-valuemax={quiz.length} aria-valuenow={answers.filter((a) => a !== null).length} aria-label="Quiz progress">
        <i style={{ width: `${(answers.filter((a) => a !== null).length / quiz.length) * 100}%` }} />
      </div>

      <h2 className="ap-q" id={`q${qi}`}>{q.q}</h2>
      <div className="ap-opts" role="group" aria-labelledby={`q${qi}`}>
        {q.options.map((o, oi) => {
          const state = picked === null ? "" : oi === q.answer ? " is-right" : oi === picked ? " is-wrong" : " is-dim";
          return (
            <button key={oi} type="button" className={`ap-opt${state}`} disabled={picked !== null} onClick={() => pick(oi)}>
              <b>{LETTERS[oi]}</b>
              <span>
                {o}
                {picked !== null && oi === q.answer && <span className="sr"> (correct answer)</span>}
                {picked === oi && oi !== q.answer && <span className="sr"> (your answer, incorrect)</span>}
              </span>
              {picked !== null && oi === q.answer && <i aria-hidden="true">✓</i>}
              {picked === oi && oi !== q.answer && <i aria-hidden="true">✕</i>}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className={`ap-why ${picked === q.answer ? "is-right" : "is-wrong"}`} role="status">
          <strong>{picked === q.answer ? "Right. " : "Not quite. "}</strong>
          {q.why}
        </p>
      )}

      <div className="ap-qnav">
        <button className="ap-btn" onClick={() => setQi(qi - 1)} disabled={qi === 0}>← Previous</button>
        {last ? (
          <button className="ap-btn is-primary" disabled={picked === null || !done} onClick={() => { setEnd(true); onFinish(); }}>
            Finish
          </button>
        ) : (
          <button className="ap-btn is-primary" disabled={picked === null} onClick={() => setQi(qi + 1)}>Next →</button>
        )}
      </div>
    </div>
  );
}
