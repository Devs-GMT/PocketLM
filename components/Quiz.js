"use client";
import { useState } from "react";
import Link from "next/link";
import { useWallet, getEthereum } from "@/lib/wallet";
import { stampStudy, isUserRejection } from "@/lib/chain";
import { CONTRACT_ADDRESS, explorerTx } from "@/lib/config";

const LETTERS = ["A", "B", "C", "D"];

export default function Quiz({ quiz, answers, setAnswers, title, docHash }) {
  const done = answers.every((a) => a !== null);
  const score = quiz.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);

  function pick(qi, oi) {
    if (answers[qi] !== null) return;
    setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)));
  }

  return (
    <div>
      <h2 className="h-sec">Quiz</h2>
      <p className="muted" style={{ marginBottom: 18 }}>Five questions. You’ll see right or wrong straight away.</p>

      {quiz.map((q, qi) => {
        const picked = answers[qi];
        return (
          <section className="q" key={qi} aria-labelledby={`q${qi}`}>
            <h3 id={`q${qi}`}><span>{qi + 1}.</span>{q.q}</h3>
            <div className="opts">
              {q.options.map((o, oi) => {
                const state = picked === null ? "" : oi === q.answer ? " right" : oi === picked ? " wrong" : "";
                return (
                  <button key={oi} className={`opt${state}`} disabled={picked !== null} onClick={() => pick(qi, oi)}>
                    <b>{LETTERS[oi]}</b>
                    <span>
                      {o}
                      {picked !== null && oi === q.answer && <span className="sr"> (correct answer)</span>}
                      {picked === oi && oi !== q.answer && <span className="sr"> (your answer, incorrect)</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <p className="why" role="status">
                <strong>{picked === q.answer ? "Right. " : "Not quite. "}</strong>
                {q.why}
              </p>
            )}
          </section>
        );
      })}

      {done && <StampPanel score={score} total={quiz.length} title={title} docHash={docHash} />}
    </div>
  );
}

function StampPanel({ score, total, title, docHash }) {
  const { hasWallet, address, wrongNetwork, connect } = useWallet();
  const [phase, setPhase] = useState("idle"); // idle | connecting | confirm | pending | done
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const emoji = score === total ? "🏆" : score >= total * 0.6 ? "🎉" : "💪";

  async function stamp() {
    setError(null);
    if (!CONTRACT_ADDRESS) {
      setError("The contract address isn't set for this network yet.");
      return;
    }
    try {
      setPhase("connecting");
      if (!address || wrongNetwork) await connect();
      setPhase("confirm");
      const out = await stampStudy(getEthereum(), { title, docHash, score, total }, { onSent: (h) => { setTxHash(h); setPhase("pending"); } });
      setResult(out);
      setPhase("done");
    } catch (e) {
      setPhase("idle");
      setError(
        isUserRejection(e)
          ? "You cancelled the request in your wallet. Nothing was sent."
          : /insufficient funds/i.test(e?.shortMessage || e?.message || "")
          ? "Your wallet doesn't have enough BOT to pay the network fee."
          : "The stamp didn't go through. Check your wallet and try again."
      );
    }
  }

  async function share() {
    const url = `${window.location.origin}/app?study=${result.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `I studied "${title}" on PocketLM`, text: `I scored ${score}/${total} on "${title}".`, url });
        return;
      }
    } catch {
      /* cancelled, fall back to copy */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  if (phase === "done") {
    return (
      <div className="result" role="status">
        <p className="note">stamped!</p>
        <h3>{result.id ? `Study #${result.id}` : "Your study is stamped"}</h3>
        <p style={{ marginTop: 6 }}>“{title}” · {score}/{total}</p>
        <p className="small tx-line">
          Transaction: <a href={explorerTx(result.txHash)} target="_blank" rel="noopener noreferrer">{result.txHash}</a>
        </p>
        <div className="actions">
          {result.id && <button className="btn btn-primary" onClick={share}>{copied ? "Link copied" : "Share"}</button>}
          {result.id && <Link className="btn" href={`/app?study=${result.id}`}>See the proof</Link>}
          <Link className="btn btn-ghost" href="/shelf">My shelf</Link>
        </div>
      </div>
    );
  }

  const busy = phase !== "idle";
  return (
    <div className="result">
      <p className="note">all done!</p>
      <h3>You scored {score}/{total} {emoji}</h3>
      <p style={{ marginTop: 8 }}>Stamp it on BOT Chain as a study proof. Only the title, a fingerprint of your notes and the score go on-chain.</p>

      {error && <div className="banner err" role="alert" style={{ marginTop: 14 }}>{error}</div>}

      <div className="actions">
        {hasWallet === false ? (
          <a className="btn btn-primary" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install MetaMask</a>
        ) : (
          <button className="btn btn-primary" onClick={stamp} disabled={busy}>
            {phase === "connecting" ? "Connecting…" : phase === "confirm" ? "Confirm in your wallet…" : phase === "pending" ? "Stamping…" : error ? "Try again" : address && wrongNetwork ? "Switch to BOT Chain & stamp" : "Stamp my study on BOT Chain"}
          </button>
        )}
      </div>

      {phase === "pending" && txHash && (
        <p className="small tx-line">
          Waiting for the network… <a href={explorerTx(txHash)} target="_blank" rel="noopener noreferrer">view transaction</a>
        </p>
      )}
      <p className="small">
        {hasWallet === false
          ? "You need a wallet like MetaMask to stamp. The study kit works without one."
          : address
          ? "Your score was graded in your browser, so it is a self-reported study log."
          : "You'll be asked to connect your wallet first."}
      </p>
    </div>
  );
}
