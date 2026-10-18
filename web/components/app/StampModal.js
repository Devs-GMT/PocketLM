"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getEthereum, shortAddress, useWallet } from "@/lib/wallet";
import { isUserRejection, stampStudy } from "@/lib/chain";
import { CONTRACT_ADDRESS, NETWORK, explorerTx } from "@/lib/config";
import { fitTitle } from "@/lib/source";
import { shortDateTime } from "@/lib/notebooks";

const short = (h) => (h ? `${h.slice(0, 8)}…${h.slice(-6)}` : "");

// "Study completed" dialog: shows exactly what will go on-chain, then sends the stamp.
export default function StampModal({ nb, score, total, onClose, onStamped }) {
  const { hasWallet, address, wrongNetwork, connect } = useWallet();
  const [phase, setPhase] = useState("review"); // review | connecting | confirm | pending | done
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [now] = useState(() => Date.now());
  const box = useRef(null);
  const busy = phase === "connecting" || phase === "confirm" || phase === "pending";
  const title = fitTitle(nb.title) || "Untitled notes";

  useEffect(() => {
    const prev = document.activeElement;
    box.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function stamp() {
    setError("");
    if (!CONTRACT_ADDRESS) return setError("The contract address isn't set for this network yet.");
    try {
      setPhase("connecting");
      if (!address || wrongNetwork) await connect();
      setPhase("confirm");
      const out = await stampStudy(getEthereum(), { title, docHash: nb.docHash, score, total }, { onSent: (h) => { setTxHash(h); setPhase("pending"); } });
      setResult(out);
      setPhase("done");
      onStamped(out);
    } catch (e) {
      setPhase("review");
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

  const label =
    phase === "connecting" ? "Connecting…" : phase === "confirm" ? "Confirm in your wallet…" : phase === "pending" ? "Stamping…" : error ? "Try again" : address && wrongNetwork ? "Switch & stamp" : "Stamp on BOT Chain";

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="ap-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div className="ap-modal" role="dialog" aria-modal="true" aria-labelledby="sm-h" tabIndex={-1} ref={box}>
        {!busy && <button className="ap-x ap-modal-x" onClick={onClose} aria-label="Close">×</button>}

        {phase === "done" ? (
          <div className="ap-modal-body" role="status">
            <div className="ap-badge is-stamp" aria-hidden="true">✓</div>
            <h2 id="sm-h">{result.id ? `Stamped as Study #${result.id}` : "Your study is stamped"}</h2>
            <p className="ap-lede">“{title}” · {score}/{total} is now on {NETWORK.chainName}.</p>
            <p className="ap-fine">
              Transaction: <a href={explorerTx(result.txHash)} target="_blank" rel="noopener noreferrer">{short(result.txHash)}</a>
            </p>
            <div className="ap-modal-actions">
              {result.id && <button className="ap-btn is-primary" onClick={share}>{copied ? "Link copied" : "Share proof"}</button>}
              {result.id && <Link className="ap-btn" href={`/app?study=${result.id}`}>See the proof</Link>}
              <button className="ap-btn is-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <div className="ap-modal-body">
            <div className="ap-badge" aria-hidden="true">✓</div>
            <h2 id="sm-h">Study completed!</h2>
            <p className="ap-lede">You scored <b>{score} out of {total}</b>. Stamp this study on BOT Chain as a proof?</p>

            <dl className="ap-rows">
              <div><dt>Title</dt><dd title={title}>{title}</dd></div>
              <div><dt>Notes fingerprint</dt><dd title={nb.docHash}>{short(nb.docHash)}</dd></div>
              <div><dt>Score</dt><dd>{score} / {total}</dd></div>
              <div><dt>Time</dt><dd>{shortDateTime(now)}</dd></div>
              <div><dt>Network</dt><dd>{NETWORK.chainName}{address ? ` · ${shortAddress(address)}` : ""}</dd></div>
            </dl>
            <p className="ap-fine">Only these four things go on-chain. Your notes never do. The score was graded in your browser, so it is a self-reported study log.</p>

            {error && <div className="ap-alert is-err" role="alert">{error}</div>}
            {phase === "pending" && txHash && (
              <p className="ap-fine">Waiting for the network… <a href={explorerTx(txHash)} target="_blank" rel="noopener noreferrer">view transaction</a></p>
            )}

            <div className="ap-modal-actions">
              <button className="ap-btn is-ghost" onClick={onClose} disabled={busy}>Not now</button>
              {hasWallet === false ? (
                <a className="ap-btn is-primary" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install MetaMask</a>
              ) : (
                <button className="ap-btn is-primary" onClick={stamp} disabled={busy}>{label}</button>
              )}
            </div>
            {hasWallet === false && <p className="ap-fine">You need a wallet like MetaMask to stamp. Everything else works without one.</p>}
            {hasWallet && !address && <p className="ap-fine">You'll be asked to connect your wallet first.</p>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
