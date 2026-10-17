"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchStudiesOf } from "@/lib/chain";
import { useWallet } from "@/lib/wallet";
import { CONTRACT_ADDRESS } from "@/lib/config";
import { formatDate } from "@/components/Proof";

export default function Shelf() {
  const { hasWallet, address, wrongNetwork, connect, switchNetwork } = useWallet();
  const [state, setState] = useState({ status: "idle" });
  const [err, setErr] = useState("");

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

  let body;
  if (hasWallet === false) {
    body = (
      <div className="empty">
        <p className="note">your shelf needs a wallet</p>
        <p className="muted" style={{ margin: "8px 0 18px" }}>Your stamped studies are tied to your wallet address.</p>
        <a className="btn btn-primary" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Install MetaMask</a>
      </div>
    );
  } else if (!address) {
    body = (
      <div className="empty">
        <p className="note">connect to see your shelf</p>
        <p className="muted" style={{ margin: "8px 0 18px" }}>We read your stamped studies straight from the contract.</p>
        <button className="btn btn-primary" onClick={() => run(connect)} disabled={hasWallet === null}>Connect wallet</button>
        {err && <p className="note-sm" role="alert" style={{ marginTop: 10 }}>{err}</p>}
      </div>
    );
  } else if (wrongNetwork) {
    body = (
      <div className="empty">
        <p className="note">wrong network</p>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => run(switchNetwork)}>Switch to BOT Chain</button>
        {err && <p className="note-sm" role="alert" style={{ marginTop: 10 }}>{err}</p>}
      </div>
    );
  } else if (state.status === "loading" || state.status === "idle") {
    body = <p className="note" role="status">fetching your shelf…</p>;
  } else if (state.status === "error") {
    body = (
      <div className="banner err" role="alert">
        <span>We couldn’t read the chain right now.</span>
        <button className="btn btn-sm" onClick={load}>Try again</button>
      </div>
    );
  } else if (state.studies.length === 0) {
    body = (
      <div className="empty">
        <p className="note">nothing stamped yet</p>
        <p className="muted" style={{ margin: "8px 0 18px" }}>Finish a quiz and stamp it — it will show up here.</p>
        <Link className="btn btn-primary" href="/app">Open my notebook</Link>
      </div>
    );
  } else {
    body = (
      <ul className="shelf">
        {state.studies.map((s) => (
          <li key={s.id}>
            <Link href={`/app?study=${s.id}`}>
              <span className="t">{s.title}</span>
              <span className="s">{s.score}/{s.total}</span>
              <span className="d">Study #{s.id} · {formatDate(s.at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="nb">
      <div className="nb-label">
        <small>Name:</small>
        <b>my shelf</b>
      </div>
      <div className="nb-page">
        <h2 className="h-sec">Stamped studies</h2>
        {body}
      </div>
    </div>
  );
}
