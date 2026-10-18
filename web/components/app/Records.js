"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchStudiesOf } from "@/lib/chain";
import { useWallet } from "@/lib/wallet";
import { CONTRACT_ADDRESS, NETWORK, explorerAddress } from "@/lib/config";
import { formatDate } from "@/components/Proof";

const RANGES = [["all", "All time", 0], ["30", "Last 30 days", 30], ["7", "Last 7 days", 7]];

export default function Records() {
  const { hasWallet, address, wrongNetwork, connect, switchNetwork } = useWallet();
  const [state, setState] = useState({ status: "idle" });
  const [err, setErr] = useState("");
  const [range, setRange] = useState("all");

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      setState({ status: "ok", studies: await fetchStudiesOf(address) });
    } catch {
      setState({ status: "error" });
    }
  }, [address]);

  useEffect(() => {
    if (address && !wrongNetwork && CONTRACT_ADDRESS) load();
  }, [address, wrongNetwork, load]);

  async function run(fn) {
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e?.code === 4001 ? "Request cancelled." : "Couldn't connect. Try again.");
    }
  }

  const shown = useMemo(() => {
    if (state.status !== "ok") return [];
    const days = RANGES.find((r) => r[0] === range)[2];
    const cutoff = days ? Date.now() / 1000 - days * 86400 : 0;
    return state.studies.filter((s) => s.at >= cutoff);
  }, [state, range]);
  const avg = shown.length ? Math.round((shown.reduce((n, s) => n + s.score / s.total, 0) / shown.length) * 100) : 0;

  let body;
  if (hasWallet === false) {
    body = (
      <div className="ap-empty">
        <p className="ap-hand">records need a wallet</p>
        <p>Your stamped studies are tied to your wallet address.</p>
        <a className="ap-btn is-primary" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install MetaMask</a>
      </div>
    );
  } else if (!address) {
    body = (
      <div className="ap-empty">
        <p className="ap-hand">connect to see your records</p>
        <p>We read your stamped studies straight from the contract.</p>
        <button className="ap-btn is-primary" onClick={() => run(connect)} disabled={hasWallet === null}>Connect wallet</button>
        {err && <p className="ap-fine" role="alert">{err}</p>}
      </div>
    );
  } else if (wrongNetwork) {
    body = (
      <div className="ap-empty">
        <p className="ap-hand">wrong network</p>
        <button className="ap-btn is-primary" onClick={() => run(switchNetwork)}>Switch to {NETWORK.chainName}</button>
        {err && <p className="ap-fine" role="alert">{err}</p>}
      </div>
    );
  } else if (state.status === "idle" || state.status === "loading") {
    body = <div className="ap-table-skel" role="status" aria-label="Loading your records">{[0, 1, 2, 3].map((i) => <div key={i} className="ap-skel" />)}</div>;
  } else if (state.status === "error") {
    body = (
      <div className="ap-alert is-err" role="alert">
        <span>We couldn't read the chain right now.</span>
        <button className="ap-btn is-small" onClick={load}>Try again</button>
      </div>
    );
  } else if (state.studies.length === 0) {
    body = (
      <div className="ap-empty">
        <p className="ap-hand">nothing stamped yet</p>
        <p>Finish a quiz and stamp it. It will show up here.</p>
        <Link className="ap-btn is-primary" href="/app/new">Make a notebook</Link>
      </div>
    );
  } else {
    body = (
      <>
        <div className="ap-stats">
          <div><b>{shown.length}</b><span>stamped</span></div>
          <div><b>{avg}%</b><span>average score</span></div>
          <div><b>{shown.filter((s) => s.score === s.total).length}</b><span>perfect</span></div>
        </div>
        {shown.length === 0 ? (
          <div className="ap-empty"><p>Nothing stamped in this time range.</p></div>
        ) : (
          <div className="ap-table" role="table" aria-label="Study records">
            <div className="ap-tr is-head" role="row">
              <span role="columnheader">Title</span><span role="columnheader">Score</span><span role="columnheader">Date</span><span role="columnheader">Proof</span>
            </div>
            {shown.map((s) => (
              <div className="ap-tr" role="row" key={s.id}>
                <span role="cell" className="ap-t"><b>{s.title}</b><small>Study #{s.id}</small></span>
                <span role="cell"><em className={`ap-score-pill${s.score === s.total ? " is-top" : ""}`}>{s.score}/{s.total}</em></span>
                <span role="cell" className="ap-d">{formatDate(s.at)}</span>
                <span role="cell"><Link href={`/app?study=${s.id}`} aria-label={`Open proof of ${s.title}`}>Open ↗</Link></span>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="ap-page">
      <div className="ap-sec-head is-page">
        <div>
          <h1 className="ap-h2">Study records</h1>
          <p className="ap-lede">Your verified learning history on {NETWORK.chainName}.</p>
        </div>
        {state.status === "ok" && state.studies.length > 0 && (
          <label className="ap-select">
            <span className="sr">Time range</span>
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        )}
      </div>
      {body}
      {address && <p className="ap-fine">Wallet: <a href={explorerAddress(address)} target="_blank" rel="noopener noreferrer">{address}</a></p>}
    </div>
  );
}
