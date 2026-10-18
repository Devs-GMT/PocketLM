"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchStudy } from "@/lib/chain";
import { NETWORK, explorerAddress } from "@/lib/config";
import { shortAddress } from "@/lib/wallet";

export const formatDate = (unix) =>
  new Date(unix * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Read-only proof of one study. No wallet needed.
export default function Proof({ id }) {
  const [state, setState] = useState({ status: "loading" });
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!/^[1-9]\d{0,9}$/.test(id)) return setState({ status: "missing" });
    setState({ status: "loading" });
    try {
      const study = await fetchStudy(BigInt(id));
      setState(study ? { status: "ok", study } : { status: "missing" });
    } catch (e) {
      setState({ status: "error", message: e?.message || "" });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link", window.location.href);
    }
  }

  const s = state.study;
  return (
    <div className="ap-page ap-narrow">
      <Link href="/app/records" className="ap-back">← Study records</Link>

      {state.status === "loading" && <div className="ap-card ap-skel" style={{ height: 280 }} role="status" aria-label="Looking it up" />}

      {state.status === "missing" && (
        <div className="ap-empty">
          <p className="ap-hand">page not found</p>
          <p>There's no study with that number on {NETWORK.chainName}.</p>
          <Link className="ap-btn is-primary" href="/app/new">Start a notebook</Link>
        </div>
      )}

      {state.status === "error" && (
        <div className="ap-alert is-err" role="alert">
          <span>We couldn't read the chain right now.</span>
          <button className="ap-btn is-small" onClick={load}>Try again</button>
        </div>
      )}

      {state.status === "ok" && (
        <article className="ap-proof">
          <p className="ap-hand">Study #{s.id}</p>
          <h1 className="ap-h2">{s.title}</h1>
          <div className="ap-score is-big" aria-label={`Score ${s.score} out of ${s.total}`}><b>{s.score}</b><span>/ {s.total}</span></div>
          <dl className="ap-rows">
            <div><dt>Stamped</dt><dd>{formatDate(s.at)}</dd></div>
            <div><dt>By</dt><dd><a href={explorerAddress(s.learner)} target="_blank" rel="noopener noreferrer" title={s.learner}>{shortAddress(s.learner)}</a></dd></div>
            <div><dt>Notes fingerprint</dt><dd className="ap-hash">{s.docHash}</dd></div>
            <div><dt>Network</dt><dd>{NETWORK.chainName}</dd></div>
          </dl>
          <p className="ap-fine">The score was graded in the learner's browser, so this is a self-reported study log. The fingerprint is a hash of the notes; the notes themselves are not on-chain.</p>
          <div className="ap-row">
            <button className="ap-btn is-primary" onClick={copyLink}>{copied ? "Link copied" : "Copy link"}</button>
            <Link className="ap-btn" href="/app/new">Make my own</Link>
          </div>
        </article>
      )}
    </div>
  );
}
