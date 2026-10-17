"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchStudy } from "@/lib/chain";
import { explorerAddress } from "@/lib/config";
import { shortAddress } from "@/lib/wallet";

export const formatDate = (unix) =>
  new Date(unix * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Read-only proof of one study. No wallet needed.
export default function Proof({ id }) {
  const [state, setState] = useState({ status: "loading" });

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

  const s = state.study;
  return (
    <div className="nb">
      <div className="nb-label">
        <small>Name:</small>
        <b>{s ? s.title : `study #${id}`}</b>
      </div>
      <div className="nb-page">
        {state.status === "loading" && <p className="note" role="status">looking it up…</p>}

        {state.status === "missing" && (
          <div className="empty">
            <p className="note">Page not found in this notebook</p>
            <p className="muted" style={{ margin: "8px 0 18px" }}>There’s no study with that number.</p>
            <Link className="btn btn-primary" href="/app">Start a notebook</Link>
          </div>
        )}

        {state.status === "error" && (
          <div>
            <div className="banner err" role="alert">
              <span>We couldn’t read the chain right now.</span>
              <button className="btn btn-sm" onClick={load}>Try again</button>
            </div>
          </div>
        )}

        {state.status === "ok" && (
          <div className="proof">
            <p className="note">Study #{s.id}</p>
            <h2 className="h-sec" style={{ marginTop: 4 }}>{s.title}</h2>
            <div className="score-big">{s.score}/{s.total}</div>
            <dl>
              <dt>Stamped</dt>
              <dd>{formatDate(s.at)}</dd>
              <dt>By</dt>
              <dd><a href={explorerAddress(s.learner)} target="_blank" rel="noopener noreferrer" title={s.learner}>{shortAddress(s.learner)}</a></dd>
              <dt>Fingerprint</dt>
              <dd style={{ fontSize: "0.9rem" }}>{s.docHash}</dd>
            </dl>
            <p className="muted" style={{ marginTop: 18, fontSize: "0.98rem" }}>
              The score was graded in the learner’s browser, so this is a self-reported study log. The fingerprint is a hash of the notes; the notes themselves are not on-chain.
            </p>
            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/app">Make my own</Link>
              <Link className="btn" href="/shelf">My shelf</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
